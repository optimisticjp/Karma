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

/** Open Console batches for this course, including intakes already underway
 * but still accepting students. The batch label is the same one staff sees. */
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
        <div className={notes.length > 0 ? "split" : undefined}>
          <div className="min-w-0">
            <p className="t-micro">{t("batchesEyebrow")}</p>
            <h2 id="batches-heading" className="t-h2 mt-1.5">{t("batchesTitle")}</h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("batchesSub")}</p>

            {rows.length > 0 ? (
              <>
                {result.sample ? (
                  <p className="mt-4"><span className="is-sample">{tc("sampleDataNote")}</span></p>
                ) : null}
                <ul className="board" role="list">
                  {rows.map((row) => {
                    const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
                    return (
                      <li key={row.id} className="board-row">
                        <span>
                          <span className="t-h4 block">{row.label}</span>
                          <span className="t-meta numeric mt-0.5 block">{formatDate(row.startDate, locale)}</span>
                        </span>
                        <span className="t-meta numeric">
                          {row.days ? `${row.days} · ` : null}
                          {`${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`}
                        </span>
                        <span className="t-meta inline-flex items-center gap-1.5">
                          {seatsLeft === null ? null : seatsLeft <= 0 ? (
                            <><NeedlePoint state="todo" />{t("batchFull")}</>
                          ) : (
                            <><NeedlePoint state="now" />{t("batchSeats", { count: seatsLeft })}</>
                          )}
                        </span>
                        <Link
                          href={{
                            pathname: "/admission",
                            query: { course: row.courseSlug, batch: String(row.id), src: "course" }
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
              <p className="t-micro" id="course-notes-heading">{t("notesTitle")}</p>
              <ul className="course-notes-list" role="list">
                {notes.map((note) => (
                  <li key={note.slug}>
                    <Link href={`/notes/${note.slug}`} className="link-thread t-h4">
                      {pick(note, "question", locale)}
                    </Link>
                    <p className="t-meta mt-1">{pick(note, "answer", locale)}</p>
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
