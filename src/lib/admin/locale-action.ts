"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_LOCALE_COOKIE, isAdminLocale } from "./i18n";

/**
 * Stores the console language for a browser. Used by the pre-login toggle and
 * kept in step by the account page when a signed-in person changes their
 * stored preference.
 *
 * The value is validated against the locale list, never written through from
 * the form, so this cannot be turned into a cookie-injection primitive.
 */
export async function setAdminLocaleCookie(formData: FormData) {
  const value = formData.get("locale");
  if (!isAdminLocale(value)) return;

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365
  });
  revalidatePath("/admin", "layout");
}
