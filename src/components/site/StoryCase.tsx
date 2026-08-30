import { useLocale, useTranslations } from "next-intl";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import type { ManagedStory } from "@/lib/content/public";

/**
 * A student story as a mini case study.
 *
 * Before → why they joined → what they learned → what changed → where they are
 * now. The middle three are what make it useful: "tailor became an embroidery
 * shop" is an outcome anyone can claim, while "learned to hoop a garment that
 * has already been stitched together" is a specific thing that either happened
 * or did not.
 *
 * A story published through Content Desk carries only the fields that form
 * has, so the case-study body renders when it exists and the card falls back
 * to before → after when it does not. Extending the CMS to add five fields for
 * a presentation problem would have been the wrong trade.
 *
 * **No earnings, salary, job or placement is claimed anywhere**, in sample
 * content or in the fields a real story can fill: `now` describes work the
 * person does, never a figure they earn.
 */
export function StoryCase({
  story,
  compact = false
}: {
  story: ManagedStory;
  /**
   * Teaser mode: identity, quote and the before → after arc, without the
   * four case-study steps. A full case study is ~800px, which is the right
   * weight on the stories page and the wrong weight on a homepage that
   * already runs fifteen sections.
   */
  compact?: boolean;
}) {
  const t = useTranslations("proof.stories");
  const locale = useLocale();
  const gu = locale === "gu";
  const s = story;

  const steps: Array<[string, string | undefined]> = [
    [t("why"), gu ? s.whyGu : s.whyEn],
    [t("learned"), gu ? s.learnedGu : s.learnedEn],
    [t("changed"), gu ? s.changedGu : s.changedEn],
    [t("now"), gu ? s.nowGu : s.nowEn]
  ];
  const detailed = compact ? [] : steps.filter(([, v]) => Boolean(v));

  return (
    <article className="story-case">
      <div className="story-head">
        <div className="story-media">
          <ManagedPhoto src={s.mediaUrl} label={s.photoLabel} ratio="4/5" />
        </div>
        <div className="story-id">
          <p className="story-name">{gu ? s.nameGu : s.nameEn}</p>
          <p className="story-course">{gu ? s.courseGu : s.courseEn}</p>
          <p className="story-arc">
            <span>{gu ? s.beforeGu : s.beforeEn}</span>
            <span aria-hidden="true" className="story-arrow">→</span>
            <strong>{gu ? s.afterGu : s.afterEn}</strong>
          </p>
          {s.sample ? (
            <p className="mt-3">
              <SampleTag />
            </p>
          ) : null}
        </div>
      </div>

      <blockquote className="pull-quote story-quote">
        {gu ? s.quoteGu : s.quoteEn}
      </blockquote>

      {detailed.length > 0 ? (
        <dl className="story-steps">
          {detailed.map(([label, value]) => (
            <div key={label}>
              <dt className="story-step-label">{label}</dt>
              <dd className="story-step-value">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
