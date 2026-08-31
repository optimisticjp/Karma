import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { techniqueChips } from "@/content/collections";
import { courseBySlug } from "@/content/courses";
import { pick, pickOptional } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import type { ManagedGalleryItem } from "@/lib/content/public";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleMark } from "@/components/kds/proof";
import { Icon } from "@/components/ui/Icon";

/**
 * What staff have actually published, through Content Desk.
 *
 * THIS AND THE ARCHIVE ARE NOT THE SAME THING, AND MUST NOT BE MERGED
 * ------------------------------------------------------------------
 * The archive above is the six photographs the owner's shoot is for: fixed
 * slots, fixed ratios, no attribution. This is an editable feed with its
 * technique, course, production note and consent metadata intact. Collapsing
 * them would mean either the shoot slots become deletable from an admin
 * screen, or published items lose the metadata that makes them publishable.
 *
 * Each entry carries the four things that make a gallery useful to somebody
 * choosing what to learn — the technique, the course it came from, the
 * technical note and what the piece demonstrates — rather than a picture and a
 * title. The piece links to its course, because "I want to make that" is the
 * most common reason anyone opens a gallery at all.
 *
 * A sample entry is a shoot-list row and says so: the slot names the shot that
 * is planned, and the card carries its own marker.
 */
export function PublishedWork({ items }: { items: ManagedGalleryItem[] }) {
  const t = useTranslations("workPage");
  const tp = useTranslations("proof.work");
  const locale = useLocale() as Locale;

  return (
    <section className="band on-cloth" aria-labelledby="published-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("publishedEyebrow")}</p>
          <h2 id="published-heading" className="t-h2 mt-1.5">
            {t("publishedTitle")}
          </h2>
          <p className="t-lede mt-3">{t("publishedSub")}</p>
        </header>

        {items.length > 0 ? (
          <ul className="cat-grid" role="list">
            {items.map((g, i) => {
              const chip = techniqueChips[g.technique];
              const course = g.courseSlug ? courseBySlug(g.courseSlug) : undefined;
              const outcome = pickOptional(g, "outcome", locale);
              return (
                <li key={`${g.titleEn}-${i}`}>
                  <article className="cat-item">
                    <span className="cat-media">
                      <ManagedPhoto
                        src={g.mediaUrl}
                        label={g.photoLabel}
                        ratio={g.ratio}
                        className="rounded-none border-0"
                      />
                    </span>
                    <h3 className="cat-name t-h4">{pick(g, "title", locale)}</h3>
                    <p className="cat-produces t-meta">{pick(g, "note", locale)}</p>
                    {outcome ? (
                      <p className="t-meta mt-2">
                        <span className="t-micro">{tp("demonstrates")}</span> {outcome}
                      </p>
                    ) : null}
                    <span className="cat-meta t-micro">
                      {chip ? <span>{pick(chip, "label", locale)}</span> : null}
                      {course ? (
                        <Link href={`/courses/${course.slug}`} className="act-quiet ms-auto">
                          {pick(course, "name", locale)}
                          <Icon name="arrow" size={15} className="arrow" />
                        </Link>
                      ) : null}
                    </span>
                    {g.sample ? <SampleMark status="sample" className="mt-3" /> : null}
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Nothing published yet. Not an error and not a gap to fill with
             something borrowed: the archive above says what is coming, and
             this says why there is nothing here. */
          <div className="when-empty">
            <p className="t-h4">{t("publishedEmptyTitle")}</p>
            <p className="t-body mt-2 max-w-[54ch]">{t("publishedEmptyBody")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
