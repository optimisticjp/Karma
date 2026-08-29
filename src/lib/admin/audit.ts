import "server-only";

import { getDb, schema } from "@/lib/db";

/**
 * Audit writes for sensitive mutations (CLAUDE.md #7).
 *
 * Reuses the existing `audit_logs` table rather than inventing a parallel
 * subsystem: actor, action, entity, old/new values, reason.
 *
 * NEVER pass through here: passwords, TOTP secrets, access or refresh tokens,
 * the Supabase secret key, database passwords, or raw invitation links. The
 * value objects below are built by callers from field names and roles, not
 * from credentials.
 */

export const AUDIT_ACTIONS = {
  ownerBootstrapped: "admin.owner.bootstrapped",
  adminInvited: "admin.invited",
  adminAccepted: "admin.accepted",
  adminPermissionsChanged: "admin.permissions.changed",
  adminDeactivated: "admin.deactivated",
  adminReactivated: "admin.reactivated"
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditEntry = {
  /** Staff id of the person acting, or "system" for scripted operations. */
  actor: string;
  action: AuditAction;
  entity: string;
  entityId?: string | number | null;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
};

/**
 * Writes one audit row. Deliberately never throws: an audit failure must not
 * roll back a completed mutation the operator has already been told about, but
 * it must be loud in the logs.
 *
 * Where atomicity matters more than availability, pass a transaction handle by
 * calling this inside `db.transaction` — see `inviteAdmin`.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  const db = getDb();
  if (!db) {
    console.error("[audit] no database; entry dropped:", entry.action, entry.entity);
    return;
  }
  try {
    await db.insert(schema.auditLogs).values(auditValues(entry));
  } catch (e) {
    console.error("[audit] write failed", entry.action, e);
  }
}

/** Shape of an audit row, shared by the transactional and best-effort paths. */
export function auditValues(entry: AuditEntry) {
  return {
    actor: entry.actor.slice(0, 120),
    action: entry.action,
    entity: entry.entity.slice(0, 80),
    entityId: entry.entityId != null ? String(entry.entityId).slice(0, 40) : null,
    oldValue: (entry.oldValue ?? null) as Record<string, unknown> | null,
    newValue: (entry.newValue ?? null) as Record<string, unknown> | null,
    reason: entry.reason ? entry.reason.slice(0, 300) : null
  };
}
