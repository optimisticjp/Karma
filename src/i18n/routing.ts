import { defineRouting } from "next-intl/routing";

/**
 * URL decides the language; we never auto-redirect on browser language
 * (Google i18n guidance + master plan section 13). The visitor chooses, and
 * the choice is remembered.
 *
 * TRILINGUAL SINCE 2026-08-31 (owner decision, Modern Textile Lab plan §4.1).
 * Karma teaches in Gujarati and Hindi and always has — `src/lib/schema.ts`
 * has published `availableLanguage: ["gu","hi","en"]` since before this — so
 * adding the Hindi *website* locale states nothing new about teaching. It
 * gives the Hindi speakers who already walk into the studio a site in the
 * language they were already going to be taught in.
 *
 * ⚠️ CONFIRM-WITH-OWNER (Q5): to make Gujarati the default, change
 * defaultLocale to "gu". One line.
 */
export const routing = defineRouting({
  locales: ["en", "gu", "hi"],
  defaultLocale: "en",
  localeDetection: false
});

/**
 * The public locale set, derived.
 *
 * Import THIS rather than re-typing `"en" | "gu"` by hand. The Phase 1 audit
 * found the union hand-written at 41 sites across 33 files and this derived
 * type imported by nobody — which meant adding a locale changed nothing
 * outside this file and every other file silently treated Hindi as English.
 *
 * Karma Console is deliberately NOT trilingual: `AdminLocale` in
 * `src/lib/admin/i18n.ts` stays `"en" | "gu"`, because staff choose a console
 * language and Hindi is a public decision. Do not merge the two types.
 */
export type Locale = (typeof routing.locales)[number];

/** Narrow an unknown string to a public locale, defaulting rather than throwing. */
export function asLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

/**
 * How each locale names itself, for the language chooser.
 *
 * A language is always offered in its own script — a Hindi speaker looks for
 * "हिन्दी", not for "Hindi". `preview` is a short line of real site copy in
 * that language, so the chooser shows what the site will actually feel like
 * rather than asserting a name. No flags: a flag is a country, and none of
 * these three is one.
 */
export const LOCALE_NAMES: Record<Locale, { name: string; short: string; preview: string }> = {
  en: { name: "English", short: "EN", preview: "From screen to stitch" },
  gu: { name: "ગુજરાતી", short: "ગુ", preview: "સ્ક્રીનથી સ્ટિચ સુધી" },
  hi: { name: "हिन्दी", short: "हि", preview: "Screen से stitch तक" }
};

/** The BCP-47 tag OpenGraph and `hreflang` want for each locale. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_IN",
  gu: "gu_IN",
  hi: "hi_IN"
};
