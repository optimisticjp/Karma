"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

export type NavEntry = {
  href: string | null;
  label: string;
  /** Sections whose module has not shipped yet are shown, but plainly inert. */
  available: boolean;
};

export type NavSection = { title: string; entries: NavEntry[] };

/**
 * A bottom-navigation destination.
 *
 * The bar takes at most four of these plus More. Which four is decided in the
 * layout, from a priority-ordered candidate list filtered by what the caller
 * can actually reach — so an operator whose one daily module is not in the
 * default four gets it promoted into a free slot instead of a dead tab.
 */
export type NavTab = { href: string; label: string; icon: IconName };

/**
 * Karma Console frame.
 *
 * DESKTOP is a persistent working rail. MOBILE, since 2026-08-31, is a
 * compact app bar plus a permanent bottom navigation — because the console is
 * used standing up, between a machine and a counter, and every module switch
 * used to cost a full-viewport drawer. The owner's drawer measured 795px:
 * twelve rows, three group headings and a footer, opened and closed dozens of
 * times a shift to reach four or five destinations.
 *
 * The bar carries at most FOUR destinations plus More. Which four is the
 * layout's decision (see the candidate list there), not this component's — the
 * shell renders what it is handed. A destination the caller cannot reach is
 * OMITTED rather than greyed: a dead tab in a bar of five is a fifth of the
 * product's navigation.
 *
 * More opens the same drawer as before, now anchored above the bar as a sheet.
 * It holds the full sectioned navigation, the account row and sign-out.
 *
 * Navigation remains a UX affordance only. Every destination
 * re-checks authorization server-side, and hidden navigation has never been
 * the security boundary.
 */
export function ConsoleShell({
  sections,
  tabs,
  brand,
  studio,
  personName,
  roleLabel,
  accountLabel,
  accountHref,
  signOut,
  closeMenuLabel,
  comingLaterLabel,
  moreLabel,
  primaryNavLabel,
  moreNavLabel,
  children
}: {
  sections: NavSection[];
  tabs: NavTab[];
  brand: string;
  studio: string;
  personName: string;
  roleLabel: string;
  accountLabel: string;
  accountHref: string;
  signOut: React.ReactNode;
  closeMenuLabel: string;
  comingLaterLabel: string;
  moreLabel: string;
  primaryNavLabel: string;
  moreNavLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>("a, button");
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
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
  }, [open]);

  const nav = (
    <nav aria-label={moreNavLabel} className="grid gap-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="microlabel px-3">{section.title}</p>
          <ul className="mt-1 grid gap-0.5">
            {section.entries.map((entry) => {
              const active =
                entry.href != null &&
                (pathname === entry.href ||
                  (entry.href !== "/admin" && pathname.startsWith(`${entry.href}/`)));
              return (
                <li key={entry.label}>
                  {entry.available && entry.href ? (
                    <Link
                      href={entry.href}
                      className="navlink"
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="min-w-0 truncate">{entry.label}</span>
                    </Link>
                  ) : (
                    <span className="navlink" aria-disabled="true">
                      <span className="min-w-0 truncate">{entry.label}</span>
                      <span className="sr-only"> — {comingLaterLabel}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  /* A tab is current when it is the exact route, or a route beneath it. The
     Today tab must match exactly: every console path starts with "/admin". */
  const isCurrent = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  /* More is "current" when nothing in the bar is, so the operator can always
     see where they are — a bar where no tab is lit reads as broken. */
  const inBar = tabs.some((tab) => isCurrent(tab.href));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="console-rail hidden border-r border-line lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="console-rail-brand border-b border-line">
          <p className="font-display text-h4 font-semibold leading-tight">{brand}</p>
          <p className="form-note mt-1.5">{studio}</p>
          <span aria-hidden className="stitch-line mt-4 block w-12" />
        </div>
        <div className="flex-1 px-3 py-5">{nav}</div>
        <div className="border-t border-line bg-card/55 p-5">
          <p className="text-smallmeta font-bold text-carbon">{personName}</p>
          <p className="form-note mt-0.5">{roleLabel}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
              {accountLabel}
            </Link>
            {signOut}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        {/* The app bar. It used to be 72px carrying the brand at 20px over
            `personName · roleLabel` at 15px — identity the operator already
            knows, restated on every screen. The name and role moved into the
            More sheet, where they belong beside the account link, and the bar
            is a 52px context line with the one utility a phone needs. */}
        <header className="console-appbar sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-card/96 px-4 backdrop-blur md:px-6 lg:hidden">
          <p className="min-w-0 truncate font-display text-base font-semibold leading-tight">
            {brand}
          </p>
          <Link href={accountHref} className="tap text-smallmeta font-semibold text-stone">
            {accountLabel}
          </Link>
        </header>

        {open ? (
          <>
            <button
              type="button"
              aria-label={closeMenuLabel}
              className="console-sheet-scrim lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div
              ref={drawerRef}
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label={moreNavLabel}
              className="console-sheet lg:hidden"
            >
              {nav}
              <div className="mt-4 border-t border-line px-3 pt-3">
                <p className="text-smallmeta font-bold text-carbon">{personName}</p>
                <p className="form-note mt-0.5">{roleLabel}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
                    {accountLabel}
                  </Link>
                  {signOut}
                </div>
              </div>
            </div>
          </>
        ) : null}

        <main id="main" className="console-main flex-1 px-4 py-4 sm:px-6 md:px-8 lg:px-10 lg:py-10 xl:px-12">
          {children}
        </main>

        {/* The bottom navigation. Four destinations at most, plus More.
            Rendered only below `lg`, where the rail is not on screen. */}
        <nav aria-label={primaryNavLabel} className="console-bar lg:hidden">
          <ul className="console-bar-list">
            {tabs.map((tab) => {
              const current = isCurrent(tab.href);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className="console-tab"
                    aria-current={current ? "page" : undefined}
                  >
                    <Icon name={tab.icon} size={20} />
                    <span className="console-tab-label">{tab.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                ref={triggerRef}
                type="button"
                className="console-tab"
                aria-expanded={open}
                aria-controls={drawerId}
                aria-current={!inBar && !open ? "page" : undefined}
                onClick={() => setOpen((v) => !v)}
              >
                <Icon name="menu" size={20} />
                <span className="console-tab-label">{open ? closeMenuLabel : moreLabel}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
