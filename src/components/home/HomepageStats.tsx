import { getLocale } from "next-intl/server";
import { getHomepageStats } from "@/lib/content/public";

/**
 * Optional proof band. It renders nothing until the Owner has deliberately
 * verified and published at least one number in Content Desk, so the public
 * homepage never grows a plausible-looking statistic by accident.
 */
export async function HomepageStats() {
  const [locale, stats] = await Promise.all([getLocale(), getHomepageStats()]);
  if (stats.length === 0) return null;
  const gu = locale === "gu";

  return (
    <section className="section-compact bg-carbon text-ivory" aria-label={gu ? "Karmaના ચકાસેલા આંકડા" : "Verified Karma facts"}>
      <div className="container-site">
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.slug}>
              <dd className="font-display text-h2">{stat.value}</dd>
              <dt className="mt-1 text-smallmeta text-ivory/75">{gu ? stat.labelGu : stat.labelEn}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
