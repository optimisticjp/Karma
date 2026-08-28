"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { AUDIT_ACTIONS, writeAudit } from "@/lib/admin/audit";

/**
 * Invitation acceptance: the invited person chooses their password.
 *
 * Reachable only with the short-lived session the invite callback established,
 * so there is no "set a password for an arbitrary email" surface here. The
 * password is passed to Supabase and never stored, hashed, logged or audited
 * by Karma — Supabase Auth owns credentials, we own authorization.
 *
 * After this, the guard still forces MFA enrolment before any console data.
 */

export type WelcomeState = { error: null | "mismatch" | "tooShort" | "expired" | "failed" };

const schema_ = z
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
  if (password.length < 12) return { error: "tooShort" };
  const parsed = schema_.safeParse({ password, confirm });
  if (!parsed.success) return { error: "tooShort" };

  const supabase = await createClient();
  if (!supabase) return { error: "failed" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "expired" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "failed" };

  await markAccepted(userData.user.id);
  redirect("/admin/mfa/setup");
}

/**
 * Flips the staff row from `invited` to `active` the first time the person
 * completes acceptance, and records it. The seat was already reserved at
 * invitation time, so this changes no counts.
 */
async function markAccepted(authUserId: string) {
  const db = getDb();
  if (!db) return;
  try {
    const rows = await db
      .select({
        id: schema.staff.id,
        status: schema.staff.status,
        role: schema.staff.role
      })
      .from(schema.staff)
      .where(eq(schema.staff.authUserId, authUserId))
      .limit(1);

    const row = rows[0];
    if (!row || row.status !== "invited") return;

    await db
      .update(schema.staff)
      .set({ status: "active", acceptedAt: new Date() })
      .where(eq(schema.staff.id, row.id));

    await writeAudit({
      actor: String(row.id),
      action: AUDIT_ACTIONS.adminAccepted,
      entity: "staff",
      entityId: row.id,
      oldValue: { status: "invited" },
      newValue: { status: "active", role: row.role }
    });
  } catch (e) {
    console.error("[welcome] markAccepted failed", e);
  }
}
