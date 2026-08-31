import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { MonoNote, StepIndex } from "@/components/ui/MonoNote";
import { StitchRail } from "@/components/ui/StitchPath";
import { TrackedLink } from "@/components/site/TrackedLink";
import { site } from "@/lib/site";

/**
 * The hero — and the site's one Level-4 moment.
 *
 * A visitor arrives from an Instagram reel, on a phone, on mobile data. In one
 * viewport they have to learn four things: the software is EMCAD DAHAO, the
 * teaching happens on live machines, the studio is in Mota Varachha, and the
 * first step is a free two-day demo. Everything here serves that and nothing
 * else, and all of it is legible before a single photograph exists.
 *
 * THE COMPOSITION
 * ---------------
 * The right side is the promise drawn literally: one continuous thread that
 * begins on the EMCAD screen (H1), passes into the machine (H2), and exits
 * into the finished textile (H3). Three frames, one thread, in that order.
 *
 * It is ONE markup tree at every width, not a desktop collage plus a mobile
 * copy. On a laptop the frames stagger and the thread runs diagonally between
 * them; on a phone the same three frames become the vertical story the brief
 * asks for — `01 SCREEN`, `02 MACHINE`, `03 RESULT` — which is simpler and
 * clearer than a miniaturised collage, and costs nothing extra to ship.
 *
 * THE SURFACE
 * -----------
 * The hero is the page's MACHINE band, and since 2026-08-31 that band is
 * Steel Mist rather than Machine Black: pale, cool, technical, with the steel
 * edge along its top and the density texture across it. The owner rejected
 * the black-background treatment, and the hero was the loudest instance of it.
 *
 * What was lost is a colour. What carries "this is a machine floor, not a
 * coaching centre" was never the black — it is the 9-on/6-off running stitch
 * down the thread, the knot at each stage, the machine notation, the four
 * verified facts set as a spec row, the tabular figures and the hairlines.
 * Every one of them reads the same on a pale ground, and several read better.
 *
 * Nothing here overrides a colour at the call site, which is the property that
 * made the swap a one-class change: the frames, rules, eyebrow and secondary
 * button all take palette tokens.
 *
 * THE FACTS
 * ---------
 * Four, and every one of them verified. "3 Months" is labelled as the **EMCAD
 * DAHAO course's** duration rather than floated as a site-wide fact, because
 * it belongs to that course alone (see `src/content/course-operations.ts`);
 * the other ten courses have no confirmed duration and must not inherit one by
 * standing next to it. The Google/Instagram/Facebook figures the studio
 * supplied are not here — they are social proof, they belong to the trust rail
 * below, and they would dilute a row whose whole job is machine facts.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");

  /* Verified, and each labelled with the thing it is actually true of. */
  const facts: Array<[string, string]> = [
    [t("factSoftwareLabel"), t("factSoftwareValue")],
    [t("factDurationLabel"), t("factDurationValue")],
    [t("factPracticalLabel"), t("factPracticalValue")],
    [t("factWhereLabel"), t("factWhereValue")]
  ];

  const frames: Array<{ id: string; step: string }> = [
    { id: "H1_EMCAD_SCREEN", step: t("step1") },
    { id: "H2_MACHINE_STITCHING", step: t("step2") },
    { id: "H3_FINISHED_PIECE", step: t("step3") }
  ];

  return (
    <section className="hero hero-lab band-machine machine-light tx-density">
      <div className="container-site hero-grid">
        <div>
          <Reveal>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="hero-title">{t("h1")}</h1>
            <p className="hero-promise">
              {t.rich("promise", {
                em: (chunks) => <em className="hero-promise-em">{chunks}</em>
              })}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p className="u-lede">{t("sub")}</p>
          </Reveal>

          {/* The machine facts, as a spec row rather than prose: this is the
              part a visitor scans before they read anything. */}
          <Reveal delay={110}>
            <dl className="hero-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>
                    <MonoNote>{label}</MonoNote>
                  </dt>
                  <dd className="hero-fact-value">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={140}>
            <div className="u-actions action-row">
              <Link href="/admission" className="btn btn-primary btn-stitch">
                {t("ctaDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              {/* Call is a first-class action, not a footnote: this audience
                  decides on the phone, in Gujarati, in one call. Dials
                  `callPhone`, never the WhatsApp number — the two roles are
                  unconfirmed and must not be merged. */}
              <TrackedLink
                href={`tel:+${site.callPhone}`}
                event="call_demo_click"
                props={{ surface: "hero" }}
                className="btn btn-secondary"
              >
                <Icon name="phone" size={17} /> {t("ctaCall")}
              </TrackedLink>
              <TrackedLink
                href={site.mapsUrl}
                event="directions_click"
                props={{ surface: "hero" }}
                external
                className="cta-tertiary"
              >
                <Icon name="map" size={16} /> {tc("directions")}
              </TrackedLink>
            </div>
          </Reveal>
        </div>

        {/* Screen → machine → stitch, as ONE thread through three frames.
            The rail spans the whole track and the frames sit on it, so it is
            literally one continuous thread rather than three connectors that
            happen to line up. Laying it down is the page's single Level-4
            moment; nothing else on the homepage may claim one. */}
        <Reveal delay={120} as="figure" className="hero-thread">
          <div className="hero-thread-track">
            <StitchRail tone="vermilion" draw className="hero-thread-rail" />
            <ol className="hero-thread-list">
              {frames.map((frame, i) => (
                <li key={frame.id} className={`hero-frame hero-frame--${i + 1}`}>
                  <p className="hero-frame-step">
                    <span className="hero-frame-knot" aria-hidden="true" />
                    <StepIndex n={i + 1} />
                    <MonoNote className="hero-frame-label">{frame.step}</MonoNote>
                  </p>
                  <ManifestPhoto id={frame.id} editorial className="hero-frame-media" />
                </li>
              ))}
            </ol>
          </div>
          <figcaption className="hero-thread-foot">
            <span>{t("threadCaption")}</span>
            <Link href="/courses" className="stitch-link font-semibold text-vermilion-deep">
              {t("threadCta")} <Icon name="arrow" size={15} className="arrow" />
            </Link>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
