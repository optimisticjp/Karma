"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, lt, ne, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, STUDENT_AUDIT_ACTIONS } from "@/lib/admin/audit";
import { agreementAuditValues, agreementForBatch } from "@/lib/admin/enrollment-agreement";
import { pad } from "@/lib/utils";
import { kolkataDate } from "@/lib/admin/dates";
import {
  positiveId,
  validateApplicationConversion,
  validateDirectAdmission,
  validateEnrollmentCreate,
  validateEnrollmentStatus,
  validateStudentInput,
  type EnrollmentStatus
} from "@/lib/admin/students";

export type StudentsState = {
  status: "idle" | "error" | "success";
  message:
    | null
    | "denied"
    | "invalid"
    | "missing"
    | "duplicate"
    | "seat"
    | "alreadyConverted"
    | "generic"
    | "studentCreated"
    | "studentUpdated"
    | "converted"
    | "enrolled"
    | "enrollmentUpdated";
  values?: Record<string, string>;
  invalidFields?: string[];
};

const errorState = (message: StudentsState["message"]): StudentsState => ({ status: "error", message });
const successState = (message: StudentsState["message"]): StudentsState => ({ status: "success", message });

function pgCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const value = (error as { code?: unknown }).code;
  return typeof value === "string" ? value : null;
}

function mapDbError(error: unknown, tag: string): StudentsState {
  const code = pgCode(error);
  console.error(tag, code ?? "unknown");
  if (code === "23505") return errorState("duplicate");
  if (code === "23503") return errorState("missing");
  if (code === "23514" || code === "22P02") return errorState("invalid");
  return errorState("generic");
}

function occupiesSeat(status: EnrollmentStatus): boolean {
  return status === "applied" || status === "active";
}

export async function directAdmissionAction(
  _prev: StudentsState,
  formData: FormData
): Promise<StudentsState> {
  const submittedValues = formSnapshot(formData);
  const auth = await authorizeAction({ permission: "students.manage" });
  if (!auth.ok) return { ...errorState("denied"), values: submittedValues };

  const parsed = validateDirectAdmission(formObject(formData));
  if (!parsed.ok) return { ...errorState("invalid"), values: submittedValues, invalidFields: parsed.invalidFields };
  const db = getDb();
  if (!db) return { ...errorState("generic"), values: submittedValues };

  try {
    const d = parsed.value;
    await db.transaction(async (tx) => {
      const seat = await tx
        .update(schema.batches)
        .set({ seatsTaken: sql`${schema.batches.seatsTaken} + 1` })
        .where(
          and(
            eq(schema.batches.id, d.batchId),
            lt(schema.batches.seatsTaken, schema.batches.seats),
            inArray(schema.batches.status, ["open", "started"])
          )
        )
        .returning({ id: schema.batches.id, seats: schema.batches.seats, seatsTaken: schema.batches.seatsTaken, status: schema.batches.status });
      if (!seat[0]) throw new SeatUnavailableError();

      const placeholder = `KDS-P-${crypto.randomUUID().slice(0, 12)}`;
      const inserted = await tx
        .insert(schema.students)
        .values({
          admissionNo: placeholder,
          fullName: d.fullName,
          phone: d.phone,
          whatsapp: d.whatsapp,
          email: d.email,
          area: d.area,
          languagePref: d.languagePref,
          isMinor: d.isMinor,
          fatherName: d.fatherName,
          referenceName: d.referenceName,
          referencePhone: d.referencePhone,
          photoConsent: d.photoConsent,
          photoConsentAt: d.photoConsent ? new Date() : null,
          notes: d.notes
        })
        .returning({ id: schema.students.id });
      const studentId = inserted[0]?.id;
      if (!studentId) throw new Error("student insert returned no id");
      const year = Number((d.joinedOn ?? kolkataDate()).slice(0, 4));
      const admissionNo = `KDS-${year}-${pad(studentId)}`;
      await tx.update(schema.students).set({ admissionNo }).where(eq(schema.students.id, studentId));

      /* Every formal admission records a parent/guardian contact (owner
         decision, 2026-08-30). `validateDirectAdmission` has already required
         the phone; the NAME is only asked of under-18 applicants, so it falls
         back to a plain label rather than blocking the admission. */
      if (d.guardianPhone) {
        await tx.insert(schema.guardians).values({
          studentId,
          name: d.guardianName ?? "Parent / guardian",
          phone: d.guardianPhone,
          relation: d.guardianRelation
        });
      }

      /* The commercial agreement is captured HERE, once. Editing the course
         later must never reprice this student. */
      const joinDate = d.joinedOn ?? kolkataDate();
      const agreement = await agreementForBatch(tx, d.batchId, joinDate);
      const enrollment = await tx
        .insert(schema.enrollments)
        .values({ studentId, batchId: d.batchId, status: "active", joinedOn: joinDate, ...agreement })
        .returning({ id: schema.enrollments.id });
      const enrollmentId = enrollment[0]?.id;
      if (!enrollmentId) throw new Error("enrollment insert returned no id");

      if (seat[0].status === "open" && seat[0].seatsTaken >= seat[0].seats) {
        await tx.update(schema.batches).set({ status: "full" }).where(eq(schema.batches.id, d.batchId));
      }

      await tx.insert(schema.auditLogs).values([
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.studentCreated,
          entity: "student",
          entityId: studentId,
          newValue: { admissionNo, source: "direct_admission", batchId: d.batchId },
          reason: "front desk direct admission"
        }),
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.enrollmentCreated,
          entity: "enrollment",
          entityId: enrollmentId,
          newValue: { studentId, batchId: d.batchId, status: "active", ...agreementAuditValues(agreement) },
          reason: "direct admission enrollment"
        })
      ]);
    });
  } catch (error) {
    if (error instanceof SeatUnavailableError) return { ...errorState("seat"), values: submittedValues };
    return { ...mapDbError(error, "[students] direct admission"), values: submittedValues };
  }

  revalidateStudentPaths();
  return successState("studentCreated");
}

