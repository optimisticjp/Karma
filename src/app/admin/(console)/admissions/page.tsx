import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { admissionsCopy } from "@/lib/admin/admissions-copy";
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus
} from "@/lib/admin/admissions";
import { ApplicationNoteForm, ApplicationUpdateForm, ManualEnquiryForm } from "./AdmissionForms";

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdmissionsPage({ searchParams }: PageProps) {
  const session = await requireAdmin("/admin/admissions");
  const copy = admissionsCopy(session.staff.adminLocale);
  const canView =
    hasPermission(session.staff, "applications.view") ||
    hasPermission(session.staff, "applications.manage");
  const canManage = hasPermission(session.staff, "applications.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");

  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[72rem]">
        <PageHeading title={copy.title} lede={copy.lede} />
        <p className="alert alert-error mt-8">Database unavailable.</p>
      </div>
    );
  }

  const params = await searchParams;
  const statusFilter = isApplicationStatus(params.status) ? params.status : null;
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";

  const [rawApplications, staff, courses] = await Promise.all([
    db
      .select({
        id: schema.applications.id,
        reference: schema.applications.reference,
        fullName: schema.applications.fullName,
        whatsapp: schema.applications.whatsapp,
        email: schema.applications.email,
        locale: schema.applications.locale,
        courseSlug: schema.applications.courseSlug,
        preferredTiming: schema.applications.preferredTiming,
        experience: schema.applications.experience,
        occupation: schema.applications.occupation,
        area: schema.applications.area,
        goal: schema.applications.goal,
        heardFrom: schema.applications.heardFrom,
        ageBand: schema.applications.ageBand,
        guardianName: schema.applications.guardianName,
        guardianPhone: schema.applications.guardianPhone,
        duplicateOfPhone: schema.applications.duplicateOfPhone,
        status: schema.applications.status,
        assignedTo: schema.applications.assignedTo,
        assignedName: schema.staff.name,
        nextFollowUp: schema.applications.nextFollowUp,
        closureReason: schema.applications.closureReason,
        createdAt: schema.applications.createdAt,
        updatedAt: schema.applications.updatedAt
      })
      .from(schema.applications)
      .leftJoin(schema.staff, eq(schema.applications.assignedTo, schema.staff.id))
      .orderBy(desc(schema.applications.createdAt))
      .limit(200),
    db
      .select({ id: schema.staff.id, name: schema.staff.name })
      .from(schema.staff)
      .where(
        and(
          eq(schema.staff.active, true),
          eq(schema.staff.status, "active"),
          or(eq(schema.staff.role, "owner"), eq(schema.staff.role, "admin"))
        )
      )
      .orderBy(asc(schema.staff.name)),
    db
      .select({ slug: schema.courses.slug, nameEn: schema.courses.nameEn, nameGu: schema.courses.nameGu })
      .from(schema.courses)
      .where(eq(schema.courses.active, true))
      .orderBy(asc(schema.courses.sortOrder), asc(schema.courses.nameEn))
  ]);

  const applications = rawApplications.filter((application) => {
    if (statusFilter && application.status !== statusFilter) return false;
    if (!query) return true;
    return [application.reference, application.fullName, application.whatsapp, application.email ?? ""]
      .some((value) => value.toLowerCase().includes(query));
  });

  const ids = applications.map((application) => application.id);
  const notes = ids.length
    ? await db
        .select({
          id: schema.applicationNotes.id,
          applicationId: schema.applicationNotes.applicationId,
          note: schema.applicationNotes.note,
          staffName: schema.staff.name,
          createdAt: schema.applicationNotes.createdAt
        })
        .from(schema.applicationNotes)
        .leftJoin(schema.staff, eq(schema.applicationNotes.staffId, schema.staff.id))
        .where(inArray(schema.applicationNotes.applicationId, ids))
        .orderBy(desc(schema.applicationNotes.createdAt))
    : [];

  const notesByApplication = new Map<number, typeof notes>();
  for (const note of notes) {
    const list = notesByApplication.get(note.applicationId) ?? [];
    list.push(note);
    notesByApplication.set(note.applicationId, list);
  }

  const courseNames = new Map(
    courses.map((course) => [course.slug, session.staff.adminLocale === "gu" ? course.nameGu : course.nameEn])
  );
  const courseOptions = courses.map((course) => ({
    slug: course.slug,
    name: session.staff.adminLocale === "gu" ? course.nameGu : course.nameEn
  }));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const newCount = applications.filter((application) => application.status === "new").length;
  const followUpsDue = applications.filter(
    (application) =>
      application.nextFollowUp != null &&
      application.nextFollowUp <= today &&
      !["enrolled", "not_proceeding", "closed"].includes(application.status)
  ).length;

  return (
    <div className="max-w-[76rem]">
      <PageHeading title={copy.title} lede={copy.lede} />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label={copy.visible} value={applications.length} />
        <Metric label={copy.newApplications} value={newCount} />
        <Metric label={copy.followUpsDue} value={followUpsDue} />
      </div>

      {canManage ? (
        <details className="panel mt-8">
          <summary className="panel-head cursor-pointer list-none">
            <div>
              <h2 className="text-h4">{copy.addEnquiry}</h2>
              <p className="form-note mt-1">{copy.addEnquiryHint}</p>
            </div>
            <span aria-hidden className="text-h4">＋</span>
          </summary>
          <div className="panel-body border-t border-rule">
            <ManualEnquiryForm
              staff={staff}
              courses={courseOptions}
              defaultAssignee={session.staff.id}
              copy={copy}
            />
          </div>
        </details>
      ) : (
        <p className="form-note mt-6">{copy.viewOnly}</p>
      )}

      <form method="get" className="panel panel-body mt-8 grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end">
        <Field label={copy.search} htmlFor="admissions-search">
          <input
            id="admissions-search"
            name="q"
            className="input"
            maxLength={120}
            placeholder={copy.searchPlaceholder}
            defaultValue={params.q ?? ""}
          />
        </Field>
        <Field label={copy.statusFilter} htmlFor="admissions-status-filter">
          <select id="admissions-status-filter" name="status" className="input" defaultValue={statusFilter ?? ""}>
            <option value="">{copy.allStatuses}</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{copy.statuses[status]}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">{copy.applyFilters}</button>
          <Link className="btn btn-secondary" href="/admin/admissions">{copy.clearFilters}</Link>
        </div>
      </form>

      <section className="mt-8 grid gap-5" aria-label={copy.title}>
        {applications.length === 0 ? (
          <p className="empty-state">{copy.empty}</p>
        ) : (
          applications.map((application) => {
            const status = asStatus(application.status);
            const applicationNotes = notesByApplication.get(application.id) ?? [];
            const courseName = application.courseSlug
              ? courseNames.get(application.courseSlug) ?? application.courseSlug
              : "—";
            return (
              <article key={application.id} className="panel">
                <div className="panel-head flex-wrap gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="microlabel">{application.reference}</p>
                      {application.duplicateOfPhone ? <span className="status status-pending">{copy.duplicate}</span> : null}
                    </div>
                    <h2 className="text-h4 mt-1">{application.fullName}</h2>
                    <p className="form-note mt-1">
                      <a href={`https://wa.me/91${application.whatsapp}`}>WhatsApp {application.whatsapp}</a>
                      {application.email ? ` · ${application.email}` : ""}
                    </p>
                  </div>
                  <span className={`status ${statusTone(status)}`}>{copy.statuses[status]}</span>
                </div>

                <div className="panel-body grid gap-6">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Fact label={copy.course} value={courseName} />
                    <Fact label={copy.timing} value={application.preferredTiming ?? "—"} />
                    <Fact label={copy.area} value={application.area ?? "—"} />
                    <Fact label={copy.created} value={formatDateTime(application.createdAt, session.staff.adminLocale)} />
                    <Fact label={copy.experience} value={application.experience ?? "—"} />
                    <Fact label={copy.occupation} value={application.occupation ?? "—"} />
                    <Fact label={copy.source} value={application.heardFrom ?? "—"} />
                    <Fact label={copy.assignedTo} value={application.assignedName ?? copy.unassigned} />
                  </dl>

                  {application.goal ? (
                    <div><p className="microlabel">{copy.goal}</p><p className="mt-2 text-smallmeta whitespace-pre-wrap">{application.goal}</p></div>
                  ) : null}

                  {application.guardianName || application.guardianPhone ? (
                    <div>
                      <p className="microlabel">{copy.guardian}</p>
                      <p className="mt-2 text-smallmeta">{[application.guardianName, application.guardianPhone].filter(Boolean).join(" · ")}</p>
                    </div>
                  ) : null}

                  {canManage ? (
                    <ApplicationUpdateForm
                      applicationId={application.id}
                      status={status}
                      assignedTo={application.assignedTo}
                      nextFollowUp={application.nextFollowUp}
                      closureReason={application.closureReason}
                      staff={staff}
                      copy={copy}
                    />
                  ) : null}

                  <section className="border-t border-rule pt-5">
                    <h3 className="text-smallmeta font-semibold">{copy.notes}</h3>
                    {applicationNotes.length === 0 ? (
                      <p className="form-note mt-3">{copy.noNotes}</p>
                    ) : (
                      <div className="mt-3 grid gap-3">
                        {applicationNotes.map((note) => (
                          <div key={note.id} className="rounded-[var(--radius-card)] border border-rule p-4">
                            <p className="text-smallmeta whitespace-pre-wrap">{note.note}</p>
                            <p className="form-note mt-2">{note.staffName ?? "Staff"} · {formatDateTime(note.createdAt, session.staff.adminLocale)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {canManage ? <div className="mt-5"><ApplicationNoteForm applicationId={application.id} copy={copy} /></div> : null}
                  </section>
                </div>
              </article>
            );
          })
        )}
      </section>
      <p className="form-note mt-6">Showing the latest 200 enquiries before filters.</p>
    </div>
  );
}

function PageHeading({ title, lede }: { title: string; lede: string }) {
  return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="u-lede">{lede}</p></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="panel panel-body"><p className="microlabel">{label}</p><p className="text-h3 mt-2">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="microlabel">{label}</dt><dd className="mt-1 text-smallmeta">{value}</dd></div>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label className="label" htmlFor={htmlFor}>{label}</label>{children}</div>;
}

function asStatus(value: string): ApplicationStatus {
  return isApplicationStatus(value) ? value : "new";
}

function statusTone(status: ApplicationStatus) {
  if (["new", "contacted", "demo_scheduled", "visit_done", "accepted", "documents_pending"].includes(status)) return "status-active";
  if (status === "waitlisted") return "status-pending";
  return "status-off";
}

function formatDateTime(value: Date, locale: "en" | "gu") {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}
