import "server-only";

import { cache } from "react";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isPermission, type Permission } from "./permissions";
import type { StaffRole } from "./access";
import { ADMIN_LOCALES, isAdminLocale, type AdminLocale } from "@/lib/admin/i18n";

/**
 * Narrow a stored locale to a Console locale.
 *
 * The `locale` Postgres enum gained `hi` on 2026-08-31 so the PUBLIC site
 * could record a Hindi admission submission. `staff.admin_locale` shares that
 * enum, so the column can now technically hold a value the Console has no
 * catalogue for — nothing writes it, and this is what happens if something
 * ever does. Falling back to English beats rendering a console with no
 * strings, and beats a runtime throw on a staff member's sign-in.
 */
function toAdminLocale(value: string): AdminLocale {
  return isAdminLocale(value) ? value : ADMIN_LOCALES[0];
}

export type StaffRecord = {
  id: number;
  name: string;
  email: string | null;
  role: StaffRole;
  status: "invited" | "active" | "deactivated";
  active: boolean;
  adminLocale: "en" | "gu";
  authUserId: string | null;
  invitedAt: Date | null;
  acceptedAt: Date | null;
  deactivatedAt: Date | null;
  lastSeenAt: Date | null;
  permissions: Permission[];
};

/**
 * The staff record linked to a Supabase user, with its permission grants.
 *
 * This is the authoritative source for role and access. Supabase user metadata
 * is editable by the user and is never consulted here — a `user_metadata.role`
 * of "owner" means precisely nothing.
 *
 * Cached per request so a page that renders a nav, a heading and a table does
 * not run the same two queries three times.
 */
export const getStaffByAuthUserId = cache(
  async (authUserId: string): Promise<StaffRecord | null> => {
    const db = getDb();
    if (!db) return null;

    try {
      const rows = await db
        .select()
        .from(schema.staff)
        .where(eq(schema.staff.authUserId, authUserId))
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      // Only fetch grants for a role that can hold them. The owner bypasses
      // the table entirely, and a trainer has no console access.
      const permissions =
        row.role === "admin" ? await loadPermissions(row.id) : [];

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        active: row.active,
        adminLocale: toAdminLocale(row.adminLocale),
        authUserId: row.authUserId,
        invitedAt: row.invitedAt,
        acceptedAt: row.acceptedAt,
        deactivatedAt: row.deactivatedAt,
        lastSeenAt: row.lastSeenAt,
        permissions
      };
    } catch (e) {
      console.error("[auth] staff lookup failed", e);
      return null;
    }
  }
);

async function loadPermissions(staffId: number): Promise<Permission[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ permission: schema.staffPermissions.permission })
    .from(schema.staffPermissions)
    .where(eq(schema.staffPermissions.staffId, staffId));
  // A row whose key is no longer recognised grants nothing: unknown keys are
  // dropped on read as well as rejected on write.
  return rows.map((r) => r.permission).filter(isPermission);
}

/** Every console account, newest invitation last. Owner-only screens use this. */
export async function listConsoleStaff(): Promise<StaffRecord[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(schema.staff)
    .where(inArray(schema.staff.role, ["owner", "admin"]))
    .orderBy(asc(schema.staff.role), asc(schema.staff.id));

  const adminIds = rows.filter((r) => r.role === "admin").map((r) => r.id);
  const grants = adminIds.length
    ? await db
        .select({
          staffId: schema.staffPermissions.staffId,
          permission: schema.staffPermissions.permission
        })
        .from(schema.staffPermissions)
        .where(inArray(schema.staffPermissions.staffId, adminIds))
    : [];

  const byStaff = new Map<number, Permission[]>();
  for (const g of grants) {
    if (!isPermission(g.permission)) continue;
    const list = byStaff.get(g.staffId) ?? [];
    list.push(g.permission);
    byStaff.set(g.staffId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    active: row.active,
    adminLocale: toAdminLocale(row.adminLocale),
    authUserId: row.authUserId,
    invitedAt: row.invitedAt,
    acceptedAt: row.acceptedAt,
    deactivatedAt: row.deactivatedAt,
    lastSeenAt: row.lastSeenAt,
    permissions: byStaff.get(row.id) ?? []
  }));
}

/** Records the sign-in so Team can show a truthful "last active". */
export async function touchLastSeen(staffId: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db
      .update(schema.staff)
      .set({ lastSeenAt: new Date() })
      .where(and(eq(schema.staff.id, staffId), eq(schema.staff.active, true)));
  } catch (e) {
    console.error("[auth] touchLastSeen failed", e);
  }
}
