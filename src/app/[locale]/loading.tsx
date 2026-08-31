"use client";

import { useTranslations } from "next-intl";
import { ThreadLine } from "@/components/kds/marks";

/**
 * Route transition state.
 *
 * Two things it must do and one it must not. It announces itself to a screen
 * reader, and it reserves roughly the shape of what is coming so the page does
 * not jump when content lands. What it must not do is hold the render back for
 * a decorative animation — the stitch rule here is a static mark, not something
 * the page waits on.
 *
 * It is a client component so it can be translated. It used to say "Loading…"
 * in English on a Gujarati route, which is a small thing that tells a visitor
 * the site is not really bilingual.
 */
export default function Loading() {
  const t = useTranslations("common");

  return (
    <div className="wrap band-tight" role="status" aria-live="polite">
      <p className="loading-note">
        <ThreadLine className="w-16" />
        <span className="t-micro">{t("loadingNote")}</span>
      </p>
      <div className="skeleton mt-3 h-7 w-2/3 max-w-md" />
      <div className="skeleton mt-2 h-4 w-full max-w-xl" />
      <div className="skeleton mt-1.5 h-4 w-5/6 max-w-lg" />
      {/* Rows on a phone, three cards from `md:`. This reserved 616px of
          three-card shape at every width — for /notes, /terms, /services and
          /privacy, which all land as hairline row lists. A skeleton whose
          shape is wrong guarantees the layout jump it exists to prevent,
          which is the one job stated in this file's own docstring. */}
      <div className="mt-6 grid gap-2 md:grid-cols-3 md:gap-5">
        <div className="skeleton h-12 md:h-40" />
        <div className="skeleton h-12 md:h-40" />
        <div className="skeleton h-12 md:h-40" />
        <div className="skeleton h-12 md:hidden" />
        <div className="skeleton h-12 md:hidden" />
      </div>
    </div>
  );
}
