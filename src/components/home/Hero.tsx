import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Ledger, LedgerLink } from "@/components/ui/Ledger";
import { courses, coursesByFamily, families } from "@/content/courses";

/**
 * Hero.
 *
 * The old composition was three empty photo frames connected by a thread —
 * a good idea waiting on a shoot that has not happened, which meant the first
 * viewport of the site was literally three grey boxes. Rival institutes fill
 * that gap with stock photography; we fill it with the thing none of them
 * publish: the actual catalogue.
 *
 * Left states the offer. Right *is* the eight real techniques, each a link,
 * legible and tappable before a single scroll. It is the most useful thing
 * this viewport can do, it is unmistakably Karma, and it stops depending on
 * photography that does not exist yet.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const locale = useLocale();
  const gu = locale === "gu";

  const facts: Array<[string, string]> = [
    [t("fact1Label"), t("fact1Value")],
    [t("fact2Label"), t("fact2Value")],
    [t("fact3Label"), t("fact3Value")],
    [t("fact4Label"), t("fact4Value")]
  ];

  return (
    <section className="hero bg-grid">
      <div className="container-site hero-grid">
        <div>
          <Reveal>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="hero-title">{t("h1")}</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="u-lede">{t("sub")}</p>
          </Reveal>
          <Reveal delay={140}>
            <div className="u-actions action-row">
              <Link href="/admission" className="btn btn-primary">
                {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              <Link href="/admissions#batches" className="btn btn-secondary">
                {t("secondary")}
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="hero-index">
            <div className="hero-index-head">
              <h2 className="text-h4 font-display">{t("indexTitle")}</h2>
              <span className="microlabel tabular shrink-0">{t("indexCount", { count: courses.length })}</span>
            </div>
            <div className="hero-index-body">
              <Ledger>
                {coursesByFamily.map((c, i) => (
                  <LedgerLink
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    index={String(i + 1).padStart(2, "0")}
                    title={gu ? c.nameGu : c.nameEn}
                    meta={gu ? families[c.family].nameGu : families[c.family].nameEn}
                  />
                ))}
              </Ledger>
            </div>
            <p className="hero-index-foot">
              <Link
                href="/courses"
                className="stitch-link inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
              >
                {t("indexCta")} <Icon name="arrow" size={15} className="arrow" />
              </Link>
            </p>
          </div>
        </Reveal>
      </div>

      {/* The decision facts close the hero edge to edge. Kept inside the left
          column they left a stranded half-row under the index panel; spanning
          the full width they give the whole viewport a base line. */}
      <Reveal className="container-site mt-12 lg:mt-16">
        <dl className="fact-rail">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="fact-label">{label}</dt>
              <dd className="fact-value">{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
