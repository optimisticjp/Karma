"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { cn } from "@/lib/utils";

type FamilyKey = keyof typeof families;

/** Homepage explorer for the same Console-filtered course list as /courses. */
export function SampleBook({ courses }: { courses: Course[] }) {
  const t = useTranslations("home.book");
  const locale = useLocale() as Locale;
  const [family, setFamily] = useState<FamilyKey | "all">("all");

  const shown = family === "all" ? courses : courses.filter((course) => course.family === family);
  const familyKeys = (Object.keys(families) as FamilyKey[]).filter((key) =>
    courses.some((course) => course.family === key)
  );
  const tabs: Array<{ key: FamilyKey | "all"; label: string; count: number }> = [
    { key: "all", label: t("all"), count: courses.length },
    ...familyKeys.map((key) => ({
      key,
      label: pick(families[key], "name", locale),
      count: courses.filter((course) => course.family === key).length
    }))
  ];
  const sub = locale === "gu"
    ? `${courses.length} કોર્સ ત્રણ familiesમાં. જે material અને machine work તમે શીખવા માંગો છો એ પ્રમાણે પસંદ કરો, પછી course ખોલો.`
    : `${courses.length} courses across three families. Pick by the material and machine work you want to learn, then open the course that fits.`;

  return (
    <section className="band on-canvas" aria-labelledby="book-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("eyebrow")}</p>
          <h2 id="book-heading" className="t-h2 mt-1.5">{t("h2")}</h2>
          <p className="t-lede mt-3">{sub}</p>
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

        <ul className="strip book-strip" role="list">
          {shown.map((course) => (
            <li key={course.slug}>
              <Link href={`/courses/${course.slug}`} className="sample">
                <StitchSwatch slug={course.slug} />
                <span className="sample-name t-h4">{pick(course, "name", locale)}</span>
                <span className="sample-produces t-meta">{pick(course.production, "produces", locale)}</span>
                <span className="sample-meta t-micro">
                  {pick(families[course.family], "name", locale)}
                  {course.durationMonths ? (
                    <>{" · "}{t("months", { count: course.durationMonths })}</>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6">
          <Link href="/courses" className="act act-secondary">{t("cta", { count: courses.length })}</Link>
        </p>
      </div>
    </section>
  );
}
