import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, courseSchema } from "@/lib/schema";
import { getCourseConfig } from "@/lib/course/config";
import { getPublicCourseBySlug, getPublicCourses } from "@/lib/course/public";
import { JsonLd } from "@/components/site/JsonLd";
import { TrackView } from "@/components/site/TrackView";
import { CourseNav } from "@/components/kds/courses/CourseNav";
import { CourseHero } from "@/components/kds/courses/CourseHero";
import { CourseMake } from "@/components/kds/courses/CourseMake";
import { CourseFaults } from "@/components/kds/courses/CourseFaults";
import { CourseFloor } from "@/components/kds/courses/CourseFloor";
import { CourseFacts } from "@/components/kds/courses/CourseFacts";
import { CourseSyllabus } from "@/components/kds/courses/CourseSyllabus";
import { CourseBatches } from "@/components/kds/courses/CourseBatches";
import { RelatedCourses } from "@/components/kds/courses/RelatedCourses";
import { CtaBand } from "@/components/kds/CtaBand";
import { ActionDock } from "@/components/kds/shell/ActionDock";

/** Public course state is Console-backed, so every request resolves visibility
 * and current operational facts rather than baking them into a build. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) return {};
  const l = asLocale(locale);
  return pageMeta({
    locale,
    path: `/courses/${course.slug}`,
    title: `${pick(course, "name", l)} | Karma Design Studio`,
    description: `${pick(course.production, "produces", l)} ${
      l === "gu"
        ? "મોટા વરાછા, સુરતમાં મશીન પર શીખો."
        : "Taught on live machines in Mota Varachha, Surat."
    }`
  });
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  const [config, publicCourses, t, tcr, rawLocale] = await Promise.all([
    getCourseConfig(slug),
    getPublicCourses(),
    getTranslations("courseDetail"),
    getTranslations("crumbs"),
    getLocale()
  ]);
  if (!config) notFound();

  const l = asLocale(rawLocale);
  const name = pick(course, "name", l);
  const related = publicCourses
    .filter((candidate) => candidate.family === course.family && candidate.slug !== course.slug)
    .slice(0, 3);

  const crumbs = breadcrumbSchema(
    l,
    [
      [t("breadcrumbCourses"), "/courses"],
      [name, `/courses/${course.slug}`]
    ],
    tcr("home")
  );
  const courseLd = courseSchema(course, l);

  return (
    <>
      <JsonLd data={courseLd} />
      <JsonLd data={crumbs} />
      <TrackView event="course_view" props={{ course: course.slug }} />

      <CourseHero course={course} config={config} />
      <CourseNav hasFaults={course.production.problemsEn.length > 0} />
      <CourseFacts course={course} config={config} />
      <CourseMake course={course} />
      <CourseFaults course={course} />
      <CourseFloor course={course} config={config} />
      <CourseSyllabus course={course} config={config} />
      <CourseBatches course={course} />
      <RelatedCourses courses={related} />
      <CtaBand
        title={t("closeH2")}
        sub={t("closeSub", { course: name })}
        demoHref={`/admission?course=${course.slug}&src=course`}
      />
      <ActionDock surface="course" demoHref={`/admission?course=${course.slug}`} />
    </>
  );
}
