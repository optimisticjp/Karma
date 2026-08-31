import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { courseBySlug, coursesByFamily, coursesInFamily } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import { asLocale, routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, courseSchema } from "@/lib/schema";
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

/* Batches are database-backed. Keep the page request-time until the planned
   incremental-cache work is activated. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    coursesByFamily.map((course) => ({ locale, slug: course.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};
  const l = asLocale(locale);
  return pageMeta({
    locale,
    path: `/courses/${course.slug}`,
    title: `${pick(course, "name", l)} | Karma Design Studio`,
    /* What the technique produces, plus where it is taught. People search for
       the work and the city together — "zardosi class Surat" — so the snippet
       carries both, and every course's is different because every `produces`
       line is different. */
    description: `${pick(course.production, "produces", l)} ${
      l === "gu"
        ? "મોટા વરાછા, સુરતમાં મશીન પર શીખો."
        : "Taught on live machines in Mota Varachha, Surat."
    }`
  });
}

/**
 * A COURSE.
 *
 * Nine blocks, in the order the decision is actually made:
 *
 *  1  Hero       what this produces, and the facts that are confirmed
 *  2  Facts      the money, the timings, the certificate  ← second, on purpose
 *  3  Make       what you will make, who it is for, what you will be able to do
 *  4  Faults     the problems it teaches you to solve  ← the convincing one
 *  5  Floor      the machine, the software, what a session is like
 *  6  Syllabus   the modules, closed by default
 *  7  Batches    when it runs, and what the studio has written about it
 *  8  Related    three others in the same family
 *  9  Close      the one action
 *
 * The template it replaces ran fifteen sections and split the same question
 * across three of them — who it is for, what you will be able to do and what
 * you will make were three full-width bands.
 *
 * **The money is second because that is the question people arrive with.**
 * The compact-density pass measured it: on EMCAD DAHAO — the one course with a
 * confirmed duration and a published fee — those figures used to sit about
 * 3,900px down, roughly 4.6 phone screens past the intro, the drawn signature
 * and a two-column essay. On the other ten the block says plainly that there
 * is no published fee, which is a better answer than an absence.
 *
 * WHAT THIS PAGE MAY NOT DO
 * -------------------------
 * Publish a duration or a fee for a course whose figures the owner has not
 * confirmed; invent a machine specification; name a trainer who has not been
 * confirmed; or offer any way to pay online. Each of those is asserted by
 * `tests/kds-courses.test.ts` rather than left to a reviewer.
 */
export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = courseBySlug(slug);
  if (!course) notFound();

  const [t, rawLocale] = await Promise.all([getTranslations("courseDetail"), getLocale()]);
  const l = asLocale(rawLocale);
  const name = pick(course, "name", l);

  /* Three, not eight: an uncapped related list is a second catalogue at the
     bottom of a page nobody scrolls that far into. */
  const related = coursesInFamily(course.family)
    .filter((c) => c.slug !== course.slug)
    .slice(0, 3);

  const crumbs = breadcrumbSchema(l, [
    [t("breadcrumbCourses"), "/courses"],
    [name, `/courses/${course.slug}`]
  ]);

  /* No offers, no price, no rating — see `src/lib/schema.ts`. `timeRequired`
     appears only where the owner has confirmed a duration in writing. */
  const courseLd = courseSchema(course, l);

  return (
    <>
      <JsonLd data={courseLd} />
      <JsonLd data={crumbs} />
      <TrackView event="course_view" props={{ course: course.slug }} />

      <CourseHero course={course} />
      <CourseNav hasFaults={course.production.problemsEn.length > 0} />
      <CourseFacts course={course} />
      <CourseMake course={course} />
      <CourseFaults course={course} />
      <CourseFloor course={course} />
      <CourseSyllabus course={course} />
      <CourseBatches course={course} />
      <RelatedCourses courses={related} />
      <CtaBand
        title={t("closeH2")}
        sub={t("closeSub", { course: name })}
        demoHref={`/admission?course=${course.slug}&src=course`}
      />

      {/* A course page is the highest-intent route on the site, and the demo
          action carries the course the visitor is reading about rather than
          dropping them on an empty form. */}
      <ActionDock surface="course" demoHref={`/admission?course=${course.slug}`} />
    </>
  );
}
