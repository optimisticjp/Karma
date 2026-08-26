import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SampleTag } from "@/components/ui/SampleTag";
import { Icon } from "@/components/ui/Icon";
import { stories } from "@/content/collections";

/** Editorial case studies, not quotation cards (spec): portrait, background,
    course, outcome, short quote. */
export function Stories() {
  const t = useTranslations("home.stories");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section-compact">
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
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {stories.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <figure className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8">
                <PhotoSlot label={s.photoLabel} ratio="4/5" className="hidden sm:flex" />
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
