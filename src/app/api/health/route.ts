import { NextResponse } from "next/server";
import { isProduction, prodReadiness } from "@/lib/env";

/**
 * Health must not report ok when production dependencies are missing (a
 * monitor has to catch lead-losing misconfiguration). Booleans only: no host,
 * no user, no key, no Hyperdrive id, no internal error text.
 *
 * `dbViaHyperdrive` is reported truthfully but does NOT gate `ok`: a deploy
 * still serving through a direct DATABASE_URL during the Supabase migration
 * window is degraded-but-working, and the owner should be able to see that
 * without the monitor screaming.
 */
export async function GET() {
  const checks = prodReadiness();
  const ok =
    !isProduction ||
    (checks.db && checks.supabaseAuth && checks.turnstile && checks.email);
  return NextResponse.json(
    { ok, production: isProduction, checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
