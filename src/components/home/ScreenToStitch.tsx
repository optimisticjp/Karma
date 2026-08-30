"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StageOutline, StagePath, StageFinished } from "./motif";
import { cn } from "@/lib/utils";

/**
 * Screen → stitch: the signature interaction.
 *
 * It used to render three empty panels reading "📷 … (shoot list #2)", so the
 * one moment meant to explain the whole studio was a production note shown to
 * the public. It is now *drawn*: one buta motif in its three real states —
 * the emCAD outline with its control points, the stitch path the machine
 * follows, and the finished satin fill. That is a better explanation than a
 * photograph would have been anyway, because you can see the path.
 *
 * The control is a native range input: draggable with a mouse, a thumb and
 * arrow keys, announced correctly, and free of any scroll-hijacking gesture.
 */

export function ScreenToStitch() {
  const t = useTranslations("home.sts");
  const uid = useId().replace(/:/g, "");
  const [v, setV] = useState(1);

  const clip = (progress: number) =>
    `inset(0 ${(1 - Math.min(Math.max(progress, 0), 1)) * 100}% 0 0)`;
  const active = v < 0.5 ? 0 : v < 1.5 ? 1 : 2;
  const stages = [t("stage1"), t("stage2"), t("stage3")];

  return (
    <section className="section bg-blush">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />
            <ol className="ledger mt-8">
              {stages.map((s, i) => (
                <li
                  key={s}
                  className={cn(
                    "ledger-row transition-opacity duration-200",
                    active === i ? "opacity-100" : "opacity-55"
                  )}
                >
                  <span className="ledger-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ledger-title">{s}</span>
                  <span className="ledger-note">{t(`note${i + 1}` as "note1")}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="stage-figure">
              <StageOutline uid={uid} />
              <div className="stage-layer" style={{ clipPath: clip(v) }}>
                <StagePath />
              </div>
              <div className="stage-layer" style={{ clipPath: clip(v - 1) }}>
                <StageFinished uid={uid} />
              </div>
              <span
                aria-hidden="true"
                className="stage-handle"
                style={{ left: `${(v / 2) * 100}%` }}
              />
            </div>

            <label className="mt-4 block">
              <span className="sr-only">{t("sliderLabel")}</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={v}
                aria-valuetext={stages[active]}
                onChange={(e) => setV(Number(e.target.value))}
                className="stage-range"
              />
            </label>

            <div className="stage-tabs mt-1">
              {stages.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setV(i)}
                  aria-pressed={active === i}
                  className="stage-tab"
                >
                  <span aria-hidden="true">{i + 1}. </span>
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-stone">{t("hint")}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
