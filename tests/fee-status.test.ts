import { describe, expect, it } from "vitest";
import { isOverdue, summariseFees, type FeeLedgerEntry } from "@/lib/admin/fee-status";
import { EMCAD_DAHAO } from "@/content/course-operations";
import { addDays } from "@/lib/admin/course-operations";
import { validateAgreementUpdate } from "@/lib/admin/fees";

const emcad = {
  agreedFeeTotal: EMCAD_DAHAO.fees.feeTotal,
  agreedAdmissionAmount: EMCAD_DAHAO.fees.feeAdmission,
  agreedBalanceDueOn: addDays("2026-09-01", EMCAD_DAHAO.fees.feeBalanceDueDays)
};

const paid = (received: number, extra: Partial<FeeLedgerEntry> = {}): FeeLedgerEntry => ({
  received,
  ...extra
});

describe("fee status is derived, never declared", () => {
  it("walks an EMCAD DAHAO student from unpaid to paid", () => {
    const none = summariseFees(emcad, []);
    expect(none.agreed).toBe(35_000);
    expect(none.received).toBe(0);
    expect(none.balance).toBe(35_000);
    expect(none.status).toBe("unpaid");
    expect(none.admissionMet).toBe(false);

    const admission = summariseFees(emcad, [paid(25_000)]);
    expect(admission.received).toBe(25_000);
    expect(admission.balance).toBe(10_000);
    expect(admission.status).toBe("partial");
    expect(admission.admissionMet).toBe(true);
    expect(admission.nextDueOn).toBe("2026-10-01");

    const settled = summariseFees(emcad, [paid(25_000), paid(10_000)]);
    expect(settled.balance).toBe(0);
    expect(settled.status).toBe("paid");
    expect(settled.nextDueOn).toBeNull();
  });

  it("flags a part payment that has not met the admission amount", () => {
    const short = summariseFees(emcad, [paid(5_000)]);
    expect(short.status).toBe("partial");
    expect(short.admissionMet).toBe(false);
    expect(short.admissionExpected).toBe(25_000);
  });

  it("applies a discount to the balance without touching the agreed total", () => {
    const discounted = summariseFees(emcad, [paid(0, { discount: 5_000 }), paid(30_000)]);
    expect(discounted.agreed).toBe(35_000);
    expect(discounted.discount).toBe(5_000);
    expect(discounted.net).toBe(30_000);
    expect(discounted.balance).toBe(0);
    expect(discounted.status).toBe("paid");
  });

  it("never reports a negative balance, however the ledger was entered", () => {
    const over = summariseFees(emcad, [paid(40_000)]);
    expect(over.balance).toBe(0);
    expect(over.status).toBe("paid");
  });

  it("says 'not agreed yet' rather than guessing when there is no agreement", () => {
    const unset = summariseFees(
      { agreedFeeTotal: null, agreedAdmissionAmount: null, agreedBalanceDueOn: null },
      []
    );
    expect(unset.unset).toBe(true);
    expect(unset.agreed).toBeNull();
    expect(unset.status).toBe("unpaid");
  });

  it("falls back to a legacy ledger entry for enrolments created before snapshots existed", () => {
    // Historical records must keep showing the number they were entered with,
    // not whatever the course costs today.
    const legacy = summariseFees(
      { agreedFeeTotal: null, agreedAdmissionAmount: null, agreedBalanceDueOn: null },
      [paid(8_000, { courseFee: 20_000 })]
    );
    expect(legacy.agreed).toBe(20_000);
    expect(legacy.balance).toBe(12_000);
    expect(legacy.status).toBe("partial");
  });

  it("prefers the enrolment snapshot over a ledger entry that disagrees", () => {
    // This is the whole point: raising the course fee must not reprice anyone.
    const summary = summariseFees(emcad, [paid(0, { courseFee: 40_000 })]);
    expect(summary.agreed).toBe(35_000);
  });

  it("lets a manually set due date override the agreed one, and clears it once settled", () => {
    const extended = summariseFees(emcad, [paid(10_000, { dueDate: "2026-11-15" })]);
    expect(extended.nextDueOn).toBe("2026-11-15");
    expect(summariseFees(emcad, [paid(35_000, { dueDate: "2026-11-15" })]).nextDueOn).toBeNull();
  });

  it("marks an outstanding balance overdue only after its date has passed", () => {
    const partial = summariseFees(emcad, [paid(25_000)]);
    expect(isOverdue(partial, "2026-09-30")).toBe(false);
    expect(isOverdue(partial, "2026-10-02")).toBe(true);
    expect(isOverdue(summariseFees(emcad, [paid(35_000)]), "2027-01-01")).toBe(false);
  });
});

describe("changing an existing student's agreement", () => {
  const base = {
    enrollmentId: "4",
    agreedFeeTotal: "35000",
    agreedAdmissionAmount: "25000",
    agreedBalanceDueOn: "2026-10-01",
    reason: "Owner approved a revised plan"
  };

  it("accepts a well-formed change with a reason", () => {
    const result = validateAgreementUpdate(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.agreedFeeTotal).toBe(35_000);
      expect(result.value.reason).toBe("Owner approved a revised plan");
    }
  });

  it("refuses a change with no reason", () => {
    // Moving what a student owes is never an unexplained edit.
    expect(validateAgreementUpdate({ ...base, reason: "" }).ok).toBe(false);
    expect(validateAgreementUpdate({ ...base, reason: "ok" }).ok).toBe(false);
  });

  it("refuses an admission amount larger than the total, or without one", () => {
    expect(validateAgreementUpdate({ ...base, agreedAdmissionAmount: "40000" }).ok).toBe(false);
    expect(
      validateAgreementUpdate({ ...base, agreedFeeTotal: "", agreedAdmissionAmount: "25000" }).ok
    ).toBe(false);
  });

  it("allows clearing the agreement back to 'not agreed yet'", () => {
    const cleared = validateAgreementUpdate({
      ...base,
      agreedFeeTotal: "",
      agreedAdmissionAmount: "",
      agreedBalanceDueOn: ""
    });
    expect(cleared.ok).toBe(true);
    if (cleared.ok) expect(cleared.value.agreedFeeTotal).toBeNull();
  });
});
