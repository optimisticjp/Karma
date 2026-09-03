import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** A work queue: the count, then the rows behind it. */
export function Queue({
  title,
  count,
  emptyLabel,
  moreHref,
  moreLabel,
  children,
  urgent = false,
  icon
}: {
  title: string;
  count: number;
  emptyLabel: string;
  moreHref?: string;
  moreLabel?: string;
  children?: React.ReactNode;
  urgent?: boolean;
  icon?: IconName;
}) {
  return (
    <section className="queue queue-v2" aria-label={title}>
      <div className="queue-head">
        <div className="queue-title-wrap">
          {icon ? <span className="queue-icon" aria-hidden="true"><Icon name={icon} size={17} /></span> : null}
          <h3 className="queue-title">{title}</h3>
        </div>
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

/** One row in a queue. The whole row is one generous touch target. */
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
        <span className="queue-row-arrow" aria-hidden="true"><Icon name="arrow" size={14} /></span>
      </Link>
    </li>
  );
}
