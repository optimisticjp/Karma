import { ConsoleShell, type NavSection, type NavTab } from "@/components/admin/ConsoleShell";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT } from "@/lib/admin/i18n";
import { recordsCopy } from "@/lib/admin/records-copy";
import { canPerform, deletableEntities } from "@/lib/admin/record-actions";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";

/** Protected console shell. Navigation mirrors capability, while every page and
 * action still enforces the same permission server-side. */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const t = getAdminT(session.staff.adminLocale);
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

  /*
   * THE BOTTOM NAVIGATION
   *
   * The plan's recommended IA is Today / Admissions / Students / Batches /
   * More, and the audit's evidence supports it: Admissions owns two of the
   * four Today queues and the only due-today count; Students is granted by
   * four of the five permission templates, is the record-of-record, carries
   * both walk-in intake paths and three of the nine A4 sheets; batches.view is
   * granted by four templates and a batch is already an addressable record
   * that Today deep-links.
   *
   * But a fixed list of four is wrong for the operators the audit actually
   * found. A fees-only admin's Today screen is empty, and an attendance-only
   * admin's one daily module appears as a button 1,100px below the fold. So
   * the bar is a PRIORITY-ORDERED CANDIDATE LIST filtered by what the caller
   * can reach, and it takes the first four that survive. A full-permission
   * admin gets exactly the plan's four; a fees-only admin gets Today and Fees;
   * an attendance-only admin gets Today and Attendance. Nobody gets a tab they
   * cannot open, because a dead tab in a bar of five is a fifth of the
   * product's navigation.
   *
   * Team and Record cleanup are deliberately absent from the bottom bar. They
   * are administrative destinations used occasionally, while the bar is for
   * standing-at-the-counter daily work. They remain reachable from More/the
   * desktop rail when the caller has the authority to use them.
   *
   * This list is derived from the SAME booleans the rail uses, computed above
   * with no extra queries. The bar is a UX affordance: every one of these
   * routes re-checks its own permission server-side.
   */
  const tabCandidates: Array<{ tab: NavTab; allowed: boolean }> = [
    { tab: { href: "/admin", label: t("nav.today"), icon: "home" }, allowed: true },
    { tab: { href: "/admin/admissions", label: t("nav.admissions"), icon: "tray" }, allowed: canUseAdmissions },
    { tab: { href: "/admin/students", label: t("nav.students"), icon: "people" }, allowed: canUseStudents },
    { tab: { href: "/admin/batches", label: t("nav.batches"), icon: "calendar" }, allowed: canUseBatches },
    { tab: { href: "/admin/fees", label: t("nav.fees"), icon: "check" }, allowed: canUseFees },
    { tab: { href: "/admin/attendance", label: t("nav.attendance"), icon: "check" }, allowed: canUseAttendance },
    { tab: { href: "/admin/design", label: t("nav.designDesk"), icon: "pencil" }, allowed: canUseDesign },
    { tab: { href: "/admin/reports", label: t("nav.reports"), icon: "printer" }, allowed: canUseReports }
  ];
  const tabs = tabCandidates.filter((c) => c.allowed).slice(0, 4).map((c) => c.tab);

  const sections: NavSection[] = [
    {
      title: t("nav.sections.operations"),
      entries: [
        { href: "/admin", label: t("nav.today"), available: true },
        { href: canUseAdmissions ? "/admin/admissions" : null, label: t("nav.admissions"), available: canUseAdmissions },
        { href: canUseStudents ? "/admin/students" : null, label: t("nav.students"), available: canUseStudents },
        { href: canUseFees ? "/admin/fees" : null, label: t("permissions.groups.fees"), available: canUseFees }
      ]
    },
    {
      title: t("nav.sections.studio"),
      entries: [
        { href: canUseBatches ? "/admin/batches" : null, label: t("nav.batches"), available: canUseBatches },
        { href: canUseCourses ? "/admin/courses" : null, label: t("nav.courses"), available: canUseCourses },
        { href: canUseAttendance ? "/admin/attendance" : null, label: t("nav.attendance"), available: canUseAttendance },
        { href: canUseDesign ? "/admin/design" : null, label: t("nav.designDesk"), available: canUseDesign },
        { href: canUseCertificates ? "/admin/certificates" : null, label: t("nav.certificates"), available: canUseCertificates },
        { href: canUseContent ? "/admin/content" : null, label: t("nav.content"), available: canUseContent },
        { href: canUseReports ? "/admin/reports" : null, label: t("nav.reports"), available: canUseReports }
      ]
    },
    {
      title: t("nav.sections.administration"),
      entries: [
        ...(canUseCleanup ? [{ href: "/admin/records", label: records.cleanupTitle, available: true }] : []),
        ...(session.role === "owner" ? [{ href: "/admin/team", label: t("nav.team"), available: true }] : []),
        { href: "/admin/account/security", label: t("nav.account"), available: true }
      ]
    }
  ];

  return (
    <ConsoleShell
      sections={sections}
      tabs={tabs}
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
      <div lang={session.staff.adminLocale}>{children}</div>
    </ConsoleShell>
  );
}
