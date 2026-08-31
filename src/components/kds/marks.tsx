import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * THREAD LINE, NEEDLE POINT, HOOP WINDOW — the three marks the site repeats.
 *
 * They are here rather than spread across three files because they are one
 * idea: a thread runs, a needle lands, a hoop holds. Keeping them together is
 * what stops a fourth one being invented next month.
 *
 * All three are CSS-driven (see `thread-machine-proof.css` §9) rather than SVG
 * where possible — a repeating background is cheaper than a path, scales to any
 * width without a viewBox, and re-colours from the brand accent for free.
 */

/**
 * THREAD LINE — a running stitch, 9 on / 6 off.
 *
 * The site's one repeated mark, so its geometry is defined once and every
 * other stitched thing in the system (the link underline, the progress bar,
 * the section rule) reuses the same numbers. A mark that means one thing has
 * to look like one thing.
 *
 * `draw` runs it once on mount. It is Level 3 motion — the plan allows one
 * storytelling moment per page, so a page should carry at most one drawn
 * thread. Under `prefers-reduced-motion` it renders complete, not shorter.
 */
export function ThreadLine({
  className,
  tone = "accent",
  draw = false,
  vertical = false
}: {
  className?: string;
  /** `ink` is for a structural rule that is not an accent moment. */
  tone?: "accent" | "ink";
  draw?: boolean;
  vertical?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        vertical ? "thread-v" : "thread",
        tone === "ink" && "thread-ink",
        draw && !vertical && "thread-draw",
        className
      )}
    />
  );
}

/**
 * NEEDLE POINT — where the needle enters.
 *
 * Three states, because a sequence of steps has three: done, current, still to
 * come. Small on purpose — it is a needle, not a bullet, and a 12px dot
 * beside a heading is a decoration rather than a mark.
 */
export function NeedlePoint({
  state = "now",
  className,
  animate = false
}: {
  state?: "done" | "now" | "todo";
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "needle",
        state === "done" && "needle-done",
        state === "todo" && "needle-todo",
        animate && state === "now" && "needle-in",
        className
      )}
    />
  );
}

/**
 * HOOP WINDOW — the embroidery frame as a crop.
 *
 * For a stitch macro, a machine detail, a face. Used OCCASIONALLY: the rule is
 * that not every photograph becomes a circle. A round crop is a strong enough
 * gesture that one per page is the budget, and the double ring is what makes
 * it a hoop rather than a round avatar.
 */
export function HoopWindow({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("hoop", className)}>{children}</span>;
}

/**
 * THREAD PROGRESS — a multi-step form, in stitch logic.
 *
 *   COURSE ━━━ DETAILS ━━━ TERMS ┅┅┅ DONE
 *
 * Completed segments are stitched in ink, the current one in thread, and what
 * is still ahead is a plain construction line. The step names are always
 * rendered as text: the stitching is the second signal, never the only one.
 */
export function ThreadProgress({
  steps,
  current,
  label,
  className
}: {
  steps: string[];
  /** Zero-based index of the step the visitor is on. */
  current: number;
  /** Names the whole control for assistive tech, e.g. "Admission form". */
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <ol className="progress">
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "now" : "todo";
          return (
            <li
              key={step}
              className="flex min-w-0 flex-1 items-center gap-2 last:flex-none"
              aria-current={state === "now" ? "step" : undefined}
            >
              <NeedlePoint state={state} />
              <span
                className={cn(
                  "t-micro truncate",
                  state === "todo" && "opacity-60"
                )}
              >
                {step}
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "progress-seg",
                    state === "done" && "is-done",
                    state === "now" && "is-now"
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {/* The state in words, for anyone who cannot see the stitching. */}
      <p className="sr-only">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
    </nav>
  );
}
