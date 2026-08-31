import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { photosInGroup } from "@/content/photo-manifest";
import { PhotoFrame } from "@/components/kds/Frame";
import { Icon } from "@/components/ui/Icon";

/**
 * THE PROOF WALL — student work and the floor it was made on, in one bento.
 *
 * WHY A BENTO AND NOT A GRID
 * --------------------------
 * The six work photographs are at THREE different aspect ratios, deliberately:
 * a bridal panel is portrait, a dupatta is square, a screen-and-result pair is
 * wide. Normalising them into six identical tiles throws away the one thing
 * worth showing about textile work — that these are different objects, made of
 * different material, at different scales.
 *
 * A bento is the shape that lets each keep its own ratio and still read as one
 * wall, and it is the addendum's §16 named use for the pattern: content that
 * is genuinely heterogeneous. The studio panorama anchors it, because a wide
 * shot of the floor is the single most convincing thing on this page for
 * somebody deciding whether a real place exists.
 *
 * WHAT IS AND IS NOT CLAIMED
 * --------------------------
 * These frames are Karma's own work, shot at the studio. Until the files
 * exist the frames are honestly empty and state the shot they are waiting for.
 * Nothing is borrowed, generated, or captioned with a student's name, outcome
 * or earning — attributed proof goes through the consent gates, and this wall
 * deliberately makes no attributed claim at all.
 */
export function ProofWall() {
  const t = useTranslations("home.wall");
  const work = photosInGroup("work");

  return (
    <section className="band on-canvas" aria-labelledby="wall-heading">
      <div className="wrap">
        <header className="wall-head">
          <div className="max-w-prose">
            <p className="t-micro">{t("eyebrow")}</p>
            <h2 id="wall-heading" className="t-h2 mt-1.5">
              {t("h2")}
            </h2>
            <p className="t-lede mt-3">{t("sub")}</p>
          </div>
          <Link href="/student-work" className="act-quiet wall-more">
            {t("cta")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </header>

        {/* The floor, wide, anchoring the wall: for somebody deciding whether
            a real place exists, one honest wide shot of the machine floor does
            more than six close-ups of finished work. */}
        <div className="wall-lead">
          <PhotoFrame id="F1_STUDIO_FLOOR_WIDE" scale="lead" />
        </div>

        {/* Masonry, not a grid of equal tiles. The six pieces are at three
            different ratios on purpose — a bridal panel is portrait, a dupatta
            square, a screen-and-result pair wide — and columns pack them
            without cropping a single one to fit a cell. Each frame names the
            photograph it is holding, so the wall reads as a shoot list until
            the shoot happens. */}
        <div className="wall-masonry">
          {work.map((slot) => (
            <figure key={slot.id} className="wall-piece">
              <PhotoFrame id={slot.id} scale="thumb" />
              <figcaption className="t-meta mt-2">{slot.label}</figcaption>
            </figure>
          ))}
        </div>

        <p className="t-meta mt-4">{t("pending")}</p>
      </div>
    </section>
  );
}
