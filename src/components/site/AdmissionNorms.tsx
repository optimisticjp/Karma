import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";
import { admissionTerms } from "@/content/admission-terms";

/**
 * The institute's admission norms, in full, on the page the visitor accepts
 * them from. They are intentionally always visible: acceptance should never
 * depend on noticing or opening a disclosure control.
 */
export function AdmissionNorms({
  version,
  locale,
  title,
  intro,
  languageNote,
  declarationLabel
}: {
  version: number;
  locale: "en" | "gu";
  title: string;
  intro: string;
  languageNote: string;
  declarationLabel: string;
}) {
  const terms = admissionTerms(version);
  if (!terms) return null;
  const gu = locale === "gu";

  return (
    <section id="admission-norms" className="band on-cloth">
      <div className="wrap">
        <div className="reading-shell">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="t-micro">{String(terms.clauses.length).padStart(2, "0")} · {declarationLabel}</p>
              <h2 className="t-h3 mt-1.5">{title}</h2>
            </div>
            <span className="verdict-mark shrink-0" aria-hidden="true">
              <Icon name="check" size={19} />
            </span>
          </div>
          <ThreadLine draw className="mt-3 w-16" />
          <p className="t-body mt-4">{intro}</p>

          <div className="module mt-4">
            <div className="module-summary border-b border-rule">
              <span className="t-micro numeric module-index" aria-hidden="true">
                {String(terms.clauses.length).padStart(2, "0")}
              </span>
              <span className="t-h4 min-w-0">{gu ? terms.titleGu : terms.titleEn}</span>
              <Icon name="check" size={17} className="text-[var(--brand-accent-strong)]" />
            </div>
            <div className="module-points">
              <ol className="norms-list">
                {terms.clauses.map((clause) => (
                  <li key={clause.n}>
                    <span className="t-micro numeric">{clause.n}.</span>
                    <span className="t-body">{gu ? clause.gu : clause.en}</span>
                  </li>
                ))}
              </ol>

              <div className="norms-declaration">
                <p className="t-micro">{declarationLabel}</p>
                <p className="t-meta mt-1.5">{gu ? terms.declarationGu : terms.declarationEn}</p>
              </div>

              {!gu ? <p className="t-meta mt-3">{languageNote}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
