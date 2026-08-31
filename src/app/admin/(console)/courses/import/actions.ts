"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { CATALOG_AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";
import { VERIFIED_CATALOG_ROWS, VERIFIED_OPERATIONS_ROWS } from "@/lib/admin/catalog-import";

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
  revalidatePath("/admin/batches");
  revalidatePath("/admin");
  revalidatePath("/api/batches");
  redirect("/admin/courses");
}

/**
 * Owner-only: push the operational facts the owner has confirmed in writing
 * (duration in months, the software taught, the fee plan, the timetable slots,
 * the free-demo policy, the curriculum) onto course rows that already exist.
 *
 * Separate from the catalogue import on purpose. The catalogue import only ever
 * INSERTS, because overwriting a course the owner has edited is exactly the
 * failure the seed script used to have. This action overwrites, so it is its
 * own deliberate button, it touches only the verified-facts columns, and every
 * course it changes is audited with its before and after.
 */
export async function applyVerifiedOperationsAction(): Promise<void> {
  const auth = await authorizeAction({ ownerOnly: true });
  if (!auth.ok) redirect("/admin/no-access?reason=permission");

  const db = getDb();
  if (!db) redirect("/admin/courses/import?error=database");

  try {
    await db.transaction(async (tx) => {
      for (const row of VERIFIED_OPERATIONS_ROWS) {
        const { slug, ...facts } = row;
        const before = await tx
          .select({
            id: schema.courses.id,
            durationMonths: schema.courses.durationMonths,
            software: schema.courses.software,
            feeTotal: schema.courses.feeTotal,
            feeAdmission: schema.courses.feeAdmission,
            feeBalanceDueDays: schema.courses.feeBalanceDueDays,
            termsVersion: schema.courses.termsVersion
          })
          .from(schema.courses)
          .where(eq(schema.courses.slug, slug))
          .limit(1);
        const existing = before[0];
        if (!existing) continue;

        await tx.update(schema.courses).set(facts).where(eq(schema.courses.id, existing.id));
        await tx.insert(schema.auditLogs).values(
          auditValues({
            actor: String(auth.session.staff.id),
            action: CATALOG_AUDIT_ACTIONS.courseUpdated,
            entity: "course",
            entityId: existing.id,
            oldValue: existing,
            newValue: facts,
            reason: "verified operational facts applied"
          })
        );
      }
    });
  } catch (error) {
    console.error("[courses] verified operations apply failed", error);
    redirect("/admin/courses/import?error=import");
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin/batches");
  revalidatePath("/admin");
  revalidatePath("/api/batches");
  redirect("/admin/courses");
}