export async function convertApplicationAction(
  _prev: StudentsState,
  formData: FormData
): Promise<StudentsState> {
  const auth = await authorizeAction({ permission: "students.manage" });
  if (!auth.ok) return errorState("denied");

  const parsed = validateApplicationConversion(formObject(formData));
  if (!parsed.ok) return errorState("invalid");
  const db = getDb();
  if (!db) return errorState("generic");

  try {
    const { applicationId, batchId, joinedOn } = parsed.value;
    const application = await db
      .select({
        id: schema.applications.id,
        reference: schema.applications.reference,
        fullName: schema.applications.fullName,
        whatsapp: schema.applications.whatsapp,
        email: schema.applications.email,
        locale: schema.applications.locale,
        area: schema.applications.area,
        goal: schema.applications.goal,
        ageBand: schema.applications.ageBand,
        fatherName: schema.applications.fatherName,
        guardianName: schema.applications.guardianName,
        guardianPhone: schema.applications.guardianPhone,
        guardianRelation: schema.applications.guardianRelation,
        referenceName: schema.applications.referenceName,
        referencePhone: schema.applications.referencePhone,
        status: schema.applications.status
      })
      .from(schema.applications)
      .where(eq(schema.applications.id, applicationId))
      .limit(1);
    const app = application[0];
    if (!app) return errorState("missing");
    if (["enrolled", "not_proceeding", "closed"].includes(app.status)) return errorState("alreadyConverted");

    await db.transaction(async (tx) => {
      const seat = await tx
        .update(schema.batches)
        .set({ seatsTaken: sql`${schema.batches.seatsTaken} + 1` })
        .where(
          and(
            eq(schema.batches.id, batchId),
            lt(schema.batches.seatsTaken, schema.batches.seats),
            inArray(schema.batches.status, ["open", "started"])
          )
        )
        .returning({ id: schema.batches.id, seats: schema.batches.seats, seatsTaken: schema.batches.seatsTaken, status: schema.batches.status });
      if (!seat[0]) throw new SeatUnavailableError();

      const placeholder = `KDS-P-${crypto.randomUUID().slice(0, 12)}`;
      const studentRows = await tx
        .insert(schema.students)
        .values({
          admissionNo: placeholder,
          fullName: app.fullName,
          phone: app.whatsapp,
          whatsapp: app.whatsapp,
          email: app.email,
          area: app.area,
          languagePref: app.locale,
          isMinor: app.ageBand === "under18",
          fatherName: app.fatherName,
          referenceName: app.referenceName,
          referencePhone: app.referencePhone,
          notes: app.goal
        })
        .returning({ id: schema.students.id });
      const studentId = studentRows[0]?.id;
      if (!studentId) throw new Error("converted student insert returned no id");
      const date = joinedOn ?? kolkataDate();
      const admissionNo = `KDS-${date.slice(0, 4)}-${pad(studentId)}`;
      await tx.update(schema.students).set({ admissionNo }).where(eq(schema.students.id, studentId));

      /* Applications taken since 2026-08-30 always carry a guardian phone;
         older ones may not, so the row is written only when one exists rather
         than blocking a conversion staff need to complete. */
      if (app.guardianPhone) {
        await tx.insert(schema.guardians).values({
          studentId,
          applicationId,
          name: app.guardianName ?? "Parent / guardian",
          phone: app.guardianPhone,
          relation: app.guardianRelation ?? "Guardian"
        });
      }

      const agreement = await agreementForBatch(tx, batchId, date);
      const enrollmentRows = await tx
        .insert(schema.enrollments)
        .values({ studentId, batchId, status: "active", joinedOn: date, ...agreement })
        .returning({ id: schema.enrollments.id });
      const enrollmentId = enrollmentRows[0]?.id;
      if (!enrollmentId) throw new Error("converted enrollment insert returned no id");

      const converted = await tx
        .update(schema.applications)
        .set({ status: "enrolled", nextFollowUp: null, closureReason: null, updatedAt: new Date() })
        .where(and(eq(schema.applications.id, applicationId), ne(schema.applications.status, "enrolled")))
        .returning({ id: schema.applications.id });
      if (!converted[0]) throw new AlreadyConvertedError();

      if (seat[0].status === "open" && seat[0].seatsTaken >= seat[0].seats) {
        await tx.update(schema.batches).set({ status: "full" }).where(eq(schema.batches.id, batchId));
      }

      await tx.insert(schema.auditLogs).values([
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.applicationConverted,
          entity: "application",
          entityId: applicationId,
          oldValue: { status: app.status },
          newValue: { status: "enrolled", studentId, enrollmentId, admissionNo },
          reason: "enquiry converted to student"
        }),
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.studentCreated,
          entity: "student",
          entityId: studentId,
          newValue: { admissionNo, sourceApplication: app.reference },
          reason: "created from admissions enquiry"
        }),
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.enrollmentCreated,
          entity: "enrollment",
          entityId: enrollmentId,
          newValue: { studentId, batchId, status: "active", ...agreementAuditValues(agreement) },
          reason: "enquiry conversion enrollment"
        })
      ]);
    });
  } catch (error) {
    if (error instanceof SeatUnavailableError) return errorState("seat");
    if (error instanceof AlreadyConvertedError) return errorState("alreadyConverted");
    return mapDbError(error, "[students] convert application");
  }

  revalidateStudentPaths();
  revalidatePath("/admin/admissions");
  return successState("converted");
}

