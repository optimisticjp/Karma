import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { googleRating, reviews, stories, testimonials } from "@/content/proof";
import {
  FeaturedReview,
  RatingBlock,
  ReviewRail,
  StoryJourney
} from "@/components/kds/proof";

/**
 * What people say — in four shapes, not four copies of one card.
 *
 * A featured quote at heading scale, a swipeable rail of short reviews, the
 * studio's rating as a figure, and one student journey threaded
 * before → learned → now. The addendum's §10 is explicit that these are
 * different objects and must not share a card component; the reasoning and the
 * components live in `src/components/kds/proof.tsx`.
 *
 * EVERYTHING HERE IS PREVIEW CONTENT AND SAYS SO
 * ----------------------------------------------
 * Every item carries its own marker — "Sample preview" for content written for
 * the preview, "Studio-supplied" for the rating, which is a real figure the
 * studio gave that nobody has independently counted. The distinction matters:
 * "the studio told us this" and "we made this up" are different claims.
 *
 * None of it reaches structured data. `src/lib/schema.ts` cannot import the
 * proof registry at all, and no review count is published anywhere — an
 * `AggregateRating` needs one, and the count circulating online is an
 * aggregate nobody has been able to verify.
 */
export function HomeVoices() {
  const t = useTranslations("home.voices");
  const locale = useLocale() as Locale;

  return (
    <section className="band on-paper" aria-labelledby="voices-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("eyebrow")}</p>
          <h2 id="voices-heading" className="t-h2 mt-1.5">
            {t("h2")}
          </h2>
        </header>

        <FeaturedReview item={testimonials[0]} locale={locale} className="mt-8" />

        <div className="voices-rail">
          <ReviewRail items={reviews} locale={locale} label={t("railLabel")} />
        </div>

        <div className="voices-foot">
          <StoryJourney
            item={stories[0]}
            locale={locale}
            labels={{ before: t("before"), learned: t("learned"), now: t("now") }}
          />
          <div className="voices-rating">
            <RatingBlock item={googleRating} caption={t("ratingSource")} />
            <p className="t-meta mt-3 max-w-[38ch]">{t("ratingNote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
