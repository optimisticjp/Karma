import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The canonical stitch language.
 *
 * Six marks, six meanings, and no seventh. Before this file the site had a
 * running stitch (<StitchPath>) and then improvised: a dot here, a crosshair
 * there, a dashed border somewhere else, each meaning whatever the page needed
 * that day. Scattered technical marks read as decoration, and decoration is
 * exactly what this brand is not allowed to be.
 *
 *   running stitch      progress / connection        <StitchRule>, <StitchPath>
 *   thread path         process / transformation     <StitchPath preset="hook">
 *   knot point          decision / completion        <KnotPoint>
 *   registration point  precision / reference        <RegistrationPoint>
 *   broken path         failure / production problem <BrokenPath>
 *   thread tail         editorial finish, sparing    <ThreadTail>
 *
 * Use a mark because it MEANS that thing. A registration mark next to a phone
 * number is noise; a registration mark next to "the design lands where the
 * design said it would" is the brand speaking. `STITCH_SEMANTICS` below is
 * exported so the meanings are testable rather than merely documented.
 */

export const STITCH_SEMANTICS = {
  "running-stitch": "progress / connection",
  "thread-path": "process / transformation",
  "knot-point": "decision / completion",
  "registration-point": "precision / reference",
  "broken-path": "failure / production problem",
  "thread-tail": "editorial finish, used sparingly"
} as const;

export type StitchSemantic = keyof typeof STITCH_SEMANTICS;

type Tone = "vermilion" | "needle" | "zari" | "line" | "carbon" | "ivory";

const TONE_VAR: Record<Tone, string> = {
  vermilion: "var(--color-vermilion)",
  needle: "var(--color-needle)",
  zari: "var(--color-zari)",
  line: "var(--color-line)",
  carbon: "var(--color-carbon)",
  ivory: "var(--color-ivory)"
};

const toneStyle = (tone: Tone) => ({ "--mark-color": TONE_VAR[tone] }) as CSSProperties;

/**
 * Decision / completion. The stitch stops here on purpose: an admission
 * confirmed, a course chosen, a design signed off.
 */
export function KnotPoint({
  size = 14,
  tone = "vermilion",
  className
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("stitch-mark", className)} style={toneStyle(tone)}>
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" focusable="false">
        <circle cx="8" cy="8" r="6.2" stroke="var(--mark-color)" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2.6" fill="var(--mark-color)" />
      </svg>
    </span>
  );
}

/**
 * Precision / reference. The mark a machine aligns to. Reserved for claims
 * about accuracy and placement — never used as a bullet point.
 */
export function RegistrationPoint({
  size = 16,
  tone = "needle",
  className
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("stitch-mark", className)} style={toneStyle(tone)}>
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" focusable="false">
        <circle cx="8" cy="8" r="4.6" stroke="var(--mark-color)" strokeWidth="1.3" />
        <path d="M8 0v4M8 12v4M0 8h4M12 8h4" stroke="var(--mark-color)" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8" cy="8" r="0.9" fill="var(--mark-color)" />
      </svg>
    </span>
  );
}

/**
 * Failure / production problem. The interrupted seam: thread break, wrong
 * density, a design that ran fine on screen and not on the machine. This is
 * the mark the Machine Notes archive is built on.
 */
export function BrokenPath({
  width = 96,
  tone = "vermilion",
  className
}: {
  width?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("stitch-mark stitch-mark--broken", className)}
      style={{ ...toneStyle(tone), width } as CSSProperties}
    >
      <svg viewBox="0 0 96 12" preserveAspectRatio="none" fill="none" focusable="false">
        <path
          d="M0 6h34"
          stroke="var(--mark-color)"
          strokeWidth="2"
          strokeDasharray="9 6"
          strokeLinecap="butt"
        />
        <path
          d="M62 6h34"
          stroke="var(--mark-color)"
          strokeWidth="2"
          strokeDasharray="9 6"
          strokeLinecap="butt"
        />
        {/* the frayed ends — this is what makes it a break, not a gap */}
        <path
          d="M34 6l6-4M34 6l6 4M62 6l-6-4M62 6l-6 4"
          stroke="var(--mark-color)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Editorial finish. A short loose end after a closing line. Used sparingly —
 * if it appears twice on a screen it has stopped meaning anything.
 */
export function ThreadTail({
  width = 56,
  tone = "zari",
  className
}: {
  width?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("stitch-mark stitch-mark--tail", className)}
      style={{ ...toneStyle(tone), width } as CSSProperties}
    >
      <svg viewBox="0 0 56 16" preserveAspectRatio="none" fill="none" focusable="false">
        <path
          d="M0 8h22"
          stroke="var(--mark-color)"
          strokeWidth="2"
          strokeDasharray="9 6"
          strokeLinecap="butt"
        />
        <path
          d="M22 8c8 0 10 5 18 5 6 0 10-3 16-5"
          stroke="var(--mark-color)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
