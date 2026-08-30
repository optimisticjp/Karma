import { notFound, redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { readCourseOperations } from "@/lib/admin/course-operations";
import { summariseFees } from "@/lib/admin/fee-status";
import { CURRENT_TERMS_VERSION } from "@/content/admission-terms";
import { PrintSheet } from "@/components/admin/PrintSheet";
import {
  SheetField,
  SheetNorms,
  SheetSection,
  SheetSignatures,
  day,
  inr
} from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * The formal admission form, on A4, filled in from the student's record.
 *
 * This is the sheet a student and a parent physically sign, and it is the
 * signature artifact — there is no digital-signature capture, deliberately.
 * Everything the institute's own printed form carries is here: the student,
 * the father, the parent/guardian, the reference, the course and its duration,
 * the batch, the fee agreement with what has been received and what remains,
 * what is taught, all fifteen admission norms, the declaration, and four
 * signature lines with the office stamp.
 */
export default async function AdmissionFormSheet({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/admission/${raw}`);
  /* Reaching a print route is not permission to read what it prints. */
  if (
    !hasPermission(session.staff, "students.view") &&
    !hasPermission(session.staff, "students.manage")
  ) {
    redirect("/admin/no-access?reason=permission");
  }
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
      createdAt: schema.students.createdAt
    })
    .from(schema.students)
    .where(eq(schema.students.id, id))
    .limit(1);
  const student = students[0];
  if (!student) notFound();

  const [guardians, enrolments] = await Promise.all([
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
        joinedOn: schema.enrollments.joinedOn,
        agreedFeeTotal: schema.enrollments.agreedFeeTotal,
        agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
        agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
        agreedDurationMonths: schema.enrollments.agreedDurationMonths,
        agreedCourseName: schema.enrollments.agreedCourseName,
        termsVersion: schema.enrollments.termsVersion,
        batchLabel: schema.batches.label,
        batchDays: schema.batches.days,
        batchStart: schema.batches.startTime,
        batchEnd: schema.batches.endTime,
        courseNameEn: schema.courses.nameEn,
        courseNameGu: schema.courses.nameGu,
        courseSoftware: schema.courses.software,
        courseOperations: schema.courses.operations
      })
      .from(schema.enrollments)
      .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .where(eq(schema.enrollments.studentId, id))
      .orderBy(desc(schema.enrollments.createdAt))
      .limit(1)
  ]);

  const guardian = guardians[0] ?? null;
  const enrolment = enrolments[0] ?? null;

  /* The fee block prints what THIS student agreed to and what has actually
     been received — never today's course fee. */
  const ledger = enrolment
    ? await db
        .select({
          received: schema.feeRecords.received,
          discount: schema.feeRecords.discount,
          courseFee: schema.feeRecords.courseFee,
          dueDate: schema.feeRecords.dueDate
        })
        .from(schema.feeRecords)
        .where(eq(schema.feeRecords.enrollmentId, enrolment.id))
    : [];

  const fees = enrolment
    ? summariseFees(
        {
          agreedFeeTotal: enrolment.agreedFeeTotal,
          agreedAdmissionAmount: enrolment.agreedAdmissionAmount,
          agreedBalanceDueOn: enrolment.agreedBalanceDueOn
        },
        ledger
      )
    : null;

  const operations = readCourseOperations(enrolment?.courseOperations ?? null);
  const courseName = enrolment
    ? enrolment.agreedCourseName ??
      (locale === "gu" ? enrolment.courseNameGu : enrolment.courseNameEn)
    : null;
  const termsVersion = enrolment?.termsVersion ?? CURRENT_TERMS_VERSION;

  return (
    <PrintSheet
      title={copy.admissionForm}
      reference={`${copy.admissionNo} ${student.admissionNo}`}
      locale={locale}
      backHref={`/admin/students?student=${student.id}`}
      backLabel={copy.back}
      printLabel={copy.print}
      footerNote={`${copy.norms} v${termsVersion}`}
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
        <SheetField label={copy.admissionDate} value={day(
          student.createdAt.toISOString().slice(0, 10),
          locale
        )} />
      </SheetSection>

      <SheetSection title={copy.guardian} columns={3}>
        <SheetField label={copy.guardianName} value={guardian?.name} />
        <SheetField label={copy.guardianPhone} value={guardian?.phone} />
        <SheetField label={copy.guardianRelation} value={guardian?.relation} />
      </SheetSection>

      <SheetSection title={copy.reference} columns={2}>
        <SheetField label={copy.referenceName} value={student.referenceName} />
        <SheetField label={copy.referencePhone} value={student.referencePhone} />
      </SheetSection>

      <SheetSection title={copy.course} columns={3}>
        <SheetField label={copy.courseName} value={courseName} />
        <SheetField
          label={copy.duration}
          value={
            enrolment?.agreedDurationMonths
              ? `${enrolment.agreedDurationMonths} ${copy.months}`
              : null
          }
        />
        <SheetField label={copy.software} value={enrolment?.courseSoftware} />
        <SheetField label={copy.batch} value={enrolment?.batchLabel} />
        <SheetField
          label={copy.batchTiming}
          value={
            enrolment
              ? `${enrolment.batchDays} · ${enrolment.batchStart.slice(0, 5)}–${enrolment.batchEnd.slice(0, 5)}`
              : null
          }
        />
        <SheetField label={copy.joiningDate} value={day(enrolment?.joinedOn, locale)} />
      </SheetSection>

      <SheetSection title={copy.fees} columns={3}>
        <SheetField label={copy.feeTotal} value={fees ? inr(fees.agreed) : null} money />
        <SheetField label={copy.feeReceived} value={fees ? inr(fees.received) : null} money />
        <SheetField label={copy.feeBalance} value={fees ? inr(fees.balance) : null} money />
        <SheetField label={copy.feeAdmission} value={fees ? inr(fees.admissionExpected) : null} money />
        <SheetField label={copy.feeDueOn} value={day(fees?.nextDueOn, locale)} />
        <SheetField label={copy.receiptNo} value={null} />
      </SheetSection>
      <p className="sheet-note">{copy.offlineNote}</p>

      {operations.curriculum.length ? (
        <section className="sheet-section sheet-keep">
          <h2 className="sheet-section-title">{copy.whatWeTeach}</h2>
          <p style={{ fontSize: "9.5pt" }}>
            {operations.curriculum.map((item) => (locale === "gu" ? item.gu : item.en)).join(" · ")}
          </p>
          {operations.practical.length ? (
            <>
              <p className="sheet-label" style={{ marginTop: "2.5mm" }}>{copy.practical}</p>
              <p style={{ fontSize: "9.5pt" }}>
                {operations.practical
                  .map((item) => (locale === "gu" ? item.gu : item.en))
                  .join(" · ")}
              </p>
            </>
          ) : null}
        </section>
      ) : null}

      <SheetNorms version={termsVersion} locale={locale} copy={copy} />
      <SheetSignatures copy={copy} />
    </PrintSheet>
  );
}
