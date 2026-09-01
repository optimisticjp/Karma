import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicFaqs } from "@/lib/content/public";
import { FaqList } from "@/components/site/FaqList";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/site/JsonLd";
import { asLocale, routing } from "@/i18n/routing";
import { pick } from "@/lib/i18n/localized";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/site";
import { AdmissionsIntro } from "@/components/kds/admissions/AdmissionsIntro";
import { AdmissionSteps } from "@/components/kds/admissions/AdmissionSteps";
import { DemoBlock } from "@/components/kds/admissions/DemoBlock";
import { BeforeYouCome } from "@/components/kds/admissions/BeforeYouCome";
import { CtaBand } from "@/components/kds/CtaBand";
import { ActionDock } from "@/components/kds/shell/ActionDock";
import { Icon } from "@/components/ui/Icon";
import { PageCrumbs } from "@/components/kds/PageCrumbs";

/* Published FAQs are database-backed with a source fallback. */
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
  const t = await getTranslations({ locale, namespace: "meta.admissions" });
  return pageMeta({
    locale,
    path: "/admissions",
    title: t("title"),
    description: t("description")
  });
}

/**
 * ADMISSIONS — the decision page.
 *
 * Six blocks, in the order somebody decides:
 *
 *  1  Intro       what this is, and the three things to confirm before asking
 *  2  Steps       how joining goes — five, none of which cost anything
 *  3  Demo        the free demo, stated exactly as the studio runs it
 *  4  Before      fees, eligibility, language, what to bring, the handbook
 *  5  FAQ         the questions people actually ask
 *  6  Close       the form
 *
 * **The batch list is not on this page.** It used to be, twelve rows deep, two
 * thirds of the way down — a second copy of a page that now exists, cannot be
 * linked to from here, and went stale in a different way. `/batches` owns it;
 * this page links to it.
 *
 * Nothing on this route takes money. There is no gateway in this repository to
 * enable, which is why the copy can state it as a fact rather than a promise.
 */
export default async function AdmissionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, faqs] = await Promise.all([
    getTranslations("admissionsPage"),
    getTranslations("common"),
    getPublicFaqs()
  ]);
  const l = asLocale(locale);
  const closeCopyKey = "formNote" as const;

  return (
    <>
      <PageCrumbs page="admissions" path="/admissions" />
      {/* Only the questions actually published get structured data, and the
          builder emits no rating, price or offer — see `src/lib/schema.ts`. */}
      <JsonLd
        data={faqSchema(
          faqs.map((f) => ({ q: pick(f, "q", l), a: pick(f, "a", l) }))
        )}
      />

      <AdmissionsIntro />
      <AdmissionSteps />
      <DemoBlock />
      <BeforeYouCome />

      <section className="band on-paper" id="faq" aria-labelledby="faq-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">{t("faqEyebrow")}</p>
              <h2 id="faq-heading" className="t-h2 mt-1.5">
                {t("faqTitle")}
              </h2>
              <p className="t-lede mt-3 max-w-[40ch]">{t("faqSub")}</p>
              <p className="mt-5">
                <a
                  href={waLink(tc("waPrefillDemo"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act act-secondary"
                >
                  <Icon name="whatsapp" size={17} /> {t("faqCta")}
                </a>
              </p>
            </div>
            <div className="min-w-0">
              <FaqList items={faqs} />
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={t("closeTitle")} sub={t(closeCopyKey)} ground="on-canvas" />

      <ActionDock surface="admissions" demoHref="/admission" />
    </>
  );
}
