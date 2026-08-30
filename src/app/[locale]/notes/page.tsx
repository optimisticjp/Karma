import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { Ledger, LedgerLink } from "@/components/ui/Ledger";
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
            <p className="mt-3">{t("asideBody")}</p>
          </>
        }
      />

      <section className="section">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <SectionHeading title={t("listTitle")} sub={t("listSub")} rule />
            <p className="microlabel tabular mb-1 shrink-0">
              {t("count", { count: machineNotes.length })}
            </p>
          </div>

          <Ledger className="u-section-body">
            {machineNotes.map((n, i) => {
              const course = courseBySlug(n.courseSlug);
              return (
                <LedgerLink
                  key={n.slug}
                  href={`/notes/${n.slug}`}
                  index={String(i + 1).padStart(2, "0")}
                  title={gu ? n.questionGu : n.questionEn}
                  meta={course ? (gu ? course.nameGu : course.nameEn) : undefined}
                  note={gu ? n.answerGu : n.answerEn}
                />
              );
            })}
          </Ledger>
        </div>
      </section>
    </>
  );
}
