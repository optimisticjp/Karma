import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import { Icon } from "@/components/ui/Icon";
import { courses, coursesByFamily, families } from "@/content/courses";
import { site, verifiedFacts } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return pageMeta({ locale, path: "/about", title: t("title"), description: t("description") });
}

/**
 * About.
 *
 * The founding story is the owner's to tell and has not been collected yet
 * (content checklist Q6/Q7), so it stays a marked placeholder — but the page
 * no longer *consists* of placeholders. Everything else here is verifiable
 * from the studio's own catalogue and hours, which is enough to answer the
 * question this page really gets asked: is this a real floor with real
 * machines, or a computer classroom with a nice name.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, l] = await Promise.all([
    getTranslations("aboutPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("intro")}
        actions={
          <>
            <Link href="/courses" className="btn btn-primary">
              {tc("exploreCourses")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              {t("visitCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("whereLabel")}</p>
            <p className="mt-3">{gu ? site.addressGu : site.addressEn}</p>
            <p className="mt-3">
              <strong>{gu ? site.hoursGu : site.hoursEn}</strong>
            </p>
          </>
        }
      />

      {/* The two halves of the business, stated plainly. This is the thing
          that actually distinguishes Karma from a coaching class. */}
      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("twoSidesTitle")} sub={t("twoSidesSub")} />
          <div className="u-section-body grid gap-6 lg:grid-cols-2 lg:gap-8">
            <article className="card p-6 md:p-8">
              <Icon name="hoop" size={28} className="text-vermilion-deep" />
              <h3 className="text-h3 mt-5 font-display">{t("academyTitle")}</h3>
              <p className="u-lede">{t("academyBody")}</p>
              <p className="u-actions">
                <Link
                  href="/courses"
                  className="stitch-link inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
                >
                  {t("academyCta")} <Icon name="arrow" size={16} className="arrow" />
                </Link>
              </p>
            </article>
            <article className="card p-6 md:p-8">
              <Icon name="spool" size={28} className="text-vermilion-deep" />
              <h3 className="text-h3 mt-5 font-display">{t("labTitle")}</h3>
              <p className="u-lede">{t("labBody")}</p>
              <p className="u-actions">
                <Link
                  href="/services"
                  className="stitch-link inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
                >
                  {t("labCta")} <Icon name="arrow" size={16} className="arrow" />
                </Link>
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* The machine wall: every technique on the floor, named. Swatches, not
          stand-in photographs — the real wall gets photographed later. */}
      <section className="section bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("machinesTitle")} sub={t("machinesBody")} />
          <ul className="u-section-body spec-grid">
            {coursesByFamily.map((c, i) => (
              <li key={c.slug}>
                <div className="mb-3 aspect-[3/2] overflow-hidden rounded border border-line">
                  <TechniquePlate variant={c.family} seed={i} />
                </div>
                <span className="spec-label">
                  {gu ? families[c.family].nameGu : families[c.family].nameEn}
                </span>
                <Link
                  href={`/courses/${c.slug}`}
                  className="stitch-link spec-value mt-1 !inline-flex min-h-8 items-center"
                >
                  {gu ? c.nameGu : c.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading title={t("storyTitle")} sub={t("storySub")} />
          <div className="space-y-6">
            <div className="pending-block">
              <span className="pending-label">{t("pendingLabel")}</span>
              <p className="text-stone">{t("storyBody")}</p>
            </div>
            <div className="pending-block">
              <span className="pending-label">{t("pendingLabel")}</span>
              <p className="font-semibold">{t("karmaTitle")}</p>
              <p className="mt-2 text-stone">{t("karmaBody")}</p>
            </div>
            <div className="pending-block">
              <span className="pending-label">{t("pendingLabel")}</span>
              <p className="font-semibold">{t("trainersTitle")}</p>
              <p className="mt-2 text-stone">{t("trainersNote")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-t border-line bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("numbersTitle")} sub={t("numbersNote")} />
          <dl className="u-section-body spec-grid">
            {verifiedFacts.studentsTrained500 ? (
              <div>
                <dt className="spec-label">{t("n1")}</dt>
                <dd className="tabular mt-1 font-display text-h3">500+</dd>
              </div>
            ) : null}
            <div>
              <dt className="spec-label">{t("n2")}</dt>
              <dd className="tabular mt-1 font-display text-h3">{courses.length}</dd>
            </div>
            <div>
              <dt className="spec-label">{t("n4")}</dt>
              <dd className="tabular mt-1 font-display text-h3">
                {Object.keys(families).length}
              </dd>
            </div>
            <div>
              <dt className="spec-label">{t("n3")}</dt>
              <dd className="tabular mt-1 font-display text-h3">10:30</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
