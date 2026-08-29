import Link from "next/link";
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
        <p className="alert alert-error mt-8">{copy.databaseUnavailable}</p>
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
        <section className="mt-10" aria-labelledby="report-summary-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="report-summary-heading" className="text-h4">{copy.summary}</h2>
            <p className="form-note">{copy.last30Days}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={copy.activeStudents} value={n(row.active_students)} />
            <Metric label={copy.openAdmissions} value={n(row.open_admissions)} />
            <Metric label={copy.runningBatches} value={n(row.running_batches)} />
            <Metric label={copy.attendanceMarked} value={n(row.attendance_marks_30d)} note={copy.last30Days} />
            <Metric label={copy.feesReceived} value={formatInr(n(row.fees_received_30d), session.staff.adminLocale)} note={copy.last30Days} />
            <Metric label={copy.openDesignJobs} value={n(row.open_design_jobs)} />
            <Metric label={copy.certificatesIssued} value={n(row.certificates_issued_30d)} note={copy.last30Days} />
          </div>
        </section>
      ) : null}

      {canExport ? (
        <section className="panel mt-10" aria-labelledby="report-exports-heading">
          <div className="panel-head">
            <div>
              <h2 id="report-exports-heading" className="text-h4">{copy.exports}</h2>
              <p className="form-note mt-1">{copy.exportsHelp}</p>
            </div>
          </div>
          <div className="panel-body grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ExportLink href="/admin/reports/export/students" label={copy.exportStudents} action={copy.download} />
            <ExportLink href="/admin/reports/export/admissions" label={copy.exportAdmissions} action={copy.download} />
            <ExportLink href="/admin/reports/export/attendance" label={copy.exportAttendance} action={copy.download} />
            <ExportLink href="/admin/reports/export/fees" label={copy.exportFees} action={copy.download} />
            <ExportLink href="/admin/reports/export/design" label={copy.exportDesign} action={copy.download} />
          </div>
        </section>
      ) : canViewReports ? (
        <p className="form-note mt-8">{copy.viewOnly}</p>
      ) : null}

      {canViewAudit ? (
        <section className="mt-10" aria-labelledby="report-audit-heading">
          <h2 id="report-audit-heading" className="text-h4">{copy.audit}</h2>
          <p className="form-note mt-2">{copy.auditHelp}</p>
          {auditResult.rows.length === 0 ? (
            <p className="empty-state mt-4">{copy.noAudit}</p>
          ) : (
            <div className="panel mt-4 overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-smallmeta">
                <thead className="border-b border-rule bg-thread/40">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Staff</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Record</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {auditResult.rows.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{formatIst(item.createdAt, session.staff.adminLocale)}</td>
                      <td className="px-4 py-3">{item.actor ?? "system"}</td>
                      <td className="px-4 py-3 font-medium">{humanAction(item.action)}</td>
                      <td className="px-4 py-3">{item.entity}{item.entityId ? ` #${item.entityId}` : ""}</td>
                      <td className="px-4 py-3">{item.reason ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Header({ title, lede }: { title: string; lede: string }) {
  return (
    <div>
      <h1 className="text-h2">{title}</h1>
      <span aria-hidden className="rule-stitch is-in" />
      <p className="u-lede">{lede}</p>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="panel panel-body">
      <p className="microlabel">{label}</p>
      <p className="text-h3 mt-2">{value}</p>
      {note ? <p className="form-note mt-1">{note}</p> : null}
    </div>
  );
}

function ExportLink({ href, label, action }: { href: string; label: string; action: string }) {
  return (
    <Link href={href} className="rounded-[var(--radius-card)] border border-rule p-4 transition hover:border-vermilion-deep">
      <span className="block font-semibold">{label}</span>
      <span className="form-note mt-1 block">{action}</span>
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
