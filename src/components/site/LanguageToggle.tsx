"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * EN | ગુ pill. Switches to the SAME page in the other language and remembers
 * the explicit choice (plan 13.2). Text labels, never flags.
 */
export function LanguageToggle({
  className,
  /** Header needs "EN / ગુ"; the mobile menu has room for the full words. */
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: "en" | "gu") => {
    if (next === locale) return;
    try {
      localStorage.setItem("kds-lang-choice", next);
    } catch {}
    router.replace(pathname, { locale: next });
  };

  /* lang on the label matters twice over: a screen reader announces "ગુજરાતી"
     with the right voice, and the browser gives the Gujarati vowel marks the
     line box they need instead of cramping them into the Latin one. */
  const btn = (code: "en" | "gu", label: string, short: string) => (
    <button
      type="button"
      onClick={() => switchTo(code)}
      aria-pressed={locale === code}
      className={cn(
        "rounded-full py-1 text-sm font-semibold transition-colors duration-150",
        compact ? "px-2.5" : "px-3",
        locale === code ? "bg-carbon text-ivory" : "text-stone hover:text-carbon"
      )}
    >
      <span lang={code} className="leading-normal">{compact ? short : label}</span>
      {compact ? <span className="sr-only" lang={code}>{label}</span> : null}
    </button>
  );

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-full border border-line bg-card p-0.5", className)}
      role="group"
      aria-label="Language / ભાષા"
    >
      {btn("en", "English", "EN")}
      {btn("gu", "ગુજરાતી", "ગુ")}
    </div>
  );
}
