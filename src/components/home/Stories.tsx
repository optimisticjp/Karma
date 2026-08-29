import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { Icon } from "@/components/ui/Icon";
import { getPublicStories } from "@/lib/content/public";

/**
 * Consented Content Desk stories.
 *
 * Source fallbacks carry `sample: true` and their quote fields are editorial
 * instructions ("Replace with the student's own sentence…"), so rendering them
 * publicly put a note-to-self on the homepage inside quotation marks — the one
 * thing worse than having no testimonials. Real stories (managed rows are
 * always `sample: false`) appear the moment Content Desk publishes one; until
 * then this says plainly what will go here and why it is empty.
 */
export async function Stories() {
  const [t, locale, all] = await Promise.all([
    getTranslations("home.stories"),
    getLocale(),
    getPublicStories()
  ]);
  const gu = locale === "gu";
  const stories = all.filter((s) => !s.sample);

  return (
    <section className="section border-t border-line bg-ivory-2">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("h2")} sub={stories.length > 0 ? undefined : t("sub")} />
          {stories.length > 0 ? (
            <Link
              href="/success-stories"
              className="stitch-link mb-1 inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
            >
              {t("seeAll")} <Icon name="arrow" size={16} className="arrow" />
            </Link>
          ) : null}
        </div>

        {stories.length > 0 ? (
          <div className="u-section-body grid gap-6 md:grid-cols-2 lg:gap-8">
            {stories.map((s, i) => (
              <Reveal key={`${s.nameEn}-${i}`} delay={i * 80}>
                <figure className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8">
                  <ManagedPhoto
                    src={s.mediaUrl}
                    label={s.photoLabel}
                    ratio="4/5"
                    className="hidden sm:block"
                  />
                  <div>
                    <blockquote className="font-display text-h4 leading-snug">
                      “{gu ? s.quoteGu : s.quoteEn}”
                    </blockquote>
                    <figcaption className="mt-4 space-y-1 text-smallmeta text-stone">
                      <p className="font-bold text-carbon">{gu ? s.nameGu : s.nameEn}</p>
                      <p>{gu ? s.courseGu : s.courseEn}</p>
                      <p>
                        {gu ? s.beforeGu : s.beforeEn}
                        <span aria-hidden="true" className="mx-2 text-vermilion-deep">
                          →
                        </span>
                        <span className="font-semibold text-carbon">
                          {gu ? s.afterGu : s.afterEn}
                        </span>
                      </p>
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="pending-block u-section-body max-w-2xl text-smallmeta text-stone">
            <span className="pending-label">{t("pendingLabel")}</span>
            {t("pendingNote")}
          </p>
        )}
      </div>
    </section>
  );
}
