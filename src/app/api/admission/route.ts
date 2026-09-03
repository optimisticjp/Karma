import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { admissionSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { site, waLink } from "@/lib/site";
import { pad } from "@/lib/utils";
import { apiError, escapeHtml, getIp, newRequestId, rateLimit } from "@/lib/api";
import { demoModeAllowed, isProduction } from "@/lib/env";
import { demoSlotFor, getCourseConfig, scheduleOptionFor } from "@/lib/course/config";
import { isKnownTermsVersion } from "@/content/admission-terms";

const waMsg = (ref: string) =>
  `Hi! My admission reference is ${ref}. Please confirm my seat. / મારો એડમિશન રેફરન્સ ${ref} છે, સીટ કન્ફર્મ કરશો.`;

/**
 * Admission endpoint, production-hardened per audit:
 * fail-closed on missing deps, per-phone DB throttle, idempotency,
 * escaped notification HTML, applicant confirmation email.
 * The node-postgres driver supports transactions, so the placeholder→reference
 * rewrite is atomic: a row can never be left holding a placeholder reference.
 */
export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const ip = getIp(req);
  if (ip && !rateLimit(`adm:${ip}`, 6, 60_000)) return apiError("rate_limited", 429, requestId);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("bad_json", 400, requestId);
  }


  const parsed = admissionSchema.safeParse(body);
  if (!parsed.success) return apiError("validation", 400, requestId);
  const d = parsed.data;


  // Fail closed (audit): in production, missing Turnstile blocks submissions.
  // demoModeAllowed covers staging (ALLOW_DEMO_MODE=true); never skip in clean production.
  if (isProduction && !demoModeAllowed && !process.env.TURNSTILE_SECRET_KEY) {
    console.error(`[admission:${requestId}] TURNSTILE_SECRET_KEY missing in production`);
    return apiError("turnstile_unavailable", 503, requestId);
  }
  const ts = await verifyTurnstile(d.turnstileToken, ip);
  if (!ts.ok) return apiError("turnstile", 403, requestId);

  /**
   * The admission norms the applicant accepted must be a version this build
   * knows about. A submission quoting an unknown version would record consent
   * to text nobody can produce afterwards, which is worse than no consent.
   */
  if (!isKnownTermsVersion(d.termsVersion)) return apiError("validation", 400, requestId);

  /**
   * Slot keys are validated against THIS COURSE'S OWN options, resolved through
   * the same function the admission page used to render them. Accepting an
   * arbitrary key would have the studio receive a request for a batch time it
   * does not run.
   */
  const config = await getCourseConfig(d.courseSlug);
  if (!config) return apiError("validation", 400, requestId);
  if (config.termsVersion !== d.termsVersion) return apiError("validation", 400, requestId);

  const schedule = scheduleOptionFor(config, d.preferredSchedule);
  if (d.preferredSchedule && !schedule) return apiError("validation", 400, requestId);
  const demo = demoSlotFor(config, d.demoSlot);
  if (d.demoSlot && !demo) return apiError("validation", 400, requestId);

  const db = getDb();
  if (!db) {
    if (!demoModeAllowed) {
      console.error(`[admission:${requestId}] DATABASE_URL missing in production`);
      return apiError("service_unavailable", 503, requestId);
    }
    const reference = `KDS-DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    console.warn(`[admission:${requestId}] demo mode: application NOT stored`);
    return NextResponse.json({ ok: true, reference, waUrl: waLink(waMsg(reference)), demo: true });
  }

  try {
    // Idempotent retries: same key returns the already-created reference.
    if (d.idempotencyKey) {
      const existing = await db
        .select({ reference: schema.applications.reference })
        .from(schema.applications)
        .where(eq(schema.applications.idempotencyKey, d.idempotencyKey))
        .limit(1);
      if (existing[0]) {
        return NextResponse.json({
          ok: true,
          reference: existing[0].reference,
          waUrl: waLink(waMsg(existing[0].reference))
        });
      }
    }

    // Stateful throttle: max 3 applications per phone per 10 minutes.
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await db
      .select({ id: schema.applications.id })
      .from(schema.applications)
      .where(
        and(
          eq(schema.applications.whatsapp, d.whatsapp),
          gte(schema.applications.createdAt, tenMinAgo)
        )
      );
    if (recent.length >= 3) return apiError("rate_limited", 429, requestId);

    const dup = await db
      .select({ id: schema.applications.id })
      .from(schema.applications)
      .where(eq(schema.applications.whatsapp, d.whatsapp))
      .limit(1);

    const now = new Date();
    const placeholder = `KDS-P-${crypto.randomUUID().slice(0, 12)}`;
    const { reference } = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.applications)
        .values({
          reference: placeholder,
          idempotencyKey: d.idempotencyKey ?? null,
          fullName: d.fullName,
          whatsapp: d.whatsapp,
          email: d.email || null,
          locale: d.locale,
          courseSlug: d.courseSlug,
          preferredTiming: d.preferredTiming,
          preferredSchedule: schedule?.key ?? null,
          demoSlot: demo?.key ?? null,
          experience: d.experience,
          occupation: d.occupation,
          area: d.area,
          goal: d.goal || null,
          heardFrom: d.heardFrom || null,
          ageBand: d.ageBand,
          fatherName: d.fatherName || null,
          /* Guardian NAME is still only asked of under-18 applicants; the
             guardian PHONE is required of everyone (owner decision). */
          guardianName: d.ageBand === "under18" ? d.guardianName || null : null,
          guardianPhone: d.guardianPhone,
          referenceName: d.referenceName || null,
          referencePhone: d.referencePhone ? d.referencePhone.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, "") : null,
          termsVersion: d.termsVersion,
          termsAcceptedAt: now,
          privacyConsentAt: now,
          commsConsentAt: now,
          utmSource: d.utmSource || null,
          utmCampaign: d.utmCampaign || null,
          duplicateOfPhone: dup.length > 0
        })
        .returning({ id: schema.applications.id });

      const id = inserted[0].id;
      const ref = `KDS-${now.getFullYear()}-${pad(id)}`;
      await tx
        .update(schema.applications)
        .set({ reference: ref })
        .where(eq(schema.applications.id, id));
      return { reference: ref };
    });

    const row = (label: string, value: string) =>
      `<tr><td><b>${label}</b></td><td>${escapeHtml(value)}</td></tr>`;

    await sendEmail({
      to: site.email,
      subject: `New admission application ${reference}${dup.length > 0 ? " (repeat phone)" : ""}`,
      html: `
        <h2>New application: ${reference}</h2>
        <table cellpadding="4">
          ${row("Name", d.fullName)}
          <tr><td><b>WhatsApp</b></td><td><a href="https://wa.me/91${escapeHtml(d.whatsapp)}">${escapeHtml(d.whatsapp)}</a></td></tr>
          ${row("Course", d.courseSlug)}
          ${row("Timing", schedule ? `${schedule.startTime}-${schedule.endTime}` : d.preferredTiming)}
          ${demo ? row("Demo preferred", `${demo.startTime}-${demo.endTime}`) : ""}
          ${row("Age band", d.ageBand)}
          <tr><td><b>Parent / guardian</b></td><td><a href="https://wa.me/91${escapeHtml(d.guardianPhone)}">${escapeHtml(d.guardianPhone)}</a>${d.guardianName ? ` — ${escapeHtml(d.guardianName)}` : ""}</td></tr>
          ${d.fatherName ? row("Father", d.fatherName) : ""}
          ${d.referenceName || d.referencePhone ? row("Reference", `${d.referenceName ?? ""} ${d.referencePhone ?? ""}`.trim()) : ""}
          ${row("Admission norms", `accepted, version ${d.termsVersion}`)}
          ${row("Occupation", d.occupation)}
          ${row("Experience", d.experience)}
          ${row("Area", d.area)}
          ${d.heardFrom ? row("Heard from", d.heardFrom) : ""}
          ${row("Language", d.locale)}
          ${d.goal ? row("Note", d.goal) : ""}
          ${dup.length > 0 ? "<tr><td><b>⚠ Repeat</b></td><td>This phone applied before</td></tr>" : ""}
        </table>
        <p>Request ${requestId}</p>`
    });

    // Applicant confirmation (audit: durable confirmation beyond WhatsApp).
    if (d.email) {
      const gu = d.locale === "gu";
      await sendEmail({
        to: d.email,
        subject: gu
          ? `તમારી અરજી મળી ગઈ: ${reference} | Karma Design Studio`
          : `We received your application: ${reference} | Karma Design Studio`,
        html: gu
          ? `<p>નમસ્તે ${escapeHtml(d.fullName)},</p><p>તમારી એડમિશન અરજી મળી ગઈ છે. તમારો રેફરન્સ: <b>${reference}</b>.</p><p>અમે સ્ટુડિયોના સમય દરમિયાન, સામાન્ય રીતે એ જ દિવસે, WhatsApp પર જવાબ આપીશું. ઉતાવળ હોય તો: <a href="${waLink(waMsg(reference))}">WhatsApp કરો</a>.</p><p>Karma Design Studio, ${escapeHtml(site.addressGu)}</p>`
          : `<p>Hi ${escapeHtml(d.fullName)},</p><p>Your admission application has been received. Your reference: <b>${reference}</b>.</p><p>We reply on WhatsApp during studio hours, usually the same day. In a hurry? <a href="${waLink(waMsg(reference))}">Message us</a>.</p><p>Karma Design Studio, ${escapeHtml(site.addressEn)}</p>`
      });
    }

    return NextResponse.json({ ok: true, reference, waUrl: waLink(waMsg(reference)) });
  } catch (e) {
    console.error(`[admission:${requestId}] failed`, e);
    return apiError("server", 500, requestId);
  }
}
