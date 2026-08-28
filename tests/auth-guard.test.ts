import { describe, expect, it } from "vitest";
import { evaluateAccess, type AccessSubject } from "@/lib/auth/access";
import { redirectTargetFor, safeNextPath } from "@/lib/auth/redirect";

/**
 * The six-step access decision, one test per interesting state. These are the
 * states that are painful to reproduce against a live Supabase project, which
 * is exactly why the decision is a pure function.
 */

const base: AccessSubject = {
  userId: "user-1",
  staff: { id: 1, role: "admin", active: true, permissions: ["dashboard.view"] },
  currentLevel: "aal2",
  nextLevel: "aal2"
};

describe("access guard states", () => {
  it("no session → sign in", () => {
    expect(
      evaluateAccess({ userId: null, staff: null, currentLevel: null, nextLevel: null })
    ).toEqual({ ok: false, reason: "signin" });
  });

  it("valid Supabase user with no staff record → denied, never admitted", () => {
    expect(evaluateAccess({ ...base, staff: null })).toEqual({
      ok: false,
      reason: "no-staff"
    });
  });

  it("inactive staff → denied immediately, old session or not", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: { id: 1, role: "admin", active: false, permissions: ["dashboard.view"] }
      })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("AAL1 with no enrolled factor → MFA setup", () => {
    expect(evaluateAccess({ ...base, currentLevel: "aal1", nextLevel: "aal1" })).toEqual({
      ok: false,
      reason: "mfa-setup"
    });
  });

  it("AAL1 with a factor already enrolled → MFA challenge", () => {
    expect(evaluateAccess({ ...base, currentLevel: "aal1", nextLevel: "aal2" })).toEqual({
      ok: false,
      reason: "mfa-challenge"
    });
  });

  it("unknown assurance level is treated as unverified, not as a pass", () => {
    expect(evaluateAccess({ ...base, currentLevel: null, nextLevel: null })).toEqual({
      ok: false,
      reason: "mfa-setup"
    });
  });

  it("AAL2 active admin with the permission → allowed", () => {
    expect(evaluateAccess(base, { permission: "dashboard.view" })).toEqual({
      ok: true,
      role: "admin",
      staffId: 1
    });
  });

  it("AAL2 active owner → allowed", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: { id: 9, role: "owner", active: true, permissions: [] }
      })
    ).toEqual({ ok: true, role: "owner", staffId: 9 });
  });

  it("checks the staff record BEFORE MFA, so a dead account is never enrolled", () => {
    // A deactivated admin at AAL1 must be told they have no access, not walked
    // through setting up an authenticator they will never get to use.
    expect(
      evaluateAccess({
        ...base,
        staff: { id: 1, role: "admin", active: false, permissions: [] },
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("requires MFA of the owner too", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: { id: 9, role: "owner", active: true, permissions: [] },
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "mfa-setup" });
  });
});

describe("redirect targets", () => {
  it("sends each failure somewhere it can be resolved", () => {
    expect(redirectTargetFor({ ok: false, reason: "signin" })).toBe("/admin/login");
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

  it("round-trips a safe return path", () => {
    expect(redirectTargetFor({ ok: false, reason: "signin" }, "/admin/team")).toBe(
      "/admin/login?next=%2Fadmin%2Fteam"
    );
  });
});

describe("open redirect defence", () => {
  it("accepts internal console paths", () => {
    expect(safeNextPath("/admin/team")).toBe("/admin/team");
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/account/security?tab=mfa")).toBe(
      "/admin/account/security?tab=mfa"
    );
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

  it("never bounces back into an auth screen, which would loop", () => {
    expect(safeNextPath("/admin/login")).toBe("/admin");
    expect(safeNextPath("/admin/mfa/setup")).toBe("/admin");
    expect(safeNextPath("/admin/auth/callback")).toBe("/admin");
  });
});
