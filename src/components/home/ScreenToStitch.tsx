"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * The signature interaction (plan 7.2): one project shown as three layers
 * (emCAD design → stitch path → finished fabric), revealed by a draggable
 * slider. A native <input type="range"> keeps it keyboard-accessible for
 * free. Layers are labelled PhotoSlots until the real 3-stage shoot lands.
 */
export function ScreenToStitch() {
  const t = useTranslations("home.sts");
  const [v, setV] = useState(1);

  const clip = (progress: number) => `inset(0 ${(1 - Math.min(Math.max(progress, 0), 1)) * 100}% 0 0)`;
  const active = v < 0.5 ? 0 : v < 1.5 ? 1 : 2;
  const stages = [t("stage1"), t("stage2"), t("stage3")];

  const layer = (label: string, tone: string, style?: React.CSSProperties) => (
    <div
      className={cn("absolute inset-0 flex items-center justify-center", tone)}
      style={style}
      aria-hidden="true"
    >
      <p className="max-w-xs px-6 text-center text-smallmeta font-semibold text-stone">
        📷 {label} (shoot list #2)
      </p>
    </div>
  );

  return (
    <section className="section-major bg-ivory-2">
      <div className="container-wide">
        <SectionHeading title={t("h2")} sub={t("sub")} />
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-card">
            {layer(stages[0], "bg-card")}
            {layer(stages[1], "bg-ivory-2", { clipPath: clip(v) })}
            {layer(stages[2], "bg-line/50", { clipPath: clip(v - 1) })}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 w-0.5 bg-vermilion-deep"
              style={{ left: `${(v / 2) * 100}%` }}
            />
          </div>

          <label className="mt-6 block">
            <span className="sr-only">{t("sliderLabel")}</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={v}
              aria-valuetext={stages[active]}
              onChange={(e) => setV(Number(e.target.value))}
              className="w-full accent-vermilion"
            />
          </label>

          <div className="mt-3 flex justify-between gap-2">
            {stages.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setV(i)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition-colors md:text-sm",
                  active === i ? "bg-carbon text-ivory" : "text-stone hover:text-carbon"
                )}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-stone">{t("hint")}</p>
        </div>
      </div>
    </section>
  );
}
