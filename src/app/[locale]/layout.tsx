import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { LangBanner } from "@/components/site/LangBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { site } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: "%s" },
    description: t("description")
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("common");

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Karma Design Studio & Classes",
    description: locale === "gu" ? site.descriptorGu : site.descriptorEn,
    url: site.url,
    telephone: `+${site.whatsapp}`,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "302, Middle Point, Mahadev Chowk, Mota Varachha",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "394101",
      addressCountry: "IN"
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    sameAs: [site.socials.instagram, site.socials.youtube]
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Marks JS availability so reveal animations never hide no-JS content */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-[60] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-carbon focus:px-4 focus:py-2 focus:text-ivory"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFab />
          <LangBanner />
        </NextIntlClientProvider>
        <JsonLd data={businessLd} />
      </body>
    </html>
  );
}
