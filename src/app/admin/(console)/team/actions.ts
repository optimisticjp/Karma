"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { createAdminClient, adminClientConfigured } from "@/lib/supabase/admin";
import { parsePermissions, type Permission } from "@/lib/auth/permissions";
import { validateInvite } from "@/lib/admin/invite";
import { AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";

/**
 * Team administration. OWNER ONLY — every action in this file starts with
 * `authorizeAction({ ownerOnly: true })`, which requires a verified Supabase
 * user, a linked ACTIVE staff record, the owner role, AND an AAL2 session.
 *
 * An ordinary admin reaching these directly (they are POST endpoints like any
 * server action) gets `denied`, not a partial success. There is deliberately
 * no permission key that unlocks any of this: team administration is a
 * property of being the owner, so it cannot be granted away.
 *
 * There is no permanent deletion here, by design: admin history matters and
 * audit rows are never removed.
 */

export type TeamState = {
  status: "idle" | "error" | "success";
  message:
    | null
    | "denied"
    | "invalidEmail"
    | "invalidName"
    | "invalidPermission"
    | "duplicate"
    | "seatsFull"
    | "ownerSelf"
    | "notAdmin"
    | "inviteFailed"
    | "generic"
    | "invited"
    | "permissions"
    | "deactivated"
    | "reactivated";
  /** Only ever an email the owner just typed, for the success line. */
  email?: string;
};

const err = (message: TeamState["message"]): TeamState => ({ status: "error", message });
const ok = (message: TeamState["message"], email?: string): TeamState => ({
  status: "success",
  message,
  email
});

/* ------------------------------- invite ----------------------------------- */

export async function inviteAdminAction(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) return err("denied");

  const db = getDb();
  if (!db) return err("generic");
  if (!adminClientConfigured()) return err("inviteFailed");

  try {
    // Current console accounts, for the duplicate-email and seat checks. Both
    // are enforced again by the database (unique index + trigger), which is
    // what actually settles a race between two simultaneous invitations; these
    // exist so the owner reads a sentence rather than a Postgres error.
    const consoleStaff = await db
      .select({
        email: schema.staff.email,
        role: schema.staff.role,
        active: schema.staff.active
      })
      .from(schema.staff)
      .where(inArray(schema.staff.role, ["owner", "admin"]));

    const validation = validateInvite(
      {
        name: formData.get("name"),
        email: formData.get("email"),
        template: formData.get("template") ?? "custom",
        locale: formData.get("locale") ?? "en",
        permissions: formData.getAll("permissions").map(String)
      },
      {
        existingConsoleEmails: consoleStaff.map((s) => s.email ?? "").filter(Boolean),
        seats: consoleStaff.map((s) => ({ role: s.role, active: s.active }))
      }
    );
    if (!validation.ok) return err(validation.reason);

    const { name, email, locale, template, permissions } = validation.value;

    // Supabase Auth owns the credential. We never generate, store or log a
    // password, and the invitation link itself never touches our logs or the
    // audit table.
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) return err("inviteFailed");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/admin/auth/callback?next=${encodeURIComponent("/admin/welcome")}`,
        data: { name }
      });

    if (inviteError || !invited?.user) {
      // Never echo Supabase's message: it distinguishes "already registered"
      // from other failures, which is an enumeration signal.
      console.error("[team] invite failed", inviteError?.status ?? "unknown");
      return err("inviteFailed");
    }

    // Staff row + grants + audit in ONE transaction: an invitation that is not
    // recorded, or recorded without its permissions, is worse than none.
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.staff)
        .values({
          name,
          email,
          role: "admin",
          status: "invited",
          active: true,
          adminLocale: locale,
          authUserId: invited.user.id,
          invitedAt: new Date(),
          invitedBy: auth.session.staff.id
        })
        .returning({ id: schema.staff.id });

      const staffId = inserted[0].id;

      if (permissions.length > 0) {
        await tx.insert(schema.staffPermissions).values(
          permissions.map((permission) => ({
            staffId,
            permission,
            createdBy: auth.session.staff.id
          }))
        );
      }

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: AUDIT_ACTIONS.adminInvited,
          entity: "staff",
          entityId: staffId,
          newValue: { name, email, role: "admin", template, permissions, adminLocale: locale },
          reason: "owner invited an admin"
        })
      );
    });

    revalidatePath("/admin/team");
    return ok("invited", email);
  } catch (e) {
    return mapDbError(e, "[team] invite");
  }
}

/* --------------------------- edit permissions ------------------------------ */

export async function updatePermissionsAction(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) return err("denied");

  const staffId = Number(formData.get("staffId"));
  if (!Number.isInteger(staffId) || staffId <= 0) return err("generic");

  const next = parsePermissions(formData.getAll("permissions").map(String));
  if (next === null) return err("invalidPermission");

  const db = getDb();
  if (!db) return err("generic");

  try {
    // The target is fetched by id from an authorised query and re-checked to
    // be an admin: the form's hidden input cannot point this at the owner.
    const rows = await db
      .select({ id: schema.staff.id, role: schema.staff.role, name: schema.staff.name })
      .from(schema.staff)
      .where(eq(schema.staff.id, staffId))
      .limit(1);
    const target = rows[0];
    if (!target) return err("generic");
    if (target.role !== "admin") return err("notAdmin");

    const before = await db
      .select({ permission: schema.staffPermissions.permission })
      .from(schema.staffPermissions)
      .where(eq(schema.staffPermissions.staffId, staffId));
    const oldPermissions = before.map((r) => r.permission);

    await db.transaction(async (tx) => {
      await tx
        .delete(schema.staffPermissions)
        .where(eq(schema.staffPermissions.staffId, staffId));
      if (next.length > 0) {
        await tx.insert(schema.staffPermissions).values(
          next.map((permission: Permission) => ({
            staffId,
            permission,
            createdBy: auth.session.staff.id
          }))
        );
      }
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: AUDIT_ACTIONS.adminPermissionsChanged,
          entity: "staff",
          entityId: staffId,
          oldValue: { permissions: oldPermissions },
          newValue: { permissions: next },
          reason: "owner edited admin permissions"
        })
      );
    });

    revalidatePath("/admin/team");
    return ok("permissions");
  } catch (e) {
    return mapDbError(e, "[team] permissions");
  }
}

/* ----------------------- deactivate / reactivate --------------------------- */

export async function setActiveAction(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) return err("denied");

  const staffId = Number(formData.get("staffId"));
  const activate = formData.get("activate") === "true";
  if (!Number.isInteger(staffId) || staffId <= 0) return err("generic");

  // Defence in depth: the owner cannot switch themselves off here, the target
  // must be an admin, and the database trigger refuses it a third time.
  if (staffId === auth.session.staff.id) return err("ownerSelf");

  const db = getDb();
  if (!db) return err("generic");

  try {
    const rows = await db
      .select({
        id: schema.staff.id,
        role: schema.staff.role,
        active: schema.staff.active,
        status: schema.staff.status
      })
      .from(schema.staff)
      .where(eq(schema.staff.id, staffId))
      .limit(1);
    const target = rows[0];
    if (!target) return err("generic");
    if (target.role !== "admin") return err("ownerSelf");
    if (target.active === activate) {
      return ok(activate ? "reactivated" : "deactivated");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(schema.staff)
        .set(
          activate
            ? {
                active: true,
                // A person who never accepted returns to `invited`, not to
                // `active`: their invitation still has to be completed.
                status: target.status === "deactivated" ? "active" : target.status,
                deactivatedAt: null
              }
            : { active: false, status: "deactivated", deactivatedAt: new Date() }
        )
        .where(and(eq(schema.staff.id, staffId), eq(schema.staff.role, "admin")));

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: activate
            ? AUDIT_ACTIONS.adminReactivated
            : AUDIT_ACTIONS.adminDeactivated,
          entity: "staff",
          entityId: staffId,
          oldValue: { active: target.active, status: target.status },
          newValue: { active: activate },
          reason: activate ? "owner reactivated an admin" : "owner deactivated an admin"
        })
      );
    });

    // Best effort session revocation. Karma's own guard already denies this
    // account on its very next request — `staff.active` is checked server-side
    // every time — so a Supabase-side failure here degrades nothing.
    // The Supabase auth user is NEVER deleted: that would destroy the identity
    // the audit trail refers to.
    if (!activate) await revokeSupabaseSessions(staffId);

    revalidatePath("/admin/team");
    return ok(activate ? "reactivated" : "deactivated");
  } catch (e) {
    return mapDbError(e, "[team] setActive");
  }
}

async function revokeSupabaseSessions(staffId: number) {
  try {
    const db = getDb();
    const supabaseAdmin = createAdminClient();
    if (!db || !supabaseAdmin) return;
    const rows = await db
      .select({ authUserId: schema.staff.authUserId })
      .from(schema.staff)
      .where(eq(schema.staff.id, staffId))
      .limit(1);
    const authUserId = rows[0]?.authUserId;
    if (!authUserId) return;
    await supabaseAdmin.auth.admin.signOut(authUserId, "global");
  } catch (e) {
    console.error("[team] session revocation unavailable", e);
  }
}

/**
 * Turns a database invariant violation into the same message the pre-flight
 * check would have produced, so a race loses gracefully instead of showing a
 * Postgres error to the owner. Never surfaces the raw message.
 */
function mapDbError(e: unknown, tag: string): TeamState {
  const text = e instanceof Error ? e.message : String(e);
  console.error(tag, text.slice(0, 200));
  if (text.includes("karma_admin_seat_limit")) return err("seatsFull");
  if (text.includes("karma_owner_locked") || text.includes("karma_single_owner")) {
    return err("ownerSelf");
  }
  if (text.includes("uq_staff_console_email") || text.includes("auth_user_id")) {
    return err("duplicate");
  }
  return err("generic");
}

/* ------------------------------ audit note --------------------------------- */
/*
 * What is never written to audit_logs from this file: passwords, TOTP secrets,
 * access or refresh tokens, the Supabase secret key, database credentials, and
 * the invitation URL. The `newValue` objects above carry names, emails, roles
 * and permission KEYS only.
 */
