"use server";

import { revalidatePath } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, ADMISSIONS_AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  positiveApplicationId,
  validateApplicationNote,
  validateApplicationUpdate
} from "@/lib/admin/admissions";

export type AdmissionsState = {
  status: "idle" | "error" | "success";
  message: null | "denied" | "invalid" | "missing" | "generic" | "updated" | "noteAdded";
};

const err = (message: AdmissionsState["message"]): AdmissionsState => ({ status: "error", message });
const ok = (message: AdmissionsState["message"]): AdmissionsState => ({ status: "success", message });

function pgCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function mapDbError(error: unknown, tag: string): AdmissionsState {
  const code = pgCode(error);
  console.error(tag, code ?? "unknown");
  if (code === "23503") return err("missing");
  if (code === "23514" || code === "22P02") return err("invalid");
  return err("generic");
}

async function validAssignee(db: NonNullable<ReturnType<typeof getDb>>, staffId: number | null) {
  if (staffId == null) return true;
  const rows = await db
    .select({ id: schema.staff.id })
    .from(schema.staff)
    .where(
      and(
        eq(schema.staff.id, staffId),
        eq(schema.staff.active, true),
        eq(schema.staff.status, "active"),
        or(eq(schema.staff.role, "owner"), eq(schema.staff.role, "admin"))
      )
    )
    .limit(1);
  return rows.length === 1;
}

export async function updateApplicationAction(
  _prev: AdmissionsState,
  formData: FormData
): Promise<AdmissionsState> {
  const auth = await authorizeAction({ permission: "applications.manage" });
  if (!auth.ok) return err("denied");

  const applicationId = positiveApplicationId(formData.get("applicationId"));
  if (!applicationId) return err("invalid");

  const parsed = validateApplicationUpdate({
    status: formData.get("status"),
    assignedTo: formData.get("assignedTo"),
    nextFollowUp: formData.get("nextFollowUp"),
    closureReason: formData.get("closureReason")
  });
  if (!parsed.ok) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    if (!(await validAssignee(db, parsed.value.assignedTo))) return err("missing");

    const before = await db
      .select({
        status: schema.applications.status,
        assignedTo: schema.applications.assignedTo,
        nextFollowUp: schema.applications.nextFollowUp,
        closureReason: schema.applications.closureReason
      })
      .from(schema.applications)
      .where(eq(schema.applications.id, applicationId))
      .limit(1);
    if (!before[0]) return err("missing");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.applications)
        .set({ ...parsed.value, updatedAt: new Date() })
        .where(eq(schema.applications.id, applicationId));

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: ADMISSIONS_AUDIT_ACTIONS.applicationUpdated,
          entity: "application",
          entityId: applicationId,
          oldValue: before[0],
          newValue: parsed.value,
          reason: "console admission updated"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[admissions] update application");
  }

  revalidatePath("/admin/admissions");
  revalidatePath("/admin");
  return ok("updated");
}

export async function addApplicationNoteAction(
  _prev: AdmissionsState,
  formData: FormData
): Promise<AdmissionsState> {
  const auth = await authorizeAction({ permission: "applications.manage" });
  if (!auth.ok) return err("denied");

  const applicationId = positiveApplicationId(formData.get("applicationId"));
  const note = validateApplicationNote(formData.get("note"));
  if (!applicationId || !note) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    const application = await db
      .select({ id: schema.applications.id })
      .from(schema.applications)
      .where(eq(schema.applications.id, applicationId))
      .limit(1);
    if (!application[0]) return err("missing");

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.applicationNotes)
        .values({ applicationId, staffId: auth.session.staff.id, note })
        .returning({ id: schema.applicationNotes.id });
      const noteId = inserted[0]?.id;
      if (!noteId) throw new Error("application note insert returned no id");

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: ADMISSIONS_AUDIT_ACTIONS.noteAdded,
          entity: "application_note",
          entityId: noteId,
          newValue: { applicationId },
          reason: "console admission note added"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[admissions] add note");
  }

  revalidatePath("/admin/admissions");
  return ok("noteAdded");
}
