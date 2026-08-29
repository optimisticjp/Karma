import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import type { Course } from "@/content/courses";
import { families } from "@/content/courses";
import { cn } from "@/lib/utils";

/**
 * Course card, outcome-first: family, title, the result-focused line, and the
 * two facts a visitor weighs (duration and level). `layout="horizontal"` gives
 * the editorial split used on the courses index at large sizes.
 *
 * The media panel is a drawn technique swatch rather than an empty photo
 * frame. Eight identical grey placeholders read as an unfinished site; eight
 * swatches read as a catalogue, and they tell the three families apart before
 * the visitor has read a word.
 */
export function CourseCard({
  course,
  index,
  layout = "vertical"
}: {
  course: Course;
  /** Position in the catalogue, shown as a quiet index. */
  index?: number;
  layout?: "vertical" | "horizontal";
}) {
  const locale = useLocale();
  const t = useTranslations("courseDetail");
  const fam = families[course.family];
  const gu = locale === "gu";
  const horizontal = layout === "horizontal";

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <article
        className={cn(
          "card card-lift flex h-full flex-col overflow-hidden",
          horizontal && "sm:flex-row"
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden border-line",
            horizontal
              ? "aspect-[16/9] border-b sm:aspect-auto sm:w-[38%] sm:border-b-0 sm:border-r"
              : "aspect-[3/2] border-b"
          )}
        >
          <TechniquePlate variant={course.family} seed={index ?? 0} className="card-img" />
          {index !== undefined ? (
            <span className="absolute left-3 top-3 rounded border border-line bg-card px-2 py-0.5 font-display text-xs font-semibold tabular text-vermilion-deep">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <p className="microlabel !text-vermilion-deep">{gu ? fam.nameGu : fam.nameEn}</p>
          <h3 className="text-h4 mt-1.5 flex items-baseline justify-between gap-3 font-display">
            <span className="card-title">{gu ? course.nameGu : course.nameEn}</span>
            <Icon name="arrow" size={18} className="arrow shrink-0 text-vermilion-deep" />
          </h3>
          <p className="mt-2 text-smallmeta text-stone">{gu ? course.leadGu : course.leadEn}</p>
          <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-5 text-smallmeta">
            <div className="flex gap-1.5">
              <dt className="text-stone">{t("durationLabel")}:</dt>
              <dd className="font-semibold">
                {course.durationWeeks
                  ? t("weeks", { count: course.durationWeeks })
                  : t("confirmDuration")}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-stone">{t("levelLabel")}:</dt>
              <dd className="font-semibold">{t("levelValue")}</dd>
            </div>
          </dl>
        </div>
      </article>
    </Link>
  );
}
