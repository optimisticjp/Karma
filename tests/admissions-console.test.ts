import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  APPLICATION_STATUSES,
  validateApplicationNote,
  validateApplicationUpdate
} from "../src/lib/admin/admissions";

describe("admissions CRM validation", () => {
  it("pins the application lifecycle used by the database", () => {
    expect(APPLICATION_STATUSES).toEqual([
      "new",
      "contacted",
      "demo_scheduled",
      "visit_done",
      "accepted",
      "waitlisted",
      "documents_pending",
      "enrolled",
      "not_proceeding",
      "closed"
    ]);
  });

  it("accepts valid assignment and follow-up changes", () => {
    expect(
      validateApplicationUpdate({
        status: "contacted",
        assignedTo: "2",
        nextFollowUp: "2026-09-01",
        closureReason: ""
      })
    ).toEqual({
      ok: true,
      value: {
        status: "contacted",
        assignedTo: 2,
        nextFollowUp: "2026-09-01",
        closureReason: null
      }
    });
  });

  it("only keeps closure reasons for closed outcomes", () => {
    const closed = validateApplicationUpdate({
      status: "not_proceeding",
      assignedTo: "",
      nextFollowUp: "",
      closureReason: "Timing did not work"
    });
    expect(closed).toEqual({
      ok: true,
      value: {
        status: "not_proceeding",
        assignedTo: null,
        nextFollowUp: null,
        closureReason: "Timing did not work"
      }
    });

    const open = validateApplicationUpdate({
      status: "new",
      assignedTo: "",
      nextFollowUp: "",
      closureReason: "Should be cleared"
    });
    expect(open).toEqual({
      ok: true,
      value: { status: "new", assignedTo: null, nextFollowUp: null, closureReason: null }
    });
  });

  it("rejects malformed inputs and trims notes", () => {
    expect(
      validateApplicationUpdate({
        status: "invented",
        assignedTo: "x",
        nextFollowUp: "tomorrow",
        closureReason: ""
      })
    ).toEqual({ ok: false });
    expect(validateApplicationNote("  Called; demo booked.  ")).toBe("Called; demo booked.");
    expect(validateApplicationNote("   ")).toBeNull();
    expect(validateApplicationNote("x".repeat(2001))).toBeNull();
  });
});

describe("admissions CRM source guards", () => {
  const root = resolve(import.meta.dirname, "..");
  const actions = readFileSync(resolve(root, "src/app/admin/(console)/admissions/actions.ts"), "utf8");
  const page = readFileSync(resolve(root, "src/app/admin/(console)/admissions/page.tsx"), "utf8");
  const layout = readFileSync(resolve(root, "src/app/admin/(console)/layout.tsx"), "utf8");

  it("guards reads and writes with application permissions", () => {
    expect(page).toContain('hasPermission(session.staff, "applications.view")');
    expect(page).toContain('hasPermission(session.staff, "applications.manage")');
    expect(actions.match(/authorizeAction\(\{ permission: "applications\.manage" \}\)/g)?.length).toBe(2);
  });

  it("audits application updates and note creation transactionally", () => {
    expect(actions).toContain("ADMISSIONS_AUDIT_ACTIONS.applicationUpdated");
    expect(actions).toContain("ADMISSIONS_AUDIT_ACTIONS.noteAdded");
    expect(actions.match(/db\.transaction/g)?.length).toBe(2);
  });

  it("enables the admissions nav only for permitted staff", () => {
    expect(layout).toContain('href: canUseAdmissions ? "/admin/admissions" : null');
    expect(layout).toContain('hasPermission(session.staff, "applications.view")');
  });

  it("does not add student conversion to this slice", () => {
    expect(actions).not.toContain("schema.students");
    expect(actions).not.toContain("schema.enrollments");
  });
});
