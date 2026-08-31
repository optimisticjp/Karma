"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { StitchPath } from "@/components/ui/StitchPath";
import { StepIndex } from "@/components/ui/MonoNote";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "home" },
  { href: "/courses", key: "courses" },
  { href: "/admissions", key: "admissions" },
  { href: "/student-work", key: "work" },
  { href: "/notes", key: "notes" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" }
] as const;

/**
 * Public navigation: quiet editorial chrome around the work, with one clear
 * conversion action. Mobile uses a real dialog with Escape, focus containment,
 * focus restoration and body-scroll locking.
 */
export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Home must match exactly: every path startsWith("/"). */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
    <header
      className={cn(
        "site-header sticky top-0 z-50 border-b border-line bg-ivory/96 backdrop-blur-[10px]",
        condensed ? "is-condensed" : ""
      )}
    >
      <div className="container-site flex h-full items-center justify-between gap-4">
        <Link
          href="/"
          className="site-brand-mark flex min-w-0 items-center gap-2 leading-none"
          aria-label="Karma Design Studio: home"
        >
          {/* Karma has no logo file, so the wordmark has to carry the brand on
              its own. Two weights plus a three-stitch tick does that without
              inventing a mark the owner never approved — and it stays one
              line, which is what kept breaking below 1440. */}
          <StitchPath
            d="M2 0 V 26"
            viewBox="0 0 4 26"
            tone="vermilion"
            width={2.5}
            className="site-brand-tick"
          />
          <span className="site-brand-word whitespace-nowrap font-display text-lg text-carbon sm:text-xl xl:text-[1.375rem]">
            <span className="site-brand-name">Karma</span>{" "}
            <span className="site-brand-tail">Design Studio</span>
          </span>
        </Link>

        {/* Eight items, so the row is tight at exactly 1280. The nav gives up
            space before the brand does — `shrink` on the nav plus a gap that
            cannot collapse means the wordmark is never squeezed into the
            first nav item, which is what it did at 1280 once the brand became
            shrinkable for the 200%-zoom fix. */}
        <nav
          className="site-nav hidden shrink items-center gap-3.5 xl:flex 2xl:gap-6"
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

        <div className="flex shrink-0 items-center gap-2.5">
          <LanguageToggle compact className="hidden sm:flex" />
          <Link href="/admission" className="btn btn-primary hidden !min-h-11 !px-3.5 text-sm md:inline-flex">
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
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <>
          {/* The scrim's top offset used to be a hardcoded `top-16 md:top-20`
              mirroring the header's own `h-16 md:h-20` — two literals that had
              to be edited together and, on a tablet, had already drifted. Both
              now read `--header-h`.

              z-40 was also wrong in a way nothing caught: `.tabbar` sat at
              z-45, so the Call/Directions bar painted ON TOP of the scrim of
              an aria-modal dialog and stayed tappable outside its focus trap.
              The bar is z-30 now and this is z-40, which is the order the two
              were always meant to be in. */}
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
            <nav className="container-site flex flex-col py-2" aria-label="Mobile">
              {NAV.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  /* 48px rows, not 56: `text-lg` carried Tailwind's paired
                     1.75rem line-height, so eight links cost 456px — most of a
                     phone viewport to show a menu. Still comfortably past the
                     44px floor. */
                  className="group grid min-h-12 grid-cols-[1.75rem_1fr_auto] items-center gap-2.5 border-b border-line/70 py-2 text-base font-semibold"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {/* Machine notation, not decoration: the menu is an index
                      of the site, so it is numbered like one. */}
                  <StepIndex n={index + 1} className="text-vermilion-deep" />
                  <span>{t(item.key)}</span>
                  <span aria-hidden="true" className="text-stone transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
              <div className="grid gap-2 py-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <LanguageToggle />
                <Link href="/admission" className="btn btn-primary w-full text-sm">
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