export async function updateStudentAction(
  _prev: StudentsState,
  formData: FormData
): Promise<StudentsState> {
  const auth = await authorizeAction({ permission: "students.manage" });
  if (!auth.ok) return errorState("denied");
  const studentId = positiveId(formData.get("studentId"));
  const parsed = validateStudentInput(formObject(formData));
  if (!studentId || !parsed.ok) return errorState("invalid");
  const db = getDb();
  if (!db) return errorState("generic");

  try {
    const before = await db
      .select({
        fullName: schema.students.fullName,
        phone: schema.students.phone,
        whatsapp: schema.students.whatsapp,
        email: schema.students.email,
        area: schema.students.area,
        languagePref: schema.students.languagePref,
        isMinor: schema.students.isMinor,
        fatherName: schema.students.fatherName,
        referenceName: schema.students.referenceName,
        referencePhone: schema.students.referencePhone,
        photoConsent: schema.students.photoConsent,
        photoConsentAt: schema.students.photoConsentAt,
        notes: schema.students.notes
      })
      .from(schema.students)
      .where(eq(schema.students.id, studentId))
      .limit(1);
    if (!before[0]) return errorState("missing");
    const d = parsed.value;

    await db.transaction(async (tx) => {
      const next = {
        fullName: d.fullName,
        phone: d.phone,
        whatsapp: d.whatsapp,
        email: d.email,
        area: d.area,
        languagePref: d.languagePref,
        isMinor: d.isMinor,
        fatherName: d.fatherName,
        referenceName: d.referenceName,
        referencePhone: d.referencePhone,
        photoConsent: d.photoConsent,
        photoConsentAt: d.photoConsent && !before[0].photoConsent ? new Date() : before[0].photoConsentAt,
        notes: d.notes
      };
      await tx.update(schema.students).set(next).where(eq(schema.students.id, studentId));

      if (d.guardianPhone) {
        const existing = await tx
          .select({ id: schema.guardians.id })
          .from(schema.guardians)
          .where(eq(schema.guardians.studentId, studentId))
          .limit(1);
        if (existing[0]) {
          await tx.update(schema.guardians).set({ name: d.guardianName ?? "Parent / guardian", phone: d.guardianPhone, relation: d.guardianRelation }).where(eq(schema.guardians.id, existing[0].id));
        } else {
          await tx.insert(schema.guardians).values({ studentId, name: d.guardianName ?? "Parent / guardian", phone: d.guardianPhone, relation: d.guardianRelation });
        }
      }

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: STUDENT_AUDIT_ACTIONS.studentUpdated,
          entity: "student",
          entityId: studentId,
          oldValue: before[0],
          newValue: next,
          reason: "student profile updated"
        })
      );
    });
  } catch (error) {
    return mapDbError(error, "[students] update student");
  }

  revalidateStudentPaths();
  return successState("studentUpdated");
}

