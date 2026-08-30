import { redirect } from "next/navigation";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";
import { LocaleToggle } from "@/components/admin/LocaleToggle";
import { getAdminT, getPreLoginLocale } from "@/lib/admin/i18n";
import { resolveAccess, redirectTargetFor } from "@/lib/auth/guard";
import { safeNextPath } from "@/lib/auth/redirect";
import { supabaseConfigured } from "@/lib/env";

/**
 * The console's only entry point.
 *
 * There is NO account creation here, and there never will be: every account
 * arrives through an owner invitation (docs/admin-architecture.md). No
 * sign-up link, no role picker, no password reset that could enumerate
 * addresses.
 */
export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const locale = await getPreLoginLocale();
  const t = getAdminT(locale);

  // Already signed in? Send them wherever they actually belong. The two
  // mfa-* reasons below are legacy compatibility only — password-only Karma
  // never emits them — but the redirect stays exhaustive.
  const { decision } = await resolveAccess();
  if (decision.ok) redirect(next);
  if (!decision.ok && (decision.reason === "mfa-setup" || decision.reason === "mfa-challenge")) {
    redirect(redirectTargetFor(decision, next));
  }

  const configured = supabaseConfigured();

  return (
    <AuthShell
      locale={locale}
      eyebrow={t("login.eyebrow")}
      title={t("login.title")}
      lede={t("login.lede")}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t("login.noSignup")}</span>
          <LocaleToggle current={locale} label={t("login.languageLabel")} />
        </div>
      }
    >
      {configured ? (
        <LoginForm
          next={next}
          labels={{
            email: t("login.email"),
            password: t("login.password"),
            submit: t("login.submit"),
            submitting: t("login.submitting"),
            genericError: t("login.genericError"),
            unavailable: t("login.unavailable"),
            throttled: t("login.throttled")
          }}
        />
      ) : (
        <p className="alert alert-error">{t("login.unavailable")}</p>
      )}
    </AuthShell>
  );
}
