import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MonoNote, StepIndex } from "@/components/ui/MonoNote";
import { Icon } from "@/components/ui/Icon";
import { getUpcomingBatches } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";
import { site, waLink } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { ActionDock } from "@/components/kds/shell/ActionDock";

/**
 * `/[locale]/batches` — the public batch decision page.
 *
 * WHY THIS IS A ROUTE AND NOT A HOMEPAGE SECTION
 * ----------------------------------------------
 * Until now the only public answer to "when can I actually come" was a 400px
 * teaser on the homepage and a 369px block two thirds of the way down
 * `/admissions`. Neither can be linked to, filtered or navigated to, and the
 * question is one of the four a visitor arrives with. See
 * `docs/modern-textile-lab-ia.md` §1.
 *
 * THE RULE THAT SHAPES EVERY LINE BELOW
 * -------------------------------------
 * Real rows or nothing. `getUpcomingBatches()` filters `status = 'open'`, a
 * future start date and both archive flags in SQL before LIMIT, and in
 * production returns an empty result rather than fiction. This page renders
 * exactly what it is handed:
 *
 *  - **no invented start date, seat count, trainer, language or availability**;
 *  - **no fabricated weekend batch** — `sampleBatches()` in
 *    `src/content/courses.ts` is the only "Sat-Sun" string in this repository
 *    and it is gated behind `demoModeAllowed`. This page does not call it, so
 *    a weekend row can only ever come from the database;
 *  - **every field is conditional.** A row with no `days` renders no days. A
 *    row with `seats` of 0 renders no seat line rather than "0 seats left",
 *    because 0 in that column means "not tracked", not "full".
 *
 * When there are no rows the page says so and offers the demo, WhatsApp and a
 * call — which is the truthful next step, and a better one than a fake batch.
 *
 * SERVER-RENDERED, deliberately. The homepage teaser fetches `/api/batches`
 * from the client because it sits on an otherwise static page. This page is
 * *about* the batches, so it reads the database directly: one query, no
 * client fetch, no hydration, no loading skeleton.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.batches" });
  return pageMeta({ locale, path: "/batches", title: t("title"), description: t("description") });
}

export default async function BatchesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, l, result] = await Promise.all([
    getTranslations("batchesPage"),
    getTranslations("common"),
    getLocale(),
    /* 24 is a real cap, not a page size: the studio runs a handful of batches
       at a time, and an unbounded public SELECT is the one thing a free-tier
       database cannot afford to have on a crawlable URL. */
    getUpcomingBatches({ limit: 24 })
  ]);
  const gu = l === "gu";
  const rows = result.rows;

  /* The joining sequence. Four steps, in the order they actually happen, and
     every one of them is a fact the institute has confirmed in writing. */
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("lede")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {tc("bookDemo")}
            </Link>
            <a
              href={waLink(tc("waPrefillDemo"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
            </a>
          </>
        }
      />

      <section className="section-compact" aria-labelledby="batch-list-heading">
        <div className="container-site">
          <SectionHeading id="batch-list-heading" title={t("listTitle")} sub={t("listSub")} />

          <div className="u-section-body">
            {rows.length > 0 ? (
              <>
                {/* Sample rows can only appear outside production, and when
                    they do they say so. In production this never renders. */}
                {result.sample ? (
                  <p className="mb-4">
                    <span className="sample-tag">⚠ {tc("sampleDataNote")}</span>
                  </p>
                ) : null}

                <ul className="ledger">
                  {rows.map((row) => {
                    const seatsLeft = row.seats > 0 ? row.seats - row.seatsTaken : null;
                    return (
                      <li key={row.id} className="ledger-row is-labelled">
                        <div className="min-w-0">
                          <p className="ledger-title">
                            {gu ? row.courseNameGu : row.courseNameEn}
                          </p>
                          <p className="ledger-note mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="tabular">{formatDate(row.startDate, l)}</span>
                            {row.days ? <span>{row.days}</span> : null}
                            {row.startTime && row.endTime ? (
                              <span className="tabular">
                                {row.startTime.slice(0, 5)}–{row.endTime.slice(0, 5)}
                              </span>
                            ) : null}
                            {/* Language is a stored column, not an assumption.
                                A row that does not carry one says nothing. */}
                            {row.language ? <span>{row.language}</span> : null}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-1">
                          {/* `seats` of 0 means the studio does not track a
                              capacity for this batch. It is not "full", and
                              saying "0 left" would invent scarcity. */}
                          {seatsLeft !== null ? (
                            <span className="ledger-note tabular">
                              {seatsLeft <= 0
                                ? t("full")
                                : t("seatsLeft", { count: seatsLeft })}
                            </span>
                          ) : null}
                          <Link
                            href={{
                              pathname: "/admission",
                              query: {
                                course: row.courseSlug,
                                batch: String(row.id),
                                src: "batches"
                              }
                            }}
                            className="stitch-link link-more"
                          >
                            {tc("bookDemo")} <Icon name="arrow" size={15} className="arrow" />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              /* The honest empty state. It does not apologise and it does not
                 pretend a batch exists — it gives the two actions that reach a
                 human, which is what someone looking at this page wants. */
              <div className="card p-4 sm:p-5">
                <p className="font-semibold">
                  {result.error ? t("errorTitle") : t("emptyTitle")}
                </p>
                <p className="form-note mt-1.5">
                  {result.error ? t("errorBody") : t("emptyBody")}
                </p>
                <div className="u-actions">
                  <Link href="/admission" className="btn btn-primary">
                    {tc("bookDemo")}
                  </Link>
                  <a
                    href={waLink(tc("waPrefillDemo"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
                  </a>
                  <a href={`tel:+${site.callPhone}`} className="cta-tertiary">
                    <Icon name="phone" size={16} /> {tc("call")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-compact border-t border-line bg-ivory-2" aria-labelledby="joining-heading">
        <div className="container-site">
          <SectionHeading id="joining-heading" title={t("joiningTitle")} sub={t("joiningSub")} />
          <ol className="ledger u-section-body">
            {steps.map((step, i) => (
              <li key={step} className="ledger-row">
                <StepIndex n={i + 1} className="text-vermilion-deep" />
                <span className="ledger-title !font-normal">{step}</span>
              </li>
            ))}
          </ol>
          <MonoNote as="p" className="mt-5">
            {t("normsNote")}{" "}
            <Link href="/admissions" className="stitch-link font-semibold">
              {t("normsLink")}
            </Link>
          </MonoNote>
        </div>
      </section>
      {/* Contextual conversion (plan §15). This is a high-intent route, so
          the dock belongs here — and NOT on the privacy policy, the terms
          page or the notes archive, which is where the permanent bar it
          replaces used to sit. */}
      <ActionDock surface={"batches"} demoHref="/admission" />
    </>
  );
}
