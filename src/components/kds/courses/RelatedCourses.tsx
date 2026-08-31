import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";
import { coursePhotoFor } from "@/content/photo-manifest";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { PhotoFrame } from "@/components/kds/Frame";
import { Icon } from "@/components/ui/Icon";

/**
 * Three others in the same family — the same tile the catalogue uses.
 *
 * Three, not eight. The machine family has eight courses, and an uncapped
 * related list put a second catalogue at the bottom of a page nobody scrolls
 * that far into. The link to `/courses` carries the rest.
 *
 * It reuses `.cat-item`, so a related tile and a catalogue tile cannot drift
 * apart in what they are allowed to claim: name, produces, family, and a
 * duration only where the owner confirmed one.
 */
export function RelatedCourses({ courses }: { courses: Course[] }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;

  if (courses.length === 0) return null;

  return (
    <section className="band on-cloth" aria-labelledby="related-heading">
      <div className="wrap">
        <header className="wall-head">
          <div className="max-w-prose">
            <p className="t-micro">{t("relatedEyebrow")}</p>
            <h2 id="related-heading" className="t-h2 mt-1.5">
              {t("relatedTitle")}
            </h2>
          </div>
          <Link href="/courses" className="act-quiet wall-more">
            {t("relatedAll")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </header>

        <ul className="cat-grid mt-7" role="list">
          {courses.map((course) => {
            const photo = coursePhotoFor(course.slug);
            const verified = verifiedOperationsFor(course.slug);
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
                  <span className="cat-name t-h4">{pick(course, "name", locale)}</span>
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
      </div>
    </section>
  );
}
