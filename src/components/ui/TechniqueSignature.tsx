import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Eleven technique signatures — one per course.
 *
 * WHY THESE EXIST
 * ---------------
 * The catalogue has eleven courses and, today, zero photographs. The honest
 * options were an empty grid, stock photography (banned), or a drawn mark that
 * describes the technique without pretending to be a photograph of Karma's
 * work. This is the third. When the eight photographed courses get their real
 * frames the signature stays as the secondary mark; for the three courses the
 * shoot does not cover, it is the primary one.
 *
 * WHAT A SIGNATURE IS ALLOWED TO SAY
 * ----------------------------------
 * It describes the STRUCTURE of a stitch — beads attaching to a path, loops
 * rising off a baseline, nodes becoming a stitch path. It never carries a
 * number. No RPM, no density figure, no machine model, no coordinates. A
 * drawing that invents a specification is the same lie as a stock photo, just
 * harder to spot.
 *
 * MOTION
 * ------
 * Level 2 (niche microinteraction): the signature builds itself ONCE, on first
 * reveal, and then stops. There is no idle loop anywhere in this file. The
 * initial hidden state is `.js`-gated and the whole thing is inert under
 * `prefers-reduced-motion`, so the final state is what a visitor sees if JS
 * never runs or motion is turned down. Geometry and CSS live in
 * `src/app/machine-lab.css` under "technique signatures".
 */

type SigTone = "needle" | "vermilion" | "zari" | "carbon";

const TONE_VAR: Record<SigTone, string> = {
  needle: "var(--color-needle)",
  vermilion: "var(--color-vermilion)",
  zari: "var(--color-zari)",
  carbon: "var(--color-carbon)"
};

/** Stagger index for the build-once animation. */
const step = (i: number) => ({ "--sig-i": i }) as CSSProperties;

/* ------------------------------------------------------------------ *
 * Geometry helpers. Generated rather than hand-typed so a field of 9
 * parallel satin stitches cannot drift out of alignment in a diff.
 * ------------------------------------------------------------------ */

function satinField(count: number, accentAt: number): ReactNode {
  const items: ReactNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = 24 + (i * 112) / (count - 1);
    // The field is lens-shaped: stitches are longest in the middle.
    const bow = Math.sin((i / (count - 1)) * Math.PI) * 6;
    items.push(
      <path
        key={x}
        className={cn("sig-el sig-el--draw", i === accentAt && "sig-el--accent")}
        style={step(i)}
        pathLength={100}
        d={`M${x} ${26 - bow} V ${70 + bow}`}
      />
    );
  }
  return <>{items}</>;
}

function crossField(): ReactNode {
  const items: ReactNode[] = [];
  let i = 0;
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = 26 + col * 27;
      const y = 32 + row * 30;
      items.push(
        <path
          key={`${row}-${col}`}
          className="sig-el sig-el--draw"
          style={step(i)}
          pathLength={100}
          d={`M${x - 9} ${y - 9} l18 18 M${x + 9} ${y - 9} l-18 18`}
        />
      );
      i += 1;
    }
  }
  return <>{items}</>;
}

/* ------------------------------------------------------------------ *
 * The eleven signatures. Keyed by course slug; the key set is asserted
 * against src/content/courses.ts in tests/machine-lab-system.test.ts.
 * ------------------------------------------------------------------ */

type Signature = {
  /** One line describing what is drawn — kept in step with the master plan. */
  description: string;
  tone: SigTone;
  render: () => ReactNode;
};

