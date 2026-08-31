import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { services, studioProblems, studioProjects } from "@/content/collections";
import { TechniqueSignature } from "@/components/ui/TechniqueSignature";
import { StudioRail } from "@/components/studio/StudioRail";
import { MonoNote } from "@/components/ui/MonoNote";
import { SampleTag } from "@/components/ui/SampleTag";
import { TrackedLink } from "@/components/site/TrackedLink";
import { Reveal } from "@/components/ui/Reveal";
import { coursesByFamily, families } from "@/content/courses";
import { site, waLink } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  return pageMeta({ locale, path: "/services", title: t("title"), description: t("description") });
}

/**
 * Karma Studio — the business side.
 *
 * The student site and this page are aimed at different people, and the
 * mistake would be to blur them. A student is buying a skill; a boutique or a
 * production unit is buying a result, and arrives with a problem rather than
 * a browsing intent. So this page leads with the problems — a sample with no
 * source file, a design that fails at production speed — and names the
 * service second.
 *
 * Every service on this page is one the studio already advertises. Nothing was
 * invented to fill the structure out, no turnaround time is promised (none has
 * been confirmed), and the sample projects are generic work types rather than
 * named clients.
 *
 * THE CHAIN CARRIES THE PAGE
 * --------------------------
 * `<StudioRail>` shows REFERENCE → DIGITISING → SAMPLE → CORRECTION →
 * MACHINE-READY on the same `<ProductionRail>` the homepage uses for
 * DESIGN → MACHINE → RESULT — which is why that component takes its stages as
 * a prop rather than hard-coding three panels. A business arrives with a
 * situation, and the order the work goes in answers "can this studio handle my
 * mess" faster than any adjective.
 *
 * THREE THINGS THIS PAGE STILL WILL NOT SAY
 * -----------------------------------------
 * A turnaround time, a file format, or a price. The studio has confirmed none
 * of them (`docs/content-checklist.md`), and a B2B page that invents a
 * delivery window writes a cheque the floor has to cash. The copy asks for the
 * buyer's deadline and their machine's format instead of announcing ours.
 *
 * There is also no file upload, and the brief form says so plainly rather than
 * showing a dead control. Private file delivery waits on R2, which is
 * deliberately not activated.
 */
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, l] = await Promise.all([
    getTranslations("servicesPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const gu = l === "gu";
  const howSteps = t.raw("howSteps") as Array<{ t: string; d: string }>;
  const guide = t.raw("guide") as string[];

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <a href="#brief" className="btn btn-primary">
              {t("form.submit")} <Icon name="arrow" size={18} className="arrow" />
            </a>
            <a
              href={waLink(tc("waPrefillBusiness"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </a>
          </>
        }
        aside={
          <>
            <MonoNote as="p" tone="vermilion">{t("confidentialTitle")}</MonoNote>
            <p className="mt-1.5">{t("confidential")}</p>
          </>
        }
      />

      {/* 2 + 3. What you can bring, and what comes back. The exchange stated
             plainly, because a buyer's first question is whether their
             particular mess is something this studio takes. */}
      <section className="section">
        <div className="container-site split split-even">
          <div className="surface surface-feature">
            <p className="microlabel !text-vermilion-deep">{t("bringTitle")}</p>
            <h2 className="text-h3 mt-1.5 font-display">{t("bringH")}</h2>
            <ul className="stack-lines mt-2">
              {(t.raw("bring") as string[]).map((b) => (
                <li key={b} className="flex gap-3 text-smallmeta">
                  <Icon name="check" size={17} strokeWidth={2} className="mt-1 shrink-0 text-vermilion-deep" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface surface-machine surface-feature">
            <p className="microlabel">{t("returnTitle")}</p>
            <h2 className="text-h3 mt-1.5 font-display">{t("returnH")}</h2>
            <ul className="stack-lines mt-2">
              {(t.raw("returns") as string[]).map((r) => (
                <li key={r} className="flex gap-3 text-smallmeta">
                  <Icon name="check" size={17} strokeWidth={2} className="mt-1 shrink-0 text-needle-light" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The chain, in the order the work actually goes in. */}
      <StudioRail />

      {/* 6. Problem-led. A business arrives with a situation, not a noun. */}
      <section className="section band-human">
        <div className="container-site">
          <SectionHeading eyebrow={t("problemsEyebrow")} title={t("problemsTitle")} sub={t("problemsSub")} rule />
          <ol className="case-list u-section-body">
            {studioProblems.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 50} className="case-note">
                <div className="case-head">
                  <span className="case-index tabular" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="chip">{gu ? p.serviceGu : p.serviceEn}</span>
                </div>
                <p className="case-problem">{gu ? p.askGu : p.askEn}</p>
                <dl className="case-fields">
                  <div>
                    <dt className="case-label">{t("problemsReturns")}</dt>
                    <dd className="case-value">{gu ? p.returnsGu : p.returnsEn}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Machine capabilities, drawn straight from the catalogue so this
             page can never claim a technique the studio does not teach. */}
      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("capabilityTitle")} sub={t("capabilitySub")} />
          <ul className="u-section-body spec-grid">
            {coursesByFamily.map((c) => (
              <li key={c.slug}>
                <div className="capability-plate">
                  <TechniqueSignature slug={c.slug} />
                </div>
                <span className="spec-label">
                  {gu ? families[c.family].nameGu : families[c.family].nameEn}
                </span>
                <span className="spec-value mt-1 block">{gu ? c.nameGu : c.nameEn}</span>
                <span className="spec-note mt-1 block">
                  {gu ? c.production.machineGu : c.production.machineEn}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The service list, kept as the plain index it always was. */}
      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("whatTitle")} sub={t("whatSub")} />
          <dl className="u-section-body spec-grid">
            {services.map((s) => (
              <div key={s.titleEn}>
                <dt className="spec-label">{gu ? s.titleGu : s.titleEn}</dt>
                <dd className="spec-note mt-2">{gu ? s.descGu : s.descEn}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 7. Sample work: generic project types, tagged. A named client or a
             logo would be an endorsement nobody gave. */}
      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("projectsTitle")} sub={t("projectsSub")} />
          <ul className="project-grid u-section-body">
            {studioProjects.map((pr, i) => (
              <Reveal as="li" key={pr.titleEn} delay={i * 60} className="project-card">
                <p className="chip">{gu ? pr.techniqueGu : pr.techniqueEn}</p>
                <h3 className="project-title">{gu ? pr.titleGu : pr.titleEn}</h3>
                <dl className="case-fields">
                  <div>
                    <dt className="case-label">{t("projectsBrief")}</dt>
                    <dd className="case-value">{gu ? pr.briefGu : pr.briefEn}</dd>
                  </div>
                  <div>
                    <dt className="case-label">{t("projectsDelivered")}</dt>
                    <dd className="case-value">{gu ? pr.deliveredGu : pr.deliveredEn}</dd>
                  </div>
                </dl>
                {pr.sample ? (
                  <p className="mt-4">
                    <SampleTag />
                  </p>
                ) : null}
              </Reveal>
            ))}
          </ul>
          <p className="review-foot">{t("projectsFoot")}</p>
        </div>
      </section>

      <section className="section bg-ivory-2">
        <div className="container-site grid gap-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title={t("howTitle")} sub={t("howSub")} />
            <Ledger as="ol" className="mt-8">
              {howSteps.map((s, i) => (
                <LedgerRow
                  key={s.t}
                  index={String(i + 1).padStart(2, "0")}
                  title={s.t}
                  note={s.d}
                />
              ))}
            </Ledger>
          </div>
          <div>
            <SectionHeading title={t("guideTitle")} sub={t("guideSub")} />
            {/* Turnaround and formats: said honestly rather than guessed.
                No delivery time has been confirmed by the studio, and no
                verified list of supported machine formats exists, so both
                answers are "tell us and we will match it" — which is also
                the truthful answer for job work of this kind. */}
            <div className="surface mt-6">
              <p className="case-label">{t("turnaroundTitle")}</p>
              <p className="mt-2 text-smallmeta text-stone">{t("turnaroundBody")}</p>
              <p className="case-label mt-5">{t("formatsTitle")}</p>
              <p className="mt-2 text-smallmeta text-stone">{t("formatsBody")}</p>
            </div>
            <ul className="mt-4 space-y-3.5">
              {guide.map((g) => (
                <li key={g} className="flex gap-3">
                  <Icon
                    name="check"
                    size={17}
                    strokeWidth={2}
                    className="mt-1 shrink-0 text-vermilion-deep"
                  />
                  <span className="text-stone">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The form used to sit alone in the middle of a very wide empty band.
          Pairing it with what happens next removes the dead space and answers
          the questions that otherwise arrive as a follow-up email. Every line
          in the panel is drawn from copy already on this page. */}
      <section className="section-compact bg-ivory-2" id="brief">
        <div className="container-site grid gap-4 lg:grid-cols-[1.35fr_0.65fr] lg:items-start lg:gap-12">
          <div className="card p-3.5 md:p-5">
            <BriefForm />
          </div>
          <aside className="lg:sticky lg:top-24">
            <p className="microlabel !text-vermilion-deep">{t("afterTitle")}</p>
            <ol className="ledger mt-4">
              {(t.raw("afterSteps") as string[]).map((step, i) => (
                <li key={step} className="ledger-row">
                  <span className="ledger-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ledger-title !font-normal !text-smallmeta">{step}</span>
                </li>
              ))}
            </ol>
            {/* `form.filesHelp` used to render here — "Up to 3 files, 8 MB
                each: PNG, JPG, WebP, PDF, AI or ZIP" — as guidance for an
                in-form uploader that does not exist, beside a form that says
                in its own words that files go over WhatsApp until private
                storage is switched on. It told a business owner they could
                attach files here and they could not. The key stays in the
                catalogue: it is the copy to restore when R2 is activated, and
                deleting it would lose the limits the API still enforces.

                `confidential` went too — the form states the same sentence in
                its file note, forty lines up the same screen. */}
            <a
              href={waLink(tc("waPrefillBusiness"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary mt-5 w-full"
            >
              <Icon name="whatsapp" size={18} /> {t("afterWhatsapp")}
            </a>
          </aside>
        </div>
      </section>

      {/* 11. The three ways a business actually gets in touch. */}
      <section className="section-compact bg-sand">
        <div className="container-site split">
          <div>
            <SectionHeading title={t("talkTitle")} sub={t("talkSub")} />
          </div>
          <div className="action-row">
            <TrackedLink
              href={`tel:+${site.callPhone}`}
              event="call_demo_click"
              props={{ surface: "services" }}
              className="btn btn-primary"
            >
              <Icon name="phone" size={17} /> {t("talkCall")}
            </TrackedLink>
            <TrackedLink
              href={waLink(tc("waPrefillBusiness"))}
              event="whatsapp_click"
              props={{ surface: "services" }}
              external
              className="btn btn-secondary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </TrackedLink>
            <TrackedLink
              href={site.mapsUrl}
              event="directions_click"
              props={{ surface: "services" }}
              external
              className="cta-tertiary"
            >
              <Icon name="pin" size={16} /> {tc("directions")}
            </TrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}
