import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * PRIVILEGED Supabase client. Handle with the same care as a database password.
 *
 * `SUPABASE_SECRET_KEY` bypasses every Supabase-side check. Rules, enforced by
 * construction as far as the language allows:
 *
 *  - `server-only` at the top of this file: importing it from a Client
 *    Component is a build error, not a runtime surprise.
 *  - The key is read inside the function, never exported, never returned,
 *    never logged, never put in an error message, never serialised into a
 *    server-action result or a response body.
 *  - Session persistence and auto-refresh are OFF: this client must never
 *    acquire, store or rotate a session. It performs one privileged call and
 *    is thrown away.
 *  - It is used ONLY where Supabase Auth admin privileges are genuinely
 *    required (inviting an admin). Every ordinary request uses the cookie
 *    client in `./server.ts`.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;

  return createSupabaseClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

/** True when privileged operations (admin invitations) are available. */
export function adminClientConfigured(): boolean {
  return Boolean(supabaseUrl() && process.env.SUPABASE_SECRET_KEY);
}

/* --------------------------- account suspension --------------------------- */

/**
 * Result of a Supabase-side suspension attempt. Deliberately explicit, because
 * the caller must never *claim* a suspension that did not happen.
 */
export type BanResult = "applied" | "unavailable" | "failed";

/**
 * ~100 years. The documented way to suspend a Supabase user indefinitely
 * (`updateUserById` → `ban_duration`); `'none'` lifts it again. Both values are
 * from the installed @supabase/auth-js types, not guessed.
 */
const FOREVER = "876000h";

/**
 * Suspends or restores a Supabase auth user — DEFENCE IN DEPTH ONLY.
 *
 * What this is not: a session revocation. `auth.admin.signOut()` takes a valid
 * logged-in JWT, not a user id, so it cannot be driven from a staff row and is
 * deliberately not used here.
 *
 * The primary, immediate kill switch is Karma's own `staff.active` (and
 * `staff.status`), which every protected request re-reads server-side — so a
 * deactivated account is refused on its very next request whether or not this
 * call succeeds. A ban additionally stops Supabase from minting or refreshing
 * tokens for that user, which is worth having and is not worth failing the
 * deactivation over.
 *
 * The auth user is NEVER deleted here: the audit trail refers to that identity.
 */
export async function setSupabaseUserBanned(
  authUserId: string,
  banned: boolean
): Promise<BanResult> {
  const supabase = createAdminClient();
  if (!supabase) return "unavailable";

  try {
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      ban_duration: banned ? FOREVER : "none"
    });
    if (error) {
      // Status only. No user id, no token, no key, no message body.
      console.error(
        `[supabase] ${banned ? "ban" : "unban"} failed (status ${error.status ?? "unknown"})`
      );
      return "failed";
    }
    return "applied";
  } catch {
    console.error(`[supabase] ${banned ? "ban" : "unban"} threw`);
    return "failed";
  }
}

/**
 * Permanently deletes a Supabase auth user. Used in exactly ONE place: cleaning
 * up an auth user that was created moments ago for an invitation whose Karma
 * staff row never committed (see `src/lib/admin/invite-persistence.ts`).
 *
 * Ordinary admin deactivation must NEVER call this.
 */
export async function deleteSupabaseUser(authUserId: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.admin.deleteUser(authUserId);
    if (error) {
      console.error(`[supabase] user cleanup failed (status ${error.status ?? "unknown"})`);
      return false;
    }
    return true;
  } catch {
    console.error("[supabase] user cleanup threw");
    return false;
  }
}
