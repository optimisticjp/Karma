"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { LOCALE_NAMES, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * EN | ગુ.
 *
 * WHY THIS REPLACED A BOTTOM SHEET
 * --------------------------------
 * The previous control was a popover-on-desktop, bottom-sheet-on-mobile dialog
 * with focus trapping, scroll locking and a native-script preview line per
 * option. It was built for three locales. With two, the plan is explicit: do
 * not over-engineer a giant language bottom sheet (§14). A dialog to choose
 * between two things you can see at once is a dialog too many.
 *
 * WHY LINKS RATHER THAN BUTTONS
 * -----------------------------
 * Each option is the SAME PAGE in the other language, which is a destination,
 * so it is an anchor. That is not pedantry — it means the control works with
 * no JavaScript, opens in a new tab on a middle click, is announced as a link,
 * and gives a crawler the same-page alternate it already sees in `hreflang`.
 *
 * Remembering the choice needs script, so that is layered on top: the click
 * handler writes the preference and the navigation happens either way. Nothing
 * auto-redirects on it — `localeDetection` stays off and the URL still
 * decides. The stored value is read only by the one-time banner.
 *
 * ACCESSIBILITY
 * -------------
 * The group is a `nav` with a name, each option carries its own `lang` so it
 * is announced in the right voice and its marks get the line box they need,
 * and the current one is marked `aria-current="true"` rather than being
 * identified by colour alone. Targets are 44px.
 */
export function LocaleSwitch({
  className,
  /** The mobile menu renders full names; the header renders short codes. */
  full = false
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
      {routing.locales.map((code) => {
        const meta = LOCALE_NAMES[code];
        const isCurrent = code === current;
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            hrefLang={code}
            lang={code}
            aria-current={isCurrent ? "true" : undefined}
            onClick={() => remember(code)}
            className="locale-option"
          >
            {full ? meta.name : meta.short}
          </Link>
        );
      })}
    </nav>
  );
}
