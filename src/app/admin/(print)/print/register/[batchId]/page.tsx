import { notFound, redirect } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/** How many day columns fit across a landscape A4 next to the name column. */
const DAY_COLUMNS = 26;

/**
 * A blank attendance register: the batch's students down the side, numbered day
 * columns across, ready to be marked by hand.
 *
 * Deliberately BLANK rather than a printout of recorded attendance. The console
 * already holds what was marked; what a trainer needs on paper is the sheet to
 * mark on when the tablet is on charge, and a printed record of past attendance
 * would only be transcribed back in and get out of step.
 *
 * The header row repeats on every printed page (`display: table-header-group`),
 * because a register whose column numbers are on page one only is unusable on
 * page two.
 */
export default async function AttendanceRegisterSheet({
  params
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/register/${raw}`);
  if (
    !hasPermission(session.staff, "attendance.view") &&
    !hasPermission(session.staff, "attendance.manage")
  ) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const batches = await db
    .select({
      label: schema.batches.label,
      days: schema.batches.days,
      startTime: schema.batches.startTime,
      endTime: schema.batches.endTime,
      trainerName: schema.staff.name,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .leftJoin(schema.staff, eq(schema.batches.trainerId, schema.staff.id))
    .where(eq(schema.batches.id, id))
    .limit(1);
  const batch = batches[0];
  if (!batch) notFound();

  const students = await db
    .select({
      enrollmentId: schema.enrollments.id,
      fullName: schema.students.fullName,
      admissionNo: schema.students.admissionNo
    })
    .from(schema.enrollments)
    .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
    .where(
      and(
        eq(schema.enrollments.batchId, id),
        inArray(schema.enrollments.status, ["applied", "active"])
      )
    )
    .orderBy(asc(schema.students.fullName));

  const columns = Array.from({ length: DAY_COLUMNS }, (_, i) => i + 1);

  return (
    <PrintSheet
      title={copy.register}
      reference={`${copy.registerFor} ${batch.label}`}
      locale={locale}
      landscape
      backHref={`/admin/attendance?batch=${id}`}
      backLabel={copy.back}
      printLabel={copy.print}
      footerNote={copy.attendanceNote}
    >
      <SheetSection title={copy.batch} columns={3}>
        <SheetField
          label={copy.courseName}
          value={locale === "gu" ? batch.courseNameGu : batch.courseNameEn}
        />
        <SheetField
          label={copy.batchTiming}
          value={`${batch.days} · ${batch.startTime.slice(0, 5)}–${batch.endTime.slice(0, 5)}`}
        />
        <SheetField label={copy.trainer} value={batch.trainerName} />
      </SheetSection>

      <section className="sheet-section">
        <table className="sheet-table">
          <thead>
            <tr>
              <th style={{ width: "8mm" }}>{copy.rollNo}</th>
              <th style={{ width: "48mm" }}>{copy.studentName}</th>
              {columns.map((n) => (
                <th key={n} style={{ textAlign: "center" }}>
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.enrollmentId}>
                <td className="is-num">{index + 1}</td>
                <td>
                  {student.fullName}
                  <br />
                  <span style={{ fontSize: "7.5pt", color: "#555" }}>{student.admissionNo}</span>
                </td>
                {columns.map((n) => (
                  <td key={n} className="is-tick" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sheet-note" style={{ marginTop: "2mm" }}>{copy.attendanceNote}</p>
      </section>

      <div className="sheet-signatures" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="sheet-sign">
          <div className="sheet-sign-line" />
          <p className="sheet-sign-label">{copy.trainerSignature}</p>
        </div>
        <div className="sheet-sign">
          <div className="sheet-stamp">{copy.officeStamp}</div>
          <p className="sheet-sign-label">{copy.date}</p>
        </div>
      </div>
    </PrintSheet>
  );
}
