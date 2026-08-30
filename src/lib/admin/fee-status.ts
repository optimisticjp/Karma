/**
 * What a student owes, derived rather than declared.
 *
 * The old ledger showed the fee terms from the LATEST fee row and summed
 * `received` across all of them. That works until someone edits a course fee,
 * or until two staff record terms differently, at which point the ledger and
 * the agreement quietly disagree and nobody can tell which is right.
 *
 * So the agreement is now the enrolment's own snapshot — `agreed_fee_total`,
 * copied from the course at the moment of joining and never recalculated from
 * it — and everything else is derived from the ledger:
 *
 *     net       = agreed total − discount
 *     received  = Σ fee_records.received
 *     balance   = max(0, net − received)
 *     status    = unpaid | partial | paid
 *
 * **Status is never stored.** A `status` column would be a second source of
 * truth for a number that is already in the ledger, and the two would drift the
 * first time a receipt was corrected. Nobody can mark a student "paid" without
 * the money actually being recorded.
 */

export const FEE_STATUSES = ["unpaid", "partial", "paid"] as const;
export type FeeStatus = (typeof FEE_STATUSES)[number];

export type FeeLedgerEntry = {
  received: number;
  /** Terms as recorded on this entry. Used only as a fallback — see below. */
  courseFee?: number | null;
  discount?: number | null;
  dueDate?: string | null;
};

export type FeeAgreement = {
  /** The enrolment's snapshot. Null when the course had no fee plan on joining. */
  agreedFeeTotal: number | null;
  agreedAdmissionAmount: number | null;
  agreedBalanceDueOn: string | null;
};

export type FeeSummary = {
  /** The agreed total before discount. Null when nothing has been agreed yet. */
  agreed: number | null;
  discount: number;
  /** Agreed minus discount. 0 when nothing has been agreed. */
  net: number;
  received: number;
  balance: number;
  status: FeeStatus;
  /** What was expected at admission, and whether it has been met. */
  admissionExpected: number | null;
  admissionMet: boolean;
  nextDueOn: string | null;
  /** True when no agreement exists yet — the ledger cannot be judged. */
  unset: boolean;
};

/**
 * Summarises one enrolment's fees.
 *
 * Precedence for the agreed total: the enrolment's snapshot first, because that
 * is what the student signed. A ledger entry's own `courseFee` is used only for
 * enrolments created before the snapshot existed, so historical records keep
 * showing the number they were entered with rather than jumping to whatever the
 * course costs today.
 */
export function summariseFees(
  agreement: FeeAgreement,
  entries: readonly FeeLedgerEntry[]
): FeeSummary {
  const received = entries.reduce((sum, e) => sum + Math.max(0, e.received), 0);

  const legacy = entries.find((e) => e.courseFee != null);
  const agreed =
    agreement.agreedFeeTotal != null ? agreement.agreedFeeTotal : (legacy?.courseFee ?? null);

  /* Discount lives on the ledger, not on the agreement: it is a decision staff
     make about this student, and it is recorded with a receipt trail. */
  const discount = Math.max(0, entries.reduce((max, e) => Math.max(max, e.discount ?? 0), 0));

  const net = agreed == null ? 0 : Math.max(0, agreed - Math.min(discount, agreed));
  const balance = agreed == null ? 0 : Math.max(0, net - received);

  const status: FeeStatus =
    agreed == null || net === 0
      ? received > 0
        ? "paid"
        : "unpaid"
      : received <= 0
        ? "unpaid"
        : balance > 0
          ? "partial"
          : "paid";

  const admissionExpected = agreement.agreedAdmissionAmount;

  return {
    agreed,
    discount: agreed == null ? 0 : Math.min(discount, agreed),
    net,
    received,
    balance,
    status,
    admissionExpected,
    admissionMet: admissionExpected == null ? true : received >= admissionExpected,
    nextDueOn: nextDue(agreement, entries, balance),
    unset: agreed == null
  };
}

/**
 * The date the next money is expected. The enrolment's agreed balance date wins
 * while a balance is outstanding; a later manual due date on the ledger
 * overrides it, because staff set that deliberately for this student.
 */
function nextDue(
  agreement: FeeAgreement,
  entries: readonly FeeLedgerEntry[],
  balance: number
): string | null {
  if (balance <= 0) return null;
  const manual = entries
    .map((e) => e.dueDate)
    .filter((d): d is string => typeof d === "string" && d.length === 10)
    .sort()
    .pop();
  return manual ?? agreement.agreedBalanceDueOn ?? null;
}

/** True when the balance is outstanding and its due date has passed. */
export function isOverdue(summary: FeeSummary, today: string): boolean {
  return summary.balance > 0 && summary.nextDueOn != null && summary.nextDueOn < today;
}
