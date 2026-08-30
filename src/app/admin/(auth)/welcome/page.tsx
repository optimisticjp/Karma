import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { WelcomeForm } from "./WelcomeForm";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";
import { requireInvitedConsoleUser } from "@/lib/auth/guard";

/**
 * Invitation acceptance.
 *
 * This is the one console screen that renders for an account that is not yet
 * `active` — an invitee has no password until they set one here. Everything
 * else is still enforced, by `requireInvitedConsoleUser()`: a LINKED staff
 * record, active, a console role, and lifecycle `invited`.
 *
 * The ways in that are NOT allowed, and where each goes:
 *   - dead or already-used invite link → the expired panel below
 *   - no session at all                → /admin/login
 *   - Supabase user, no staff row      → /admin/no-access
 *   - deactivated account              → /admin/no-access
 *   - already accepted                 → onward to the console
 */
export default async function WelcomePage({
  searchParams
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const locale = await getPreLoginLocale();
  const t = getAdminT(locale);

  const expiredPanel = (
    <AuthShell locale={locale} title={t("welcome.title")} lede={t("welcome.lede")}>
      <div className="grid gap-4">
        <p className="alert alert-error">{t("welcome.expired")}</p>
        <Link href="/admin/login" className="btn btn-secondary">
          {t("login.submit")}
        </Link>
      </div>
    </AuthShell>
  );

  // The callback sends a dead or already-used link here.
  if (params.state === "expired") return expiredPanel;

  // Everything else is the guard's decision: no session → login, no staff row
  // or deactivated → no-access, already accepted → onward to the console.
  // Only a linked, active, still-invited console user gets the form.
  await requireInvitedConsoleUser();

  return (
    <AuthShell locale={locale} title={t("welcome.title")} lede={t("welcome.lede")}>
      <WelcomeForm
        labels={{
          password: t("welcome.password"),
          confirm: t("welcome.confirm"),
          submit: t("welcome.submit"),
          mismatch: t("welcome.mismatch"),
          tooShort: t("welcome.tooShort"),
          expired: t("welcome.expired"),
          denied: t("welcome.denied"),
          failed: t("welcome.failed")
        }}
      />
    </AuthShell>
  );
}
