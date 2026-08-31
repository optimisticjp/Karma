import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/**
 * The one place section headings are composed. Spacing comes from the rhythm
 * tokens (--space-*), never from per-component margin guesses: that drift is
 * what makes a page read as assembled instead of designed.
 *
 * Interaction 1 lives here: the brand thread draws beneath the heading as it
 * scrolls into view, reusing the shared observer in <Reveal>.
 *
 * There is deliberately no `onDark` escape hatch any more. It existed so a
 * dark band could be added anywhere for free, and it was the thing that broke
 * silently when a band was lightened: `text-ivory` on a pale ground is
 * invisible and nothing catches it. With the public site light-first there
 * are no callers, and removing the prop means a future dark band is a
 * TypeScript error rather than white text on Steel Mist.
 */
export function SectionHeading({
  eyebrow,
  id,
  title,
  sub,
  className,
  rule = false
}: {
  eyebrow?: string;
  /**
   * Lands on the `<h2>`, so a `<section aria-labelledby>` can name its landmark
   * with the heading a sighted visitor is already reading. Without it the only
   * way to name the region is `aria-label`, which duplicates the string and
   * then drifts from it.
   */
  id?: string;
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
  /**
   * The stitched rule is a signature, not a default. It used to render under
   * every heading — about twenty per page — which made it read as mechanical
   * decoration. Opt in on the two or three moments per page that genuinely
   * deserve emphasis; elsewhere the spacing and surface change do the work.
   */
  rule?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="eyebrow u-eyebrow-gap">{eyebrow}</p> : null}
      <h2 id={id} className="text-h2">{title}</h2>
      {rule ? <span aria-hidden="true" className="rule-stitch" /> : null}
      {sub ? <p className="u-lede">{sub}</p> : null}
    </Reveal>
  );
}
