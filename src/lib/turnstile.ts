/**
 * Cloudflare Turnstile server-side verification (mandatory per CLAUDE.md).
 * When no secret is configured (local dev before setup), verification is
 * skipped with a loud warning so the form still works.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set; skipping verification (dev only)");
    return { ok: true, skipped: true };
  }
  if (!token) return { ok: false, skipped: false };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body
    });
    const data = (await res.json()) as { success: boolean };
    return { ok: !!data.success, skipped: false };
  } catch (e) {
    console.error("[turnstile] verify failed", e);
    return { ok: false, skipped: false };
  }
}
