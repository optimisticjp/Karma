import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { hasPermission } from "@/lib/auth/access";
import { admissionsCopy } from "@/lib/admin/admissions-copy";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform } from "@/lib/admin/record-actions";
import { readCourseOperations } from "@/lib/admin/course-operations";
import { RecordMenu } from "@/components/admin/RecordMenu";
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  type ApplicationStatus
} from "@/lib/admin/admissions";
import { ApplicationNoteForm, ApplicationUpdateForm, ManualEnquiryForm } from "./AdmissionForms";

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string; archived?: string }>;
};

export default async function AdmissionsPage({ searchParams }: PageProps) {
  const session = await requireAdmin("/admin/admissions");
  const copy = admissionsCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);
  const subject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) => hasPermission(session.staff, permission)
  };
  const applicationCan = {
    archive: canPerform(subject, "application", "archive"),
    restore: canPerform(subject, "application", "restore"),
    delete: canPerform(subject, "application", "delete")
  };
  const canView =
    hasPermission(session.staff, "applications.view") ||
    hasPermission(session.staff, "applications.manage");
  const canManage = hasPermission(session.staff, "applications.manage");
  if (!canView) redirect("/admin/no-access?reason=permission");

  const db = getDb();
  if (!db) {
    return (
      <div className="max-w-[72rem]">
        <PageHead title={copy.title} context={copy.lede} />
        <p className="alert alert-error mt-8">Database unavailable.</p>
      </div>
    );
  }

  const params = await searchParams;
  const statusFilter = isApplicationStatus(params.status) ? params.status : null;
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 120) : "";
  const showArchived = params.archived === "1";

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
        preferredSchedule: schema.applications.preferredSchedule,
        demoSlot: schema.applications.demoSlot,
        termsVersion: schema.applications.termsVersion,
        archivedAt: schema.applications.archivedAt,
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
      /* Archived enquiries stay reachable but are out of the working list. */
      .where(showArchived ? undefined : isNull(schema.applications.archivedAt))
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
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        operations: schema.courses.operations
      })
      .from(schema.courses)
      .where(and(eq(schema.courses.active, true), isNull(schema.courses.archivedAt)))
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

  /*
   * Slot KEYS to readable times.
   *
   * `preferred_schedule` and `demo_slot` store a key — `morning-0800`,
   * `demo-1400` — validated on submission against the course's own timetable.
   * This page printed the raw key as the "Preferred timing" fact, and
   * `demoSlot` was selected and rendered nowhere at all: the one field that
   * says when the applicant wants to come in for their free demo, fetched on
   * every load and thrown away.
   *
   * The labels come from `courses.operations`, which is one more column on a
   * SELECT that already runs — the payload is validated on read, the same rule
   * every other reader of it follows, so a malformed row renders an empty
   * timetable rather than 500-ing a staff page.
   */
  const slotLabels = new Map<string, string>();
  for (const course of courses) {
    const ops = readCourseOperations(course.operations);
    for (const slot of ops.scheduleOptions) {
      slotLabels.set(`${course.slug}:${slot.key}`, `${slot.startTime}–${slot.endTime}`);
    }
    for (const slot of ops.demo?.slots ?? []) {
      slotLabels.set(`${course.slug}:${slot.key}`, `${slot.startTime}–${slot.endTime}`);
    }
  }
  /** The stored key is the fallback: never invent a time we cannot resolve. */
  const slotLabel = (slug: string | null, key: string | null) =>
    key ? slotLabels.get(`${slug ?? ""}:${key}`) ?? key : null;
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
      <PageHead title={copy.title} context={copy.lede} />

      {/* Three `panel panel-body` tiles went single-column at 390px and cost
          306px before any enquiry. Rows on a phone, cells from 640px. */}
      <div className="console-metrics mt-3">
        <div>
          <span className="kv-label">{copy.visible}</span>
          <span className="kv-value">{applications.length}</span>
        </div>
        <div>
          <span className="kv-label">{copy.newApplications}</span>
          <span className="kv-value">{newCount}</span>
        </div>
        <div>
          <span className="kv-label">{copy.followUpsDue}</span>
          <span className="kv-value">{followUpsDue}</span>
        </div>
      </div>

      {canManage ? (
        <details className="panel mt-3">
          {/* The hint used to render inside the summary, so a 101-character
              sentence took three lines on a phone whether or not the form was
              open. It belongs with the form it explains. */}
          <summary className="panel-head cursor-pointer list-none">
            <h2 className="text-h4">{copy.addEnquiry}</h2>
            <span aria-hidden className="text-h4">＋</span>
          </summary>
          <div className="panel-body border-t border-rule">
            <p className="form-note mb-3">{copy.addEnquiryHint}</p>
            <ManualEnquiryForm
              staff={staff}
              courses={courseOptions}
              defaultAssignee={session.staff.id}
              copy={copy}
            />
          </div>
        </details>
      ) : (
        <p className="form-note mt-3">{copy.viewOnly}</p>
      )}

      {/* Four stacked full-width rows cost 292px of sticky chrome before the
          list. Search and status share a row on a phone; the archived toggle
          and the two buttons share the next one. */}
      <form method="get" className="toolbar mt-3 grid-cols-2 md:grid-cols-[1fr_14rem_auto_auto] md:items-end">
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
        <label className="choice-chip w-fit self-end text-smallmeta">
          <input type="checkbox" name="archived" value="1" className="size-4 accent-vermilion" defaultChecked={showArchived} />
          {records.showArchived}
        </label>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">{copy.applyFilters}</button>
          <Link className="btn btn-secondary" href="/admin/admissions">{copy.clearFilters}</Link>
        </div>
      </form>

      <section className="data-list mt-3" aria-label={copy.title}>
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
              /* A closed row is one line of facts a follow-up can be made from
                 without opening anything; opening it reveals the full record
                 and the forms. Native <details>, so no JavaScript and no page
                 change — the operator keeps their place in the list. */
              <details key={application.id} id={`app-${application.id}`} className="record-anchor">
                <summary className={`data-row ${application.archivedAt ? "is-archived" : ""}`}>
                  <span className="data-row__title">{application.fullName}</span>
                  <span className="data-row__actions">
                    {application.duplicateOfPhone ? (
                      <span className="chip status-pending">{copy.duplicate}</span>
                    ) : null}
                    <span className={`chip ${application.archivedAt ? "status-off" : statusTone(status)}`}>
                      {application.archivedAt ? records.archived : copy.statuses[status]}
                    </span>
                  </span>
                  {/* Two meta lines: who and what on the first, when and with
                      whom on the second. The follow-up date carries the tone
                      the page already computes for its own count — an overdue
                      follow-up is the reason to open this row. */}
                  <span className="data-row__meta">
                    <span>{application.reference}</span>
                    <span>{courseName}</span>
                    <span>{slotLabel(application.courseSlug, application.preferredSchedule) ?? "—"}</span>
                  </span>
                  <span className="data-row__meta">
                    {application.nextFollowUp ? (
                      <span
                        className={
                          application.nextFollowUp <= today &&
                          !["enrolled", "not_proceeding", "closed"].includes(application.status)
                            ? "text-error"
                            : undefined
                        }
                      >
                        {copy.followUp}: {application.nextFollowUp}
                      </span>
                    ) : null}
                    {application.demoSlot ? (
                      <span>
                        {copy.demoSlot}: {slotLabel(application.courseSlug, application.demoSlot)}
                      </span>
                    ) : null}
                    <span>{application.assignedName ?? copy.unassigned}</span>
                  </span>
                </summary>

                <div className="grid gap-6 border-t border-line bg-ivory-2/40 px-3 py-4 md:px-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <a className="stitch-link font-semibold" href={`https://wa.me/91${application.whatsapp}`}>
                      WhatsApp {application.whatsapp}
                    </a>
                    <RecordMenu
                      entity="application"
                      id={application.id}
                      label={application.reference}
                      archived={Boolean(application.archivedAt)}
                      canArchive={applicationCan.archive && canManage}
                      canRestore={applicationCan.restore && canManage}
                      canDelete={applicationCan.delete}
                      copy={records}
                    />
                  </div>

                  <dl className="kv-grid">
                    <Fact label={copy.course} value={courseName} />
                    <Fact
                      label={copy.timing}
                      value={
                        slotLabel(application.courseSlug, application.preferredSchedule) ??
                        application.preferredTiming ??
                        "—"
                      }
                    />
                    <Fact
                      label={copy.demoSlot}
                      value={slotLabel(application.courseSlug, application.demoSlot) ?? "—"}
                    />
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
              </details>
            );
          })
        )}
      </section>
      <p className="form-note mt-6">Showing the latest 200 enquiries before filters.</p>
    </div>
  );
}



function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="kv-label">{label}</dt><dd className="kv-value mt-0.5">{value}</dd></div>;
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
