"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PhotoFrame } from "@/components/kds/Frame";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StageOutline, StagePath, StageFinished, StageFailed, StageCorrection } from "./motif";

/**
 * SCREEN → MACHINE → PROOF. The page's one signature interaction.
 *
 * WHY THIS IS THE MOST IMPORTANT SECTION ON THE SITE
 * -------------------------------------------------
 * Every embroidery institute in Surat publishes finished pieces. None of them
 * publishes a stitch-out that went wrong. That looks like an admission and is
 * the opposite: only somebody who runs production every day can show you the
 * faults on a bad sample and name the file change that fixes each one. A
 * prospective student who recognises fault 2 from their own machine has just
 * been told exactly what this place teaches.
 *
 * So the rail has FIVE states, not three — the two extra ones are the argument:
 *
 *   01 SCREEN      the design as it leaves EMCAD DAHAO: outline, control
 *                  points, colour blocks. Nothing has met cloth.
 *   02 PATH        the travel the needle will make, in order.
 *   03 FAILED      the first stitch-out, with the faults marked.
 *   04 CORRECTION  what changed IN THE FILE — not at the machine.
 *   05 PROOF       the same design, run again, clean.
 *
 * ONE MOTIF, FIVE STATES
 * ----------------------
 * All five draw the same buta — the paisley this trade runs on every second
 * garment in Surat — so a visitor watches ONE object travel from file to
 * finished piece. Five different drawings would have read as five unrelated
 * pictures. The geometry lives in `motif.tsx` and predates this rebuild; it
 * was the best thing on the old homepage and it survives, retokened.
 *
 * THE INTERACTION, AND WHAT IT REFUSES TO DO
 * ------------------------------------------
 * A tablist. Selecting a stage crossfades one panel. That is all.
 *
 *  - **No autoplay.** Nothing moves until somebody asks.
 *  - **No drag.** The plan is explicit that a mobile interaction must not
 *    require precision dragging, so the control is five buttons at 44px.
 *  - **No scroll hijack.**
 *  - **Nothing is fetched on interaction.** All five panels ship in the HTML,
 *    hidden with the `hidden` attribute rather than swapped in later, so
 *    selecting a stage costs no request and no layout jump. Switching does
 *    need JavaScript; without it the first state renders complete, which is
 *    the state that carries the section's point on its own.
 *  - **Reduced motion** loses the crossfade and keeps everything else.
 *
 * The three reserved process photographs sit under the drawing. When they
 * arrive the diagram stays: a photograph of a puckered sample shows you THAT
 * it puckered; the drawing shows you WHY.
 */

const STAGES = [
  { key: "screen", photo: "P1_DESIGN", register: "machine" as const },
  { key: "path", photo: undefined, register: "machine" as const },
  { key: "failed", photo: undefined, register: "cloth" as const },
  { key: "fix", photo: "P2_MACHINE", register: "cloth" as const },
  { key: "proof", photo: "P3_RESULT", register: "cloth" as const }
] as const;

export function ScreenMachineProof() {
  const t = useTranslations("home.smp");
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState(0);

  return (
    <section className="band on-mist" aria-labelledby="smp-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("eyebrow")}</p>
          <h2 id="smp-heading" className="t-h2 mt-1.5">
            {t("h2")}
          </h2>
          <p className="t-lede mt-3">{t("sub")}</p>
        </header>

        <div className="smp">
          {/* The control. Five buttons, each 44px, each naming its stage —
              a stage is never identified by position alone. */}
          <div className="smp-tabs" role="tablist" aria-label={t("railLabel")}>
            {STAGES.map((stage, i) => (
              <button
                key={stage.key}
                type="button"
                role="tab"
                id={`smp-tab-${i}`}
                aria-selected={active === i}
                aria-controls={`smp-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((v) => (v + 1) % STAGES.length);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((v) => (v - 1 + STAGES.length) % STAGES.length);
                  } else if (e.key === "Home") {
                    e.preventDefault();
                    setActive(0);
                  } else if (e.key === "End") {
                    e.preventDefault();
                    setActive(STAGES.length - 1);
                  }
                }}
                className={cn("smp-tab", active === i && "is-on")}
              >
                <NeedlePoint state={i < active ? "done" : i === active ? "now" : "todo"} />
                <span className="smp-tab-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="smp-tab-name">{t(`${stage.key}Label` as "screenLabel")}</span>
              </button>
            ))}
          </div>

          <ThreadLine className="smp-thread" />

          <div className="smp-stages">
            {STAGES.map((stage, i) => (
              <div
                key={stage.key}
                role="tabpanel"
                id={`smp-panel-${i}`}
                aria-labelledby={`smp-tab-${i}`}
                hidden={active !== i}
                className="smp-panel"
              >
                <figure className="smp-figure">
                  {stage.key === "screen" ? <StageOutline uid={`${uid}-a`} /> : null}
                  {stage.key === "path" ? <StagePath /> : null}
                  {stage.key === "failed" ? <StageFailed uid={`${uid}-c`} /> : null}
                  {stage.key === "fix" ? <StageCorrection uid={`${uid}-d`} /> : null}
                  {stage.key === "proof" ? <StageFinished uid={`${uid}-e`} /> : null}
                </figure>

                <div className="smp-note">
                  <p className="t-h4">{t(`${stage.key}Title` as "screenTitle")}</p>
                  <p className="t-body mt-2">{t(`${stage.key}Note` as "screenNote")}</p>
                  {stage.photo ? (
                    <PhotoFrame
                      id={stage.photo}
                      scale="thumb"
                      register={stage.register}
                      className="smp-photo"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="t-meta smp-foot">{t("foot")}</p>
      </div>
    </section>
  );
}
