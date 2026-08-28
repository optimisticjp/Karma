import { describe, expect, it } from "vitest";
import { parseInviteCallback } from "@/lib/auth/invite-callback";

/**
 * `/admin/auth/callback` implements exactly one Supabase flow: the admin
 * invitation, verified by token hash.
 *
 * Two things make the validation worth testing rather than assuming:
 *
 *  - `inviteUserByEmail()` does not support PKCE (the installed
 *    @supabase/auth-js says so), so a `code` here is not an invitation and must
 *    not be exchanged.
 *  - `type` comes from the URL, so it is attacker controlled. `EmailOtpType`
 *    also covers `recovery`, `signup`, `magiclink` and `email_change`; casting
 *    the raw value would turn this endpoint into a way to drive any of them.
 */

const params = (init: Record<string, string>) => new URLSearchParams(init);

describe("invite callback parameters", () => {
  it("accepts a well-formed invite token hash", () => {
    const result = parseInviteCallback(
      params({ token_hash: "pkce_abc123hash", type: "invite" })
    );
    expect(result).toEqual({
      ok: true,
      params: { tokenHash: "pkce_abc123hash", type: "invite" }
    });
  });

  it("ignores extra parameters rather than trusting them", () => {
    const result = parseInviteCallback(
      params({ token_hash: "hash", type: "invite", next: "/admin/team", code: "xyz" })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Nothing but the two verified fields comes back out.
    expect(Object.keys(result.params).sort()).toEqual(["tokenHash", "type"]);
  });

  it("refuses every other OTP type, so no other flow can enter onboarding", () => {
    for (const type of [
      "recovery",
      "signup",
      "magiclink",
      "email",
      "email_change",
      "sms",
      "phone_change",
      "INVITE",
      "invite ",
      " invite",
      ""
    ]) {
      expect(parseInviteCallback(params({ token_hash: "hash", type })), type).toEqual({
        ok: false
      });
    }
  });

  it("refuses a missing type", () => {
    expect(parseInviteCallback(params({ token_hash: "hash" }))).toEqual({ ok: false });
  });

  it("refuses a missing or empty token hash", () => {
    expect(parseInviteCallback(params({ type: "invite" }))).toEqual({ ok: false });
    expect(parseInviteCallback(params({ token_hash: "", type: "invite" }))).toEqual({
      ok: false
    });
  });

  it("refuses an absurdly long token hash", () => {
    expect(
      parseInviteCallback(params({ token_hash: "x".repeat(513), type: "invite" }))
    ).toEqual({ ok: false });
  });

  it("refuses a PKCE-style code, because invitations are not a PKCE flow", () => {
    expect(parseInviteCallback(params({ code: "some-auth-code" }))).toEqual({ ok: false });
    expect(
      parseInviteCallback(params({ code: "some-auth-code", type: "invite" }))
    ).toEqual({ ok: false });
  });

  it("refuses an entirely empty query string", () => {
    expect(parseInviteCallback(params({}))).toEqual({ ok: false });
  });
});
