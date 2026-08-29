/**
 * Open-redirect defence for `?next=` carried through sign-in/onboarding.
 * Only internal Karma Console paths are accepted; auth/onboarding paths never
 * become return targets because that would create loops.
 */

import type { AccessDecision } from "./access";

export const ADMIN_HOME = "/admin";

export function safeNextPath(value: unknown, fallback: string = ADMIN_HOME): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  if (value.includes("@")) return fallback;
  if (/%2f/i.test(value) || /%5c/i.test(value)) return fallback;

  const path = value.split("?")[0].split("#")[0];
  if (path !== ADMIN_HOME && !path.startsWith(`${ADMIN_HOME}/`)) return fallback;

  if (
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/mfa") ||
    path.startsWith("/admin/auth") ||
    path.startsWith("/admin/welcome")
  ) return fallback;

  return value;
}

/** Pure browser redirect mapping for authorization failures. */
export function redirectTargetFor(decision: AccessDecision, from?: string): string {
  if (decision.ok) return ADMIN_HOME;
  const next = from ? `?next=${encodeURIComponent(from)}` : "";
  switch (decision.reason) {
    case "signin":
      return `/admin/login${next}`;
    case "invited":
      return "/admin/welcome";
    // Compatibility-only reasons remain in the AccessDecision union for old
    // callers/tests, but password-only Karma never emits them and has no MFA
    // routes. If one somehow arrives, fail to the ordinary console home.
    case "mfa-setup":
    case "mfa-challenge":
      return ADMIN_HOME;
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
