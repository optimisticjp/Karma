import { notFound, redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { summariseFees } from "@/lib/admin/fee-status";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection, day, inr } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * One student's whole record on one sheet: who they are, who to call, every
 * enrolment with its own fee position, attendance, and any certificates.
 *
 * Fees can be on this sheet without a fees permission being implied — the join
 * is gated: someone who may see students but not fees gets the record without
 * the money.
 */
export default async function StudentSummarySheet({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/student/${raw}`);
  if (
    !hasPermission(session.staff, "students.view") &&
    !hasPermission(session.staff, "students.manage")
  ) {
    redirect("/admin/no-access?reason=permission");
  }
  const canSeeFees =
    hasPermission(session.staff, "fees.view") || hasPermission(session.staff, "fees.manage");
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const students = await db
    .select({
      id: schema.students.id,
      admissionNo: schema.students.admissionNo,
      fullName: schema.students.fullName,
      fatherName: schema.students.fatherName,
      phone: schema.students.phone,
      whatsapp: schema.students.whatsapp,
      email: schema.students.email,
      area: schema.students.area,
      languagePref: schema.students.languagePref,
      referenceName: schema.students.referenceName,
      referencePhone: schema.students.referencePhone,
      notes: schema.students.notes,
      archivedAt: schema.students.archivedAt,
      createdAt: schema.students.createdAt
    })
    .from(schema.students)
    .where(eq(schema.students.id, id))
    .limit(1);
  const student = students[0];
  if (!student) notFound();

  const [guardians, enrolments, attendance] = await Promise.all([
    db
      .select({
        name: schema.guardians.name,
        phone: schema.guardians.phone,
        relation: schema.guardians.relation
      })
      .from(schema.guardians)
      .where(eq(schema.guardians.studentId, id))
      .orderBy(asc(schema.guardians.id))
      .limit(1),
    db
      .select({
        id: schema.enrollments.id,
        status: schema.enrollments.status,
        joinedOn: schema.enrollments.joinedOn,
        completedOn: schema.enrollments.completedOn,
        agreedFeeTotal: schema.enrollments.agreedFeeTotal,
        agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
        agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
        agreedCourseName: schema.enrollments.agreedCourseName,
        batchLabel: schema.batches.label,
        courseNameEn: schema.courses.nameEn,
        courseNameGu: schema.courses.nameGu
      })
      .from(schema.enrollments)
      .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .where(eq(schema.enrollments.studentId, id))
      .orderBy(desc(schema.enrollments.createdAt)),
    db
      .select({ status: schema.attendanceRecords.status })
      .from(schema.attendanceRecords)
      .where(eq(schema.attendanceRecords.studentId, id))
  ]);

  const enrolmentIds = enrolments.map((e) => e.id);
  const [ledger, certificates] = enrolmentIds.length
    ? await Promise.all([
        canSeeFees
          ? db
              .select({
                enrollmentId: schema.feeRecords.enrollmentId,
                received: schema.feeRecords.received,
                discount: schema.feeRecords.discount,
                courseFee: schema.feeRecords.courseFee,
                dueDate: schema.feeRecords.dueDate
              })
              .from(schema.feeRecords)
              .where(inArray(schema.feeRecords.enrollmentId, enrolmentIds))
          : Promise.resolve([]),
        db
          .select({
            certNo: schema.certificates.certNo,
            courseName: schema.certificates.courseName,
            issuedOn: schema.certificates.issuedOn,
            grade: schema.certificates.grade,
            status: schema.certificates.status
          })
          .from(schema.certificates)
          .where(inArray(schema.certificates.enrollmentId, enrolmentIds))
          .orderBy(desc(schema.certificates.issuedOn))
      ])
    : [[], []];

  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const rate = attendance.length ? Math.round((present / attendance.length) * 100) : null;
  const guardian = guardians[0] ?? null;

  return (
    <PrintSheet
      title={copy.studentSummary}
      reference={`${copy.admissionNo} ${student.admissionNo}`}
      locale={locale}
      backHref={`/admin/students?student=${student.id}`}
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <SheetSection title={copy.student} columns={3}>
        <SheetField label={copy.studentName} value={student.fullName} />
        <SheetField label={copy.fatherName} value={student.fatherName} />
        <SheetField label={copy.admissionNo} value={student.admissionNo} />
        <SheetField label={copy.studentMobile} value={student.phone} />
        <SheetField label={copy.whatsapp} value={student.whatsapp} />
        <SheetField label={copy.email} value={student.email} />
        <SheetField label={copy.area} value={student.area} />
        <SheetField
          label={copy.language}
          value={student.languagePref === "gu" ? "ગુજરાતી" : "English"}
        />
        <SheetField
          label={copy.admissionDate}
          value={day(student.createdAt.toISOString().slice(0, 10), locale)}
        />
      </SheetSection>

      <SheetSection title={copy.guardian} columns={3}>
        <SheetField label={copy.guardianName} value={guardian?.name} />
        <SheetField label={copy.guardianPhone} value={guardian?.phone} />
        <SheetField label={copy.guardianRelation} value={guardian?.relation} />
      </SheetSection>

      {student.referenceName || student.referencePhone ? (
        <SheetSection title={copy.reference} columns={2}>
          <SheetField label={copy.referenceName} value={student.referenceName} />
          <SheetField label={copy.referencePhone} value={student.referencePhone} />
        </SheetSection>
      ) : null}

      <section className="sheet-section">
        <h2 className="sheet-section-title">{copy.course}</h2>
        <table className="sheet-table">
          <thead>
            <tr>
              <th>{copy.courseName}</th>
              <th>{copy.batch}</th>
              <th>{copy.joiningDate}</th>
              <th>{copy.status}</th>
              {canSeeFees ? <th style={{ textAlign: "end" }}>{copy.feeTotal}</th> : null}
              {canSeeFees ? <th style={{ textAlign: "end" }}>{copy.feeBalance}</th> : null}
            </tr>
          </thead>
          <tbody>
            {enrolments.map((enrolment) => {
              const fees = summariseFees(
                {
                  agreedFeeTotal: enrolment.agreedFeeTotal,
                  agreedAdmissionAmount: enrolment.agreedAdmissionAmount,
                  agreedBalanceDueOn: enrolment.agreedBalanceDueOn
                },
                ledger.filter((row) => row.enrollmentId === enrolment.id)
              );
              return (
                <tr key={enrolment.id}>
                  <td>
                    {enrolment.agreedCourseName ??
                      (locale === "gu" ? enrolment.courseNameGu : enrolment.courseNameEn)}
                  </td>
                  <td>{enrolment.batchLabel}</td>
                  <td>{day(enrolment.joinedOn, locale)}</td>
                  <td>{enrolment.status}</td>
                  {canSeeFees ? <td className="is-num">{inr(fees.agreed)}</td> : null}
                  {canSeeFees ? <td className="is-num">{inr(fees.balance)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <SheetSection title={copy.register} columns={3}>
        <SheetField label={copy.register} value={String(attendance.length)} />
        <SheetField label="%" value={rate == null ? "—" : `${rate}%`} />
        <SheetField label={copy.certificate} value={String(certificates.length)} />
      </SheetSection>

      {certificates.length ? (
        <section className="sheet-section">
          <h2 className="sheet-section-title">{copy.certificate}</h2>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>{copy.certificate}</th>
                <th>{copy.courseName}</th>
                <th>{copy.issuedOn}</th>
                <th>{copy.grade}</th>
                <th>{copy.status}</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.certNo}>
                  <td>{cert.certNo}</td>
                  <td>{cert.courseName}</td>
                  <td>{day(cert.issuedOn, locale)}</td>
                  <td>{cert.grade ?? "—"}</td>
                  <td>{cert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {student.notes ? (
        <section className="sheet-section">
          <h2 className="sheet-section-title">{copy.details}</h2>
          <p style={{ fontSize: "9.5pt", whiteSpace: "pre-wrap" }}>{student.notes}</p>
        </section>
      ) : null}
    </PrintSheet>
  );
}
