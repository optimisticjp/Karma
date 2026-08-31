import Link from "next/link";
import type { AdminLocale } from "@/lib/admin/i18n";

/**
 * Chrome for the unauthenticated console screens: login, invite acceptance
 * and no-access. (Two legacy MFA screens once used this shell; Karma Console
 * is password-only and no longer has them.)
 *
 * Karma's own typography and tokens, not Supabase's branding: ivory ground,
 * one vermilion stitch line, precise borders, no illustration dependency, no
 * stock photography, no full-screen gimmick. It has to work at 360px in a
 * studio at 10pm.
 */
export function AuthShell({
  locale,
  eyebrow,
  title,
  lede,
  children,
  footer
}: {
  locale: AdminLocale;
  eyebrow?: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div lang={locale} className="flex min-h-screen flex-col bg-ivory bg-grid">
      <main
        id="main"
        className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col justify-center px-5 py-12"
      >
        <div className="panel p-6 md:p-8">
          {/* .microlabel self-neutralises its caps + tracking for Gujarati. */}
          <p className="microlabel">Karma Design Studio</p>
          <span aria-hidden className="stitch-line mt-3 block w-[4.5rem]" />

          {eyebrow ? <p className="eyebrow mt-6">{eyebrow}</p> : null}
          <h1 className={`text-h3 ${eyebrow ? "u-eyebrow-gap" : "mt-6"}`}>{title}</h1>
          {lede ? <p className="u-lede text-bodylg">{lede}</p> : null}

          <div className="u-actions">{children}</div>
        </div>

        {footer ? <div className="mt-6 text-smallmeta text-stone">{footer}</div> : null}

        {/* The way back to the public site. Its `<p>` holds nothing else, so
            it is a standalone control rather than a link inside a sentence,
            and WCAG 2.5.8's inline exception does not cover it. Measured at
            19px before `.tap`. */}
        <p className="mt-8 text-smallmeta text-stone">
          <Link href="/en" className="tap stitch-link">
            karmadesignstudio
          </Link>
        </p>
      </main>
    </div>
  );
}
