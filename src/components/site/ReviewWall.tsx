import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { sampleReviews } from "@/content/collections";
import { site, ownerProvidedFacts } from "@/lib/site";

/**
 * The review wall.
 *
 * A wall, not a slider: a carousel hides seven of eight reviews behind an
 * interaction, costs JS, and on a phone competes with the page's own scroll.
 * Eight short reviews in a masonry-ish column set read in one pass and need
 * nothing to work.
 *
 * Two constraints, both about not overstating what we have:
 *
 *  1. Every card is sample text, carries `sample: true` in source, and renders
 *     a visible <SampleTag />.
 *  2. **Nothing here is emitted as `Review` or `AggregateRating`.** The 4.8 is
 *     owner-provided and links to the Google listing where it can be checked;
 *     a fabricated rich result is a different order of problem from a card
 *     that says what it is.
 */
export function ReviewWall() {
  const t = useTranslations("proof.reviews");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section">
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

        <ul className="review-wall u-section-body">
          {sampleReviews.map((r, i) => (
            <Reveal as="li" key={r.nameEn} delay={i * 40} className="review-card">
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
