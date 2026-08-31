import { useTranslations } from "next-intl";
import { photosInGroup } from "@/content/photo-manifest";
import { PhotoFrame } from "@/components/kds/Frame";

/**
 * THE ARCHIVE — the six reserved work photographs, at their real ratios.
 *
 * Masonry, not a tile grid. The six pieces are at three different ratios on
 * purpose: a bridal panel is portrait, a dupatta is square, a screen-and-result
 * pair is wide. Cropping them into identical cells throws away the one thing
 * worth showing about textile work — that these are different objects, made of
 * different material, at different scales.
 *
 * Each frame reserves its photograph's exact box and names the shot it is
 * waiting for, so the wall reads as a shoot list until the shoot happens and
 * **nothing moves when the files land**. Nothing here is borrowed, generated,
 * or captioned with a student's name, outcome or earning: attributed proof
 * goes through the consent gates, and this wall makes no attributed claim.
 */
export function WorkWall() {
  const t = useTranslations("workPage");
  const work = photosInGroup("work");

  return (
    <section className="band on-canvas" aria-labelledby="archive-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("archiveEyebrow")}</p>
          <h2 id="archive-heading" className="t-h2 mt-1.5">
            {t("archiveTitle")}
          </h2>
          <p className="t-lede mt-3">{t("archiveSub")}</p>
        </header>

        <div className="wall-masonry mt-7">
          {work.map((slot) => (
            <figure key={slot.id} className="wall-piece">
              <PhotoFrame id={slot.id} scale="thumb" />
              <figcaption className="t-meta mt-2">{slot.label}</figcaption>
            </figure>
          ))}
        </div>

        <p className="t-meta mt-4">{t("archivePending")}</p>
      </div>
    </section>
  );
}
