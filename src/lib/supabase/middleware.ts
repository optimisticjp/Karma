import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabasePublicConfig } from "./env";

/**
 * Refreshes the Supabase session cookie on admin requests.
 *
 * This is ONLY token rotation. It is deliberately not an authorization check:
 * middleware can be reasoned around, and Karma's access decision needs the
 * database (`staff` role, active flag, permissions) which the guard in
 * `src/lib/auth/guard.ts` performs inside every protected page and action.
 * Treating middleware as the wall would be exactly the "route visibility as
 * security" mistake.
 *
 * `getUser()` (not `getSession()`) is what actually triggers the refresh, and
 * it validates the token with the auth server rather than trusting the cookie.
 */
export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const config = supabasePublicConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      }
    }
  });

  try {
    await supabase.auth.getUser();
  } catch {
    // A refresh failure must not take the console down: the guard will send
    // the request to /admin/login on the very next step.
  }

  return response;
}
