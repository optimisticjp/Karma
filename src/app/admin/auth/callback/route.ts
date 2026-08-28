import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * Supabase Auth callback — the landing point for an admin invitation link.
 *
 * Supabase's current invite flow sends the person here with either a PKCE
 * `code` or a `token_hash` + `type` pair, depending on how the project is
 * configured. Both are handled, because getting this wrong is the difference
 * between an invitation that works and one that dead-ends.
 *
 * Nothing from the URL is logged, echoed into the response, or used as a
 * redirect target without `safeNextPath` validating it first.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"), "/admin/welcome");

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/login", url.origin));
  }

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as "invite" | "recovery" | "email" | "magiclink" | "signup",
        token_hash: tokenHash
      });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    }
  } catch {
    // fall through to the expired-link screen
  }

  // Expired, already used, or malformed: say so plainly and let the owner
  // re-send. Never explain WHICH of those it was.
  return NextResponse.redirect(new URL("/admin/welcome?state=expired", url.origin));
}
