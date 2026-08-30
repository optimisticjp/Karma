import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { techniqueChips } from "@/content/collections";
import { courseBySlug } from "@/content/courses";
import type { ManagedGalleryItem } from "@/lib/content/public";

/**
 * Student work, as an editorial grid rather than a carousel.
 *
 * No carousel anywhere: essential content behind a swipe is content most
 * people never see, and it costs JS to hide it. Every piece is on the page.
 *
 * Each entry carries the four things that make a gallery useful to someone
 * choosing what to learn — the technique, the course it came from, the
 * technical note, and what the piece demonstrates — instead of a picture and
 * a title. The piece links to its course, because "I want to make that" is the
 * most common reason anyone looks at a gallery at all.
 *
 * Sample entries are shoot-list rows, and they say so: the photo slot names
 * the shot that is planned and the card carries a visible <SampleTag />.
 */
export function WorkLedger({ items }: { items: ManagedGalleryItem[] }) {
  const t = useTranslations("proof.work");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <ul className="work-grid">
      {items.map((g, i) => {
        const chip = techniqueChips[g.technique];
        const course = g.courseSlug ? courseBySlug(g.courseSlug) : undefined;
        return (
          <Reveal as="li" key={`${g.titleEn}-${i}`} delay={(i % 3) * 60} className="work-item">
            <div className="work-media">
              <ManagedPhoto
                src={g.mediaUrl}
                label={g.photoLabel}
                ratio={g.ratio}
                className="rounded-none border-0"
              />
              {chip ? (
                <span className="chip work-chip">{gu ? chip.labelGu : chip.labelEn}</span>
              ) : null}
            </div>
            <div className="work-body">
              <h3 className="work-title">{gu ? g.titleGu : g.titleEn}</h3>
              <p className="work-note">{gu ? g.noteGu : g.noteEn}</p>
              {g.outcomeEn ? (
                <p className="work-outcome">
                  <span className="work-outcome-label">{t("demonstrates")}</span>
                  {gu ? g.outcomeGu : g.outcomeEn}
                </p>
              ) : null}
              {course ? (
                <p className="work-course">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="stitch-link inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
                  >
                    {gu ? course.nameGu : course.nameEn}
                    <Icon name="arrow" size={15} className="arrow" />
                  </Link>
                </p>
              ) : null}
              {g.sample ? (
                <p className="mt-3">
                  <SampleTag />
                </p>
              ) : null}
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
