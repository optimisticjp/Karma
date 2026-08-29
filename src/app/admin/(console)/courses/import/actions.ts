"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { CATALOG_AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";
import { VERIFIED_CATALOG_ROWS } from "@/lib/admin/catalog-import";

/**
 * Owner-only, idempotent import of Karma's verified course catalogue.
 * Existing slugs are left untouched; only missing courses are inserted.
 */
export async function importVerifiedCatalogAction(): Promise<void> {
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) redirect("/admin/no-access?reason=permission");

  const db = getDb();
  if (!db) redirect("/admin/courses/import?error=database");

  try {
    await db.transaction(async (tx) => {
      for (const row of VERIFIED_CATALOG_ROWS) {
        const inserted = await tx
          .insert(schema.courses)
          .values(row)
          .onConflictDoNothing({ target: schema.courses.slug })
          .returning({ id: schema.courses.id, slug: schema.courses.slug });

        const created = inserted[0];
        if (!created) continue;

        await tx.insert(schema.auditLogs).values(
          auditValues({
            actor: String(auth.session.staff.id),
            action: CATALOG_AUDIT_ACTIONS.courseCreated,
            entity: "course",
            entityId: created.id,
            newValue: row,
            reason: "verified Karma catalogue import"
          })
        );
      }
    });
  } catch (error) {
    console.error("[courses] verified catalogue import failed", error);
    redirect("/admin/courses/import?error=import");
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/api/batches");
  redirect("/admin/courses");
}
