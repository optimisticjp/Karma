import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { printCopy } from "@/lib/admin/print-copy";
import { summariseFees } from "@/lib/admin/fee-status";
import { PrintSheet } from "@/components/admin/PrintSheet";
import { SheetField, SheetSection, day, inr, moment } from "@/components/admin/SheetParts";

export const dynamic = "force-dynamic";

/**
 * A receipt for one payment.
 *
 * It states the payment, and then the position it leaves the student in —
 * agreed total, received to date, balance and when the balance falls due —
 * because "what do I still owe?" is the question actually being asked at the
 * counter, and a receipt that answers only "you paid ₹25,000" invites the
 * follow-up call this sheet exists to prevent.
 */
export default async function FeeReceiptSheet({
  params
}: {
  params: Promise<{ feeId: string }>;
}) {
  const { feeId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireAdmin(`/admin/print/receipt/${raw}`);
  if (!hasPermission(session.staff, "fees.view") && !hasPermission(session.staff, "fees.manage")) {
    redirect("/admin/no-access?reason=permission");
  }
  const locale = session.staff.adminLocale;
  const copy = printCopy(locale);

  const db = getDb();
  if (!db) notFound();

  const rows = await db
    .select({
      id: schema.feeRecords.id,
      enrollmentId: schema.feeRecords.enrollmentId,
      received: schema.feeRecords.received,
      method: schema.feeRecords.method,
      receiptNo: schema.feeRecords.receiptNo,
      notes: schema.feeRecords.notes,
      createdAt: schema.feeRecords.createdAt,
      studentName: schema.students.fullName,
      admissionNo: schema.students.admissionNo,
      phone: schema.students.phone,
      batchLabel: schema.batches.label,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu,
      agreedFeeTotal: schema.enrollments.agreedFeeTotal,
      agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
      agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn
    })
    .from(schema.feeRecords)
    .innerJoin(schema.enrollments, eq(schema.feeRecords.enrollmentId, schema.enrollments.id))
    .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
    .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .where(eq(schema.feeRecords.id, id))
    .limit(1);
  const entry = rows[0];
  if (!entry) notFound();

  const ledger = await db
    .select({
      received: schema.feeRecords.received,
      discount: schema.feeRecords.discount,
      courseFee: schema.feeRecords.courseFee,
      dueDate: schema.feeRecords.dueDate
    })
    .from(schema.feeRecords)
    .where(eq(schema.feeRecords.enrollmentId, entry.enrollmentId));

  const fees = summariseFees(
    {
      agreedFeeTotal: entry.agreedFeeTotal,
      agreedAdmissionAmount: entry.agreedAdmissionAmount,
      agreedBalanceDueOn: entry.agreedBalanceDueOn
    },
    ledger
  );

  return (
    <PrintSheet
      title={copy.feeReceipt}
      reference={entry.receiptNo ?? `#${entry.id}`}
      locale={locale}
      backHref="/admin/fees"
      backLabel={copy.back}
      printLabel={copy.print}
    >
      <SheetSection title={copy.student} columns={3}>
        <SheetField label={copy.studentName} value={entry.studentName} />
        <SheetField label={copy.admissionNo} value={entry.admissionNo} />
        <SheetField label={copy.studentMobile} value={entry.phone} />
        <SheetField
          label={copy.courseName}
          value={locale === "gu" ? entry.courseNameGu : entry.courseNameEn}
        />
        <SheetField label={copy.batch} value={entry.batchLabel} />
        <SheetField label={copy.feeDate} value={moment(entry.createdAt, locale)} />
      </SheetSection>

      <SheetSection title={copy.feeReceived} columns={3}>
        <SheetField label={copy.feeReceived} value={inr(entry.received)} money />
        <SheetField label={copy.feeMethod} value={entry.method} />
        <SheetField label={copy.receiptNo} value={entry.receiptNo} />
      </SheetSection>

      <SheetSection title={copy.fees} columns={3}>
        <SheetField label={copy.feeTotal} value={inr(fees.agreed)} money />
        <SheetField label={copy.feeReceived} value={inr(fees.received)} money />
        <SheetField label={copy.feeBalance} value={inr(fees.balance)} money />
        <SheetField label={copy.feeDueOn} value={day(fees.nextDueOn, locale)} />
      </SheetSection>

      {entry.notes ? (
        <section className="sheet-section">
          <h2 className="sheet-section-title">{copy.feeNotes}</h2>
          <p style={{ fontSize: "9.5pt" }}>{entry.notes}</p>
        </section>
      ) : null}

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
