import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { LangBanner } from "@/components/site/LangBanner";
import { UnveilWatcher } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/site/JsonLd";
import { site } from "@/lib/site";
import { courses } from "@/content/courses";
import "../globals.css";
import "../premium.css";

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

  /**
   * Local search is how this audience actually finds a class: "embroidery
   * class Mota Varachha", "zardosi class Surat". The listing therefore carries
   * everything Google can match on — both published phone numbers, the
   * landmark that gets a first-timer to the right door, every social profile
   * the studio runs, and the real course catalogue as an offer list.
   *
   * A training institute is genuinely both a LocalBusiness and an
   * EducationalOrganization; declaring only the former loses the course
   * eligibility.
   */
  const businessLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "@id": `${site.url}/#studio`,
    name: site.legalName,
    alternateName: site.name,
    description: locale === "gu" ? site.descriptorGu : site.descriptorEn,
    url: site.url,
    telephone: [`+${site.whatsapp}`, `+${site.landline}`],
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `302, Middle Point, Maruti Nandan Society, Mahadev Chowk (${site.landmarkEn})`,
      addressLocality: "Mota Varachha, Surat",
      addressRegion: "Gujarat",
      postalCode: "394101",
      addressCountry: "IN"
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    areaServed: { "@type": "City", name: "Surat" },
    availableLanguage: ["gu", "hi", "en"],
    // Evening batches until 22:30 are the studio's actual differentiator for
    // working students, so they belong in the listing rather than only in copy.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        closes: "22:30"
      }
    ],
    sameAs: [
      site.socials.instagram,
      site.socials.youtube,
      site.socials.facebook,
      site.socials.threads
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "gu" ? "એમ્બ્રોઇડરી કોર્સ" : "Embroidery courses",
      itemListElement: courses.map((course) => ({
        "@type": "Course",
        name: course.nameEn,
        description: course.leadEn,
        url: `${site.url}/${locale}/courses/${course.slug}`,
        provider: { "@id": `${site.url}/#studio` }
      }))
    }
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
          <UnveilWatcher />
        </NextIntlClientProvider>
        <JsonLd data={businessLd} />
      </body>
    </html>
  );
}
