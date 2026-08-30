import { notFound, redirect } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection, day } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * The people in a batch, on one landscape sheet: name, admission number, the
 * number to call, the guardian's number, and the date they joined.
 *
 * Landscape because it is columns, and because a portrait roster wraps a
 * guardian's number onto a second line and doubles the page count.
 *
 * Only enrolments that occupy a seat are listed — a dropped student on a
 * roster is a person the trainer will look for and not find.
 */
export default async function BatchRosterSheet({
  params
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/roster/${raw}`);
  if (
    !hasPermission(session.staff, "students.view") &&
    !hasPermission(session.staff, "students.manage") &&
    !hasPermission(session.staff, "batches.view") &&
    !hasPermission(session.staff, "batches.manage")
  ) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const batches = await db
    .select({
      id: schema.batches.id,
      label: schema.batches.label,
      days: schema.batches.days,
      startTime: schema.batches.startTime,
      endTime: schema.batches.endTime,
      startDate: schema.batches.startDate,
      seats: schema.batches.seats,
      seatsTaken: schema.batches.seatsTaken,
      status: schema.batches.status,
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
      joinedOn: schema.enrollments.joinedOn,
      fullName: schema.students.fullName,
      admissionNo: schema.students.admissionNo,
      phone: schema.students.phone,
      studentId: schema.students.id
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

  /* One query for every guardian in the batch, not one per student. */
  const guardianRows = students.length
    ? await db
        .select({ studentId: schema.guardians.studentId, phone: schema.guardians.phone })
        .from(schema.guardians)
        .where(inArray(schema.guardians.studentId, students.map((s) => s.studentId)))
    : [];
  const guardianByStudent = new Map(guardianRows.map((g) => [g.studentId, g.phone]));

  return (
    <PrintSheet
      title={copy.roster}
      reference={batch.label}
      locale={locale}
      landscape
      backHref="/admin/courses"
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <SheetSection title={copy.batch} columns={3}>
        <SheetField
          label={copy.courseName}
          value={locale === "gu" ? batch.courseNameGu : batch.courseNameEn}
        />
        <SheetField label={copy.batch} value={batch.label} />
        <SheetField
          label={copy.batchTiming}
          value={`${batch.days} · ${batch.startTime.slice(0, 5)}–${batch.endTime.slice(0, 5)}`}
        />
        <SheetField label={copy.trainer} value={batch.trainerName} />
        <SheetField label={copy.seats} value={`${batch.seatsTaken} / ${batch.seats}`} />
        <SheetField label={copy.joiningDate} value={day(batch.startDate, locale)} />
      </SheetSection>

      <section className="sheet-section">
        <table className="sheet-table">
          <thead>
            <tr>
              <th style={{ width: "10mm" }}>{copy.rollNo}</th>
              <th>{copy.studentName}</th>
              <th>{copy.admissionNo}</th>
              <th>{copy.studentMobile}</th>
              <th>{copy.guardianPhone}</th>
              <th>{copy.joiningDate}</th>
              <th style={{ width: "40mm" }}>{copy.signature}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.enrollmentId}>
                <td className="is-num">{index + 1}</td>
                <td>{student.fullName}</td>
                <td>{student.admissionNo}</td>
                <td>{student.phone}</td>
                <td>{guardianByStudent.get(student.studentId) ?? "—"}</td>
                <td>{day(student.joinedOn, locale)}</td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
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
