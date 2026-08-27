import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BatchTable } from "@/components/course/BatchTable";
import { CourseCard } from "@/components/course/CourseCard";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { StickyActionBar } from "@/components/site/StickyActionBar";
import { JsonLd } from "@/components/site/JsonLd";
import { courseBySlug, courses, families } from "@/content/courses";
import { faqs } from "@/content/collections";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";

// Batch data is live -> per-request rendering.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};
  const gu = locale === "gu";
  return pageMeta({
    locale,
    path: `/courses/${slug}`,
    title: `${gu ? course.nameGu : course.nameEn} | Karma Design Studio`,
    description: gu ? course.leadGu : course.leadEn
  });
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const course = courseBySlug(slug);
  if (!course) notFound();

  const t = await getTranslations("courseDetail");
  const tc = await getTranslations("common");
  const l = await getLocale();
  const gu = l === "gu";
  const fam = families[course.family];
  const related = courses.filter((c) => c.family === course.family && c.slug !== course.slug);
  const name = gu ? course.nameGu : course.nameEn;

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/${l}` },
      { "@type": "ListItem", position: 2, name: gu ? "કોર્સિસ" : "Courses", item: `${site.url}/${l}/courses` },
      { "@type": "ListItem", position: 3, name, item: `${site.url}/${l}/courses/${course.slug}` }
    ]
  };

  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.nameEn,
    description: course.leadEn,
    inLanguage: ["gu", "en"],
    provider: {
      "@type": "Organization",
      name: "Karma Design Studio & Classes",
      sameAs: site.url
    }
  };

  const waCourse = `Hi Karma Design Studio! 👑 મને "${name}" કોર્સનો ફ્રી ડેમો બુક કરવો છે. નામ: ____ | ટાઇમ: સવાર/સાંજ`;

  return (
    <>
      <JsonLd data={courseLd} />
      <JsonLd data={crumbs} />

      <section className="section-compact">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">{gu ? fam.nameGu : fam.nameEn}</p>
            <h1 className="text-display mt-4">{name}</h1>
            <p className="u-lede">{gu ? course.leadGu : course.leadEn}</p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-smallmeta">
              <div>
                <dt className="font-bold text-stone">{t("durationLabel")}</dt>
                <dd className="font-semibold">
                  {course.durationWeeks
                    ? t("weeks", { count: course.durationWeeks })
                    : t("confirmDuration")}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone">{t("levelLabel")}</dt>
                <dd className="font-semibold">{t("levelValue")}</dd>
              </div>
              <div>
                <dt className="font-bold text-stone">{t("langLabel")}</dt>
                <dd className="font-semibold">{t("langValue")}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }} className="btn btn-primary">{t("demoCta")} <Icon name="arrow" size={18} className="arrow" /></Link>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waCourse)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {tc("whatsapp")}
              </a>
            </div>
          </div>
          <PhotoSlot label={course.photoLabel} ratio="4/5" className="lg:ml-auto lg:w-full lg:max-w-md" />
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-h3 font-display">{t("whoTitle")}</h2>
            <p className="prose-measure mt-4 text-stone">{gu ? course.whoGu : course.whoEn}</p>
          </div>
          <div>
            <h2 className="text-h3 font-display">{t("outcomesTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {(gu ? course.outcomesGu : course.outcomesEn).map((o) => (
                <li key={o} className="flex gap-3">
                  <Icon name="check" size={18} className="mt-1.5 text-success" strokeWidth={2} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("modulesTitle")} sub={t("modulesNote")} />
          <div className="u-section-body max-w-3xl">
            <ModuleAccordion modules={course.modules} />
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-h3 font-display">{t("machinesTitle")}</h2>
            <p className="prose-measure mt-4 text-stone">{t("machinesBody")}</p>
          </div>
          <PhotoSlot label={t("machinesPhoto")} ratio="16/9" />
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("batchesTitle")} />
          <div className="mt-8">
            <BatchTable courseSlug={course.slug} limit={6} />
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <h2 className="text-h3 font-display">{t("certTitle")}</h2>
          <p className="prose-measure mt-4 text-stone">{t("certBody")}</p>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site">
          <h2 className="text-h3 font-display">{t("faqTitle")}</h2>
          <div className="mt-6 max-w-3xl space-y-3">
            {faqs.slice(0, 3).map((f, i) => (
              <details key={i} className="card group p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{gu ? f.qGu : f.qEn}</span>
                  <Icon name="plus" size={18} className="text-vermilion-deep transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="border-t border-line px-5 pb-5 pt-4 text-stone">{gu ? f.aGu : f.aEn}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <>
          <StitchDivider />
          <section className="section-compact">
            <div className="container-site">
              <SectionHeading title={t("relatedTitle")} />
              <div className="u-section-body grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((c) => (
                  <CourseCard key={c.slug} course={c} />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      <StickyActionBar waText={waCourse} courseSlug={course.slug} />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
