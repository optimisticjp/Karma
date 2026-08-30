"use client";

import { useTranslations } from "next-intl";
import { StitchRule } from "@/components/ui/StitchPath";

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
    <div className="container-site section-compact" role="status" aria-live="polite">
      <p className="loading-note">
        <StitchRule tone="vermilion" className="loading-stitch" />
        <span>{t("loadingNote")}</span>
      </p>
      <div className="skeleton mt-6 h-10 w-2/3 max-w-md" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl" />
      <div className="skeleton mt-2 h-5 w-5/6 max-w-lg" />
      <div className="u-section-body grid gap-5 md:grid-cols-3">
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
      </div>
    </div>
  );
}
