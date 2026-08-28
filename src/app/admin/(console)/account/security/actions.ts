"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { ADMIN_LOCALE_COOKIE, isAdminLocale } from "@/lib/admin/i18n";

export type LocaleState = { saved: boolean };

/**
 * Saves the signed-in person's console language.
 *
 * Only ever touches the CALLER's own staff row — the id comes from the guarded
 * session, never from the form — so this cannot be pointed at someone else's
 * account. It also mirrors the choice into the cookie so the pre-login screens
 * (which have no staff record to read) show the right language next time.
 */
export async function saveAdminLocaleAction(
  _prev: LocaleState,
  formData: FormData
): Promise<LocaleState> {
  const auth = await authorizeAction();
  if (!auth.ok) return { saved: false };

  const locale = formData.get("locale");
  if (!isAdminLocale(locale)) return { saved: false };

  const db = getDb();
  if (!db) return { saved: false };

  try {
    await db
      .update(schema.staff)
      .set({ adminLocale: locale })
      .where(eq(schema.staff.id, auth.session.staff.id));
  } catch (e) {
    console.error("[account] locale save failed", e);
    return { saved: false };
  }

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/admin", "layout");
  return { saved: true };
}
