"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

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

  const other = locale === "en" ? "gu" : "en";
  const choose = (target: string) => {
    try {
      localStorage.setItem("kds-lang-choice", target);
    } catch {}
    setShow(false);
    if (target !== locale) router.replace(pathname, { locale: target as "en" | "gu" });
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
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => choose(other)} className="btn btn-primary !px-3.5 !py-1.5 text-sm">
          {t("action")}
        </button>
        <button type="button" onClick={() => choose(locale)} className="btn btn-ghost !px-3 !py-1.5 text-sm">
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
