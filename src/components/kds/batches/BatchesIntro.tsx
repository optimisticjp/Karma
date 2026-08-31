import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The batch page's opening.
 *
 * **The counts are the rows, not a claim.** How many batches are open and how
 * many courses they cover are both computed from what the query returned, so
 * the headline cannot say "several batches running" on a page showing none.
 * When there is nothing open the counts are simply not rendered — an honest
 * empty board says it better than a zero does.
 */
export function BatchesIntro({
  batchCount,
  courseCount
}: {
  batchCount: number;
  courseCount: number;
}) {
  const t = useTranslations("batchesPage");
  const tc = useTranslations("common");

  return (
    <section className="band-hero on-paper" aria-labelledby="batches-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 id="batches-heading" className="t-h1 mt-3">
              {t("title")}
            </h1>
            <p className="t-lede mt-4 max-w-[46ch]">{t("lede")}</p>

            <ThreadLine draw className="my-6 w-28" />

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-secondary"
              >
                <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
              </a>
              <a href={`tel:+${site.callPhone}`} className="act-quiet">
                <Icon name="phone" size={16} /> {tc("call")}
              </a>
            </div>
          </div>

          {batchCount > 0 ? (
            <dl className="batches-count">
              <div>
                <dt className="t-display numeric leading-none">{batchCount}</dt>
                <dd className="t-meta mt-1">{t("countBatches", { count: batchCount })}</dd>
              </div>
              <div>
                <dt className="t-display numeric leading-none">{courseCount}</dt>
                <dd className="t-meta mt-1">{t("countCourses", { count: courseCount })}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
