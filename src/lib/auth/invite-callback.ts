/**
 * Parameter validation for the admin invitation callback, as a pure function.
 *
 * Two facts shape this, both taken from the installed @supabase/auth-js source
 * rather than assumed:
 *
 *  1. `inviteUserByEmail()` does NOT use PKCE. Its own documentation says so:
 *     "PKCE is not supported when using inviteUserByEmail. This is because the
 *     browser initiating the invite is often different from the browser
 *     accepting the invite". So there is no `code` to exchange here, and
 *     pretending otherwise would be a lie in the code.
 *
 *  2. `EmailOtpType` is a wide union that includes `recovery`, `signup`,
 *     `magiclink` and `email_change`. The type in the URL is attacker
 *     controlled, so casting it straight into `verifyOtp` would let someone
 *     drive a different Supabase flow through the invitation endpoint. This
 *     route implements exactly one flow, so it accepts exactly one type.
 *
 * Anything else — a missing hash, an oversized hash, a different type, a `code`
 * from some other flow — is rejected without saying which.
 */

export type InviteCallbackParams = {
  tokenHash: string;
  /** Always the literal "invite": this endpoint implements no other flow. */
  type: "invite";
};

export type InviteCallbackResult =
  | { ok: true; params: InviteCallbackParams }
  | { ok: false };

/** Token hashes are short opaque strings; anything long is not one. */
const MAX_TOKEN_HASH = 512;

export function parseInviteCallback(search: URLSearchParams): InviteCallbackResult {
  const tokenHash = search.get("token_hash");
  const type = search.get("type");

  if (!tokenHash || tokenHash.length > MAX_TOKEN_HASH) return { ok: false };

  // Strict equality, never a cast. `recovery`, `signup`, `magiclink`,
  // `email_change` and anything else are refused by this endpoint.
  if (type !== "invite") return { ok: false };

  return { ok: true, params: { tokenHash, type: "invite" } };
}
