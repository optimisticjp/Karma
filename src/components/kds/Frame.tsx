import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { photoSlot, aspectOf, type PhotoSlotSpec } from "@/content/photo-manifest";

/**
 * MACHINE FRAME and the photograph placeholder.
 *
 * THE RULE THAT SHAPES BOTH
 * -------------------------
 * The 32 real photographs do not exist yet. None of them may be substituted
 * with stock, with a generated image, with another institute's work, or with
 * another course's photograph. A labelled empty frame is a visible
 * work-in-progress; a borrowed photograph is a false claim about this business
 * that would outlive the fix.
 *
 * WHAT CHANGED FROM THE OLD PLACEHOLDER
 * -------------------------------------
 * The previous one was a dashed box with a camera icon and a caption, centred.
 * It read as a missing asset, so a page full of them read as a broken page.
 *
 * The addendum's §14 asks for something else: a placeholder that PREVIEWS the
 * intended art direction while remaining unmistakably a placeholder. So this
 * one reserves the photograph's exact aspect ratio from the manifest, carries
 * a faint weave so the frame reads as cloth rather than as a hole, states the
 * shot in the corner the way a contact sheet does, and keeps its slot id
 * visible for the person doing the shoot.
 *
 * Reserving the exact ratio is the part that matters technically: when the
 * real file lands it drops in with **no layout shift at all**, because the box
 * it occupies was already the right shape.
 */

/**
 * A media frame. Square corners — a photograph here is a physical print, not
 * an app avatar — with a hairline and two short registration ticks at one
 * corner. Restrained on purpose: not every image is covered in CAD crosshairs.
 */
export function MachineFrame({
  children,
  className,
  ratio,
  style
}: {
  children: ReactNode;
  className?: string;
  /** e.g. `"4 / 3"`. Omit when the child brings its own intrinsic size. */
  ratio?: string;
  style?: CSSProperties;
}) {
  return (
    <figure
      className={cn("mframe", className)}
      style={ratio ? { aspectRatio: ratio, ...style } : style}
    >
      {children}
    </figure>
  );
}

/**
 * A reserved slot from the 32-shot manifest.
 *
 * `scale` is art direction, not decoration. The addendum's §12 is explicit
 * that the real photographs must be large enough to appreciate, so a frame
 * declares whether it is a lead image or a thumbnail and shows correspondingly
 * more or less of its brief.
 */
export function PhotoFrame({
  id,
  className,
  scale = "feature",
  register = "cloth",
  priority
}: {
  id: string;
  className?: string;
  /** `lead` and `feature` state the brief; `thumb` shows only the slot id. */
  scale?: "lead" | "feature" | "thumb";
  /** `machine` puts the frame on the cool register — screens, files, process. */
  register?: "cloth" | "machine";
  /** Reserved for when real files arrive and the LCP image needs it. */
  priority?: boolean;
}) {
  const slot: PhotoSlotSpec = photoSlot(id);
  const group = slot.id.split("_")[0];

  return (
    <figure
      className={cn("mframe photo-wait", register === "machine" && "is-machine", className)}
      style={{ aspectRatio: aspectOf(slot) } as CSSProperties}
      data-photo-slot={slot.id}
      data-priority={priority ? "" : undefined}
      role="img"
      aria-label={slot.label}
    >
      {/* A contact-sheet mark: which frame this is, in the corner, the way a
          shoot list numbers its shots. */}
      <span className="t-micro" aria-hidden="true">
        {group}
      </span>
      {scale !== "thumb" ? (
        <figcaption className="t-meta max-w-[34ch] leading-snug" aria-hidden="true">
          {slot.label}
          {scale === "lead" ? (
            <span className="t-meta mt-1 block opacity-75">{slot.altGuidance}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
