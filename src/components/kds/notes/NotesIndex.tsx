"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * THE ARCHIVE — every note, findable by the fault you are hitting today.
 *
 * WHY IT HAS A SEARCH AND THE REST OF THE SITE DOES NOT
 * ----------------------------------------------------
 * Nobody browses machine notes. They arrive with a specific fault — thread
 * breaking, a puckered fill, sequins out of register — and want the one note
 * about it. A list of eight is scannable; a list of thirty is not, and this
 * archive is written to grow. The filter is by COURSE, because that is the
 * taxonomy the notes actually carry, and the search matches the question, the
 * fault label and the note's own tags rather than the whole answer, so a
 * common word does not return everything.
 *
 * **It is an enhancement, not a gate.** Every note is rendered on the server
 * with nothing hidden; the controls narrow what is already there, so a visitor
 * with no JavaScript sees the complete archive.
 *
 * NOT A BLOG
 * ----------
 * No dates, no bylines, no "read more". A note is either still true or it gets
 * corrected, and neither is a function of when it was written.
 */

export type NoteRow = {
  slug: string;
  courseSlug: string;
  courseNameEn?: string;
  courseNameGu?: string;
  tags: string[];
  questionEn: string;
  questionGu: string;
  answerEn: string;
  answerGu: string;
  issueEn: string;
  issueGu: string;
};

export function NotesIndex({ notes }: { notes: NoteRow[] }) {
  const t = useTranslations("notesPage");
  const locale = asLocale(useLocale());
  const rawLocale = useLocale();
  const [course, setCourse] = useState("all");
  const [query, setQuery] = useState("");

  const courseChips = useMemo(() => {
    const seen = new Map<string, { slug: string; name: string; count: number }>();
    for (const note of notes) {
      const name = pick(note, "courseName", locale) || note.courseSlug;
      const found = seen.get(note.courseSlug);
      if (found) found.count += 1;
      else seen.set(note.courseSlug, { slug: note.courseSlug, name, count: 1 });
    }
    return [...seen.values()];
  }, [notes, locale]);

  const needle = query.trim().toLowerCase();
  const shown = notes.filter((note) => {
    if (course !== "all" && note.courseSlug !== course) return false;
    if (!needle) return true;
    /* The question, the fault and the tags — not the answer. Matching the
       whole answer makes a common word return every note. */
    const haystack = [
      pick(note, "question", locale),
      pick(note, "issue", locale),
      note.questionEn,
      note.issueEn,
      ...note.tags
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  return (
    <section className="band on-canvas" aria-labelledby="archive-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("listEyebrow")}</p>
          <h2 id="archive-heading" className="t-h2 mt-1.5">
            {t("listTitle")}
          </h2>
          <p className="t-lede mt-3">{t("listSub")}</p>
        </header>

        <div className="notes-controls">
          <div>
            <label className="label" htmlFor="notes-search">
              {t("searchLabel")}
            </label>
            <input
              id="notes-search"
              type="search"
              className="input"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="book-tabs" role="group" aria-label={t("filterCourse")}>
            <button
              type="button"
              aria-pressed={course === "all"}
              onClick={() => setCourse("all")}
              className={cn("chip", course === "all" && "is-on")}
            >
              {t("filterAll")}
              <span className="t-micro numeric opacity-70">{notes.length}</span>
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
        </div>

        {shown.length > 0 ? (
          <ol className="notes" role="list">
            {shown.map((note, i) => (
              <li key={note.slug}>
                <Link href={`/notes/${note.slug}`} className="note-row">
                  <span className="note-mark" aria-hidden="true">
                    <NeedlePoint state="now" />
                    <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="t-micro note-issue">
                      {t("issueLabel")} · {pick(note, "issue", locale)}
                    </span>
                    <span className="t-h4 mt-1 block">{pick(note, "question", locale)}</span>
                    <span className="t-meta note-answer mt-1 block">
                      {pick(note, "answer", locale)}
                    </span>
                  </span>
                  <Icon name="arrow" size={17} className="note-arrow arrow" />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="when-empty">
            <p className="t-h4">{t("searchEmpty")}</p>
            <div className="when-empty-actions">
              <button
                type="button"
                className="act act-secondary"
                onClick={() => {
                  setQuery("");
                  setCourse("all");
                }}
              >
                {t("searchClear")}
              </button>
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite" lang={rawLocale}>
          {t("count", { count: shown.length })}
        </p>
      </div>
    </section>
  );
}
