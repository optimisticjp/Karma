import { useLocale, useTranslations } from "next-intl";
import type { Course } from "@/content/courses";
import { pick, pickList } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The syllabus, for the people who came looking for it.
 *
 * Native `<details>`: accessible, findable by the browser's own search,
 * operable with no JavaScript, and costing nothing until it is opened.
 *
 * **Nothing is open by default.** The first module used to be, which on a
 * phone put five syllabus points between the reader and the rest of the
 * syllabus — an accordion paying for itself in reverse. A closed list of
 * module titles is the scannable thing; opening one is the reader's decision.
 *
 * A module index is shown because a syllabus has an order and the order is
 * part of the information: you do not learn correction before you learn
 * underlay.
 */
export function CourseSyllabus({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;

  return (
    <section className="band on-mist" id="syllabus" aria-labelledby="syllabus-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("syllabusEyebrow")}</p>
            <h2 id="syllabus-heading" className="t-h2 mt-1.5">
              {t("modulesTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("modulesNote")}</p>
            <p className="t-meta mt-4 numeric">
              {t("modulesCount", { count: course.modules.length })}
            </p>
          </div>

          <div className="syllabus">
            {course.modules.map((m, i) => (
              <details key={pick(m, "title", locale)} className="module">
                <summary className="module-summary">
                  <span className="t-micro numeric module-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="t-h4 min-w-0">{pick(m, "title", locale)}</span>
                  <Icon name="plus" size={17} className="module-plus" />
                </summary>
                <ul className="module-points" role="list">
                  {pickList(m, "points", locale).map((point) => (
                    <li key={point}>
                      <NeedlePoint state="done" />
                      <span className="t-body">{point}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
