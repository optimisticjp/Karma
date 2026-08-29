import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { getAdminT } from "@/lib/admin/i18n";
import { getDashboardCounts, getRecentActivity } from "@/lib/admin/dashboard";
import { Metric } from "@/components/admin/Metric";

/**
 * Today at Karma is a work desk, not an analytics wall. Each admin sees only
 * queues and shortcuts their explicit permissions let them work on. The Owner
 * naturally sees the full studio because owner permission checks short-circuit.
 */
export default async function TodayPage() {
  const session = await requireAdmin("/admin");
  const t = getAdminT(session.staff.adminLocale);

  const canAdmissions = hasPermission(session.staff, "applications.view") || hasPermission(session.staff, "applications.manage");
  const canClasses =
    hasPermission(session.staff, "students.view") ||
    hasPermission(session.staff, "students.manage") ||
    hasPermission(session.staff, "courses.view") ||
    hasPermission(session.staff, "courses.manage") ||
    hasPermission(session.staff, "batches.view") ||
    hasPermission(session.staff, "batches.manage") ||
    hasPermission(session.staff, "attendance.view") ||
    hasPermission(session.staff, "attendance.manage");
  const canDesign = hasPermission(session.staff, "design.view") || hasPermission(session.staff, "design.manage");
  const canAudit = hasPermission(session.staff, "audit.view");

  const [dashboard, activity] = await Promise.all([
    getDashboardCounts(),
    canAudit ? getRecentActivity() : Promise.resolve([])
  ]);

  if (!dashboard.available) {
    return (
      <div className="max-w-[48rem]">
        <Header title={t("today.title")} greeting={t("today.greeting", { name: session.staff.name })} />
        <p className="alert mt-8">{t("today.notConfigured")}</p>
      </div>
    );
  }

  const c = dashboard.counts;
  const attention = (canAdmissions ? c.newApplications + c.followUpsDue : 0) + (canDesign ? c.newBriefs : 0);
  const quickActions = [
    hasPermission(session.staff, "applications.manage") ? { href: "/admin/admissions", label: t("nav.admissions") } : null,
    hasPermission(session.staff, "students.manage") ? { href: "/admin/students", label: t("nav.students") } : null,
    hasPermission(session.staff, "attendance.manage") ? { href: "/admin/attendance", label: t("nav.attendance") } : null,
    hasPermission(session.staff, "fees.manage") ? { href: "/admin/fees", label: t("permissions.groups.fees") } : null,
    hasPermission(session.staff, "batches.manage") || hasPermission(session.staff, "courses.manage")
      ? { href: "/admin/courses", label: t("nav.coursesBatches") }
      : null,
    hasPermission(session.staff, "design.manage") ? { href: "/admin/design", label: t("nav.designDesk") } : null,
    hasPermission(session.staff, "certificates.manage") ? { href: "/admin/certificates", label: t("nav.certificates") } : null,
    hasPermission(session.staff, "content.manage") ? { href: "/admin/content", label: t("nav.content") } : null,
    hasPermission(session.staff, "reports.view") || hasPermission(session.staff, "audit.view") || hasPermission(session.staff, "exports.run")
      ? { href: "/admin/reports", label: t("nav.reports") }
      : null,
    session.role === "owner" ? { href: "/admin/team", label: t("nav.team") } : null
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <div className="max-w-[64rem]">
      <Header title={t("today.title")} greeting={t("today.greeting", { name: session.staff.name })} />

      {(canAdmissions || canDesign) ? (
        <section className="mt-10" aria-labelledby="attention-heading">
          <h2 id="attention-heading" className="text-h4">{t("today.needsAttention")}</h2>
          {attention === 0 ? (
            <p className="empty-state mt-4">{t("today.allClear")}</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {canAdmissions ? (
                <>
                  <Metric label={t("today.newApplications")} hint={t("today.newApplicationsHint")} value={c.newApplications} emphasis={c.newApplications > 0} />
                  <Metric label={t("today.followUpsDue")} hint={t("today.followUpsDueHint")} value={c.followUpsDue} emphasis={c.followUpsDue > 0} />
                </>
              ) : null}
              {canDesign ? <Metric label={t("today.newBriefs")} hint={t("today.newBriefsHint")} value={c.newBriefs} emphasis={c.newBriefs > 0} /> : null}
            </div>
          )}
        </section>
      ) : null}

      {(canAdmissions || canClasses || canDesign) ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {canAdmissions ? (
            <Panel title={t("today.admissions")}>
              <Metric label={t("today.applicationsWeek")} value={c.applicationsThisWeek} />
            </Panel>
          ) : null}
          {canClasses ? (
            <Panel title={t("today.classes")}>
              <Metric label={t("today.runningBatches")} value={c.runningBatches} />
              <Metric label={t("today.upcomingBatches")} value={c.upcomingBatches} />
            </Panel>
          ) : null}
          {canDesign ? (
            <Panel title={t("today.designLab")}>
              <Metric label={t("today.openBriefs")} value={c.openBriefs} />
            </Panel>
          ) : null}
        </div>
      ) : null}

      {canAudit ? (
        <section className="mt-10" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-h4">{t("today.recentActivity")}</h2>
          {activity.length === 0 ? (
            <p className="empty-state mt-4">{t("today.noActivity")}</p>
          ) : (
            <ol className="panel mt-4 divide-y divide-line">
              {activity.map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                  <span className="text-smallmeta font-semibold">{humanAction(row.action)}</span>
                  <span className="form-note">{row.entity}{row.entityId ? ` #${row.entityId}` : ""}</span>
                  <time className="form-note ml-auto" dateTime={new Date(row.createdAt).toISOString()}>{formatIst(row.createdAt, session.staff.adminLocale)}</time>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      {quickActions.length > 0 ? (
        <section className="mt-10" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-h4">{t("today.quickActions")}</h2>
          <div className="u-actions flex flex-wrap gap-3">
            {quickActions.map((item) => <Link key={item.href} href={item.href} className="btn btn-secondary">{item.label}</Link>)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Header({ title, greeting }: { title: string; greeting: string }) {
  return <div><h1 className="text-h2">{title}</h1><span aria-hidden className="rule-stitch is-in" /><p className="form-note mt-4">{greeting}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-head"><h2 className="text-h4">{title}</h2></div><div className="panel-body grid gap-5">{children}</div></section>;
}

function formatIst(value: Date | string, locale: "en" | "gu") {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function humanAction(value: string) {
  return value.replace(/[._]/g, " ");
}