export async function addEnrollmentAction(
  _prev: StudentsState,
  formData: FormData
): Promise<StudentsState> {
  const auth = await authorizeAction({ permission: "students.manage" });
  if (!auth.ok) return errorState("denied");
  const parsed = validateEnrollmentCreate(formObject(formData));
  if (!parsed.ok) return errorState("invalid");
  const db = getDb();
  if (!db) return errorState("generic");

  try {
    const d = parsed.value;
    await db.transaction(async (tx) => {
      const student = await tx.select({ id: schema.students.id }).from(schema.students).where(eq(schema.students.id, d.studentId)).limit(1);
      if (!student[0]) throw new MissingError();
      const seat = await tx
        .update(schema.batches)
        .set({ seatsTaken: sql`${schema.batches.seatsTaken} + 1` })
        .where(and(eq(schema.batches.id, d.batchId), lt(schema.batches.seatsTaken, schema.batches.seats), inArray(schema.batches.status, ["open", "started"])))
        .returning({ id: schema.batches.id, seats: schema.batches.seats, seatsTaken: schema.batches.seatsTaken, status: schema.batches.status });
      if (!seat[0]) throw new SeatUnavailableError();
      const joinDate = d.joinedOn ?? kolkataDate();
      const agreement = await agreementForBatch(tx, d.batchId, joinDate);
      const rows = await tx
        .insert(schema.enrollments)
        .values({ studentId: d.studentId, batchId: d.batchId, status: "active", joinedOn: joinDate, ...agreement })
        .returning({ id: schema.enrollments.id });
      const enrollmentId = rows[0]?.id;
      if (!enrollmentId) throw new Error("enrollment insert returned no id");
      if (seat[0].status === "open" && seat[0].seatsTaken >= seat[0].seats) {
        await tx.update(schema.batches).set({ status: "full" }).where(eq(schema.batches.id, d.batchId));
      }
      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: STUDENT_AUDIT_ACTIONS.enrollmentCreated,
        entity: "enrollment",
        entityId: enrollmentId,
        newValue: { studentId: d.studentId, batchId: d.batchId, status: "active", ...agreementAuditValues(agreement) },
        reason: "additional enrollment"
      }));
    });
  } catch (error) {
    if (error instanceof SeatUnavailableError) return errorState("seat");
    if (error instanceof MissingError) return errorState("missing");
    return mapDbError(error, "[students] add enrollment");
  }

  revalidateStudentPaths();
  return successState("enrolled");
}

