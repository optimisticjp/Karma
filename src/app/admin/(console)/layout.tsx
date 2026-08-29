import { ConsoleShell, type NavSection } from "@/components/admin/ConsoleShell";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT } from "@/lib/admin/i18n";
import { requireAdmin } from "@/lib/auth/guard";
import { hasPermission } from "@/lib/auth/access";

/**
 * The protected console.
 *
 * `requireAdmin()` runs here, which means no page below this layout renders for
 * anyone without a verified Supabase user, a linked and ACTIVE staff record,
 * and a console role. Each page still guards its own capability as well — a
 * layout guard is a floor, not a substitute for per-route authorization.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const t = getAdminT(session.staff.adminLocale);

  const canUseAdmissions =
    hasPermission(session.staff, "applications.view") ||
    hasPermission(session.staff, "applications.manage");
  const canUseStudents =
    hasPermission(session.staff, "students.view") ||
    hasPermission(session.staff, "students.manage");
  const canUseCatalog =
    hasPermission(session.staff, "courses.view") ||
    hasPermission(session.staff, "courses.manage") ||
    hasPermission(session.staff, "batches.view") ||
    hasPermission(session.staff, "batches.manage");
  const canUseAttendance =
    hasPermission(session.staff, "attendance.view") ||
    hasPermission(session.staff, "attendance.manage");
  const canUseFees =
    hasPermission(session.staff, "fees.view") ||
    hasPermission(session.staff, "fees.manage");
  const canUseDesign =
    hasPermission(session.staff, "design.view") ||
    hasPermission(session.staff, "design.manage");
  const canUseCertificates =
    hasPermission(session.staff, "certificates.view") ||
    hasPermission(session.staff, "certificates.manage");
  const canUseReports =
    hasPermission(session.staff, "reports.view") ||
    hasPermission(session.staff, "audit.view") ||
    hasPermission(session.staff, "exports.run");

  const sections: NavSection[] = [
    {
      title: t("nav.sections.operations"),
      entries: [
        { href: "/admin", label: t("nav.today"), available: true },
        {
          href: canUseAdmissions ? "/admin/admissions" : null,
          label: t("nav.admissions"),
          available: canUseAdmissions
        },
        {
          href: canUseStudents ? "/admin/students" : null,
          label: t("nav.students"),
          available: canUseStudents
        },
        {
          href: canUseFees ? "/admin/fees" : null,
          label: t("permissions.groups.fees"),
          available: canUseFees
        }
      ]
    },
    {
      title: t("nav.sections.studio"),
      entries: [
        {
          href: canUseCatalog ? "/admin/courses" : null,
          label: t("nav.coursesBatches"),
          available: canUseCatalog
        },
        {
          href: canUseAttendance ? "/admin/attendance" : null,
          label: t("nav.attendance"),
          available: canUseAttendance
        },
        {
          href: canUseDesign ? "/admin/design" : null,
          label: t("nav.designDesk"),
          available: canUseDesign
        },
        {
          href: canUseCertificates ? "/admin/certificates" : null,
          label: t("nav.certificates"),
          available: canUseCertificates
        },
        { href: null, label: t("nav.content"), available: false },
        {
          href: canUseReports ? "/admin/reports" : null,
          label: t("nav.reports"),
          available: canUseReports
        }
      ]
    },
    {
      title: t("nav.sections.administration"),
      entries: [
        // Team is owner-only, everywhere: the link is hidden for admins AND
        // /admin/team refuses them server-side.
        ...(session.role === "owner"
          ? [{ href: "/admin/team", label: t("nav.team"), available: true }]
          : []),
        { href: "/admin/account/security", label: t("nav.account"), available: true }
      ]
    }
  ];

  return (
    <ConsoleShell
      sections={sections}
      brand={t("brand")}
      studio={t("studio")}
      personName={session.staff.name}
      roleLabel={t(session.role === "owner" ? "team.roles.owner" : "team.roles.admin")}
      accountLabel={t("nav.account")}
      accountHref="/admin/account/security"
      menuLabel={t("nav.menu")}
      closeMenuLabel={t("nav.closeMenu")}
      comingLaterLabel={t("nav.comingLater")}
      signOut={<SignOutLink label={t("nav.signOut")} />}
    >
      <div lang={session.staff.adminLocale}>{children}</div>
    </ConsoleShell>
  );
}