export const TECHNIQUE_SIGNATURES: Record<string, Signature> = {
  "zardosi-machine-embroidery": {
    description: "tight parallel metallic satin field with one restrained zari highlight",
    tone: "zari",
    render: () => (
      <>
        <path className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} d="M18 22 C 60 14 100 14 142 22" />
        <path className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} d="M18 74 C 60 82 100 82 142 74" />
        {satinField(9, 4)}
      </>
    )
  },

  "flat-embroidery": {
    description: "precise running field with clean, deliberate direction changes",
    tone: "needle",
    render: () => (
      <>
        <path
          className="sig-el sig-el--draw sig-el--stitched"
          style={step(0)}
          pathLength={100}
          d="M16 74 H 58 V 38 H 102 V 68 H 144"
        />
        <circle className="sig-el sig-el--attach" style={step(1)} cx="58" cy="74" r="2.4" />
        <circle className="sig-el sig-el--attach" style={step(2)} cx="58" cy="38" r="2.4" />
        <circle className="sig-el sig-el--attach" style={step(3)} cx="102" cy="38" r="2.4" />
        <circle className="sig-el sig-el--attach" style={step(4)} cx="102" cy="68" r="2.4" />
      </>
    )
  },

  "four-beads-machine-work": {
    description: "bead nodes attaching sequentially to a path",
    tone: "vermilion",
    render: () => (
      <>
        <path className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} d="M14 74 C 54 74 62 28 146 22" />
        <circle className="sig-el sig-el--attach" style={step(1)} cx="34" cy="72.5" r="6" />
        <circle className="sig-el sig-el--attach" style={step(2)} cx="60" cy="60" r="6" />
        <circle className="sig-el sig-el--attach" style={step(3)} cx="90" cy="38" r="6" />
        <circle className="sig-el sig-el--attach" style={step(4)} cx="122" cy="26" r="6" />
      </>
    )
  },

  "sequence-work": {
    description: "overlapping perforated discs, one restrained reflective shift",
    tone: "needle",
    render: () => (
      <>
        {[30, 58, 86, 114, 142].map((cx, i) => (
          <g key={cx}>
            <circle className="sig-el sig-el--settle" style={step(i)} cx={cx} cy="48" r="15" />
            <circle className="sig-el sig-el--settle sig-el--ground" style={step(i)} cx={cx} cy="48" r="3" />
          </g>
        ))}
        {/* the single reflective highlight — one disc, not five */}
        <path className="sig-el sig-el--sheen sig-el--accent" style={step(5)} d="M80 38 A 15 15 0 0 0 80 58" />
      </>
    )
  },

  "coding-cording-machine": {
    description: "a thicker cord following one curved Bezier path",
    tone: "vermilion",
    render: () => (
      <>
        <path className="sig-el sig-el--draw sig-el--cord" style={step(0)} pathLength={100} d="M12 62 C 44 62 44 24 80 24 S 116 62 148 62" />
        <path className="sig-el sig-el--draw sig-el--cord" style={step(1)} pathLength={100} d="M12 72 C 44 72 44 34 80 34 S 116 72 148 72" />
        <path className="sig-el sig-el--draw sig-el--ground" style={step(2)} pathLength={100} d="M12 67 C 44 67 44 29 80 29 S 116 67 148 67" />
      </>
    )
  },

  "chain-multi-machine": {
    description: "linked loop construction over a second line of rhythm",
    tone: "needle",
    render: () => (
      <>
        {[28, 52, 76, 100, 124].map((x, i) => (
          <rect
            key={x}
            className="sig-el sig-el--draw"
            style={step(i)}
            pathLength={100}
            x={x}
            y="24"
            width="30"
            height="20"
            rx="10"
          />
        ))}
        {[34, 58, 82, 106, 130].map((x, i) => (
          <rect
            key={x}
            className="sig-el sig-el--draw sig-el--ground"
            style={step(i + 1)}
            pathLength={100}
            x={x}
            y="56"
            width="24"
            height="16"
            rx="8"
          />
        ))}
      </>
    )
  },

  "applique-3d-embroidery": {
    description: "a raised border over a cut edge",
    tone: "vermilion",
    render: () => (
      <>
        <rect className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} x="20" y="20" width="104" height="52" rx="6" />
        <rect className="sig-el sig-el--draw" style={step(1)} pathLength={100} x="36" y="30" width="104" height="52" rx="6" />
        <path className="sig-el sig-el--draw sig-el--accent" style={step(2)} pathLength={100} d="M36 30 L 20 20 M140 30 L 124 20 M36 82 L 20 72" />
      </>
    )
  },

  "cross-stitch": {
    description: "a restrained crossing-stitch lattice",
    tone: "needle",
    render: () => crossField()
  },

  "laser-work": {
    description: "a precise trace, then one clean cut edge — no sparks",
    tone: "carbon",
    render: () => (
      <>
        <path
          className="sig-el sig-el--draw sig-el--stitched"
          style={step(0)}
          pathLength={100}
          d="M28 24 H 132 V 72 H 28 Z"
        />
        <path className="sig-el sig-el--draw sig-el--accent" style={step(1)} pathLength={100} d="M80 8 V 22" />
        <path className="sig-el sig-el--draw" style={step(2)} pathLength={100} d="M28 48 H 72" />
        <path className="sig-el sig-el--draw" style={step(2)} pathLength={100} d="M88 48 H 132" />
      </>
    )
  },

  tufting: {
    description: "loops rising from a baseline",
    tone: "vermilion",
    render: () => (
      <>
        <path className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} d="M14 76 H 146" />
        {[
          [26, 30],
          [50, 44],
          [74, 52],
          [98, 40],
          [122, 26]
        ].map(([x, h], i) => (
          <path
            key={x}
            className="sig-el sig-el--rise"
            style={step(i + 1)}
            d={`M${x} 76 V ${76 - h} a 9 9 0 0 1 18 0 V 76`}
          />
        ))}
      </>
    )
  },

  "emcad-embroidery-design": {
    description: "vector nodes, then handles, then the stitch path they produce",
    tone: "needle",
    render: () => (
      <>
        <path className="sig-el sig-el--draw sig-el--ground" style={step(0)} pathLength={100} d="M20 72 C 56 72 60 24 140 24" />
        <path className="sig-el sig-el--draw sig-el--handle" style={step(1)} pathLength={100} d="M20 72 H 58 M140 24 H 100" />
        <rect className="sig-el sig-el--attach" style={step(2)} x="15" y="67" width="10" height="10" />
        <rect className="sig-el sig-el--attach" style={step(3)} x="135" y="19" width="10" height="10" />
        <circle className="sig-el sig-el--attach sig-el--handle" style={step(2)} cx="58" cy="72" r="3.5" />
        <circle className="sig-el sig-el--attach sig-el--handle" style={step(3)} cx="100" cy="24" r="3.5" />
        <path
          className="sig-el sig-el--draw sig-el--stitched sig-el--accent"
          style={step(4)}
          pathLength={100}
          d="M20 72 C 56 72 60 24 140 24"
        />
      </>
    )
  }
};

export type TechniqueSlug = keyof typeof TECHNIQUE_SIGNATURES;

export function hasTechniqueSignature(slug: string): boolean {
  return slug in TECHNIQUE_SIGNATURES;
}

export function TechniqueSignature({
  slug,
  className,
  /** Off by default: a signature builds itself only where it is the focus. */
  animate = true
}: {
  slug: string;
  className?: string;
  animate?: boolean;
}) {
  const signature = TECHNIQUE_SIGNATURES[slug];
  if (!signature) return null;

  return (
    <span
      aria-hidden="true"
      className={cn("tech-sig", animate && "sig-play", className)}
      style={{ "--sig-accent": TONE_VAR[signature.tone] } as CSSProperties}
    >
      <svg viewBox="0 0 160 96" preserveAspectRatio="xMidYMid meet" fill="none" focusable="false">
        {signature.render()}
      </svg>
    </span>
  );
}
