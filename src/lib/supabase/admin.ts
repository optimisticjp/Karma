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
