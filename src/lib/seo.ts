import type { Metadata } from "next";
import { site } from "./site";
import { asLocale, OG_LOCALE, routing } from "@/i18n/routing";

/**
 * Per-page metadata with correct hreflang alternates.
 *
 * The alternates and the OpenGraph locale are DERIVED from `routing.locales`
 * rather than listed. They were once hardcoded while the sitemap iterated the
 * locale list, which means the two could disagree — and a hreflang set that
 * disagrees with the sitemap is worse than no hreflang, because it tells a
 * crawler that a page it can see has no alternate. Deriving both from one
 * source is what makes them agree by construction.
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
