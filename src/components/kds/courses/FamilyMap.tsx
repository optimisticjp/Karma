import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { ThreadLine } from "@/components/kds/marks";

/** Family map for the same Console-filtered course list rendered above it. */
export function FamilyMap({ courses }: { courses: Course[] }) {
  const t = useTranslations("coursesPage");
  const locale = useLocale() as Locale;
  const keys = (Object.keys(families) as Array<keyof typeof families>).filter((key) =>
    courses.some((course) => course.family === key)
  );

  return (
    <section className="band on-cloth" aria-labelledby="families-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("familiesEyebrow")}</p>
          <h2 id="families-heading" className="t-h2 mt-1.5">
            {t("relate.h2")}
          </h2>
          <p className="t-lede mt-3">{t("relate.line")}</p>
        </header>

        <div className="fam-grid">
          {keys.map((key, i) => {
            const list = courses.filter((course) => course.family === key);
            return (
              <section key={key} className="fam-col" aria-labelledby={`fam-${key}`}>
                <p className="t-micro numeric">{String(i + 1).padStart(2, "0")}</p>
                <h3 id={`fam-${key}`} className="t-h3 mt-1">
                  {pick(families[key], "name", locale)}
                </h3>
                <ThreadLine tone="ink" className="my-3 w-12" />
                <p className="t-body">{pick(families[key], "intro", locale)}</p>
                <ul className="fam-list" role="list">
                  {list.map((course) => (
                    <li key={course.slug}>
                      <Link href={`/courses/${course.slug}`} className="link-thread">
                        {pick(course, "name", locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <ul className="fam-notes" role="list">
          {(t.raw("relate.points") as Array<{ t: string; d: string }>).map((point) => (
            <li key={point.t}>
              <p className="t-h4">{point.t}</p>
              <p className="t-meta mt-1.5">{point.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
