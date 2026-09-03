"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

export type NavEntry = {
  href: string | null;
  label: string;
  available: boolean;
  icon?: IconName;
};

export type NavSection = { title: string; entries: NavEntry[] };
export type NavTab = { href: string; label: string; icon: IconName };

/**
 * Shared console frame for desktop and mobile.
 *
 * The navigation is intentionally task-first. Permissions decide what is
 * rendered, while every destination still re-checks authorization server-side.
 * On phones the app bar says where the operator is, the bottom bar keeps the
 * four highest-frequency destinations one tap away, and More holds everything
 * else. On desktop the same information is grouped into a quiet working rail.
 */
export function ConsoleShell({
  sections,
  tabs,
  primaryAction,
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
  primaryAction?: NavTab | null;
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

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  const activeEntry = sections
    .flatMap((section) => section.entries)
    .find((entry) => entry.href && isCurrent(entry.href));
  const currentLabel = activeEntry?.label ?? brand;

  const nav = (
    <nav aria-label={moreNavLabel} className="console-nav">
      {sections.map((section) => (
        <section key={section.title}>
          <p className="console-nav-section-label">{section.title}</p>
          <ul className="console-nav-list">
            {section.entries.map((entry) => {
              const active = entry.href != null && isCurrent(entry.href);
              return (
                <li key={`${section.title}-${entry.label}`}>
                  {entry.available && entry.href ? (
                    <Link
                      href={entry.href}
                      className="console-navlink-v2"
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="console-nav-icon" aria-hidden="true">
                        {entry.icon ? <Icon name={entry.icon} size={18} /> : null}
                      </span>
                      <span className="min-w-0 truncate">{entry.label}</span>
                    </Link>
                  ) : (
                    <span className="console-navlink-v2" aria-disabled="true">
                      <span className="console-nav-icon" aria-hidden="true">
                        {entry.icon ? <Icon name={entry.icon} size={18} /> : null}
                      </span>
                      <span className="min-w-0 truncate">{entry.label}</span>
                      <span className="sr-only"> — {comingLaterLabel}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );

  const inBar = tabs.some((tab) => isCurrent(tab.href));

  return (
    <div className="admin-console min-h-screen lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="console-rail hidden border-r border-line lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="console-rail-brand border-b border-line">
          <p className="font-display text-h4 font-semibold leading-tight">{brand}</p>
          <p className="form-note mt-1">{studio}</p>
          {primaryAction ? (
            <Link href={primaryAction.href} className="console-primary-action">
              <Icon name={primaryAction.icon} size={18} />
              <span>{primaryAction.label}</span>
            </Link>
          ) : null}
        </div>
        <div className="flex-1 px-3 py-4">{nav}</div>
        <div className="border-t border-line bg-card/70 p-4">
          <p className="text-smallmeta font-bold text-carbon">{personName}</p>
          <p className="form-note mt-0.5">{roleLabel}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
              {accountLabel}
            </Link>
            {signOut}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        <header className="console-appbar sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line px-4 backdrop-blur md:px-6 lg:hidden">
          <div className="console-appbar-copy">
            <span className="console-appbar-kicker">{brand}</span>
            <span className="console-appbar-title">{currentLabel}</span>
          </div>
          {primaryAction ? (
            <Link href={primaryAction.href} className="console-appbar-action" aria-label={primaryAction.label}>
              <Icon name={primaryAction.icon} size={17} />
              <span className="hidden sm:inline">{primaryAction.label}</span>
            </Link>
          ) : (
            <Link href={accountHref} className="tap text-smallmeta font-semibold text-stone">
              {accountLabel}
            </Link>
          )}
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
              {primaryAction ? (
                <Link href={primaryAction.href} className="console-primary-action mx-3 mb-4">
                  <Icon name={primaryAction.icon} size={18} />
                  <span>{primaryAction.label}</span>
                </Link>
              ) : null}
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

        <main id="main" className="console-main flex-1 px-4 py-3 sm:px-6 md:px-8 lg:px-9 lg:py-8 xl:px-11">
          {children}
        </main>

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
