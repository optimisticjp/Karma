import { defineRouting } from "next-intl/routing";

/**
 * URL decides the language; we never auto-redirect on browser language
 * (Google i18n guidance + master plan section 13). A one-time banner offers
 * the other language instead (components/site/LangBanner).
 *
 * ⚠️ CONFIRM-WITH-OWNER (Q5): to make Gujarati the default, change
 * defaultLocale to "gu". One line.
 */
export const routing = defineRouting({
  locales: ["en", "gu"],
  defaultLocale: "en",
  localeDetection: false
});

export type Locale = (typeof routing.locales)[number];
