import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { getAdminT } from "@/lib/admin/i18n";
import { getDashboardCounts, getRecentActivity, getTodayQueues, QUEUE_LIMIT } from "@/lib/admin/dashboard";
import { Queue, QueueRow } from "@/components/admin/Queue";
import { PageHead } from "@/components/admin/PageHead";

/**
 * Today at Karma is a work desk, not an analytics wall.
 *
 * It used to be seven numbers in seven cards. "7 follow-ups due" tells an
 * operator that seven things need attention; a queue tells them WHICH seven,
 * so the first one opens without a second navigation and a scan of a list.
 * The counts did not disappear — each one now heads its queue, where it is a
 * label for what follows rather than a number in a box.
 *
 * There are no charts. A studio with one floor and four batch timings does not
 * have a trend worth plotting, and a chart here would be decoration wearing an
 * analytics costume.
 *
 * A queue row links to its module and then to the record's ANCHOR within that
 * module's list — `/admin/admissions#app-12`. There are no per-record routes
 * (the console is one list of `<details>` rows per module, not
 * `/admin/admissions/[id]`), so an id in the path would 404. The design queue
 * still links to its module without an anchor because that list has not been
 * rebuilt yet; a test resolves every href here against the route tree, so a
 * link to a page that does not exist fails the suite.
 *
 * Each admin sees only queues their explicit permissions let them work on, and
 * **only those queues are queried** — an admin with attendance rights alone
 * costs one round trip, not five. The Owner naturally sees the whole studio
 * because owner permission checks short-circuit.
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
  const canFees = hasPermission(session.staff, "fees.view") || hasPermission(session.staff, "fees.manage");
  const canAudit = hasPermission(session.staff, "audit.view");

  const [dashboard, activity, queues] = await Promise.all([
    getDashboardCounts(),
    canAudit ? getRecentActivity() : Promise.resolve([]),
    getTodayQueues({
      admissions: canAdmissions,
      batches: canClasses,
      design: canDesign,
      fees: canFees
    })
  ]);

  if (!dashboard.available) {
    return (
      <div className="max-w-[48rem]">
        <PageHead title={t("today.title")} context={t("today.greeting", { name: session.staff.name })} />
        <p className="alert mt-8">{t("today.notConfigured")}</p>
      </div>
    );
  }

  const c = dashboard.counts;
  const quickActions = [
    hasPermission(session.staff, "applications.manage") ? { href: "/admin/admissions", label: t("nav.admissions") } : null,
    hasPermission(session.staff, "students.manage") ? { href: "/admin/students", label: t("nav.students") } : null,
    hasPermission(session.staff, "attendance.manage") ? { href: "/admin/attendance", label: t("nav.attendance") } : null,
    hasPermission(session.staff, "fees.manage") ? { href: "/admin/fees", label: t("permissions.groups.fees") } : null,
    hasPermission(session.staff, "batches.manage")
      ? { href: "/admin/batches", label: t("nav.batches") }
      : null,
    hasPermission(session.staff, "courses.manage")
      ? { href: "/admin/courses", label: t("nav.courses") }
      : null,
    hasPermission(session.staff, "design.manage") ? { href: "/admin/design", label: t("nav.designDesk") } : null,
    hasPermission(session.staff, "certificates.manage") ? { href: "/admin/certificates", label: t("nav.certificates") } : null,
    hasPermission(session.staff, "content.manage") ? { href: "/admin/content", label: t("nav.content") } : null,
    hasPermission(session.staff, "reports.view") || hasPermission(session.staff, "audit.view") || hasPermission(session.staff, "exports.run")
      ? { href: "/admin/reports", label: t("nav.reports") }
      : null,
    session.role === "owner" ? { href: "/admin/team", label: t("nav.team") } : null
  ].filter((item): item is { href: string; label: string } => item !== null);

  const dateFmt = new Intl.DateTimeFormat(session.staff.adminLocale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short"
  });
  const day = (value: string) => dateFmt.format(new Date(`${value}T00:00:00+05:30`));

  return (
    <div className="max-w-[64rem]">
      <PageHead
        title={t("today.title")}
        context={`${t("today.greeting", { name: session.staff.name })} · ${t("today.workDesk")}`}
      />

      {/* A compact strip of the day's figures, directly under the head. The
          counts were only ever visible one at a time at the head of their own
          queue, so three of the seven fetched were never shown at all and
          seeing four numbers meant scrolling three viewports. Rows on a phone,
          cells from 640px — not a wall of metric cards, which is what this
          screen replaced and must not become again. */}
      <div className="console-metrics mt-3">
        {canAdmissions ? (
          <div>
            <span className="kv-label">{t("today.queueNewApplications")}</span>
            <span className="kv-value">{c.newApplications}</span>
          </div>
        ) : null}
        {canAdmissions ? (
          <div>
            <span className="kv-label">{t("today.queueFollowUps")}</span>
            <span className="kv-value">{c.followUpsDue}</span>
          </div>
        ) : null}
        {canClasses ? (
          <div>
            <span className="kv-label">{t("today.queueBatches")}</span>
            <span className="kv-value">{c.runningBatches}</span>
          </div>
        ) : null}
        {canFees ? (
          <div>
            <span className="kv-label">{t("today.queueFees")}</span>
            <span className="kv-value">{c.feesOverdue}</span>
          </div>
        ) : null}
        {canDesign ? (
          <div>
            <span className="kv-label">{t("today.queueBriefs")}</span>
            <span className="kv-value">{c.openBriefs}</span>
          </div>
        ) : null}
      </div>

      {canAdmissions || canClasses || canDesign || canFees ? (
        <div className="queue-grid mt-3">
          {canAdmissions ? (
            <>
              <Queue
                title={t("today.queueNewApplications")}
                count={c.newApplications}
                urgent
                emptyLabel={t("today.queueEmptyApplications")}
                moreHref="/admin/admissions"
                moreLabel={t("today.queueMore")}
              >
                {queues.newApplications.map((row) => (
                  <QueueRow
                    key={row.id}
                    href={`/admin/admissions#app-${row.id}`}
                    title={row.fullName}
                    meta={[row.reference, row.courseSlug ?? ""].filter(Boolean).join(" · ")}
                  />
                ))}
              </Queue>

              <Queue
                title={t("today.queueFollowUps")}
                count={c.followUpsDue}
                urgent
                emptyLabel={t("today.queueEmptyFollowUps")}
                moreHref="/admin/admissions"
                moreLabel={t("today.queueMore")}
              >
                {queues.followUps.map((row) => (
                  <QueueRow
                    key={row.id}
                    href={`/admin/admissions#app-${row.id}`}
                    title={row.fullName}
                    meta={`${row.reference} · ${t("today.dueOn", { date: day(row.nextFollowUp) })}`}
                    status={row.status.replace(/_/g, " ")}
                    statusTone="due"
                  />
                ))}
              </Queue>
            </>
          ) : null}

          {canClasses ? (
            <Queue
              title={t("today.queueBatches")}
              count={c.runningBatches}
              emptyLabel={t("today.queueEmptyBatches")}
              moreHref="/admin/batches"
              moreLabel={t("today.queueMore")}
            >
              {queues.batches.slice(0, QUEUE_LIMIT).map((row) => (
                <QueueRow
                  key={row.id}
                  href={`/admin/batches#batch-${row.id}`}
                  title={row.label}
                  meta={`${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)} · ${t("today.seatsTaken", {
                    taken: row.seatsTaken,
                    seats: row.seats
                  })}`}
                  status={row.status}
                  statusTone={row.status === "full" ? "warn" : "ok"}
                />
              ))}
            </Queue>
          ) : null}

          {canFees ? (
            <Queue
              title={t("today.queueFees")}
              count={c.feesOverdue}
              urgent
              emptyLabel={t("today.queueEmptyFees")}
              moreHref="/admin/fees?pending=1"
              moreLabel={t("today.queueMore")}
            >
              {queues.fees.map((row) => (
                <QueueRow
                  key={row.enrollmentId}
                  href={`/admin/fees#fee-${row.enrollmentId}`}
                  title={row.fullName}
                  meta={`${row.admissionNo} · ${money(row.balance)} · ${t("today.dueOn", { date: day(row.dueOn) })}`}
                  status={t("today.queueFees")}
                  statusTone="warn"
                />
              ))}
            </Queue>
          ) : null}

          {canDesign ? (
            <Queue
              title={t("today.queueBriefs")}
              count={c.openBriefs}
              urgent={c.newBriefs > 0}
              emptyLabel={t("today.queueEmptyBriefs")}
              moreHref="/admin/design"
              moreLabel={t("today.queueMore")}
            >
              {queues.briefs.map((row) => (
                <QueueRow
                  key={row.id}
                  href="/admin/design"
                  title={row.name}
                  meta={`${row.reference} · ${
                    row.deadline ? t("today.dueOn", { date: day(row.deadline) }) : t("today.noDeadline")
                  }`}
                  status={row.status.replace(/_/g, " ")}
                  statusTone={row.deadline ? "due" : "neutral"}
                />
              ))}
            </Queue>
          ) : null}
        </div>
      ) : null}

      {canAdmissions || canClasses || canDesign || canFees ? (
        <p className="form-note mt-2">{t("today.queueNote")}</p>
      ) : null}

      {canAudit ? (
        <section className="mt-6" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="kv-label">{t("today.recentActivity")}</h2>
          {activity.length === 0 ? (
            <p className="empty-state mt-2">{t("today.noActivity")}</p>
          ) : (
            <div className="data-list mt-2">
              {activity.map((row) => (
                <div key={row.id} className="data-row">
                  <span className="data-row__title">{humanAction(row.action)}</span>
                  <span className="data-row__meta">
                    <span>
                      {row.entity}
                      {row.entityId ? ` #${row.entityId}` : ""}
                    </span>
                    <time dateTime={new Date(row.createdAt).toISOString()}>
                      {formatIst(row.createdAt, session.staff.adminLocale)}
                    </time>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Chips, not ten full-size buttons. This was ~439px of wrapped
          `.btn btn-secondary` duplicating the navigation — and since the bottom
          bar landed, the first four of these are the bar. It stays because the
          bar holds four and this holds the rest, but at the size of a shortcut
          rather than the size of a decision. Each chip keeps a 44px hit area
          through padding that overflows the row. */}
      {quickActions.length > 0 ? (
        <section className="mt-6" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="kv-label">{t("today.quickActions")}</h2>
          <div className="chip-scroller mt-1.5">
            {quickActions.map((item) => (
              <Link key={item.href} href={item.href} className="chip-filter">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
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

/** Whole rupees with tabular figures, so a column of balances does not jitter. */
function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function humanAction(value: string) {
  return value.replace(/[._]/g, " ");
}
