import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { designCopy } from "@/lib/admin/design-copy";
import { DESIGN_STATUSES, isDesignStatus, type DesignStatus } from "@/lib/admin/design";
import { DesignJobForm, DesignStatusForm, type DesignValue } from "./DesignForms";

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function DesignPage({ searchParams }: Props) {
  const session = await requireAdmin("/admin/design");
  const canView = hasPermission(session.staff, "design.view") || hasPermission(session.staff, "design.manage");
  const canManage = hasPermission(session.staff, "design.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");
  const copy = designCopy(session.staff.adminLocale);
  const db = getDb();
  if (!db) return <div className="max-w-[80rem]"><Heading title={copy.title} lede={copy.lede} /><p className="alert alert-error mt-8">Database unavailable.</p></div>;

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const statusFilter = isDesignStatus(params.status) ? params.status : null;
  const [jobsRaw, histories, files] = await Promise.all([
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
    }).from(schema.serviceEnquiries).orderBy(desc(schema.serviceEnquiries.updatedAt)).limit(300),
    db.select({ id: schema.serviceStatusHistory.id, enquiryId: schema.serviceStatusHistory.enquiryId, fromStatus: schema.serviceStatusHistory.fromStatus, toStatus: schema.serviceStatusHistory.toStatus, note: schema.serviceStatusHistory.note, staffName: schema.staff.name, createdAt: schema.serviceStatusHistory.createdAt })
      .from(schema.serviceStatusHistory)
      .leftJoin(schema.staff, eq(schema.serviceStatusHistory.byStaff, schema.staff.id))
      .orderBy(desc(schema.serviceStatusHistory.createdAt)),
    db.select({ id: schema.serviceFiles.id, enquiryId: schema.serviceFiles.enquiryId, fileName: schema.serviceFiles.fileName, sizeBytes: schema.serviceFiles.sizeBytes, contentType: schema.serviceFiles.contentType, createdAt: schema.serviceFiles.createdAt })
      .from(schema.serviceFiles).orderBy(desc(schema.serviceFiles.createdAt))
  ]);

  const jobs = jobsRaw.filter((job) => {
    if (statusFilter && job.status !== statusFilter) return false;
    if (!q) return true;
    return [job.reference, job.name, job.company ?? "", job.phone, job.productType ?? ""].some((value) => value.toLowerCase().includes(q));
  });
  const historyByJob = groupBy(histories, (item) => item.enquiryId);
  const filesByJob = groupBy(files, (item) => item.enquiryId);
  const today = kolkataDate();
  const terminal = new Set<DesignStatus>(["delivered", "closed"]);
  const needsAction = jobs.filter((job) => ["new", "info_needed", "quote_prepared", "quote_sent", "revision"].includes(job.status)).length;
  const dueSoon = jobs.filter((job) => job.deadline && job.deadline <= plusDays(today, 3) && !terminal.has(job.status as DesignStatus)).length;

  return (
    <div className="max-w-[82rem]">
      <Heading title={copy.title} lede={copy.lede} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label={copy.jobsShown} value={jobs.length} /><Metric label={copy.needsAction} value={needsAction} /><Metric label={copy.dueSoon} value={dueSoon} /></div>
      <p className="form-note mt-5">{copy.r2Note}</p>

      {canManage ? (
        <details className="panel mt-8">
          <summary className="panel-head cursor-pointer list-none"><div><h2 className="text-h4">{copy.addJob}</h2><p className="form-note mt-1">{copy.addJobHint}</p></div><span aria-hidden className="text-h4">＋</span></summary>
          <div className="panel-body border-t border-rule"><DesignJobForm copy={copy} /></div>
        </details>
      ) : <p className="form-note mt-5">{copy.viewOnly}</p>}

      <form method="get" className="panel panel-body mt-8 grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end">
        <Field label={copy.search} htmlFor="design-search"><input id="design-search" name="q" className="input" defaultValue={params.q ?? ""} placeholder={copy.searchPlaceholder} /></Field>
        <Field label={copy.stage} htmlFor="design-stage-filter"><select id="design-stage-filter" name="status" className="input" defaultValue={statusFilter ?? ""}><option value="">{copy.allStages}</option>{DESIGN_STATUSES.map((status) => <option key={status} value={status}>{copy.statuses[status]}</option>)}</select></Field>
        <div className="flex gap-2"><button className="btn btn-primary" type="submit">{copy.show}</button><Link className="btn btn-secondary" href="/admin/design">{copy.clear}</Link></div>
      </form>

      <section className="mt-8 grid gap-5">
        {jobs.length === 0 ? <p className="empty-state">{copy.empty}</p> : jobs.map((job) => {
          const status = isDesignStatus(job.status) ? job.status : "new";
          const history = historyByJob.get(job.id) ?? [];
          const jobFiles = filesByJob.get(job.id) ?? [];
          const value: DesignValue = { id: job.id, name: job.name, company: job.company, phone: job.phone, email: job.email, productType: job.productType, technique: job.technique, dimensions: job.dimensions, quantity: job.quantity, colourCount: job.colourCount, fileFormat: job.fileFormat, deadline: job.deadline, details: job.details, locale: job.locale };
          return (
            <article key={job.id} className="panel">
              <div className="panel-head flex-wrap gap-4">
                <div><p className="microlabel">{job.reference}</p><h2 className="text-h4 mt-1">{job.name}{job.company ? ` · ${job.company}` : ""}</h2><p className="form-note mt-1"><a href={`https://wa.me/91${job.phone}`}>WhatsApp {job.phone}</a>{job.email ? ` · ${job.email}` : ""}</p></div>
                <span className={`status ${statusTone(status)}`}>{copy.statuses[status]}</span>
              </div>
              <div className="panel-body grid gap-6">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Fact label={copy.productType} value={job.productType ?? "—"} /><Fact label={copy.technique} value={job.technique ?? "—"} /><Fact label={copy.dimensions} value={job.dimensions ?? "—"} /><Fact label={copy.quantity} value={job.quantity ?? "—"} /><Fact label={copy.deadline} value={job.deadline ? formatDate(job.deadline, session.staff.adminLocale) : "—"} /></dl>
                {job.details ? <div><p className="microlabel">{copy.details}</p><p className="text-smallmeta mt-2 whitespace-pre-wrap">{job.details}</p></div> : null}
                {canManage ? <DesignStatusForm enquiryId={job.id} status={status} copy={copy} /> : null}
                {canManage ? <details className="border-t border-rule pt-5"><summary className="cursor-pointer font-semibold">Edit job details</summary><div className="mt-5"><DesignJobForm value={value} copy={copy} /></div></details> : null}
                <details className="border-t border-rule pt-5"><summary className="cursor-pointer font-semibold">{copy.history} ({history.length})</summary><div className="mt-4 grid gap-3">{history.length === 0 ? <p className="form-note">—</p> : history.map((item) => <div key={item.id} className="rounded-[var(--radius-card)] border border-rule p-4"><div className="flex flex-wrap justify-between gap-3"><p className="font-semibold">{copy.statuses[isDesignStatus(item.toStatus) ? item.toStatus : "new"]}</p><p className="form-note">{formatDateTime(item.createdAt, session.staff.adminLocale)}</p></div><p className="form-note mt-1">{item.staffName ?? "Staff"}</p>{item.note ? <p className="text-smallmeta mt-2">{item.note}</p> : null}</div>)}</div></details>
                <details className="border-t border-rule pt-5"><summary className="cursor-pointer font-semibold">{copy.files} ({jobFiles.length})</summary><div className="mt-4">{jobFiles.length === 0 ? <p className="form-note">{copy.noFiles}</p> : <div className="grid gap-2">{jobFiles.map((file) => <div key={file.id} className="rounded-[var(--radius-card)] border border-rule p-3"><p className="font-semibold">{file.fileName}</p><p className="form-note mt-1">{file.contentType ?? "file"}{file.sizeBytes ? ` · ${formatBytes(file.sizeBytes)}` : ""}</p></div>)}</div>}</div></details>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function groupBy<T>(items: T[], key: (item: T) => number) { const map = new Map<number, T[]>(); for (const item of items) { const id = key(item); const list = map.get(id) ?? []; list.push(item); map.set(id, list); } return map; }
function Heading({ title, lede }: { title: string; lede: string }) { return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="microlabel">{label}</dt><dd className="text-smallmeta mt-1">{value}</dd></div>; }
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>; }
function statusTone(status: DesignStatus) { if (["new", "review", "approved", "in_progress", "sample_shared", "finalised"].includes(status)) return "status-active"; if (["info_needed", "quote_prepared", "quote_sent", "revision"].includes(status)) return "status-pending"; return "status-off"; }
function kolkataDate() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); }
function plusDays(date: string, days: number) { const d = new Date(`${date}T00:00:00+05:30`); d.setDate(d.getDate() + days); return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); }
function formatDate(value: string, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`)); }
function formatDateTime(value: Date, locale: "en" | "gu") { return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value); }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
