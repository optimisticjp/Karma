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
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  className,
  onDark = false,
  rule = false
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
  onDark?: boolean;
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
      <h2 className={cn("text-h2", onDark && "text-ivory")}>{title}</h2>
      {rule ? <span aria-hidden="true" className="rule-stitch" /> : null}
      {sub ? <p className={cn("u-lede", onDark && "!text-ivory/80")}>{sub}</p> : null}
    </Reveal>
  );
}
