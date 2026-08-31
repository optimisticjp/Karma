import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * STITCH SWATCH — eleven techniques, as fabric samples.
 *
 * WHAT THIS IS AND WHY IT IS NOT THE OLD ONE
 * ------------------------------------------
 * The previous system drew each technique as a small line DIAGRAM on a wide
 * frame: an explanation of the stitch, in outline, floating on the page. It
 * read like a technical manual, which is what the owner rejected.
 *
 * A swatch is a different object. It is a square of cloth cut from a sample
 * book — edge to edge, filled, dense, with the texture running off all four
 * sides because a real sample was cut from something bigger. You do not read
 * a swatch; you look at it and know what the material is.
 *
 * The GEOMETRY is domain knowledge and is inherited from the old signatures:
 * beads attach to a path, sequins overlap and are perforated, chain is
 * interlocking loops, cording is couched at intervals, EMCAD is nodes and
 * handles. That was correct and stays correct. What changed is that it is now
 * filled rather than stroked, tiled rather than centred, and sized to be
 * flicked through rather than studied.
 *
 * WHAT A SWATCH MAY NOT SAY
 * -------------------------
 * It describes the STRUCTURE of a stitch and nothing else. No RPM, no density
 * figure, no machine model, no head count, no coordinates. A drawing that
 * invents a specification is the same false claim as a stock photograph, and
 * harder to spot. It is also never a substitute for a photograph of Karma's
 * work: it is an identity mark, and the eight photographed courses show both.
 *
 * COLOUR
 * ------
 * Two inks only: `currentColor` for the cloth and `--brand-accent` for the
 * thread that matters. Nothing here hardcodes a hue, so every swatch re-colours
 * correctly the day the owner's logo arrives in another colour.
 *
 * EMCAD is deliberately the odd one out — it is drawn on the COOL machine
 * register with a CAD grid, because it is the one "technique" that happens on
 * a screen. That difference is the whole brand thesis in one tile.
 */

const V = 100; // every swatch is a 100×100 square

/* ------------------------------------------------------------------ *
 * Generators. Repetitive geometry is produced rather than typed, so a
 * field of stitches cannot drift out of alignment in a diff.
 * ------------------------------------------------------------------ */

/** Dense parallel bars, bowed like a satin fill under tension. */
function satin(count: number, accents: number[]): ReactNode {
  return Array.from({ length: count }, (_, i) => {
    const x = (i + 0.5) * (V / count);
    const bow = Math.sin((i / (count - 1)) * Math.PI) * 9;
    const on = accents.includes(i);
    return (
      <rect
        key={i}
        x={x - 2.1}
        y={10 - bow}
        width={4.2}
        height={80 + bow * 2}
        rx={2.1}
        fill={on ? "var(--brand-accent)" : "currentColor"}
        opacity={on ? 1 : 0.82}
      />
    );
  });
}

