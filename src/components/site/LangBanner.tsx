"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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

  // Collision management (audit): sit above the sticky action bar where it
  // exists, and dock bottom-LEFT on desktop so the WhatsApp FAB stays clear.
  const hasStickyBar =
    pathname.startsWith("/courses/") ||
    pathname.startsWith("/admissions") ||
    pathname.startsWith("/admission");

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 border-t border-line bg-card p-3 shadow-lg md:inset-x-auto md:bottom-6 md:left-6 md:right-auto md:max-w-sm md:rounded-xl md:border",
        hasStickyBar ? "bottom-[4.25rem]" : "bottom-0"
      )}
    >
      <p className="text-smallmeta font-semibold">{t("question")}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => choose(other)} className="btn btn-primary !px-4 !py-2 text-sm">
          {t("action")}
        </button>
        <button type="button" onClick={() => choose(locale)} className="btn btn-ghost !px-3 !py-2 text-sm">
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
