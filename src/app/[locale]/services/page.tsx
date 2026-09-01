import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { Icon } from "@/components/ui/Icon";
import { studioProblems, studioProjects } from "@/content/collections";
import { families } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import { asLocale, routing } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { getPublicCourses } from "@/lib/course/public";
import { pageMeta } from "@/lib/seo";
import { TrackedLink } from "@/components/site/TrackedLink";
import { PageHead } from "@/components/kds/PageHead";
import { StudioChain } from "@/components/kds/studio/StudioChain";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { SampleMark } from "@/components/kds/proof";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { PageCrumbs } from "@/components/kds/PageCrumbs";

/** The capability list follows the current Console-visible course catalogue. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
 * KARMA STUDIO — the business side.
 *
 * A boutique or production unit arrives with a problem rather than a browsing
 * intent, so the page leads with the exchange, then the chain and the problems.
 * It does not invent a turnaround time, file format or price. File upload also
 * remains deferred until private R2 storage is active.
 */
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, rawLocale, publicCourses] = await Promise.all([
    getTranslations("servicesPage"),
    getTranslations("common"),
    getLocale(),
    getPublicCourses()
  ]);
  const l = asLocale(rawLocale);
  const howSteps = t.raw("howSteps") as Array<{ t: string; d: string }>;
  const guide = t.raw("guide") as string[];

  return (
    <>
      <PageCrumbs page="services" path="/services" />
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <a href="#brief" className="act act-primary">
              {t("form.submit")} <Icon name="arrow" size={17} className="arrow" />
            </a>
            <a
              href={waLink(tc("waPrefillBusiness"))}
              target="_blank"
              rel="noopener noreferrer"
              className="act act-secondary"
            >
              <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
            </a>
          </>
        }
        aside={
          <>
            <p className="t-micro">{t("confidentialTitle")}</p>
            <p className="t-body mt-2">{t("confidential")}</p>
          </>
        }
      />

      <section className="band on-canvas" aria-labelledby="exchange-heading">
        <div className="wrap">
          <h2 id="exchange-heading" className="sr-only">
            {t("bringH")}
          </h2>
          <div className="split split-even">
            <div className="fee-sheet">
              <p className="t-micro">{t("bringTitle")}</p>
              <p className="t-h3 mt-2">{t("bringH")}</p>
              <ul className="make-skills mt-4" role="list">
                {(t.raw("bring") as string[]).map((b) => (
                  <li key={b}>
                    <NeedlePoint state="done" />
                    <span className="t-body">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="fee-sheet">
              <p className="t-micro">{t("returnTitle")}</p>
              <p className="t-h3 mt-2">{t("returnH")}</p>
              <ul className="make-skills mt-4" role="list">
                {(t.raw("returns") as string[]).map((r) => (
                  <li key={r}>
                    <NeedlePoint state="done" />
                    <span className="t-body">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <StudioChain />

      <section className="band on-cloth" aria-labelledby="problems-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <p className="t-micro">{t("problemsEyebrow")}</p>
            <h2 id="problems-heading" className="t-h2 mt-1.5">
              {t("problemsTitle")}
            </h2>
            <p className="t-lede mt-3">{t("problemsSub")}</p>
          </header>

          <ol className="cases" role="list">
            {studioProblems.map((p, i) => (
              <li key={p.slug} className="case">
                <p className="case-head">
                  <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="chip">{pick(p, "service", l)}</span>
                </p>
                <p className="t-h4 mt-3">{pick(p, "ask", l)}</p>
                <dl className="case-fields">
                  <div>
                    <dt className="t-micro">
                      <NeedlePoint state="done" />
                      {t("problemsReturns")}
                    </dt>
                    <dd className="t-body mt-1">{pick(p, "returns", l)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band on-canvas" aria-labelledby="capability-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="capability-heading" className="t-h2">
              {t("capabilityTitle")}
            </h2>
            <p className="t-lede mt-3">{t("capabilitySub")}</p>
          </header>

          <ul className="capability-grid" role="list">
            {publicCourses.map((c) => (
              <li key={c.slug}>
                <StitchSwatch slug={c.slug} />
                <p className="t-h4 mt-2">{pick(c, "name", l)}</p>
                <p className="t-meta mt-1">{pick(families[c.family], "name", l)}</p>
              </li>
            ))}
          </ul>

          <div className="before-handbook">
            <div className="min-w-0">
              <h3 className="t-h3">{t("whatTitle")}</h3>
              <p className="t-meta mt-2 max-w-[40ch]">{t("whatSub")}</p>
            </div>
            <dl className="before-grid !mt-0">
              <div>
                <dt className="t-h4">{t("turnaroundTitle")}</dt>
                <dd className="t-body mt-2">{t("turnaroundBody")}</dd>
              </div>
              <div>
                <dt className="t-h4">{t("formatsTitle")}</dt>
                <dd className="t-body mt-2">{t("formatsBody")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="band on-paper" aria-labelledby="projects-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="projects-heading" className="t-h2">
              {t("projectsTitle")}
            </h2>
            <p className="t-lede mt-3">{t("projectsSub")}</p>
          </header>

          <ul className="cases" role="list">
            {studioProjects.map((pr) => (
              <li key={pr.titleEn} className="case">
                <p className="case-head">
                  <span className="chip">{pick(pr, "technique", l)}</span>
                  {pr.sample ? <SampleMark status="sample" /> : null}
                </p>
                <p className="t-h4 mt-3">{pick(pr, "title", l)}</p>
                <dl className="case-fields">
                  <div>
                    <dt className="t-micro">
                      <NeedlePoint state="now" />
                      {t("projectsBrief")}
                    </dt>
                    <dd className="t-body mt-1">{pick(pr, "brief", l)}</dd>
                  </div>
                  <div>
                    <dt className="t-micro">
                      <NeedlePoint state="done" />
                      {t("projectsDelivered")}
                    </dt>
                    <dd className="t-body mt-1">{pick(pr, "delivered", l)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <p className="t-meta mt-6 max-w-prose">{t("projectsFoot")}</p>
        </div>
      </section>

      <section className="band on-mist" aria-labelledby="how-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">{t("howTitle")}</p>
              <h2 id="how-heading" className="t-h2 mt-1.5">
                {t("howSub")}
              </h2>
              <ol className="pathway mt-6" role="list">
                {howSteps.map((step, i) => (
                  <li key={step.t} className="pathway-step">
                    <span className="pathway-mark" aria-hidden="true">
                      <NeedlePoint state={i === howSteps.length - 1 ? "todo" : "done"} />
                      {i < howSteps.length - 1 ? (
                        <ThreadLine vertical className="pathway-thread" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                      <span className="t-h4 mt-0.5 block">{step.t}</span>
                      <span className="t-meta mt-1 block">{step.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="fee-sheet">
              <p className="t-micro">{t("guideTitle")}</p>
              <p className="t-body mt-2">{t("guideSub")}</p>
              <ul className="make-skills mt-4" role="list">
                {guide.map((g) => (
                  <li key={g}>
                    <NeedlePoint state="done" />
                    <span className="t-body">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band on-cloth" id="brief" aria-labelledby="brief-heading">
        <div className="wrap">
          <h2 id="brief-heading" className="sr-only">
            {t("formTitle")}
          </h2>
          <div className="split">
            <div className="min-w-0">
              <BriefForm />
            </div>
            <aside className="min-w-0">
              <p className="t-micro">{t("afterTitle")}</p>
              <ol className="pathway mt-4" role="list">
                {(t.raw("afterSteps") as string[]).map((step, i, all) => (
                  <li key={step} className="pathway-step">
                    <span className="pathway-mark" aria-hidden="true">
                      <NeedlePoint state={i === all.length - 1 ? "todo" : "done"} />
                      {i < all.length - 1 ? (
                        <ThreadLine vertical className="pathway-thread" />
                      ) : null}
                    </span>
                    <span className="t-body min-w-0">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5">
                <a
                  href={waLink(tc("waPrefillBusiness"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act act-secondary"
                >
                  <Icon name="whatsapp" size={17} /> {t("afterWhatsapp")}
                </a>
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="band-tight on-canvas" aria-labelledby="talk-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <h2 id="talk-heading" className="t-h2">
                {t("talkTitle")}
              </h2>
              <p className="t-lede mt-3">{t("talkSub")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TrackedLink
                href={`tel:+${site.callPhone}`}
                event="call_demo_click"
                props={{ surface: "services" }}
                className="act act-primary"
              >
                <Icon name="phone" size={17} /> {t("talkCall")}
              </TrackedLink>
              <TrackedLink
                href={waLink(tc("waPrefillBusiness"))}
                event="whatsapp_click"
                props={{ surface: "services" }}
                external
                className="act act-secondary"
              >
                <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
              </TrackedLink>
              <TrackedLink
                href={site.mapsUrl}
                event="directions_click"
                props={{ surface: "services" }}
                external
                className="act-quiet"
              >
                <Icon name="pin" size={16} /> {tc("directions")}
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
