import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { services } from "@/content/collections";
import { site } from "@/lib/site";
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
  const t = await getTranslations("servicesPage");
  const tc = await getTranslations("common");
  const l = await getLocale();
  const gu = l === "gu";
  const howSteps = t.raw("howSteps") as string[];
  const guide = t.raw("guide") as string[];

  return (
    <>
      <section className="section-compact">
        <div className="container-site">
          <h1 className="text-display max-w-3xl">{t("title")}</h1>
          <p className="u-lede prose-measure">{t("sub")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#brief" className="btn btn-primary">{t("form.submit")}</a>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillBusiness"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              {tc("whatsapp")}
            </a>
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <div className="grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.titleEn} className="card p-6 md:p-8">
                <h2 className="text-h4 font-display">{gu ? s.titleGu : s.titleEn}</h2>
                <p className="mt-2 text-smallmeta text-stone">{gu ? s.descGu : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title={t("howTitle")} />
            <ol className="mt-6 space-y-4">
              {howSteps.map((s, i) => (
                <li key={s} className="flex items-baseline gap-4">
                  <span className="font-display text-h4 text-vermilion-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading title={t("guideTitle")} />
            <ul className="mt-6 space-y-3">
              {guide.map((g) => (
                <li key={g} className="flex gap-3">
                  <span aria-hidden="true" className="text-vermilion-deep">–</span>
                  <span className="text-stone">{g}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-lg bg-ivory-2 p-4 text-smallmeta font-semibold text-stone">
              🔒 {t("confidential")}
            </p>
          </div>
        </div>
      </section>

      <StitchDivider />
      <section className="section-compact" id="brief">
        <div className="container-site max-w-3xl">
          <BriefForm />
        </div>
      </section>
    </>
  );
}
