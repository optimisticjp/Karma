"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { authorizeAction } from "@/lib/auth/guard";
import { auditValues, FEE_AUDIT_ACTIONS } from "@/lib/admin/audit";
import { validateAgreementUpdate, validatePaymentEntry } from "@/lib/admin/fees";
import { pad } from "@/lib/utils";

export type FeeState = {
  status: "idle" | "success" | "error";
  message:
    | null
    | "saved"
    | "agreementSaved"
    | "denied"
    | "invalid"
    | "missing"
    | "overpaid"
    | "belowReceived"
    | "agreementMissing"
    | "discountDecrease"
    | "generic";
};

const ok = (message: FeeState["message"]): FeeState => ({ status: "success", message });
const fail = (message: FeeState["message"]): FeeState => ({ status: "error", message });

export async function addFeeRecordAction(_prev: FeeState, formData: FormData): Promise<FeeState> {
  const auth = await authorizeAction({ permission: "fees.manage" });
  if (!auth.ok) return fail("denied");
  const parsed = validatePaymentEntry(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const d = parsed.value;
    const enrollment = await db
      .select({ id: schema.enrollments.id, agreedFeeTotal: schema.enrollments.agreedFeeTotal })
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, d.enrollmentId))
      .limit(1);
    if (!enrollment[0]) return fail("missing");

    const previous = await db
      .select({ received: schema.feeRecords.received, discount: schema.feeRecords.discount, courseFee: schema.feeRecords.courseFee })
      .from(schema.feeRecords)
      .where(eq(schema.feeRecords.enrollmentId, d.enrollmentId))
      .orderBy(desc(schema.feeRecords.createdAt));

    const agreedFeeTotal = enrollment[0].agreedFeeTotal ?? previous[0]?.courseFee ?? null;
    if (agreedFeeTotal == null) return fail("agreementMissing");
    const alreadyReceived = previous.reduce((sum, row) => sum + row.received, 0);
    const currentDiscount = previous.reduce((max, row) => Math.max(max, row.discount), 0);
    if (d.discount != null && d.discount < currentDiscount) return fail("discountDecrease");
    const discount = d.discount ?? currentDiscount;
    if (discount > agreedFeeTotal) return fail("invalid");
    const netFee = Math.max(0, agreedFeeTotal - discount);
    if (alreadyReceived + d.received > netFee) return fail("overpaid");

    await db.transaction(async (tx) => {
      const inserted = await tx.insert(schema.feeRecords).values({
        enrollmentId: d.enrollmentId,
        courseFee: agreedFeeTotal,
        discount,
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
        newValue: { enrollmentId: d.enrollmentId, courseFee: agreedFeeTotal, discount, received: d.received, method: d.method, receiptNo, dueDate: d.dueDate },
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

/**
 * Changes what an EXISTING student agreed to pay.
 *
 * The agreement is a snapshot taken when they joined, precisely so that editing
 * a course's fee cannot reprice them. This is the one supported way to move it,
 * and it is deliberately awkward: a mandatory reason, a full before/after audit
 * row, and a refusal to set a total below what has already been received.
 */
export async function updateAgreementAction(
  _prev: FeeState,
  formData: FormData
): Promise<FeeState> {
  const auth = await authorizeAction({ permission: "fees.manage" });
  if (!auth.ok) return fail("denied");
  const parsed = validateAgreementUpdate(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return fail("invalid");
  const db = getDb();
  if (!db) return fail("generic");

  try {
    const d = parsed.value;
    const before = await db
      .select({
        id: schema.enrollments.id,
        agreedFeeTotal: schema.enrollments.agreedFeeTotal,
        agreedAdmissionAmount: schema.enrollments.agreedAdmissionAmount,
        agreedBalanceDueOn: schema.enrollments.agreedBalanceDueOn,
        agreedCourseName: schema.enrollments.agreedCourseName
      })
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, d.enrollmentId))
      .limit(1);
    if (!before[0]) return fail("missing");

    /* Lowering the agreed total below money already banked would make the
       ledger say the studio owes a refund it has not agreed to. */
    const paid = await db
      .select({ received: schema.feeRecords.received })
      .from(schema.feeRecords)
      .where(eq(schema.feeRecords.enrollmentId, d.enrollmentId));
    const received = paid.reduce((sum, row) => sum + row.received, 0);
    if (d.agreedFeeTotal != null && d.agreedFeeTotal < received) return fail("belowReceived");

    const next = {
      agreedFeeTotal: d.agreedFeeTotal,
      agreedAdmissionAmount: d.agreedAdmissionAmount,
      agreedBalanceDueOn: d.agreedBalanceDueOn
    };

    await db.transaction(async (tx) => {
      await tx.update(schema.enrollments).set(next).where(eq(schema.enrollments.id, d.enrollmentId));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: FEE_AUDIT_ACTIONS.agreementUpdated,
          entity: "enrollment",
          entityId: d.enrollmentId,
          oldValue: before[0],
          newValue: next,
          reason: d.reason
        })
      );
    });
  } catch (error) {
    console.error("[fees] agreement update failed", error instanceof Error ? error.message : "unknown");
    return fail("generic");
  }

  revalidatePath("/admin/fees");
  revalidatePath("/admin/students");
  return ok("agreementSaved");
}
