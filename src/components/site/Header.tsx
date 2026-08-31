"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageChooser } from "./LanguageChooser";
import { StitchPath } from "@/components/ui/StitchPath";

/**
 * Desktop navigation: six links.
 *
 * The previous row carried eight — Home, Courses, Admissions, Student Work,
 * Machine Notes, Services, About, Contact — and the source itself recorded
 * that it was tight at exactly 1280. Three changes, all from
 * `docs/modern-textile-lab-ia.md` §4:
 *
 *  - **Home leaves.** The wordmark is the home link. Two controls doing one
 *    job is how a row reaches eight items.
 *  - **Admissions leaves.** `/batches` is the question people navigate for —
 *    "when can I come" — and it reaches the admission norms from its own
 *    joining sequence. Admissions stays in the footer and the mobile menu.
 *  - **Contact leaves**, which the plan permits explicitly when contact is
 *    prominent in the mobile menu, the footer and the Visit pathways. It is in
 *    all three, and `/contact` is one tap from the Studio page.
 *
 * **"Studio" is a label, not a route.** It points at `/about`, which keeps its
 * URL: a display name is a decision, a URL is a promise to everyone who has
 * already shared it.
 */
const NAV = [
  { href: "/courses", key: "courses" },
  { href: "/batches", key: "batches" },
  { href: "/student-work", key: "work" },
  { href: "/notes", key: "notes" },
  { href: "/services", key: "services" },
  { href: "/about", key: "studio" }
] as const;

/**
 * The mobile menu carries the same six plus Contact, because a phone menu is
 * where someone looks for a phone number.
 */
const MOBILE_NAV = [...NAV, { href: "/contact", key: "contact" }] as const;

/**
 * Public navigation.
 *
 * Mobile is a real dialog: Escape, focus containment, focus restoration and
 * body-scroll locking. The header is ~56px on a phone and carries exactly
 * three things — wordmark, language, menu.
 */
export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* `/about` is reached from a nav item labelled "Studio", so an exact-prefix
     match is what lights it. Nothing matches "/" any more — the wordmark is
     the home link and it is not part of the nav list. */
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
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
    <header className="site-header sticky top-0 z-50 border-b border-line bg-ivory/96 backdrop-blur-[10px]">
      <div className="container-site flex h-full items-center justify-between gap-3">
        <Link
          href="/"
          className="site-brand-mark flex min-w-0 items-center gap-2 leading-none"
          aria-label="Karma Design Studio: home"
        >
          {/* Karma has no logo file, so the wordmark carries the brand on its
              own: two weights and a single stitch tick. */}
          <StitchPath
            d="M2 0 V 26"
            viewBox="0 0 4 26"
            tone="vermilion"
            width={2.5}
            className="site-brand-tick"
          />
          <span className="site-brand-word whitespace-nowrap font-display text-lg text-carbon sm:text-xl">
            <span className="site-brand-name">Karma</span>{" "}
            <span className="site-brand-tail">Design Studio</span>
          </span>
        </Link>

        <nav
          className="site-nav hidden shrink items-center gap-4 xl:flex 2xl:gap-6"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="site-nav-link whitespace-nowrap"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="relative flex shrink-0 items-center gap-2">
          {/* `relative` on the wrapper is what the desktop popover anchors to.
              On a phone the same component opens a bottom sheet instead, from
              a fixed position, so the anchor is harmless there. */}
          <LanguageChooser />
          <Link
            href="/admission"
            className="btn btn-primary hidden !min-h-11 !px-3.5 md:inline-flex"
          >
            {t("cta")}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost !min-h-11 !px-2 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? tc("closeMenu") : tc("openMenu")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <>
          <div
            aria-hidden="true"
            onClick={close}
            className="site-menu-scrim fixed inset-x-0 bottom-0 z-40 bg-carbon/45 xl:hidden"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={tc("openMenu")}
            className="site-menu-panel absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-line bg-ivory xl:hidden"
          >
            <nav className="container-site flex flex-col py-1" aria-label="Mobile">
              {MOBILE_NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  /* ~48px rows. The previous menu numbered each row like an
                     index; seven rows and a CTA read better without it, and
                     the number was competing with the label for the eye. */
                  className="group flex min-h-12 items-center justify-between gap-3 border-b border-line/70 py-2 text-base font-semibold"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <span>{t(item.key)}</span>
                  <span aria-hidden="true" className="text-stone transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ))}
              {/* Anchored at the bottom of the menu, not floating in the middle
                  of the list where it competes with navigation. */}
              <div className="py-3">
                <Link href="/admission" className="btn btn-primary w-full">
                  {t("cta")}
                </Link>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
