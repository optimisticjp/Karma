import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StageOutline, StageFailed, StageCorrection, StageFinished } from "./motif";

/**
 * Proof from the machine: screen file → failed sample → correction → final
 * stitch.
 *
 * The one panel that makes this section work is the second. Every institute
 * in Surat publishes finished pieces; none publishes a stitch-out that went
 * wrong, because it looks like an admission. It is the opposite: only someone
 * who runs production every day can show you the four faults on a bad sample
 * and name the file change that fixes each one. A prospective student who
 * recognises fault 1 from their own machine has just been told exactly what
 * this place teaches.
 *
 * Drawn, not photographed. The studio shoot has not happened, and a *drawn*
 * diagram is the better artefact here anyway — a photograph of a puckered
 * sample shows you that it puckered; this shows you why.
 *
 * These are diagrams of ordinary trade faults, not a record of any student's
 * work, so there is no identity, outcome or statistic to verify.
 *
 * On `bg-sand` rather than a dark band, despite being the page's signature
 * moment: two dark bands already punctuate this page (the audience switch and
 * the close), and a third turns punctuation into decoration. The four panels
 * each carry their own ground — CAD grid, puckered weave, clean weave — so
 * the contrast is inside the strip, not behind it.
 */
export function MachineProof() {
  const t = useTranslations("home.machineProof");

  const panels = [
    { key: "file", Stage: StageOutline, uid: "mp-file" },
    { key: "failed", Stage: StageFailed, uid: "mp-failed" },
    { key: "fix", Stage: StageCorrection, uid: "mp-fix" },
    { key: "final", Stage: StageFinished, uid: "mp-final" }
  ] as const;

  return (
    <section className="section bg-sand">
      <div className="container-site">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("h2")}
          sub={t("sub")}
          rule
        />

        <ol className="proof-strip u-section-body">
          {panels.map((p, i) => (
            <Reveal as="li" key={p.key} delay={i * 70} className="proof-panel">
              <p className="proof-step">
                <span className="proof-step-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t(`${p.key}Label` as "fileLabel")}
              </p>
              <div className="proof-figure">
                <p.Stage uid={p.uid} />
              </div>
              <p className="proof-note">{t(`${p.key}Note` as "fileNote")}</p>
            </Reveal>
          ))}
        </ol>

        <p className="proof-foot">{t("foot")}</p>
      </div>
    </section>
  );
}
