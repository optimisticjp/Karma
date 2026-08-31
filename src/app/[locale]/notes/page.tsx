import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { NoteSpec } from "@/components/notes/NoteSpec";
import { MonoNote } from "@/components/ui/MonoNote";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { machineNotes } from "@/content/notes";
import { courseBySlug } from "@/content/courses";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.notes" });
  return pageMeta({ locale, path: "/notes", title: t("title"), description: t("description") });
}

/**
 * Machine Notes index.
 *
 * A ledger of questions rather than a grid of article cards. Every note is
 * titled with the question someone actually types, so the index reads as a
 * list of answers — which is both the honest description of what it is and
 * the thing a search engine can match against.
 *
 * Not a blog: no dates, no author bylines, no "read more". A note is either
 * still true or it gets corrected, and neither is a function of when it was
 * written.
 *
 * The index reads as a technical archive rather than a reading list: each row
 * carries its note number, its technique and the fault it is about, so an
 * operator scanning for the problem they are hitting today finds it without
 * reading eight answers. That notation runs at full strength here and on a
 * note page, and deliberately nowhere else — if the whole site looked like
 * this, it would stop meaning "this is a record" and start meaning "this is
 * how the brand decorates".
 */
export default async function NotesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, l] = await Promise.all([
    getTranslations("notesPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/courses" className="btn btn-secondary">
              {t("coursesCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("asideTitle")}</p>
            <p className="mt-1.5">{t("asideBody")}</p>
          </>
        }
      />

      <section className="section band-info">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <SectionHeading title={t("listTitle")} sub={t("listSub")} rule />
            <MonoNote className="mb-1 shrink-0">
              {t("count", { count: machineNotes.length })}
            </MonoNote>
          </div>

          <ol className="note-archive u-section-body">
            {machineNotes.map((n, i) => {
              const course = courseBySlug(n.courseSlug);
              return (
                <li key={n.slug} className="note-archive-row">
                  <Link href={`/notes/${n.slug}`} className="note-archive-link">
                    <NoteSpec
                      index={i + 1}
                      technique={course ? (gu ? course.nameGu : course.nameEn) : undefined}
                      issueLabel={t("issueLabel")}
                      issue={gu ? n.issueGu : n.issueEn}
                      className="note-archive-spec"
                    />
                    <span className="note-archive-body">
                      <span className="note-archive-question">
                        {gu ? n.questionGu : n.questionEn}
                      </span>
                      <span className="note-archive-answer">{gu ? n.answerGu : n.answerEn}</span>
                    </span>
                    <Icon name="arrow" size={18} className="note-archive-arrow arrow" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
