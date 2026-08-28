/**
 * Open-redirect defence for the `?next=` parameter carried through login and
 * the MFA screens.
 *
 * A redirect target is accepted only if it is an internal Karma Console path.
 * Everything else — absolute URLs, protocol-relative `//evil.example`,
 * backslash tricks, control characters, anything outside /admin — falls back
 * to the console home rather than being "cleaned up".
 */

import type { AccessDecision } from "./access";

export const ADMIN_HOME = "/admin";

export function safeNextPath(value: unknown, fallback: string = ADMIN_HOME): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) {
    return fallback;
  }
  // Reject anything that is not a plain, single-slash-rooted path.
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;
  // Control characters, including the CR/LF that split a Location header.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  // No scheme smuggling ("/%2f", "/javascript:...") and no credentials.
  if (value.includes("@")) return fallback;
  if (/%2f/i.test(value) || /%5c/i.test(value)) return fallback;

  const path = value.split("?")[0].split("#")[0];
  if (path !== ADMIN_HOME && !path.startsWith(`${ADMIN_HOME}/`)) return fallback;

  // Never bounce back into an auth screen: that loops.
  if (
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/mfa") ||
    path.startsWith("/admin/auth")
  ) {
    return fallback;
  }
  return value;
}

/**
 * Where an unmet requirement should send a browser. Pure, so the mapping is
 * testable without a Supabase session or a React request context.
 *
 * `from` is echoed back as `?next=` so the person lands where they were going;
 * it is re-validated by `safeNextPath` on the way out, never trusted here.
 */
export function redirectTargetFor(decision: AccessDecision, from?: string): string {
  if (decision.ok) return ADMIN_HOME;
  const next = from ? `?next=${encodeURIComponent(from)}` : "";
  switch (decision.reason) {
    case "signin":
      return `/admin/login${next}`;
    case "mfa-setup":
      return `/admin/mfa/setup${next}`;
    case "mfa-challenge":
      return `/admin/mfa/challenge${next}`;
    case "no-staff":
      return "/admin/no-access?reason=no-staff";
    case "inactive":
      return "/admin/no-access?reason=inactive";
    case "role":
      return "/admin/no-access?reason=role";
    case "permission":
      return "/admin/no-access?reason=permission";
  }
}
