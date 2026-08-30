import { redirect } from "next/navigation";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import { attendanceCopy } from "@/lib/admin/attendance-copy";
import { isAttendanceStatus, positiveAttendanceId, sessionIsLocked, validIsoDate } from "@/lib/admin/attendance";
import { AttendanceRegister } from "./AttendanceForm";

type Props = { searchParams: Promise<{ batch?: string; date?: string }> };

export default async function AttendancePage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/attendance");
  const canView = hasPermission(session.staff, "attendance.view") || hasPermission(session.staff, "attendance.manage");
  const canManage = hasPermission(session.staff, "attendance.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = attendanceCopy(session.staff.adminLocale);
  const sheets = printCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) return <div className="max-w-[76rem]"><Heading title={copy.title} lede={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const params = await searchParams;
  const today = kolkataDate();
  const date = validIsoDate(params.date) ?? today;
  const batches = await db.select({
    id: schema.batches.id,
    label: schema.batches.label,
    startDate: schema.batches.startDate,
    endDate: schema.batches.endDate,
    status: schema.batches.status,
    courseNameEn: schema.courses.nameEn,
    courseNameGu: schema.courses.nameGu
  }).from(schema.batches)
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    /* An archived course or batch is out of every operational picker.
       Archiving means "not in play", and a register cannot be opened for
       something that is not being taught. */
    .where(
      and(
        eq(schema.courses.active, true),
        isNull(schema.courses.archivedAt),
        isNull(schema.batches.archivedAt)
      )
    )
    .orderBy(asc(schema.courses.sortOrder), asc(schema.batches.startDate), asc(schema.batches.startTime));

  const requestedBatch = positiveAttendanceId(params.batch);
  const selectedBatchId = requestedBatch && batches.some((b) => b.id === requestedBatch) ? requestedBatch : null;
  const selectedBatch = selectedBatchId ? batches.find((b) => b.id === selectedBatchId) ?? null : null;

  let roster: Array<{ studentId: number; admissionNo: string; fullName: string; status: "present" | "absent" | "late" | "excused" | null; note: string | null }> = [];
  let sessionId: number | null = null;
  let locked = false;
  if (selectedBatchId) {
    const [enrolled, sessions] = await Promise.all([
      db.select({ studentId: schema.students.id, admissionNo: schema.students.admissionNo, fullName: schema.students.fullName })
        .from(schema.enrollments)
        .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
        .where(and(eq(schema.enrollments.batchId, selectedBatchId), inArray(schema.enrollments.status, ["active", "applied"])))
        .orderBy(asc(schema.students.fullName)),
      db.select({ id: schema.attendanceSessions.id, createdAt: schema.attendanceSessions.createdAt, lockedAt: schema.attendanceSessions.lockedAt })
        .from(schema.attendanceSessions)
        .where(and(eq(schema.attendanceSessions.batchId, selectedBatchId), eq(schema.attendanceSessions.sessionDate, date)))
        .limit(1)
    ]);
    const attendanceSession = sessions[0] ?? null;
    sessionId = attendanceSession?.id ?? null;
    locked = attendanceSession ? sessionIsLocked(attendanceSession.createdAt, attendanceSession.lockedAt) : false;
    const records = attendanceSession
      ? await db.select({ studentId: schema.attendanceRecords.studentId, status: schema.attendanceRecords.status, note: schema.attendanceRecords.note })
          .from(schema.attendanceRecords).where(eq(schema.attendanceRecords.sessionId, attendanceSession.id))
      : [];
    const byStudent = new Map(records.map((record) => [record.studentId, record]));
    roster = enrolled.map((student) => {
      const record = byStudent.get(student.studentId);
      return {
        ...student,
        status: record && isAttendanceStatus(record.status) ? record.status : null,
        note: record?.note ?? null
      };
    });
  }

  return (
    <div className="max-w-[76rem]">
      <Heading title={copy.title} lede={copy.lede} />
      <form method="get" className="panel panel-body mt-8 grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-end">
        <Field label={copy.batch} htmlFor="attendance-batch">
          <select id="attendance-batch" name="batch" className="input" defaultValue={selectedBatchId ? String(selectedBatchId) : ""} required>
            <option value="" disabled>{copy.chooseBatch}</option>
            {batches.map((batch) => <option key={batch.id} value={batch.id}>{session.staff.adminLocale === "gu" ? batch.courseNameGu : batch.courseNameEn} · {batch.label}</option>)}
          </select>
        </Field>
        <Field label={copy.date} htmlFor="attendance-date"><input id="attendance-date" name="date" className="input" type="date" defaultValue={date} required /></Field>
        <button className="btn btn-primary" type="submit">{copy.openRegister}</button>
      </form>

      {!selectedBatch ? <p className="empty-state mt-8">{copy.noBatch}</p> : (
        <section className="panel mt-8">
          <div className="panel-head flex-wrap gap-3">
            <div><p className="microlabel">{formatDate(date, session.staff.adminLocale)}</p><h2 className="text-h3 mt-1">{session.staff.adminLocale === "gu" ? selectedBatch.courseNameGu : selectedBatch.courseNameEn}</h2><p className="form-note mt-1">{selectedBatch.label}</p><p className="mt-2"><PrintLink href={`/admin/print/register/${selectedBatch.id}`} label={sheets.register} compact /></p></div>
            {locked ? <span className="status status-pending">{copy.locked}</span> : <span className="status status-active">{copy.roster}</span>}
          </div>
          <div className="panel-body border-t border-rule">
            <AttendanceRegister batchId={selectedBatch.id} sessionDate={date} sessionId={sessionId} locked={locked} rows={roster} canManage={canManage} copy={copy} />
          </div>
        </section>
      )}
    </div>
  );
}

function Heading({ title, lede }: { title: string; lede: string }) { return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>; }
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
function kolkataDate() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00+05:30`)); }
