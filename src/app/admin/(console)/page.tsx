import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";
import { getAdminT } from "@/lib/admin/i18n";
import { consoleCopy } from "@/lib/admin/console-copy";
import { getDashboardCounts, getRecentActivity, getTodayQueues, QUEUE_LIMIT } from "@/lib/admin/dashboard";
import { Queue, QueueRow } from "@/components/admin/Queue";
import { PageHead } from "@/components/admin/PageHead";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type HomeAction = { href: string; label: string; detail: string; icon: IconName };
type AttentionItem = { href: string; label: string; value: number; urgent?: boolean };

/**
 * Today at Karma is the front desk: start a common job, see what is waiting,
 * then open the exact row that needs attention. It deliberately avoids charts
 * and duplicate navigation because staff should not need to understand the
 * software's module structure before they can do institute work.
 */
export default async function TodayPage() {
  const session = await requireAdmin("/admin");
  const t = getAdminT(session.staff.adminLocale);
  const copy = consoleCopy(session.staff.adminLocale);

  const canAdmissions = hasPermission(session.staff, "applications.view") || hasPermission(session.staff, "applications.manage");
  const canManageAdmissions = hasPermission(session.staff, "applications.manage");
  const canStudents = hasPermission(session.staff, "students.view") || hasPermission(session.staff, "students.manage");
  const canManageStudents = hasPermission(session.staff, "students.manage");
  const canClasses =
    canStudents ||
    hasPermission(session.staff, "courses.view") ||
    hasPermission(session.staff, "courses.manage") ||
    hasPermission(session.staff, "batches.view") ||
    hasPermission(session.staff, "batches.manage") ||
    hasPermission(session.staff, "attendance.view") ||
    hasPermission(session.staff, "attendance.manage");
  const canAttendance = hasPermission(session.staff, "attendance.manage");
  const canDesign = hasPermission(session.staff, "design.view") || hasPermission(session.staff, "design.manage");
  const canFees = hasPermission(session.staff, "fees.view") || hasPermission(session.staff, "fees.manage");
  const canManageFees = hasPermission(session.staff, "fees.manage");
  const canAudit = hasPermission(session.staff, "audit.view");

  const [dashboard, activity, queues] = await Promise.all([
    getDashboardCounts(),
    canAudit ? getRecentActivity() : Promise.resolve([]),
    getTodayQueues({ admissions: canAdmissions, batches: canClasses, design: canDesign, fees: canFees })
  ]);

  if (!dashboard.available) {
    return (
      <div className="max-w-[48rem]">
        <PageHead title={t("today.title")} context={t("today.greeting", { name: session.staff.name })} />
        <p className="alert mt-6">{t("today.notConfigured")}</p>
      </div>
    );
  }

  const c = dashboard.counts;
  const quickActions = [
    hasPermission(session.staff, "students.manage") && canManageStudents ? { href: "/admin/students", label: copy.home.newAdmission, detail: copy.home.newAdmissionHint, icon: "plus" as const } : null,
    hasPermission(session.staff, "fees.manage") && canManageFees ? { href: "/admin/fees?status=pending", label: copy.home.collectFee, detail: copy.home.collectFeeHint, icon: "check" as const } : null,
    hasPermission(session.staff, "attendance.manage") && canAttendance ? { href: "/admin/attendance", label: copy.home.attendance, detail: copy.home.attendanceHint, icon: "calendar" as const } : null,
    canStudents ? { href: "/admin/students", label: copy.home.findStudent, detail: copy.home.findStudentHint, icon: "search" as const } : null,
    hasPermission(session.staff, "applications.manage") && canManageAdmissions ? { href: "/admin/admissions?status=new", label: copy.home.reviewAdmissions, detail: copy.home.reviewAdmissionsHint, icon: "tray" as const } : null
  ].filter((item): item is HomeAction => item !== null).slice(0, 4);

  const attention = [
    canAdmissions ? { href: "/admin/admissions?status=new", label: copy.home.newApplications, value: c.newApplications, urgent: c.newApplications > 0 } : null,
    canAdmissions ? { href: "/admin/admissions", label: copy.home.followUps, value: c.followUpsDue, urgent: c.followUpsDue > 0 } : null,
    canFees ? { href: "/admin/fees?status=overdue", label: copy.home.overdueFees, value: c.feesOverdue, urgent: c.feesOverdue > 0 } : null,
    canClasses ? { href: "/admin/batches", label: copy.home.runningBatches, value: c.runningBatches } : null
  ].filter((item): item is AttentionItem => item !== null);

  const dateLabel = new Intl.DateTimeFormat(session.staff.adminLocale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
  const shortDate = new Intl.DateTimeFormat(session.staff.adminLocale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short"
  });
  const day = (value: string) => shortDate.format(new Date(`${value}T00:00:00+05:30`));

  return (
    <div className="max-w-[72rem]">
      <PageHead
        title={t("today.title")}
        context={`${t("today.greeting", { name: session.staff.name })} · ${dateLabel}`}
        className="console-head-home"
      />

      <section className="console-home-section" aria-labelledby="start-heading">
        <SectionHead id="start-heading" title={copy.home.startTitle} hint={copy.home.startHint} />
        {quickActions.length ? (
          <div className="console-home-actions">
            {quickActions.map((action) => <ActionCard key={`${action.href}-${action.label}`} action={action} />)}
          </div>
        ) : (
          <p className="empty-state">{copy.home.noDailyWork}</p>
        )}
      </section>

      {attention.length ? (
        <section className="console-home-section" aria-labelledby="attention-heading">
          <SectionHead id="attention-heading" title={copy.home.attentionTitle} hint={copy.home.attentionHint} />
          <div className="console-metrics console-attention-grid">
            {attention.map((item) => <AttentionCard key={`${item.href}-${item.label}`} item={item} allClear={copy.home.allClear} />)}
          </div>
        </section>
      ) : null}

      {canAdmissions || canClasses || canFees ? (
        <section className="console-home-section" aria-labelledby="next-heading">
          <SectionHead id="next-heading" title={copy.home.nextTitle} hint={copy.home.nextHint} />
          <div className="queue-grid">
            {canAdmissions ? (
              <Queue
                title={t("today.queueNewApplications")}
                count={c.newApplications}
                urgent
                icon="tray"
                emptyLabel={t("today.queueEmptyApplications")}
                moreHref="/admin/admissions?status=new"
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
            ) : null}

            {canAdmissions ? (
              <Queue
                title={t("today.queueFollowUps")}
                count={c.followUpsDue}
                urgent
                icon="phone"
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
            ) : null}

            {canFees ? (
              <Queue
                title={t("today.queueFees")}
                count={c.feesOverdue}
                urgent
                icon="check"
                emptyLabel={t("today.queueEmptyFees")}
                moreHref="/admin/fees?status=overdue"
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

            {canClasses ? (
              <Queue
                title={t("today.queueBatches")}
                count={c.runningBatches}
                icon="calendar"
                emptyLabel={t("today.queueEmptyBatches")}
                moreHref="/admin/batches"
                moreLabel={t("today.queueMore")}
              >
                {queues.batches.slice(0, QUEUE_LIMIT).map((row) => (
                  <QueueRow
                    key={row.id}
                    href={`/admin/batches#batch-${row.id}`}
                    title={row.label}
                    meta={`${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)} · ${t("today.seatsTaken", { taken: row.seatsTaken, seats: row.seats })}`}
                    status={row.status}
                    statusTone={row.status === "full" ? "warn" : "ok"}
                  />
                ))}
              </Queue>
            ) : null}
          </div>
        </section>
      ) : null}

      {canDesign ? (
        <section className="console-home-section" aria-labelledby="other-heading">
          <SectionHead id="other-heading" title={copy.home.otherTitle} />
          <Queue
            title={t("today.queueBriefs")}
            count={c.openBriefs}
            urgent={c.newBriefs > 0}
            icon="pencil"
            emptyLabel={t("today.queueEmptyBriefs")}
            moreHref="/admin/design"
            moreLabel={t("today.queueMore")}
          >
            {queues.briefs.map((row) => (
              <QueueRow
                key={row.id}
                href="/admin/design"
                title={row.name}
                meta={`${row.reference} · ${row.deadline ? t("today.dueOn", { date: day(row.deadline) }) : t("today.noDeadline")}`}
                status={row.status.replace(/_/g, " ")}
                statusTone={row.deadline ? "due" : "neutral"}
              />
            ))}
          </Queue>
        </section>
      ) : null}

      {canAudit ? (
        <details className="console-activity console-home-section">
          <summary>{copy.home.activityTitle}</summary>
          <div className="console-activity-body">
            {activity.length === 0 ? (
              <p className="empty-state">{t("today.noActivity")}</p>
            ) : (
              <div className="data-list">
                {activity.map((row) => (
                  <div key={row.id} className="data-row">
                    <span className="data-row__title">{humanAction(row.action)}</span>
                    <span className="data-row__meta">
                      <span>{row.entity}{row.entityId ? ` #${row.entityId}` : ""}</span>
                      <time dateTime={new Date(row.createdAt).toISOString()}>{formatIst(row.createdAt, session.staff.adminLocale)}</time>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function SectionHead({ id, title, hint }: { id: string; title: string; hint?: string }) {
  return (
    <div className="console-section-head">
      <div>
        <h2 id={id} className="console-section-title">{title}</h2>
        {hint ? <p className="console-section-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: HomeAction }) {
  return (
    <Link href={action.href} className="console-action-card">
      <span className="console-action-icon" aria-hidden="true"><Icon name={action.icon} size={21} /></span>
      <span className="console-action-title">{action.label}</span>
      <span className="console-action-detail">{action.detail}</span>
    </Link>
  );
}

function AttentionCard({ item, allClear }: { item: AttentionItem; allClear: string }) {
  return (
    <Link href={item.href} className={cn("console-attention-card", item.urgent && "is-urgent", item.value === 0 && "is-clear")}>
      <span className="console-attention-label">{item.label}</span>
      <span className="console-attention-value">
        <span className="console-attention-number">{item.value}</span>
        <span className="console-attention-state">
          {item.value === 0 ? allClear : <span aria-hidden="true"><Icon name="arrow" size={14} /></span>}
        </span>
      </span>
    </Link>
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
