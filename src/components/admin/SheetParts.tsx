import { admissionTerms } from "@/content/admission-terms";
import type { PrintCopy } from "@/lib/admin/print-copy";

/**
 * The pieces a Karma sheet is built from. Presentational and server-rendered:
 * a printed page has no interaction to hydrate.
 */

/** A labelled value. A blank one is a line to write on, not a missing value. */
export function SheetField({
  label,
  value,
  money
}: {
  label: string;
  value?: string | null;
  money?: boolean;
}) {
  return (
    <div className="sheet-field">
      <p className="sheet-label">{label}</p>
      <p className={`sheet-value ${money ? "is-money" : ""}`}>{value || " "}</p>
    </div>
  );
}

export function SheetSection({
  title,
  children,
  columns = 2
}: {
  title: string;
  children: React.ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <section className="sheet-section">
      <h2 className="sheet-section-title">{title}</h2>
      <div className={`sheet-fields ${columns === 3 ? "is-three" : ""}`}>{children}</div>
    </section>
  );
}

/**
 * The institute's admission norms, printed in full, with the declaration the
 * student signs. Gujarati is the original wording; English follows it, because
 * the sheet is signed in the room and the Gujarati is what most students read.
 */
export function SheetNorms({
  version,
  locale,
  copy
}: {
  version: number;
  locale: "en" | "gu";
  copy: PrintCopy;
}) {
  const terms = admissionTerms(version);
  if (!terms) return null;
  const gu = locale === "gu";

  return (
    <section className="sheet-section">
      <h2 className="sheet-section-title">{copy.norms}</h2>
      <ol className="sheet-rules">
        {terms.clauses.map((clause) => (
          <li key={clause.n} className="sheet-rule">
            <span className="sheet-rule-n">{clause.n}.</span>
            <span>{gu ? clause.gu : clause.en}</span>
          </li>
        ))}
      </ol>

      <div className="sheet-declaration">
        <p className="sheet-label">{copy.declaration}</p>
        <p style={{ marginTop: "1.5mm" }}>{gu ? terms.declarationGu : terms.declarationEn}</p>
      </div>
    </section>
  );
}

/** Student · parent · trainer · office stamp, and the date. */
export function SheetSignatures({ copy }: { copy: PrintCopy }) {
  return (
    <div className="sheet-signatures">
      <div className="sheet-sign">
        <div className="sheet-sign-line" />
        <p className="sheet-sign-label">{copy.studentSignature}</p>
      </div>
      <div className="sheet-sign">
        <div className="sheet-sign-line" />
        <p className="sheet-sign-label">{copy.parentSignature}</p>
      </div>
      <div className="sheet-sign">
        <div className="sheet-sign-line" />
        <p className="sheet-sign-label">{copy.trainerSignature}</p>
      </div>
      <div className="sheet-sign">
        <div className="sheet-stamp">{copy.officeStamp}</div>
        <p className="sheet-sign-label">{copy.date}</p>
      </div>
    </div>
  );
}

/* --------------------------------- format --------------------------------- */

export function inr(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function day(value: string | null | undefined, locale: "en" | "gu"): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00+05:30`));
}

export function moment(value: Date, locale: "en" | "gu"): string {
  return new Intl.DateTimeFormat(locale === "gu" ? "gu-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}
