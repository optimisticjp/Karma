import type { Metadata } from "next";
import { site } from "./site";

/** Per-page metadata with correct hreflang alternates (plan 14.2). */
export function pageMeta(opts: {
  locale: string;
  path: string; // "" for home, "/courses", ...
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const { locale, path, title, description, noIndex } = opts;
  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/${locale}${path}`,
      languages: {
        en: `${site.url}/en${path}`,
        gu: `${site.url}/gu${path}`,
        "x-default": `${site.url}/en${path}`
      }
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: `${site.url}/${locale}${path}`,
      siteName: site.name,
      locale: locale === "gu" ? "gu_IN" : "en_IN",
      type: "website"
    }
  };
}
