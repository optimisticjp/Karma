import { defineRouting } from "next-intl/routing";

/**
 * URL decides the language; we never auto-redirect on browser language
 * (Google i18n guidance + master plan section 13). The visitor chooses, and
 * the choice is remembered.
 *
 * THE PUBLIC WEBSITE IS ENGLISH + GUJARATI. THAT IS THE WHOLE LIST.
 * -----------------------------------------------------------------
 * A Hindi website locale was added on 2026-08-31 and removed the same day by
 * owner correction (see `docs/karma-modern-textile-lab-redesign-plan.md` §1.1).
 * Do not add a third public locale without a written owner decision.
 *
 * This says nothing about what Karma TEACHES. The studio teaches and supports
 * students in Gujarati and Hindi, which is a business fact recorded in
 * `src/lib/schema.ts` (`TEACHING_LANGUAGES`) and published as
 * `availableLanguage` / `inLanguage`. A website UI language and a teaching
 * language are two different claims, and only the first one is decided here.
 *
 * ⚠️ CONFIRM-WITH-OWNER (Q5): to make Gujarati the default, change
 * defaultLocale to "gu". One line.
 */
export const routing = defineRouting({
  locales: ["en", "gu"],
  defaultLocale: "en",
  localeDetection: false
});

/**
 * The public locale set, derived.
 *
 * Import THIS rather than re-typing `"en" | "gu"` by hand, so the day the
 * owner does decide on a third language, the type system points at every
 * place that has to be revisited instead of silently rendering English.
 *
 * Karma Console has its own two-value `AdminLocale` in `src/lib/admin/i18n.ts`.
 * The two types happen to have the same members today and still must not be
 * merged: one is a website decision, the other is a staff preference.
 */
export type Locale = (typeof routing.locales)[number];

/** Narrow an unknown string to a public locale, defaulting rather than throwing. */
export function asLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

/**
 * How each locale names itself, for the language control.
 *
 * A language is always offered in its own script — a Gujarati speaker looks
 * for "ગુજરાતી", not for "Gujarati". `preview` is a short line of real site
 * copy in that language, so a control that has room for it shows what the
 * site will feel like rather than asserting a name. No flags: a flag is a
 * country, and neither of these is one.
 */
export const LOCALE_NAMES: Record<Locale, { name: string; short: string; preview: string }> = {
  en: { name: "English", short: "EN", preview: "From screen to stitch" },
  gu: { name: "ગુજરાતી", short: "ગુ", preview: "સ્ક્રીનથી સ્ટિચ સુધી" }
};

/** The BCP-47 tag OpenGraph and `hreflang` want for each locale. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_IN",
  gu: "gu_IN"
};
