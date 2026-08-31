"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_NAMES, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * The language chooser: a popover on a laptop, a bottom sheet on a phone.
 *
 * ⚠ SLATED FOR REPLACEMENT in the shell rebuild. With exactly two public
 * locales a bottom sheet is more control than the decision needs — see
 * `docs/karma-modern-textile-lab-redesign-plan.md` §14, "do not over-engineer
 * a giant language bottom sheet". It renders both locales correctly today,
 * which is why it stayed through the recovery phase rather than being
 * half-rewritten twice.
 *
 * WHAT ANY REPLACEMENT MUST KEEP
 * ------------------------------
 *  - **A language is offered in its own script.** A Gujarati speaker scans
 *    for "ગુજરાતી", not for "Gujarati". Every row carries `lang` so a screen
 *    reader announces it in the right voice and the browser gives Gujarati
 *    vowel marks the line box they need instead of cramping them into a Latin
 *    one.
 *  - **No flags.** A flag is a country; a language is not.
 *  - **The route is preserved.** Switching language on a course page lands on
 *    the same course, not the homepage.
 *  - **The choice is remembered** — but nothing auto-redirects on it. The URL
 *    still decides; `localeDetection` stays off. The stored value is only read
 *    by the one-time banner that offers the other language.
 *  - **It is a real dialog:** Escape closes it, focus is trapped inside it,
 *    focus returns to the trigger, and the page behind it does not scroll.
 */
export function LanguageChooser({
  className,
  /** The header's compact trigger; the mobile menu passes `false` for a full row. */
  compact = true
}: {
  className?: string;
  compact?: boolean;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>("button, a");
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

  const choose = (next: Locale) => {
    if (next !== locale) {
      try {
        localStorage.setItem("kds-lang-choice", next);
      } catch {
        /* A locked-down browser is not a reason to fail to switch language. */
      }
      /* `replace`, not `push`: the same page in another language is not a
         separate step in the visitor's history, and Back should leave the
         site rather than flip the language. */
      router.replace(pathname, { locale: next });
    }
    close();
  };

  const current = LOCALE_NAMES[locale];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className={cn(
          "tap inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 text-smallmeta font-semibold",
          className
        )}
      >
        {/* A globe, not a flag. Drawn rather than an emoji so it inherits the
            ink colour and does not become a different picture per platform. */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
        </svg>
        <span lang={locale}>{compact ? current.short : current.name}</span>
        <span className="sr-only">
          {/* Named in English as well, so the control is findable by a screen
              reader user who does not read the current script. */}
          {" — language"}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            className="sheet-scrim"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Language"
            className="sheet lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-64 lg:rounded-[0.625rem] lg:border lg:border-line lg:shadow-none"
          >
            {routing.locales.map((code) => {
              const meta = LOCALE_NAMES[code];
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => choose(code)}
                  aria-current={code === locale ? "true" : undefined}
                  className="sheet-row"
                >
                  <span className="min-w-0">
                    <span lang={code} className="block font-semibold leading-snug">
                      {meta.name}
                    </span>
                    {/* Real site copy in that language, so the chooser shows
                        what the site will feel like rather than asserting a
                        name the visitor has to trust. */}
                    <span lang={code} className="form-note block leading-snug">
                      {meta.preview}
                    </span>
                  </span>
                  {code === locale ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-vermilion-deep">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </>
  );
}
