"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/site";
import type { BatchRow } from "@/content/courses";

type State =
  | { kind: "loading" }
  | { kind: "ready"; rows: BatchRow[]; sample: boolean }
  | { kind: "empty" }
  | { kind: "error" };

/**
 * Home batches widget: the page stays static; freshness comes from the
 * cached /api/batches endpoint. Empty and error states are honest (audit).
 */
export function BatchesTeaser() {
  const t = useTranslations("home.batches");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    fetch("/api/batches?limit=3")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { rows: BatchRow[]; sample: boolean; error?: boolean; unavailable?: boolean }) => {
        if (!alive) return;
        if (data.error && data.rows.length === 0) setState({ kind: "error" });
        else if (data.rows.length === 0) setState({ kind: "empty" });
        else setState({ kind: "ready", rows: data.rows, sample: data.sample });
      })
      .catch(() => alive && setState({ kind: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const timing = (start: string) => (Number(start.slice(0, 2)) >= 16 ? "evening" : "morning");

  const seatsBadge = (seats: number, taken: number) => {
    const left = seats - taken;
    if (left <= 0) return <span className="font-semibold text-stone">{t("full")}</span>;
    if (left <= 3)
      return <span className="font-bold text-vermilion-deep">{t("lastSeats", { count: left })}</span>;
    return <span className="font-semibold text-success">{t("seatsLeft", { count: left })}</span>;
  };

  return (
    <section className="section-compact border-t border-line bg-ivory-2" id="upcoming-batches">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <Link
            href="/admissions"
            className="stitch-link mb-1 inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
          >
            {t("seeAll")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>

        <div className="u-section-body" aria-live="polite">
          {state.kind === "loading" ? (
            <div className="space-y-3">
              <div className="skeleton h-20" />
              <div className="skeleton h-20" />
              <div className="skeleton h-20" />
            </div>
          ) : null}

          {state.kind === "ready" ? (
            <>
              {state.sample ? (
                <p className="mb-4">
                  <span className="sample-tag">⚠ {tc("sampleDataNote")}</span>
                </p>
              ) : null}
              <ul className="grid gap-4 md:grid-cols-3">
                {state.rows.map((r) => (
                  <li key={r.id} className="card card-lift flex flex-col p-3.5 md:p-5">
                    <p className="font-semibold">
                      {locale === "gu" ? r.courseNameGu : r.courseNameEn}
                    </p>
                    <p className="mt-1 text-smallmeta text-stone">
                      {formatDate(r.startDate, locale)} · {r.days} · {r.startTime.slice(0, 5)}–
                      {r.endTime.slice(0, 5)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-smallmeta">
                      {seatsBadge(r.seats, r.seatsTaken)}
                      <Link
                        href={{
                          pathname: "/admission",
                          query: {
                            course: r.courseSlug,
                            timing: timing(r.startTime),
                            batch: String(r.id),
                            src: "home-batches"
                          }
                        }}
                        className="stitch-link inline-flex items-center gap-1.5 font-bold text-vermilion-deep"
                      >
                        {t("bookDemo")} <Icon name="arrow" size={15} className="arrow" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {state.kind === "empty" ? (
            <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
              <p className="font-semibold">{t("empty")}</p>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary shrink-0"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </a>
            </div>
          ) : null}

          {state.kind === "error" ? (
            <div className="card border-warn flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
              <p className="font-semibold">{t("error")}</p>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary shrink-0"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
