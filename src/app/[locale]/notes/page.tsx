import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { machineNotes } from "@/content/notes";
import { courseBySlug } from "@/content/courses";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { NotesIndex, type NoteRow } from "@/components/kds/notes/NotesIndex";
import { CtaBand } from "@/components/kds/CtaBand";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
 * MACHINE NOTES — the archive.
 *
 * Three blocks: what this is, the searchable archive, and one action.
 *
 * Every note is titled with the QUESTION somebody actually types, so the index
 * reads as a list of answers — which is both the honest description of what it
 * is and the thing a search engine can match against.
 *
 * **Not a blog.** No dates, no author bylines, no "read more". A note is
 * either still true or it gets corrected, and neither is a function of when it
 * was written.
 *
 * The archive notation — the fault label on every row — runs at full strength
 * here and on a note page, and deliberately nowhere else. If the whole site
 * looked like this it would stop meaning "this is a record" and start meaning
 * "this is how the brand decorates".
 */
export default async function NotesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("notesPage"), getTranslations("common")]);

  /* Flattened on the server so the client control ships rows rather than the
     whole catalogue module. */
  const notes: NoteRow[] = machineNotes.map((n) => {
    const course = courseBySlug(n.courseSlug);
    return {
      slug: n.slug,
      courseSlug: n.courseSlug,
      courseNameEn: course?.nameEn,
      courseNameGu: course?.nameGu,
      tags: n.tags,
      questionEn: n.questionEn,
      questionGu: n.questionGu,
      answerEn: n.answerEn,
      answerGu: n.answerGu,
      issueEn: n.issueEn,
      issueGu: n.issueGu
    };
  });

  return (
    <>
      <section className="band-hero on-paper" aria-labelledby="notes-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">{t("eyebrow")}</p>
              <h1 id="notes-heading" className="t-h1 mt-3">
                {t("title")}
              </h1>
              <p className="t-lede mt-4 max-w-[46ch]">{t("sub")}</p>

              <ThreadLine draw className="my-6 w-28" />

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/admission" className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <Link href="/courses" className="act act-secondary">
                  {t("coursesCta")}
                </Link>
              </div>
            </div>

            <aside className="courses-aside">
              <p className="t-micro">{t("asideTitle")}</p>
              <p className="t-body mt-2">{t("asideBody")}</p>
              <ThreadLine className="my-5" />
              <p className="t-micro">{t("countLabel")}</p>
              <p className="t-h3 numeric mt-1">{machineNotes.length}</p>
            </aside>
          </div>
        </div>
      </section>

      <NotesIndex notes={notes} />

      <CtaBand title={t("closeH2")} sub={t("closeSub")} ground="on-cloth" />
    </>
  );
}
