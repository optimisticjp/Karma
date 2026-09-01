import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getUpcomingBatches } from "@/lib/db/queries";
import { pageMeta } from "@/lib/seo";
import { BatchesIntro } from "@/components/kds/batches/BatchesIntro";
import { BatchBoard, type BatchRow } from "@/components/kds/batches/BatchBoard";
import { JoiningSteps } from "@/components/kds/batches/JoiningSteps";
import { CtaBand } from "@/components/kds/CtaBand";
import { ActionDock } from "@/components/kds/shell/ActionDock";
import { Link } from "@/i18n/navigation";
import { site, waLink } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { PageCrumbs } from "@/components/kds/PageCrumbs";

/**
 * `/[locale]/batches` — the public view of open Console batches.
 *
 * A batch can already have started and still accept students. The shared query
 * therefore keeps an `open` batch visible until its end date passes (or staff
 * closes/archives it), and also respects the parent course's Active and Public
 * visibility switches. No production sample rows are invented.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.batches" });
  return pageMeta({ locale, path: "/batches", title: t("title"), description: t("description") });
}

export default async function BatchesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, result] = await Promise.all([
    getTranslations("batchesPage"),
    getTranslations("common"),
    getUpcomingBatches({ limit: 24 })
  ]);

  const rows: BatchRow[] = result.rows.map((row) => ({
    id: row.id,
    label: row.label,
    days: row.days,
    startTime: row.startTime,
    endTime: row.endTime,
    startDate: row.startDate,
    seats: row.seats,
    seatsTaken: row.seatsTaken,
    language: row.language,
    courseSlug: row.courseSlug,
    courseNameEn: row.courseNameEn,
    courseNameGu: row.courseNameGu
  }));
  const courseCount = new Set(rows.map((r) => r.courseSlug)).size;
  const failed = Boolean(result.error || result.unavailable);

  return (
    <>
      <PageCrumbs page="batches" path="/batches" />
      <BatchesIntro batchCount={rows.length} courseCount={courseCount} />

      <section className="band on-canvas" aria-labelledby="board-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <p className="t-micro">{t("listEyebrow")}</p>
            <h2 id="board-heading" className="t-h2 mt-1.5">
              {t("listTitle")}
            </h2>
            <p className="t-lede mt-3">{t("listSub")}</p>
          </header>

          <div className="mt-7">
            {rows.length > 0 ? (
              <BatchBoard rows={rows} sample={result.sample} />
            ) : (
              <div className="when-empty">
                <p className="t-h4">{failed ? t("errorTitle") : t("emptyTitle")}</p>
                <p className="t-body mt-2 max-w-[52ch]">
                  {failed ? t("errorBody") : t("emptyBody")}
                </p>
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
                  <a href={`tel:+${site.callPhone}`} className="act-quiet">
                    <Icon name="phone" size={16} /> {tc("call")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <JoiningSteps />
      <CtaBand title={t("closeH2")} sub={t("closeSub")} ground="on-cloth" />
      <ActionDock surface="batches" demoHref="/admission" />
    </>
  );
}
