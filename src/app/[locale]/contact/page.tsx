import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return pageMeta({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const tc = await getTranslations("common");
  const l = await getLocale();
  const gu = l === "gu";

  return (
    <section className="section-compact">
      <div className="container-site">
        <h1 className="text-display max-w-3xl">{t("title")}</h1>
        <p className="text-lead prose-measure mt-5 text-stone">{t("sub")}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full !justify-between !py-4 text-left"
            >
              <span>{tc("whatsapp")}</span>
              <span aria-hidden="true">→</span>
            </a>
            <a href={`tel:+${site.whatsapp}`} className="btn btn-secondary w-full !justify-between !py-4 text-left">
              <span>{tc("call")}: {site.phoneDisplay}</span>
              <span aria-hidden="true">→</span>
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-secondary w-full !justify-between !py-4 text-left">
              <span>{site.email}</span>
              <span aria-hidden="true">→</span>
            </a>
            <p className="pt-2 text-smallmeta text-stone">{t("demoNote")}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-h4 font-display">{t("visitTitle")}</h2>
            <dl className="mt-4 space-y-4 text-stone">
              <div>
                <dt className="text-smallmeta font-bold text-carbon">{t("addressLabel")}</dt>
                <dd className="mt-1">{gu ? site.addressGu : site.addressEn}</dd>
              </div>
              <div>
                <dt className="text-smallmeta font-bold text-carbon">{t("hoursLabel")}</dt>
                <dd className="mt-1">{gu ? site.hoursGu : site.hoursEn}</dd>
              </div>
            </dl>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary mt-5"
            >
              {t("mapCta")}
            </a>
            <div className="mt-6">
              <PhotoSlot label={t("entranceLabel")} ratio="16/9" />
              <p className="mt-3 text-smallmeta text-stone">{t("directionsNote")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
