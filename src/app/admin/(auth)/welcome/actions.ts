"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveOnboarding } from "@/lib/auth/guard";
import { acceptInvitation } from "@/lib/admin/onboarding";

/**
 * Invitation acceptance: the invited person chooses their password.
 *
 * Authorization is NOT "whoever holds a session". `resolveOnboarding()`
 * requires a verified Supabase user linked to a staff row that is active, holds
 * a console role, and is still `invited`. An unlinked Supabase user, a
 * deactivated account, and an account that has already accepted are all turned
 * away here, not just in the page that renders the form.
 *
 * The password goes to Supabase and is never stored, hashed, logged or audited
 * by Karma — Supabase Auth owns credentials, we own authorization.
 *
 * Order matters. The Supabase password update happens first, then the Karma
 * lifecycle transition. If that transition fails, the staff row remains the
 * authority and the person stays in onboarding-only state. The password is not
 * rolled back; a retry simply re-runs both idempotent steps.
 */

export type WelcomeState = {
  error: null | "mismatch" | "tooShort" | "expired" | "denied" | "failed";
};

const passwordSchema = z
  .object({
    password: z.string().min(12).max(200),
    confirm: z.string().min(1).max(200)
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"] });

export async function setPasswordAction(
  _prev: WelcomeState,
  formData: FormData
): Promise<WelcomeState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password !== confirm) return { error: "mismatch" };
  const parsed = passwordSchema.safeParse({ password, confirm });
  if (!parsed.success) return { error: "tooShort" };

  // Narrow onboarding authorization, re-checked inside the action itself.
  const { decision, userId } = await resolveOnboarding();
  if (!decision.ok) {
    if (decision.alreadyAccepted) {
      // Password setup already finished; do not allow it to run twice.
      redirect("/admin");
    }
    // "signin" means the invite session is gone or was never established.
    return { error: decision.reason === "signin" ? "expired" : "denied" };
  }
  if (!userId) return { error: "expired" };

  const supabase = await createClient();
  if (!supabase) return { error: "failed" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "failed" };

  // The Karma state transition + its audit row, in one transaction. Anything
  // other than success stops here with a generic, retryable message.
  const result = await acceptInvitation(userId);
  if (result === "failed") return { error: "failed" };

  // Password-only console: onboarding is complete, so enter the console.
  redirect("/admin");
}
