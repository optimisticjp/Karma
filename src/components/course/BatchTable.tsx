import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUpcomingBatches } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

/**
 * Live batch list (async server component). Reads Neon when configured,
 * otherwise renders clearly-tagged sample rows (plan 10.3). Table on
 * desktop, stacked cards on mobile.
 */
export async function BatchTable({
  limit,
  courseSlug
}: {
  limit?: number;
  courseSlug?: string;
}) {
  const t = await getTranslations("home.batches");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const { rows, sample, error, unavailable } = await getUpcomingBatches({ limit, courseSlug });

  if (rows.length === 0) {
    return (
      <div className={"card p-6 " + (error || unavailable ? "border-warn" : "")}>
        <p className="font-semibold">{error || unavailable ? t("error") : t("empty")}</p>
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary mt-4"
        >
          {tc("whatsapp")}
        </a>
      </div>
    );
  }

  const timing = (start: string) => (Number(start.slice(0, 2)) >= 16 ? "evening" : "morning");
  const applyHref = (r: (typeof rows)[number]) =>
    ({
      pathname: "/admission",
      query: { course: r.courseSlug, timing: timing(r.startTime), batch: String(r.id), src: "batches" }
    }) as const;

  const seatsBadge = (seats: number, taken: number) => {
    const left = seats - taken;
    if (left <= 0) return <span className="font-semibold text-stone">{t("full")}</span>;
    if (left <= 3)
      return <span className="font-bold text-vermilion-deep">{t("lastSeats", { count: left })}</span>;
    return <span className="font-semibold text-success">{t("seatsLeft", { count: left })}</span>;
  };

  const time = (r: (typeof rows)[number]) =>
    `${r.startTime.slice(0, 5)}–${r.endTime.slice(0, 5)}`;

  return (
    <div>
      {sample ? (
        <p className="mb-4 text-smallmeta text-stone">
          <span className="sample-tag">⚠ {tc("sampleDataNote")}</span>
        </p>
      ) : null}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-card md:block">
        <table className="w-full text-left text-smallmeta">
          <thead>
            <tr className="border-b border-line">
              <th className="microlabel px-5 py-4">{t("course")}</th>
              <th className="microlabel px-5 py-4">{t("starts")}</th>
              <th className="microlabel px-5 py-4">{t("days")}</th>
              <th className="microlabel px-5 py-4">{t("time")}</th>
              <th className="microlabel px-5 py-4">{t("language")}</th>
              <th className="microlabel px-5 py-4">{t("seats")}</th>
              <th className="px-5 py-4"><span className="sr-only">CTA</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-4 font-semibold">
                  <Link className="stitch-link" href={`/courses/${r.courseSlug}`}>
                    {locale === "gu" ? r.courseNameGu : r.courseNameEn}
                  </Link>
                </td>
                <td className="px-5 py-4">{formatDate(r.startDate, locale)}</td>
                <td className="px-5 py-4">{r.days}</td>
                <td className="px-5 py-4">{time(r)}</td>
                <td className="px-5 py-4">{r.language}</td>
                <td className="px-5 py-4">{seatsBadge(r.seats, r.seatsTaken)}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={applyHref(r)} className="stitch-link inline-flex items-center gap-1.5 font-bold text-vermilion-deep">
                    {t("bookDemo")} <Icon name="arrow" size={15} className="arrow" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="card p-4">
            <p className="font-semibold">{locale === "gu" ? r.courseNameGu : r.courseNameEn}</p>
            <p className="mt-1 text-smallmeta text-stone">
              {formatDate(r.startDate, locale)} · {r.days} · {time(r)}
            </p>
            <div className="mt-2 flex items-center justify-between text-smallmeta">
              {seatsBadge(r.seats, r.seatsTaken)}
              <Link href={applyHref(r)} className="font-bold text-vermilion-deep">
                {t("bookDemo")} →
              </Link>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}
