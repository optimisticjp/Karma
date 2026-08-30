import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { feesCopy } from "@/lib/admin/fees-copy";
import { isOverdue, summariseFees, type FeeStatus } from "@/lib/admin/fee-status";
import { AgreementForm, FeeEntryForm } from "./FeeForm";

type Props = { searchParams: Promise<{ q?: string; pending?: string }> };

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
  const db = getDb();
  if (!db) return <div className="max-w-[78rem]"><Heading title={copy.title} lede={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const pendingOnly = params.pending === "1";

  const [enrollments, ledger] = await Promise.all([
    db.select({
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
      .orderBy(desc(schema.enrollments.createdAt)),
    db.select({
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
    }).from(schema.feeRecords).orderBy(desc(schema.feeRecords.createdAt))
  ]);

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
  const cards = enrollments.map((enrollment) => {
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
  }).filter((card) => {
    if (pendingOnly && card.summary.balance <= 0) return false;
    if (!q) return true;
    return [card.fullName, card.admissionNo, card.phone, card.whatsapp ?? "", card.batchLabel].some((value) => value.toLowerCase().includes(q));
  });

  const totalNet = cards.reduce((sum, card) => sum + card.summary.net, 0);
  const totalReceived = cards.reduce((sum, card) => sum + card.summary.received, 0);
  const totalDue = cards.reduce((sum, card) => sum + card.summary.balance, 0);

  return (
    <div className="max-w-[80rem]">
      <Heading title={copy.title} lede={copy.lede} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label={copy.totalAgreed} value={money(totalNet)} />
        <Metric label={copy.totalReceived} value={money(totalReceived)} />
        <Metric label={copy.totalPending} value={money(totalDue)} />
      </div>

      <form method="get" className="panel panel-body mt-8 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Field label={copy.search} htmlFor="fee-search"><input id="fee-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} /></Field>
        <label className="choice-chip text-smallmeta"><input type="checkbox" name="pending" value="1" className="size-4 accent-vermilion" defaultChecked={pendingOnly} />{copy.pendingOnly}</label>
        <button className="btn btn-primary" type="submit">{copy.show}</button>
      </form>
      {!canManage ? <p className="form-note mt-5">{copy.viewOnly}</p> : null}

      <section className="mt-8 grid gap-5">
        {cards.length === 0 ? <p className="empty-state">{copy.empty}</p> : cards.map((card) => (
          <article key={card.enrollmentId} className="panel">
            <div className="panel-head flex-wrap gap-4">
              <div>
                <p className="microlabel">{card.admissionNo}</p>
                <h2 className="text-h4 mt-1">{card.fullName}</h2>
                <p className="form-note mt-1">{session.staff.adminLocale === "gu" ? card.courseNameGu : card.courseNameEn} · {card.batchLabel} · <a href={`https://wa.me/91${card.whatsapp ?? card.phone}`}>WhatsApp</a></p>
              </div>
              <span className={`status ${statusClass(card.summary.status, card.overdue)}`}>
                {card.summary.unset ? copy.noLedger : copy.statuses[card.summary.status]}
                {card.summary.balance > 0 ? ` · ${money(card.summary.balance)}` : ""}
              </span>
            </div>
            <div className="panel-body grid gap-6">
              <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
                  <div className="mt-4 grid gap-3">
                    {card.rows.map((row) => <div key={row.id} className="rounded-[var(--radius-card)] border border-rule p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{row.received > 0 ? money(row.received) : "Fee terms updated"}</p><p className="form-note mt-1">{formatDateTime(row.createdAt, session.staff.adminLocale)}{row.method ? ` · ${row.method}` : ""}{row.receiptNo ? ` · ${copy.receipt} ${row.receiptNo}` : ""}</p></div></div>{row.notes ? <p className="text-smallmeta mt-2">{row.notes}</p> : null}</div>)}
                  </div>
                </details>
              ) : <p className="form-note">{copy.noLedger}</p>}

              {canManage ? (
                <details className="border-t border-rule pt-5">
                  <summary className="cursor-pointer font-semibold">{copy.recordPayment}</summary>
                  <div className="mt-5"><FeeEntryForm enrollmentId={card.enrollmentId} courseFee={card.summary.agreed ?? 0} discount={card.summary.discount} dueDate={card.summary.nextDueOn} copy={copy} /></div>
                </details>
              ) : null}

              {canManage ? (
                <details className="border-t border-rule pt-5">
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
          </article>
        ))}
      </section>
    </div>
  );
}

function Heading({ title, lede }: { title: string; lede: string }) { return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="microlabel">{label}</dt><dd className="text-smallmeta mt-1">{value}</dd></div>; }
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
/** "Today" for a member of staff standing in Surat, not the Worker's UTC clock. */
function kolkataToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
function statusClass(status: FeeStatus, overdue: boolean) {
  if (overdue) return "status-error";
  return status === "paid" ? "status-active" : status === "partial" ? "status-pending" : "status-off";
}
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
function formatDateTime(value: Date, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value); }
