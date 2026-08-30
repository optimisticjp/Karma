"use client";

import { useTranslations, useLocale } from "next-intl";
import { site } from "@/lib/site";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";

/**
 * The permanent mobile action bar: two actions, and nothing else.
 *
 * This replaced a five-tab navigation bar, which replaced three competing
 * systems before it. The five tabs were an improvement on the mess but still
 * the wrong answer: a visitor arriving from an Instagram reel is not browsing
 * a site map, they are deciding whether to phone. Navigation is what the
 * header menu is for; the bottom of a phone screen is worth more than that.
 *
 * So: call, or get directions. Both are the actual conversion, both are one
 * thumb-reach away, and neither needs a page load to pay off.
 *
 * The call dials `site.callPhone` — the number the owner published on
 * Facebook — and is never labelled WhatsApp, because which number answers
 * what has not been confirmed. See the note in `src/lib/site.ts`.
 */
export function MobileTabBar() {
  const t = useTranslations("tabbar");
  const locale = useLocale();

  return (
    <nav className="tabbar xl:hidden" aria-label={t("label")}>
      <ul className="tabbar-list">
        <li>
          <a
            href={`tel:+${site.callPhone}`}
            className="tabbar-item is-primary"
            onClick={() => track("call_demo_click", { surface: "tabbar", locale })}
          >
            <span className="tabbar-icon" aria-hidden="true">
              <Icon name="phone" size={20} />
            </span>
            <span className="tabbar-label">{t("call")}</span>
          </a>
        </li>
        <li>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tabbar-item"
            onClick={() => track("directions_click", { surface: "tabbar", locale })}
          >
            <span className="tabbar-icon" aria-hidden="true">
              <Icon name="pin" size={20} />
            </span>
            <span className="tabbar-label">{t("directions")}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
