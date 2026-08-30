"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { auditValues, RECORD_AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  ARCHIVABLE,
  confirmationMatches,
  isArchivable,
  preflight,
  type ArchivableEntity
} from "@/lib/admin/destructive";
import {
  RECORD_ENTITIES,
  canPerform,
  policyFor,
  type RecordEntity
} from "@/lib/admin/record-actions";

/**
 * Archive, restore and permanently delete — one implementation for every
 * operational record, so the rules cannot drift module by module.
 *
 * The order of operations in `deleteRecordAction` is the important part and is
 * deliberate:
 *
 *   authorize → preflight → confirm → **write the tombstone** → delete
 *
 * The audit row is written BEFORE the row disappears, inside the same
 * transaction. Writing it afterwards would mean a failure between the two left
 * a deletion with no record of who did it or what was destroyed — which is
 * precisely the case an audit log exists for.
 */

export type RecordActionState = {
  status: "idle" | "success" | "error";
  message:
    | null
    | "archived"
    | "restored"
    | "deleted"
    | "denied"
    | "invalid"
    | "missing"
    | "blocked"
    | "confirm"
    | "locked"
    | "revokeFirst"
    | "generic";
};

const ok = (message: RecordActionState["message"]): RecordActionState => ({
  status: "success",
  message
});
const fail = (message: RecordActionState["message"]): RecordActionState => ({
  status: "error",
  message
});

function entityOf(value: FormDataEntryValue | null): RecordEntity | null {
  return typeof value === "string" && (RECORD_ENTITIES as readonly string[]).includes(value)
    ? (value as RecordEntity)
    : null;
}

function idOf(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function pathsFor(entity: RecordEntity): string[] {
  const shared = ["/admin"];
  switch (entity) {
    case "course":
    case "batch":
      return [...shared, "/admin/courses", "/api/batches"];
    case "student":
    case "guardian":
    case "enrollment":
      return [...shared, "/admin/students", "/admin/fees"];
    case "application":
    case "application_note":
      return [...shared, "/admin/admissions"];
    case "attendance_session":
    case "attendance_record":
      return [...shared, "/admin/attendance"];
    case "fee_record":
      return [...shared, "/admin/fees", "/admin/students"];
    case "certificate":
      return [...shared, "/admin/certificates"];
    case "service_enquiry":
      return [...shared, "/admin/design"];
    case "content_item":
      return [...shared, "/admin/content"];
    default:
      return shared;
  }
}

/** The console page a record of this kind belongs to. */
function listPathFor(entity: RecordEntity): string {
  switch (entity) {
    case "course":
    case "batch":
      return "/admin/courses";
    case "student":
    case "guardian":
      return "/admin/students";
    case "application":
    case "application_note":
      return "/admin/admissions";
    case "attendance_session":
      return "/admin/attendance";
    case "fee_record":
      return "/admin/fees";
    case "certificate":
      return "/admin/certificates";
    case "service_enquiry":
      return "/admin/design";
    case "content_item":
      return "/admin/content";
    default:
      return "/admin";
  }
}

function subjectFor(session: { role: "owner" | "admin"; staff: Parameters<typeof hasPermission>[0] }) {
  return {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(session.staff, permission)
  };
}

/* -------------------------------- archive --------------------------------- */

async function setArchived(
  entity: ArchivableEntity,
  id: number,
  archive: boolean,
  formData: FormData
): Promise<RecordActionState> {
  const policy = policyFor(entity);
  const auth = await authorizeAction(
    policy.managePermission ? { permission: policy.managePermission } : { ownerOnly: true }
  );
  if (!auth.ok) return fail("denied");
  if (!canPerform(subjectFor(auth.session), entity, archive ? "archive" : "restore")) {
    return fail("denied");
  }

  const db = getDb();
  if (!db) return fail("generic");
  const table = ARCHIVABLE[entity];
  const reason = typeof formData.get("reason") === "string"
    ? String(formData.get("reason")).trim().slice(0, 300)
    : "";

  try {
    const before = await db
      .select({ id: table.id, archivedAt: table.archivedAt })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    if (!before[0]) return fail("missing");

    await db.transaction(async (tx) => {
      await tx
        .update(table)
        .set(
          archive
            ? { archivedAt: new Date(), archivedBy: auth.session.staff.id }
            : { archivedAt: null, archivedBy: null }
        )
        .where(eq(table.id, id));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: archive ? RECORD_AUDIT_ACTIONS.archived : RECORD_AUDIT_ACTIONS.restored,
          entity,
          entityId: id,
          oldValue: { archivedAt: before[0].archivedAt },
          newValue: { archived: archive },
          reason: reason || (archive ? "record archived" : "record restored")
        })
      );
    });
  } catch (error) {
    console.error(`[records] ${archive ? "archive" : "restore"} failed`, error);
    return fail("generic");
  }

  for (const path of pathsFor(entity)) revalidatePath(path);
  return ok(archive ? "archived" : "restored");
}

export async function archiveRecordAction(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const entity = entityOf(formData.get("entity"));
  const id = idOf(formData.get("id"));
  if (!entity || !id || !isArchivable(entity)) return fail("invalid");
  return setArchived(entity, id, true, formData);
}

