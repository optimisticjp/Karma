import { Reveal } from "@/components/ui/Reveal";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { RegistrationPoint } from "@/components/ui/StitchMark";
import { photosInGroup } from "@/content/photo-manifest";
import { cn } from "@/lib/utils";

/**
 * The material wall — six pieces, six shapes.
 *
 * WHY A WALL AND NOT A GRID
 * -------------------------
 * A uniform grid of six identical tiles is what a stock-photo site does, and
 * it flattens the one thing that makes textile work worth showing: a bridal
 * zardosi panel is tall, a dupatta is square, a screen-and-result pair is
 * wide. The manifest already carries each shot's real dimensions, so every
 * frame asks for its own ratio. It is a mixed-ratio editorial wall today with
 * placeholders and stays exactly that wall when the six photographs land —
 * no relayout, no cumulative layout shift.
 *
 * THE REGISTRATION MARK
 * ---------------------
 * Exactly one frame carries one. A registration mark means "precision /
 * reference" in this system, so it belongs on the anchor piece a visitor's
 * eye lands on first — and nowhere else. Crosshairs on every image is how a
 * technical language turns into wallpaper, and it is why the mark is a prop
 * on the wall rather than a decoration inside `<ManifestPhoto>`.
 *
 * WHAT IS NOT CLAIMED
 * -------------------
 * These are Karma's own pieces, shot at the studio. Until they exist the
 * frames are honestly empty and say what they are waiting for. Nothing is
 * borrowed, generated, or captioned with a student's name, outcome or
 * earning — attributed proof goes through Content Desk's consent gates, and
 * this wall deliberately makes no attributed claim at all.
 */
export function MaterialWall({
  className,
  /** Index of the single frame that carries the registration mark. */
  anchorAt = 0
}: {
  className?: string;
  anchorAt?: number;
}) {
  const pieces = photosInGroup("work");

  return (
    <ul className={cn("work-wall", className)}>
      {pieces.map((piece, i) => (
        <Reveal as="li" key={piece.id} delay={i * 40} className="work-wall-item">
          <ManifestPhoto id={piece.id} editorial />
          {i === anchorAt ? (
            <RegistrationPoint size={18} tone="vermilion" className="work-wall-mark" />
          ) : null}
        </Reveal>
      ))}
    </ul>
  );
}
