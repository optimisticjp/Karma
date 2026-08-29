import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Icon } from "@/components/ui/Icon";
import { techniqueChips } from "@/content/collections";
import { getPublicGallery } from "@/lib/content/public";

/**
 * Published, consent-gated student work.
 *
 * Only real items render: the source fallbacks are labelled shot-list entries,
 * and a horizontal scroller of six empty photo frames reads as a broken page,
 * not as an honest placeholder. Content Desk publishing one piece switches the
 * strip on.
 */
export async function WorkStrip() {
  const [t, locale, all] = await Promise.all([
    getTranslations("home.work"),
    getLocale(),
    getPublicGallery()
  ]);
  const gu = locale === "gu";
  const items = all.filter((g) => !g.sample);

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("h2")} sub={t("sub")} />
          {items.length > 0 ? (
            <Link
              href="/student-work"
              className="stitch-link mb-1 inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
            >
              {t("seeAll")} <Icon name="arrow" size={16} className="arrow" />
            </Link>
          ) : null}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-8 overflow-x-auto pb-4" tabIndex={0} aria-label={t("h2")}>
          <ul className="container-site flex snap-x snap-mandatory gap-4">
            {items.map((g) => {
              const chip = techniqueChips[g.technique];
              return (
                <li key={g.titleEn} className="w-64 flex-none snap-start md:w-72">
                  <div className="card card-lift h-full overflow-hidden">
                    <div className="relative">
                      <ManagedPhoto
                        src={g.mediaUrl}
                        label={g.photoLabel}
                        ratio={g.ratio}
                        className="card-img media-unveil rounded-none border-0"
                      />
                      <span className="chip absolute left-3 top-3">
                        {gu ? chip?.labelGu : chip?.labelEn}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold">{gu ? g.titleGu : g.titleEn}</p>
                      <p className="text-smallmeta text-stone">{gu ? g.noteGu : g.noteEn}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="container-site">
          <p className="pending-block u-section-body max-w-2xl text-smallmeta text-stone">
            <span className="pending-label">{t("pendingLabel")}</span>
            {t("pendingNote")}
          </p>
        </div>
      )}
    </section>
  );
}
