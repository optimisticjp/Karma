import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { EMCAD_DAHAO, KARMA_SOFTWARE } from "@/content/course-operations";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Opening counts and swatches are derived from the same Console-filtered list
 * as the catalogue, so hiding a course cannot leave a contradictory count. */
export function CoursesIntro({ courses }: { courses: Course[] }) {
  const t = useTranslations("coursesPage");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const demo = EMCAD_DAHAO.operations.demo;

  const facts = [
    t("factMachine"),
    t("factLanguages"),
    t("factCertificate"),
    t("factDemo", { days: demo?.days ?? 2 })
  ];
  const familyKeys = (Object.keys(families) as Array<keyof typeof families>).filter((key) =>
    courses.some((course) => course.family === key)
  );
  const preferredSwatches = [
    "zardosi-machine-embroidery",
    "sequence-work",
    "laser-work",
    "emcad-embroidery-design"
  ];
  const visibleSlugs = new Set(courses.map((course) => course.slug));
  const swatches = preferredSwatches.filter((slug) => visibleSlugs.has(slug));

  return (
    <section className="band-hero on-paper" aria-labelledby="courses-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 id="courses-heading" className="t-h1 mt-3">{t("title")}</h1>
            <p className="t-lede mt-4 max-w-[48ch]">{t("intro")}</p>

            <ThreadLine draw className="my-6 w-28" />

            <dl className="courses-split">
              {familyKeys.map((key) => (
                <div key={key}>
                  <dt className="t-h3 numeric leading-none">
                    {courses.filter((course) => course.family === key).length}
                  </dt>
                  <dd className="t-meta mt-1">{pick(families[key], "name", locale)}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <Link href="/batches" className="act act-secondary">{t("batchesCta")}</Link>
            </div>
          </div>

          <aside className="courses-aside">
            <p className="t-micro">{t("factsTitle")}</p>
            <ul className="courses-facts" role="list">
              {facts.map((fact) => (
                <li key={fact}>
                  <NeedlePoint state="done" />
                  <span className="t-body">{fact}</span>
                </li>
              ))}
            </ul>

            {swatches.length > 0 ? (
              <ul className="courses-swatches" role="list">
                {swatches.map((slug) => (
                  <li key={slug}><StitchSwatch slug={slug} /></li>
                ))}
              </ul>
            ) : null}
            <p className="t-meta mt-3">{t("softwareNote", { software: KARMA_SOFTWARE })}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