/** Rows of beads threaded along a running path, in fours. */
function beads(): ReactNode {
  const out: ReactNode[] = [];
  for (let row = 0; row < 4; row += 1) {
    const y = 16 + row * 23;
    out.push(
      <path
        key={`p${row}`}
        d={`M-4 ${y} C 18 ${y - 9}, 34 ${y + 9}, 52 ${y} S 86 ${y - 9}, 104 ${y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        opacity={0.45}
      />
    );
    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const x = -4 + t * 108;
      const y2 = y + Math.sin(t * Math.PI * 2) * -7;
      out.push(
        <circle
          key={`b${row}-${i}`}
          cx={x}
          cy={y2}
          r={3.5}
          fill={i % 4 === 1 ? "var(--brand-accent)" : "currentColor"}
          opacity={i % 4 === 1 ? 1 : 0.75}
        />
      );
    }
  }
  return <>{out}</>;
}

/** Overlapping perforated discs, offset row to row. */
function sequins(): ReactNode {
  const out: ReactNode[] = [];
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const x = col * 16 + (row % 2 ? 8 : 0) - 2;
      const y = row * 17 + 2;
      const hot = (row * 7 + col) % 11 === 3;
      out.push(
        <g key={`${row}-${col}`}>
          <circle cx={x} cy={y} r={8.5} fill={hot ? "var(--brand-accent)" : "currentColor"} opacity={hot ? 0.9 : 0.5} />
          <circle cx={x} cy={y} r={8.5} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.5} />
          <circle cx={x} cy={y} r={1.9} fill="var(--kds-swatch-bg, #fff)" />
        </g>
      );
    }
  }
  return <>{out}</>;
}

/** Interlocking chain loops — several parallel rows, as a multi-head runs. */
function chain(): ReactNode {
  const out: ReactNode[] = [];
  for (let row = 0; row < 5; row += 1) {
    const y = 12 + row * 19;
    for (let i = 0; i < 8; i += 1) {
      const x = -3 + i * 15;
      out.push(
        <ellipse
          key={`${row}-${i}`}
          cx={x}
          cy={y}
          rx={8.5}
          ry={5.4}
          fill="none"
          stroke={row === 2 ? "var(--brand-accent)" : "currentColor"}
          strokeWidth={2.4}
          opacity={row === 2 ? 1 : 0.7}
        />
      );
    }
  }
  return <>{out}</>;
}

/** A structured grid of crosses, with the even-weave ground behind. */
function crosses(): ReactNode {
  const out: ReactNode[] = [];
  for (let i = 0; i <= 6; i += 1) {
    out.push(<line key={`gv${i}`} x1={i * 16.7} y1={0} x2={i * 16.7} y2={V} stroke="currentColor" strokeWidth={0.5} opacity={0.22} />);
    out.push(<line key={`gh${i}`} x1={0} y1={i * 16.7} x2={V} y2={i * 16.7} stroke="currentColor" strokeWidth={0.5} opacity={0.22} />);
  }
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if ((row + col) % 3 === 2) continue; // a sampler is never a full field
      const x = col * 16.7 + 8.35;
      const y = row * 16.7 + 8.35;
      const hot = row === 2 && col === 3;
      out.push(
        <path
          key={`x${row}-${col}`}
          d={`M${x - 5.4} ${y - 5.4} l10.8 10.8 M${x + 5.4} ${y - 5.4} l-10.8 10.8`}
          stroke={hot ? "var(--brand-accent)" : "currentColor"}
          strokeWidth={2.3}
          strokeLinecap="round"
          opacity={hot ? 1 : 0.72}
        />
      );
    }
  }
  return <>{out}</>;
}

/** A dense field of raised loops — pile, seen from just above. */
function tufts(): ReactNode {
  const out: ReactNode[] = [];
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const x = col * 11.5 + (row % 2 ? 5.75 : 0);
      const y = 12 + row * 13;
      const hot = (row * 9 + col) % 13 === 5;
      out.push(
        <path
          key={`${row}-${col}`}
          d={`M${x} ${y} q 5 -11, 10 0`}
          fill="none"
          stroke={hot ? "var(--brand-accent)" : "currentColor"}
          strokeWidth={3.2}
          strokeLinecap="round"
          opacity={hot ? 1 : 0.6 + (row % 3) * 0.09}
        />
      );
    }
  }
  return <>{out}</>;
}

/** Flat fill: one solid field, with the stitch direction visible across it. */
function flat(): ReactNode {
  const out: ReactNode[] = [<rect key="g" x={-2} y={-2} width={104} height={104} fill="currentColor" opacity={0.16} />];
  for (let i = -6; i < 18; i += 1) {
    out.push(
      <line
        key={i}
        x1={i * 9}
        y1={-4}
        x2={i * 9 - 40}
        y2={104}
        stroke={i === 6 ? "var(--brand-accent)" : "currentColor"}
        strokeWidth={i === 6 ? 3 : 2.6}
        opacity={i === 6 ? 1 : 0.55}
      />
    );
  }
  return <>{out}</>;
}

/* ------------------------------------------------------------------ *
 * The eleven. Keyed by course slug; the key set is asserted against
 * src/content/courses.ts in tests/kds-foundation.test.ts, so a new
 * course cannot ship without a swatch.
 * ------------------------------------------------------------------ */

type Swatch = {
  /** What is drawn. Kept in the source so a reviewer can check the claim. */
  describes: string;
  /** EMCAD sits on the cool machine register; everything else is cloth. */
  register?: "machine";
  render: () => ReactNode;
};

export const STITCH_SWATCHES: Record<string, Swatch> = {
  "zardosi-machine-embroidery": {
    describes: "a tight metallic satin field, two threads catching the light",
    render: () => <>{satin(15, [4, 10])}</>
  },

  "flat-embroidery": {
    describes: "an even flat fill with its stitch direction running across it",
    render: flat
  },

  "four-beads-machine-work": {
    describes: "beads attaching to a running path, four to a repeat",
    render: beads
  },

  "sequence-work": {
    describes: "perforated discs overlapping in offset rows",
    render: sequins
  },

  "coding-cording-machine": {
    describes: "a laid cord following a curve, couched down at intervals",
    render: () => (
      <>
        {[0, 1, 2].map((n) => {
          const y = 22 + n * 28;
          return (
            <g key={n}>
              <path
                d={`M-6 ${y} C 20 ${y - 20}, 40 ${y + 20}, 60 ${y} S 90 ${y - 18}, 106 ${y}`}
                fill="none"
                stroke={n === 1 ? "var(--brand-accent)" : "currentColor"}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={n === 1 ? 0.95 : 0.6}
              />
              {Array.from({ length: 7 }, (_, i) => {
                const t = i / 6;
                const x = -6 + t * 112;
                const yy = y + Math.sin(t * Math.PI * 2) * -13;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={yy - 6}
                    x2={x}
                    y2={yy + 6}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        })}
      </>
    )
  },

  "chain-multi-machine": {
    describes: "interlocking chain loops, several heads running in parallel",
    render: chain
  },

  "applique-3d-embroidery": {
    describes: "a cut panel laid on cloth, raised, and bound with a satin edge",
    render: () => (
      <>
        <rect x={-2} y={-2} width={104} height={104} fill="currentColor" opacity={0.1} />
        {/* the layer beneath, offset — this is what makes it read as 3D */}
        <path d="M22 30 L74 22 L82 66 L30 76 Z" fill="currentColor" opacity={0.3} />
        <path d="M16 24 L68 16 L76 60 L24 70 Z" fill="currentColor" opacity={0.62} />
        {/* the satin binding around the cut edge */}
        <path
          d="M16 24 L68 16 L76 60 L24 70 Z"
          fill="none"
          stroke="var(--brand-accent)"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {Array.from({ length: 22 }, (_, i) => {
          const t = i / 21;
          return (
            <line
              key={i}
              x1={16 + t * 52}
              y1={24 - t * 8}
              x2={16 + t * 52}
              y2={31 - t * 8}
              stroke="var(--brand-accent)"
              strokeWidth={1.1}
              opacity={0.55}
            />
          );
        })}
      </>
    )
  },

  "cross-stitch": {
    describes: "counted crosses on an even-weave ground",
    render: crosses
  },

  "laser-work": {
    describes: "a cut trace through cloth, with the scorched edge it leaves",
    render: () => (
      <>
        <rect x={-2} y={-2} width={104} height={104} fill="currentColor" opacity={0.14} />
        {/* the cut-away negative space */}
        <path
          d="M50 12 C 74 12, 88 30, 88 50 C 88 70, 74 88, 50 88 C 26 88, 12 70, 12 50 C 12 30, 26 12, 50 12 Z M50 30 C 62 30, 70 39, 70 50 C 70 61, 62 70, 50 70 C 38 70, 30 61, 30 50 C 30 39, 38 30, 50 30 Z"
          fill="var(--kds-swatch-bg, #fff)"
          fillRule="evenodd"
        />
        {/* the burn edge: a fine dashed trace, exactly where the beam ran */}
        <path
          d="M50 12 C 74 12, 88 30, 88 50 C 88 70, 74 88, 50 88 C 26 88, 12 70, 12 50 C 12 30, 26 12, 50 12 Z"
          fill="none"
          stroke="var(--brand-accent)"
          strokeWidth={1.6}
          strokeDasharray="5 3"
        />
        <path
          d="M50 30 C 62 30, 70 39, 70 50 C 70 61, 62 70, 50 70 C 38 70, 30 61, 30 50 C 30 39, 38 30, 50 30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={0.75}
        />
      </>
    )
  },

  tufting: {
    describes: "a dense field of raised loops",
    render: tufts
  },

  "emcad-embroidery-design": {
    describes: "a stitch path on screen: control nodes, handles and the CAD grid",
    register: "machine",
    render: () => (
      <>
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={i * 10} y1={0} x2={i * 10} y2={V} stroke="currentColor" strokeWidth={0.4} opacity={0.28} />
            <line x1={0} y1={i * 10} x2={V} y2={i * 10} stroke="currentColor" strokeWidth={0.4} opacity={0.28} />
          </g>
        ))}
        {/* the path itself */}
        <path
          d="M12 74 C 26 34, 44 26, 56 46 S 78 74, 90 34"
          fill="none"
          stroke="var(--brand-accent)"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        {/* handles, then nodes on top of them */}
        {[
          [12, 74, 26, 34],
          [56, 46, 44, 26],
          [56, 46, 68, 66],
          [90, 34, 78, 74]
        ].map(([x1, y1, x2, y2]) => (
          <g key={`${x1}-${y1}-${x2}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={0.9} opacity={0.6} />
            <circle cx={x2} cy={y2} r={2} fill="currentColor" opacity={0.6} />
          </g>
        ))}
        {[
          [12, 74],
          [56, 46],
          [90, 34]
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3.4} y={y - 3.4} width={6.8} height={6.8} fill="var(--kds-swatch-bg, #fff)" stroke="currentColor" strokeWidth={1.6} />
        ))}
      </>
    )
  }
};

export type SwatchSlug = keyof typeof STITCH_SWATCHES;

export function hasSwatch(slug: string): slug is SwatchSlug {
  return slug in STITCH_SWATCHES;
}

/**
 * One swatch, at whatever size its container gives it.
 *
 * Decorative by default: the technique is always named in text beside it, so
 * announcing the drawing as well would make a screen reader read the course
 * name twice. Pass `label` only where the swatch genuinely stands alone.
 */
export function StitchSwatch({
  slug,
  className,
  label
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const swatch = STITCH_SWATCHES[slug];
  if (!swatch) return null;

  return (
    <span
      className={cn("swatch", swatch.register === "machine" && "is-machine", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" })}
    >
      <svg viewBox={`0 0 ${V} ${V}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        {swatch.render()}
      </svg>
    </span>
  );
}
