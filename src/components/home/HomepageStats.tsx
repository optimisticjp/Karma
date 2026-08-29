import { getLocale } from "next-intl/server";
import { getHomepageStats } from "@/lib/content/public";

/**
 * Optional proof band. It renders nothing until the Owner has deliberately
 * verified and published at least one number in Content Desk, so the public
 * homepage never grows a plausible-looking statistic by accident.
 *
 * It sits in the hairline spec grid rather than on a dark slab: two dark
 * bands already do structural work further down the page, and a third would
 * turn punctuation into decoration. Numbers that survived owner verification
 * deserve to look like facts on a wall chart, not like a marketing counter.
 */
export async function HomepageStats() {
  const [locale, stats] = await Promise.all([getLocale(), getHomepageStats()]);
  if (stats.length === 0) return null;
  const gu = locale === "gu";

  return (
    <section
      className="section-compact"
      aria-label={gu ? "Karmaના ચકાસેલા આંકડા" : "Verified Karma facts"}
    >
      <div className="container-site">
        <dl className="spec-grid">
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.slug}>
              <dd className="tabular font-display text-h3">{stat.value}</dd>
              <dt className="spec-note mt-1">{gu ? stat.labelGu : stat.labelEn}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
