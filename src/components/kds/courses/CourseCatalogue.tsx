"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { coursesByFamily, families, type Course } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";
import { coursePhotoFor } from "@/content/photo-manifest";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { PhotoFrame } from "@/components/kds/Frame";
import { Icon } from "@/components/ui/Icon";

/**
 * THE CATALOGUE — eleven techniques, as a product catalogue.
 *
 * WHY THIS ONE IS A GRID WHEN THE HOMEPAGE IS A RAIL
 * -------------------------------------------------
 * They are different jobs. The homepage sample book is a teaser you flick
 * through with a thumb; this is the page somebody arrives on having decided to
 * compare. Comparison wants everything visible at once, at the same size, on
 * the same axes — which is exactly what a grid is for and what a rail is not.
 *
 * Two columns on a phone rather than one. Eleven full-width rows is 4,000px of
 * scrolling to see a list that fits in six; and two columns keeps the media
 * large enough to actually distinguish zardosi from sequence work, which is
 * the whole basis on which this choice gets made.
 *
 * SAME BOX WHETHER THERE IS A PHOTOGRAPH OR NOT
 * ---------------------------------------------
 * The shoot covers eight of the eleven. The other three lead with their stitch
 * swatch **in the same 4:3 box at the same size**, so they never read as the
 * leftovers, and when the eight photographs land nothing in this layout moves.
 * They are never given a borrowed photograph — see `docs/content-checklist.md`.
 *
 * WHAT A TILE MAY CLAIM
 * ---------------------
 * The name, what the technique physically produces (trade knowledge, true
 * wherever you learn it), its family, and a duration **only** where the owner
 * has confirmed one — today EMCAD DAHAO and nothing else. No fee, no invented
 * "beginner/advanced" label, no "popular" or "recommended".
 */

type FamilyKey = keyof typeof families;

export function CourseCatalogue({
  /** Facts the owner confirmed, keyed by slug — never a difficulty rating. */
  cues
}: {
  cues?: Record<string, "foundation" | "leads">;
}) {
  const t = useTranslations("coursesPage");
  const locale = useLocale() as Locale;
  const [family, setFamily] = useState<FamilyKey | "all">("all");

  const shown: Course[] =
    family === "all" ? coursesByFamily : coursesByFamily.filter((c) => c.family === family);

  const tabs: Array<{ key: FamilyKey | "all"; label: string; count: number }> = [
    { key: "all", label: t("filterAll"), count: coursesByFamily.length },
    ...(Object.keys(families) as FamilyKey[]).map((k) => ({
      key: k,
      label: pick(families[k], "name", locale),
      count: coursesByFamily.filter((c) => c.family === k).length
    }))
  ];

  return (
    <section className="band on-canvas" aria-labelledby="catalogue-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("catalogueEyebrow")}</p>
          <h2 id="catalogue-heading" className="t-h2 mt-1.5">
            {t("catalogueH2")}
          </h2>
          <p className="t-lede mt-3">{t("catalogueSub")}</p>
        </header>

        {/* A filter, not a tablist: it narrows a list already on the page and
            moves focus nowhere, so the roles are a group of toggle buttons. */}
        <div className="book-tabs" role="group" aria-label={t("filterLabel")}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={family === tab.key}
              onClick={() => setFamily(tab.key)}
              className={cn("chip", family === tab.key && "is-on")}
            >
              {tab.label}
              <span className="t-micro numeric opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <ul className="cat-grid" role="list">
          {shown.map((course) => {
            const photo = coursePhotoFor(course.slug);
            const verified = verifiedOperationsFor(course.slug);
            const cue = cues?.[course.slug];

            return (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`} className="cat-item">
                  <span className="cat-media">
                    {photo ? (
                      <PhotoFrame id={photo.id} scale="thumb" />
                    ) : (
                      <StitchSwatch slug={course.slug} />
                    )}
                  </span>

                  <span className="cat-name t-h4">
                    {pick(course, "name", locale)}
                    {cue ? (
                      <span className="cat-cue">{t(`cue.${cue}` as "cue.foundation")}</span>
                    ) : null}
                  </span>

                  <span className="cat-produces t-meta">
                    {pick(course.production, "produces", locale)}
                  </span>

                  <span className="cat-meta t-micro">
                    <span>{pick(families[course.family], "name", locale)}</span>
                    {verified?.durationMonths ? (
                      <span className="numeric">
                        {t("months", { count: verified.durationMonths })}
                      </span>
                    ) : null}
                    <Icon name="arrow" size={15} className="cat-arrow arrow" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Says out loud what the filter is doing, for a reader who cannot see
            the grid change. `aria-live` rather than a visible count, because
            the chips already carry the numbers. */}
        <p className="sr-only" aria-live="polite">
          {t("showingCount", { count: shown.length })}
        </p>
      </div>
    </section>
  );
}
