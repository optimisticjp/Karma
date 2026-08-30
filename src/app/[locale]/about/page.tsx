import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import { TrainerProfile } from "@/components/site/TrainerProfile";
import { Icon } from "@/components/ui/Icon";
import { courses, coursesByFamily, families } from "@/content/courses";
import { trainers } from "@/content/collections";
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
  const [t, tc, tp, l] = await Promise.all([
    getTranslations("aboutPage"),
    getTranslations("common"),
    getTranslations("proof.trainers"),
    getLocale()
  ]);
  const gu = l === "gu";

  /* Built as a list, not as fixed cells: the grid takes its column count from
     the number of verified facts, so an unverified one can never leave an
     empty box on the page. */
  const stats = [
    ...(verifiedFacts.studentsTrained500 ? [{ label: t("n1"), value: "500+" }] : []),
    { label: t("n2"), value: String(courses.length) },
    { label: t("n4"), value: String(Object.keys(families).length) },
    { label: t("n3"), value: "10:30" }
  ];

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

      {/* Who teaches. Every profile is still sample data and says so on its
          own card — but a labelled placeholder that answers "what would I be
          told about a trainer" is more useful than an empty section, and it
          is the shape the real profiles drop straight into.

          The founding story and the meaning of the name are still the owner's
          to give and are deliberately absent rather than rendered as
          "awaiting the owner" blocks on a live page. */}
      <section className="section">
        <div className="container-site">
          <SectionHeading eyebrow={tp("eyebrow")} title={tp("h2")} sub={tp("sub")} rule />
          <div className="trainer-grid u-section-body">
            {trainers.map((tr) => (
              <TrainerProfile key={tr.slug} trainer={tr} />
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-line bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("numbersTitle")} sub={t("numbersNote")} />
          <dl className="u-section-body spec-grid" style={{ "--spec-cols": stats.length } as React.CSSProperties}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="spec-label">{stat.label}</dt>
                <dd className="tabular mt-1 font-display text-h3">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
