import { useLocale, useTranslations } from "next-intl";
import type { Course } from "@/content/courses";
import type { CourseConfig } from "@/lib/course/config";
import { pick, pickList } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Console curriculum replaces the editorial fallback when staff has entered it. */
export function CourseSyllabus({ course, config }: { course: Course; config: CourseConfig }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;
  const curriculum = config.operations.curriculum;
  const count = curriculum.length > 0 ? curriculum.length : course.modules.length;

  return (
    <section className="band on-mist" id="syllabus" aria-labelledby="syllabus-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("syllabusEyebrow")}</p>
            <h2 id="syllabus-heading" className="t-h2 mt-1.5">{t("modulesTitle")}</h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("modulesNote")}</p>
            <p className="t-meta mt-4 numeric">{t("modulesCount", { count })}</p>
          </div>

          {curriculum.length > 0 ? (
            <ol className="data-list" role="list">
              {curriculum.map((line, index) => {
                const value = locale === "gu" ? line.gu : line.en;
                return (
                  <li key={`${index}-${value}`} className="data-row">
                    <span className="data-row__title">
                      <span className="t-micro numeric mr-3">{String(index + 1).padStart(2, "0")}</span>
                      {value}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="syllabus">
              {course.modules.map((module, index) => (
                <details key={pick(module, "title", locale)} className="module">
                  <summary className="module-summary">
                    <span className="t-micro numeric module-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="t-h4 min-w-0">{pick(module, "title", locale)}</span>
                    <Icon name="plus" size={17} className="module-plus" />
                  </summary>
                  <ul className="module-points" role="list">
                    {pickList(module, "points", locale).map((point) => (
                      <li key={point}>
                        <NeedlePoint state="done" />
                        <span className="t-body">{point}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
