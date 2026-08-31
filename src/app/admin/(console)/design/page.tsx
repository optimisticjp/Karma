import Link from "next/link";
import { PageHead } from "@/components/admin/PageHead";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { PrintLink } from "@/components/admin/PrintLink";
import { printCopy } from "@/lib/admin/print-copy";
import { designCopy } from "@/lib/admin/design-copy";
import { DESIGN_STATUSES, isDesignStatus, type DesignStatus } from "@/lib/admin/design";
import { kolkataDate } from "@/lib/admin/dates";
import { DesignJobForm, DesignStatusForm, type DesignValue } from "./DesignForms";

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function DesignPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/design");
  const canView = hasPermission(session.staff, "design.view") || hasPermission(session.staff, "design.manage");
  const canManage = hasPermission(session.staff, "design.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = designCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) return <div className="max-w-[80rem]"><PageHead title={copy.title} context={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const statusFilter = isDesignStatus(params.status) ? params.status : null;
  /* The jobs first, then only the history and files those jobs own.
     `serviceStatusHistory` and `serviceFiles` were read with NO filter at all:
     every status transition and every file row ever written, on every load, to
     build per-job lists for the 300 shown. Scoped by `inArray` they shrink
     with the list rather than growing with the studio's whole trading history
     — the same fix the fees ledger already has, and with `max: 1` the old
     `Promise.all` was serialising anyway. */
  const [jobsRaw] = await Promise.all([
    db.select({
      id: schema.serviceEnquiries.id,
      reference: schema.serviceEnquiries.reference,
      name: schema.serviceEnquiries.name,
      company: schema.serviceEnquiries.company,
      phone: schema.serviceEnquiries.phone,
      email: schema.serviceEnquiries.email,
      productType: schema.serviceEnquiries.productType,
      technique: schema.serviceEnquiries.technique,
      dimensions: schema.serviceEnquiries.dimensions,
      quantity: schema.serviceEnquiries.quantity,
      colourCount: schema.serviceEnquiries.colourCount,
      fileFormat: schema.serviceEnquiries.fileFormat,
      deadline: schema.serviceEnquiries.deadline,
      details: schema.serviceEnquiries.details,
      locale: schema.serviceEnquiries.locale,
      status: schema.serviceEnquiries.status,
      createdAt: schema.serviceEnquiries.createdAt,
      updatedAt: schema.serviceEnquiries.updatedAt
    }).from(schema.serviceEnquiries).orderBy(desc(schema.serviceEnquiries.updatedAt)).limit(300)
  ]);

  const jobs = jobsRaw.filter((job) => {
    if (statusFilter && job.status !== statusFilter) return false;
    if (!q) return true;
    return [job.reference, job.name, job.company ?? "", job.phone, job.productType ?? ""].some((value) => value.toLowerCase().includes(q));
  });
  const jobIds = jobs.map((job) => job.id);
  const [histories, files] = jobIds.length
    ? await Promise.all([
        db.select({ id: schema.serviceStatusHistory.id, enquiryId: schema.serviceStatusHistory.enquiryId, fromStatus: schema.serviceStatusHistory.fromStatus, toStatus: schema.serviceStatusHistory.toStatus, note: schema.serviceStatusHistory.note, staffName: schema.staff.name, createdAt: schema.serviceStatusHistory.createdAt })
          .from(schema.serviceStatusHistory)
          .leftJoin(schema.staff, eq(schema.serviceStatusHistory.byStaff, schema.staff.id))
          .where(inArray(schema.serviceStatusHistory.enquiryId, jobIds))
          .orderBy(desc(schema.serviceStatusHistory.createdAt)),
        db.select({ id: schema.serviceFiles.id, enquiryId: schema.serviceFiles.enquiryId, fileName: schema.serviceFiles.fileName, sizeBytes: schema.serviceFiles.sizeBytes, contentType: schema.serviceFiles.contentType, createdAt: schema.serviceFiles.createdAt })
          .from(schema.serviceFiles)
          .where(inArray(schema.serviceFiles.enquiryId, jobIds))
          .orderBy(desc(schema.serviceFiles.createdAt))
      ])
    : [[], []];

  const historyByJob = groupBy(histories, (item) => item.enquiryId);
  const filesByJob = groupBy(files, (item) => item.enquiryId);
  const sheets = printCopy(session.staff.adminLocale);
  const today = kolkataDate();
  const terminal = new Set<DesignStatus>(["delivered", "closed"]);
  const needsAction = jobs.filter((job) => ["new", "info_needed", "quote_prepared", "quote_sent", "revision"].includes(job.status)).length;
  const dueSoon = jobs.filter((job) => job.deadline && job.deadline <= plusDays(today, 3) && !terminal.has(job.status as DesignStatus)).length;

  return (
    <div className="max-w-[82rem]">
      <PageHead title={copy.title} context={copy.lede} />
      <div className="console-metrics mt-3">
        <div><span className="kv-label">{copy.jobsShown}</span><span className="kv-value">{jobs.length}</span></div>
        <div><span className="kv-label">{copy.needsAction}</span><span className="kv-value">{needsAction}</span></div>
        <div><span className="kv-label">{copy.dueSoon}</span><span className="kv-value">{dueSoon}</span></div>
      </div>
      {/* No R2, no upload, no signed download. The note is what stops the next
          session assuming otherwise. */}
      <p className="form-note mt-2">{copy.r2Note}</p>

      {canManage ? (
        <details className="panel mt-3">
          <summary className="panel-head cursor-pointer list-none"><h2 className="text-h4">{copy.addJob}</h2><span aria-hidden className="text-h4">＋</span></summary>
          <div className="panel-body border-t border-rule"><p className="form-note mb-3">{copy.addJobHint}</p><DesignJobForm copy={copy} /></div>
        </details>
      ) : <p className="form-note mt-5">{copy.viewOnly}</p>}

      <form method="get" className="toolbar mt-3 grid-cols-2 md:grid-cols-3 gap-2 md:grid-cols-[1fr_16rem_auto] md:items-end">
        <Field label={copy.search} htmlFor="design-search"><input id="design-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} /></Field>
        <Field label={copy.stage} htmlFor="design-stage-filter"><select id="design-stage-filter" name="status" className="input" defaultValue={statusFilter ?? ""}><option value="">{copy.allStages}</option>{DESIGN_STATUSES.map((status) => <option key={status} value={status}>{copy.statuses[status]}</option>)}</select></Field>
        <div className="flex gap-2"><button className="btn btn-primary" type="submit">{copy.show}</button><Link className="btn btn-secondary" href="/admin/design">{copy.clear}</Link></div>
      </form>

      {/* Rows, not a ~900px `<article class="panel">` per job. The status form
          was rendered OPEN on every job — three controls, 234px — on a queue
          that is scanned far more often than it is transitioned. It is behind
          its own disclosure now, beside the two that were already there. */}
      <section className="data-list mt-3">
        {jobs.length === 0 ? <p className="empty-state">{copy.empty}</p> : jobs.map((job) => {
          const status = isDesignStatus(job.status) ? job.status : "new";
          const history = historyByJob.get(job.id) ?? [];
          const jobFiles = filesByJob.get(job.id) ?? [];
          const value: DesignValue = { id: job.id, name: job.name, company: job.company, phone: job.phone, email: job.email, productType: job.productType, technique: job.technique, dimensions: job.dimensions, quantity: job.quantity, colourCount: job.colourCount, fileFormat: job.fileFormat, deadline: job.deadline, details: job.details, locale: job.locale };
          return (
            <details key={job.id}>
              <summary className="data-row">
                <span className="data-row__title">{job.name}{job.company ? ` · ${job.company}` : ""}</span>
                <span className="data-row__actions">
                  <span className={`chip ${statusTone(status)}`}>{copy.statuses[status]}</span>
                </span>
                <span className="data-row__meta">
                  <span>{job.reference}</span>
                  <span>{job.productType ?? "—"}</span>
                  <span>{job.technique ?? "—"}</span>
                  <span>{job.quantity ?? "—"}</span>
                </span>
                <span className="data-row__meta">
                  <span>{copy.deadline}: {job.deadline ? formatDate(job.deadline, session.staff.adminLocale) : "—"}</span>
                  <span>{job.dimensions ?? "—"}</span>
                  <span>{copy.history} {history.length}</span>
                </span>
              </summary>
              <div className="border-t border-line px-3 py-3 md:px-4">
                <p className="flex flex-wrap items-center gap-3 text-smallmeta">
                  <a className="tap font-semibold text-vermilion-deep" href={`https://wa.me/91${job.phone}`}>WhatsApp {job.phone}</a>
                  {job.email ? <span className="text-stone">{job.email}</span> : null}
                  <PrintLink href={`/admin/print/brief/${job.id}`} label={sheets.brief} compact />
                </p>
                {job.details ? <div className="mt-2"><p className="kv-label">{copy.details}</p><p className="text-smallmeta mt-0.5 whitespace-pre-wrap">{job.details}</p></div> : null}
                {canManage ? <details className="mt-2 border border-rule bg-card"><summary className="flex min-h-11 cursor-pointer items-center px-3 text-smallmeta font-semibold">{copy.updateStatus}</summary><div className="border-t border-rule p-3"><DesignStatusForm enquiryId={job.id} status={status} copy={copy} /></div></details> : null}
                {canManage ? <details className="mt-2 border border-rule bg-card"><summary className="flex min-h-11 cursor-pointer items-center px-3 text-smallmeta font-semibold">{copy.editJob}</summary><div className="border-t border-rule p-3"><DesignJobForm value={value} copy={copy} /></div></details> : null}
                <details className="mt-2 border border-rule bg-card"><summary className="flex min-h-11 cursor-pointer items-center px-3 text-smallmeta font-semibold">{copy.history} ({history.length})</summary><div className="border-t border-rule p-3">{history.length === 0 ? <p className="form-note">—</p> : <div className="data-list">{history.map((item) => <div key={item.id} className="data-row"><span className="data-row__title">{copy.statuses[isDesignStatus(item.toStatus) ? item.toStatus : "new"]}</span><span className="data-row__meta"><span>{item.staffName ?? "Staff"}</span><span>{formatDateTime(item.createdAt, session.staff.adminLocale)}</span>{item.note ? <span>{item.note}</span> : null}</span></div>)}</div>}</div></details>
                <details className="mt-2 border border-rule bg-card"><summary className="flex min-h-11 cursor-pointer items-center px-3 text-smallmeta font-semibold">{copy.files} ({jobFiles.length})</summary><div className="border-t border-rule p-3">{jobFiles.length === 0 ? <p className="form-note">{copy.noFiles}</p> : <div className="data-list">{jobFiles.map((file) => <div key={file.id} className="data-row"><span className="data-row__title">{file.fileName}</span><span className="data-row__meta"><span>{file.contentType ?? "file"}</span>{file.sizeBytes ? <span>{formatBytes(file.sizeBytes)}</span> : null}</span></div>)}</div>}</div></details>
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}

function groupBy<T>(items: T[], key: (item: T) => number) { const map = new Map<number, T[]>(); for (const item of items) { const id = key(item); const list = map.get(id) ?? []; list.push(item); map.set(id, list); } return map; }
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
function statusTone(status: DesignStatus) { if (["new", "review", "approved", "in_progress", "sample_shared", "finalised"].includes(status)) return "status-active"; if (["info_needed", "quote_prepared", "quote_sent", "revision"].includes(status)) return "status-pending"; return "status-off"; }
function plusDays(date: string, days: number) { const d = new Date(`${date}T00:00:00+05:30`); d.setDate(d.getDate() + days); return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
function formatDateTime(value: Date, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value); }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
