import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO, KARMA_SOFTWARE } from "@/content/course-operations";
import { PhotoFrame } from "@/components/kds/Frame";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { Icon } from "@/components/ui/Icon";

/** The first-view decision surface. Course count comes from the live Console
 * catalogue so an owner-created public course never leaves stale "11" copy. */
export function HomeHero({ courseCount }: { courseCount: number }) {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const locale = useLocale();
  const demo = EMCAD_DAHAO.operations.demo;

  const facts: Array<[string, string]> = [
    [t("factSoftwareLabel"), KARMA_SOFTWARE],
    [t("factPracticalLabel"), t("factPracticalValue")],
    [t("factWhereLabel"), t("factWhereValue")],
    [t("factDemoLabel"), t("factDemoValue", { days: demo?.days ?? 2 })]
  ];

  const stages = [
    { key: "screen", id: "H1_EMCAD_SCREEN", register: "machine" as const },
    { key: "machine", id: "H2_MACHINE_STITCHING", register: "cloth" as const }
  ];

  const catalogueLine = locale === "gu"
    ? `${courseCount} કોર્સ, લાઇવ production machines પર practical training અને EMCAD DAHAO design software. શરૂઆત zero થી કરો અથવા તમારી machine પર આવતા faults સુધારવાનું શીખો. પ્રથમ બે દિવસ free demo છે.`
    : `${courseCount} courses, live production-machine practice and EMCAD DAHAO design software. Start from zero or learn to fix the faults your machine already gives you. The first two days are a free demo.`;
  const moreCount = Math.max(courseCount - 4, 0);

  return (
    <section className="band-hero on-canvas glow-screen">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 className="t-h1-hero mt-3">{t("h1")}</h1>
            <p className="t-lede mt-4 max-w-[46ch]">{catalogueLine}</p>

            <ThreadLine draw className="my-6 w-28" />

            <dl className="hero-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="t-micro">{label}</dt>
                  <dd className="t-h4 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            <ul className="hero-swatches" role="list">
              {["zardosi-machine-embroidery", "sequence-work", "tufting", "emcad-embroidery-design"].map(
                (slug) => (
                  <li key={slug}>
                    <StitchSwatch slug={slug} />
                  </li>
                )
              )}
              {moreCount > 0 ? <li className="t-micro self-center">+{moreCount} {locale === "gu" ? "વધુ" : "more"}</li> : null}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <Link href="/courses" className="act act-secondary">
                {t("ctaCourses")}
              </Link>
            </div>
          </div>

          <div className="hero-scene min-w-0">
            <span aria-hidden="true" className="hero-scene-thread">
              <ThreadLine vertical draw />
            </span>

            <figure className="hero-stage hero-stage--lead">
              <figcaption className="hero-stage-tag">
                <NeedlePoint state="done" />
                <span className="t-micro">{t("stageProof")}</span>
              </figcaption>
              <PhotoFrame id="H3_FINISHED_PIECE" scale="feature" />
            </figure>

            <div className="hero-stage-pair">
              {stages.map((s) => (
                <figure key={s.key} className="hero-stage">
                  <figcaption className="hero-stage-tag">
                    <NeedlePoint state="done" />
                    <span className="t-micro">{t(`stage${s.key === "screen" ? "Screen" : "Machine"}` as "stageScreen")}</span>
                  </figcaption>
                  <PhotoFrame id={s.id} scale="thumb" register={s.register} />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
