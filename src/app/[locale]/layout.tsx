import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { asLocale, routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/kds/shell/SiteHeader";
import { SiteFooter } from "@/components/kds/shell/SiteFooter";
import { UnveilWatcher } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/site/JsonLd";
import { site } from "@/lib/site";
import { studioSchema } from "@/lib/schema";
import { getPublicCourses } from "@/lib/course/public";
import "../globals.css";
import "../thread-machine-proof.css";

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

  const [t, courses] = await Promise.all([
    getTranslations("common"),
    getPublicCourses()
  ]);

  /* Structured data receives the same Console-filtered course list as the
     visible catalogue, so hidden/deactivated courses cannot remain in JSON-LD. */
  const businessLd = studioSchema(asLocale(locale), courses);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="kds">
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">{t("skipToContent")}</a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <UnveilWatcher />
        </NextIntlClientProvider>
        <JsonLd data={businessLd} />
      </body>
    </html>
  );
}
