import { requireAdmin } from "@/lib/auth/guard";
import { getAdminT } from "@/lib/admin/i18n";
import { getAssuranceLevel, createClient } from "@/lib/supabase/server";
import { PERMISSION_GROUPS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/access";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { AdminLocaleForm } from "./AdminLocaleForm";

/**
 * Account & security.
 *
 * Shows what this sign-in is and what it can do. It deliberately shows NO
 * secret material: the TOTP secret is visible once during enrolment and never
 * again, and no token, key or internal Supabase detail appears here.
 *
 * Removing the only authenticator is not offered. An admin who did that would
 * be sitting inside a console that requires AAL2 with no way back to it, and a
 * self-service reset would be a way around mandatory MFA. Recovery is a
 * supervised owner procedure — documented for the next phase rather than
 * implemented unsafely here.
 */
export default async function AccountSecurityPage() {
  const session = await requireAdmin("/admin/account/security");
  const t = getAdminT(session.staff.adminLocale);
  const { currentLevel } = await getAssuranceLevel();

  const supabase = await createClient();
  const factors = supabase ? await supabase.auth.mfa.listFactors() : null;
  const enrolled = Boolean(factors?.data?.totp?.some((f) => f.status === "verified"));

  const granted = PERMISSION_GROUPS.flatMap((group) =>
    group.permissions
      .filter((permission) => hasPermission(session.staff, permission))
      .map((permission) => ({ key: permission, label: t(`permissions.keys.${permission}`) }))
  );

  return (
    <div className="max-w-[48rem]">
      <h1 className="text-h2">{t("account.title")}</h1>
      <span aria-hidden className="rule-stitch is-in" />
      <p className="u-lede">{t("account.lede")}</p>

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
            <Fact
              label={t("account.mfa")}
              value={enrolled ? t("account.mfaOn") : t("account.mfaOff")}
            />
            <Fact
              label={t("account.assurance")}
              value={
                currentLevel === "aal2" ? t("account.assuranceAal2") : t("account.assuranceAal1")
              }
            />
          </dl>
          <p className="form-note mt-6">{t("account.mfaNote")}</p>
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
