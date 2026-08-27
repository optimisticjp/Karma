import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BatchTable } from "@/components/course/BatchTable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { StickyActionBar } from "@/components/site/StickyActionBar";
import { JsonLd } from "@/components/site/JsonLd";
import { faqs } from "@/content/collections";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.admissions" });
  return pageMeta({ locale, path: "/admissions", title: t("title"), description: t("description") });
}

export default async function AdmissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admissionsPage");
  const gu = locale === "gu";
  const steps = t.raw("steps") as string[];
  const handbook = t.raw("handbook") as string[];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: gu ? f.qGu : f.qEn,
      acceptedAnswer: { "@type": "Answer", text: gu ? f.aGu : f.aEn }
    }))
  };

  return (
    <>
      <JsonLd data={faqLd} />

      <section className="section-compact">
        <div className="container-site">
          <h1 className="text-display max-w-3xl">{t("title")}</h1>
          <p className="u-lede prose-measure">{t("sub")}</p>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s}>
                <p className="numeral" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-semibold">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site grid gap-6 lg:gap-8 md:grid-cols-2">
          <div className="card p-6 md:p-8">
            <h2 className="text-h4 font-display">{t("feesTitle")}</h2>
            <p className="u-lede">{t("feesBody")}</p>
          </div>
          <div className="card p-6 md:p-8">
            <h2 className="text-h4 font-display">{t("eligTitle")}</h2>
            <p className="u-lede">{t("eligBody")}</p>
          </div>
        </div>
      </section>

      <section className="section-compact" id="batches">
        <div className="container-site">
          <SectionHeading title={t("batchesTitle")} />
          <div className="mt-8">
            <BatchTable limit={12} />
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("handbookTitle")} />
          <ul className="u-section-body grid gap-4 md:grid-cols-2">
            {handbook.map((h) => (
              <li key={h} className="flex gap-3">
                <Icon name="scissors" size={18} className="mt-1 text-vermilion-deep" />
                <span className="text-stone">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("faqTitle")} />
          <div className="u-section-body max-w-3xl space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="card group p-0" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{gu ? f.qGu : f.qEn}</span>
                  <span aria-hidden="true" className="text-vermilion-deep transition-transform duration-200 group-open:rotate-45">＋</span>
                </summary>
                <p className="border-t border-line px-5 pb-5 pt-4 text-stone">{gu ? f.aGu : f.aEn}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <StitchDivider />
      <section className="section-compact">
        <div className="container-site text-center">
          <Link href="/admission" className="btn btn-primary">{t("formCta")} <Icon name="arrow" size={18} className="arrow" /></Link>
          <p className="mt-3 text-smallmeta text-stone">{t("formNote")}</p>
        </div>
      </section>

      <StickyActionBar />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
