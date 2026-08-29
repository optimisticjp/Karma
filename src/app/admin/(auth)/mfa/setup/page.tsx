import { redirect } from "next/navigation";
import { AuthShell } from "../../AuthShell";
import { MfaSetupForm } from "../MfaForms";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";
import { redirectTargetFor, resolveAccess } from "@/lib/auth/guard";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * TOTP enrolment. Reached only by someone who has proved identity but has no
 * authenticator yet.
 *
 * The staff checks run BEFORE this screen (see evaluateAccess): a valid
 * Supabase user with no staff record, or a deactivated one, is turned away at
 * /admin/no-access rather than being walked through an enrolment that would
 * get them nowhere.
 */
export default async function MfaSetupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const { decision, staff } = await resolveAccess();

  if (decision.ok) redirect(nextPath);
  if (decision.reason !== "mfa-setup") redirect(redirectTargetFor(decision, nextPath));

  const locale = staff?.adminLocale ?? (await getPreLoginLocale());
  const t = getAdminT(locale);

  return (
    <AuthShell
      locale={locale}
      title={t("mfa.setupTitle")}
      lede={t("mfa.setupLede")}
      footer={<SignOutLink label={t("mfa.signOutInstead")} />}
    >
      <MfaSetupForm
        nextPath={nextPath}
        labels={{
          manualLabel: t("mfa.manualLabel"),
          codeLabel: t("mfa.codeLabel"),
          verify: t("mfa.verify"),
          verifying: t("mfa.verifying"),
          invalidCode: t("mfa.invalidCode"),
          enrollFailed: t("mfa.enrollFailed"),
          secretWarning: t("mfa.secretWarning")
        }}
      />
    </AuthShell>
  );
}
