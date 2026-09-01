"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** The six section destinations. Home is rendered explicitly before this row. */
const NAV = [
  { href: "/courses", key: "courses" },
  { href: "/batches", key: "batches" },
  { href: "/student-work", key: "work" },
  { href: "/notes", key: "notes" },
  { href: "/services", key: "services" },
  { href: "/about", key: "studio" }
] as const;

/** The phone menu adds Contact, because a phone menu is where a phone number is looked for. */
const MENU_NAV = [...NAV, { href: "/contact", key: "contact" }] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    document.documentElement.style.overflow = "hidden";
    const focusables = panel?.querySelectorAll<HTMLElement>("a, button");
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close]);

  const homeLink = (className: string) => (
    <Link href="/" className={className} aria-current={isActive("/") ? "page" : undefined}>
      {t("home")}
      {className === "site-nav-link" && isActive("/") ? <ThreadLine className="site-nav-mark" /> : null}
    </Link>
  );

  return (
    <>
      <header className="site-head">
        <div className="wrap site-head-inner">
          <BrandMark />

          <nav className="site-nav" aria-label="Primary">
            {homeLink("site-nav-link")}
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="site-nav-link"
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {t(item.key)}
                {isActive(item.href) ? <ThreadLine className="site-nav-mark" /> : null}
              </Link>
            ))}
          </nav>

          <div className="site-head-end">
            <LocaleSwitch />
            <Link href="/admission" className="act act-primary site-head-cta">
              {t("cta")}
            </Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="site-menu-btn"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? tc("closeMenu") : tc("openMenu")}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
              >
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <>
          <button type="button" aria-label={tc("closeMenu")} className="sheet-scrim" onClick={close} />
          <div
            ref={panelRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={tc("openMenu")}
            className="site-menu"
          >
            <nav aria-label="Mobile">
              <ul className="site-menu-list">
                <li>{homeLink("site-menu-link")}</li>
                {MENU_NAV.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="site-menu-link"
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <span>{t(item.key)}</span>
                      <span aria-hidden="true" className="arrow">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="site-menu-foot">
              <Link href="/admission" className="act act-primary w-full">{t("cta")}</Link>
              <div className="site-menu-actions">
                <a href={`tel:+${site.callPhone}`} className="act act-secondary">
                  <Icon name="phone" size={17} /> {tc("call")}
                </a>
                <a
                  href={waLink(tc("waPrefillDemo"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act act-secondary"
                >
                  <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
                </a>
              </div>
              <LocaleSwitch full className="site-menu-locale" />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
