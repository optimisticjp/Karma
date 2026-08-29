import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublicConfig } from "./env";

/**
 * Server-side Supabase client backed by the request's cookies.
 *
 * Works in Server Components, Server Actions and Route Handlers. It uses the
 * PUBLISHABLE key: the user's own session is the authority, exactly as it is in
 * the browser. Privileged operations live in `./admin.ts` instead.
 *
 * `setAll` is wrapped because a Server Component may not mutate cookies. That
 * is fine and expected: middleware refreshes the session on every admin
 * request, so a render that cannot write a rotated cookie simply reads the one
 * middleware already wrote.
 */
export async function createClient() {
  const config = supabasePublicConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: middleware owns cookie rotation.
        }
      }
    }
  });
}

/**
 * The verified user for this request, or null.
 *
 * ALWAYS `getUser()`, never `getSession()`: `getSession` returns whatever is in
 * the cookie without contacting Supabase, so it can be replayed. `getUser`
 * validates the token against the auth server.
 */
export async function getVerifiedUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Assurance level for the current session:
 *   currentLevel aal1 + nextLevel aal2 → a factor is enrolled, code needed
 *   currentLevel aal1 + nextLevel aal1 → no factor yet, enrolment needed
 *   currentLevel aal2                  → MFA satisfied
 */
export async function getAssuranceLevel() {
  const supabase = await createClient();
  if (!supabase) return { currentLevel: null, nextLevel: null } as const;
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return { currentLevel: null, nextLevel: null } as const;
  return {
    currentLevel: (data.currentLevel ?? null) as "aal1" | "aal2" | null,
    nextLevel: (data.nextLevel ?? null) as "aal1" | "aal2" | null
  };
}
