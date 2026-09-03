import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { hasPermission } from "@/lib/auth/access";
import { feesCopy } from "@/lib/admin/fees-copy";
import { isOverdue, summariseFees, type FeeStatus } from "@/lib/admin/fee-status";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { RecordMenu } from "@/components/admin/RecordMenu";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import { kolkataDate } from "@/lib/admin/dates";
import { AgreementForm, FeeEntryForm } from "./FeeForm";

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

type FeeRow = {
  id: number;
  enrollmentId: number;
  courseFee: number;
  discount: number;
  received: number;
  method: string | null;
  receiptNo: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: Date;
};

export default async function FeesPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/fees");
  const canView = hasPermission(session.staff, "fees.view") || hasPermission(session.staff, "fees.manage");
  const canManage = hasPermission(session.staff, "fees.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = feesCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
  const sheets = printCopy(session.staff.adminLocale);
  const canDeleteFeeRecord = canPerform(
    {
      role: session.role,
      has: (permission: Parameters<typeof hasPermission>[1]) => hasPermission(session.staff, permission)
    },
    "fee_record",
    "delete"
  );
  const db = getDb();
  if (!db) return <div className="max-w-[78rem]"><PageHead title={copy.title} context={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const statusFilter = ["pending", "overdue", "paid"].includes(params.status ?? "")
    ? params.status as "pending" | "overdue" | "paid"
    : "all";

  /* The enrolments first, then only the ledger rows those enrolments own.
     The ledger read used to be `select … from fee_records` with no filter at
     all: every receipt ever written, on every load of this page, to build
     per-enrolment histories for the enrolments on screen. It is now scoped to
     those ids, so it shrinks with the list rather than growing with the
     studio's whole trading history — and it shrinks again for free the day
     this page paginates. */
  const enrollments = await db.select({
      enrollmentId: schema.enrollments.id,
      enrollmentStatus: schema.enrollments.status,
      joinedOn: schema.enrollments.joinedOn,
      agreedFeeTotal: schema.enrollments.agreedFeeTotal,
      agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
      agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
      agreedCourseName: schema.enrollments.agreedCourseName,
      studentId: schema.students.id,
      admissionNo: schema.students.admissionNo,
      fullName: schema.students.fullName,
      phone: schema.students.phone,
      whatsapp: schema.students.whatsapp,
      batchLabel: schema.batches.label,
      courseNameEn: schema.courses.nameEn,
      courseNameGu: schema.courses.nameGu
    }).from(schema.enrollments)
      .innerJoin(schema.students, eq(schema.enrollments.studentId, schema.students.id))
      .innerJoin(schema.batches, eq(schema.enrollments.batchId, schema.batches.id))
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .orderBy(desc(schema.enrollments.createdAt));

  const enrollmentIds = enrollments.map((row) => row.enrollmentId);
  const ledger = enrollmentIds.length
    ? await db.select({
      id: schema.feeRecords.id,
      enrollmentId: schema.feeRecords.enrollmentId,
      courseFee: schema.feeRecords.courseFee,
      discount: schema.feeRecords.discount,
      received: schema.feeRecords.received,
      method: schema.feeRecords.method,
      receiptNo: schema.feeRecords.receiptNo,
      dueDate: schema.feeRecords.dueDate,
      notes: schema.feeRecords.notes,
      createdAt: schema.feeRecords.createdAt
      })
        .from(schema.feeRecords)
        .where(inArray(schema.feeRecords.enrollmentId, enrollmentIds))
        .orderBy(desc(schema.feeRecords.createdAt))
    : [];

  const byEnrollment = new Map<number, FeeRow[]>();
  for (const row of ledger) {
    const rows = byEnrollment.get(row.enrollmentId) ?? [];
    rows.push(row);
    byEnrollment.set(row.enrollmentId, rows);
  }

  /**
   * Every number below is DERIVED from the enrolment's agreement snapshot plus
   * the ledger. Nothing stores a "paid" flag: a status column would be a second
   * source of truth for a number that is already in the ledger, and the two
   * would disagree the first time a receipt was corrected.
   */
  const today = kolkataToday();
  const allCards = enrollments.map((enrollment) => {
    const rows = byEnrollment.get(enrollment.enrollmentId) ?? [];
    const summary = summariseFees(
      {
        agreedFeeTotal: enrollment.agreedFeeTotal,
        agreedAdmissionAmount: enrollment.agreedAdmissionAmount,
        agreedBalanceDueOn: enrollment.agreedBalanceDueOn
      },
      rows
    );
    return { ...enrollment, rows, latest: rows[0] ?? null, summary, overdue: isOverdue(summary, today) };
  });

  const totalNet = allCards.reduce((sum, card) => sum + card.summary.net, 0);
  const totalReceived = allCards.reduce((sum, card) => sum + card.summary.received, 0);
  const totalDue = allCards.reduce((sum, card) => sum + card.summary.balance, 0);
  const overdueCount = allCards.filter((card) => card.overdue).length;

  const cards = allCards
    .filter((card) => {
      if (statusFilter === "pending" && card.summary.balance <= 0) return false;
      if (statusFilter === "overdue" && !card.overdue) return false;
      if (statusFilter === "paid" && (card.summary.unset || card.summary.balance > 0)) return false;
      if (!q) return true;
      return [card.fullName, card.admissionNo, card.phone, card.whatsapp ?? "", card.batchLabel, card.courseNameEn, card.courseNameGu]
        .some((value) => value.toLowerCase().includes(q));
    })
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.summary.balance - a.summary.balance || a.fullName.localeCompare(b.fullName));

  return (
    <div className="max-w-[80rem]">
      <PageHead title={copy.title} context={copy.lede} />
      {/* The three derived totals as a hairline strip. As `panel panel-body`
          tiles carrying money at 24px they stacked to 308px at 390px, on the
          page whose own comment says a row answers the only question the front
          desk asks all day. */}
      <div className="console-metrics mt-3">
        <div>
          <span className="kv-label">{copy.totalAgreed}</span>
          <span className="kv-value data-num">{money(totalNet)}</span>
        </div>
        <div>
          <span className="kv-label">{copy.totalReceived}</span>
          <span className="kv-value data-num">{money(totalReceived)}</span>
        </div>
        <div>
          <span className="kv-label">{copy.totalPending}</span>
          <span className="kv-value data-num">{money(totalDue)}</span>
        </div>
        <div>
          <span className="kv-label">{copy.overdueCount}</span>
          <span className="kv-value data-num">{overdueCount}</span>
        </div>
      </div>

      <form method="get" className="toolbar mt-3 grid-cols-[1fr_auto] md:grid-cols-[1fr_14rem_auto] md:items-end">
        <Field label={copy.search} htmlFor="fee-search"><input id="fee-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} /></Field>
        <Field label={copy.filterStatus} htmlFor="fee-status">
          <select id="fee-status" name="status" className="input" defaultValue={statusFilter}>
            <option value="all">{copy.filterAll}</option>
            <option value="pending">{copy.filterPending}</option>
            <option value="overdue">{copy.filterOverdue}</option>
            <option value="paid">{copy.filterPaid}</option>
          </select>
        </Field>
        <button className="btn btn-primary" type="submit">{copy.show}</button>
      </form>
      {!canManage ? <p className="form-note mt-3">{copy.viewOnly}</p> : null}

      <section className="data-list mt-3">
        {cards.length === 0 ? <p className="empty-state">{copy.empty}</p> : cards.map((card) => (
          /* Closed, a row answers the only question the front desk asks all
             day: who owes what, and by when. Opening it shows the ledger and
             the forms, without leaving the list. */
          <details key={card.enrollmentId} id={`fee-${card.enrollmentId}`} className="record-anchor">
            <summary className="data-row">
              <span className="data-row__title">{card.fullName}</span>
              <span className="data-row__actions">
                <span className={`chip ${statusClass(card.summary.status, card.overdue)}`}>
                  {card.summary.unset ? copy.noLedger : copy.statuses[card.summary.status]}
                </span>
              </span>
              {/* Identity on one line, money on its own. Mixing an admission
                  number, a batch label and two amounts on a single wrapped
                  line meant a column of balances did not line up, which is the
                  one thing a ledger has to do. All figures tabular. */}
              <span className="data-row__meta">
                <span>{card.admissionNo}</span>
                <span>{card.batchLabel}</span>
                <span>
                  {session.staff.adminLocale === "gu" ? card.courseNameGu : card.courseNameEn}
                </span>
              </span>
              <span className="data-row__meta">
                <span className="data-num">
                  {card.summary.agreed != null ? money(card.summary.agreed) : "—"}
                </span>
                <span className="data-num">{money(card.summary.received)}</span>
                {card.summary.balance > 0 ? (
                  <span className={card.overdue ? "data-num text-error" : "data-num"}>
                    {copy.due} {money(card.summary.balance)}
                  </span>
                ) : null}
                {card.summary.nextDueOn ? (
                  <span>{formatDate(card.summary.nextDueOn, session.staff.adminLocale)}</span>
                ) : null}
              </span>
            </summary>
            <div className="grid gap-6 border-t border-line bg-ivory-2/40 px-3 py-4 md:px-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="form-note">
                  {session.staff.adminLocale === "gu" ? card.courseNameGu : card.courseNameEn} ·{" "}
                  <a href={`https://wa.me/91${card.whatsapp ?? card.phone}`}>WhatsApp</a>
                </p>
                <span className="flex flex-wrap items-center gap-3">
                  {/* `latest` was computed on line 125 and read nowhere. It is
                      the last receipt — the thing a parent at the counter is
                      holding — and it costs nothing. */}
                  {card.latest ? (
                    <PrintLink
                      href={`/admin/print/receipt/${card.latest.id}`}
                      label={sheets.feeReceipt}
                      compact
                    />
                  ) : null}
                  <PrintLink
                    href={`/admin/print/statement/${card.enrollmentId}`}
                    label={sheets.feeStatement}
                    compact
                  />
                </span>
              </div>
              <dl className="kv-grid">
                <Fact label={copy.courseFee} value={card.summary.agreed != null ? money(card.summary.agreed) : "—"} />
                <Fact label={copy.discount} value={card.summary.discount > 0 ? money(card.summary.discount) : "—"} />
                <Fact label={copy.totalReceived} value={money(card.summary.received)} />
                <Fact label={copy.balance} value={money(card.summary.balance)} />
                <Fact
                  label={copy.dueDate}
                  value={card.summary.nextDueOn ? formatDate(card.summary.nextDueOn, session.staff.adminLocale) : "—"}
                />
              </dl>
              {card.summary.admissionExpected != null && !card.summary.admissionMet ? (
                <p className="alert alert-warn">
                  {copy.admissionShort} {money(card.summary.admissionExpected)}
                </p>
              ) : null}
              {card.overdue ? <p className="alert alert-error">{copy.overdue}</p> : null}

              {card.rows.length ? (
                <details className="border-t border-rule pt-5">
                  <summary className="cursor-pointer font-semibold">{copy.history} ({card.rows.length})</summary>
                  <div className="data-list mt-3">
                    {card.rows.map((row) => (
                      <div key={row.id} className="data-row">
                        <span className="data-row__title data-num">
                          {row.received > 0 ? money(row.received) : "—"}
                        </span>
                        <span className="data-row__actions">
                          {row.received > 0 ? (
                            <PrintLink
                              href={`/admin/print/receipt/${row.id}`}
                              label={sheets.feeReceipt}
                              compact
                            />
                          ) : null}
                          {/* A ledger entry is never EDITED — a corrected receipt
                              would leave the original amount nowhere. A genuinely
                              mistaken one is deleted by the Owner, and the
                              tombstone keeps the amount and the receipt number. */}
                          <RecordMenu
                            entity="fee_record"
                            id={row.id}
                            label={row.receiptNo ?? `#${row.id}`}
                            canDelete={canDeleteFeeRecord}
                            copy={records}
                          />
                        </span>
                        <span className="data-row__meta">
                          <span>{formatDateTime(row.createdAt, session.staff.adminLocale)}</span>
                          {row.method ? <span>{row.method}</span> : null}
                          {row.receiptNo ? <span>{copy.receipt} {row.receiptNo}</span> : null}
                          {row.notes ? <span>{row.notes}</span> : null}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              ) : <p className="form-note">{copy.noLedger}</p>}

              {canManage && !card.summary.unset ? (
                <section className="border-t border-rule pt-5" aria-labelledby={`payment-${card.enrollmentId}`}>
                  <h4 id={`payment-${card.enrollmentId}`} className="font-semibold">{copy.recordPayment}</h4>
                  <div className="mt-4"><FeeEntryForm enrollmentId={card.enrollmentId} discount={card.summary.discount} dueDate={card.summary.nextDueOn} copy={copy} /></div>
                </section>
              ) : null}
              {canManage && card.summary.unset ? <p className="alert alert-warn">{copy.agreementNeeded}</p> : null}

              {canManage ? (
                <details className="border-t border-rule pt-5" open={card.summary.unset}>
                  <summary className="cursor-pointer font-semibold">{copy.editAgreement}</summary>
                  <div className="mt-5">
                    <p className="form-note mb-4">{copy.agreementHint}</p>
                    <AgreementForm
                      enrollmentId={card.enrollmentId}
                      agreedFeeTotal={card.agreedFeeTotal}
                      agreedAdmissionAmount={card.agreedAdmissionAmount}
                      agreedBalanceDueOn={card.agreedBalanceDueOn}
                      copy={copy}
                    />
                  </div>
                </details>
              ) : null}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

function statusClass(status: FeeStatus, overdue: boolean) {
  if (overdue) return "status-error";
  return status === "paid" ? "status-active" : status === "partial" ? "status-pending" : "status-off";
}
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
function formatDateTime(value: Date, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value); }

function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="kv-label">{label}</dt><dd className="kv-value mt-0.5">{value}</dd></div>; }
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
/** "Today" for a member of staff standing in Surat, not the Worker's UTC clock. */
const kolkataToday = kolkataDate;
