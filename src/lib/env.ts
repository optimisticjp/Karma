/**
 * Environment awareness (audit fix: no silent demo behavior in production).
 * Demo/sample behavior is allowed only outside production, or when a
 * deployment explicitly opts in with ALLOW_DEMO_MODE=true (staging).
 */
export const isProduction = process.env.NODE_ENV === "production";

export const demoModeAllowed =
  !isProduction || process.env.ALLOW_DEMO_MODE === "true";

export function prodReadiness() {
  const url = process.env.DATABASE_URL ?? "";
  return {
    db: url.length > 0 && !url.includes("placeholder"),
    turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY),
    email: Boolean(process.env.RESEND_API_KEY)
  };
}
