import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A work queue: the count, then the rows behind it.
 *
 * WHY THIS REPLACED THE METRIC CARDS
 * ----------------------------------
 * "7 follow-ups due" tells an operator that seven things need attention.
 * A queue tells them WHICH seven, so the first one can be opened without a
 * second navigation and a scan of a list. That is the difference between a
 * dashboard and a work desk, and this screen is a work desk.
 *
 * The count did not disappear — it heads the queue, where it is a label for
 * what follows rather than a number in a box.
 *
 * DENSITY AND TOUCH SIZE ARE NOT IN TENSION
 * -----------------------------------------
 * Rows are visually tight and every row is a full-width target with a ≥44px
 * hit area, using padding that overflows the row rather than a taller row.
 * The console is used standing up, on a phone, between a machine and a
 * counter.
 */
export function Queue({
  title,
  count,
  emptyLabel,
  moreHref,
  moreLabel,
  children,
  urgent = false
}: {
  title: string;
  /** Total, which may exceed the rows shown. */
  count: number;
  emptyLabel: string;
  moreHref?: string;
  moreLabel?: string;
  children?: React.ReactNode;
  /** Draws the count in the accent when there is something to do. */
  urgent?: boolean;
}) {
  return (
    <section className="queue" aria-label={title}>
      <div className="queue-head">
        <h3 className="queue-title">{title}</h3>
        <span className={cn("queue-count", urgent && count > 0 && "is-urgent")}>{count}</span>
      </div>
      {count === 0 ? (
        <p className="queue-empty">{emptyLabel}</p>
      ) : (
        <ol className="queue-list">{children}</ol>
      )}
      {moreHref && moreLabel && count > 0 ? (
        <p className="queue-more">
          <Link href={moreHref} className="stitch-link text-smallmeta font-semibold">
            {moreLabel}
          </Link>
        </p>
      ) : null}
    </section>
  );
}

/**
 * One row in a queue.
 *
 * Title, one line of dot-separated facts, and an optional status. Nothing
 * else fits on a 360px screen without either truncating the name or hiding
 * the thing that decides whether to act.
 *
 * A phone number is deliberately not a queue field: a queue is scanned in
 * public, at a counter, and the number lives one tap away on the record.
 */
export function QueueRow({
  href,
  title,
  meta,
  status,
  statusTone
}: {
  href: string;
  title: string;
  meta: string;
  status?: string;
  statusTone?: "ok" | "warn" | "due" | "neutral";
}) {
  return (
    <li className="queue-row">
      <Link href={href} className="queue-link">
        <span className="queue-row-body">
          <span className="queue-row-title">{title}</span>
          <span className="queue-row-meta">{meta}</span>
        </span>
        {status ? (
          <span className={cn("status-light", statusTone && `is-${statusTone}`)}>
            <span aria-hidden="true" className="status-dot" />
            {status}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
