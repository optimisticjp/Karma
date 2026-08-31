import { getLocale, getTranslations } from "next-intl/server";
import { asLocale } from "@/i18n/routing";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/site/JsonLd";

/**
 * BREADCRUMBS for a second-level public page.
 *
 * The site is two levels deep, so every indexable page is either the home page
 * or one step from it — `Home › Courses`, `Home › Machine Notes`. The deeper
 * pages (a course, a note) build their own three-step trail because they have
 * a real parent section to name.
 *
 * WHY THE LABEL COMES FROM ITS OWN NAMESPACE
 * ------------------------------------------
 * `crumbs.*` rather than `nav.*`: a breadcrumb names a PLACE and a nav link
 * invites a CLICK, and the two want different words often enough that sharing
 * one string would eventually make one of them wrong. It also gives the four
 * pages that are not in the header — the admission form, the stories, the
 * certificate check, the privacy policy — a name of their own.
 *
 * Both crumbs are localized, the home one included. It used to be the English
 * word "Home" on a Gujarati page.
 */
export async function PageCrumbs({ page, path }: { page: string; path: string }) {
  const [t, rawLocale] = await Promise.all([getTranslations("crumbs"), getLocale()]);
  const l = asLocale(rawLocale);
  return (
    <JsonLd
      data={breadcrumbSchema(l, [[t(page as "courses"), path]], t("home"))}
    />
  );
}
