import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicFaqs } from "@/lib/content/public";
import { getCourseConfig } from "@/lib/course/config";
import { EMCAD_DAHAO_SLUG } from "@/content/course-operations";
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

/* Published FAQs and the EMCAD demo policy are database-backed. */
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

export default async function AdmissionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, faqs, emcad] = await Promise.all([
    getTranslations("admissionsPage"),
    getTranslations("common"),
    getPublicFaqs(),
    getCourseConfig(EMCAD_DAHAO_SLUG)
  ]);
  const l = asLocale(locale);
  const demo = emcad?.operations.demo ?? null;

  return (
    <>
      <PageCrumbs page="admissions" path="/admissions" />
      <JsonLd
        data={faqSchema(
          faqs.map((f) => ({ q: pick(f, "q", l), a: pick(f, "a", l) }))
        )}
      />

      <AdmissionsIntro demo={demo} />
      <AdmissionSteps />
      <DemoBlock demo={demo} />
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

      <CtaBand title={t("closeTitle")} sub={t("formNote")} ground="on-canvas" />

      <ActionDock surface="admissions" demoHref="/admission" />
    </>
  );
}
