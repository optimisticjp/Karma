import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/content/courses";
import { pickList } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { Icon } from "@/components/ui/Icon";

/**
 * The faults this course teaches you to solve — as a diagnostic list.
 *
 * WHY THIS SECTION EXISTS AT ALL
 * ------------------------------
 * Half the people reading a course page in Surat already run a machine. They
 * are not shopping for "an embroidery course"; they have a specific fault they
 * cannot fix, and they are trying to work out whether this place knows what it
 * is. Naming the faults is the most convincing thing on the page, and no
 * institute that has not actually run production can write this list.
 *
 * It sits on the **cool register** because it is diagnostic work — the same
 * ground as the screen and the file, and a deliberate change of surface from
 * the warm one above it.
 *
 * Each row is a fault, numbered like a notebook entry. No causes here: the
 * cause is what the course teaches, and printing it would be answering the
 * question the demo is for. The Machine Notes archive carries the ones the
 * studio has published in full, and the link goes both ways.
 */
export function CourseFaults({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;
  const problems = pickList(course.production, "problems", locale);

  if (problems.length === 0) return null;

  return (
    <section className="band on-mist" id="faults" aria-labelledby="faults-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("problemsEyebrow")}</p>
            <h2 id="faults-heading" className="t-h2 mt-1.5">
              {t("problemsTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("problemsSub")}</p>
            <p className="mt-5">
              <Link href="/notes" className="act act-secondary">
                {t("faultsNotesCta")} <Icon name="arrow" size={16} className="arrow" />
              </Link>
            </p>
          </div>

          <ol className="faults" role="list">
            {problems.map((row, i) => (
              <li key={row} className="fault-row">
                <span className="fault-index t-micro numeric" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="t-body">{row}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
