"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { coursesByFamily, families, type Course } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { cn } from "@/lib/utils";

/**
 * THE SAMPLE BOOK — the course explorer, as a book of physical samples.
 *
 * WHY NOT ELEVEN CARDS
 * --------------------
 * The full catalogue belongs on `/courses`. Eleven cards on a homepage is
 * eleven decisions with nothing to decide on, and on a phone it is 1,476px of
 * the same shape.
 *
 * A visitor choosing between zardosi and sequence work is choosing a
 * MATERIAL, so the homepage explorer is a rail of cut swatches you flick
 * through — the way a hand goes through a sample book — with the family as the
 * filter. Real taxonomy, from `src/content/courses.ts`: machine, modern,
 * software. Nothing invented, no "popular", no "recommended".
 *
 * WHAT A ROW MAY CLAIM
 * --------------------
 * The name, the family, and what the technique physically produces — which is
 * trade knowledge, true wherever you learn it. A duration appears only where
 * the studio has confirmed one, which today is EMCAD DAHAO and nothing else.
 * No fee: fees are discussed offline and the one verified fee plan has its own
 * panel further down.
 *
 * NO JAVASCRIPT, NO PROBLEM
 * -------------------------
 * "All" is the default tab and shows every course, so a visitor without
 * scripting sees the whole catalogue rather than an empty rail. The filter is
 * an enhancement on top.
 */

type FamilyKey = keyof typeof families;

export function SampleBook() {
  const t = useTranslations("home.book");
  const locale = useLocale() as Locale;
  const [family, setFamily] = useState<FamilyKey | "all">("all");

  const shown: Course[] =
    family === "all" ? coursesByFamily : coursesByFamily.filter((c) => c.family === family);

  const tabs: Array<{ key: FamilyKey | "all"; label: string; count: number }> = [
    { key: "all", label: t("all"), count: coursesByFamily.length },
    ...(Object.keys(families) as FamilyKey[]).map((k) => ({
      key: k,
      label: pick(families[k], "name", locale),
      count: coursesByFamily.filter((c) => c.family === k).length
    }))
  ];

  return (
    <section className="band on-canvas" aria-labelledby="book-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("eyebrow")}</p>
          <h2 id="book-heading" className="t-h2 mt-1.5">
            {t("h2")}
          </h2>
          <p className="t-lede mt-3">{t("sub")}</p>
        </header>

        <div className="book-tabs" role="tablist" aria-label={t("filterLabel")}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={family === tab.key}
              onClick={() => setFamily(tab.key)}
              className={cn("chip", family === tab.key && "is-on")}
            >
              {tab.label}
              <span className="t-micro numeric opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <ul className="strip book-strip" role="list">
          {shown.map((course) => {
            const verified = verifiedOperationsFor(course.slug);
            return (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`} className="sample">
                  <StitchSwatch slug={course.slug} />
                  <span className="sample-name t-h4">{pick(course, "name", locale)}</span>
                  <span className="sample-produces t-meta">
                    {pick(course.production, "produces", locale)}
                  </span>
                  <span className="sample-meta t-micro">
                    {pick(families[course.family], "name", locale)}
                    {verified?.durationMonths ? (
                      <>
                        {" · "}
                        {t("months", { count: verified.durationMonths })}
                      </>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6">
          <Link href="/courses" className="act act-secondary">
            {t("cta", { count: coursesByFamily.length })}
          </Link>
        </p>
      </div>
    </section>
  );
}
