import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Icon } from "@/components/ui/Icon";
import { trainers } from "@/content/collections";

/**
 * "Who will actually teach me" is a top-three question for any school, and the
 * one template sites answer with a stock photo and the words "expert faculty".
 *
 * This section used to answer it with three cards whose headings read
 * "Sample: lead trainer name" over empty photo frames — the most damaging
 * moment on the page, because a visitor cannot tell a placeholder from a
 * broken site. Named profiles now appear only once real ones exist. Until
 * then we answer the question with what is actually true and verified about
 * how teaching works here, which is the part a prospective student is really
 * asking about anyway.
 */
export function Trainers() {
  const t = useTranslations("home.trainers");
  const locale = useLocale();
  const gu = locale === "gu";
  const confirmed = trainers.filter((tr) => !tr.sample);
  /* No "profiles coming soon" note: an unfinished marker on a live page reads
     as a broken site. The verified teaching facts above answer the question on
     their own, and the cards appear the moment real profiles exist. */

  const practice: Array<[string, string]> = [
    [t("p1Label"), t("p1Value")],
    [t("p2Label"), t("p2Value")],
    [t("p3Label"), t("p3Value")],
    [t("p4Label"), t("p4Value")]
  ];

  return (
    <section className="section-compact">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <Link
            href="/about"
            className="stitch-link mb-1 inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
          >
            {t("more")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>

        <Reveal className="u-section-body">
          <dl className="spec-grid">
            {practice.map(([label, value]) => (
              <div key={label}>
                <dt className="spec-label">{label}</dt>
                <dd className="spec-value">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {confirmed.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {confirmed.map((tr, i) => (
              <Reveal as="li" key={tr.nameEn} delay={i * 80}>
                <article className="card card-lift h-full overflow-hidden">
                  <PhotoSlot
                    label={tr.photoLabel}
                    ratio="4/5"
                    className="card-img media-unveil rounded-none border-0"
                  />
                  <div className="p-6 md:p-8">
                    <h3 className="text-h4 card-title font-display">
                      {gu ? tr.nameGu : tr.nameEn}
                    </h3>
                    <p className="microlabel mt-2 !text-vermilion-deep">
                      {gu ? tr.roleGu : tr.roleEn}
                    </p>
                    <p className="mt-3 text-smallmeta text-stone">
                      {gu ? tr.focusGu : tr.focusEn}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
