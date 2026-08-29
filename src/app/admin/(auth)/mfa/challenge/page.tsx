import { redirect } from "next/navigation";
import { AuthShell } from "../../AuthShell";
import { MfaChallengeForm } from "../MfaForms";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";
import { redirectTargetFor, resolveAccess } from "@/lib/auth/guard";
import { safeNextPath } from "@/lib/auth/redirect";

/** Second factor for someone who already has a verified authenticator. */
export default async function MfaChallengePage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const { decision, staff } = await resolveAccess();

  if (decision.ok) redirect(nextPath);
  if (decision.reason !== "mfa-challenge") redirect(redirectTargetFor(decision, nextPath));

  const locale = staff?.adminLocale ?? (await getPreLoginLocale());
  const t = getAdminT(locale);

  return (
    <AuthShell
      locale={locale}
      title={t("mfa.challengeTitle")}
      lede={t("mfa.challengeLede")}
      footer={<SignOutLink label={t("mfa.signOutInstead")} />}
    >
      <MfaChallengeForm
        nextPath={nextPath}
        labels={{
          codeLabel: t("mfa.codeLabel"),
          verify: t("mfa.verify"),
          verifying: t("mfa.verifying"),
          invalidCode: t("mfa.invalidCode")
        }}
      />
    </AuthShell>
  );
}
