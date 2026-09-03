"use server";

import { revalidatePath } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, ADMISSIONS_AUDIT_ACTIONS } from "@/lib/admin/audit";
import { pad } from "@/lib/utils";
import {
  positiveApplicationId,
  validateApplicationNote,
  validateApplicationUpdate,
  validateManualEnquiry
} from "@/lib/admin/admissions";

export type AdmissionsState = {
  status: "idle" | "error" | "success";
  message:
    | null
    | "denied"
    | "invalid"
    | "missing"
    | "generic"
    | "updated"
    | "noteAdded"
    | "created";
  values?: Record<string, string>;
  invalidFields?: string[];
};

const err = (message: AdmissionsState["message"]): AdmissionsState => ({ status: "error", message });
const ok = (message: AdmissionsState["message"]): AdmissionsState => ({ status: "success", message });

function formSnapshot(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

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

export async function createManualEnquiryAction(
  _prev: AdmissionsState,
  formData: FormData
): Promise<AdmissionsState> {
  const submittedValues = formSnapshot(formData);
  const auth = await authorizeAction({ permission: "applications.manage" });
  if (!auth.ok) return { ...err("denied"), values: submittedValues };

  const parsed = validateManualEnquiry({
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    locale: formData.get("locale"),
    courseSlug: formData.get("courseSlug"),
    preferredTiming: formData.get("preferredTiming"),
    area: formData.get("area"),
    goal: formData.get("goal"),
    heardFrom: formData.get("heardFrom"),
    ageBand: formData.get("ageBand"),
    fatherName: formData.get("fatherName"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
    referenceName: formData.get("referenceName"),
    referencePhone: formData.get("referencePhone"),
    assignedTo: formData.get("assignedTo"),
    nextFollowUp: formData.get("nextFollowUp")
  });
  if (!parsed.ok) {
    return { ...err("invalid"), values: submittedValues, invalidFields: parsed.invalidFields };
  }

  const db = getDb();
  if (!db) return { ...err("generic"), values: submittedValues };

  try {
    const d = parsed.value;
    if (!(await validAssignee(db, d.assignedTo))) return { ...err("missing"), values: submittedValues };
    if (d.courseSlug) {
      const course = await db
        .select({ slug: schema.courses.slug })
        .from(schema.courses)
        .where(eq(schema.courses.slug, d.courseSlug))
        .limit(1);
      if (!course[0]) return { ...err("missing"), values: submittedValues };
    }

    const previous = await db
      .select({ id: schema.applications.id })
      .from(schema.applications)
      .where(eq(schema.applications.whatsapp, d.whatsapp))
      .limit(1);

    const now = new Date();
    await db.transaction(async (tx) => {
      const placeholder = `KDS-P-${crypto.randomUUID().slice(0, 12)}`;
      const inserted = await tx
        .insert(schema.applications)
        .values({
          reference: placeholder,
          fullName: d.fullName,
          whatsapp: d.whatsapp,
          email: d.email,
          locale: d.locale,
          courseSlug: d.courseSlug,
          preferredTiming: d.preferredTiming,
          area: d.area,
          goal: d.goal,
          heardFrom: d.heardFrom,
          ageBand: d.ageBand,
          fatherName: d.fatherName,
          guardianName: d.guardianName,
          guardianPhone: d.guardianPhone,
          referenceName: d.referenceName,
          referencePhone: d.referencePhone,
          duplicateOfPhone: previous.length > 0,
          status: "new",
          assignedTo: d.assignedTo,
          nextFollowUp: d.nextFollowUp,
          createdAt: now,
          updatedAt: now
        })
        .returning({ id: schema.applications.id });
      const id = inserted[0]?.id;
      if (!id) throw new Error("manual enquiry insert returned no id");
      const reference = `KDS-${now.getFullYear()}-${pad(id)}`;
      await tx.update(schema.applications).set({ reference }).where(eq(schema.applications.id, id));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: ADMISSIONS_AUDIT_ACTIONS.applicationCreated,
          entity: "application",
          entityId: id,
          newValue: {
            reference,
            source: d.heardFrom,
            courseSlug: d.courseSlug,
            assignedTo: d.assignedTo,
            nextFollowUp: d.nextFollowUp
          },
          reason: "front desk enquiry created"
        })
      );
    });
  } catch (error) {
    return { ...mapDbError(error, "[admissions] create manual enquiry"), values: submittedValues };
  }

  revalidatePath("/admin/admissions");
  revalidatePath("/admin");
  return ok("created");
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
