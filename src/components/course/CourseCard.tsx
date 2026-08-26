import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Icon } from "@/components/ui/Icon";
import type { Course } from "@/content/courses";
import { families } from "@/content/courses";
import { cn } from "@/lib/utils";

/**
 * Course card, outcome-first (spec): project image, title, result-focused
 * line, level/duration/language meta, one action. `layout="horizontal"`
 * gives the editorial split used on the courses index at large sizes.
 */
export function CourseCard({
  course,
  layout = "vertical"
}: {
  course: Course;
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
          horizontal && "lg:flex-row"
        )}
      >
        <div className={cn(horizontal && "lg:w-2/5 lg:flex-none")}>
          <PhotoSlot
            label={course.photoLabel}
            ratio={horizontal ? "4/3" : "3/2"}
            className="card-img h-full rounded-none border-0"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <p className="microlabel !text-vermilion-deep">
            {gu ? fam.nameGu : fam.nameEn}
          </p>
          <h3 className="text-h4 mt-1.5 flex items-baseline justify-between gap-3 font-display">
            <span>{gu ? course.nameGu : course.nameEn}</span>
            <Icon name="arrow" size={18} className="arrow text-vermilion-deep" />
          </h3>
          <p className="mt-2 text-smallmeta text-stone">{gu ? course.leadGu : course.leadEn}</p>
          <p className="mt-auto pt-4 text-smallmeta font-semibold text-stone">
            {t("durationLabel")}:{" "}
            {course.durationWeeks ? t("weeks", { count: course.durationWeeks }) : t("confirmDuration")}
            <span className="mx-2 text-line">|</span>
            {t("levelValue")}
          </p>
        </div>
      </article>
    </Link>
  );
}
