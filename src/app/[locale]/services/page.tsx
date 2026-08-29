import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/content/collections";
import { waLink } from "@/lib/site";
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
            <p className="microlabel !text-vermilion-deep">{t("confidentialTitle")}</p>
            <p className="mt-3">{t("confidential")}</p>
          </>
        }
      />

      <section className="section">
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

      <section className="section bg-ivory-2">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
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
            <ul className="mt-8 space-y-3.5">
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

      <section className="section" id="brief">
        <div className="container-site max-w-3xl">
          <BriefForm />
        </div>
      </section>
    </>
  );
}
