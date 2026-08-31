import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/content/courses";
import { getUpcomingBatches } from "@/lib/db/queries";
import { notesForCourse } from "@/content/notes";
import { formatDate } from "@/lib/utils";
import { waLink } from "@/lib/site";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * When this course actually runs, and what the studio has written about it.
 *
 * REAL ROWS OR AN HONEST EMPTY STATE
 * ----------------------------------
 * `getUpcomingBatches({ courseSlug })` filters on `status = 'open'`, a future
 * start date and both archive flags **in SQL** before the limit, and in
 * production returns nothing rather than fiction when there is nothing open.
 * No invented start date, seat count, trainer or language reaches this page:
 * every field is conditional, and a `seats` value of 0 means *not tracked*
 * rather than *full*, so it renders no seat line at all.
 *
 * THE NOTES CROSS-LINK RUNS BOTH WAYS
 * -----------------------------------
 * A note about a fault links to the course that teaches it, and the course
 * links back to the notes. Somebody weighing a course wants evidence that the
 * teaching goes deeper than a syllabus page, and the archive is that evidence
 * — written before anybody asked for it, about problems nobody advertises.
 */
export async function CourseBatches({ course }: { course: Course }) {
  const [t, tc, rawLocale, result] = await Promise.all([
    getTranslations("courseDetail"),
    getTranslations("common"),
    getLocale(),
    getUpcomingBatches({ courseSlug: course.slug, limit: 4 })
  ]);
  const locale = asLocale(rawLocale);
  const rows = result.rows;
  const notes = notesForCourse(course.slug);

  return (
    <section className="band on-paper" id="batches" aria-labelledby="batches-heading">
      <div className="wrap">
        {/* Two columns only when there is something in the second one. A
            course with no published note would otherwise leave half the band
            empty, which reads as a missing module rather than as a choice. */}
        <div className={notes.length > 0 ? "split" : undefined}>
          <div className="min-w-0">
            <p className="t-micro">{t("batchesEyebrow")}</p>
            <h2 id="batches-heading" className="t-h2 mt-1.5">
              {t("batchesTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("batchesSub")}</p>

            {rows.length > 0 ? (
              <>
                {result.sample ? (
                  <p className="mt-4">
                    <span className="is-sample">{tc("sampleDataNote")}</span>
                  </p>
                ) : null}
                <ul className="board" role="list">
                  {rows.map((row) => {
                    const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
                    return (
                      <li key={row.id} className="board-row">
                        <span className="t-h4 numeric">{formatDate(row.startDate, locale)}</span>
                        <span className="t-meta numeric">
                          {row.days ? `${row.days} · ` : null}
                          {`${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`}
                        </span>
                        <span className="t-meta inline-flex items-center gap-1.5">
                          {seatsLeft === null ? null : seatsLeft <= 0 ? (
                            <>
                              <NeedlePoint state="todo" />
                              {t("batchFull")}
                            </>
                          ) : (
                            <>
                              <NeedlePoint state="now" />
                              {t("batchSeats", { count: seatsLeft })}
                            </>
                          )}
                        </span>
                        <Link
                          href={{
                            pathname: "/admission",
                            query: {
                              course: row.courseSlug,
                              batch: String(row.id),
                              src: "course"
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
                <p className="mt-5">
                  <Link href="/batches" className="act act-secondary">
                    {t("batchesAll")} <Icon name="arrow" size={16} className="arrow" />
                  </Link>
                </p>
              </>
            ) : (
              /* The normal state between intakes, written to read like it. */
              <div className="when-empty">
                <p className="t-h4">{t("batchesEmptyTitle")}</p>
                <p className="t-body mt-2">{t("batchesEmptyBody")}</p>
                <div className="when-empty-actions">
                  <Link
                    href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
                    className="act act-primary"
                  >
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

          {notes.length > 0 ? (
            <aside className="course-notes" aria-labelledby="course-notes-heading">
              <p className="t-micro" id="course-notes-heading">
                {t("notesTitle")}
              </p>
              <ul className="course-notes-list" role="list">
                {notes.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/notes/${n.slug}`} className="link-thread t-h4">
                      {pick(n, "question", locale)}
                    </Link>
                    <p className="t-meta mt-1">{pick(n, "answer", locale)}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5">
                <Link href="/notes" className="act-quiet">
                  {t("notesAll")} <Icon name="arrow" size={15} className="arrow" />
                </Link>
              </p>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
