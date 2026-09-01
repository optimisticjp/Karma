"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { ADMIN_LOCALE_COOKIE, isAdminLocale } from "@/lib/admin/i18n";

/** One-tap console language change used by the persistent top switch. */
export async function quickSetAdminLocale(formData: FormData) {
  const auth = await authorizeAction();
  if (!auth.ok) return;

  const locale = formData.get("locale");
  if (!isAdminLocale(locale)) return;

  const db = getDb();
  if (!db) return;

  await db
    .update(schema.staff)
    .set({ adminLocale: locale })
    .where(eq(schema.staff.id, auth.session.staff.id));

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/admin", "layout");
}
