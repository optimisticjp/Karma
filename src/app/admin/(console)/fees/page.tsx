import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { feesCopy } from "@/lib/admin/fees-copy";
import { FeeEntryForm } from "./FeeForm";

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

  const cards = enrollments.map((enrollment) => {
    const rows = byEnrollment.get(enrollment.enrollmentId) ?? [];
    const latest = rows[0] ?? null;
    const received = rows.reduce((sum, row) => sum + row.received, 0);
    const courseFee = latest?.courseFee ?? 0;
    const discount = latest?.discount ?? 0;
    const net = Math.max(0, courseFee - discount);
    const due = Math.max(0, net - received);
    return { ...enrollment, rows, latest, courseFee, discount, net, received, due };
  }).filter((card) => {
    if (pendingOnly && card.due <= 0) return false;
    if (!q) return true;
    return [card.fullName, card.admissionNo, card.phone, card.whatsapp ?? "", card.batchLabel].some((value) => value.toLowerCase().includes(q));
  });

  const totalNet = cards.reduce((sum, card) => sum + card.net, 0);
  const totalReceived = cards.reduce((sum, card) => sum + card.received, 0);
  const totalDue = cards.reduce((sum, card) => sum + card.due, 0);

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
              <span className={`status ${card.due > 0 ? "status-pending" : card.net > 0 ? "status-active" : "status-off"}`}>{card.due > 0 ? `${copy.due} ${money(card.due)}` : card.net > 0 ? copy.paid : copy.noLedger}</span>
            </div>
            <div className="panel-body grid gap-6">
              <dl className="grid gap-4 sm:grid-cols-4">
                <Fact label={copy.courseFee} value={card.latest ? money(card.courseFee) : "—"} />
                <Fact label={copy.discount} value={card.latest ? money(card.discount) : "—"} />
                <Fact label={copy.paid} value={money(card.received)} />
                <Fact label={copy.dueDate} value={card.latest?.dueDate ? formatDate(card.latest.dueDate, session.staff.adminLocale) : "—"} />
              </dl>

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
                  <div className="mt-5"><FeeEntryForm enrollmentId={card.enrollmentId} courseFee={card.courseFee} discount={card.discount} dueDate={card.latest?.dueDate ?? null} copy={copy} /></div>
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
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
function formatDateTime(value: Date, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value); }
