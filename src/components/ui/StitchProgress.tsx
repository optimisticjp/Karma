import { MonoNote, StepIndex } from "./MonoNote";
import { cn } from "@/lib/utils";

/**
 * The admission form's progress line, as a seam being sewn.
 *
 *     01 COURSE ━━━ 02 DETAILS ┅┅┅ 03 TERMS ┅┅┅ 04 DONE
 *
 * Three states, and each one means what it means everywhere else in this
 * system rather than being a new invention for this screen:
 *
 *   done     a finished running stitch — 9 on the surface, 6 off it
 *   current  a needle penetration point: the needle is down, here, now
 *   future   a faint construction line — the seam is planned, not sewn
 *
 * WHY THIS IS NOT A PROGRESS BAR WITH A PERCENTAGE
 * -----------------------------------------------
 * A filling bar says "you are 50% of the way through a chore". A seam says
 * "two of these four are finished and the needle is on the third", which is
 * the same information told in the language of the trade the visitor is
 * signing up to learn. It costs nothing extra to say it that way.
 *
 * ACCESSIBILITY IS UNCHANGED, DELIBERATELY
 * ----------------------------------------
 * The container keeps `role="progressbar"` with its min/max/now and an
 * accessible label, exactly as the plain bar did. The step list itself is
 * `aria-hidden` because it repeats what the label already says, and the form
 * separately announces step changes through its own live region and moves
 * focus to the step heading. None of that was weakened to make this prettier.
 */
export function StitchProgress({
  steps,
  current,
  label,
  className
}: {
  /** Short mono labels: COURSE, DETAILS, TERMS, DONE. */
  steps: string[];
  /** Zero-based index of the step the visitor is on. */
  current: number;
  /** Accessible label, e.g. "Step 2 of 4". */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={Math.min(current + 1, steps.length)}
      aria-label={label}
      className={cn("stitch-progress", className)}
    >
      <ol className="sp-steps" aria-hidden="true">
        {steps.map((step, i) => (
          <li
            key={step}
            className={cn(
              "sp-step",
              i < current && "is-done",
              i === current && "is-current"
            )}
          >
            <span className="sp-seg" />
            <span className="sp-head">
              <StepIndex n={i + 1} className="sp-index" />
              <MonoNote className="sp-label">{step}</MonoNote>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
