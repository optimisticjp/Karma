import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { TechniquePlate, type PlateVariant } from "@/components/ui/TechniquePlate";
import { techniqueChips } from "@/content/collections";
import { site, ownerProvidedFacts } from "@/lib/site";

/**
 * Hero — the 30-second decision.
 *
 * The audience arrives from an Instagram reel on a phone. In one viewport they
 * have to learn what Karma is, that it is commercial machine work rather than
 * a hobby class, that it is in Mota Varachha, and what to do next. Everything
 * here serves that and nothing else.
 *
 * The right side is a material wall: six drawn technique plates, labelled.
 * The studio has no photography, stock imagery is off the table, and empty
 * frames are worse than nothing — so the first viewport shows the actual
 * materials the trade runs on, drawn at thread scale. It is honest, it is
 * unmistakably this business, and it upgrades to photography without a
 * layout change when the shoot lands.
 */

/** Six techniques that between them cover all three course families. */
const WALL: Array<{ key: string; variant: PlateVariant; seed: number }> = [
  { key: "zardosi", variant: "machine", seed: 0 },
  { key: "flat", variant: "machine", seed: 1 },
  { key: "sequence", variant: "machine", seed: 2 },
  { key: "applique", variant: "modern", seed: 3 },
  { key: "tufting", variant: "modern", seed: 0 },
  { key: "emcad", variant: "software", seed: 1 }
];

export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const locale = useLocale();
  const gu = locale === "gu";

  /* Owner-provided, attributed to its source, and deliberately rounded. None
     of this reaches structured data — see `ownerProvidedFacts` in lib/site. */
  const trust: Array<[string, string]> = [
    [t("trustGoogle"), ownerProvidedFacts.googleRating],
    [t("trustInstagram"), ownerProvidedFacts.instagramFollowers],
    [t("trustFacebook"), ownerProvidedFacts.facebookFollowers],
    [t("trustWhereLabel"), t("trustWhereValue")],
    [t("trustTeachingLabel"), t("trustTeachingValue")]
  ];

  return (
    <section className="hero bg-grid">
      <div className="container-site hero-grid">
        <div>
          <Reveal>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="hero-title">{t("h1")}</h1>
            <p className="hero-promise">{t("promise")}</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="u-lede">{t("sub")}</p>
          </Reveal>
          <Reveal delay={140}>
            <div className="u-actions action-row">
              <Link href="/admission" className="btn btn-primary">
                {t("ctaDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              {/* Call is a first-class action here, not a footnote: this
                  audience decides on the phone, in Gujarati, in one call. */}
              <a href={`tel:+${site.whatsapp}`} className="btn btn-secondary">
                <Icon name="phone" size={17} /> {t("ctaCall")}
              </a>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-tertiary"
              >
                <Icon name="pin" size={16} /> {tc("directions")}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <figure className="hero-wall">
            <div className="hero-wall-grid">
              {WALL.map((p) => (
                <div key={p.key} className="hero-plate">
                  <TechniquePlate variant={p.variant} seed={p.seed} />
                  <span className="hero-plate-label">
                    {gu ? techniqueChips[p.key]?.labelGu : techniqueChips[p.key]?.labelEn}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="hero-wall-foot">
              <span>{t("wallCaption")}</span>
              <Link href="/courses" className="stitch-link font-semibold text-vermilion-deep">
                {t("wallCta")} <Icon name="arrow" size={15} className="arrow" />
              </Link>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* Owner-provided trust facts, attributed. Edge to edge: kept inside the
          left column they left a stranded half-row under the panel. */}
      <Reveal className="container-site mt-8 lg:mt-10">
        <dl className="fact-rail">
          {trust.map(([label, value]) => (
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
