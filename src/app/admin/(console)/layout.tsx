import "../../admin-console.css";
import { AdminLanguageBar } from "@/components/admin/AdminLanguageBar";
import { ConsoleShell, type NavEntry, type NavSection, type NavTab } from "@/components/admin/ConsoleShell";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT } from "@/lib/admin/i18n";
import { consoleCopy } from "@/lib/admin/console-copy";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform, deletableEntities } from "@/lib/admin/record-actions";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";

/** Protected console shell. Navigation mirrors capability, while every page and
 * action still enforces the same permission server-side. */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const t = getAdminT(session.staff.adminLocale);
  const console = consoleCopy(session.staff.adminLocale);
  const records = recordsCopy(session.staff.adminLocale);

  const canUseAdmissions = hasPermission(session.staff, "applications.view") || hasPermission(session.staff, "applications.manage");
  const canUseStudents = hasPermission(session.staff, "students.view") || hasPermission(session.staff, "students.manage");
  const canUseBatches = hasPermission(session.staff, "batches.view") || hasPermission(session.staff, "batches.manage");
  const canUseCourses = hasPermission(session.staff, "courses.view") || hasPermission(session.staff, "courses.manage");
  const canUseAttendance = hasPermission(session.staff, "attendance.view") || hasPermission(session.staff, "attendance.manage");
  const canUseFees = hasPermission(session.staff, "fees.view") || hasPermission(session.staff, "fees.manage");
  const canUseDesign = hasPermission(session.staff, "design.view") || hasPermission(session.staff, "design.manage");
  const canUseCertificates = hasPermission(session.staff, "certificates.view") || hasPermission(session.staff, "certificates.manage");
  const canUseContent = hasPermission(session.staff, "content.view") || hasPermission(session.staff, "content.manage");
  const canUseReports =
    hasPermission(session.staff, "reports.view") ||
    hasPermission(session.staff, "audit.view") ||
    hasPermission(session.staff, "exports.run");
  const recordSubject = {
    role: session.role,
    has: (permission: Parameters<typeof hasPermission>[1]) => hasPermission(session.staff, permission)
  };
  const canUseCleanup = deletableEntities().some((entity) =>
    canPerform(recordSubject, entity, "delete")
  );

  const entry = (
    allowed: boolean,
    href: string,
    label: string,
    icon: NavEntry["icon"]
  ): NavEntry | null => allowed ? { href, label, available: true, icon } : null;
  const compact = (items: Array<NavEntry | null>) => items.filter((item): item is NavEntry => item !== null);

  const tabCandidates: Array<{ tab: NavTab; allowed: boolean }> = [
    { tab: { href: "/admin", label: t("nav.today"), icon: "home" }, allowed: true },
    { tab: { href: "/admin/admissions", label: t("nav.admissions"), icon: "tray" }, allowed: canUseAdmissions },
    { tab: { href: "/admin/students", label: t("nav.students"), icon: "people" }, allowed: canUseStudents },
    { tab: { href: "/admin/fees", label: t("nav.fees"), icon: "check" }, allowed: canUseFees },
    { tab: { href: "/admin/attendance", label: t("nav.attendance"), icon: "calendar" }, allowed: canUseAttendance },
    { tab: { href: "/admin/batches", label: t("nav.batches"), icon: "calendar" }, allowed: canUseBatches }
  ];
  const tabs = tabCandidates.filter((c) => c.allowed).slice(0, 4).map((c) => c.tab);

  const sections: NavSection[] = [
    {
      title: console.sections.frontDesk,
      entries: compact([
        entry(true, "/admin", t("nav.today"), "home"),
        entry(canUseAdmissions, "/admin/admissions", t("nav.admissions"), "tray"),
        entry(canUseStudents, "/admin/students", t("nav.students"), "people"),
        entry(canUseFees, "/admin/fees", t("nav.fees"), "check"),
        entry(canUseAttendance, "/admin/attendance", t("nav.attendance"), "calendar")
      ])
    },
    {
      title: console.sections.studio,
      entries: compact([
        entry(canUseBatches, "/admin/batches", t("nav.batches"), "calendar"),
        entry(canUseCourses, "/admin/courses", t("nav.courses"), "machine")
      ])
    },
    {
      title: console.sections.other,
      entries: compact([
        entry(canUseDesign, "/admin/design", t("nav.designDesk"), "pencil"),
        entry(canUseCertificates, "/admin/certificates", t("nav.certificates"), "printer"),
        entry(canUseContent, "/admin/content", t("nav.content"), "camera"),
        entry(canUseReports, "/admin/reports", t("nav.reports"), "printer")
      ])
    },
    {
      title: console.sections.administration,
      entries: compact([
        entry(canUseCleanup, "/admin/records", records.cleanupTitle, "trash"),
        entry(session.role === "owner", "/admin/team", t("nav.team"), "people"),
        entry(true, "/admin/account/security", t("nav.account"), "check")
      ])
    }
  ].filter((section) => section.entries.length > 0);

  const primaryAction: NavTab | null = hasPermission(session.staff, "students.manage")
    ? { href: "/admin/students", label: console.primary.newAdmission, icon: "plus" }
    : hasPermission(session.staff, "applications.manage")
      ? { href: "/admin/admissions", label: console.primary.reviewAdmissions, icon: "tray" }
      : hasPermission(session.staff, "fees.manage")
        ? { href: "/admin/fees?status=pending", label: console.primary.collectFee, icon: "check" }
        : null;

  return (
    <ConsoleShell
      sections={sections}
      tabs={tabs}
      primaryAction={primaryAction}
      brand={t("brand")}
      studio={t("studio")}
      personName={session.staff.name}
      roleLabel={t(session.role === "owner" ? "team.roles.owner" : "team.roles.admin")}
      accountLabel={t("nav.account")}
      accountHref="/admin/account/security"
      closeMenuLabel={t("nav.closeMenu")}
      comingLaterLabel={t("nav.comingLater")}
      moreLabel={t("nav.more")}
      primaryNavLabel={t("nav.primaryNav")}
      moreNavLabel={t("nav.moreNav")}
      signOut={<SignOutLink label={t("nav.signOut")} />}
    >
      <div lang={session.staff.adminLocale}>
        <AdminLanguageBar locale={session.staff.adminLocale} />
        {children}
      </div>
    </ConsoleShell>
  );
}
