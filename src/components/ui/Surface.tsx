import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Surface: the one definition of "a raised reading area".
 *
 * Four tones, deliberately few. `paper` is the default reading surface;
 * `raw` is the warm band used to group without framing; `quiet` is a bordered
 * area that keeps the page background; `machine` is the dark technical panel
 * for specifications and machine detail. Anything that wants a fifth tone is
 * usually a page inventing its own system.
 */
export function Surface({
  as: Tag = "div",
  tone = "paper",
  feature = false,
  className,
  children
}: {
  as?: ElementType;
  tone?: "paper" | "quiet" | "raw" | "machine";
  /** Larger radius and padding: use for one moment per page, not per card. */
  feature?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "surface",
        tone === "quiet" && "surface-quiet",
        tone === "raw" && "surface-raw",
        tone === "machine" && "surface-machine",
        feature && "surface-feature",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A note held by a thread down its left edge rather than boxed in. Used for
 * caveats, machine notes and "what this does not include" copy, where a full
 * card would over-promote the aside above the thing it qualifies.
 */
export function SeamNote({
  accent = false,
  className,
  children
}: {
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("seam-note", accent && "seam-note-accent", className)}>{children}</div>
  );
}
