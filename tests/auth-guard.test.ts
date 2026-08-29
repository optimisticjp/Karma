import { describe, expect, it } from "vitest";
import {
  evaluateAccess,
  evaluateOnboardingAccess,
  type AccessSubject,
  type StaffStatus
} from "@/lib/auth/access";
import { redirectTargetFor, safeNextPath } from "@/lib/auth/redirect";

const staff = (over: Partial<NonNullable<AccessSubject["staff"]>> = {}) => ({
  id: 1,
  role: "admin" as const,
  active: true,
  status: "active" as StaffStatus,
  permissions: ["dashboard.view" as const],
  ...over
});

const base: AccessSubject = {
  userId: "user-1",
  staff: staff(),
  currentLevel: "aal2",
  nextLevel: "aal2"
};

describe("console access states", () => {
  it("requires a verified Supabase session", () => {
    expect(
      evaluateAccess({ userId: null, staff: null, currentLevel: null, nextLevel: null })
    ).toEqual({ ok: false, reason: "signin" });
  });

  it("never admits an unlinked Supabase user", () => {
    expect(evaluateAccess({ ...base, staff: null })).toEqual({ ok: false, reason: "no-staff" });
  });

  it("refuses deactivated staff regardless of session assurance", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ active: false, status: "deactivated" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "inactive" });

    expect(
      evaluateAccess({ ...base, staff: staff({ active: true, status: "deactivated" }) })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("keeps invited accounts in onboarding", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ status: "invited" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "invited" });

    expect(
      evaluateAccess({ ...base, staff: staff({ role: "owner", status: "invited" }) })
    ).toEqual({ ok: false, reason: "invited" });
  });

  it("uses password-only sessions: AAL1 is enough once staff is active", () => {
    expect(
      evaluateAccess(
        { ...base, currentLevel: "aal1", nextLevel: "aal1" },
        { permission: "dashboard.view" }
      )
    ).toEqual({ ok: true, role: "admin", staffId: 1 });
  });

  it("does not change access when an MFA factor exists", () => {
    expect(
      evaluateAccess(
        { ...base, currentLevel: "aal1", nextLevel: "aal2" },
        { permission: "dashboard.view" }
      )
    ).toEqual({ ok: true, role: "admin", staffId: 1 });
  });

  it("does not require an assurance level to enforce permissions", () => {
    expect(
      evaluateAccess(
        { ...base, currentLevel: null, nextLevel: null },
        { permission: "audit.view" }
      )
    ).toEqual({ ok: false, reason: "permission" });
  });

  it("still enforces permissions for admins", () => {
    expect(evaluateAccess(base, { permission: "dashboard.view" })).toEqual({
      ok: true,
      role: "admin",
      staffId: 1
    });
    expect(evaluateAccess(base, { permission: "audit.view" })).toEqual({
      ok: false,
      reason: "permission"
    });
  });

  it("lets an active owner in with password-only authentication", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ id: 9, role: "owner", permissions: [] }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: true, role: "owner", staffId: 9 });
  });

  it("keeps owner-only pages owner-only", () => {
    expect(evaluateAccess(base, { ownerOnly: true })).toEqual({ ok: false, reason: "role" });
    expect(
      evaluateAccess(
        { ...base, staff: staff({ id: 9, role: "owner", permissions: [] }) },
        { ownerOnly: true }
      )
    ).toEqual({ ok: true, role: "owner", staffId: 9 });
  });
});

describe("onboarding access (/admin/welcome)", () => {
  it("lets a linked, active, invited console user choose a password", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ status: "invited" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: true, role: "admin", staffId: 1 });
  });

  it("lets the invited Owner bootstrap path onboard", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ id: 7, role: "owner", status: "invited", permissions: [] }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: true, role: "owner", staffId: 7 });
  });

  it("refuses unlinked, deactivated and trainer accounts", () => {
    expect(evaluateOnboardingAccess({ ...base, staff: null })).toEqual({
      ok: false,
      reason: "no-staff"
    });
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ active: false, status: "deactivated" })
      })
    ).toEqual({ ok: false, reason: "inactive" });
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ role: "trainer", status: "invited", permissions: [] })
      })
    ).toEqual({ ok: false, reason: "role" });
  });

  it("will not let an already-active account redo password setup", () => {
    expect(evaluateOnboardingAccess(base)).toEqual({ ok: false, alreadyAccepted: true });
    expect(
      evaluateOnboardingAccess({ ...base, currentLevel: "aal1", nextLevel: "aal1" })
    ).toEqual({ ok: false, alreadyAccepted: true });
  });
});

describe("redirect targets", () => {
  it("sends failures to safe internal destinations", () => {
    expect(redirectTargetFor({ ok: false, reason: "signin" })).toBe("/admin/login");
    expect(redirectTargetFor({ ok: false, reason: "invited" })).toBe("/admin/welcome");
    // Legacy MFA decisions remain mapped so old URLs/sessions fail safely.
    expect(redirectTargetFor({ ok: false, reason: "mfa-setup" })).toBe("/admin/mfa/setup");
    expect(redirectTargetFor({ ok: false, reason: "mfa-challenge" })).toBe(
      "/admin/mfa/challenge"
    );
    expect(redirectTargetFor({ ok: false, reason: "no-staff" })).toBe(
      "/admin/no-access?reason=no-staff"
    );
    expect(redirectTargetFor({ ok: false, reason: "inactive" })).toBe(
      "/admin/no-access?reason=inactive"
    );
    expect(redirectTargetFor({ ok: false, reason: "permission" })).toBe(
      "/admin/no-access?reason=permission"
    );
  });

  it("round-trips a safe return path for sign-in", () => {
    expect(redirectTargetFor({ ok: false, reason: "signin" }, "/admin/team")).toBe(
      "/admin/login?next=%2Fadmin%2Fteam"
    );
  });
});

describe("open redirect defence", () => {
  it("accepts internal console paths", () => {
    expect(safeNextPath("/admin/team")).toBe("/admin/team");
    expect(safeNextPath("/admin")).toBe("/admin");
  });

  it("refuses everything that could leave the site", () => {
    for (const hostile of [
      "https://evil.example/admin",
      "//evil.example",
      "/\\evil.example",
      "\\\\evil.example",
      "/admin\\..\\..",
      "javascript:alert(1)",
      "/admin@evil.example",
      "/admin/%2f%2fevil.example",
      "/en/courses",
      "/",
      "",
      null,
      undefined,
      42,
      "/admin" + "a".repeat(600)
    ]) {
      expect(safeNextPath(hostile)).toBe("/admin");
    }
  });

  it("refuses a header-splitting payload", () => {
    expect(safeNextPath("/admin/team\r\nSet-Cookie: x=1")).toBe("/admin");
  });

  it("never bounces back into an auth/onboarding route", () => {
    expect(safeNextPath("/admin/login")).toBe("/admin");
    expect(safeNextPath("/admin/mfa/setup")).toBe("/admin");
    expect(safeNextPath("/admin/auth/callback")).toBe("/admin");
    expect(safeNextPath("/admin/welcome")).toBe("/admin");
  });
});
