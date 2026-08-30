import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { sampleReviews } from "@/content/collections";
import { site, ownerProvidedFacts } from "@/lib/site";

/**
 * Reviews and the Google listing.
 *
 * Two rules shape this section, and both are about not overstating what we
 * have:
 *
 *  1. The 4.8 is owner-provided, so it is attributed to Google and linked to
 *     the listing where anyone can check it. It is **not** emitted as
 *     `AggregateRating`: we have no verified review count, and a fabricated
 *     rich result is a different order of problem from a labelled card.
 *  2. The three review cards are sample text written to exercise this layout.
 *     Each one carries a visible <SampleTag /> and `sample: true` in source.
 *
 * No Maps iframe. A ~600KB embed to prove an address is a bad trade on a
 * phone on mobile data, which is how this audience arrives; the rating, the
 * landmark and one tap to directions do the same job.
 */
export function Reviews() {
  const t = useTranslations("home.reviews");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section-compact">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="review-score mb-1 shrink-0"
          >
            <span className="review-score-value tabular">{ownerProvidedFacts.googleRating}</span>
            <span className="review-score-meta">
              <span className="review-stars" aria-hidden="true">★★★★★</span>
              <span className="block">{t("scoreSource")}</span>
            </span>
            <Icon name="arrow" size={16} className="arrow shrink-0" />
          </a>
        </div>

        <ul className="review-grid u-section-body">
          {sampleReviews.map((r, i) => (
            <Reveal as="li" key={r.nameEn} delay={i * 60} className="review-card">
              <p className="review-body">{gu ? r.bodyGu : r.bodyEn}</p>
              <p className="review-by">
                <span className="review-name">{gu ? r.nameGu : r.nameEn}</span>
                <span className="review-context">{gu ? r.contextGu : r.contextEn}</span>
              </p>
              {r.sample ? <SampleTag /> : null}
            </Reveal>
          ))}
        </ul>

        <p className="review-foot">{t("foot")}</p>
      </div>
    </section>
  );
}
