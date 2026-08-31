import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { LangBanner } from "@/components/site/LangBanner";
import { UnveilWatcher } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/site/JsonLd";
import { site } from "@/lib/site";
import { studioSchema } from "@/lib/schema";
import "../globals.css";
import "../premium.css";
import "../machine-lab.css";
/* THREAD / MACHINE / PROOF — the public design system, and the reason it is
   last and the reason it is here.

   There is no shared root layout in this project: `admin/layout.tsx` is a
   second, independent root that imports the three sheets above. This one is
   imported by the PUBLIC root only, so nothing in it can reach Karma Console
   even by accident — and every rule inside is additionally scoped to `.kds`,
   so a future stray import could not restyle a staff screen either.

   It replaces `textile-lab.css`, deleted in the same commit. See the file
   header for why a token bridge was not a redesign. */
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
  const t = await getTranslations("common");

  /* Structured data is built in one module so the fact discipline lives in
     one place — see the note at the top of src/lib/schema.ts. */
  const businessLd = studioSchema(locale === "gu" ? "gu" : "en");

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Column layout so the footer sits at the bottom of short pages (404,
          verify results) instead of floating mid-viewport. Scoped to the
          public shell: Karma Console has its own root layout. */}
      {/* `site-body` still carries the shell's flex column and the mobile
          tab-bar offset from `premium.css`; `kds` scopes the new public design
          system. The shell itself is rebuilt in the next phase, at which point
          the first class goes. */}
      <body className="site-body kds">
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
          <MobileTabBar />
          <LangBanner />
          <UnveilWatcher />
        </NextIntlClientProvider>
        <JsonLd data={businessLd} />
      </body>
    </html>
  );
}
