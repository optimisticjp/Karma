import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A drawn material swatch, one per course family.
 *
 * The catalogue used to lead with eight empty photo frames, because the studio
 * shoot has not happened. Stock photography is off the table and grey boxes
 * are worse than nothing, so each course leads instead with a plate of the
 * thing it actually teaches: satin rows for machine work, loops and cut edges
 * for the modern techniques, path nodes for emCAD.
 *
 * Deliberately no viewBox. With one, the pattern scaled with the container and
 * a 9px satin pitch rendered as 60px candy stripes; without one, user units
 * are CSS pixels and the tile stays at thread scale however large the panel
 * gets. This is texture, not illustration — it should read as material at a
 * glance and never compete with the type sitting next to it.
 *
 * When real photography arrives, pass it to <PhotoSlot>/<ManagedPhoto> and let
 * this fall back to what it is: a swatch, not a stand-in for a photo.
 */

export type PlateVariant = "machine" | "modern" | "software";

export function TechniquePlate({
  variant,
  className,
  /** Rotates the tile per course so eight plates do not stack identically. */
  seed = 0
}: {
  variant: PlateVariant;
  className?: string;
  seed?: number;
}) {
  const uid = useId().replace(/:/g, "");
  // Never 0: satin is worked at an angle, and a dead-vertical tile reads as
  // ticking stripe rather than thread.
  const angle = [34, 62, 108, 146][seed % 4];

  return (
    <svg
      className={cn("block h-full w-full", className)}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {variant === "machine" ? (
          /* Satin fill: the parallel run of a filled area on the machine. */
          <pattern
            id={uid}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${angle})`}
          >
            <rect width="7" height="7" fill="var(--color-ivory-2)" />
            <path d="M1.5 0v7" stroke="var(--color-vermilion)" strokeWidth="1.6" opacity="0.34" />
            <path d="M4.5 0v7" stroke="var(--color-carbon)" strokeWidth="0.7" opacity="0.14" />
          </pattern>
        ) : null}

        {variant === "modern" ? (
          /* Tufted loops over a cut edge: laser and tufting in one tile. */
          <pattern
            id={uid}
            width="16"
            height="13"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${angle / 6})`}
          >
            <rect width="16" height="13" fill="var(--color-ivory-2)" />
            <path
              d="M1.5 9.5c0-4.5 6-4.5 6 0M9.5 9.5c0-4.5 6-4.5 6 0"
              fill="none"
              stroke="var(--color-vermilion)"
              strokeWidth="1.1"
              opacity="0.34"
            />
            <path d="M0 11.5h16" stroke="var(--color-carbon)" strokeWidth="0.6" opacity="0.12" />
          </pattern>
        ) : null}

        {variant === "software" ? (
          /* Path and nodes: a design still on screen, not yet thread. */
          <pattern id={uid} width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="var(--color-ivory-2)" />
            <path d="M22 0H0v22" fill="none" stroke="var(--color-carbon)" strokeWidth="0.5" opacity="0.13" />
            <path
              d="M0 16C6 16 6 6 11 6s5 10 11 10"
              fill="none"
              stroke="var(--color-vermilion)"
              strokeWidth="1"
              opacity="0.34"
            />
            <rect
              x="9"
              y="4"
              width="4"
              height="4"
              fill="var(--color-card)"
              stroke="var(--color-vermilion)"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </pattern>
        ) : null}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${uid})`} />
    </svg>
  );
}
