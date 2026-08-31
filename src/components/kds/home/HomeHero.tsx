import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO, KARMA_SOFTWARE } from "@/content/course-operations";
import { PhotoFrame } from "@/components/kds/Frame";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { Icon } from "@/components/ui/Icon";

/**
 * The hero. Thirty seconds, on a phone, on mobile data.
 *
 * A visitor arriving from an Instagram reel has to learn four things before
 * they scroll: the software is EMCAD DAHAO, the teaching happens on live
 * machines, the studio is in Mota Varachha, and the first step is a free
 * two-day demo. Everything here serves that.
 *
 * THE SCENE IS ONE COMPOSITION, NOT THREE RECTANGLES
 * --------------------------------------------------
 * The finished piece leads because it is the thing being promised; the screen
 * and the machine sit beneath it as the two steps that produced it; and a
 * thread runs down the column through a needle point at each stage. Three
 * unlinked frames say "here are some photographs". Three frames on a thread
 * say "this became that", which is the entire brand idea in one picture.
 *
 * FOUR SWATCHES, IN THE FIRST VIEWPORT
 * ------------------------------------
 * Without them the hero reads as a clean training company that could teach
 * anything. Four cut samples — metallic satin, sequin discs, tufted loops, a
 * vector path — say "eleven techniques, physically different from each other"
 * faster than a sentence can, and they say it in the material rather than in
 * an adjective.
 *
 * THE FACTS ARE FOUR, AND EVERY ONE IS VERIFIED
 * ---------------------------------------------
 * The demo is rendered from `course-operations.ts` and **labelled with the
 * course it belongs to**. Only EMCAD DAHAO has a confirmed duration, fee and
 * demo; a fact floated loose beside "eleven techniques" would read as true of
 * all eleven, and ten of them have no confirmed anything.
 *
 * No fee here. Fees are a decision-page fact, and the EMCAD panel further down
 * states them properly with the payment terms attached.
 */
export function HomeHero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");

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

  return (
    <section className="band-hero on-canvas glow-screen">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 className="t-h1-hero mt-3">{t("h1")}</h1>
            <p className="t-lede mt-4 max-w-[46ch]">{t("sub")}</p>

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
              <li className="t-micro self-center">{t("swatchMore")}</li>
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
