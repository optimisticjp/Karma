import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BatchTable } from "@/components/course/BatchTable";
import { CourseCard } from "@/components/course/CourseCard";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { FaqList } from "@/components/site/FaqList";
import { PageIntro } from "@/components/ui/PageIntro";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StickyActionBar } from "@/components/site/StickyActionBar";
import { JsonLd } from "@/components/site/JsonLd";
import { courseBySlug, coursesByFamily, coursesInFamily, families } from "@/content/courses";
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

  const [t, tc, l] = await Promise.all([
    getTranslations("courseDetail"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";
  const fam = families[course.family];
  const related = coursesInFamily(course.family).filter((c) => c.slug !== course.slug);
  const name = gu ? course.nameGu : course.nameEn;
  const position = coursesByFamily.findIndex((c) => c.slug === course.slug);

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

  const facts: Array<[string, string]> = [
    [
      t("durationLabel"),
      course.durationWeeks ? t("weeks", { count: course.durationWeeks }) : t("confirmDuration")
    ],
    [t("levelLabel"), t("levelValue")],
    [t("langLabel"), t("langValue")]
  ];

  return (
    <>
      <JsonLd data={courseLd} />
      <JsonLd data={crumbs} />

      <PageIntro
        eyebrow={gu ? fam.nameGu : fam.nameEn}
        title={name}
        lede={gu ? course.leadGu : course.leadEn}
        actions={
          <>
            <Link
              href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
              className="btn btn-primary"
            >
              {t("demoCta")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waCourse)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </a>
          </>
        }
        aside={
          <>
            <div className="mb-5 aspect-[3/2] overflow-hidden rounded border border-line">
              <TechniquePlate variant={course.family} seed={position} />
            </div>
            <dl className="ledger !border-t-0">
              {facts.map(([label, value]) => (
                <div key={label} className="ledger-row is-labelled">
                  <dt className="ledger-title !text-smallmeta">{label}</dt>
                  <dd className="ledger-note !mt-0 font-semibold !text-carbon">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        }
      />

      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h3 font-display">{t("whoTitle")}</h2>
            <span aria-hidden="true" className="rule-stitch" />
            <p className="prose-measure mt-5 text-stone">{gu ? course.whoGu : course.whoEn}</p>
          </div>
          <div>
            <h2 className="text-h3 font-display">{t("outcomesTitle")}</h2>
            <span aria-hidden="true" className="rule-stitch" />
            <ul className="mt-5 space-y-3">
              {(gu ? course.outcomesGu : course.outcomesEn).map((o) => (
                <li key={o} className="flex gap-3">
                  <Icon name="check" size={18} className="mt-1.5 shrink-0 text-success" strokeWidth={2} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-ivory-2">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading title={t("modulesTitle")} sub={t("modulesNote")} />
            <p className="pending-block mt-8 text-smallmeta text-stone">
              <span className="pending-label">{t("machinesTitle")}</span>
              {t("machinesBody")}
            </p>
          </div>
          <div className="u-section-body lg:mt-0">
            <ModuleAccordion modules={course.modules} />
          </div>
        </div>
      </section>

      <section className="section" id="batches">
        <div className="container-site">
          <SectionHeading title={t("batchesTitle")} sub={t("batchesSub")} />
          <div className="u-section-body">
            <BatchTable courseSlug={course.slug} limit={6} />
          </div>
        </div>
      </section>

      <section className="section border-t border-line bg-ivory-2">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading title={t("faqTitle")} />
            <div className="card mt-8 p-5 md:p-6">
              <p className="microlabel !text-vermilion-deep">{t("certTitle")}</p>
              <p className="mt-3 text-smallmeta text-stone">{t("certBody")}</p>
            </div>
          </div>
          <FaqList items={faqs.slice(0, 4)} />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="container-site">
            <SectionHeading title={t("relatedTitle")} />
            <div className="u-section-body grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {related.map((c) => (
                <CourseCard
                  key={c.slug}
                  course={c}
                  index={coursesByFamily.findIndex((x) => x.slug === c.slug)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <StickyActionBar waText={waCourse} courseSlug={course.slug} />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
