import { NextResponse } from "next/server";
import { isProduction, prodReadiness } from "@/lib/env";

/**
 * Audit fix: health must not report ok when production dependencies are
 * missing (a monitor must catch lead-losing misconfiguration). Booleans
 * only: no sensitive detail.
 */
export async function GET() {
  const checks = prodReadiness();
  const ok = !isProduction || (checks.db && checks.turnstile && checks.email);
  return NextResponse.json(
    { ok, production: isProduction, checks, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
