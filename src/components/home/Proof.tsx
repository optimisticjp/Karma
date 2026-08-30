import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Icon } from "@/components/ui/Icon";
import { techniqueChips } from "@/content/collections";
import { getPublicGallery, getPublicStories } from "@/lib/content/public";
import { waLink } from "@/lib/site";

/**
 * Proof: finished pieces and student outcomes, in one section.
 *
 * These used to be two sections stacked on top of each other. With nothing
 * published yet that meant two near-identical "not published yet" blocks and
 * 700px of homepage spent saying "we have nothing to show" twice. Whatever is
 * published now leads; when neither is, one honest line covers both and the
 * space goes to an action instead.
 */
export async function Proof() {
  const [t, tw, ts, tc, locale, gallery, stories] = await Promise.all([
    getTranslations("home.proof"),
    getTranslations("home.work"),
    getTranslations("home.stories"),
    getTranslations("common"),
    getLocale(),
    getPublicGallery(),
    getPublicStories()
  ]);
  const gu = locale === "gu";
  const pieces = gallery.filter((g) => !g.sample);
  const said = stories.filter((s) => !s.sample);
  const hasAny = pieces.length > 0 || said.length > 0;

  return (
    <section className="section-compact bg-sand">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={hasAny ? tw("h2") : t("emptyTitle")} sub={hasAny ? tw("sub") : undefined} />
          {pieces.length > 0 ? (
            <Link
              href="/student-work"
              className="stitch-link mb-1 inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
            >
              {tw("seeAll")} <Icon name="arrow" size={16} className="arrow" />
            </Link>
          ) : null}
        </div>

        {pieces.length > 0 ? (
          <ul className="u-section-body grid grid-cols-2 gap-4 md:grid-cols-4">
            {pieces.slice(0, 4).map((g) => {
              const chip = techniqueChips[g.technique];
              return (
                <li key={g.titleEn} className="card card-lift overflow-hidden">
                  <div className="relative">
                    <ManagedPhoto
                      src={g.mediaUrl}
                      label={g.photoLabel}
                      ratio={g.ratio}
                      className="card-img rounded-none border-0"
                    />
                    <span className="chip absolute left-2 top-2">
                      {gu ? chip?.labelGu : chip?.labelEn}
                    </span>
                  </div>
                  <p className="p-3 text-smallmeta font-semibold">
                    {gu ? g.titleGu : g.titleEn}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}

        {said.length > 0 ? (
          <div className="u-section-body grid gap-4 md:grid-cols-2">
            {said.slice(0, 2).map((s, i) => (
              <figure key={`${s.nameEn}-${i}`} className="card p-5 md:p-6">
                <blockquote className="font-display text-h4 leading-snug">
                  “{gu ? s.quoteGu : s.quoteEn}”
                </blockquote>
                <figcaption className="mt-3 text-smallmeta text-stone">
                  <span className="font-bold text-carbon">{gu ? s.nameGu : s.nameEn}</span>
                  {" · "}
                  {gu ? s.courseGu : s.courseEn}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        {/* Neither published: say it once, plainly, and give the visitor the
            thing that actually works instead — coming to look. */}
        {!hasAny ? (
          <div className="u-section-body feature-surface grid gap-5 p-5 md:grid-cols-[1.3fr_0.7fr] md:items-center md:gap-8 md:p-6">
            <p className="text-stone">{t("emptyBody")}</p>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </a>
              <Link href="/contact" className="btn btn-secondary">
                {ts("visitCta")}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
