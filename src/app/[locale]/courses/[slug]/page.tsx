import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BatchTable } from "@/components/course/BatchTable";
import { MachineIndex } from "@/components/courses/MachineIndex";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { FaqList } from "@/components/site/FaqList";
import { PageIntro } from "@/components/ui/PageIntro";
import { TechniqueSignature } from "@/components/ui/TechniqueSignature";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { MonoNote } from "@/components/ui/MonoNote";
import { coursePhotoFor } from "@/content/photo-manifest";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SampleTag } from "@/components/ui/SampleTag";
import { TrackedLink } from "@/components/site/TrackedLink";
import { TrackView } from "@/components/site/TrackView";
import { JsonLd } from "@/components/site/JsonLd";
import { courseBySlug, coursesInFamily, families } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";
import { CourseOperations } from "@/components/course/CourseOperations";
import { notesForCourse } from "@/content/notes";
import { faqs, trainers } from "@/content/collections";
import { site, waLink } from "@/lib/site";
import { breadcrumbSchema, courseSchema } from "@/lib/schema";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";
import { ActionDock } from "@/components/kds/shell/ActionDock";

// Batch data is live -> per-request rendering.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};
  const gu = locale === "gu";
  return pageMeta({
    locale,
    path: `/courses/${slug}`,
    title: `${gu ? course.nameGu : course.nameEn} | Karma Design Studio`,
    /* What the technique produces, plus where it is taught. People search for
       the work and the city together — "zardosi class Surat" — so the snippet
       has to carry both, and every course's is different because every
       `produces` line is different. */
    description: `${gu ? course.production.producesGu : course.production.producesEn} ${
      gu ? "મોટા વરાછા, સુરતમાં મશીન પર શીખો." : "Taught on live machines in Mota Varachha, Surat."
    }`
  });
}

/**
 * Course detail — ordered around commercial outcomes, not around a syllabus.
 *
 * The old page led with who it's for and then went straight to modules, which
 * is how a brochure is written and not how anyone decides. A prospective
 * student — often already running a machine — wants to know what this
 * technique makes, whether it fixes the fault they keep hitting, what it runs
 * on, and what the work sells as. Modules answer none of that, so they now sit
 * near the bottom in a native `<details>` accordion where the people who do
 * want them can find them.
 *
 * Every technical claim on this page is trade knowledge about the technique,
 * held in `course.production`. Nothing asserts a duration, a fee, a student
 * outcome or a placement.
 *
 * WHY NO TWO OF THESE ELEVEN PAGES READ THE SAME
 * ----------------------------------------------
 * Everything above the fold is per-course: the technique's own signature, its
 * own photograph where the shoot covers it, what it physically produces, the
 * faults its training exists to fix, what it runs on, and what the finished
 * work sells as. A visitor comparing zardosi with sequence work is reading two
 * genuinely different pages, not one template with the nouns swapped.
 *
 * PHOTOGRAPH WHERE THERE IS ONE, SIGNATURE ALWAYS
 * -----------------------------------------------
 * Eight of the eleven courses are covered by the studio shoot. Those eight get
 * their own frame; the other three do not get a borrowed one, and are not
 * quietly demoted for it. The technique signature is on ALL eleven, because it
 * describes the structure of the stitch and is therefore true of the technique
 * whether or not anyone has photographed it yet.
 */
