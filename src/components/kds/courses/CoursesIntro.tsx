import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { coursesByFamily, families } from "@/content/courses";
import { EMCAD_DAHAO, KARMA_SOFTWARE } from "@/content/course-operations";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The catalogue's opening.
 *
 * A visitor arriving here has already decided they want to learn something;
 * what they do not know is how eleven techniques divide up, or what is true of
 * all of them. So the first screen carries the split — 8 / 2 / 1 across the
 * three families, from `src/content/courses.ts` rather than typed into copy —
 * and the four things every course includes.
 *
 * **Every one of those four is verified**: machine time in every session, the
 * teaching languages, a certificate, and the free demo whose length is
 * rendered from `course-operations.ts`. No outcome, no placement, no earning
 * claim — those are not facts this business has given anybody.
 *
 * The swatch wall is the argument the sentence cannot make: eleven techniques
 * that are physically different from each other, shown as material rather than
 * described as an adjective.
 */
export function CoursesIntro() {
  const t = useTranslations("coursesPage");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const demo = EMCAD_DAHAO.operations.demo;

  const facts = [
    t("factMachine"),
    t("factLanguages"),
    t("factCertificate"),
    t("factDemo", { days: demo?.days ?? 2 })
  ];

  return (
    <section className="band-hero on-paper" aria-labelledby="courses-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 id="courses-heading" className="t-h1 mt-3">
              {t("title")}
            </h1>
            <p className="t-lede mt-4 max-w-[48ch]">{t("intro")}</p>

            <ThreadLine draw className="my-6 w-28" />

            {/* The split, from the catalogue itself. */}
            <dl className="courses-split">
              {(Object.keys(families) as Array<keyof typeof families>).map((key) => (
                <div key={key}>
                  <dt className="t-h3 numeric leading-none">
                    {coursesByFamily.filter((c) => c.family === key).length}
                  </dt>
                  <dd className="t-meta mt-1">{pick(families[key], "name", locale)}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <Link href="/batches" className="act act-secondary">
                {t("batchesCta")}
              </Link>
            </div>
          </div>

          <aside className="courses-aside">
            <p className="t-micro">{t("factsTitle")}</p>
            <ul className="courses-facts" role="list">
              {facts.map((f) => (
                <li key={f}>
                  <NeedlePoint state="done" />
                  <span className="t-body">{f}</span>
                </li>
              ))}
            </ul>

            {/* Four cut samples, ending on the one technique that happens on a
                screen — which is the site's whole argument in four squares. */}
            <ul className="courses-swatches" role="list">
              {["zardosi-machine-embroidery", "sequence-work", "laser-work", "emcad-embroidery-design"].map(
                (slug) => (
                  <li key={slug}>
                    <StitchSwatch slug={slug} />
                  </li>
                )
              )}
            </ul>
            <p className="t-meta mt-3">{t("softwareNote", { software: KARMA_SOFTWARE })}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
