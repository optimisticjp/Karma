import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import { techniqueChips } from "@/content/collections";
import { getPublicGallery } from "@/lib/content/public";

/** Published, consent-gated student work replaces the labelled sample strip. */
export async function WorkStrip() {
  const [t, locale, galleryItems] = await Promise.all([
    getTranslations("home.work"),
    getLocale(),
    getPublicGallery()
  ]);

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <Link href="/student-work" className="stitch-link mb-1 font-semibold text-vermilion-deep">
            {t("seeAll")} →
          </Link>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto pb-4" tabIndex={0} aria-label={t("h2")}>
        <ul className="container-site flex snap-x snap-mandatory gap-4">
          {galleryItems.map((g) => {
            const chip = techniqueChips[g.technique];
            return (
              <li key={g.titleEn} className="w-64 flex-none snap-start md:w-72">
                <div className="card card-lift h-full overflow-hidden">
                  <div className="relative">
                    <ManagedPhoto src={g.mediaUrl} label={g.photoLabel} ratio={g.ratio} className="card-img media-unveil rounded-none border-0" />
                    <span className="chip absolute left-3 top-3">
                      {locale === "gu" ? chip?.labelGu : chip?.labelEn}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{locale === "gu" ? g.titleGu : g.titleEn}</p>
                    <p className="text-smallmeta text-stone">{locale === "gu" ? g.noteGu : g.noteEn}</p>
                    {g.sample ? <p className="mt-2"><SampleTag /></p> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
