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
