import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";

/**
 * The `invited` → `active` transition, which is a security state change and is
 * treated as one.
 *
 * Karma's `staff` row is the authority on what an account may do. Until this
 * transition commits, the person stays in onboarding-only state and cannot
 * reach console data — so a caller must NOT treat a failure here as success
 * and walk them onward into the console. `setPasswordAction` therefore surfaces
 * `"failed"` as a recoverable error instead of redirecting.
 *
 * The row update and the audit row go in ONE transaction: an activation that
 * is not recorded is exactly the kind of gap an audit trail exists to close.
 */

export type AcceptResult =
  /** The row moved from `invited` to `active` and the audit row was written. */
  | "accepted"
  /** Already accepted — a safe retry, or a second submit. Treat as success. */
  | "already-active"
  /** Nothing was written. The caller must not proceed. */
  | "failed";

/**
 * Flips the caller's own staff row to `active`.
 *
 * The WHERE clause is the guard, not the caller: it matches only a row that is
 * linked to this Supabase user, still `invited`, still `active`, and holds a
 * console role. A deactivated account, a trainer row, or an already-accepted
 * account therefore updates nothing, whatever the caller believed.
 *
 * Retries are safe: a second run finds no `invited` row, sees the account is
 * already `active`, and reports `already-active` without writing a duplicate
 * audit entry.
 */
export async function acceptInvitation(authUserId: string): Promise<AcceptResult> {
  const db = getDb();
  if (!db) {
    console.error("[onboarding] no database; invitation acceptance not persisted");
    return "failed";
  }

  try {
    return await db.transaction(async (tx): Promise<AcceptResult> => {
      const updated = await tx
        .update(schema.staff)
        .set({ status: "active", acceptedAt: new Date() })
        .where(
          and(
            eq(schema.staff.authUserId, authUserId),
            eq(schema.staff.status, "invited"),
            eq(schema.staff.active, true),
            inArray(schema.staff.role, ["owner", "admin"])
          )
        )
        .returning({ id: schema.staff.id, role: schema.staff.role });

      const row = updated[0];
      if (!row) {
        // Nothing matched. Distinguish a safe retry from a genuine refusal, so
        // a double submit does not strand someone on an error screen.
        const existing = await tx
          .select({
            status: schema.staff.status,
            active: schema.staff.active,
            role: schema.staff.role
          })
          .from(schema.staff)
          .where(eq(schema.staff.authUserId, authUserId))
          .limit(1);

        const current = existing[0];
        const alreadyAccepted =
          current?.active === true &&
          current.status === "active" &&
          (current.role === "owner" || current.role === "admin");

        // Nothing was written either way, so this transaction commits empty.
        return alreadyAccepted ? "already-active" : "failed";
      }

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(row.id),
          action: AUDIT_ACTIONS.adminAccepted,
          entity: "staff",
          entityId: row.id,
          oldValue: { status: "invited" },
          newValue: { status: "active", role: row.role },
          reason: "invitation accepted"
        })
      );

      return "accepted";
    });
  } catch (e) {
    // Never surface database internals to the person onboarding.
    console.error(
      "[onboarding] acceptInvitation transaction failed",
      e instanceof Error ? e.message.slice(0, 200) : "unknown error"
    );
    return "failed";
  }
}
