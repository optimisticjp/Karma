import { AuthShell } from "../AuthShell";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";

const REASONS = ["no-staff", "inactive", "role", "permission"] as const;
type Reason = (typeof REASONS)[number];

/**
 * Where the guard sends a valid Supabase user who is nonetheless not allowed
 * in: no staff record, deactivated, wrong role, or missing the permission for
 * the section they asked for. Each is stated plainly, because the person is
 * already authenticated — there is nothing left to withhold from them, and a
 * vague message just generates a support call.
 */
export default async function NoAccessPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason: Reason = REASONS.includes(params.reason as Reason)
    ? (params.reason as Reason)
    : "role";

  const locale = await getPreLoginLocale();
  const t = getAdminT(locale);

  const body =
    reason === "no-staff"
      ? t("noAccess.noStaff")
      : reason === "inactive"
        ? t("noAccess.inactive")
        : reason === "permission"
          ? t("noAccess.permission")
          : t("noAccess.role");

  return (
    <AuthShell locale={locale} title={t("noAccess.title")} lede={body}>
      <SignOutLink label={t("noAccess.signOut")} className="btn btn-secondary w-full" />
    </AuthShell>
  );
}
