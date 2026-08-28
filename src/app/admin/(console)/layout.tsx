import { ConsoleShell, type NavSection } from "@/components/admin/ConsoleShell";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT } from "@/lib/admin/i18n";
import { requireAdmin } from "@/lib/auth/guard";

/**
 * The protected console.
 *
 * `requireAdmin()` runs here, which means no page below this layout renders for
 * anyone without a verified Supabase user, a linked and ACTIVE staff record, a
 * console role, and an AAL2 session. Each page still guards itself as well —
 * a layout guard is a floor, not a substitute, because a layout can be skipped
 * on a client-side navigation that only re-renders a leaf.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const t = getAdminT(session.staff.adminLocale);

  const sections: NavSection[] = [
    {
      title: t("nav.sections.operations"),
      entries: [
        { href: "/admin", label: t("nav.today"), available: true },
        // Modules below ship in later phases. They are listed so the shape of
        // the console is honest, and marked plainly unavailable rather than
        // opening a screen of invented rows.
        { href: null, label: t("nav.admissions"), available: false },
        { href: null, label: t("nav.students"), available: false }
      ]
    },
    {
      title: t("nav.sections.studio"),
      entries: [
        { href: null, label: t("nav.coursesBatches"), available: false },
        { href: null, label: t("nav.attendance"), available: false },
        { href: null, label: t("nav.designDesk"), available: false },
        { href: null, label: t("nav.certificates"), available: false },
        { href: null, label: t("nav.content"), available: false },
        { href: null, label: t("nav.reports"), available: false }
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
