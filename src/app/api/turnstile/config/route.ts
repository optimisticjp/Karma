import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public runtime configuration for the browser widget.
 *
 * A Turnstile site key is not a credential. Serving it here lets Cloudflare
 * Worker configuration remain the source of truth and avoids baking the key
 * into the client bundle at build time. The secret is never returned.
 */
export async function GET() {
  const siteKey =
    process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  return NextResponse.json(
    { siteKey },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0"
      }
    }
  );
}
