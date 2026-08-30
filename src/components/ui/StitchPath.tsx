import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Stitch-path primitives — the brand's one drawn device.
 *
 * "From screen to stitch" is the promise, so the site's connective tissue is
 * a running stitch rather than a plain rule. Every stitched mark on the public
 * site comes from this file so the geometry stays identical everywhere:
 *
 *   stitch length 9 · gap 6 · needle penetration at the head of each stitch
 *
 * Two paths do that. The first strokes the path with a 9/6 dash — the thread
 * on the surface. The second strokes the same path with a zero-length dash and
 * a round cap on the same 15-unit period — a dot exactly where the needle went
 * through. That is what separates this from a dashed border.
 *
 * Reveal is a clip-path wipe on the wrapper, never `stroke-dashoffset`:
 * animating the offset would slide the stitches along the seam instead of
 * laying them down. The wipe is `.js`-gated and disabled under
 * `prefers-reduced-motion`, so the mark is always fully present without JS.
 */

const PRESETS = {
  /** Gentle horizontal seam. Section edges, band joins. */
  seam: { viewBox: "0 0 300 24", d: "M0 12 C 50 2 75 22 125 12 S 200 2 250 12 S 290 18 300 12" },
  /** Straight horizontal run. The default rule. */
  run: { viewBox: "0 0 300 4", d: "M0 2 H 300" },
  /** Vertical drop between stacked steps (mobile process lists). */
  drop: { viewBox: "0 0 24 72", d: "M12 0 C 12 24 4 32 12 48 V 72" },
  /** Step-to-step hook: down, across, up. Desktop process rows. */
  hook: { viewBox: "0 0 120 48", d: "M6 0 C 6 26 14 34 46 36 H 74 C 106 34 114 26 114 0" },
  /** Corner turn, e.g. from a heading into the content it introduces. */
  elbow: { viewBox: "0 0 96 48", d: "M4 0 V 26 C 4 42 12 44 30 44 H 96" }
} as const;

export type StitchPreset = keyof typeof PRESETS;

type Tone = "vermilion" | "needle" | "zari" | "line" | "ivory";

const TONE_VAR: Record<Tone, string> = {
  vermilion: "var(--color-vermilion)",
  needle: "var(--color-needle)",
  zari: "var(--color-zari)",
  line: "var(--color-line)",
  ivory: "var(--color-ivory)"
};

export function StitchPath({
  preset = "run",
  d,
  viewBox,
  tone = "vermilion",
  width = 2,
  from = "left",
  draw = false,
  className,
  style
}: {
  preset?: StitchPreset;
  /** Custom geometry. Requires `viewBox`. */
  d?: string;
  viewBox?: string;
  tone?: Tone;
  width?: number;
  /** Which edge the stitch is laid down from when it reveals. */
  from?: "left" | "top";
  /**
   * Lay the stitch down on scroll. Opt-in, and self-registering: the element
   * carries `.stitch-wipe`, which <UnveilWatcher> observes directly. Nothing
   * depends on a <Reveal> ancestor existing, and the watcher's failsafe means
   * a broken observer shows the finished stitch rather than nothing.
   */
  draw?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const geometry = d && viewBox ? { d, viewBox } : PRESETS[preset];
  const stroke = TONE_VAR[tone];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "stitch-path",
        draw && "stitch-wipe",
        from === "top" && "stitch-path--from-top",
        className
      )}
      style={style}
    >
      <svg viewBox={geometry.viewBox} preserveAspectRatio="xMidYMid meet" fill="none" focusable="false">
        {/* thread on the surface */}
        <path
          d={geometry.d}
          stroke={stroke}
          strokeWidth={width}
          strokeDasharray="9 6"
          strokeLinecap="butt"
        />
        {/* needle penetration at the head of every stitch */}
        <path
          d={geometry.d}
          stroke={stroke}
          strokeWidth={width * 1.6}
          strokeDasharray="0.01 15"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Full-width horizontal running stitch — the plain rule, and the case most
 * pages want.
 *
 * Drawn in CSS rather than by <StitchPath>. A stretched SVG maps a fixed
 * viewBox onto an arbitrary width, which squashes the 9/6 stitch and slides
 * the needle dots off the stitch heads: at 144px wide the spec geometry came
 * out as 4.3px stitches with dots every 7.2px, i.e. not the spec at all.
 * Two tiled backgrounds hold 9px stitch, 6px gap and a penetration dot at
 * every stitch head at exact CSS-pixel scale, at any width.
 */
export function StitchRule({
  tone = "vermilion",
  draw = false,
  className
}: {
  tone?: Tone;
  draw?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("stitch-rule", draw && "stitch-wipe", className)}
      style={{ "--stitch-color": TONE_VAR[tone] } as CSSProperties}
    />
  );
}

/**
 * The same running stitch, vertical — one continuous thread down a column.
 *
 * A rotated <StitchRule> would work geometrically and then break the moment
 * anything inside it needed to stay upright, so the rail is drawn directly
 * with the same 9/6 stitch and the same penetration dot at every stitch head.
 * It is the piece that lets a composition claim ONE thread rather than three
 * disconnected connectors: it spans the whole track and the frames sit on it.
 */
export function StitchRail({
  tone = "vermilion",
  draw = false,
  className
}: {
  tone?: Tone;
  draw?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("stitch-rail", draw && "stitch-wipe stitch-path--from-top", className)}
      style={{ "--stitch-color": TONE_VAR[tone] } as CSSProperties}
    />
  );
}