export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const course = courseBySlug(slug);
  if (!course) notFound();

  const [t, to, tc, tn, l] = await Promise.all([
    getTranslations("courseDetail"),
    getTranslations("courseOps"),
    getTranslations("common"),
    getTranslations("notesPage"),
    getLocale()
  ]);
  const gu = l === "gu";
  const fam = families[course.family];
  const p = course.production;
  /* Three, not eight. The machine family has nine courses, so an uncapped
     related list added 2,500px of cards to the bottom of a phone page that
     nobody scrolls that far into. The catalogue link carries the rest. */
  const related = coursesInFamily(course.family)
    .filter((c) => c.slug !== course.slug)
    .slice(0, 3);
  const name = gu ? course.nameGu : course.nameEn;

  /* The trainer who covers this family, found by slug rather than by array
     index so re-ordering the list cannot silently reassign courses to the
     wrong person. Every profile is still sample data, so the card says so. */
  const trainerSlug =
    course.family === "software"
      ? "sample-design-trainer"
      : course.family === "modern"
        ? "sample-modern-trainer"
        : "sample-machine-trainer";
  const trainer = trainers.find((tr) => tr.slug === trainerSlug) ?? trainers[0];

  /* Notes that answer a question about this technique. The link runs both
     ways — a note sends a reader to its course, and a course sends a reader
     to the notes — because someone weighing a course wants evidence that the
     teaching goes deeper than the syllabus page. */
  const notes = notesForCourse(course.slug);

  const crumbs = breadcrumbSchema(gu ? "gu" : "en", [
    [gu ? "કોર્સિસ" : "Courses", "/courses"],
    [name, `/courses/${course.slug}`]
  ]);

  /* No offers, no price, no rating — see src/lib/schema.ts. `timeRequired`
     appears only where the owner has confirmed a duration in writing. */
  const courseLd = courseSchema(course, gu ? "gu" : "en");

  /* Verified operational facts, where the owner has supplied them. Today that
     is EMCAD DAHAO Embroidery Designing and nothing else; every other course
     keeps the honest "ask at your demo" fee and duration copy below. */
  const verified = verifiedOperationsFor(course.slug);

  /* The studio shoot covers eight of the eleven. A course it does not cover
     keeps its signature and gets no substitute — never another course's
     photograph, never stock. */
  const photo = coursePhotoFor(course.slug);

  const waCourse = `Hi Karma Design Studio! 👑 મને "${name}" કોર્સનો ફ્રી ડેમો બુક કરવો છે. નામ: ____ | ટાઇમ: સવાર/સાંજ`;

  const durationFact = course.durationMonths
    ? to("durationValue", { months: course.durationMonths })
    : course.durationWeeks
      ? t("weeks", { count: course.durationWeeks })
      : t("confirmDuration");

  const facts: Array<[string, string]> = [
    [t("durationLabel"), durationFact],
    ...(verified ? ([[t("softwareTitle"), verified.software]] as Array<[string, string]>) : []),
    [t("levelLabel"), t("levelValue")],
    [t("langLabel"), t("langValue")]
  ];

  return (
    <>
      <JsonLd data={courseLd} />
      <JsonLd data={crumbs} />
      <TrackView event="course_view" props={{ course: course.slug }} />

      {/* 1. What this technique produces. It is the lede, because it is the
             only sentence that answers "is this the work I want to do?" */}
      <PageIntro
        eyebrow={gu ? fam.nameGu : fam.nameEn}
        title={name}
        lede={gu ? p.producesGu : p.producesEn}
        actions={
          <>
            <Link
              href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
              className="btn btn-primary"
            >
              {t("demoCta")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <TrackedLink
              href={`tel:+${site.callPhone}`}
              event="call_demo_click"
              props={{ surface: "course", course: course.slug }}
              className="btn btn-secondary"
            >
              <Icon name="phone" size={17} /> {t("callCta")}
            </TrackedLink>
          </>
        }
        aside={
          <>
            <figure className="course-mark">
              {photo ? (
                <ManifestPhoto id={photo.id} editorial className="course-mark-photo" />
              ) : null}
              <div className="course-signature">
                <MonoNote as="p">{t("signatureLabel")}</MonoNote>
                <TechniqueSignature slug={course.slug} />
              </div>
              {/* What the signature draws, in the reader's language. The
                  English spec note on TECHNIQUE_SIGNATURES is the internal
                  record; this is the sentence a visitor reads. */}
              <figcaption className="course-signature-note">
                {t(`signatures.${course.slug}` as "signatures.zardosi-machine-embroidery")}
              </figcaption>
            </figure>
            <dl className="ledger !border-t-0">
              {facts.map(([label, value]) => (
                <div key={label} className="ledger-row is-labelled">
                  <dt className="ledger-title !text-smallmeta">{label}</dt>
                  <dd className="ledger-note !mt-0 font-semibold !text-carbon">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        }
      />

      {/* 2. The facts the institute publishes about this course: duration,
             software, batch timings, the free demo, what is taught, and the
             complete fee plan. Rendered only where the owner has confirmed
             them in writing — see src/content/course-operations.ts.

             Moved ahead of the essay on 2026-08-31. On the one course that
             HAS a confirmed duration and a published fee, those figures sat
             behind the intro, the drawn signature and a two-column essay —
             about 3,900px, roughly 4.6 phone screens, to reach the number a
             visitor came for. Who it is for reads better after you know
             what it costs. */}
      {verified ? (
        <CourseOperations
          verified={verified}
          locale={gu ? "gu" : "en"}
          copy={{
            factsTitle: to("factsTitle"),
            durationLabel: to("durationLabel"),
            durationValue: to("durationValue", { months: verified.durationMonths }),
            softwareLabel: to("softwareLabel"),
            softwareNote: to("softwareNote"),
            demoLabel: to("demoLabel"),
            demoValue: to("demoValue", {
              days: verified.operations.demo?.days ?? 0,
              hours: verified.operations.demo?.hours ?? 0
            }),
            batchTitle: to("batchTitle"),
            batchSub: to("batchSub"),
            hours: (n: number) => to("hours", { hours: n }),
            demoTitle: to("demoTitle"),
            demoSub: to("demoSub"),
            teachTitle: to("teachTitle"),
            teachSub: to("teachSub"),
            practicalTitle: to("practicalTitle"),
            feeTitle: to("feeTitle"),
            feeTotal: to("feeTotal"),
            feeAdmission: to("feeAdmission"),
            feeBalance: to("feeBalance"),
            feeBalanceNote: to("feeBalanceNote"),
            feeOffline: to("feeOffline")
          }}
        />
      ) : null}

      {/* 2 + 7. Who it is for, and what you will be able to do. */}
      <section className="section">
        <div className="container-site split">
          <div>
            <h2 className="text-h3 font-display">{t("whoTitle")}</h2>
                        <p className="prose-measure mt-2 text-stone">{gu ? course.whoGu : course.whoEn}</p>
          </div>
          <div>
            <h2 className="text-h3 font-display">{t("skillsTitle")}</h2>
                        <ul className="mt-2 space-y-1.5">
              {(gu ? course.outcomesGu : course.outcomesEn).map((o) => (
                <li key={o} className="flex gap-2 text-smallmeta">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" strokeWidth={2} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. The production problems this technique's training exists to fix.
             Named faults, not adjectives: an operator who recognises one of
             these has just been told what this course is for. */}
      <section className="section bg-ivory-2">
        <div className="container-site">
          <SectionHeading eyebrow={t("problemsEyebrow")} title={t("problemsTitle")} sub={t("problemsSub")} rule />
          <ol className="problem-list u-section-body">
            {(gu ? p.problemsGu : p.problemsEn).map((row) => (
              <li key={row} className="problem-row">
                <p className="problem-fault">{row}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 + 5. What it runs on, and what the hands actually do. */}
      <section className="section">
        <div className="container-site split">
          <div className="surface surface-machine surface-feature">
            <p className="microlabel">{t("machineTitle")}</p>
            <p className="mt-3 text-bodylg font-semibold">{gu ? p.machineGu : p.machineEn}</p>
            {p.softwareEn ? (
              <>
                <p className="microlabel mt-6">{t("softwareTitle")}</p>
                <p className="mt-3 text-smallmeta">{gu ? p.softwareGu : p.softwareEn}</p>
              </>
            ) : null}
          </div>
          <div>
            <h2 className="text-h3 font-display">{t("practiceTitle")}</h2>
                        <p className="prose-measure mt-2 text-stone">{gu ? p.practiceGu : p.practiceEn}</p>
            <p className="mt-5 text-smallmeta text-stone">{t("practiceNote")}</p>
          </div>
        </div>
      </section>

      {/* 6. What the finished work sells as. */}
      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("outputsTitle")} sub={t("outputsSub")} />
          <ul className="output-list u-section-body">
            {(gu ? p.outputsGu : p.outputsEn).map((o, i) => (
              <li key={o} className="output-item">
                <span className="output-index tabular" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8 + 9. Proof, and who teaches it. Both are honest about what does not
             exist yet rather than filling the space. */}
      <section className="section">
        <div className="container-site split">
          <div>
            <h2 className="text-h3 font-display">{t("proofTitle")}</h2>
                        <p className="prose-measure mt-2 text-stone">{t("proofBody")}</p>
            <p className="u-actions action-row">
              <Link href="/student-work" className="btn btn-secondary">
                {t("proofCta")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
            </p>
          </div>
          <div className="surface">
            <p className="microlabel">{t("trainerTitle")}</p>
            <p className="mt-3 font-display text-h4">{gu ? trainer.nameGu : trainer.nameEn}</p>
            <p className="mt-1 text-smallmeta font-semibold text-vermilion-deep">
              {gu ? trainer.roleGu : trainer.roleEn}
            </p>
            <p className="mt-3 text-smallmeta text-stone">{gu ? trainer.focusGu : trainer.focusEn}</p>
            {trainer.sample ? (
              <p className="mt-4">
                <SampleTag />
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 10. Current batches, live from the database. */}
      <section className="section bg-ivory-2" id="batches">
        <div className="container-site">
          <SectionHeading title={t("batchesTitle")} sub={t("batchesSub")} />
          <div className="u-section-body">
            <BatchTable courseSlug={course.slug} limit={6} />
          </div>
        </div>
      </section>

      {/* 11 + 12. The fee answer, and the demo. There is no public price list
             and no gateway; saying so plainly beats an evasive blank. */}
      <section className="section">
        <div className="container-site split">
          <div>
            <h2 className="text-h3 font-display">{t("feeTitle")}</h2>
                        {/* A course with a published, owner-verified fee plan states it in
                full above; repeating "there is no public price list" underneath
                would contradict the block a reader has just read. */}
            <p className="prose-measure mt-2 text-stone">
              {verified ? to("feeOffline") : t("feeBody")}
            </p>
            <p className="mt-4 text-smallmeta text-stone">{t("feeNote")}</p>
          </div>
          <div className="surface surface-feature">
            <p className="microlabel !text-vermilion-deep">{t("demoTitle")}</p>
            <p className="mt-3 text-bodylg">{t("demoBody")}</p>
            <div className="u-actions action-row">
              <Link
                href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
                className="btn btn-primary"
              >
                {t("demoCta")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              <TrackedLink
                href={waLink(waCourse)}
                event="whatsapp_click"
                props={{ surface: "course", course: course.slug }}
                external
                className="btn btn-secondary"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {notes.length > 0 ? (
        <section className="section-compact">
          <div className="container-site split">
            <div>
              <SectionHeading title={tn("courseNotesTitle")} sub={tn("courseNotesSub")} />
              <p className="u-actions action-row">
                <Link href="/notes" className="btn btn-secondary">
                  {tn("allNotes")} <Icon name="arrow" size={18} className="arrow" />
                </Link>
              </p>
            </div>
            <ul className="stack-lines">
              {notes.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${n.slug}`}
                    className="stitch-link inline-flex min-h-8 items-center font-semibold"
                  >
                    {gu ? n.questionGu : n.questionEn}
                  </Link>
                  <p className="mt-1 text-smallmeta text-stone">{gu ? n.answerGu : n.answerEn}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 13. FAQ. */}
      <section className="section bg-ivory-2">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("faqTitle")} />
            <div className="surface mt-8">
              <p className="microlabel !text-vermilion-deep">{t("certTitle")}</p>
              <p className="mt-3 text-smallmeta text-stone">{t("certBody")}</p>
            </div>
          </div>
          <FaqList items={faqs.slice(0, 4)} />
        </div>
      </section>

      {/* Secondary: the syllabus, for the people who came looking for it.
          Native <details>, so it is accessible and costs nothing until opened. */}
      <section className="section-compact">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("modulesTitle")} sub={t("modulesNote")} />
          </div>
          <div className="u-section-body lg:mt-0">
            <ModuleAccordion modules={course.modules} />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section border-t border-line">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <SectionHeading title={t("relatedTitle")} />
              <Link
                href="/courses"
                className="stitch-link link-more mb-1 shrink-0"
              >
                {t("relatedAll")} <Icon name="arrow" size={16} className="arrow" />
              </Link>
            </div>
            {/* The Machine Index, not three cards. Three <CourseCard>s in a
                mobile single column were 1,476px at the very bottom of the
                page — more than a full viewport of "here are other courses"
                after everything the visitor came for. The index is the same
                component /courses uses, so a related row and a catalogue row
                cannot drift in what they may claim. */}
            <div className="u-section-body">
              <MachineIndex courses={related} locale={gu ? "gu" : "en"} />
            </div>
          </div>
        </section>
      ) : null}
      {/* Contextual conversion (plan §15). A course page is the highest-
          intent route on the site, and the demo action carries the course
          the visitor is actually reading about rather than dropping them on
          an empty form. */}
      <ActionDock surface="course" demoHref={`/admission?course=${course.slug}`} />
    </>
  );
}
