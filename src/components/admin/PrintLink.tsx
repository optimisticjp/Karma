import Link from "next/link";

/**
 * A link to an A4 sheet, from the record the sheet is about.
 *
 * Print lives next to the record rather than in a "reports" corner, because
 * that is where the need arises: a student is admitted and the form is printed
 * in the same minute, at the same counter.
 */
export function PrintLink({
  href,
  label,
  compact
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className={compact ? "tap" : "btn btn-secondary"} prefetch={false}>
      {compact ? label : `⎙ ${label}`}
    </Link>
  );
}
