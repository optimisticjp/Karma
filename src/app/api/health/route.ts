import { NextResponse } from "next/server";
import { isProduction, prodReadiness } from "@/lib/env";

/**
 * Health must not report ok when a dependency required for safe form handling
 * is missing. Booleans only: no host, no user, no key, no Hyperdrive id, no
 * internal error text.
 *
 * `dbViaHyperdrive` is reported truthfully but does NOT gate `ok`: a deploy
 * still serving through a direct DATABASE_URL during the Supabase migration
 * window is degraded-but-working.
 *
 * Resend is intentionally deferred until the custom domain is connected.
 * Public submissions are stored even when notification email is unavailable,
 * so `checks.email` remains visible for operations but does not gate site
 * health during this testing phase.
 */
export async function GET() {
  const checks = prodReadiness();
  const ok =
    !isProduction ||
    (checks.db && checks.supabaseAuth && checks.turnstile);
  return NextResponse.json(
    { ok, production: isProduction, checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
