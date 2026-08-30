"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Persistent mobile navigation.
 *
 * This audience is phone-first and one-handed, and the old mobile design put
 * every destination behind a hamburger while a separate sticky CTA bar and a
 * floating WhatsApp button fought for the same corner. Three competing systems.
 * This replaces all of them: five fixed destinations, the booking action in the
 * middle where the thumb rests, and nothing else docked to the bottom.
 *
 * Deliberately not app-chrome-for-its-own-sake — it is hairlines and the same
 * type as the rest of the site, so it reads as part of the studio's identity
 * rather than a bolted-on tab bar.
 */

type Tab = {
  href: string;
  key: "home" | "courses" | "book" | "work" | "contact";
  icon: IconName;
  /** The booking action is the reason this bar exists. */
  primary?: boolean;
};

const TABS: Tab[] = [
  { href: "/", key: "home", icon: "hoop" },
  { href: "/courses", key: "courses", icon: "layers" },
  { href: "/admission", key: "book", icon: "needle", primary: true },
  { href: "/student-work", key: "work", icon: "sequin" },
  { href: "/contact", key: "contact", icon: "pin" }
];

export function MobileTabBar() {
  const t = useTranslations("tabbar");
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="tabbar xl:hidden" aria-label={t("label")}>
      <ul className="tabbar-list">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn("tabbar-item", tab.primary && "is-primary")}
              >
                <span className="tabbar-icon" aria-hidden="true">
                  <Icon name={tab.icon} size={tab.primary ? 21 : 20} />
                </span>
                <span className="tabbar-label">{t(tab.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
