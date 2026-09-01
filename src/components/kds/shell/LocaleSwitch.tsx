"use client";

import { Fragment } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Compact bilingual switch used everywhere on the public site.
 *
 * The visible treatment is deliberately fixed to `EN।ગુજ`: the same two
 * choices in the same place and script on desktop, mobile menus and any future
 * public surface. Each half remains a real same-page locale link, so it works
 * without JavaScript and stays meaningful to assistive technology/crawlers.
 */
export function LocaleSwitch({
  className,
  /** Kept for backwards-compatible callers; the visible label is now always compact. */
  full: _full = false
}: {
  className?: string;
  full?: boolean;
}) {
  const current = useLocale() as Locale;
  const pathname = usePathname();

  const remember = (next: Locale) => {
    try {
      localStorage.setItem("kds-lang-choice", next);
    } catch {
      /* A locked-down browser is not a reason to fail to switch language. */
    }
  };

  return (
    <nav className={cn("locale-switch", className)} aria-label="Language">
      {routing.locales.map((code, index) => {
        const isCurrent = code === current;
        const visible = code === "en" ? "EN" : "ગુજ";
        const accessible = code === "en" ? "English" : "ગુજરાતી";
        return (
          <Fragment key={code}>
            {index > 0 ? <span aria-hidden="true" className="locale-separator">।</span> : null}
            <Link
              href={pathname}
              locale={code}
              hrefLang={code}
              lang={code}
              aria-label={accessible}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => remember(code)}
              className="locale-option"
            >
              {visible}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
