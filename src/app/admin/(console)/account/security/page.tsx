import { requireAdmin } from "@/lib/auth/guard";
import { PageHead } from "@/components/admin/PageHead";
import { getAdminT } from "@/lib/admin/i18n";
import { PERMISSION_GROUPS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/access";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { AdminLocaleForm } from "./AdminLocaleForm";

/**
 * Account & security.
 *
 * Karma Console currently uses invite-only email + password sign-in. This page
 * therefore focuses on identity, account lifecycle, language and authorization;
 * it does not show or manage obsolete authenticator/MFA state.
 */
export default async function AccountSecurityPage() {
  const session = await requireAdmin("/admin/account/security");
  const t = getAdminT(session.staff.adminLocale);

  const granted = PERMISSION_GROUPS.flatMap((group) =>
    group.permissions
      .filter((permission) => hasPermission(session.staff, permission))
      .map((permission) => ({ key: permission, label: t(`permissions.keys.${permission}`) }))
  );

  return (
    <div className="max-w-[48rem]">
      <PageHead title={t("account.title")} context={t("account.lede")} />

      <section className="panel mt-10">
        <div className="panel-body">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Fact label={t("account.name")} value={session.staff.name} />
            <Fact label={t("account.email")} value={session.email ?? session.staff.email ?? "—"} />
            <Fact
              label={t("account.role")}
              value={t(session.role === "owner" ? "team.roles.owner" : "team.roles.admin")}
            />
            <Fact
              label={t("account.status")}
              value={t(`team.status.${session.staff.active ? session.staff.status : "deactivated"}`)}
            />
          </dl>
        </div>
      </section>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="text-h4">{t("account.language")}</h2>
        </div>
        <div className="panel-body">
          <AdminLocaleForm
            current={session.staff.adminLocale}
            saveLabel={t("account.save")}
            savedLabel={t("account.languageSaved")}
            legend={t("account.language")}
          />
        </div>
      </section>

      <section className="panel mt-6">
        <div className="panel-head">
          <h2 className="text-h4">{t("account.permissions")}</h2>
        </div>
        <div className="panel-body">
          {session.role === "owner" ? (
            <p className="text-smallmeta">{t("account.ownerAll")}</p>
          ) : granted.length === 0 ? (
            <p className="empty-state">{t("team.noPermissions")}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {granted.map((permission) => (
                <li key={permission.key} className="chip">
                  {permission.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="u-actions">
        <SignOutLink label={t("account.signOut")} className="btn btn-secondary" />
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="microlabel">{label}</dt>
      <dd className="mt-1 text-smallmeta font-semibold">{value}</dd>
    </div>
  );
}
