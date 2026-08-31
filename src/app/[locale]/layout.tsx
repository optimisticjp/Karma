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
  const businessLd = studioSchema(asLocale(locale));

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* `kds` scopes the public design system and carries the shell's own
          column layout, so the footer sits at the bottom of a short page (404,
          verify results) rather than floating mid-viewport.

          The `site-body` class is GONE. It existed to reserve space for a
          permanent Call/Directions bar at the bottom of every phone screen;
          that bar is superseded by the contextual `<ActionDock>`, which
          reserves its own space on the routes that carry it. */}
      <body className="kds">
        {/* Marks JS availability so reveal animations never hide no-JS content */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="skip-link"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          {/* NO FLOATING CHROME. Conversion is contextual — the high-intent
              routes render `<ActionDock>` themselves and the header's Book
              Free Demo is on every page (plan §15) — and the one-time
              language banner is gone with it.

              That banner existed because the language control used to be a
              small pill in a crowded header, so a Gujarati speaker landing on
              `/en` might never find it. The header now carries a permanent,
              visible `EN | ગુ` switch in the first viewport of every page, so
              the offer is always on screen instead of interrupting once. The
              decision it implemented is unchanged: offer the other language,
              never auto-redirect, and remember an explicit choice. */}
          <UnveilWatcher />
        </NextIntlClientProvider>
        <JsonLd data={businessLd} />
      </body>
    </html>
  );
}
