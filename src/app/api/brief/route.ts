import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { briefSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db";
import { getBriefBucket } from "@/lib/r2";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { site, waLink } from "@/lib/site";
import { pad } from "@/lib/utils";
import { apiError, escapeHtml, getIp, newRequestId, rateLimit } from "@/lib/api";
import { demoModeAllowed, isProduction } from "@/lib/env";
import {
  ALLOWED_EXT,
  hasValidSignature,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES
} from "@/lib/files";

/**
 * B2B brief endpoint, production-hardened per audit: excess files are
 * rejected (not silently sliced), signatures are verified, totals capped,
 * missing R2 blocks file submissions instead of losing them, and all email
 * HTML is escaped. Confidential files go only to the private bucket.
 */
export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const ip = getIp(req);
  if (ip && !rateLimit(`brief:${ip}`, 4, 60_000)) return apiError("rate_limited", 429, requestId);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return apiError("bad_form", 400, requestId);
  }

  const fields: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") fields[k] = v;
  }

  // Honeypot first (quiet fake success for bots).
  if (typeof fields.website === "string" && fields.website.length > 0) {
    return NextResponse.json({ ok: true, reference: "KDS-B-RECEIVED" });
  }

  const parsed = briefSchema.safeParse(fields);
  if (!parsed.success) return apiError("validation", 400, requestId);
  const d = parsed.data;

  if (Date.now() - d.startedAt < 4000) {
    return NextResponse.json({ ok: true, reference: "KDS-B-RECEIVED" });
  }

  // demoModeAllowed covers staging (ALLOW_DEMO_MODE=true); never skip in clean production.
  if (isProduction && !demoModeAllowed && !process.env.TURNSTILE_SECRET_KEY) {
    console.error(`[brief:${requestId}] TURNSTILE_SECRET_KEY missing in production`);
    return apiError("turnstile_unavailable", 503, requestId);
  }
  const ts = await verifyTurnstile(d.turnstileToken, ip);
  if (!ts.ok) return apiError("turnstile", 403, requestId);

  // File constraints: reject, never silently trim (audit).
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return apiError("too_many_files", 400, requestId);
  if (files.some((f) => f.size > MAX_FILE_BYTES)) return apiError("file_size", 400, requestId);
  if (files.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_BYTES)
    return apiError("file_size", 400, requestId);
  if (files.some((f) => !ALLOWED_EXT.test(f.name))) return apiError("file_type", 400, requestId);
  for (const f of files) {
    if (!(await hasValidSignature(f))) return apiError("file_type", 400, requestId);
  }

  // Fail closed: files can only be accepted when the private bucket exists.
  const bucket = files.length > 0 ? await getBriefBucket() : null;
  if (files.length > 0 && !bucket) {
    if (!demoModeAllowed) {
      console.error(`[brief:${requestId}] BRIEF_FILES R2 binding missing in production`);
      return apiError("files_unavailable", 503, requestId);
    }
    console.warn(`[brief:${requestId}] demo mode: R2 missing, files will be skipped`);
  }

  const db = getDb();
  if (!db) {
    if (!demoModeAllowed) {
      console.error(`[brief:${requestId}] DATABASE_URL missing in production`);
      return apiError("service_unavailable", 503, requestId);
    }
    const reference = `KDS-B-DEMO-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    console.warn(`[brief:${requestId}] demo mode: brief NOT stored`);
    return NextResponse.json({ ok: true, reference, filesStored: 0, demo: true });
  }

  try {
    const placeholder = `KDS-BP-${crypto.randomUUID().slice(0, 10)}`;
    // node-postgres gives us transactions: the placeholder reference is
    // rewritten atomically, so a brief can never keep a placeholder ref.
    const { id, reference } = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.serviceEnquiries)
        .values({
          reference: placeholder,
          name: d.name,
          company: d.company || null,
          phone: d.phone,
          email: d.email || null,
          productType: d.productType || null,
          technique: d.technique || null,
          dimensions: d.dimensions || null,
          quantity: d.quantity || null,
          colourCount: d.colourCount || null,
          fileFormat: d.fileFormat || null,
          deadline: d.deadline || null,
          details: d.details || null,
          locale: d.locale
        })
        .returning({ id: schema.serviceEnquiries.id });

      const newId = inserted[0].id;
      const ref = `KDS-B-${pad(newId)}`;
      await tx
        .update(schema.serviceEnquiries)
        .set({ reference: ref })
        .where(eq(schema.serviceEnquiries.id, newId));
      return { id: newId, reference: ref };
    });

    let filesStored = 0;
    if (files.length > 0 && bucket) {
      for (const f of files) {
        const safe = f.name.replace(/[^\w.\-]+/g, "_").slice(-80);
        const key = `briefs/${reference}/${Date.now()}-${safe}`;
        await bucket.put(key, await f.arrayBuffer(), {
          httpMetadata: { contentType: f.type || "application/octet-stream" }
        });
        await db.insert(schema.serviceFiles).values({
          enquiryId: id,
          fileName: f.name.slice(-240),
          r2Key: key,
          sizeBytes: f.size,
          contentType: f.type || null
        });
        filesStored++;
      }
    }

    const row = (label: string, value: string) =>
      `<tr><td><b>${label}</b></td><td>${escapeHtml(value)}</td></tr>`;

    await sendEmail({
      to: site.email,
      subject: `New design brief ${reference}`,
      html: `
        <h2>New brief: ${reference}</h2>
        <table cellpadding="4">
          ${row("Name", d.company ? `${d.name} (${d.company})` : d.name)}
          <tr><td><b>Phone</b></td><td><a href="https://wa.me/91${escapeHtml(d.phone)}">${escapeHtml(d.phone)}</a></td></tr>
          ${row("Product", d.productType || "-")}
          ${row("Technique", d.technique || "-")}
          ${row("Dimensions", d.dimensions || "-")}
          ${row("Quantity", d.quantity || "-")}
          ${row("Deadline", d.deadline || "-")}
          ${row("Files stored", String(filesStored))}
          ${d.details ? row("Details", d.details) : ""}
        </table>
        <p>Request ${requestId}</p>`
    });

    if (d.email) {
      const gu = d.locale === "gu";
      const wa = waLink(
        gu
          ? `Hi! મેં ડિઝાઇન બ્રીફ મોકલ્યો છે, રેફરન્સ ${reference}.`
          : `Hi! I sent a design brief, reference ${reference}.`
      );
      await sendEmail({
        to: d.email,
        subject: gu
          ? `તમારો બ્રીફ મળી ગયો: ${reference} | Karma Design Studio`
          : `Brief received: ${reference} | Karma Design Studio`,
        html: gu
          ? `<p>નમસ્તે ${escapeHtml(d.name)},</p><p>તમારો ડિઝાઇન બ્રીફ મળી ગયો છે (ફાઇલ: ${filesStored}). રેફરન્સ: <b>${reference}</b>. અમે રિવ્યૂ કરીને પ્રશ્નો કે ક્વોટ સાથે જવાબ આપીશું.</p><p><a href="${wa}">WhatsApp પર વાત કરો</a></p>`
          : `<p>Hi ${escapeHtml(d.name)},</p><p>Your design brief has been received (${filesStored} file(s) stored). Reference: <b>${reference}</b>. We'll review and reply with questions or a quote.</p><p><a href="${wa}">Continue on WhatsApp</a></p>`
      });
    }

    return NextResponse.json({ ok: true, reference, filesStored });
  } catch (e) {
    console.error(`[brief:${requestId}] failed`, e);
    return apiError("server", 500, requestId);
  }
}
