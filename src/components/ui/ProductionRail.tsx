"use client";

import { useId, useState, type ReactNode } from "react";
import { ManifestPhoto } from "./PhotoSlot";
import { MonoNote, StepIndex } from "./MonoNote";
import { StitchPath } from "./StitchPath";
import { cn } from "@/lib/utils";

/**
 * The Screen-to-Stitch production rail.
 *
 * One reusable component for Karma's actual workflow — `01 DESIGN → 02 MACHINE
 * → 03 RESULT` — built so the same pattern later carries a longer chain
 * (SCREEN → SAMPLE → PROBLEM → CORRECTION → OUTPUT) without being rewritten.
 * That is why the stages are a prop rather than three hard-coded panels.
 *
 * WHY IT IS SHAPED LIKE THIS AND NOT LIKE A SLIDER
 * -----------------------------------------------
 * A before/after slider says "it changed". This says what changed and in which
 * order, which is the thing that distinguishes Karma from a coaching centre.
 *
 * Every stage's media is **always visible**, at every width. The tabs control
 * one detail panel and nothing else. That single decision solves the problem
 * a tab/accordion hybrid usually creates: on a phone the rail is simply a
 * vertical story you scroll through, with nothing hidden behind an interaction
 * a thumb has to discover, and on a laptop the same markup reads as a row with
 * one stage explained underneath. No autoplay, no drag requirement, no
 * duplicated DOM for two breakpoints.
 *
 * Motion is Level 2: the connectors lay themselves down once on reveal, and
 * switching a tab is a plain crossfade. The rail is never the page's Level-4
 * moment — the hero is.
 */

export type RailStage = {
  /** Stable key. Also the tab's id root. */
  key: string;
  /** The mono label: DESIGN, MACHINE, RESULT. */
  label: string;
  /** One line under the frame — what this stage *is*. */
  caption: string;
  /** The longer explanation shown in the detail panel when selected. */
  detail: string;
  /**
   * Slot id from the 32-photograph manifest, where the stage has a
   * photograph waiting for it.
   */
  photoId?: string;
  /**
   * A drawn mark, for a stage no photograph is planned for. The B2B chain is
   * a process rather than a photo story and the owner's 32-shot list does not
   * cover it, so those stages carry canonical stitch marks instead — which is
   * honest, where a borrowed frame or an invented "coming soon" slot would
   * not be.
   */
  mark?: ReactNode;
};

export function ProductionRail({
  stages,
  className,
  /** Accessible name for the tablist, e.g. "Production stages". */
  label
}: {
  stages: RailStage[];
  className?: string;
  label: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState(0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = stages.length - 1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i === last ? 0 : i + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i === 0 ? last : i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(last);
    }
  };

  return (
    <div className={cn("rail", className)}>
      <ol className="rail-track" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {stages.map((stage, i) => (
          <li key={stage.key} className={cn("rail-stage", i === active && "is-active")}>
            <button
              type="button"
              role="tab"
              id={`${uid}-tab-${stage.key}`}
              aria-selected={i === active}
              aria-controls={`${uid}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className="rail-tab"
            >
              <StepIndex n={i + 1} className="rail-tab-index" />
              <MonoNote className="rail-tab-label">{stage.label}</MonoNote>
            </button>

            {stage.photoId ? (
              <ManifestPhoto id={stage.photoId} editorial className="rail-media" />
            ) : (
              <span className="rail-media rail-mark">{stage.mark}</span>
            )}
            <p className="rail-caption">{stage.caption}</p>

            {/* The thread between stages: horizontal on a laptop, vertical on a
                phone. Purely decorative, and it lays itself down once. */}
            {i < stages.length - 1 ? (
              <span className="rail-thread" aria-hidden="true">
                <StitchPath preset="run" tone="vermilion" draw className="rail-thread-h" />
                <StitchPath preset="drop" tone="vermilion" from="top" draw className="rail-thread-v" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${stages[active].key}`}
        className="rail-detail"
        tabIndex={0}
      >
        <MonoNote className="rail-detail-label" tone="vermilion">
          {stages[active].label}
        </MonoNote>
        <p className="rail-detail-text">{stages[active].detail}</p>
      </div>
    </div>
  );
}
