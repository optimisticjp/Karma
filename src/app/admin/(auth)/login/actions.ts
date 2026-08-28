"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/api";
import { safeNextPath } from "@/lib/auth/redirect";
import { getStaffByAuthUserId, touchLastSeen } from "@/lib/auth/staff";

/**
 * Console sign-in.
 *
 * Runs as a Server Action rather than a browser call so that Karma's own abuse
 * controls apply on top of Supabase's: the credentials never reach any code
 * path we do not own, and the response is identical whatever went wrong.
 *
 * The reply is ALWAYS the same message. It never distinguishes "no such user"
 * from "wrong password" from "that account is deactivated" from "that is the
 * owner", because each of those is a fact an attacker would like confirmed.
 * The console's real access decision happens after sign-in, in the guard.
 *
 * Nothing here logs the email, the password, or any token.
 */

export type LoginState = { error: null | "generic" | "throttled" | "unavailable" };

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200)
});

export async function signInAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Best-effort per-isolate limiter, same helper the public forms use. The
  // durable wall is Supabase's own auth rate limiting plus a Cloudflare WAF
  // rule on /admin/* (docs/security.md).
  if (!rateLimit(`admin-login-ip:${ip}`, 10, 60_000)) return { error: "throttled" };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { error: "generic" };

  // A second, tighter bucket per account slows credential stuffing against one
  // known address without locking a real person out from a shared studio IP.
  const emailKey = parsed.data.email.toLowerCase();
  if (!rateLimit(`admin-login-email:${emailKey}`, 6, 60_000)) return { error: "throttled" };

  const supabase = await createClient();
  if (!supabase) return { error: "unavailable" };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });
  if (error) return { error: "generic" };

  // Record the sign-in so Team can show a truthful "last signed in". Best
  // effort: a database hiccup must not turn a valid sign-in into a failure.
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const staff = await getStaffByAuthUserId(data.user.id);
      if (staff?.active) await touchLastSeen(staff.id);
    }
  } catch (e) {
    console.error("[login] could not record sign-in", e);
  }

  // Sign-in only proves identity. The guard on the destination decides whether
  // this person has a staff record, is active, and has cleared MFA.
  redirect(safeNextPath(formData.get("next")));
}
