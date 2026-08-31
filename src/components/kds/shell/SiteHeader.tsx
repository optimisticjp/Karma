"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The public header.
 *
 * Six destinations, in the order a visitor's questions arrive: what can I
 * learn, when can I come, what does the work look like, do these people know
 * the machine, can they do my job, who are they.
 *
 * WHAT IS NOT IN THE ROW, AND WHY
 * -------------------------------
 *  - **Home.** The brand mark is the home link. Two controls doing one job is
 *    how a row reaches eight items.
 *  - **Admissions.** `/batches` answers the question people actually navigate
 *    for — *when can I come* — and reaches the admission norms from its own
 *    joining sequence. Admissions stays in the footer and the mobile menu.
 *  - **Contact.** The plan permits this explicitly when contact is prominent
 *    elsewhere (§14). It is in the mobile menu, the footer, and one tap from
 *    the Studio page — and the menu carries the phone number directly.
 *
 * "Studio" is a LABEL, not a route: it points at `/about`, which keeps its
 * URL. A display name is a decision; a URL is a promise to everyone who has
 * already shared it.
 */
const NAV = [
  { href: "/courses", key: "courses" },
  { href: "/batches", key: "batches" },
  { href: "/student-work", key: "work" },
  { href: "/notes", key: "notes" },
  { href: "/services", key: "services" },
  { href: "/about", key: "studio" },
] as const;

/** The phone menu adds Contact, because a phone menu is where a phone number
    is looked for. */
const MENU_NAV = [...NAV, { href: "/contact", key: "contact" }] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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

  return (
    /* THE MENU IS A SIBLING OF THE HEADER, NOT A CHILD.
       `.site-head` carries a `backdrop-filter`, and a filtered element becomes
       the containing block for its `position: fixed` descendants — so a scrim
       rendered inside it resolved `inset: 0` against the 56px header instead
       of the viewport. Measured: the scrim was 390×56, and a tap in the middle
       of the contextual dock still reached the dock while a modal dialog was
       open. Moving it out is the fix; dropping the blur would have been the
       other one. */
    <>
      <header className="site-head">
        <div className="wrap site-head-inner">
          <BrandMark />

          <nav className="site-nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="site-nav-link"
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {t(item.key)}
                {/* The active link is stitched, not underlined. A running stitch
                  is the site's one repeated mark, so "you are here" uses it
                  rather than inventing a second signal. */}
                {isActive(item.href) ? (
                  <ThreadLine className="site-nav-mark" />
                ) : null}
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
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <>
          <button
            type="button"
            aria-label={tc("closeMenu")}
            className="sheet-scrim"
            onClick={close}
          />
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
                {MENU_NAV.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="site-menu-link"
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <span>{t(item.key)}</span>
                      <span aria-hidden="true" className="arrow">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="site-menu-foot">
              <Link href="/admission" className="act act-primary w-full">
                {t("cta")}
              </Link>
              {/* Call and WhatsApp live here rather than in a bar pinned to
                  every page. The two numbers keep their separate roles: the
                  call action dials `callPhone` and the WhatsApp action opens
                  `whatsapp`, and neither is ever labelled as the other.
                  See src/lib/site.ts. */}
              <div className="site-menu-actions">
                <a
                  href={`tel:+${site.callPhone}`}
                  className="act act-secondary"
                >
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
