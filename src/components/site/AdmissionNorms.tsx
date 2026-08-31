import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";
import { admissionTerms } from "@/content/admission-terms";

/**
 * The institute's admission norms, in full, on the page the visitor accepts
 * them from.
 *
 * Rendered server-side rather than passed into the form as props: fifteen
 * clauses in two languages is several kilobytes of text that would otherwise
 * ship in the client bundle for a checkbox to reference, and the Worker has a
 * size budget. It is a native `<details>` so it costs no JavaScript, is
 * findable by in-page search when open, and works with no JS at all.
 *
 * The Gujarati is the institute's own wording. The English is a working
 * translation for the English site; where the two could be read differently,
 * the Gujarati governs — and that is said on the page rather than assumed.
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
          <h2 className="t-h3">{title}</h2>
          <ThreadLine draw className="mt-3 w-16" />
          <p className="t-body mt-4">{intro}</p>

          <details className="module mt-4">
            <summary className="module-summary">
              <span className="t-micro numeric module-index" aria-hidden="true">
                {String(terms.clauses.length).padStart(2, "0")}
              </span>
              <span className="t-h4 min-w-0">{gu ? terms.titleGu : terms.titleEn}</span>
              <Icon name="plus" size={17} className="module-plus" />
            </summary>
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
          </details>
        </div>
      </div>
    </section>
  );
}