export async function updateEnrollmentAction(
  _prev: StudentsState,
  formData: FormData
): Promise<StudentsState> {
  const auth = await authorizeAction({ permission: "students.manage" });
  if (!auth.ok) return errorState("denied");
  const parsed = validateEnrollmentStatus(formObject(formData));
  if (!parsed.ok) return errorState("invalid");
  const db = getDb();
  if (!db) return errorState("generic");

  try {
    const d = parsed.value;
    await db.transaction(async (tx) => {
      const rows = await tx
        .select({ id: schema.enrollments.id, studentId: schema.enrollments.studentId, batchId: schema.enrollments.batchId, status: schema.enrollments.status, completedOn: schema.enrollments.completedOn })
        .from(schema.enrollments)
        .where(eq(schema.enrollments.id, d.enrollmentId))
        .limit(1);
      const before = rows[0];
      if (!before) throw new MissingError();

      const beforeOccupies = occupiesSeat(before.status as EnrollmentStatus);
      const afterOccupies = occupiesSeat(d.status);
      if (!beforeOccupies && afterOccupies) {
        const seat = await tx
          .update(schema.batches)
          .set({ seatsTaken: sql`${schema.batches.seatsTaken} + 1` })
          .where(and(eq(schema.batches.id, before.batchId), lt(schema.batches.seatsTaken, schema.batches.seats), inArray(schema.batches.status, ["open", "started"])))
          .returning({ seats: schema.batches.seats, seatsTaken: schema.batches.seatsTaken, status: schema.batches.status });
        if (!seat[0]) throw new SeatUnavailableError();
        if (seat[0].status === "open" && seat[0].seatsTaken >= seat[0].seats) {
          await tx.update(schema.batches).set({ status: "full" }).where(eq(schema.batches.id, before.batchId));
        }
      } else if (beforeOccupies && !afterOccupies) {
        await tx
          .update(schema.batches)
          .set({ seatsTaken: sql`greatest(${schema.batches.seatsTaken} - 1, 0)` })
          .where(eq(schema.batches.id, before.batchId));
        await tx
          .update(schema.batches)
          .set({ status: "open" })
          .where(and(eq(schema.batches.id, before.batchId), eq(schema.batches.status, "full")));
      }

      const next = { status: d.status, completedOn: d.completedOn };
      await tx.update(schema.enrollments).set(next).where(eq(schema.enrollments.id, d.enrollmentId));
      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: STUDENT_AUDIT_ACTIONS.enrollmentUpdated,
        entity: "enrollment",
        entityId: d.enrollmentId,
        oldValue: { status: before.status, completedOn: before.completedOn },
        newValue: next,
        reason: "enrollment status updated"
      }));
    });
  } catch (error) {
    if (error instanceof SeatUnavailableError) return errorState("seat");
    if (error instanceof MissingError) return errorState("missing");
    return mapDbError(error, "[students] update enrollment");
  }

  revalidateStudentPaths();
  return successState("enrollmentUpdated");
}

function formSnapshot(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") result[key] = value;
  result.isMinor = formData.has("isMinor") ? "on" : "";
  result.photoConsent = formData.has("photoConsent") ? "on" : "";
  return result;
}

function formObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) result[key] = value;
  return result;
}

function revalidateStudentPaths() {
  revalidatePath("/admin/students");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/batches");
  revalidatePath("/admin");
}

class SeatUnavailableError extends Error {}
class AlreadyConvertedError extends Error {}
class MissingError extends Error {}
