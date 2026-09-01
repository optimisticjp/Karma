"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { asLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Every visible field comes from the batch/course records maintained in
 * Karma Console. The CTA carries the course and timing preference that the
 * admission form actually stores; it does not pretend to reserve a batch. */
export type BatchRow = {
  id: number;
  label: string;
  days: string | null;
  startTime: string;
  endTime: string;
  startDate: string;
  seats: number;
  seatsTaken: number;
  language: string | null;
  courseSlug: string;
  courseNameEn: string;
  courseNameGu: string;
};

const EVENING_FROM = 16;
const isEvening = (startTime: string) => Number(startTime.slice(0, 2)) >= EVENING_FROM;

export function BatchBoard({ rows, sample }: { rows: BatchRow[]; sample?: boolean }) {
  const t = useTranslations("batchesPage");
  const tc = useTranslations("common");
  const locale = asLocale(useLocale());
  const [course, setCourse] = useState<string>("all");
  const [timing, setTiming] = useState<"all" | "morning" | "evening">("all");

  const courseChips = useMemo(() => {
    const seen = new Map<string, { slug: string; name: string; count: number }>();
    for (const row of rows) {
      const name = pick(row, "courseName", locale);
      const found = seen.get(row.courseSlug);
      if (found) found.count += 1;
      else seen.set(row.courseSlug, { slug: row.courseSlug, name, count: 1 });
    }
    return [...seen.values()];
  }, [rows, locale]);

  const hasMorning = rows.some((r) => !isEvening(r.startTime));
  const hasEvening = rows.some((r) => isEvening(r.startTime));

  const shown = rows.filter(
    (row) =>
      (course === "all" || row.courseSlug === course) &&
      (timing === "all" || (timing === "evening") === isEvening(row.startTime))
  );

  return (
    <>
      {sample ? (
        <p className="mb-4">
          <span className="is-sample">{tc("sampleDataNote")}</span>
        </p>
      ) : null}

      <div className="board-filters">
        <div className="book-tabs" role="group" aria-label={t("filterCourse")}>
          <button
            type="button"
            aria-pressed={course === "all"}
            onClick={() => setCourse("all")}
            className={cn("chip", course === "all" && "is-on")}
          >
            {t("filterAll")}
            <span className="t-micro numeric opacity-70">{rows.length}</span>
          </button>
          {courseChips.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              aria-pressed={course === chip.slug}
              onClick={() => setCourse(chip.slug)}
              className={cn("chip", course === chip.slug && "is-on")}
            >
              {chip.name}
              <span className="t-micro numeric opacity-70">{chip.count}</span>
            </button>
          ))}
        </div>

        {hasMorning && hasEvening ? (
          <div className="book-tabs" role="group" aria-label={t("filterTiming")}>
            {(["all", "morning", "evening"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={timing === key}
                onClick={() => setTiming(key)}
                className={cn("chip", timing === key && "is-on")}
              >
                {t(key === "all" ? "filterAll" : key === "morning" ? "morning" : "evening")}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {shown.length > 0 ? (
        <ul className="board batch-board" role="list">
          {shown.map((row) => {
            const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
            return (
              <li key={row.id} className="board-row">
                <span className="min-w-0">
                  <span className="t-h4 block">{pick(row, "courseName", locale)}</span>
                  <span className="t-micro mt-0.5 block">{row.label}</span>
                  <span className="t-meta numeric mt-0.5 block">
                    {formatDate(row.startDate, locale)}
                    {row.days ? ` · ${row.days}` : null}
                    {row.startTime && row.endTime
                      ? ` · ${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`
                      : null}
                    {row.language ? ` · ${row.language}` : null}
                  </span>
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
                    query: {
                      course: row.courseSlug,
                      timing: isEvening(row.startTime) ? "evening" : "morning",
                      src: "batches"
                    }
                  }}
                  className="act-quiet"
                >
                  {tc("bookDemo")} <Icon name="arrow" size={15} className="arrow" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="when-empty">
          <p className="t-h4">{t("filterEmpty")}</p>
          <div className="when-empty-actions">
            <button
              type="button"
              className="act act-secondary"
              onClick={() => {
                setCourse("all");
                setTiming("all");
              }}
            >
              {t("filterClear")}
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {t("showingCount", { count: shown.length })}
      </p>
    </>
  );
}
