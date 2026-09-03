import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateAdmissionFeeSetup, validatePaymentEntry } from "@/lib/admin/fees";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("front desk fee input", () => {
  it("records a daily payment without accepting the agreed course fee from the receipt form", () => {
    const parsed = validatePaymentEntry({ enrollmentId: "7", received: "5000", method: "cash", discount: "1000" });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toMatchObject({ enrollmentId: 7, received: 5000, discount: 1000, method: "cash" });
    expect(validatePaymentEntry({ enrollmentId: "7", received: "5000", method: "" }).ok).toBe(false);
  });

  it("accepts a full per-student fee setup at direct admission", () => {
    const parsed = validateAdmissionFeeSetup({
      agreedFeeTotal: "30000",
      agreedAdmissionAmount: "10000",
      agreedBalanceDueOn: "2026-10-15",
      feeDiscount: "2000",
      feeReceived: "10000",
      feeMethod: "upi",
      feeReceiptNo: "PAPER-18",
      feeNote: "owner-approved concession"
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.received).toBe(10000);
  });
});

describe("admission recovery", () => {
  it("revalidates restored course choices and surfaces typed API errors", () => {
    const source = read("src/components/forms/AdmissionForm.tsx");
    expect(source).toContain("resetToCourseStep");
    expect(source).toContain("restoredCourse.scheduleOptions.some");
    expect(source).toContain("Object.assign({}, validate(0), validate(1), validate(2), validate(3))");
    expect(source).toContain("out.error === \"validation\"");
    expect(source).toContain("serverError.requestId");
  });
});

describe("non-technical staff navigation", () => {
  it("puts Fees in the four daily mobile destinations before Batches", () => {
    const layout = read("src/app/admin/(console)/layout.tsx");
    expect(layout.indexOf('href: "/admin/fees"')).toBeLessThan(layout.indexOf('href: "/admin/batches"'));
  });

  it("keeps the Today shortcut strip to the four front-desk jobs", () => {
    const page = read("src/app/admin/(console)/page.tsx");
    const start = page.indexOf("const quickActions = [");
    const end = page.indexOf("].filter", start);
    const quick = page.slice(start, end);
    expect(quick).toContain("applications.manage");
    expect(quick).toContain("students.manage");
    expect(quick).toContain("fees.manage");
    expect(quick).toContain("attendance.manage");
    expect(quick).not.toContain("courses.manage");
    expect(quick).not.toContain("design.manage");
  });

  it("requires fees.manage before a direct admission can write money", () => {
    const actions = read("src/app/admin/(console)/students/actions.ts");
    expect(actions).toContain('authorizeAction({ permission: "fees.manage" })');
    expect(actions).toContain("FEE_AUDIT_ACTIONS.recordCreated");
  });

  it("uses the canonical fee summariser for student directory and detail balances", () => {
    const page = read("src/app/admin/(console)/students/page.tsx");
    expect(page).toContain("summariseFees(enrollment.agreement, enrollment.entries)");
    expect(page).toContain("const selectedFeeSummaries = enrollments.map");
    expect(page).not.toContain("agreed: sum(schema.enrollments.agreedFeeTotal)");
  });

  it("keeps the daily payment form free of an editable course-fee input", () => {
    const form = read("src/app/admin/(console)/fees/FeeForm.tsx");
    const start = form.indexOf("export function FeeEntryForm");
    const end = form.indexOf("function Field", start);
    const payment = form.slice(start, end);
    expect(payment).not.toContain('name="courseFee"');
    expect(payment).toContain('name="received"');
    expect(payment).toContain('name="method"');
  });
});
