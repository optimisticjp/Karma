"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export type NavEntry = {
  href: string | null;
  label: string;
  /** Sections whose module has not shipped yet are shown, but plainly inert. */
  available: boolean;
};

export type NavSection = { title: string; entries: NavEntry[] };

/**
 * Karma Console frame: a persistent working rail on desktop and a proper
 * modal-style drawer on phones. Navigation remains a UX affordance only;
 * every destination still re-checks authorization server-side.
 */
export function ConsoleShell({
  sections,
  brand,
  studio,
  personName,
  roleLabel,
  accountLabel,
  accountHref,
  signOut,
  menuLabel,
  closeMenuLabel,
  comingLaterLabel,
  children
}: {
  sections: NavSection[];
  brand: string;
  studio: string;
  personName: string;
  roleLabel: string;
  accountLabel: string;
  accountHref: string;
  signOut: React.ReactNode;
  menuLabel: string;
  closeMenuLabel: string;
  comingLaterLabel: string;
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
    <nav aria-label={brand} className="grid gap-7">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="microlabel px-3">{section.title}</p>
          <ul className="mt-2 grid gap-0.5">
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
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-line bg-card/96 px-4 py-2.5 backdrop-blur md:px-6 lg:hidden">
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold leading-tight">{brand}</p>
            <p className="form-note mt-0.5 truncate">{personName} · {roleLabel}</p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="btn btn-secondary !min-h-11 !px-3"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? closeMenuLabel : menuLabel}
          </button>
        </header>

        {open ? (
          <>
            <button
              type="button"
              aria-label={closeMenuLabel}
              className="fixed inset-0 top-16 z-30 bg-carbon/35 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div
              ref={drawerRef}
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label={brand}
              className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-card px-3 py-5 lg:hidden"
            >
              {nav}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-line px-3 pt-5">
                <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
                  {accountLabel}
                </Link>
                {signOut}
              </div>
            </div>
          </>
        ) : null}

        <main id="main" className="console-main flex-1 px-4 py-7 sm:px-6 md:px-8 lg:px-10 lg:py-10 xl:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
