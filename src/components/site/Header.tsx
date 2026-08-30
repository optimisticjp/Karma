"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { StitchPath } from "@/components/ui/StitchPath";
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
        condensed ? "is-condensed h-16" : "h-16 md:h-20"
      )}
    >
      <div className="container-site flex h-full items-center justify-between gap-5">
        <Link
          href="/"
          className="site-brand-mark flex shrink-0 items-center gap-2 leading-none"
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

        {/* Eight items now that Machine Notes is here. gap-4 at 1280 keeps the
            brand and the CTA clear of the nav; 2xl gets the roomier spacing. */}
        <nav className="hidden items-center gap-4 xl:flex 2xl:gap-6" aria-label="Primary">
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
          {/* Offsets must track the header's own height, or the scrim starts
              16px too high on tablets (where the header is 80px, not 64px). */}
          <div
            aria-hidden="true"
            onClick={close}
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 bg-carbon/45 xl:hidden",
              condensed ? "top-16" : "top-16 md:top-20"
            )}
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={tc("openMenu")}
            className={cn(
              "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-line bg-ivory xl:hidden",
              condensed ? "max-h-[calc(100dvh-4rem)]" : "max-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-5rem)]"
            )}
          >
            <nav className="container-site flex flex-col py-4" aria-label="Mobile">
              {NAV.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-line/70 py-3.5 text-lg font-semibold"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <span className="font-display text-sm text-vermilion-deep" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{t(item.key)}</span>
                  <span aria-hidden="true" className="text-stone transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
              <div className="grid gap-3 py-5 sm:grid-cols-[auto_1fr] sm:items-center">
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
