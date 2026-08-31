"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { CATALOG_AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";
import { validateBatchInput, validateCourseInput } from "@/lib/admin/course-validation";
import { parseOperationsForm } from "@/lib/admin/course-operations";

export type CatalogState = {
  status: "idle" | "error" | "success";
  message:
    | null
    | "denied"
    | "invalid"
    | "duplicate"
    | "missing"
    | "generic"
    | "courseCreated"
    | "courseUpdated"
    | "batchCreated"
    | "batchUpdated";
};

const err = (message: CatalogState["message"]): CatalogState => ({ status: "error", message });
const ok = (message: CatalogState["message"]): CatalogState => ({ status: "success", message });

/**
 * The course fields the console owns, read once so create and update cannot
 * drift apart — the single most likely way an editable field silently stops
 * being saved on one of the two paths.
 */
function courseFields(formData: FormData) {
  return {
    slug: formData.get("slug"),
    nameEn: formData.get("nameEn"),
    nameGu: formData.get("nameGu"),
    family: formData.get("family"),
    durationWeeks: formData.get("durationWeeks"),
    durationMonths: formData.get("durationMonths"),
    software: formData.get("software"),
    feeTotal: formData.get("feeTotal"),
    feeAdmission: formData.get("feeAdmission"),
    feeBalanceDueDays: formData.get("feeBalanceDueDays"),
    termsVersion: formData.get("termsVersion"),
    publicVisible: formData.get("publicVisible"),
    sortOrder: formData.get("sortOrder"),
    active: formData.get("active")
  };
}

/** The bounded lists: timetable rows, demo policy, curriculum, practical. */
function operationsFields(formData: FormData) {
  return parseOperationsForm({
    scheduleStart: formData.getAll("scheduleStart"),
    scheduleEnd: formData.getAll("scheduleEnd"),
    demoDays: formData.get("demoDays"),
    demoHours: formData.get("demoHours"),
    demoFree: formData.get("demoFree"),
    demoStart: formData.getAll("demoStart"),
    demoEnd: formData.getAll("demoEnd"),
    curriculumEn: formData.get("curriculumEn"),
    curriculumGu: formData.get("curriculumGu"),
    practicalEn: formData.get("practicalEn"),
    practicalGu: formData.get("practicalGu")
  });
}

function positiveId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function pgCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function mapDbError(error: unknown, tag: string): CatalogState {
  const code = pgCode(error);
  console.error(tag, code ?? "unknown");
  if (code === "23505") return err("duplicate");
  if (code === "23503") return err("missing");
  if (code === "23514") return err("invalid");
  return err("generic");
}

function revalidateCatalog() {
  revalidatePath("/admin/courses");
  revalidatePath("/admin/batches");
  revalidatePath("/admin");
  revalidatePath("/api/batches");
}

async function validTrainer(db: NonNullable<ReturnType<typeof getDb>>, trainerId: number | null) {
  if (trainerId == null) return true;
  const rows = await db
    .select({ id: schema.staff.id })
    .from(schema.staff)
    .where(
      and(
        eq(schema.staff.id, trainerId),
        eq(schema.staff.role, "trainer"),
        eq(schema.staff.active, true)
      )
    )
    .limit(1);
  return rows.length === 1;
}

async function validCourse(db: NonNullable<ReturnType<typeof getDb>>, courseId: number) {
  const rows = await db
    .select({ id: schema.courses.id })
    .from(schema.courses)
    .where(eq(schema.courses.id, courseId))
    .limit(1);
  return rows.length === 1;
}

/* -------------------------------- courses -------------------------------- */

export async function createCourseAction(
  _prev: CatalogState,
  formData: FormData
): Promise<CatalogState> {
  const auth = await authorizeAction({ permission: "courses.manage" });
  if (!auth.ok) return err("denied");

  const parsed = validateCourseInput(courseFields(formData));
  if (!parsed.ok) return err("invalid");
  const operations = operationsFields(formData);
  if (!operations) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.courses)
        .values({ ...parsed.value, operations })
        .returning({ id: schema.courses.id });
      const courseId = inserted[0]?.id;
      if (!courseId) throw new Error("course insert returned no id");

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CATALOG_AUDIT_ACTIONS.courseCreated,
          entity: "course",
          entityId: courseId,
          newValue: parsed.value,
          reason: "console course created"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[courses] create course");
  }

  revalidateCatalog();
  return ok("courseCreated");
}

