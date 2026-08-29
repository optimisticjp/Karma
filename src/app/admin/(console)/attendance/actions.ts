"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { ATTENDANCE_AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";
import {
  attendanceNote,
  correctionReason,
  dateInsideBatch,
  isAttendanceStatus,
  positiveAttendanceId,
  sessionIsLocked,
  validIsoDate
} from "@/lib/admin/attendance";

export type AttendanceState = {
  status: "idle" | "success" | "error";
  message: null | "saved" | "locked" | "denied" | "invalid" | "missing" | "outsideBatch" | "generic";
};

const ok = (message: AttendanceState["message"]): AttendanceState => ({ status: "success", message });
const fail = (message: AttendanceState["message"]): AttendanceState => ({ status: "error", message });

export async function saveAttendanceAction(_prev: AttendanceState, formData: FormData): Promise<AttendanceState> {
  const auth = await authorizeAction({ permission: "attendance.manage" });
  if (!auth.ok) return fail("denied");
  const batchId = positiveAttendanceId(formData.get("batchId"));
  const sessionDate = validIsoDate(formData.get("sessionDate"));
  if (!batchId || !sessionDate) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const batch = await db.select({ id: schema.batches.id, startDate: schema.batches.startDate, endDate: schema.batches.endDate })
      .from(schema.batches).where(eq(schema.batches.id, batchId)).limit(1);
    if (!batch[0]) return fail("missing");
    if (!dateInsideBatch(sessionDate, batch[0].startDate, batch[0].endDate)) return fail("outsideBatch");

    const roster = await db.select({ studentId: schema.enrollments.studentId })
      .from(schema.enrollments)
      .where(and(eq(schema.enrollments.batchId, batchId), inArray(schema.enrollments.status, ["active", "applied"])));
    const allowed = new Set(roster.map((r) => r.studentId));
    const marks = [...allowed].flatMap((studentId) => {
      const raw = formData.get(`status:${studentId}`);
      if (!isAttendanceStatus(raw)) return [];
      return [{ studentId, status: raw, note: attendanceNote(formData.get(`note:${studentId}`)) }];
    });
    if (marks.length === 0 && allowed.size > 0) return fail("invalid");

    await db.transaction(async (tx) => {
      let sessionRows = await tx.select({ id: schema.attendanceSessions.id, createdAt: schema.attendanceSessions.createdAt, lockedAt: schema.attendanceSessions.lockedAt })
        .from(schema.attendanceSessions)
        .where(and(eq(schema.attendanceSessions.batchId, batchId), eq(schema.attendanceSessions.sessionDate, sessionDate)))
        .limit(1);
      if (!sessionRows[0]) {
        const inserted = await tx.insert(schema.attendanceSessions).values({ batchId, sessionDate, openedBy: auth.session.staff.id })
          .returning({ id: schema.attendanceSessions.id, createdAt: schema.attendanceSessions.createdAt, lockedAt: schema.attendanceSessions.lockedAt });
        sessionRows = inserted;
      }
      const session = sessionRows[0];
      if (!session) throw new Error("attendance session missing after insert");
      const locked = sessionIsLocked(session.createdAt, session.lockedAt);
      if (locked && !session.lockedAt) {
        await tx.update(schema.attendanceSessions).set({ lockedAt: new Date() }).where(eq(schema.attendanceSessions.id, session.id));
      }
      const reason = correctionReason(formData.get("correctionReason"));

      const existing = await tx.select({ id: schema.attendanceRecords.id, studentId: schema.attendanceRecords.studentId, status: schema.attendanceRecords.status })
        .from(schema.attendanceRecords).where(eq(schema.attendanceRecords.sessionId, session.id));
      const byStudent = new Map(existing.map((row) => [row.studentId, row]));
      const counts: Record<string, number> = { present: 0, absent: 0, late: 0, excused: 0 };
      let corrections = 0;

      for (const mark of marks) {
        counts[mark.status]++;
        const old = byStudent.get(mark.studentId);
        if (!old) {
          if (locked) continue;
          await tx.insert(schema.attendanceRecords).values({
            sessionId: session.id,
            studentId: mark.studentId,
            status: mark.status,
            note: mark.note,
            method: "manual",
            markedBy: auth.session.staff.id
          });
          continue;
        }
        if (old.status === mark.status) {
          await tx.update(schema.attendanceRecords).set({ note: mark.note, markedBy: auth.session.staff.id, markedAt: new Date() }).where(eq(schema.attendanceRecords.id, old.id));
          continue;
        }
        if (locked) {
          if (!reason) throw new LockedCorrectionError();
          await tx.insert(schema.attendanceCorrections).values({
            recordId: old.id,
            oldStatus: old.status,
            newStatus: mark.status,
            reason,
            requestedBy: auth.session.staff.id,
            approvedBy: auth.session.staff.id
          });
          await tx.insert(schema.auditLogs).values(auditValues({
            actor: String(auth.session.staff.id),
            action: ATTENDANCE_AUDIT_ACTIONS.correctionApplied,
            entity: "attendance_record",
            entityId: old.id,
            oldValue: { status: old.status },
            newValue: { status: mark.status },
            reason
          }));
          corrections++;
        }
        await tx.update(schema.attendanceRecords).set({ status: mark.status, note: mark.note, markedBy: auth.session.staff.id, markedAt: new Date() }).where(eq(schema.attendanceRecords.id, old.id));
      }

      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: ATTENDANCE_AUDIT_ACTIONS.registerSaved,
        entity: "attendance_session",
        entityId: session.id,
        newValue: { batchId, sessionDate, marked: marks.length, counts, corrections, locked },
        reason: locked ? "locked register saved with corrections" : "attendance register saved"
      }));
    });
  } catch (error) {
    if (error instanceof LockedCorrectionError) return fail("locked");
    console.error("[attendance] save failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  return ok("saved");
}

export async function lockAttendanceAction(_prev: AttendanceState, formData: FormData): Promise<AttendanceState> {
  const auth = await authorizeAction({ permission: "attendance.manage" });
  if (!auth.ok) return fail("denied");
  const sessionId = positiveAttendanceId(formData.get("sessionId"));
  if (!sessionId) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");
  try {
    const before = await db.select({ id: schema.attendanceSessions.id, lockedAt: schema.attendanceSessions.lockedAt }).from(schema.attendanceSessions).where(eq(schema.attendanceSessions.id, sessionId)).limit(1);
    if (!before[0]) return fail("missing");
    if (!before[0].lockedAt) {
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.update(schema.attendanceSessions).set({ lockedAt: now }).where(eq(schema.attendanceSessions.id, sessionId));
        await tx.insert(schema.auditLogs).values(auditValues({
          actor: String(auth.session.staff.id),
          action: ATTENDANCE_AUDIT_ACTIONS.sessionLocked,
          entity: "attendance_session",
          entityId: sessionId,
          oldValue: { lockedAt: null },
          newValue: { lockedAt: now.toISOString() },
          reason: "attendance register locked"
        }));
      });
    }
  } catch (error) {
    console.error("[attendance] lock failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }
  revalidatePath("/admin/attendance");
  return ok("locked");
}

class LockedCorrectionError extends Error {}
