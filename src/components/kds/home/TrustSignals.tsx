import { getLocale, getTranslations } from "next-intl/server";
import { partners, stats as sourceStats } from "@/content/proof";
import { getHomepageStats } from "@/lib/content/public";
import { asLocale } from "@/i18n/routing";
import { TrustedByRail } from "@/components/kds/proof";
import { ThreadLine } from "@/components/kds/marks";

/** The social follower proof moved directly below the hero. This later trust
 * rail keeps the broader owner-managed stats and partner placeholders. */
export async function TrustSignals() {
  const [t, rawLocale, managedStats] = await Promise.all([
    getTranslations("home.trust"),
    getLocale(),
    getHomepageStats()
  ]);
  const locale = asLocale(rawLocale);
  const stats = managedStats.length > 0
    ? managedStats.map((stat) => ({
        id: stat.slug,
        value: stat.value,
        label: locale === "gu" ? stat.labelGu : stat.labelEn
      }))
    : sourceStats.map((stat) => ({
        id: stat.id,
        value: stat.value,
        label: locale === "gu" ? stat.labelGu : stat.labelEn
      }));

  return (
    <section className="band-tight on-cloth" aria-labelledby="trust-heading">
      <div className="wrap">
        <h2 id="trust-heading" className="sr-only">{t("h2")}</h2>

        <dl className="trust-stats">
          {stats.map((stat) => (
            <div key={stat.id}>
              <dt className="t-display numeric leading-none">{stat.value}</dt>
              <dd className="t-meta mt-1">{stat.label}</dd>
            </div>
          ))}
        </dl>

        <ThreadLine tone="ink" className="my-8" />
        <TrustedByRail items={partners} locale={locale} label={t("partnersLabel")} />
      </div>
    </section>
  );
}
