/**
 * Cloudflare Turnstile server-side verification.
 *
 * Production validates more than the `success` bit: the token must be for the
 * expected form action and for one of this deployment's own hostnames. Tokens
 * are single-use and expire after five minutes, so every submission is checked
 * with Siteverify before any application/brief data is processed.
 */
export type TurnstileAction = "admission" | "brief";

type SiteverifyResult = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

function expectedHostnames() {
  const explicit = (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (explicit.length > 0) return new Set(explicit);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return new Set<string>();
  try {
    return new Set([new URL(siteUrl).hostname.toLowerCase()]);
  } catch {
    return new Set<string>();
  }
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | null | undefined,
  expectedAction: TurnstileAction
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set; skipping verification (dev only)");
    return { ok: true, skipped: true };
  }

  // Cloudflare tokens are at most 2,048 characters. Reject obviously invalid
  // input before spending a network request.
  if (!token || token.length > 2_048) return { ok: false, skipped: false };

  const hostnames = expectedHostnames();
  if (process.env.NODE_ENV === "production" && hostnames.size === 0) {
    console.error("[turnstile] no production hostname configured");
    return { ok: false, skipped: false };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body
    });
    if (!res.ok) return { ok: false, skipped: false };

    const data = (await res.json()) as SiteverifyResult;
    const hostname = data.hostname?.toLowerCase();
    const hostnameOk = hostnames.size === 0 || (!!hostname && hostnames.has(hostname));
    const actionOk = data.action === expectedAction;

    if (!data.success || !hostnameOk || !actionOk) {
      console.warn("[turnstile] token rejected", {
        success: !!data.success,
        hostnameOk,
        actionOk,
        errors: data["error-codes"]?.slice(0, 4) ?? []
      });
      return { ok: false, skipped: false };
    }

    return { ok: true, skipped: false };
  } catch (error) {
    console.error(
      "[turnstile] verification request failed",
      error instanceof Error ? error.name : "unknown"
    );
    return { ok: false, skipped: false };
  }
}
