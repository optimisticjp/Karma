"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

/**
 * The shared motif: a buta (paisley), the shape this trade actually runs on
 * every second garment in Surat. One closed outline, one inner curl, a stem
 * and a bead run — drawn once and then treated three ways, so the slider
 * reads as one object changing state rather than three unrelated pictures.
 */
const MOTIF = {
  /* Closed buta: a round bulb at the lower left drawn up into the curled
     point at the upper right. Laid on its side so it fills a landscape frame
     the way a border motif fills a border. */
  body:
    "M336 46 C366 96, 350 158, 306 190 C254 226, 170 230, 122 198 " +
    "C68 164, 60 100, 100 68 C138 40, 196 44, 218 84 " +
    "C236 116, 276 122, 300 100 C318 84, 328 64, 336 46 Z",
  /* The inner echo, the way a border row repeats just inside the outline. */
  inner:
    "M316 76 C338 118, 322 160, 288 182 C244 210, 176 212, 136 184 " +
    "C92 154, 86 106, 116 82 C148 58, 194 62, 214 96 " +
    "C230 122, 266 128, 292 110",
  /* Filled forms worked inside the bulb. */
  flowers: [
    { cx: 160, cy: 140, r: 16 },
    { cx: 208, cy: 160, r: 11 },
    { cx: 132, cy: 174, r: 9 }
  ],
  /* Where the needle enters, walked around the outline in stitch order. */
  stitches: [
    [336, 46],
    [356, 112],
    [330, 168],
    [280, 208],
    [206, 228],
    [140, 212],
    [86, 166],
    [66, 108],
    [106, 66],
    [170, 44],
    [218, 84]
  ] as const,
  /* The handful of anchors an emCAD file would actually expose. */
  nodes: [
    [336, 46],
    [306, 190],
    [122, 198],
    [100, 68],
    [218, 84],
    [300, 100]
  ] as const
};

function StageOutline({ uid }: { uid: string }) {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${uid}-cad`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0v20" fill="none" stroke="var(--color-line)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-cad)`} />
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="1.7" strokeLinejoin="round">
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} strokeWidth="1.1" />
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} strokeWidth="1.1" />
        ))}
      </g>
      {/* Control points: the giveaway that this is a file, not a photograph. */}
      <g fill="var(--color-card)" stroke="var(--color-vermilion)" strokeWidth="1.3">
        {MOTIF.nodes.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" />
        ))}
      </g>
    </svg>
  );
}

function StagePath() {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <rect width="400" height="250" fill="var(--color-ivory-2)" />
      {/* The design, receded: the file is still underneath the path. */}
      <g fill="none" stroke="var(--color-carbon)" strokeWidth="0.9" opacity="0.22">
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} />
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} />
        ))}
      </g>
      {/* The travel path, dashed like thread, in the one accent colour. */}
      <g
        fill="none"
        stroke="var(--color-vermilion)"
        strokeWidth="2.3"
        strokeLinejoin="round"
        strokeDasharray="7 5"
      >
        <path d={MOTIF.body} />
        <path d={MOTIF.inner} strokeWidth="1.7" />
      </g>
      {/* Every point where the needle goes into the cloth. */}
      <g fill="var(--color-carbon)">
        {MOTIF.stitches.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
        ))}
      </g>
    </svg>
  );
}

function StageFinished({ uid }: { uid: string }) {
  return (
    <svg
      className="stage-layer"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Satin fill: short parallel strokes, the way a filled area is
            actually stitched. Reads as embroidery, not as a flat vector. */}
        <pattern
          id={`${uid}-satin`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(38)"
        >
          <rect width="6" height="6" fill="var(--color-vermilion)" />
          <path d="M0 0v6" stroke="rgb(255 255 255 / 0.32)" strokeWidth="1.7" />
        </pattern>
        {/* The ground cloth. */}
        <pattern id={`${uid}-weave`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--color-card)" />
          <path d="M0 4h8M4 0v8" stroke="var(--color-line)" strokeWidth="0.7" opacity="0.65" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-weave)`} />
      <path
        d={MOTIF.body}
        fill={`url(#${uid}-satin)`}
        stroke="var(--color-vermilion)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d={MOTIF.inner} fill="none" stroke="rgb(255 255 255 / 0.6)" strokeWidth="3" />
      {/* Flowers worked in a second colour, beads on the outline. */}
      <g fill="var(--color-carbon)" opacity="0.88">
        {MOTIF.flowers.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} />
        ))}
      </g>
      <g fill="var(--color-card)" stroke="var(--color-carbon)" strokeWidth="1.2">
        {MOTIF.stitches.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" />
        ))}
      </g>
    </svg>
  );
}

export function ScreenToStitch({ children }: { children?: React.ReactNode }) {
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

        {/* The method steps used to be their own full section directly below,
            with a second heading saying much the same thing. Same chapter, so
            same section: one heading, one padding, half the height. */}
        {children}
      </div>
    </section>
  );
}
