"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, CERTIFICATE_AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  attendancePercent,
  certificateDate,
  certificateEligible,
  certificateGrade,
  certificateReason,
  positiveCertificateId
} from "@/lib/admin/certificates";
import { pad } from "@/lib/utils";

export type CertificateState = {
  status: "idle" | "success" | "error";
  message: null | "issued" | "revoked" | "denied" | "invalid" | "missing" | "ineligible" | "duplicate" | "generic";
};

const ok = (message: CertificateState["message"]): CertificateState => ({ status: "success", message });
const fail = (message: CertificateState["message"]): CertificateState => ({ status: "error", message });

export async function issueCertificateAction(_prev: CertificateState, formData: FormData): Promise<CertificateState> {
  const auth = await authorizeAction({ permission: "certificates.manage" });
  if (!auth.ok) return fail("denied");
  const enrollmentId = positiveCertificateId(formData.get("enrollmentId"));
  const issuedOn = certificateDate(formData.get("issuedOn"));
  const grade = certificateGrade(formData.get("grade"));
  if (!enrollmentId || !issuedOn) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const enrollment = await db.select({
      id: schema.enrollments.id,
      status: schema.enrollments.status,
      studentId: schema.enrollments.studentId,
      batchId: schema.enrollments.batchId,
      studentName: schema.students.fullName,
      courseName: schema.courses.nameEn
    }).from(schema.enrollments)
      .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
      .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .where(eq(schema.enrollments.id, enrollmentId)).limit(1);
    const item = enrollment[0];
    if (!item) return fail("missing");

    const attendance = await db.select({ status: schema.attendanceRecords.status })
      .from(schema.attendanceRecords)
      .innerJoin(schema.attendanceSessions, eq(schema.attendanceRecords.sessionId, schema.attendanceSessions.id))
      .where(and(eq(schema.attendanceRecords.studentId, item.studentId), eq(schema.attendanceSessions.batchId, item.batchId)));
    const present = attendance.filter((row) => row.status === "present" || row.status === "late").length;
    const rate = attendancePercent(attendance.length, present);
    if (!certificateEligible(item.status, rate)) return fail("ineligible");

    const existing = await db.select({ id: schema.certificates.id, status: schema.certificates.status })
      .from(schema.certificates).where(eq(schema.certificates.enrollmentId, enrollmentId));
    if (existing.some((cert) => cert.status === "issued")) return fail("duplicate");
    const reissue = existing.some((cert) => cert.status === "revoked");

    await db.transaction(async (tx) => {
      const placeholder = `KDS-CP-${crypto.randomUUID().slice(0, 12)}`;
      const rows = await tx.insert(schema.certificates).values({
        certNo: placeholder,
        enrollmentId,
        studentName: item.studentName,
        courseName: item.courseName,
        issuedOn,
        grade,
        status: "issued"
      }).returning({ id: schema.certificates.id });
      const id = rows[0]?.id;
      if (!id) throw new Error("certificate insert returned no id");
      const certNo = `KDS-C-${pad(id)}`;
      await tx.update(schema.certificates).set({ certNo }).where(eq(schema.certificates.id, id));
      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: reissue ? CERTIFICATE_AUDIT_ACTIONS.reissued : CERTIFICATE_AUDIT_ACTIONS.issued,
        entity: "certificate",
        entityId: id,
        newValue: { certNo, enrollmentId, issuedOn, grade, attendancePercent: rate },
        reason: reissue ? "replacement certificate issued" : "certificate issued"
      }));
    });
  } catch (error) {
    console.error("[certificates] issue failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/admin/students");
  return ok("issued");
}

export async function revokeCertificateAction(_prev: CertificateState, formData: FormData): Promise<CertificateState> {
  const auth = await authorizeAction({ permission: "certificates.manage" });
  if (!auth.ok) return fail("denied");
  const certificateId = positiveCertificateId(formData.get("certificateId"));
  const reason = certificateReason(formData.get("reason"));
  if (!certificateId || !reason) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const before = await db.select({ id: schema.certificates.id, certNo: schema.certificates.certNo, status: schema.certificates.status })
      .from(schema.certificates).where(eq(schema.certificates.id, certificateId)).limit(1);
    if (!before[0]) return fail("missing");
    if (before[0].status === "revoked") return ok("revoked");
    await db.transaction(async (tx) => {
      await tx.update(schema.certificates).set({ status: "revoked" }).where(eq(schema.certificates.id, certificateId));
      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: CERTIFICATE_AUDIT_ACTIONS.revoked,
        entity: "certificate",
        entityId: certificateId,
        oldValue: { status: before[0].status },
        newValue: { status: "revoked", certNo: before[0].certNo },
        reason
      }));
    });
  } catch (error) {
    console.error("[certificates] revoke failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/admin/students");
  return ok("revoked");
}
