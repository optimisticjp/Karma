import { NextRequest, NextResponse } from "next/server";
import { eq, gte } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";
import { apiError, escapeHtml } from "@/lib/api";

/**
 * Daily 21:00 IST digest, triggered by GitHub Actions. POST because it has
 * side effects (audit). Reports the last 24h AND anything still sitting in
 * "new", so nothing ages silently.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return apiError("not_configured", 503);
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return apiError("unauthorized", 401);
  }

  const db = getDb();
  if (!db) return apiError("service_unavailable", 503);

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const apps = await db
      .select({ ref: schema.applications.reference, name: schema.applications.fullName })
      .from(schema.applications)
      .where(gte(schema.applications.createdAt, since));
    const briefs = await db
      .select({ ref: schema.serviceEnquiries.reference, name: schema.serviceEnquiries.name })
      .from(schema.serviceEnquiries)
      .where(gte(schema.serviceEnquiries.createdAt, since));
    const stillNew = await db
      .select({ ref: schema.applications.reference })
      .from(schema.applications)
      .where(eq(schema.applications.status, "new"));

    if (apps.length + briefs.length + stillNew.length > 0) {
      const li = (r: { ref: string; name?: string }) =>
        `<li>${escapeHtml(r.ref)}${"name" in r && r.name ? `: ${escapeHtml(r.name)}` : ""}</li>`;
      await sendEmail({
        to: site.email,
        subject: `Daily digest: ${apps.length} application(s), ${briefs.length} brief(s), ${stillNew.length} awaiting first contact`,
        html: `
          <h3>Last 24 hours</h3>
          <p><b>Applications (${apps.length})</b></p>
          <ul>${apps.map(li).join("") || "<li>None</li>"}</ul>
          <p><b>Design briefs (${briefs.length})</b></p>
          <ul>${briefs.map(li).join("") || "<li>None</li>"}</ul>
          <p><b>Still marked "new" (${stillNew.length})</b>: these need first contact.</p>`
      });
    }
    return NextResponse.json({
      ok: true,
      applications: apps.length,
      briefs: briefs.length,
      awaitingContact: stillNew.length
    });
  } catch (e) {
    console.error("[digest] failed", e);
    return apiError("server", 500);
  }
}
