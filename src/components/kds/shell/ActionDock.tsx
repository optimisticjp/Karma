"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/site";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";

/**
 * The contextual conversion dock — **Book Free Demo | WhatsApp**.
 *
 * WHAT IT REPLACES, AND WHY
 * -------------------------
 * Until now every public page carried a permanent two-item bar at the bottom
 * of a phone screen: *Call for demo* and *Directions*. It was pinned to the
 * privacy policy, the terms page and the Machine Notes archive, where neither
 * action is the next step anybody is taking.
 *
 * The plan's §15 replaces that with contextual conversion: the dock appears on
 * the HIGH-INTENT routes — a course detail, `/admission`, `/admissions`,
 * `/batches` — and nowhere else. General pages rely on the header's Book Free
 * Demo, an inline call to action, and the footer. `/contact` does not get one
 * either: it puts Call, WhatsApp and Directions in its own first viewport,
 * which is better than a bar covering them.
 *
 * A route opts in by rendering this. There is no route list here on purpose —
 * a component that decides where it belongs from a hardcoded array of paths
 * goes stale the moment a route is renamed.
 *
 * THE TWO PHONE ROLES SURVIVE
 * ---------------------------
 * The WhatsApp action opens `site.whatsapp`. It is never `callPhone`: which
 * number answers which channel has not been confirmed by the owner, so the
 * roles are kept apart. A dock that offered "Call" would dial `callPhone`.
 *
 * DESKTOP
 * -------
 * Hidden from 1024px up. On a laptop the header's action is always visible and
 * a bar pinned across the bottom of a wide window is chrome, not help.
 */
export function ActionDock({
  /** Where the demo action points. Course pages pre-select their course. */
  demoHref = "/admission",
  /** Named for analytics, e.g. `"course"`, `"batches"`, `"admission"`. */
  surface
}: {
  demoHref?: string;
  surface: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();

  /* The dock covers the bottom of the page, so the page has to give it back
     the space. Done here rather than by each route, because a route that
     forgets loses its own last element behind the bar. */
  useEffect(() => {
    document.body.classList.add("has-dock");
    return () => document.body.classList.remove("has-dock");
  }, []);

  return (
    <div className="dock" role="group" aria-label={t("bookDemo")}>
      <Link
        href={demoHref}
        className="act act-primary"
        onClick={() => track("demo_click", { surface, locale })}
      >
        {t("bookDemo")}
      </Link>
      <a
        href={waLink(t("waPrefillDemo"))}
        target="_blank"
        rel="noopener noreferrer"
        className="act act-secondary"
        onClick={() => track("whatsapp_click", { surface, locale })}
        aria-label={t("whatsapp")}
      >
        <Icon name="whatsapp" size={19} />
        <span className="sr-only">{t("whatsapp")}</span>
      </a>
    </div>
  );
}
