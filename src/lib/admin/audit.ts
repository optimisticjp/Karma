import "server-only";

import { getDb, schema } from "@/lib/db";

/**
 * Audit writes for sensitive mutations (CLAUDE.md #7).
 *
 * Reuses the existing `audit_logs` table rather than inventing a parallel
 * subsystem: actor, action, entity, old/new values, reason.
 *
 * NEVER pass through here: passwords, MFA/TOTP secrets, access or refresh
 * tokens, the Supabase secret key, database passwords, or raw invitation links.
 */

export const AUDIT_ACTIONS = {
  ownerBootstrapped: "admin.owner.bootstrapped",
  adminInvited: "admin.invited",
  adminAccepted: "admin.accepted",
  adminPermissionsChanged: "admin.permissions.changed",
  adminDeactivated: "admin.deactivated",
  adminReactivated: "admin.reactivated"
} as const;

export const CATALOG_AUDIT_ACTIONS = {
  courseCreated: "catalog.course.created",
  courseUpdated: "catalog.course.updated",
  batchCreated: "catalog.batch.created",
  batchUpdated: "catalog.batch.updated"
} as const;

/** Admissions CRM mutations. Note text itself is not duplicated into audit logs. */
export const ADMISSIONS_AUDIT_ACTIONS = {
  applicationCreated: "admissions.application.created",
  applicationUpdated: "admissions.application.updated",
  noteAdded: "admissions.note.added"
} as const;

export const STUDENT_AUDIT_ACTIONS = {
  studentCreated: "students.student.created",
  studentUpdated: "students.student.updated",
  applicationConverted: "students.application.converted",
  enrollmentCreated: "students.enrollment.created",
  enrollmentUpdated: "students.enrollment.updated"
} as const;

export const ATTENDANCE_AUDIT_ACTIONS = {
  registerSaved: "attendance.register.saved",
  sessionLocked: "attendance.session.locked",
  correctionApplied: "attendance.correction.applied"
} as const;

export const FEE_AUDIT_ACTIONS = {
  recordCreated: "fees.record.created"
} as const;

export const CERTIFICATE_AUDIT_ACTIONS = {
  issued: "certificates.issued",
  revoked: "certificates.revoked",
  reissued: "certificates.reissued"
} as const;

export const DESIGN_AUDIT_ACTIONS = {
  enquiryCreated: "design.enquiry.created",
  enquiryUpdated: "design.enquiry.updated",
  statusChanged: "design.status.changed",
  fileDownloaded: "design.file.downloaded"
} as const;

export const CONTENT_AUDIT_ACTIONS = {
  itemCreated: "content.item.created",
  itemUpdated: "content.item.updated",
  itemArchived: "content.item.archived"
} as const;

export type AuditAction =
  | (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]
  | (typeof CATALOG_AUDIT_ACTIONS)[keyof typeof CATALOG_AUDIT_ACTIONS]
  | (typeof ADMISSIONS_AUDIT_ACTIONS)[keyof typeof ADMISSIONS_AUDIT_ACTIONS]
  | (typeof STUDENT_AUDIT_ACTIONS)[keyof typeof STUDENT_AUDIT_ACTIONS]
  | (typeof ATTENDANCE_AUDIT_ACTIONS)[keyof typeof ATTENDANCE_AUDIT_ACTIONS]
  | (typeof FEE_AUDIT_ACTIONS)[keyof typeof FEE_AUDIT_ACTIONS]
  | (typeof CERTIFICATE_AUDIT_ACTIONS)[keyof typeof CERTIFICATE_AUDIT_ACTIONS]
  | (typeof DESIGN_AUDIT_ACTIONS)[keyof typeof DESIGN_AUDIT_ACTIONS]
  | (typeof CONTENT_AUDIT_ACTIONS)[keyof typeof CONTENT_AUDIT_ACTIONS];

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
 * Where atomicity matters more than availability, use `auditValues()` inside
 * the same database transaction as the sensitive mutation.
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
