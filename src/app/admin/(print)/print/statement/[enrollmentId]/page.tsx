import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { summariseFees } from "@/lib/admin/fee-status";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection, day, inr, moment } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * The full fee history for one enrolment, with a running balance.
 *
 * Every entry, oldest first, so the balance column reads down the page the way
 * a person reconciles it. This is what gets handed over when a parent asks for
 * "everything we have paid".
 */
export default async function FeeStatementSheet({
  params
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/statement/${raw}`);
  if (!hasPermission(session.staff, "fees.view") && !hasPermission(session.staff, "fees.manage")) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const rows = await db
    .select({
      id: schema.enrollments.id,
      joinedOn: schema.enrollments.joinedOn,
      agreedFeeTotal: schema.enrollments.agreedFeeTotal,
      agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
      agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
      agreedCourseName: schema.enrollments.agreedCourseName,
      studentName: schema.students.fullName,
      admissionNo: schema.students.admissionNo,
      phone: schema.students.phone,
      batchLabel: schema.batches.label,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu
    })
    .from(schema.enrollments)
    .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
    .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .where(eq(schema.enrollments.id, id))
    .limit(1);
  const enrolment = rows[0];
  if (!enrolment) notFound();

  const ledger = await db
    .select({
      id: schema.feeRecords.id,
      received: schema.feeRecords.received,
      discount: schema.feeRecords.discount,
      courseFee: schema.feeRecords.courseFee,
      method: schema.feeRecords.method,
      receiptNo: schema.feeRecords.receiptNo,
      dueDate: schema.feeRecords.dueDate,
      notes: schema.feeRecords.notes,
      createdAt: schema.feeRecords.createdAt
    })
    .from(schema.feeRecords)
    .where(eq(schema.feeRecords.enrollmentId, id))
    .orderBy(asc(schema.feeRecords.createdAt));

  const agreement = {
    agreedFeeTotal: enrolment.agreedFeeTotal,
    agreedAdmissionAmount: enrolment.agreedAdmissionAmount,
    agreedBalanceDueOn: enrolment.agreedBalanceDueOn
  };
  const fees = summariseFees(agreement, ledger);

  /* The running balance is recomputed by the SAME pure function after each
     entry rather than accumulated by hand, so the column can never disagree
     with the total printed above it. */
  const lines = ledger.map((entry, index) => ({
    ...entry,
    balance: summariseFees(agreement, ledger.slice(0, index + 1)).balance
  }));

  return (
    <PrintSheet
      title={copy.feeStatement}
      reference={`${copy.admissionNo} ${enrolment.admissionNo}`}
      locale={locale}
      backHref="/admin/fees"
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <SheetSection title={copy.student} columns={3}>
        <SheetField label={copy.studentName} value={enrolment.studentName} />
        <SheetField label={copy.admissionNo} value={enrolment.admissionNo} />
        <SheetField label={copy.studentMobile} value={enrolment.phone} />
        <SheetField
          label={copy.courseName}
          value={
            enrolment.agreedCourseName ??
            (locale === "gu" ? enrolment.courseNameGu : enrolment.courseNameEn)
          }
        />
        <SheetField label={copy.batch} value={enrolment.batchLabel} />
        <SheetField label={copy.joiningDate} value={day(enrolment.joinedOn, locale)} />
      </SheetSection>

      <SheetSection title={copy.fees} columns={3}>
        <SheetField label={copy.feeTotal} value={inr(fees.agreed)} money />
        <SheetField label={copy.feeReceived} value={inr(fees.received)} money />
        <SheetField label={copy.feeBalance} value={inr(fees.balance)} money />
        <SheetField label={copy.feeAdmission} value={inr(fees.admissionExpected)} money />
        <SheetField label={copy.feeDueOn} value={day(fees.nextDueOn, locale)} />
        <SheetField label={copy.feeStatus} value={fees.status} />
      </SheetSection>

      <section className="sheet-section">
        <h2 className="sheet-section-title">{copy.feeStatement}</h2>
        {lines.length === 0 ? (
          <p className="sheet-note">{copy.noFees}</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>{copy.feeDate}</th>
                <th>{copy.receiptNo}</th>
                <th>{copy.feeMethod}</th>
                <th style={{ textAlign: "end" }}>{copy.feeReceived}</th>
                <th style={{ textAlign: "end" }}>{copy.runningBalance}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id}>
                  <td>{moment(line.createdAt, locale)}</td>
                  <td>{line.receiptNo ?? "—"}</td>
                  <td>{line.method ?? "—"}</td>
                  <td className="is-num">{inr(line.received)}</td>
                  <td className="is-num">{inr(line.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="sheet-note" style={{ marginTop: "4mm" }}>{copy.offlineNote}</p>

      <div className="sheet-signatures" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="sheet-sign">
          <div className="sheet-sign-line" />
          <p className="sheet-sign-label">{copy.studentSignature}</p>
        </div>
        <div className="sheet-sign">
          <div className="sheet-stamp">{copy.officeStamp}</div>
          <p className="sheet-sign-label">{copy.date}</p>
        </div>
      </div>
    </PrintSheet>
  );
}