export async function updateCourseAction(
  _prev: CatalogState,
  formData: FormData
): Promise<CatalogState> {
  const auth = await authorizeAction({ permission: "courses.manage" });
  if (!auth.ok) return err("denied");

  const courseId = positiveId(formData.get("courseId"));
  if (!courseId) return err("invalid");

  const parsed = validateCourseInput(courseFields(formData));
  if (!parsed.ok) return err("invalid");
  const operations = operationsFields(formData);
  if (!operations) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    const before = await db
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        family: schema.courses.family,
        durationWeeks: schema.courses.durationWeeks,
        durationMonths: schema.courses.durationMonths,
        software: schema.courses.software,
        feeTotal: schema.courses.feeTotal,
        feeAdmission: schema.courses.feeAdmission,
        feeBalanceDueDays: schema.courses.feeBalanceDueDays,
        termsVersion: schema.courses.termsVersion,
        publicVisible: schema.courses.publicVisible,
        sortOrder: schema.courses.sortOrder,
        active: schema.courses.active
      })
      .from(schema.courses)
      .where(eq(schema.courses.id, courseId))
      .limit(1);
    if (!before[0]) return err("missing");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.courses)
        .set({ ...parsed.value, operations })
        .where(eq(schema.courses.id, courseId));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CATALOG_AUDIT_ACTIONS.courseUpdated,
          entity: "course",
          entityId: courseId,
          oldValue: before[0],
          newValue: parsed.value,
          reason: "console course updated"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[courses] update course");
  }

  revalidateCatalog();
  return ok("courseUpdated");
}

/* -------------------------------- batches -------------------------------- */

export async function createBatchAction(
  _prev: CatalogState,
  formData: FormData
): Promise<CatalogState> {
  const auth = await authorizeAction({ permission: "batches.manage" });
  if (!auth.ok) return err("denied");

  const parsed = validateBatchInput({
    courseId: formData.get("courseId"),
    label: formData.get("label"),
    days: formData.get("days"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    seats: formData.get("seats"),
    language: formData.get("language"),
    trainerId: formData.get("trainerId"),
    status: formData.get("status")
  });
  if (!parsed.ok) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    if (!(await validCourse(db, parsed.value.courseId))) return err("missing");
    if (!(await validTrainer(db, parsed.value.trainerId))) return err("missing");

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.batches)
        .values(parsed.value)
        .returning({ id: schema.batches.id });
      const batchId = inserted[0]?.id;
      if (!batchId) throw new Error("batch insert returned no id");

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CATALOG_AUDIT_ACTIONS.batchCreated,
          entity: "batch",
          entityId: batchId,
          newValue: parsed.value,
          reason: "console batch created"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[courses] create batch");
  }

  revalidateCatalog();
  return ok("batchCreated");
}

export async function updateBatchAction(
  _prev: CatalogState,
  formData: FormData
): Promise<CatalogState> {
  const auth = await authorizeAction({ permission: "batches.manage" });
  if (!auth.ok) return err("denied");

  const batchId = positiveId(formData.get("batchId"));
  if (!batchId) return err("invalid");

  const parsed = validateBatchInput({
    courseId: formData.get("courseId"),
    label: formData.get("label"),
    days: formData.get("days"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    seats: formData.get("seats"),
    language: formData.get("language"),
    trainerId: formData.get("trainerId"),
    status: formData.get("status")
  });
  if (!parsed.ok) return err("invalid");

  const db = getDb();
  if (!db) return err("generic");

  try {
    const before = await db
      .select({
        courseId: schema.batches.courseId,
        label: schema.batches.label,
        days: schema.batches.days,
        startTime: schema.batches.startTime,
        endTime: schema.batches.endTime,
        startDate: schema.batches.startDate,
        endDate: schema.batches.endDate,
        seats: schema.batches.seats,
        seatsTaken: schema.batches.seatsTaken,
        language: schema.batches.language,
        trainerId: schema.batches.trainerId,
        status: schema.batches.status
      })
      .from(schema.batches)
      .where(eq(schema.batches.id, batchId))
      .limit(1);
    if (!before[0]) return err("missing");
    if (parsed.value.seats < before[0].seatsTaken) return err("invalid");
    if (!(await validCourse(db, parsed.value.courseId))) return err("missing");
    if (!(await validTrainer(db, parsed.value.trainerId))) return err("missing");

    await db.transaction(async (tx) => {
      await tx.update(schema.batches).set(parsed.value).where(eq(schema.batches.id, batchId));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CATALOG_AUDIT_ACTIONS.batchUpdated,
          entity: "batch",
          entityId: batchId,
          oldValue: before[0],
          newValue: { ...parsed.value, seatsTaken: before[0].seatsTaken },
          reason: "console batch updated"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[courses] update batch");
  }

  revalidateCatalog();
  return ok("batchUpdated");
}
