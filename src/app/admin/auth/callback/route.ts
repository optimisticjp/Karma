import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { parseInviteCallback } from "@/lib/auth/invite-callback";

/**
 * Supabase Auth callback for the ADMIN INVITATION flow, and only that flow.
 *
 * `inviteUserByEmail()` does not support PKCE — the installed @supabase/auth-js
 * says so itself, because the browser that sends an invite is usually not the
 * browser that accepts it. So there is no `code` to exchange here and no
 * `exchangeCodeForSession` call: this is the server-side token-hash flow, where
 * the hosted **Invite user** email template sends `token_hash` and
 * `type=invite`, and we verify them with `verifyOtp`.
 *
 * The exact template the owner must paste into the Supabase dashboard is in
 * docs/admin-architecture.md § "Invite user email template". Without it the
 * default template sends a `{{ .ConfirmationURL }}` link that resolves through
 * Supabase's own verify endpoint instead of reaching this route with the
 * parameters it needs.
 *
 * `type` arrives from the URL and is therefore attacker controlled: it is
 * compared for equality with "invite", never cast into `EmailOtpType`. A
 * `type=recovery` or `type=signup` link cannot enter admin onboarding here.
 *
 * Nothing from the URL is logged, echoed into the response, or used as a
 * redirect target without `safeNextPath` validating it first.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get("next"), "/admin/welcome");

  const expired = NextResponse.redirect(
    new URL("/admin/welcome?state=expired", url.origin)
  );

  const parsed = parseInviteCallback(url.searchParams);
  if (!parsed.ok) return expired;

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/admin/login", url.origin));

  try {
    const { error } = await supabase.auth.verifyOtp({
      type: parsed.params.type,
      token_hash: parsed.params.tokenHash
    });
    if (error) return expired;
  } catch {
    return expired;
  }

  // A session now exists, but it grants nothing on its own: /admin/welcome
  // re-checks that it is linked to an active, still-invited console staff row.
  return NextResponse.redirect(new URL(next, url.origin));
}
