/**
 * Transactional email via Resend's REST API (plain fetch: works on Workers,
 * zero extra deps). Free tier: 3,000/month, 100/day. If RESEND_API_KEY is
 * unset, we log and continue: forms must never fail because email is down.
 */
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Karma Design Studio <onboarding@resend.dev>";
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set; skipping:", opts.subject);
    return { skipped: true as const };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html })
    });
    if (!res.ok) console.error("[email] Resend error", res.status, await res.text());
    return { skipped: false as const, ok: res.ok };
  } catch (e) {
    console.error("[email] send failed", e);
    return { skipped: false as const, ok: false };
  }
}
