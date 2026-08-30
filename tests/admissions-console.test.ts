import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  APPLICATION_STATUSES,
  MANUAL_ENQUIRY_SOURCES,
  validateApplicationNote,
  validateApplicationUpdate,
  validateManualEnquiry
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

  it("pins the front-desk enquiry sources", () => {
    expect(MANUAL_ENQUIRY_SOURCES).toEqual([
      "walk_in",
      "phone",
      "whatsapp",
      "referral",
      "instagram",
      "google",
      "other"
    ]);
  });

  it("accepts a valid manual walk-in enquiry", () => {
    expect(
      validateManualEnquiry({
        fullName: "  Priya Patel ",
        whatsapp: "+91 98765 43210",
        email: "",
        locale: "gu",
        courseSlug: "zardosi-machine-embroidery",
        preferredTiming: "evening",
        area: "Mota Varachha",
        goal: "Wants to learn for home business",
        heardFrom: "walk_in",
        ageBand: "26-40",
        guardianName: "",
        guardianPhone: "",
        assignedTo: "1",
        nextFollowUp: "2026-09-01"
      })
    ).toEqual({
      ok: true,
      value: {
        fullName: "Priya Patel",
        whatsapp: "9876543210",
        email: null,
        locale: "gu",
        courseSlug: "zardosi-machine-embroidery",
        preferredTiming: "evening",
        area: "Mota Varachha",
        goal: "Wants to learn for home business",
        heardFrom: "walk_in",
        ageBand: "26-40",
        fatherName: null,
        guardianName: null,
        guardianPhone: null,
        referenceName: null,
        referencePhone: null,
        assignedTo: 1,
        nextFollowUp: "2026-09-01"
      }
    });
  });

  it("rejects an under-18 manual enquiry without guardian details", () => {
    expect(
      validateManualEnquiry({
        fullName: "Student",
        whatsapp: "9876543210",
        heardFrom: "phone",
        ageBand: "under18"
      })
    ).toEqual({ ok: false });
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

  it("guards reads and all writes with application permissions", () => {
    expect(page).toContain('hasPermission(session.staff, "applications.view")');
    expect(page).toContain('hasPermission(session.staff, "applications.manage")');
    expect(actions.match(/authorizeAction\(\{ permission: "applications\.manage" \}\)/g)?.length).toBe(3);
  });

  it("audits manual creation, application updates and note creation transactionally", () => {
    expect(actions).toContain("ADMISSIONS_AUDIT_ACTIONS.applicationCreated");
    expect(actions).toContain("ADMISSIONS_AUDIT_ACTIONS.applicationUpdated");
    expect(actions).toContain("ADMISSIONS_AUDIT_ACTIONS.noteAdded");
    expect(actions.match(/db\.transaction/g)?.length).toBe(3);
  });

  it("enables the admissions nav only for permitted staff", () => {
    expect(layout).toContain('href: canUseAdmissions ? "/admin/admissions" : null');
    expect(layout).toContain('hasPermission(session.staff, "applications.view")');
  });

  it("keeps student conversion out of admissions actions", () => {
    expect(actions).not.toContain("schema.students");
    expect(actions).not.toContain("schema.enrollments");
  });
});
