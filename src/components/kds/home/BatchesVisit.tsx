import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUpcomingBatches } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";
import { site, waLink } from "@/lib/site";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Homepage teaser for the same open Console batches as /batches. */
export async function BatchesVisit() {
  const [t, tc, rawLocale, result] = await Promise.all([
    getTranslations("home.when"),
    getTranslations("common"),
    getLocale(),
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
            <h2 id="when-heading" className="t-h2 mt-1.5">{t("h2")}</h2>
            <p className="t-lede mt-3">{t("sub")}</p>

            {rows.length > 0 ? (
              <>
                {result.sample ? (
                  <p className="mt-4"><span className="is-sample">{tc("sampleDataNote")}</span></p>
                ) : null}
                <ul className="board when-board" role="list">
                  {rows.map((row) => {
                    const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
                    return (
                      <li key={row.id} className="board-row">
                        <span>
                          <span className="t-h4 block">{pick(row, "courseName", locale)}</span>
                          <span className="t-micro mt-0.5 block">{row.label}</span>
                        </span>
                        <span className="t-meta numeric">
                          {formatDate(row.startDate, locale)}
                          {row.days ? ` · ${row.days}` : null}
                          {` · ${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`}
                        </span>
                        <span className="t-meta inline-flex items-center gap-1.5">
                          {seatsLeft === null ? null : seatsLeft <= 0 ? (
                            <><NeedlePoint state="todo" />{t("full")}</>
                          ) : (
                            <><NeedlePoint state="now" />{t("seatsLeft", { count: seatsLeft })}</>
                          )}
                        </span>
                        <Link
                          href={{ pathname: "/admission", query: { course: row.courseSlug, batch: String(row.id), src: "home" } }}
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
              <div className="when-empty">
                <p className="t-h4">{t("emptyTitle")}</p>
                <p className="t-body mt-2">{t("emptyBody")}</p>
                <div className="when-empty-actions">
                  <Link href="/admission" className="act act-primary">{tc("bookDemo")}</Link>
                  <a href={waLink(tc("waPrefillDemo"))} target="_blank" rel="noopener noreferrer" className="act act-secondary">
                    <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
                  </a>
                </div>
              </div>
            )}
          </div>

          <aside className="when-visit">
            <p className="t-micro">{t("visitLabel")}</p>
            <address className="when-address">
              <p>{pick(site, "address", locale)}</p>
              <p className="font-bold">{pick(site, "landmark", locale)}</p>
              <p className="t-meta">{pick(site, "hours", locale)}</p>
            </address>
            <div className="when-visit-actions">
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="act act-secondary">
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
