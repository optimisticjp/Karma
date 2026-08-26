import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SampleTag } from "@/components/ui/SampleTag";
import { galleryItems, techniqueChips } from "@/content/collections";

/** Horizontal scroll-snap strip of student work (plan 9.1 section 6). */
export function WorkStrip() {
  const t = useTranslations("home.work");
  const locale = useLocale();

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
                    <PhotoSlot label={g.photoLabel} ratio="4/5" className="card-img rounded-none border-0" />
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
