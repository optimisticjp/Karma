import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { aspectOf, photoSlot, type PhotoSlotSpec } from "@/content/photo-manifest";

const ratios: Record<string, string> = {
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  free: "h-full w-full"
};

/**
 * Honest placeholder for photography (no-ghost-content rule). NEVER swap in
 * stock: each slot names its shot on the studio shoot list
 * (docs/content-checklist.md). Editorial slots pass rounded-none via
 * className (spec: 0px radius for editorial images, 12-16px for cards).
 *
 * Prefer <ManifestPhoto> for anything on the 32-shot list: it reserves the
 * photograph's exact aspect ratio, so the real file drops in without moving
 * the layout.
 */
export function PhotoSlot({
  label,
  ratio = "3/2",
  className
}: {
  label: string;
  ratio?: keyof typeof ratios;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "photo-slot bg-grid flex items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-2 p-6 text-center",
        ratios[ratio],
        className
      )}
    >
      <p className="flex max-w-xs flex-col items-center gap-2 text-smallmeta text-stone">
        <Icon name="camera" size={22} className="text-stone/70" />
        <span>{label}</span>
      </p>
    </div>
  );
}

/**
 * A slot from the 32-photograph manifest.
 *
 * The frame is sized by `aspect-ratio` taken from the shot's intrinsic
 * dimensions, so the placeholder occupies precisely the box the photograph
 * will occupy. That is the whole point of building the redesign before the
 * shoot: when the files arrive, this component starts rendering an <img> and
 * nothing above it has to be re-laid out. Cumulative layout shift stays at
 * zero across the swap.
 *
 * Until then it renders its own id and its shoot brief. A visitor sees an
 * obviously unfinished frame — which is the truth — rather than a photograph
 * of somebody else's embroidery.
 */
export function ManifestPhoto({
  id,
  className,
  /** Editorial frames are square-cornered; cards keep the 12–16px radius. */
  editorial = false,
  /** Suppress the shoot brief where the frame is small (thumbnails, rails). */
  compact = false
}: {
  id: string;
  className?: string;
  editorial?: boolean;
  compact?: boolean;
}) {
  const slot: PhotoSlotSpec = photoSlot(id);

  return (
    <figure
      role="img"
      aria-label={slot.label}
      className={cn(
        "photo-slot bg-grid flex flex-col items-center justify-center overflow-hidden border border-line bg-ivory-2 p-4 text-center",
        editorial ? "rounded-none" : "rounded-xl",
        className
      )}
      style={{ aspectRatio: aspectOf(slot) } as CSSProperties}
      data-photo-slot={slot.id}
    >
      <Icon name="camera" size={compact ? 18 : 22} className="text-stone/70" />
      {!compact && (
        <figcaption className="mt-2 max-w-xs text-smallmeta text-stone">
          <span className="mono-note block text-stone/70">{slot.id.split("_")[0]}</span>
          {slot.label}
        </figcaption>
      )}
    </figure>
  );
}