export async function restoreRecordAction(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const entity = entityOf(formData.get("entity"));
  const id = idOf(formData.get("id"));
  if (!entity || !id || !isArchivable(entity)) return fail("invalid");
  return setArchived(entity, id, false, formData);
}

/* --------------------------- permanent deletion --------------------------- */

/** The one table each deletable entity actually lives in. */
const DELETE_TARGETS = {
  course: schema.courses,
  batch: schema.batches,
  application: schema.applications,
  application_note: schema.applicationNotes,
  student: schema.students,
  guardian: schema.guardians,
  attendance_session: schema.attendanceSessions,
  fee_record: schema.feeRecords,
  certificate: schema.certificates,
  service_enquiry: schema.serviceEnquiries,
  content_item: schema.contentItems
} as const;

type DeletableEntity = keyof typeof DELETE_TARGETS;

function isDeletable(entity: RecordEntity): entity is DeletableEntity {
  return entity in DELETE_TARGETS;
}

export async function deleteRecordAction(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const entity = entityOf(formData.get("entity"));
  const id = idOf(formData.get("id"));
  if (!entity || !id || !isDeletable(entity)) return fail("invalid");

  /**
   * Owner-only, always — even for an admin holding the module's manage
   * permission. Destroying history is not a delegated capability, and
   * `ownerOnly` is checked by the guard rather than inferred from a role field
   * anywhere in this file.
   */
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) return fail("denied");
  if (!canPerform(subjectFor(auth.session), entity, "delete")) return fail("denied");

  const db = getDb();
  if (!db) return fail("generic");

  try {
    const report = await preflight(db, entity, id);
    if (!report) return fail("missing");
    if (report.refusal === "locked") return fail("locked");
    if (report.refusal === "revokeFirst") return fail("revokeFirst");
    /* Not a cascade. The operator is shown what depends on the record and has
       to deal with it deliberately — see record-actions.ts. */
    if (report.blocked) return fail("blocked");
    if (!confirmationMatches(entity, report.identifier, formData.get("confirm"))) {
      return fail("confirm");
    }

    const reason = typeof formData.get("reason") === "string"
      ? String(formData.get("reason")).trim().slice(0, 300)
      : "";
    if (reason.length < 3) return fail("confirm");

    const table = DELETE_TARGETS[entity];
    const snapshot = await db.select().from(table).where(eq(table.id, id)).limit(1);
    if (!snapshot[0]) return fail("missing");

    await db.transaction(async (tx) => {
      /* TOMBSTONE FIRST. Writing it after the delete would mean a failure
         between the two left a deletion with no record of who did it or what
         was destroyed — exactly the case an audit log exists for. */
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: RECORD_AUDIT_ACTIONS.deleted,
          entity,
          entityId: id,
          oldValue: tombstone(entity, snapshot[0] as Record<string, unknown>),
          newValue: {
            deleted: true,
            identifier: report.identifier,
            dependencies: report.dependencies
              .filter((d) => d.count > 0)
              .map((d) => `${d.entity}:${d.count}`)
          },
          reason
        })
      );
      await tx.delete(table).where(eq(table.id, id));
    });
  } catch (error) {
    console.error("[records] delete failed", error);
    return fail("generic");
  }

  for (const path of pathsFor(entity)) revalidatePath(path);
  /* The record is gone, so the confirmation page it was deleted from no longer
     describes anything. Send the operator back to the list it belonged to. */
  redirect(`${listPathFor(entity)}?deleted=1`);
}

/**
 * What of a destroyed row is worth keeping, and what must never be kept.
 *
 * The tombstone has to identify the record well enough to answer "what was
 * deleted?" a year later, without turning `audit_logs` into a shadow copy of
 * the operational database — an audit table full of phone numbers is a second
 * place personal data lives, with none of the retention thinking the first one
 * gets. So each entity contributes a short, deliberate set of NON-SECRET
 * identifying fields. Never a password, a token, a key, or a credential of any
 * kind (CLAUDE.md).
 */
function tombstone(entity: DeletableEntity, row: Record<string, unknown>) {
  const pick = (...keys: string[]) =>
    Object.fromEntries(keys.filter((k) => row[k] !== undefined).map((k) => [k, row[k]]));

  switch (entity) {
    case "course":
      return pick("slug", "nameEn", "nameGu", "family", "sortOrder", "active");
    case "batch":
      return pick("label", "days", "startTime", "endTime", "startDate", "seats", "status");
    case "application":
      return pick("reference", "fullName", "courseSlug", "status", "createdAt");
    case "application_note":
      return pick("applicationId", "staffId", "createdAt");
    case "student":
      return pick("admissionNo", "fullName", "createdAt");
    case "guardian":
      return pick("studentId", "name", "relation");
    case "attendance_session":
      return pick("batchId", "sessionDate", "openedBy");
    case "fee_record":
      /* Money leaves a trace even when the entry does. */
      return pick("enrollmentId", "courseFee", "discount", "received", "method", "receiptNo");
    case "certificate":
      return pick("certNo", "studentName", "courseName", "issuedOn", "status");
    case "service_enquiry":
      return pick("reference", "name", "company", "status", "createdAt");
    case "content_item":
      return pick("kind", "slug", "status", "publishedAt");
    default:
      return {};
  }
}
