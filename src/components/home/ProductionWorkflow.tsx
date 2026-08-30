import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchPath, StitchRule } from "@/components/ui/StitchPath";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * The production workflow: 01 Design → 06 Stitch.
 *
 * The old version showed four steps and stopped at "test and finish". That
 * skipped the two stages that actually separate a trained operator from a
 * digitiser: reading a failed sample, and correcting the file rather than
 * compensating at the machine. Those are stages 04 and 05 now, and they are
 * the reason this section exists at all.
 *
 * The stitch path connects them literally — a running stitch threading
 * through the stage numbers on wide screens, dropping between them when the
 * list goes to one column. Same primitive, same geometry, both directions.
 */

const ICONS: IconName[] = ["hoop", "nodes", "machine", "needle", "scissors", "spool"];

export function ProductionWorkflow() {
  const t = useTranslations("home.workflow");

  const stages = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    n: String(n).padStart(2, "0"),
    icon: ICONS[i],
    title: t(`s${n}t` as "s1t"),
    desc: t(`s${n}d` as "s1d")
  }));

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />

        <div className="workflow u-section-body">
          {/* The thread runs behind the stage numbers on wide screens; the
              numbers sit on the band colour, so it reads as one seam passing
              through six knots rather than six unrelated rules. */}
          <StitchRule draw className="workflow-thread" />

          <ol className="workflow-steps">
            {stages.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 50} className="workflow-step">
                <p className="workflow-index">
                  <span aria-hidden="true">{s.n}</span>
                </p>
                <h3 className="workflow-title">
                  <Icon name={s.icon} size={18} className="workflow-icon" />
                  {s.title}
                </h3>
                <p className="workflow-desc">{s.desc}</p>
                {i < stages.length - 1 ? (
                  <StitchPath preset="drop" tone="vermilion" className="workflow-drop" />
                ) : null}
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="workflow-foot">
          <p className="workflow-note">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
