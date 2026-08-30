import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MachineIndex } from "@/components/courses/MachineIndex";
import { Icon } from "@/components/ui/Icon";
import { MonoNote } from "@/components/ui/MonoNote";
import { coursesByFamily } from "@/content/courses";

/**
 * The course decision, on the homepage: all eleven, in one index.
 *
 * All eleven, not a curated six. A visitor deciding between zardosi and
 * sequence work is not helped by a "featured courses" edit — they are helped
 * by seeing the whole floor and what each technique physically produces. The
 * index scans in one pass and scales past eleven without a redesign, which is
 * why it is not a card wall.
 *
 * Display order comes from `COURSE_DISPLAY_ORDER` via `coursesByFamily`.
 * Storage order in `src/content/courses.ts` is append-only and must not be
 * reordered to match: `VERIFIED_CATALOG_ROWS` derives `sortOrder` from array
 * position and the owner's import upserts with `onConflictDoNothing`.
 */
export function CourseCatalogue() {
  const t = useTranslations("home.catalogue");
  const locale = useLocale();

  return (
    <section className="section band-material" id="catalogue">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />
          <MonoNote className="mb-1 shrink-0">
            {t("count", { count: coursesByFamily.length })}
          </MonoNote>
        </div>

        <div className="u-section-body">
          <MachineIndex courses={coursesByFamily} locale={locale} />
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
