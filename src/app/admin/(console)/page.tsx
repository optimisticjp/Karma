import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminT } from "@/lib/admin/i18n";
import { getDashboardCounts, getRecentActivity } from "@/lib/admin/dashboard";
import { Metric } from "@/components/admin/Metric";

/**
 * Today at Karma.
 *
 * An operations desk, not an analytics dashboard: counts that change what
 * someone does in the next hour, no charts, no percentages, no invented
 * figures. When the database is not connected the page says exactly that
 * (CLAUDE.md #2 — no ghost content, no unverified numbers).
 */
export default async function TodayPage() {
  const session = await requireAdmin("/admin");
  const t = getAdminT(session.staff.adminLocale);

  const [dashboard, activity] = await Promise.all([
    getDashboardCounts(),
    getRecentActivity()
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
  const attention = c.newApplications + c.followUpsDue + c.newBriefs;

  return (
    <div className="max-w-[64rem]">
      <Header title={t("today.title")} greeting={t("today.greeting", { name: session.staff.name })} />

      {/* -------------------------- needs attention ------------------------ */}
      <section className="mt-10" aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="text-h4">
          {t("today.needsAttention")}
        </h2>
        {attention === 0 ? (
          <p className="empty-state mt-4">{t("today.allClear")}</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric
              label={t("today.newApplications")}
              hint={t("today.newApplicationsHint")}
              value={c.newApplications}
              emphasis={c.newApplications > 0}
            />
            <Metric
              label={t("today.followUpsDue")}
              hint={t("today.followUpsDueHint")}
              value={c.followUpsDue}
              emphasis={c.followUpsDue > 0}
            />
            <Metric
              label={t("today.newBriefs")}
              hint={t("today.newBriefsHint")}
              value={c.newBriefs}
              emphasis={c.newBriefs > 0}
            />
          </div>
        )}
      </section>

      {/* ------------------------------ the desk --------------------------- */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <Panel title={t("today.admissions")}>
          <Metric label={t("today.applicationsWeek")} value={c.applicationsThisWeek} />
        </Panel>
        <Panel title={t("today.classes")}>
          <Metric label={t("today.runningBatches")} value={c.runningBatches} />
          <Metric label={t("today.upcomingBatches")} value={c.upcomingBatches} />
        </Panel>
        <Panel title={t("today.designLab")}>
          <Metric label={t("today.openBriefs")} value={c.openBriefs} />
        </Panel>
      </div>

      <p className="form-note mt-4">{t("today.moduleLater")}</p>

      {/* --------------------------- recent activity ----------------------- */}
      <section className="mt-10" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="text-h4">
          {t("today.recentActivity")}
        </h2>
        {activity.length === 0 ? (
          <p className="empty-state mt-4">{t("today.noActivity")}</p>
        ) : (
          <ol className="panel mt-4 divide-y divide-line">
            {activity.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-smallmeta font-semibold">{row.action}</span>
                <span className="form-note">
                  {row.entity}
                  {row.entityId ? ` #${row.entityId}` : ""}
                </span>
                <time
                  className="form-note ml-auto"
                  dateTime={new Date(row.createdAt).toISOString()}
                >
                  {formatIst(row.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---------------------------- quick actions ------------------------ */}
      {session.role === "owner" ? (
        <section className="mt-10" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-h4">
            {t("today.quickActions")}
          </h2>
          <div className="u-actions flex flex-wrap gap-3">
            <Link href="/admin/team" className="btn btn-secondary">
              {t("nav.team")}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Header({ title, greeting }: { title: string; greeting: string }) {
  return (
    <div>
      <h1 className="text-h2">{title}</h1>
      <span aria-hidden className="rule-stitch is-in" />
      <p className="form-note mt-4">{greeting}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="text-h4">{title}</h2>
      </div>
      <div className="panel-body grid gap-5">{children}</div>
    </section>
  );
}

/** Studio time, so "today" reads the way the studio means it. */
function formatIst(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
