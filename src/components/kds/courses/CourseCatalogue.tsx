"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { coursePhotoFor } from "@/content/photo-manifest";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { PhotoFrame } from "@/components/kds/Frame";
import { Icon } from "@/components/ui/Icon";

type FamilyKey = keyof typeof families;

/** The public catalogue is handed in by the server after Console visibility,
 * active/archive state and order have been applied. */
export function CourseCatalogue({
  courses,
  cues
}: {
  courses: Course[];
  cues?: Record<string, "foundation" | "leads">;
}) {
  const t = useTranslations("coursesPage");
  const locale = useLocale() as Locale;
  const [family, setFamily] = useState<FamilyKey | "all">("all");

  const shown = family === "all" ? courses : courses.filter((c) => c.family === family);
  const familyKeys = (Object.keys(families) as FamilyKey[]).filter((key) =>
    courses.some((course) => course.family === key)
  );

  const tabs: Array<{ key: FamilyKey | "all"; label: string; count: number }> = [
    { key: "all", label: t("filterAll"), count: courses.length },
    ...familyKeys.map((key) => ({
      key,
      label: pick(families[key], "name", locale),
      count: courses.filter((c) => c.family === key).length
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
            const cue = cues?.[course.slug];

            return (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`} className="cat-item">
                  <span className="cat-media">
                    {photo ? <PhotoFrame id={photo.id} scale="thumb" /> : <StitchSwatch slug={course.slug} />}
                  </span>

                  <span className="cat-name t-h4">
                    {pick(course, "name", locale)}
                    {cue ? <span className="cat-cue">{t(`cue.${cue}` as "cue.foundation")}</span> : null}
                  </span>

                  <span className="cat-produces t-meta">{pick(course.production, "produces", locale)}</span>

                  <span className="cat-meta t-micro">
                    <span>{pick(families[course.family], "name", locale)}</span>
                    {course.durationMonths ? (
                      <span className="numeric">{t("months", { count: course.durationMonths })}</span>
                    ) : null}
                    <Icon name="arrow" size={15} className="cat-arrow arrow" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="sr-only" aria-live="polite">
          {t("showingCount", { count: shown.length })}
        </p>
      </div>
    </section>
  );
}
