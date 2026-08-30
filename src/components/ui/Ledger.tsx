import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The ledger: hairline-separated rows carrying an index, a title and the
 * facts a visitor needs to decide.
 *
 * This exists because the site kept answering every new question with another
 * grid of identical cards. A studio's own wall list — technique, duration,
 * next date — is denser, faster to scan, honest about what we do and do not
 * know, and works at 320px without any of the cropping problems a card has.
 * Use it for catalogues, sequences and syllabi; keep cards for the few places
 * where an image genuinely leads.
 */

export function Ledger({
  as: As = "ul",
  children,
  className
}: {
  as?: "ul" | "ol" | "div";
  children: ReactNode;
  className?: string;
}) {
  return <As className={cn("ledger", className)}>{children}</As>;
}

type RowContent = {
  /** Quiet leading column: "01", a family initial, a short code. */
  index?: ReactNode;
  title: ReactNode;
  /** Right-aligned decision fact from `sm` up: duration, date, seats. */
  meta?: ReactNode;
  /** Optional second line under the title. */
  note?: ReactNode;
};

function RowInner({ index, title, meta, note }: RowContent) {
  return (
    <>
      {/* Rendered only when there is an index. An empty span still occupies
          the 2.25rem grid column, which indented every row of an unnumbered
          ledger against nothing — visible on the 404 aside and anywhere else
          a ledger is used as a plain link list. `.is-plain` collapses the
          column so the title starts at the rule. */}
      {index === undefined ? null : (
        <span className="ledger-index" aria-hidden="true">
          {index}
        </span>
      )}
      <span className="ledger-title">{title}</span>
      {meta ? <span className="ledger-meta">{meta}</span> : null}
      {note ? <span className="ledger-note">{note}</span> : null}
    </>
  );
}

/** A static row. */
export function LedgerRow({
  as: As = "li",
  className,
  ...content
}: RowContent & { as?: "li" | "div"; className?: string }) {
  return (
    <As className={cn("ledger-row", content.index === undefined && "is-plain", className)}>
      <RowInner {...content} />
    </As>
  );
}

/**
 * A row that is entirely one link target. Wrapping the <a> in the <li> keeps
 * list semantics valid while giving a thumb the full row to hit.
 */
export function LedgerLink({
  href,
  className,
  ...content
}: RowContent & { href: string; className?: string }) {
  return (
    <li>
      <Link
        href={href}
        className={cn("ledger-row", content.index === undefined && "is-plain", className)}
      >
        <RowInner {...content} />
      </Link>
    </li>
  );
}
