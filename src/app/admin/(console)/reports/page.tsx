import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { reportsCopy } from "@/lib/admin/reports-copy";

export const dynamic = "force-dynamic";

type SummaryRow = {
  active_students: string;
  open_admissions: string;
  running_batches: string;
  attendance_marks_30d: string;
  fees_received_30d: string;
  open_design_jobs: string;
  certificates_issued_30d: string;
};

type AuditRow = {
  id: number;
  actor: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  reason: string | null;
  createdAt: Date;
};

export default async function ReportsPage() {
  const session = await requireAdmin("/admin/reports");
  const canViewReports = hasPermission(session.staff, "reports.view");
  const canViewAudit = hasPermission(session.staff, "audit.view");
  const canExport = hasPermission(session.staff, "exports.run");
  if (!canViewReports && !canViewAudit && !canExport) {
    redirect("/admin/no-access?reason=permission");
  }

  const copy = reportsCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[72rem]">
        <Header title={copy.title} lede={copy.lede} />
        <p className="alert alert-error mt-6">{copy.databaseUnavailable}</p>
      </div>
    );
  }

  const today = sql.raw("(now() at time zone 'Asia/Kolkata')::date");
  const [summaryResult, auditResult] = await Promise.all([
    db.execute<SummaryRow>(sql`
      select
        (select count(distinct student_id) from enrollments where status = 'active') as active_students,
        (select count(*) from applications where status not in ('enrolled','not_proceeding','closed')) as open_admissions,
        (select count(*) from batches
          where start_date <= ${today}
            and (end_date is null or end_date >= ${today})
            and status in ('open','full','started')) as running_batches,
        (select count(*) from attendance_records
          where marked_at >= now() - interval '30 days') as attendance_marks_30d,
        (select coalesce(sum(received), 0) from fee_records
          where created_at >= now() - interval '30 days') as fees_received_30d,
        (select count(*) from service_enquiries
          where status not in ('delivered','closed')) as open_design_jobs,
        (select count(*) from certificates
          where issued_on >= ${today} - 30) as certificates_issued_30d
    `),
    canViewAudit
      ? db.execute<AuditRow>(sql`
          select id, actor, action, entity, entity_id as "entityId", reason,
                 created_at as "createdAt"
            from audit_logs
           order by created_at desc
           limit 60
        `)
      : Promise.resolve({ rows: [] as AuditRow[] })
  ]);

  const row = summaryResult.rows[0];
  const n = (value: string | number | null | undefined) => Number(value ?? 0);

  return (
    <div className="max-w-[76rem]">
      <Header title={copy.title} lede={copy.lede} />

      {canViewReports && row ? (
        <section className="mt-6" aria-labelledby="report-summary-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="report-summary-heading" className="text-h4">{copy.summary}</h2>
            <p className="form-note">{copy.last30Days}</p>
          </div>
          {/* Seven figures. As `panel panel-body` cards they went single-column
              at 390px and measured 806px — 42px taller than the entire phone
              content budget, so the operator scrolled a full screen of card
              padding before reaching anything they could act on. The same
              seven figures are 7 label/value rows in the strip. */}
          <div className="console-metrics mt-4">
            <Metric label={copy.activeStudents} value={n(row.active_students)} />
            <Metric label={copy.openAdmissions} value={n(row.open_admissions)} />
            <Metric label={copy.runningBatches} value={n(row.running_batches)} />
            <Metric label={copy.attendanceMarked} value={n(row.attendance_marks_30d)} />
            <Metric label={copy.feesReceived} value={formatInr(n(row.fees_received_30d), session.staff.adminLocale)} />
            <Metric label={copy.openDesignJobs} value={n(row.open_design_jobs)} />
            <Metric label={copy.certificatesIssued} value={n(row.certificates_issued_30d)} />
          </div>
        </section>
      ) : null}

      {canExport ? (
        <section className="mt-8" aria-labelledby="report-exports-heading">
          <h2 id="report-exports-heading" className="text-h4">{copy.exports}</h2>
          <p className="form-note mt-1.5">{copy.exportsHelp}</p>
          {/* Five downloads. Each used to be an 86px bordered card whose second
              line said "Download CSV" — the same three words five times, under
              a heading that already says these are downloads. They are rows
              now: the name on the left, the format on the right. */}
          <div className="data-list mt-3">
            <ExportLink href="/admin/reports/export/students" label={copy.exportStudents} action={copy.download} />
            <ExportLink href="/admin/reports/export/admissions" label={copy.exportAdmissions} action={copy.download} />
            <ExportLink href="/admin/reports/export/attendance" label={copy.exportAttendance} action={copy.download} />
            <ExportLink href="/admin/reports/export/fees" label={copy.exportFees} action={copy.download} />
            <ExportLink href="/admin/reports/export/design" label={copy.exportDesign} action={copy.download} />
          </div>
        </section>
      ) : canViewReports ? (
        <p className="form-note mt-6">{copy.viewOnly}</p>
      ) : null}

      {canViewAudit ? (
        <section className="mt-8" aria-labelledby="report-audit-heading">
          <h2 id="report-audit-heading" className="text-h4">{copy.audit}</h2>
          <p className="form-note mt-1.5">{copy.auditHelp}</p>
          {auditResult.rows.length === 0 ? (
            <p className="empty-state mt-4">{copy.noAudit}</p>
          ) : (
            <>
              {/* Below `md` this is a list, not a table. A 5-column table with
                  `min-w-[52rem]` was 832px of content inside a 366px panel:
                  sixty rows the phone operator could only read by dragging
                  each one sideways, one column at a time. The same five facts
                  are a title line and a meta line per entry. From `md` the
                  table fits without scrolling and is the better scan. */}
              <div className="data-list mt-4 md:hidden">
                {auditResult.rows.map((item) => (
                  <div key={item.id} className="data-row">
                    <p className="data-row__title text-smallmeta">
                      {humanAction(item.action)}
                      <span className="font-normal text-stone">
                        {" "}
                        {item.entity}
                        {item.entityId ? ` #${item.entityId}` : ""}
                      </span>
                    </p>
                    <p className="data-row__meta">
                      <span>{formatIst(item.createdAt, session.staff.adminLocale)}</span>
                      <span>{item.actor ?? "system"}</span>
                      {item.reason ? <span>{item.reason}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
              <div className="panel mt-4 hidden overflow-x-auto md:block">
                <table className="w-full text-left text-smallmeta">
                  <thead className="border-b border-rule bg-thread/40">
                    <tr>
                      <th className="px-4 py-2.5">{copy.auditWhen}</th>
                      <th className="px-4 py-2.5">{copy.auditStaff}</th>
                      <th className="px-4 py-2.5">{copy.auditAction}</th>
                      <th className="px-4 py-2.5">{copy.auditRecord}</th>
                      <th className="px-4 py-2.5">{copy.auditReason}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {auditResult.rows.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{formatIst(item.createdAt, session.staff.adminLocale)}</td>
                        <td className="px-4 py-2">{item.actor ?? "system"}</td>
                        <td className="px-4 py-2 font-medium">{humanAction(item.action)}</td>
                        <td className="px-4 py-2">{item.entity}{item.entityId ? ` #${item.entityId}` : ""}</td>
                        <td className="px-4 py-2">{item.reason ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Header({ title, lede }: { title: string; lede: string }) {
  return <PageHead title={title} context={lede} />;
}

/* One figure in the hairline strip. `.console-metrics` makes this a
   label/value ROW on a phone and a stacked cell from 640px up; the component
   states no layout of its own.

   There is no `note` any more. Three of the seven figures repeated "Last 30
   days" under the number while the section heading already says it once, on
   the same line as the heading — 54px of caption restating a qualifier the
   operator had just read. */
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="microlabel">{label}</p>
      <p className="text-h4 font-semibold sm:mt-1.5 sm:text-h3">{value}</p>
    </div>
  );
}

function ExportLink({ href, label, action }: { href: string; label: string; action: string }) {
  return (
    <Link
      href={href}
      /* `.tap` keeps the 44px hit area the row's own padding would not give
         it — density and touch size are settled with padding that overflows
         the visual row, never with a taller row. */
      className="tap flex items-center justify-between gap-3 px-3 py-2 transition hover:bg-thread/40 md:px-4"
    >
      <span className="min-w-0 font-semibold">{label}</span>
      <span className="form-note shrink-0">{action}</span>
    </Link>
  );
}

function formatInr(value: number, locale: "en" | "gu") {
  return new Intl.NumberFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatIst(value: Date | string, locale: "en" | "gu") {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function humanAction(value: string) {
  return value.replace(/[._]/g, " ");
}
