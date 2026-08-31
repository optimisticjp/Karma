import { StitchRule } from "@/components/ui/StitchPath";
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
    <section id="admission-norms" className="section">
      <div className="container-site">
        <div className="reading-shell">
          <h2 className="text-h3 font-display">{title}</h2>
          <StitchRule draw className="mt-2 max-w-[4.5rem]" />
          <p className="u-section-body text-smallmeta text-stone">{intro}</p>

          <details className="mt-3 border border-line bg-card">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 text-smallmeta font-semibold">
              {gu ? terms.titleGu : terms.titleEn} · {terms.clauses.length}
            </summary>
            <div className="border-t border-line px-3 py-3">
              <ol className="grid gap-2 text-smallmeta">
                {terms.clauses.map((clause) => (
                  <li key={clause.n} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
                    <span className="font-bold text-vermilion-deep">{clause.n}.</span>
                    <span>{gu ? clause.gu : clause.en}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 border-t border-line pt-3">
                <p className="microlabel">{declarationLabel}</p>
                <p className="mt-1 text-smallmeta text-stone">{gu ? terms.declarationGu : terms.declarationEn}</p>
              </div>

              {!gu ? <p className="form-note mt-3">{languageNote}</p> : null}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
