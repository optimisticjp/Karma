import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * The problems we teach you to solve.
 *
 * Every institute in Surat lists the same syllabus. None of them names the
 * six things that actually go wrong on a production floor — which is exactly
 * what a working operator, a small unit owner or a parent paying the fee is
 * trying to find out. Naming the fault and the cause in one line is more
 * persuasive than any adjective, and it is all verifiable trade knowledge:
 * nothing here claims a result, a statistic or a student outcome.
 *
 * Set as fault → cause pairs rather than cards. A card grid would flatten six
 * specific, unequal problems into six equal boxes.
 */
export function ProblemsSolved() {
  const t = useTranslations("home.problems");
  const rows = [1, 2, 3, 4, 5, 6].map((n) => ({
    fault: t(`p${n}f` as "p1f"),
    cause: t(`p${n}c` as "p1c")
  }));

  return (
    <section className="section band-info">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />

        <ol className="problem-list u-section-body">
          {rows.map((r, i) => (
            <Reveal as="li" key={r.fault} delay={i * 40} className="problem-row">
              <p className="problem-fault">{r.fault}</p>
              <p className="problem-cause">
                <span className="problem-arrow" aria-hidden="true">→</span>
                {r.cause}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
