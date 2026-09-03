export const FEE_METHODS = ["cash", "upi", "bank", "other"] as const;
export type FeeMethod = (typeof FEE_METHODS)[number];

function amount(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 10_000_000 ? n : null;
}

function positiveId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function optionalDate(value: unknown): string | null | "invalid" {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  return value;
}

function optionalText(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export type FeeRecordInput = {
  enrollmentId: number;
  courseFee: number;
  discount: number;
  received: number;
  method: FeeMethod | null;
  receiptNo: string | null;
  dueDate: string | null;
  notes: string | null;
};

export function validateFeeRecord(input: Record<string, unknown>): { ok: true; value: FeeRecordInput } | { ok: false } {
  const enrollmentId = positiveId(input.enrollmentId);
  const courseFee = amount(input.courseFee);
  const discount = amount(input.discount);
  const received = amount(input.received);
  const dueDate = optionalDate(input.dueDate);
  const rawMethod = optionalText(input.method, 30);
  const method = rawMethod && FEE_METHODS.includes(rawMethod as FeeMethod) ? rawMethod as FeeMethod : null;
  if (!enrollmentId || courseFee == null || discount == null || received == null || dueDate === "invalid") return { ok: false };
  if (discount > courseFee || (received > 0 && !method)) return { ok: false };
  return {
    ok: true,
    value: {
      enrollmentId,
      courseFee,
      discount,
      received,
      method,
      receiptNo: optionalText(input.receiptNo, 40),
      dueDate,
      notes: optionalText(input.notes, 300)
    }
  };
}

export type PaymentEntryInput = {
  enrollmentId: number;
  received: number;
  discount: number | null;
  method: FeeMethod | null;
  receiptNo: string | null;
  dueDate: string | null;
  notes: string | null;
};

/** Daily front-desk receipt input. The agreed fee never comes from this form. */
export function validatePaymentEntry(input: Record<string, unknown>):
  | { ok: true; value: PaymentEntryInput }
  | { ok: false } {
  const enrollmentId = positiveId(input.enrollmentId);
  const received = amount(input.received);
  const hasDiscount = input.discount != null && input.discount !== "";
  const discount = hasDiscount ? amount(input.discount) : null;
  const dueDate = optionalDate(input.dueDate);
  const rawMethod = optionalText(input.method, 30);
  const method = rawMethod && FEE_METHODS.includes(rawMethod as FeeMethod) ? rawMethod as FeeMethod : null;
  if (!enrollmentId || received == null || (hasDiscount && discount == null) || dueDate === "invalid") return { ok: false };
  if (received > 0 && !method) return { ok: false };
  return {
    ok: true,
    value: {
      enrollmentId,
      received,
      discount,
      method,
      receiptNo: optionalText(input.receiptNo, 40),
      dueDate,
      notes: optionalText(input.notes, 300)
    }
  };
}

export type AdmissionFeeSetupInput = {
  agreedFeeTotal: number | null;
  agreedAdmissionAmount: number | null;
  agreedBalanceDueOn: string | null;
  discount: number;
  received: number;
  method: FeeMethod | null;
  receiptNo: string | null;
  notes: string | null;
};

/** Optional commercial terms entered while a walk-in is admitted. */
export function validateAdmissionFeeSetup(input: Record<string, unknown>):
  | { ok: true; value: AdmissionFeeSetupInput }
  | { ok: false } {
  const hasTotal = input.agreedFeeTotal != null && input.agreedFeeTotal !== "";
  const hasAdmission = input.agreedAdmissionAmount != null && input.agreedAdmissionAmount !== "";
  const total = hasTotal ? amount(input.agreedFeeTotal) : null;
  const admission = hasAdmission ? amount(input.agreedAdmissionAmount) : null;
  const dueOn = optionalDate(input.agreedBalanceDueOn);
  const discount = amount(input.feeDiscount ?? 0);
  const received = amount(input.feeReceived ?? 0);
  const rawMethod = optionalText(input.feeMethod, 30);
  const method = rawMethod && FEE_METHODS.includes(rawMethod as FeeMethod) ? rawMethod as FeeMethod : null;
  if (dueOn === "invalid" || discount == null || received == null) return { ok: false };
  if ((hasTotal && total == null) || (hasAdmission && admission == null)) return { ok: false };
  if (received > 0 && !method) return { ok: false };
  return {
    ok: true,
    value: {
      agreedFeeTotal: total,
      agreedAdmissionAmount: admission,
      agreedBalanceDueOn: dueOn,
      discount,
      received,
      method,
      receiptNo: optionalText(input.feeReceiptNo, 40),
      notes: optionalText(input.feeNote, 300)
    }
  };
}

/* --------------------------- the agreement -------------------------------- */

export type AgreementUpdateInput = {
  enrollmentId: number;
  agreedFeeTotal: number | null;
  agreedAdmissionAmount: number | null;
  agreedBalanceDueOn: string | null;
  /** Required. Changing what a student owes is never an unexplained edit. */
  reason: string;
};

/**
 * Validates a deliberate change to an existing student's commercial agreement.
 *
 * The agreement is normally a snapshot taken at joining and never touched
 * again — that is the whole point of storing it on the enrolment rather than
 * reading the course. This is the one supported way to change it, and it
 * carries a mandatory reason so the audit row says WHY a student's fee moved.
 */
export function validateAgreementUpdate(input: Record<string, unknown>):
  | { ok: true; value: AgreementUpdateInput }
  | { ok: false } {
  const enrollmentId = positiveId(input.enrollmentId);
  const blankTotal = input.agreedFeeTotal == null || input.agreedFeeTotal === "";
  const blankAdmission = input.agreedAdmissionAmount == null || input.agreedAdmissionAmount === "";
  const agreedFeeTotal = blankTotal ? null : amount(input.agreedFeeTotal);
  const agreedAdmissionAmount = blankAdmission ? null : amount(input.agreedAdmissionAmount);
  const agreedBalanceDueOn = optionalDate(input.agreedBalanceDueOn);
  const reason = optionalText(input.reason, 300);

  if (!enrollmentId || !reason || reason.length < 3) return { ok: false };
  if (!blankTotal && agreedFeeTotal == null) return { ok: false };
  if (!blankAdmission && agreedAdmissionAmount == null) return { ok: false };
  if (agreedBalanceDueOn === "invalid") return { ok: false };
  /* Mirrors chk_enrollment_agreement: an admission amount without a total, or
     larger than the total, is not an agreement anyone could honour. */
  if (agreedAdmissionAmount != null && agreedFeeTotal == null) return { ok: false };
  if (agreedAdmissionAmount != null && agreedFeeTotal != null && agreedAdmissionAmount > agreedFeeTotal) {
    return { ok: false };
  }

  return {
    ok: true,
    value: { enrollmentId, agreedFeeTotal, agreedAdmissionAmount, agreedBalanceDueOn, reason }
  };
}
