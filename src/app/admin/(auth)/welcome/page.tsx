import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { WelcomeForm } from "./WelcomeForm";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";
import { getVerifiedUser } from "@/lib/supabase/server";

/**
 * Invitation acceptance. Reached from the callback route with the session the
 * invite link established. An expired or already-used link lands here too,
 * with an honest message instead of a stack trace.
 */
export default async function WelcomePage({
  searchParams
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const locale = await getPreLoginLocale();
  const t = getAdminT(locale);

  const user = params.state === "expired" ? null : await getVerifiedUser();

  return (
    <AuthShell locale={locale} title={t("welcome.title")} lede={t("welcome.lede")}>
      {user ? (
        <WelcomeForm
          labels={{
            password: t("welcome.password"),
            confirm: t("welcome.confirm"),
            submit: t("welcome.submit"),
            mismatch: t("welcome.mismatch"),
            tooShort: t("welcome.tooShort"),
            expired: t("welcome.expired"),
            failed: t("welcome.failed")
          }}
        />
      ) : (
        <div className="grid gap-4">
          <p className="alert alert-error">{t("welcome.expired")}</p>
          <Link href="/admin/login" className="btn btn-secondary">
            {t("login.submit")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
