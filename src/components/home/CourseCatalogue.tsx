import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerLink } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { coursesByFamily, families } from "@/content/courses";

/**
 * The machine floor catalogue: all eleven courses, one scannable ledger.
 *
 * Two shapes were tried. Eleven cards is the generic answer and gives a
 * visitor eleven decisions with no information to make them on. Three family
 * columns looked balanced in the abstract and is not: the split is 9 / 2 / 1,
 * so machine work ran nine rows deep beside two columns of white space, and
 * the section cost 2,200px to say what a list says in 700.
 *
 * So: one ledger, numbered, with the family carried in the right-hand column
 * where it groups without fragmenting. Eleven names read in one pass at
 * 320px, and the row itself is the link.
 *
 * Display order comes from `COURSE_DISPLAY_ORDER` via `coursesByFamily`.
 * Storage order in `src/content/courses.ts` is append-only and must not be
 * reordered to match: `VERIFIED_CATALOG_ROWS` derives `sortOrder` from array
 * position and the owner's import upserts with `onConflictDoNothing`.
 */
export function CourseCatalogue() {
  const t = useTranslations("home.catalogue");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section bg-ivory-2" id="catalogue">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />
          <p className="microlabel tabular mb-1 shrink-0">
            {t("count", { count: coursesByFamily.length })}
          </p>
        </div>

        <div className="catalogue u-section-body">
          <Ledger>
            {coursesByFamily.map((course, i) => (
              <LedgerLink
                key={course.slug}
                href={`/courses/${course.slug}`}
                index={String(i + 1).padStart(2, "0")}
                title={gu ? course.nameGu : course.nameEn}
                meta={gu ? families[course.family].nameGu : families[course.family].nameEn}
              />
            ))}
          </Ledger>
        </div>

        <p className="u-actions">
          <Link href="/courses" className="btn btn-secondary">
            {t("cta")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        </p>
      </div>
    </section>
  );
}
