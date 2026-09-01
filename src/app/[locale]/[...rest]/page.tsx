import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NotFound from "../not-found";

/**
 * Middleware supplies the real HTTP 404 status for unknown locale-prefixed
 * paths. Rendering the branded boundary directly here lets this matched route
 * also own correct noindex metadata and a 404 browser-tab title, instead of
 * calling notFound() and inheriting the home page title.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound" });
  return {
    title: `${t("title")} | Karma Design Studio`,
    robots: { index: false, follow: false }
  };
}

export default async function CatchAllPage({
  params
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotFound />;
}
