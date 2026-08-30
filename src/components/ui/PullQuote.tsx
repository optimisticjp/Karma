import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SampleTag } from "./SampleTag";

/**
 * The editorial pull-quote — the only place Playfair italic is used, which is
 * why the accent face earns its download at all.
 *
 * The `sample` flag is not cosmetic. Workers.dev is publicly reachable, so an
 * unverified quote must be unmistakably marked wherever it renders, and the
 * same flag is what keeps it out of Review/AggregateRating structured data
 * (CLAUDE.md #2). A quote with no attribution renders no cite line rather
 * than an invented one.
 */
export function PullQuote({
  quote,
  cite,
  sample = false,
  className
}: {
  quote: ReactNode;
  cite?: ReactNode;
  sample?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("pull-quote-block", className)}>
      <blockquote className="pull-quote">{quote}</blockquote>
      {cite || sample ? (
        <figcaption className="pull-quote-cite">
          {cite}
          {sample ? (
            <span className="mt-2 block">
              <SampleTag />
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
