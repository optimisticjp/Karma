import { useLocale, useTranslations } from "next-intl";
import type { Course } from "@/content/courses";
import { pick, pickList } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";

/**
 * What you will make, who it is for, and what you will be able to do.
 *
 * Three answers that belong together and were three separate sections on the
 * page this replaces. They are the same question asked from three sides, and
 * splitting them across three full-width bands made a reader scroll past two
 * of them to find the one they cared about.
 *
 * **Outputs are objects, not adjectives.** "Bridal panels, dupattas, sherwani
 * borders" tells somebody whether this is their work; "gain confidence and
 * creativity" tells them nothing and is the kind of sentence this site does
 * not write.
 *
 * Nothing here is an outcome claim. No salary, no placement, no "students go
 * on to" — the list is what the TECHNIQUE produces, which is trade knowledge,
 * true wherever you learn it.
 */
export function CourseMake({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;
  const outputs = pickList(course.production, "outputs", locale);
  const outcomes = pickList(course, "outcomes", locale);

  return (
    <section className="band on-paper" id="make" aria-labelledby="make-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("outputsEyebrow")}</p>
          <h2 id="make-heading" className="t-h2 mt-1.5">
            {t("outputsTitle")}
          </h2>
          <p className="t-lede mt-3">{t("outputsSub")}</p>
        </header>

        <ol className="make-list" role="list">
          {outputs.map((o, i) => (
            <li key={o}>
              <span className="make-index t-micro numeric" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="t-h4">{o}</span>
            </li>
          ))}
        </ol>

        <div className="make-foot">
          <div className="min-w-0">
            <h3 className="t-h3">{t("whoTitle")}</h3>
            <p className="t-body mt-2 max-w-[52ch]">{pick(course, "who", locale)}</p>
          </div>
          <div className="min-w-0">
            <h3 className="t-h3">{t("skillsTitle")}</h3>
            <ul className="make-skills" role="list">
              {outcomes.map((o) => (
                <li key={o}>
                  <NeedlePoint state="done" />
                  <span className="t-body">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
