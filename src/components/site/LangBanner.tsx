"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_NAMES, type Locale } from "@/i18n/routing";
import { otherLocales } from "@/lib/i18n/localized";

/**
 * One-time, dismissible language suggestion (plan decision log #6):
 * we never auto-redirect by browser language; we offer, once.
 */
export function LangBanner() {
  const [show, setShow] = useState(false);
  const t = useTranslations("common.langBanner");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      if (!localStorage.getItem("kds-lang-choice")) setShow(true);
    } catch {}
  }, []);

  if (!show) return null;

  /* Derived rather than hardcoded to "the other one", so this keeps working
     whatever `routing.locales` holds. Each language is offered under its own
     name in its own script and therefore needs no translation — a Gujarati
     speaker recognises "ગુજરાતી" whatever page they landed on, which is the
     whole point of offering rather than redirecting. */
  const others = otherLocales(locale as Locale);
  const choose = (target: Locale) => {
    try {
      localStorage.setItem("kds-lang-choice", target);
    } catch {
      /* A locked-down browser should still be able to switch language. */
    }
    setShow(false);
    if (target !== locale) router.replace(pathname, { locale: target });
  };

  /* Collision management. This used to sit at `bottom-0` unless a per-page
     sticky action bar existed — and that bar has not existed as a component
     for two redesigns, so the branch never fired and the banner rendered
     underneath the Call/Directions bar: both of its buttons sat between 12px
     and 60px from the bottom of a 104px banner, almost entirely covered.
     `.lang-banner` now clears `--tabbar-h` unconditionally below 1280px and
     docks bottom-LEFT above it, so the WhatsApp FAB on the right stays clear. */
  return (
    <div className="lang-banner fixed inset-x-0 z-40 border-t border-line bg-card p-2.5 shadow-lg md:inset-x-auto md:left-6 md:right-auto md:max-w-sm md:rounded-xl md:border">
      <p className="text-smallmeta font-semibold">{t("question")}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {others.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => choose(code)}
            className="btn btn-primary !min-h-11 !px-3.5 text-sm"
          >
            {/* `lang` so the name is announced in the right voice and the
                script gets the line box its marks need. */}
            <span lang={code}>{LOCALE_NAMES[code].name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => choose(locale as Locale)}
          className="btn btn-ghost !min-h-11 !px-3 text-sm"
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
