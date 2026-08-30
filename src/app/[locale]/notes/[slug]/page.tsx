import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchRule } from "@/components/ui/StitchPath";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import { JsonLd } from "@/components/site/JsonLd";
import { TrackedLink } from "@/components/site/TrackedLink";
import { Icon } from "@/components/ui/Icon";
import { machineNotes, noteBySlug } from "@/content/notes";
import { courseBySlug, coursesByFamily } from "@/content/courses";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

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
  const gu = locale === "gu";
  return pageMeta({
    locale,
    path: `/notes/${slug}`,
    title: `${gu ? note.questionGu : note.questionEn} | Karma Design Studio`,
    description: gu ? note.answerGu : note.answerEn
  });
}

/**
 * One machine note.
 *
 * The order is the order a person needs it: the question, then the answer in
 * two sentences, then why it happens, then what to check. Someone standing at
 * a machine with a bad sample gets their answer in the first screen; someone
 * deciding whether to learn this properly reads on and finds the course.
 *
 * Emitted as `TechArticle` rather than `BlogPosting` — these are reference
 * notes, not posts, and there is no publication date to claim. No author
 * `Person` is emitted, because no trainer has been confirmed and a fabricated
 * byline is exactly the kind of thing structured data must never carry.
 */
export default async function NotePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const note = noteBySlug(slug);
  if (!note) notFound();

  const [t, tc, l] = await Promise.all([
    getTranslations("notesPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";
  const course = courseBySlug(note.courseSlug);
  const position = course ? coursesByFamily.findIndex((c) => c.slug === course.slug) : 0;
  const others = machineNotes.filter((n) => n.slug !== note.slug).slice(0, 3);
  const question = gu ? note.questionGu : note.questionEn;
  const answer = gu ? note.answerGu : note.answerEn;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: note.questionEn,
    description: note.answerEn,
    inLanguage: gu ? "gu" : "en",
    // The studio is the author. No invented person.
    publisher: { "@id": `${site.url}/#studio` },
    about: course ? { "@type": "Course", name: course.nameEn } : undefined
  };

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/${l}` },
      { "@type": "ListItem", position: 2, name: "Machine Notes", item: `${site.url}/${l}/notes` },
      { "@type": "ListItem", position: 3, name: note.questionEn, item: `${site.url}/${l}/notes/${note.slug}` }
    ]
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={crumbs} />

      <PageIntro
        eyebrow={t("eyebrow")}
        title={question}
        lede={answer}
        actions={
          <>
            <Link href="/notes" className="btn btn-secondary">
              {t("allNotes")}
            </Link>
            <TrackedLink
              href={`tel:+${site.callPhone}`}
              event="call_demo_click"
              props={{ surface: "note", course: note.courseSlug }}
              className="cta-tertiary"
            >
              <Icon name="phone" size={16} /> {t("askCta")}
            </TrackedLink>
          </>
        }
        aside={
          course ? (
            <>
              <p className="microlabel !text-vermilion-deep">{t("relatedCourse")}</p>
              <div className="note-course-plate">
                <TechniquePlate variant={course.family} seed={position} />
              </div>
              <p className="mt-3 font-display text-h4">{gu ? course.nameGu : course.nameEn}</p>
              <p className="mt-2 text-smallmeta text-stone">
                {gu ? course.production.producesGu : course.production.producesEn}
              </p>
              <p className="u-actions">
                <Link
                  href={`/courses/${course.slug}`}
                  className="stitch-link inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
                >
                  {t("courseCta")} <Icon name="arrow" size={15} className="arrow" />
                </Link>
              </p>
            </>
          ) : null
        }
      />

      <section className="section">
        <div className="container-site split">
          <div className="reading-shell">
            <h2 className="text-h3 font-display">{t("whyTitle")}</h2>
            <StitchRule draw className="mt-4 max-w-[4.5rem]" />
            <p className="mt-5 text-stone">{gu ? note.whyGu : note.whyEn}</p>

            <h2 className="text-h3 mt-10 font-display">{t("detailTitle")}</h2>
            <StitchRule draw className="mt-4 max-w-[4.5rem]" />
            <p className="mt-5 text-stone">{gu ? note.detailGu : note.detailEn}</p>

            <h2 className="text-h3 mt-10 font-display">{t("exampleTitle")}</h2>
            <StitchRule draw className="mt-4 max-w-[4.5rem]" />
            <p className="mt-5 text-stone">{gu ? note.exampleGu : note.exampleEn}</p>
            <p className="mt-4 text-smallmeta text-stone">{t("exampleNote")}</p>
          </div>

          <div className="surface surface-feature">
            <p className="microlabel !text-vermilion-deep">{t("checksTitle")}</p>
            <ol className="note-checks">
              {(gu ? note.checksGu : note.checksEn).map((c, i) => (
                <li key={c}>
                  <span className="note-check-index tabular" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>

            {/* Video block renders only when the owner has supplied a verified
                link. Outbound, never an embedded player. */}
            {note.reelUrl || note.youtubeUrl ? (
              <p className="u-actions">
                <a
                  href={note.reelUrl ?? note.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full"
                >
                  {t("watchCta")}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("demoTitle")} sub={t("demoBody")} />
            <p className="u-actions action-row">
              <Link href="/admission" className="btn btn-primary">
                {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
            </p>
          </div>
          <div>
            <p className="microlabel">{t("moreTitle")}</p>
            <ul className="stack-lines mt-4">
              {others.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${n.slug}`}
                    className="stitch-link inline-flex min-h-8 items-center font-semibold"
                  >
                    {gu ? n.questionGu : n.questionEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
