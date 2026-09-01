import "server-only";

import { count, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { policyFor, type RecordEntity } from "./record-actions";

/**
 * The mechanics of taking something away: what depends on it, whether the
 * operator really meant it, and the tombstone that outlives it.
 *
 * The policy — who may, and on what — lives in `record-actions.ts`. This file
 * only implements it.
 */

export type Dependency = { entity: RecordEntity; count: number; blocking: boolean };

export type DeletePreflight = {
  entity: RecordEntity;
  id: number;
  /** The human-readable identifier the operator will be asked to type. */
  identifier: string;
  dependencies: Dependency[];
  /** True when something must be dealt with first. */
  blocked: boolean;
  /** A reason the action itself refuses, beyond dependencies. */
  refusal: string | null;
};

type Db = NonNullable<ReturnType<typeof getDb>>;

/**
 * What would be affected, and what stands in the way.
 *
 * EVERY entity the policy marks deletable must have a branch here. Without one
 * the switch falls through to `null`, the action reports "missing", and a
 * record the policy says is deletable simply refuses — a silent gap rather
 * than a visible error. `tests/record-actions.test.ts` asserts the two lists
 * match, because this is exactly the kind of omission a new entity introduces.
 *
 * Deliberately NOT a broad cascade. `courses.batches`, `batches.enrollments`
 * and some child tables are declared `ON DELETE CASCADE` in the schema, so a
 * careless root delete really could remove a lot of history. Blocking on the
 * high-value dependencies is what keeps cleanup deliberate.
 */
export async function preflight(
  db: Db,
  entity: RecordEntity,
  id: number
): Promise<DeletePreflight | null> {
  const dependencies: Dependency[] = [];
  let identifier = String(id);
  let refusal: string | null = null;

  const n = async (rows: Promise<{ n: number }[]>) => Number((await rows)[0]?.n ?? 0);

  switch (entity) {
    case "course": {
      const rows = await db
        .select({ slug: schema.courses.slug })
        .from(schema.courses)
        .where(eq(schema.courses.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].slug;
      dependencies.push({
        entity: "batch",
        count: await n(
          db.select({ n: count() }).from(schema.batches).where(eq(schema.batches.courseId, id))
        ),
        blocking: true
      });
      break;
    }
    case "batch": {
      const rows = await db
        .select({ label: schema.batches.label })
        .from(schema.batches)
        .where(eq(schema.batches.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].label;
      dependencies.push({
        entity: "enrollment",
        count: await n(
          db.select({ n: count() }).from(schema.enrollments).where(eq(schema.enrollments.batchId, id))
        ),
        blocking: true
      });
      dependencies.push({
        entity: "attendance_session",
        count: await n(
          db.select({ n: count() }).from(schema.attendanceSessions).where(eq(schema.attendanceSessions.batchId, id))
        ),
        blocking: false
      });
      break;
    }
    case "student": {
      const rows = await db
        .select({ admissionNo: schema.students.admissionNo })
        .from(schema.students)
        .where(eq(schema.students.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].admissionNo;
      dependencies.push({
        entity: "enrollment",
        count: await n(
          db.select({ n: count() }).from(schema.enrollments).where(eq(schema.enrollments.studentId, id))
        ),
        blocking: true
      });
      dependencies.push({
        entity: "attendance_record",
        count: await n(
          db.select({ n: count() }).from(schema.attendanceRecords).where(eq(schema.attendanceRecords.studentId, id))
        ),
        blocking: false
      });
      dependencies.push({
        entity: "guardian",
        count: await n(
          db.select({ n: count() }).from(schema.guardians).where(eq(schema.guardians.studentId, id))
        ),
        blocking: false
      });
      break;
    }
    case "application": {
      const rows = await db
        .select({ reference: schema.applications.reference })
        .from(schema.applications)
        .where(eq(schema.applications.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].reference;
      dependencies.push({
        entity: "application_note",
        count: await n(
          db.select({ n: count() }).from(schema.applicationNotes).where(eq(schema.applicationNotes.applicationId, id))
        ),
        blocking: false
      });
      break;
    }
    case "enrollment": {
      const rows = await db
        .select({
          id: schema.enrollments.id,
          studentId: schema.enrollments.studentId,
          batchId: schema.enrollments.batchId
        })
        .from(schema.enrollments)
        .where(eq(schema.enrollments.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = `#${rows[0].id}`;
      dependencies.push({
        entity: "fee_record",
        count: await n(
          db.select({ n: count() }).from(schema.feeRecords).where(eq(schema.feeRecords.enrollmentId, id))
        ),
        blocking: true
      });
      dependencies.push({
        entity: "certificate",
        count: await n(
          db.select({ n: count() }).from(schema.certificates).where(eq(schema.certificates.enrollmentId, id))
        ),
        blocking: true
      });
      break;
    }
    case "certificate": {
      const rows = await db
        .select({ certNo: schema.certificates.certNo, status: schema.certificates.status })
        .from(schema.certificates)
        .where(eq(schema.certificates.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].certNo;
      /* A public verification URL that 404s reads as a forgery, not as a
         withdrawal. Revoke first — that is the honest public answer. */
      if (rows[0].status !== "revoked") refusal = "revokeFirst";
      break;
    }
    case "attendance_session": {
      const rows = await db
        .select({
          sessionDate: schema.attendanceSessions.sessionDate,
          lockedAt: schema.attendanceSessions.lockedAt
        })
        .from(schema.attendanceSessions)
        .where(eq(schema.attendanceSessions.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].sessionDate;
      /* Locking is the moment a register became a record. */
      if (rows[0].lockedAt) refusal = "locked";
      dependencies.push({
        entity: "attendance_record",
        count: await n(
          db.select({ n: count() }).from(schema.attendanceRecords).where(eq(schema.attendanceRecords.sessionId, id))
        ),
        blocking: false
      });
      break;
    }
    case "fee_record": {
      const rows = await db
        .select({ receiptNo: schema.feeRecords.receiptNo, id: schema.feeRecords.id })
        .from(schema.feeRecords)
        .where(eq(schema.feeRecords.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].receiptNo ?? `#${rows[0].id}`;
      break;
    }
    case "guardian": {
      const rows = await db
        .select({ name: schema.guardians.name, phone: schema.guardians.phone })
        .from(schema.guardians)
        .where(eq(schema.guardians.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].name;
      break;
    }
    case "application_note": {
      const rows = await db
        .select({ id: schema.applicationNotes.id, applicationId: schema.applicationNotes.applicationId })
        .from(schema.applicationNotes)
        .where(eq(schema.applicationNotes.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = `#${rows[0].id}`;
      break;
    }
    case "content_item": {
      const rows = await db
        .select({ kind: schema.contentItems.kind, slug: schema.contentItems.slug })
        .from(schema.contentItems)
        .where(eq(schema.contentItems.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = `${rows[0].kind}/${rows[0].slug}`;
      break;
    }
    case "service_enquiry": {
      const rows = await db
        .select({ reference: schema.serviceEnquiries.reference })
        .from(schema.serviceEnquiries)
        .where(eq(schema.serviceEnquiries.id, id))
        .limit(1);
      if (!rows[0]) return null;
      identifier = rows[0].reference;
      /* Its status history and file rows go with it (both ON DELETE CASCADE).
         Once R2 is bound, deletion must also remove the objects those file
         rows point at — today there are no objects, and the tombstone keeps
         the file names. */
      break;
    }
    default:
      return null;
  }

  const blocked = dependencies.some((d) => d.blocking && d.count > 0);
  return { entity, id, identifier, dependencies, blocked, refusal };
}

/**
 * Does the confirmation the operator typed match what was asked for?
 *
 * Case-insensitive and trimmed: the point is proving deliberate intent, not
 * testing typing accuracy, and a refusal over a trailing space teaches people
 * to paste rather than to read.
 */
export function confirmationMatches(
  entity: RecordEntity,
  identifier: string,
  typed: unknown
): boolean {
  const policy = policyFor(entity);
  if (policy.confirmation === "none") return false;
  if (typeof typed !== "string") return false;
  const value = typed.trim().toLowerCase();
  if (!value) return false;
  return policy.confirmation === "identifier"
    ? value === identifier.trim().toLowerCase()
    : value === "delete";
}

/* ------------------------------- archiving -------------------------------- */

/** Tables that carry the `archived_at` / `archived_by` pair from migration 0004. */
export const ARCHIVABLE = {
  course: schema.courses,
  batch: schema.batches,
  student: schema.students,
  application: schema.applications
} as const;

export type ArchivableEntity = keyof typeof ARCHIVABLE;

export function isArchivable(entity: RecordEntity): entity is ArchivableEntity {
  return entity in ARCHIVABLE;
}

/** Only-not-archived, for every operational picker. */
export function notArchived(entity: ArchivableEntity) {
  return isNull(ARCHIVABLE[entity].archivedAt);
}

export function onlyArchived(entity: ArchivableEntity) {
  return isNotNull(ARCHIVABLE[entity].archivedAt);
}
