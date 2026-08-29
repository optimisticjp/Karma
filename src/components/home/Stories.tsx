import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { getPublicStories } from "@/lib/content/public";

/** Real consented Content Desk stories replace the source sample set as soon
 * as the first one is published. */
export async function Stories() {
  const [t, locale, stories] = await Promise.all([
    getTranslations("home.stories"),
    getLocale(),
    getPublicStories()
  ]);
  const gu = locale === "gu";

  return (
    <section className="section">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("h2")} />
          <Link
            href="/success-stories"
            className="stitch-link mb-1 inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
          >
            {t("seeAll")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>
        <div className="u-section-body grid gap-6 lg:gap-8 md:grid-cols-2">
          {stories.map((s, i) => (
            <Reveal key={`${s.nameEn}-${i}`} delay={i * 80}>
              <figure className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8">
                <ManagedPhoto src={s.mediaUrl} label={s.photoLabel} ratio="4/5" className="hidden sm:block" />
                <div>
                  <blockquote className="font-display text-h4 leading-snug">
                    “{gu ? s.quoteGu : s.quoteEn}”
                  </blockquote>
                  <figcaption className="mt-4 space-y-1 text-smallmeta text-stone">
                    <p className="font-bold text-carbon">{gu ? s.nameGu : s.nameEn}</p>
                    <p>{gu ? s.courseGu : s.courseEn}</p>
                    <p>
                      {gu ? s.beforeGu : s.beforeEn}
                      <span aria-hidden="true" className="mx-2 text-vermilion-deep">→</span>
                      <span className="font-semibold text-carbon">{gu ? s.afterGu : s.afterEn}</span>
                    </p>
                  </figcaption>
                  {s.sample ? <p className="mt-3"><SampleTag /></p> : null}
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
