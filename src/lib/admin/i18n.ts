import { cookies } from "next/headers";
import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import gu from "../../../messages/gu.json";

/**
 * Karma Console translations.
 *
 * The console lives outside the `[locale]` segment (staff type `/admin`, not
 * `/en/admin`), so it does not get the public site's NextIntlClientProvider.
 * It reads the SAME `messages/{en,gu}.json` catalogs under an `admin`
 * namespace, which keeps one habit for the whole repo and keeps the EN/GU
 * parity test meaningful for console copy too (CLAUDE.md #1, #13).
 *
 * Server components translate here and pass finished strings into client
 * components as props. That keeps the message catalog out of the browser
 * bundle, which matters on a 3 MB Worker budget.
 */

export const ADMIN_LOCALES = ["en", "gu"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

/** Remembers the console language for people who have not signed in yet. */
export const ADMIN_LOCALE_COOKIE = "karma_admin_locale";

export function isAdminLocale(value: unknown): value is AdminLocale {
  return value === "en" || value === "gu";
}

/**
 * Both catalogs are imported statically rather than by dynamic path so that
 * TypeScript knows the key set — a mistyped console message key is then a
 * build error, exactly as it is on the public site.
 */
const CATALOGS: Record<AdminLocale, typeof en> = { en, gu };

/** Translator scoped to the `admin` namespace. */
export function getAdminT(locale: AdminLocale) {
  return createTranslator({ locale, messages: CATALOGS[locale], namespace: "admin" });
}

export type AdminT = ReturnType<typeof getAdminT>;

/**
 * Console language for a request that has no staff record yet (login, MFA,
 * invite acceptance): the cookie set by the language toggle, else English.
 * Once someone is signed in, `staff.adminLocale` is authoritative instead.
 */
export async function getPreLoginLocale(): Promise<AdminLocale> {
  const store = await cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return isAdminLocale(value) ? value : "en";
}
