"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, FEE_AUDIT_ACTIONS } from "@/lib/admin/audit";
import { validateFeeRecord } from "@/lib/admin/fees";
import { pad } from "@/lib/utils";

export type FeeState = {
  status: "idle" | "success" | "error";
  message: null | "saved" | "denied" | "invalid" | "missing" | "overpaid" | "generic";
};

const ok = (message: FeeState["message"]): FeeState => ({ status: "success", message });
const fail = (message: FeeState["message"]): FeeState => ({ status: "error", message });

export async function addFeeRecordAction(_prev: FeeState, formData: FormData): Promise<FeeState> {
  const auth = await authorizeAction({ permission: "fees.manage" });
  if (!auth.ok) return fail("denied");
  const parsed = validateFeeRecord(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const d = parsed.value;
    const enrollment = await db.select({ id: schema.enrollments.id }).from(schema.enrollments).where(eq(schema.enrollments.id, d.enrollmentId)).limit(1);
    if (!enrollment[0]) return fail("missing");
    const previous = await db.select({ received: schema.feeRecords.received }).from(schema.feeRecords).where(eq(schema.feeRecords.enrollmentId, d.enrollmentId)).orderBy(desc(schema.feeRecords.createdAt));
    const alreadyReceived = previous.reduce((sum, row) => sum + row.received, 0);
    const netFee = Math.max(0, d.courseFee - d.discount);
    if (alreadyReceived + d.received > netFee) return fail("overpaid");

    await db.transaction(async (tx) => {
      const inserted = await tx.insert(schema.feeRecords).values({
        enrollmentId: d.enrollmentId,
        courseFee: d.courseFee,
        discount: d.discount,
        received: d.received,
        method: d.method,
        receiptNo: d.receiptNo,
        dueDate: d.dueDate,
        notes: d.notes
      }).returning({ id: schema.feeRecords.id });
      const id = inserted[0]?.id;
      if (!id) throw new Error("fee record insert returned no id");
      const receiptNo = d.receiptNo ?? (d.received > 0 ? `KDS-R-${new Date().getFullYear()}-${pad(id)}` : null);
      if (receiptNo && !d.receiptNo) await tx.update(schema.feeRecords).set({ receiptNo }).where(eq(schema.feeRecords.id, id));
      await tx.insert(schema.auditLogs).values(auditValues({
        actor: String(auth.session.staff.id),
        action: FEE_AUDIT_ACTIONS.recordCreated,
        entity: "fee_record",
        entityId: id,
        newValue: {
          enrollmentId: d.enrollmentId,
          courseFee: d.courseFee,
          discount: d.discount,
          received: d.received,
          method: d.method,
          receiptNo,
          dueDate: d.dueDate
        },
        reason: d.notes ?? "offline fee ledger entry"
      }));
    });
  } catch (error) {
    console.error("[fees] save failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }

  revalidatePath("/admin/fees");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  return ok("saved");
}
