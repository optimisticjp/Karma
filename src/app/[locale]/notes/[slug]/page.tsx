import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { TrackedLink } from "@/components/site/TrackedLink";
import { Icon } from "@/components/ui/Icon";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { CtaBand } from "@/components/kds/CtaBand";
import { machineNotes, noteBySlug } from "@/content/notes";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { getPublicCourseBySlug } from "@/lib/course/public";
import { breadcrumbSchema, noteSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { pick, pickList } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";

/** Related-course visibility is Console-backed. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    machineNotes.map((n) => ({ locale, slug: n.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const note = noteBySlug(slug);
  if (!note) return {};
  const l = asLocale(locale);
  return pageMeta({
    locale,
    path: `/notes/${slug}`,
    title: `${pick(note, "question", l)} | Karma Design Studio`,
    description: pick(note, "answer", l)
  });
}

export default async function NotePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const note = noteBySlug(slug);
  if (!note) notFound();

  const [t, tc, tcr, rawLocale, course] = await Promise.all([
    getTranslations("notesPage"),
    getTranslations("common"),
    getTranslations("crumbs"),
    getLocale(),
    getPublicCourseBySlug(note.courseSlug)
  ]);
  const l = asLocale(rawLocale);
  const others = machineNotes.filter((n) => n.slug !== note.slug).slice(0, 3);
  const noteIndex = machineNotes.findIndex((n) => n.slug === note.slug) + 1;
  const question = pick(note, "question", l);
  const answer = pick(note, "answer", l);

  const articleLd = noteSchema({
    slug: note.slug,
    headline: note.questionEn,
    description: note.answerEn,
    locale: l,
    courseName: course?.nameEn
  });

  const crumbs = breadcrumbSchema(
    l,
    [
      [tcr("notes"), "/notes"],
      [pick(note, "question", l), `/notes/${note.slug}`]
    ],
    tcr("home")
  );

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={crumbs} />

      <section className="band-hero on-paper" aria-labelledby="note-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro note-issue">
                {t("issueLabel")} · {pick(note, "issue", l)}
              </p>
              <h1 id="note-heading" className="t-h1 mt-3">
                {question}
              </h1>
              <p className="t-lede mt-4 max-w-[52ch]">{answer}</p>

              <ThreadLine draw className="my-6 w-28" />

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/notes" className="act act-secondary">
                  {t("allNotes")}
                </Link>
                <TrackedLink
                  href={`tel:+${site.callPhone}`}
                  event="call_demo_click"
                  props={{ surface: "note", course: note.courseSlug }}
                  className="act-quiet"
                >
                  <Icon name="phone" size={16} /> {t("askCta")}
                </TrackedLink>
              </div>
            </div>

            {course ? (
              <aside className="courses-aside">
                <p className="t-micro">{t("relatedCourse")}</p>
                <StitchSwatch slug={course.slug} className="note-course-swatch" />
                <p className="t-h4 mt-3">{pick(course, "name", l)}</p>
                <p className="t-meta mt-2">
                  {pick(course.production, "produces", l)}
                </p>
                <p className="mt-4">
                  <TrackedLink
                    href={`/${l}/courses/${course.slug}`}
                    event="note_course_click"
                    props={{ note: note.slug, course: course.slug, surface: "note" }}
                    className="act-quiet"
                  >
                    {t("courseCta")} <Icon name="arrow" size={15} className="arrow" />
                  </TrackedLink>
                </p>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <section className="band on-mist">
        <div className="wrap">
          <div className="split">
            <div className="reading-shell">
              <p className="t-micro numeric">
                {t("noteIndexLabel", { n: noteIndex, total: machineNotes.length })}
              </p>

              <h2 className="t-h3 mt-6">{t("whyTitle")}</h2>
              <ThreadLine draw className="mt-3 w-16" />
              <p className="t-body mt-4">{pick(note, "why", l)}</p>

              <h2 className="t-h3 mt-8">{t("detailTitle")}</h2>
              <ThreadLine draw className="mt-3 w-16" />
              <p className="t-body mt-4">{pick(note, "detail", l)}</p>

              <h2 className="t-h3 mt-8">{t("exampleTitle")}</h2>
              <ThreadLine draw className="mt-3 w-16" />
              <p className="t-body mt-4">{pick(note, "example", l)}</p>
              <p className="t-meta mt-3">{t("exampleNote")}</p>
            </div>

            <div className="fee-sheet">
              <p className="t-micro">{t("checksTitle")}</p>
              <ol className="pathway mt-4" role="list">
                {pickList(note, "checks", l).map((c, i, all) => (
                  <li key={c} className="pathway-step">
                    <span className="pathway-mark" aria-hidden="true">
                      <NeedlePoint state={i === all.length - 1 ? "todo" : "done"} />
                      {i < all.length - 1 ? (
                        <ThreadLine vertical className="pathway-thread" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                      <span className="t-body mt-0.5 block">{c}</span>
                    </span>
                  </li>
                ))}
              </ol>

              {note.reelUrl || note.youtubeUrl ? (
                <p className="mt-5">
                  <a
                    href={note.reelUrl ?? note.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="act act-secondary"
                  >
                    {t("watchCta")}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="band-tight on-canvas" aria-labelledby="more-notes">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro" id="more-notes">
                {t("moreTitle")}
              </p>
              <ul className="notes mt-4" role="list">
                {others.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/notes/${n.slug}`} className="note-row">
                      <span className="min-w-0">
                        <span className="t-micro note-issue">{pick(n, "issue", l)}</span>
                        <span className="t-h4 mt-1 block">
                          {pick(n, "question", l)}
                        </span>
                      </span>
                      <Icon name="arrow" size={17} className="note-arrow arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <p className="t-micro">{t("demoTitle")}</p>
              <p className="t-body mt-2 max-w-[44ch]">{t("demoBody")}</p>
              <p className="mt-4">
                <Link href="/admission" className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={t("closeH2")} sub={t("closeSub")} ground="on-cloth" />
    </>
  );
}
