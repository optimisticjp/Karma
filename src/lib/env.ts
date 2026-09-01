/**
 * Environment awareness (audit fix: no silent demo behavior in production).
 * Demo/sample behavior is allowed only outside production, or when a
 * deployment explicitly opts in with ALLOW_DEMO_MODE=true (staging).
 */
import { dbConfigured, dbViaHyperdrive } from "@/lib/db";

export const isProduction = process.env.NODE_ENV === "production";

export const demoModeAllowed =
  !isProduction || process.env.ALLOW_DEMO_MODE === "true";

/**
 * Supabase Auth is configured when the browser/SSR pair is present. The
 * privileged secret key is reported separately: it is only needed for the
 * admin invitation path, and its VALUE is never read here or exposed.
 */
export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function supabaseAdminConfigured() {
  return Boolean(process.env.SUPABASE_SECRET_KEY);
}

function turnstileConfigured() {
  const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return Boolean(siteKey && process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Readiness booleans only — never a host, user, key or binding id.
 * `db` is true when the request can reach Postgres at all: through the
 * Hyperdrive binding in the deployed Worker, or through a direct
 * DATABASE_URL during migration/development.
 */
export function prodReadiness() {
  return {
    db: dbConfigured(),
    dbViaHyperdrive: dbViaHyperdrive(),
    supabaseAuth: supabaseConfigured(),
    turnstile: turnstileConfigured(),
    email: Boolean(process.env.RESEND_API_KEY)
  };
}
