"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * EN | ગુ pill. Switches to the SAME page in the other language and remembers
 * the explicit choice (plan 13.2). Text labels, never flags.
 */
export function LanguageToggle({ className }: { className?: string }) {
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

  const btn = (code: "en" | "gu", label: string) => (
    <button
      type="button"
      onClick={() => switchTo(code)}
      aria-pressed={locale === code}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-150",
        locale === code ? "bg-carbon text-ivory" : "text-stone hover:text-carbon"
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-full border border-line bg-card p-0.5", className)}
      role="group"
      aria-label="Language / ભાષા"
    >
      {btn("en", "English")}
      {btn("gu", "ગુજરાતી")}
    </div>
  );
}
