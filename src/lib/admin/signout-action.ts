"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Ends the console session everywhere, then returns to the sign-in screen.
 * `scope: "global"` revokes the refresh token rather than only clearing this
 * browser's cookie, so signing out on a shared studio machine actually means
 * signed out.
 */
export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Already gone, or the auth server is unreachable: the redirect below
      // still takes the person away from the console.
    }
  }
  redirect("/admin/login");
}
