import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { courses, coursesByFamily, families } from "@/content/courses";
import { photosInGroup } from "@/content/photo-manifest";
import { trainers as proofTrainers } from "@/content/proof";
import { pick } from "@/lib/i18n/localized";
import { asLocale, routing } from "@/i18n/routing";
import { site, verifiedFacts } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { PageHead } from "@/components/kds/PageHead";
import { PhotoFrame } from "@/components/kds/Frame";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { SampleMark } from "@/components/kds/proof";
import { CtaBand } from "@/components/kds/CtaBand";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
 * THE STUDIO.
 *
 * The question this page really gets asked is: *is this a real floor with real
 * machines, or a computer classroom with a nice name?* So it answers with the
 * floor — the studio photographs at full width — and with facts that are
 * checkable against the catalogue and the studio's own hours.
 *
 * **The founding story and the meaning of the name are the owner's to tell**
 * and have not been collected (content checklist Q6/Q7). They are deliberately
 * absent rather than rendered as an "awaiting the owner" block on a live page.
 *
 * The trainer profiles are preview content and say so on each card. A labelled
 * placeholder that answers "what would I be told about a trainer" is more
 * useful than an empty section, and it is the shape the real profiles drop
 * straight into — with the photographs, not before.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, tp, rawLocale] = await Promise.all([
    getTranslations("aboutPage"),
    getTranslations("common"),
    getTranslations("proof.trainers"),
    getLocale()
  ]);
  const l = asLocale(rawLocale);

  /* Built as a list, not as fixed cells: the row takes its count from the
     number of VERIFIED facts, so an unverified one can never leave an empty
     box on the page. */
  const stats = [
    ...(verifiedFacts.studentsTrained500 ? [{ label: t("n1"), value: "500+" }] : []),
    { label: t("n2"), value: String(courses.length) },
    { label: t("n4"), value: String(Object.keys(families).length) },
    { label: t("n3"), value: "10:30" }
  ];

  const studio = photosInGroup("studio");

  return (
    <>
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("intro")}
        actions={
          <>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="act act-primary"
            >
              <Icon name="pin" size={17} /> {t("visitCta")}
            </a>
            <Link href="/admission" className="act act-secondary">
              {tc("bookDemo")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="t-micro">{t("whereLabel")}</p>
            <address className="when-address mt-2">
              <p>{pick(site, "address", l)}</p>
              <p className="font-bold">{pick(site, "landmark", l)}</p>
              <p className="t-meta">{pick(site, "hours", l)}</p>
            </address>
            <ThreadLine className="my-5" />
            <dl className="trust-stats !mt-0">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="t-h3 numeric leading-none">{stat.value}</dt>
                  <dd className="t-meta mt-1">{stat.label}</dd>
                </div>
              ))}
            </dl>
            <p className="t-meta mt-3">{t("numbersNote")}</p>
          </>
        }
      />

      {/* The floor, at full width. For somebody deciding whether a real place
          exists, one wide shot of the machines does more than any adjective —
          which is why these frames are large and not a strip of thumbnails. */}
      <section className="band on-canvas" aria-labelledby="place-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="place-heading" className="t-h2">
              {t("placeTitle")}
            </h2>
            <p className="t-lede mt-3">{t("placeBody")}</p>
          </header>

          <div className="place-lead">
            <figure>
              <PhotoFrame id="F1_STUDIO_FLOOR_WIDE" scale="lead" />
              <figcaption className="t-meta mt-2">{t("placeFloorCaption")}</figcaption>
            </figure>
          </div>

          <div className="wall-masonry mt-4">
            {studio.map((slot) => (
              <figure key={slot.id} className="wall-piece">
                <PhotoFrame id={slot.id} scale="thumb" register="machine" />
                <figcaption className="t-meta mt-2">{slot.label}</figcaption>
              </figure>
            ))}
          </div>

          <p className="t-meta mt-4">{t("placeNote")}</p>
        </div>
      </section>

      {/* Two sides of one floor. */}
      <section className="band on-paper" aria-labelledby="two-sides-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="two-sides-heading" className="t-h2">
              {t("twoSidesTitle")}
            </h2>
            <p className="t-lede mt-3">{t("twoSidesSub")}</p>
          </header>

          <div className="split split-even mt-7">
            <div className="fee-sheet">
              <p className="t-micro">{t("academyTitle")}</p>
              <p className="t-body mt-3">{t("academyBody")}</p>
              <p className="mt-4">
                <Link href="/courses" className="act-quiet">
                  {t("academyCta")} <Icon name="arrow" size={15} className="arrow" />
                </Link>
              </p>
            </div>
            <div className="fee-sheet">
              <p className="t-micro">{t("labTitle")}</p>
              <p className="t-body mt-3">{t("labBody")}</p>
              <p className="mt-4">
                <Link href="/services" className="act-quiet">
                  {t("labCta")} <Icon name="arrow" size={15} className="arrow" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The machines, named by the technique each one runs and by nothing
          else. No head count, no speed, no model number — none of those has
          been verified, and inventing one is the same lie as a stock
          photograph. */}
      <section className="band on-cloth" aria-labelledby="machines-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="machines-heading" className="t-h2">
              {t("machinesTitle")}
            </h2>
            <p className="t-lede mt-3">{t("machinesBody")}</p>
          </header>

          <ul className="capability-grid" role="list">
            {coursesByFamily.map((c) => (
              <li key={c.slug}>
                <StitchSwatch slug={c.slug} />
                <p className="t-h4 mt-2">{pick(c, "name", l)}</p>
                <p className="t-meta mt-1">{pick(c.production, "machine", l)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who teaches. Preview content, marked as such on every card, in the
          shape the real profiles drop into. */}
      <section className="band on-canvas" aria-labelledby="trainers-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <p className="t-micro">{tp("eyebrow")}</p>
            <h2 id="trainers-heading" className="t-h2 mt-1.5">
              {tp("h2")}
            </h2>
            <p className="t-lede mt-3">{tp("sub")}</p>
          </header>

          <ul className="cat-grid" role="list">
            {proofTrainers.map((tr) => (
              <li key={tr.id}>
                <article className="cat-item">
                  <span className="cat-media">
                    {tr.photoId ? (
                      <PhotoFrame id={tr.photoId} scale="thumb" />
                    ) : null}
                  </span>
                  <h3 className="cat-name t-h4">{tr.name}</h3>
                  <p className="cat-produces t-meta">{pick(tr, "role", l)}</p>
                  <p className="t-body mt-2">{pick(tr, "focus", l)}</p>
                  <SampleMark status={tr.status} className="mt-3" />
                </article>
              </li>
            ))}
          </ul>

          <p className="t-meta mt-6 max-w-prose">
            <NeedlePoint state="todo" /> {t("trainersNote")}
          </p>
        </div>
      </section>

      <CtaBand title={t("storyTitle")} sub={t("storySub")} ground="on-paper" />
    </>
  );
}
