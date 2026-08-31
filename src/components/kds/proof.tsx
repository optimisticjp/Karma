import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { PhotoFrame } from "./Frame";
import { NeedlePoint, ThreadLine } from "./marks";
import {
  isSample,
  type Partner,
  type ProofStatus,
  type Rating,
  type Review,
  type Social,
  type Story,
  type Testimonial
} from "@/content/proof";

/**
 * PROOF MODULES — several formats, deliberately.
 *
 * The addendum's §10 is explicit: do not use the same testimonial card shape
 * everywhere. A large featured quote, a compact swipeable rail, a rating
 * block, a before/learned/now journey and a one-line micro proof are five
 * different objects that happen to all be "social proof", and flattening them
 * into one card is exactly the templated look the owner rejected.
 *
 * So there is no `<ProofCard>` here. Each format is composed for what it has
 * to carry.
 *
 * THE ONE THING THEY SHARE
 * ------------------------
 * `<SampleMark>`. Every module that renders `status: "sample"` content renders
 * it — the marker is inside the module, not passed in by the caller, because a
 * disclosure a caller can forget is a disclosure that will be forgotten.
 */

/**
 * The preview disclosure (addendum §8).
 *
 * Small and quiet: the requirement is that sample content is identifiable
 * without destroying the composition. `owner_provided` gets a different word,
 * because "the studio told us this" and "we made this up for the preview" are
 * different claims and a visitor deserves to know which one they are reading.
 */
export function SampleMark({
  status,
  className
}: {
  status: ProofStatus;
  className?: string;
}) {
  if (status === "verified") return null;
  return (
    <span className={cn("is-sample", className)}>
      {status === "sample" ? "Sample preview" : "Studio-supplied"}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Stars
 * ------------------------------------------------------------------ */

/**
 * A star row.
 *
 * Drawn rather than an emoji so it inherits the accent and does not become a
 * different picture on every platform. The numeric value is always rendered as
 * text beside it — a rating communicated only by shape is unreadable to a
 * screen reader and to anyone who cannot distinguish the fill.
 */
function Stars({ value, id }: { value: number; id: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="stars" aria-hidden="true">
      <svg viewBox="0 0 100 20" focusable="false">
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${pct}%`} stopColor="var(--brand-accent)" />
            <stop offset={`${pct}%`} stopColor="transparent" />
          </linearGradient>
          <path
            id={`star-${id}`}
            d="M10 1.6 12.6 7l5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.5 7.8 7.4 7Z"
          />
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <use key={i} href={`#star-${id}`} x={i * 20} stroke="var(--brand-accent)" strokeWidth={1.1} fill="none" />
        ))}
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <use key={i} href={`#star-${id}`} x={i * 20} fill={`url(#fill-${id})`} />
          ))}
        </g>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Format 1 — the featured review
 * ------------------------------------------------------------------ */

/**
 * One large editorial quote against media. The page's proof headline.
 *
 * Set as a `<blockquote>` at heading scale rather than as body copy in a box:
 * this is the one quote on the page that is meant to be read as a statement,
 * and typographic weight is how that gets communicated without a card.
 */
