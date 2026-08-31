import type { Metadata } from "next";
import { site } from "./site";
import { asLocale, OG_LOCALE, routing } from "@/i18n/routing";

/**
 * Per-page metadata with correct hreflang alternates.
 *
 * The alternates and the OpenGraph locale are DERIVED from `routing.locales`,
 * not listed. Before 2026-08-31 both were hardcoded to two languages while the
 * sitemap iterated the locale list — so adding a third locale would have
 * tripled the sitemap's URLs while every one of them advertised only two
 * alternates. A hreflang set that disagrees with the sitemap is worse than no
 * hreflang: it tells a crawler the Hindi page has no Hindi alternate.
 */
export function pageMeta(opts: {
  locale: string;
  path: string; // "" for home, "/courses", ...
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const { locale, path, title, description, noIndex } = opts;
  const languages = Object.fromEntries([
    ...routing.locales.map((l) => [l, `${site.url}/${l}${path}`]),
    /* x-default points at the default locale, which is a routing fact rather
       than the literal string "en". */
    ["x-default", `${site.url}/${routing.defaultLocale}${path}`]
  ]);
  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/${locale}${path}`,
      languages
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: `${site.url}/${locale}${path}`,
      siteName: site.name,
      locale: OG_LOCALE[asLocale(locale)],
      type: "website"
    }
  };
}
