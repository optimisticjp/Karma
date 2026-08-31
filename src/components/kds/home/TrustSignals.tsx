import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n/localized";
import { partners, socialChannels, stats } from "@/content/proof";
import { SocialProof, TrustedByRail } from "@/components/kds/proof";
import { ThreadLine } from "@/components/kds/marks";

/**
 * Scale and reach, without a widget.
 *
 * Three verified operational facts, the studio's social following, and a
 * trusted-by strip drawn as stitched garment labels.
 *
 * WHY THE COUNTS ARE TYPOGRAPHY AND NOT AN EMBED
 * ----------------------------------------------
 * No Instagram widget, no Facebook SDK, no third-party script. Each figure is
 * a number and a link to the real profile, so it costs nothing to render,
 * cannot fail to load, tracks nobody, and stays legible on a slow connection —
 * which is the connection this audience is on.
 *
 * The figures are `owner_provided`: real numbers the studio supplied that
 * nobody has independently audited. They are published as the studio's own
 * statement, marked as such, and kept out of rating schema.
 *
 * The three statistics beside them are `verified` and carry no marker, because
 * each is checkable against the catalogue and `course-operations.ts`: eleven
 * techniques, live machine practical, a free two-day demo.
 */
export function TrustSignals() {
  const t = useTranslations("home.trust");
  const locale = useLocale() as Locale;

  return (
    <section className="band-tight on-cloth" aria-labelledby="trust-heading">
      <div className="wrap">
        <h2 id="trust-heading" className="sr-only">
          {t("h2")}
        </h2>

        <dl className="trust-stats">
          {stats.map((s) => (
            <div key={s.id}>
              <dt className="t-display numeric leading-none">{s.value}</dt>
              <dd className="t-meta mt-1">{pick(s, "label", locale)}</dd>
            </div>
          ))}
        </dl>

        <ThreadLine tone="ink" className="my-8" />

        <SocialProof
          items={socialChannels}
          label={t("socialLabel")}
          followCta={t("follow")}
        />

        <TrustedByRail
          items={partners}
          locale={locale}
          label={t("partnersLabel")}
          className="mt-8"
        />
      </div>
    </section>
  );
}
