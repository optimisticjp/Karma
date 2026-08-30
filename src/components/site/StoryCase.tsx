import { useLocale, useTranslations } from "next-intl";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import { MonoNote, StepIndex } from "@/components/ui/MonoNote";
import { KnotPoint } from "@/components/ui/StitchMark";
import type { ManagedStory } from "@/lib/content/public";

/**
 * A student story as a mini case study, in one grammar: BEFORE → LEARNED → NOW.
 *
 * Those three are the arc, and they are set as three numbered steps on a
 * stitch path rather than as a paragraph, because the shape itself is the
 * argument: something specific was learned between one state and the other.
 * A generic "great institute" quote proves nothing; "learned to hoop a garment
 * that has already been stitched together" is a claim that either happened or
 * did not.
 *
 * The knot on the final step is deliberate — in this system a knot point means
 * "decision / completion", which is exactly what NOW is. It is not a bullet.
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

  /* The three-step arc. BEFORE and NOW always exist on a story; LEARNED is
     what a Content Desk story may or may not have filled in, and the arc
     survives without it rather than rendering an empty step. */
  const arc: Array<[string, string | undefined]> = [
    [t("before"), gu ? s.beforeGu : s.beforeEn],
    [t("learned"), gu ? s.learnedGu : s.learnedEn],
    [t("now"), (gu ? s.nowGu : s.nowEn) ?? (gu ? s.afterGu : s.afterEn)]
  ];
  const steps = arc.filter(([, v]) => Boolean(v)) as Array<[string, string]>;

  /* The extra detail a fuller story carries. Never shown in teaser mode: a
     full case study is ~800px, which is right on the stories page and wrong
     on a homepage that already runs fifteen sections. */
  const detail: Array<[string, string | undefined]> = compact
    ? []
    : [
        [t("why"), gu ? s.whyGu : s.whyEn],
        [t("changed"), gu ? s.changedGu : s.changedEn]
      ].filter(([, v]) => Boolean(v)) as Array<[string, string]>;

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

      {/* BEFORE → LEARNED → NOW, on one stitch path. */}
      {steps.length > 0 ? (
        <ol className="story-arc-steps">
          {steps.map(([label, value], i) => (
            <li key={label} className="story-arc-step">
              <span className="story-arc-mark" aria-hidden="true">
                {i === steps.length - 1 ? <KnotPoint size={13} tone="vermilion" /> : null}
              </span>
              <p className="story-arc-head">
                <StepIndex n={i + 1} />
                <MonoNote className="story-step-label">{label}</MonoNote>
              </p>
              <p className="story-step-value">{value}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {detail.length > 0 ? (
        <dl className="story-steps">
          {detail.map(([label, value]) => (
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
