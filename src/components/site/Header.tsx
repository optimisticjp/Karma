"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/courses", key: "courses" },
  { href: "/admissions", key: "admissions" },
  { href: "/student-work", key: "work" },
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
          className="site-brand-mark flex min-w-0 flex-col leading-none"
          aria-label="Karma Design Studio: home"
        >
          <span className="truncate font-display text-xl font-semibold tracking-tight text-carbon md:text-2xl">
            Karma Design Studio
          </span>
          <span className="microlabel mt-1 hidden md:block">{tc("descriptor")}</span>
        </Link>

        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="stitch-link whitespace-nowrap text-[0.92rem] font-semibold text-stone hover:text-carbon"
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <LanguageToggle className="hidden sm:flex" />
          <Link href="/admission" className="btn btn-primary hidden !min-h-11 !px-4 text-sm md:inline-flex">
            {t("cta")}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost !min-h-11 !px-2 lg:hidden"
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
          <div
            aria-hidden="true"
            onClick={close}
            className="fixed inset-0 top-16 z-40 bg-carbon/45 lg:hidden"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={tc("openMenu")}
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ivory lg:hidden"
          >
            <nav className="container-site flex flex-col py-4" aria-label="Mobile">
              {NAV.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-line/70 py-3.5 text-lg font-semibold"
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
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
