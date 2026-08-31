import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUpcomingBatches } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";
import { site, waLink } from "@/lib/site";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * When you can come, and where you would be coming to.
 *
 * REAL ROWS OR NOTHING
 * --------------------
 * `getUpcomingBatches()` filters `status = 'open'`, a future start date and
 * both archive flags in SQL before LIMIT, and in production returns an empty
 * result rather than fiction. This renders exactly what it is handed:
 *
 *  - **no invented start date, seat count, trainer, language or availability**;
 *  - **no fabricated weekend batch** — `sampleBatches()` in
 *    `src/content/courses.ts` is the only "Sat-Sun" string in this repository
 *    and it is gated behind demo mode. This never calls it, so a weekend row
 *    can only ever come from the database;
 *  - **every field is conditional.** A row with no `days` renders no days. A
 *    row with `seats` of 0 renders no seat line rather than "0 seats left",
 *    because 0 in that column means *not tracked*, not *full*.
 *
 * When there is nothing open the section says so and offers the demo, WhatsApp
 * and a call — which is the truthful next step and a better one than a fake
 * batch. That empty state is not a failure mode; it is the normal state
 * between intakes, and it is written to read like it.
 *
 * PAIRED WITH THE ADDRESS, ON PURPOSE
 * -----------------------------------
 * "When can I come" and "where would I be coming to" are one question. For
 * this audience the landmark does more work than the PIN code, so it is set
 * in bold: nobody in Mota Varachha navigates by postcode.
 */
export async function BatchesVisit() {
  const [t, tc, rawLocale, result] = await Promise.all([
    getTranslations("home.when"),
    getTranslations("common"),
    getLocale(),
    /* A real cap, not a page size: the studio runs a handful of batches at a
       time, and this is a homepage teaser rather than the board. */
    getUpcomingBatches({ limit: 4 })
  ]);
  const locale = asLocale(rawLocale);
  const rows = result.rows;

  return (
    <section className="band on-paper" aria-labelledby="when-heading">
      <div className="wrap">
        <div className="when">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h2 id="when-heading" className="t-h2 mt-1.5">
              {t("h2")}
            </h2>
            <p className="t-lede mt-3">{t("sub")}</p>

            {rows.length > 0 ? (
              <>
                {result.sample ? (
                  <p className="mt-4">
                    <span className="is-sample">{tc("sampleDataNote")}</span>
                  </p>
                ) : null}
                <ul className="board when-board" role="list">
                  {rows.map((row) => {
                    const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
                    return (
                      <li key={row.id} className="board-row">
                        <span className="t-h4">{pick(row, "courseName", locale)}</span>
                        <span className="t-meta numeric">
                          {formatDate(row.startDate, locale)}
                          {row.days ? ` · ${row.days}` : null}
                          {` · ${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`}
                        </span>
                        <span className="t-meta inline-flex items-center gap-1.5">
                          {seatsLeft === null ? null : seatsLeft <= 0 ? (
                            <>
                              <NeedlePoint state="todo" />
                              {t("full")}
                            </>
                          ) : (
                            <>
                              <NeedlePoint state="now" />
                              {t("seatsLeft", { count: seatsLeft })}
                            </>
                          )}
                        </span>
                        <Link
                          href={{
                            pathname: "/admission",
                            query: { course: row.courseSlug, batch: String(row.id), src: "home" }
                          }}
                          className="act-quiet"
                        >
                          {tc("bookDemo")} <Icon name="arrow" size={15} className="arrow" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-5">
                  <Link href="/batches" className="act act-secondary">
                    {t("seeAll")} <Icon name="arrow" size={16} className="arrow" />
                  </Link>
                </p>
              </>
            ) : (
              /* The honest empty state. Not an error — the normal state
                 between intakes, written to read like it. */
              <div className="when-empty">
                <p className="t-h4">{t("emptyTitle")}</p>
                <p className="t-body mt-2">{t("emptyBody")}</p>
                <div className="when-empty-actions">
                  <Link href="/admission" className="act act-primary">
                    {tc("bookDemo")}
                  </Link>
                  <a
                    href={waLink(tc("waPrefillDemo"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="act act-secondary"
                  >
                    <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Where you would be coming to. */}
          <aside className="when-visit">
            <p className="t-micro">{t("visitLabel")}</p>
            <address className="when-address">
              <p>{pick(site, "address", locale)}</p>
              <p className="font-bold">{pick(site, "landmark", locale)}</p>
              <p className="t-meta">{pick(site, "hours", locale)}</p>
            </address>
            <div className="when-visit-actions">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-secondary"
              >
                <Icon name="pin" size={17} /> {tc("directions")}
              </a>
              <a href={`tel:+${site.callPhone}`} className="act act-secondary">
                <Icon name="phone" size={17} /> {tc("call")}
              </a>
            </div>
            <p className="t-meta mt-4">{t("visitNote")}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
