"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

export type NavEntry = {
  href: string | null;
  label: string;
  /** Sections whose module has not shipped yet are shown, but plainly inert. */
  available: boolean;
};

export type NavSection = { title: string; entries: NavEntry[] };

/**
 * The Karma Console frame: a persistent rail on desktop, a drawer on a phone.
 *
 * Navigation reflects what the signed-in person can reach — but NAVIGATION IS
 * NOT SECURITY. Every destination re-checks the database itself; hiding a link
 * is courtesy, not a control.
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

  // Any navigation closes the drawer; Escape does too.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = (
    <nav aria-label={brand} className="grid gap-6">
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
                      {entry.label}
                    </Link>
                  ) : (
                    <span className="navlink" aria-disabled="true">
                      {entry.label}
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
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {/* ------------------------------ desktop rail ----------------------- */}
      <aside className="hidden border-r border-line bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="border-b border-line p-5">
          <p className="text-h4">{brand}</p>
          <p className="form-note mt-1">{studio}</p>
          <span aria-hidden className="stitch-line mt-3 block w-10" />
        </div>
        <div className="flex-1 p-3">{nav}</div>
        <div className="border-t border-line p-5">
          <p className="text-smallmeta font-semibold">{personName}</p>
          <p className="form-note">{roleLabel}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
              {accountLabel}
            </Link>
            {signOut}
          </div>
        </div>
      </aside>

      {/* ------------------------------ mobile bar ------------------------- */}
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-card px-5 py-3 lg:hidden">
          <div>
            <p className="text-h4 leading-none">{brand}</p>
            <p className="form-note mt-1">{personName}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? closeMenuLabel : menuLabel}
          </button>
        </header>

        {open ? (
          <div
            id={drawerId}
            className="border-b border-line bg-card p-3 lg:hidden"
          >
            {nav}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-line px-3 pt-4">
              <Link href={accountHref} className="stitch-link text-smallmeta font-semibold">
                {accountLabel}
              </Link>
              {signOut}
            </div>
          </div>
        ) : null}

        <main id="main" className="flex-1 px-5 py-8 md:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
