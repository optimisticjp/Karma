import { routing, type Locale } from "@/i18n/routing";

/**
 * Reading localized content in one place instead of 135.
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * The content layer stores localized strings as a field-suffix convention —
 * `nameEn` / `nameGu`, `introEn` / `introGu` — and call sites resolve it by
 * hand:
 *
 *     locale === "gu" ? course.nameGu : course.nameEn
 *
 * A repository audit counted **135 of those across 46 files**. Two things are
 * wrong with the shape even while there are exactly two locales. The
 * else-branch is English, so a MISSING Gujarati field renders English
 * silently and looks identical to a translated one; and the ternary has to be
 * rewritten everywhere the day the locale set changes, which is how a site
 * ends up half-translated.
 *
 * So resolution moves into one function. A call site says which field family
 * it wants and the locale; this decides how to find it and what to do when a
 * translation is missing.
 *
 * CLAUDE.md non-negotiable #1 points here: prefer `pick()` / `tr()` to a
 * `locale === "gu" ? … : …` ternary in new code.
 *
 * THE FALLBACK RULE, AND WHY IT IS LOUD
 * -------------------------------------
 * A missing translation falls back to English — there is no alternative that
 * renders something useful — but it is NEVER silent in development, because a
 * silent fallback is indistinguishable from a translation that exists. In
 * development a missing field logs the exact key once. In production it
 * returns the English rather than throwing, because a visitor reading one
 * English sentence on a Gujarati page is a smaller failure than a 500.
 */

/** `"Name"` → the suffix convention, e.g. `nameEn` / `nameGu`. */
const SUFFIX: Record<Locale, string> = { en: "En", gu: "Gu" };

/** A record carrying `<base>En` / `<base>Gu` string fields. */
export type SuffixLocalized = Record<string, unknown>;

/** A record carrying `{ en, gu }` directly. */
export type Localized = { en: string; gu: string };

const warned = new Set<string>();

function warnOnce(key: string) {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[i18n] missing translation, falling back to English: ${key}`);
}

/**
 * Resolve a suffix-convention field.
 *
 *     pick(course, "name", locale)   →  course.nameGu ?? course.nameEn
 *
 * `base` is the field family without its locale suffix. Returns the English
 * when the locale's field is absent or empty, and says so in development.
 */
export function pick(record: SuffixLocalized, base: string, locale: Locale): string {
  const wanted = record[`${base}${SUFFIX[locale]}`];
  if (typeof wanted === "string" && wanted.trim() !== "") return wanted;
  const english = record[`${base}En`];
  if (locale !== "en") warnOnce(`${base}${SUFFIX[locale]}`);
  return typeof english === "string" ? english : "";
}

/**
 * The same, for an optional field: returns `undefined` rather than an empty
 * string when neither the locale's value nor the English exists, so a caller
 * can decide not to render the element at all.
 *
 * That distinction matters more than it looks. A course with no Gujarati
 * `outcome` should render no outcome line, not an empty one — the plan's rule
 * is that a field with no data is not displayed, and `""` is truthy enough in
 * JSX to leave a gap where a sentence should be.
 */
export function pickOptional(
  record: SuffixLocalized,
  base: string,
  locale: Locale
): string | undefined {
  const wanted = record[`${base}${SUFFIX[locale]}`];
  if (typeof wanted === "string" && wanted.trim() !== "") return wanted;
  const english = record[`${base}En`];
  if (typeof english === "string" && english.trim() !== "") {
    if (locale !== "en") warnOnce(`${base}${SUFFIX[locale]}`);
    return english;
  }
  return undefined;
}

/**
 * Resolve a `{ en, gu }` object. This is the shape new content should use;
 * `pick` exists for the ~460 existing suffix fields the audit counted, which
 * are not worth a migration on their own.
 */
export function tr(value: Localized, locale: Locale): string {
  const wanted = value[locale];
  if (typeof wanted === "string" && wanted.trim() !== "") return wanted;
  if (locale !== "en") warnOnce(`Localized.${locale}`);
  return value.en;
}

/**
 * A list of every locale except the current one, in routing order. The
 * language chooser uses it, and so does anything offering "read this in".
 */
export function otherLocales(current: Locale): Locale[] {
  return routing.locales.filter((l) => l !== current);
}

/**
 * The `Intl` tag for a locale. Kept here rather than inline at each
 * `Intl.DateTimeFormat` call site, because the previous inline form was
 * `locale === "gu" ? "gu-IN" : "en-IN"`, restated at every formatter.
 */
export function intlLocale(locale: Locale): string {
  return { en: "en-IN", gu: "gu-IN" }[locale];
}

/**
 * Guess the script a string is written in, for content this site did not write.
 *
 * WHY THIS EXISTS
 * ---------------
 * The homepage renders live YouTube titles from the studio's own channel. The
 * studio posts in Gujarati, so those titles are Gujarati — and on the English
 * page they render inside a `lang="en"` document with no marker of their own.
 * Two things follow, and both are real:
 *
 *  - a screen reader announces Gujarati words with an English voice;
 *  - the browser has no signal to reach for the Gujarati face, so the glyphs
 *    fall through to whatever the system happens to have.
 *
 * We cannot know the language of an arbitrary feed string, but we can know its
 * SCRIPT, and here script and language coincide closely enough to be useful.
 *
 * Deliberately returns `undefined` rather than guessing "en" for Latin text —
 * a wrong `lang` is worse than none, and Latin appears inside Gujarati
 * sentences constantly in this trade.
 */
export function scriptLang(value: string): Locale | undefined {
  if (/[\u0A80-\u0AFF]/.test(value)) return "gu";
  return undefined;
}
