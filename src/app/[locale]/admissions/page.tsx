import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BatchTable } from "@/components/course/BatchTable";
import { FaqList } from "@/components/site/FaqList";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { JsonLd } from "@/components/site/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { getPublicFaqs } from "@/lib/content/public";
import { site, waLink } from "@/lib/site";
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
  const [t, tc, faqs, l] = await Promise.all([
    getTranslations("admissionsPage"),
    getTranslations("common"),
    getPublicFaqs(),
    getLocale()
  ]);
  const gu = l === "gu";
  const steps = t.raw("steps") as Array<{ t: string; d: string }>;
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

      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {t("formCta")} <Icon name="arrow" size={18} className="arrow" />
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
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("asideTitle")}</p>
            <p className="mt-3">{t("asideBody")}</p>
            <p className="mt-4">
              <strong>{gu ? site.hoursGu : site.hoursEn}</strong>
            </p>
          </>
        }
      />

      {/* The five steps, as a sequence rather than five loose numerals. */}
      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading title={t("stepsTitle")} sub={t("stepsSub")} />
          <Ledger as="ol">
            {steps.map((s, i) => (
              <LedgerRow
                key={s.t}
                index={String(i + 1).padStart(2, "0")}
                title={s.t}
                note={s.d}
              />
            ))}
          </Ledger>
        </div>
      </section>

      <section className="section bg-ivory-2" id="batches">
        <div className="container-site">
          <SectionHeading title={t("batchesTitle")} sub={t("batchesSub")} />
          <div className="u-section-body">
            <BatchTable limit={12} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("beforeTitle")} sub={t("beforeSub")} />
          <dl className="u-section-body spec-grid">
            <div>
              <dt className="spec-label">{t("feesTitle")}</dt>
              <dd className="spec-note mt-2">{t("feesBody")}</dd>
            </div>
            <div>
              <dt className="spec-label">{t("eligTitle")}</dt>
              <dd className="spec-note mt-2">{t("eligBody")}</dd>
            </div>
            <div>
              <dt className="spec-label">{t("langTitle")}</dt>
              <dd className="spec-note mt-2">{t("langBody")}</dd>
            </div>
            <div>
              <dt className="spec-label">{t("bringTitle")}</dt>
              <dd className="spec-note mt-2">{t("bringBody")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section border-t border-line bg-ivory-2">
        <div className="container-site grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading title={t("handbookTitle")} sub={t("handbookSub")} />
          <ul className="ledger">
            {handbook.map((h, i) => (
              <LedgerRow
                as="li"
                key={h}
                index={String(i + 1).padStart(2, "0")}
                title={h}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading title={t("faqTitle")} sub={t("faqSub")} />
            <p className="u-actions">
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Icon name="whatsapp" size={18} /> {t("faqCta")}
              </a>
            </p>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="on-carbon section-compact">
        <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-h3">{t("closeTitle")}</h2>
            <p className="mt-2 text-smallmeta text-stone">{t("formNote")}</p>
          </div>
          <Link href="/admission" className="btn btn-primary">
            {t("formCta")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        </div>
      </section>

    </>
  );
}