export function FeaturedReview({
  item,
  locale,
  className
}: {
  item: Testimonial;
  locale: Locale;
  className?: string;
}) {
  return (
    <figure className={cn("grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-center md:gap-10", className)}>
      <div className="min-w-0">
        <ThreadLine className="mb-5 w-16" />
        <blockquote className="t-h3 font-normal leading-snug">
          {pick(item, "quote", locale)}
        </blockquote>
        <figcaption className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="t-h4">{item.author}</span>
          <span className="t-meta">{pick(item, "role", locale)}</span>
          <SampleMark status={item.status} />
        </figcaption>
      </div>
      {item.photoId ? (
        <PhotoFrame id={item.photoId} scale="feature" className="w-full" />
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * Format 2 — the review rail
 * ------------------------------------------------------------------ */

/**
 * Compact review snippets on a horizontal snap rail.
 *
 * A rail rather than a stacked column because six reviews stacked vertically
 * is 1,200px of the same shape, which is the repetition the addendum warns
 * about. On a phone a thumb flicks through them; on a laptop they run wider
 * and the overflow is still scrollable. No carousel library: `scroll-snap`
 * does the whole job.
 */
export function ReviewRail({
  items,
  locale,
  label,
  className
}: {
  items: Review[];
  locale: Locale;
  /** Names the scrollable region, e.g. "What people say". */
  label: string;
  className?: string;
}) {
  return (
    <ul
      className={cn("strip strip-wide", className)}
      aria-label={label}
      tabIndex={0}
      role="list"
    >
      {items.map((r) => (
        <li key={r.id} className="quote-card">
          <div className="flex items-center justify-between gap-3">
            <Stars value={r.rating} id={r.id} />
            <span className="sr-only">{r.rating} out of 5</span>
            {isSample(r) ? <SampleMark status={r.status} /> : null}
          </div>
          <p className="t-body mt-3">{pick(r, "text", locale)}</p>
          <p className="t-meta mt-4 font-bold">
            {r.author}
            <span className="ml-2 font-normal opacity-80">
              {r.source === "google" ? "Google" : r.source === "walk-in" ? "Walk-in" : "WhatsApp"}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Format 3 — the rating block
 * ------------------------------------------------------------------ */

/**
 * The Google rating, as a figure rather than a badge.
 *
 * NOTE WHAT IS MISSING: a review count. An `AggregateRating` needs one, and
 * the count circulating online is an aggregate nobody could verify. Publishing
 * it would produce a rich result that is a fabrication, so the number is not
 * shown and no rating schema is emitted from this — see the firewall in
 * `src/content/proof.ts`. The rating is attributed to the studio as its own
 * statement, which is what `owner_provided` means.
 */
export function RatingBlock({
  item,
  caption,
  className
}: {
  item: Rating;
  /** e.g. "as reported by the studio". Attribution is not optional here. */
  caption: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline gap-2.5">
        <span className="t-display numeric leading-none">{item.value}</span>
        <Stars value={Number(item.value)} id={item.id} />
      </div>
      <p className="t-meta">
        {caption} <SampleMark status={item.status} className="ml-1 align-middle" />
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Format 4 — the journey
 * ------------------------------------------------------------------ */

/**
 * BEFORE → LEARNED → NOW, threaded.
 *
 * The stitch runs down the three stages on a phone and across them on a
 * laptop, which is the same mark doing the same job in both directions. Each
 * stage is a `<dt>`/`<dd>` pair, so the relationship survives without the
 * line: a screen reader gets "Before: …", not three loose paragraphs.
 */
export function StoryJourney({
  item,
  locale,
  labels,
  className
}: {
  item: Story;
  locale: Locale;
  labels: { before: string; learned: string; now: string };
  className?: string;
}) {
  const stages = [
    { key: "before", label: labels.before, body: pick(item, "before", locale) },
    { key: "learned", label: labels.learned, body: pick(item, "learned", locale) },
    { key: "now", label: labels.now, body: pick(item, "now", locale) }
  ];

  return (
    <article className={cn("journey", className)}>
      <header className="flex flex-wrap items-center gap-3">
        <h3 className="t-h4">{item.name}</h3>
        <SampleMark status={item.status} />
      </header>
      <dl className="journey-stages">
        {stages.map((s, i) => (
          <div key={s.key} className="journey-stage">
            <NeedlePoint state={i === stages.length - 1 ? "now" : "done"} />
            {i < stages.length - 1 ? (
              <ThreadLine className="journey-thread" tone="ink" />
            ) : null}
            <dt className="t-micro">{s.label}</dt>
            <dd className="t-body">{s.body}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Format 5 — trusted by
 * ------------------------------------------------------------------ */

/**
 * The trusted-by strip, drawn as stitched garment labels.
 *
 * A row of grey wordmarks is the SaaS answer and says nothing about this
 * business. A garment label — woven edge, centre fold, name stitched across it
 * — is what actually gets sewn into the things Karma's clients make, so the
 * strip reads as a rack of labels rather than a logo wall.
 *
 * These names are FICTIONAL placeholders, allowed during preview by the
 * addendum's §9 and marked as such. No real company's logo is reproduced and
 * no real brand is implied to endorse Karma. Each label is a `<li>` with a
 * name and a business type, so swapping one for a real SVG later is a
 * one-element change.
 */
export function TrustedByRail({
  items,
  locale,
  label,
  className
}: {
  items: Partner[];
  locale: Locale;
  label: string;
  className?: string;
}) {
  const anySample = items.some(isSample);
  return (
    <section className={cn("", className)} aria-label={label}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="t-micro">{label}</p>
        {anySample ? <SampleMark status="sample" /> : null}
      </div>
      <ul className="label-rail" role="list">
        {items.map((p) => (
          <li key={p.id} className="garment-label">
            <span className="garment-label-name">{p.name}</span>
            <span className="garment-label-type">{pick(p, "type", locale)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Format 6 — social
 * ------------------------------------------------------------------ */

/**
 * Follower counts as large figures.
 *
 * The addendum wants the studio's social scale visible. It is rendered as
 * typography rather than as a platform widget: no third-party script, no
 * embed, no tracking pixel, and nothing that can slow the page down or fail
 * to load. Each figure links to the real profile so it is checkable.
 *
 * The numbers are `owner_provided` and marked. They are the studio's own
 * statement of its reach — which is a legitimate thing to publish, and is not
 * the same as an audited figure.
 */
export function SocialProof({
  items,
  label,
  followCta,
  className
}: {
  items: Social[];
  label: string;
  /** e.g. "Follow the machine floor". */
  followCta: string;
  className?: string;
}) {
  return (
    <section className={cn("", className)} aria-label={label}>
      <ul className="social-grid" role="list">
        {items.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="social-cell">
              <span className="t-display numeric leading-none">{s.followers}</span>
              <span className="t-h4 capitalize">{s.platform}</span>
              <span className="t-meta">{s.handle}</span>
              <span className="act-quiet mt-2 !min-h-0 text-[length:var(--t-meta)]">
                {followCta}
                <span aria-hidden="true" className="arrow">
                  →
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3">
        <SampleMark status="owner_provided" />
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Format 7 — micro proof
 * ------------------------------------------------------------------ */

/**
 * One short line of proof, embedded where a decision is being made — beside a
 * course's fee, under a batch row. It is a sentence with a thread beside it,
 * not a card: a card here would interrupt the decision it is supposed to
 * support.
 */
export function MicroProof({
  quote,
  author,
  status,
  className
}: {
  quote: ReactNode;
  author: string;
  status: ProofStatus;
  className?: string;
}) {
  return (
    <figure className={cn("micro-proof", className)}>
      <blockquote className="t-body italic">{quote}</blockquote>
      <figcaption className="t-meta mt-1.5 flex flex-wrap items-center gap-2">
        <span className="font-bold">{author}</span>
        <SampleMark status={status} />
      </figcaption>
    </figure>
  );
}
