import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";

/**
 * THE FEE SHEET — the one place on the site that reads as a document.
 *
 * A fee plan is a piece of paper handed across a desk, so it is set as one:
 * white stock, a hairline, the total at display size, and the instalments as a
 * short ordered list with a needle at each. It appears in exactly two places —
 * the homepage decision panel and the course page of the one course that has a
 * confirmed plan — and it is one component so those two can never drift.
 *
 * **Every figure is passed in already formatted from
 * `src/content/course-operations.ts`.** Nothing here computes money, and
 * nothing here is typed into a message catalogue.
 *
 * **There is no pay button, and there never will be.** Fees are discussed and
 * recorded offline: no gateway, no checkout, no payment link, no UPI request.
 * The `offline` line says so in words, because that is where somebody hunting
 * for a pay button looks. See `CLAUDE.md` §5.
 */
export function FeeSheet({
  label,
  total,
  totalNote,
  rows,
  offline,
  actions,
  children,
  className
}: {
  label: string;
  /** The total, already formatted as currency in the reader's locale. */
  total: string;
  totalNote: string;
  /** The instalments, in the order they are paid. */
  rows: Array<{ amount: string; note: string; paid?: boolean }>;
  offline: string;
  actions?: ReactNode;
  /** Anything that belongs under the actions — a proof line, a note. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("fee-sheet", className)}>
      <p className="t-micro">{label}</p>
      <p className="fee-total numeric">{total}</p>
      <p className="t-meta">{totalNote}</p>

      <ThreadLine className="my-5" />

      <ol className="fee-schedule" role="list">
        {rows.map((row) => (
          <li key={row.note}>
            <NeedlePoint state={row.paid ? "done" : "todo"} />
            <span className="t-h4 numeric">{row.amount}</span>
            <span className="t-meta">{row.note}</span>
          </li>
        ))}
      </ol>

      <p className="t-meta fee-offline">{offline}</p>

      {actions ? <div className="fee-actions">{actions}</div> : null}
      {children}
    </div>
  );
}
