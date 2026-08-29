import { describe, expect, it } from "vitest";
import {
  evaluateAccess,
  evaluateOnboardingAccess,
  type AccessSubject,
  type StaffStatus
} from "@/lib/auth/access";
import { redirectTargetFor, safeNextPath } from "@/lib/auth/redirect";

/**
 * The seven-step access decision, one test per interesting state. These are the
 * states that are painful to reproduce against a live Supabase project, which
 * is exactly why the decision is a pure function.
 */

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
      evaluateAccess({ ...base, staff: staff({ active: false, status: "deactivated" }) })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("lifecycle 'deactivated' is refused even if active somehow says true", () => {
    // Belt and braces: the two fields disagreeing is a corrupt state, and the
    // safe reading of a corrupt state is "no access".
    expect(
      evaluateAccess({ ...base, staff: staff({ active: true, status: "deactivated" }) })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("invited + AAL1 → onboarding, not the console and not MFA", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ status: "invited" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "invited" });
  });

  it("invited + AAL2 → STILL onboarding, never console data", () => {
    // The seat is reserved and the person may even have enrolled a factor, but
    // until acceptance commits they are not an active account.
    expect(evaluateAccess({ ...base, staff: staff({ status: "invited" }) })).toEqual({
      ok: false,
      reason: "invited"
    });
  });

  it("invited + AAL2 + a permission they would otherwise hold → still refused", () => {
    expect(
      evaluateAccess(
        { ...base, staff: staff({ status: "invited" }) },
        { permission: "dashboard.view" }
      )
    ).toEqual({ ok: false, reason: "invited" });
  });

  it("invited owner is no exception", () => {
    expect(
      evaluateAccess({ ...base, staff: staff({ role: "owner", status: "invited" }) })
    ).toEqual({ ok: false, reason: "invited" });
  });

  it("active + AAL1 with no enrolled factor → MFA setup", () => {
    expect(evaluateAccess({ ...base, currentLevel: "aal1", nextLevel: "aal1" })).toEqual({
      ok: false,
      reason: "mfa-setup"
    });
  });

  it("active + AAL1 with a factor already enrolled → MFA challenge", () => {
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

  it("active + AAL2 → normal permission evaluation", () => {
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

  it("active AAL2 owner → allowed", () => {
    expect(
      evaluateAccess({ ...base, staff: staff({ id: 9, role: "owner", permissions: [] }) })
    ).toEqual({ ok: true, role: "owner", staffId: 9 });
  });

  it("rejects deactivation BEFORE lifecycle and MFA, so a dead account never onboards", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ active: false, status: "invited" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("requires MFA of the owner too", () => {
    expect(
      evaluateAccess({
        ...base,
        staff: staff({ id: 9, role: "owner", permissions: [] }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: false, reason: "mfa-setup" });
  });
});

/**
 * Onboarding is the one path below AAL2. It has to be narrow, because the whole
 * point of mandatory MFA is that nothing else gets past it.
 */
describe("onboarding access (/admin/welcome)", () => {
  it("lets a linked, active, invited console user in — at AAL1", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ status: "invited" }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: true, role: "admin", staffId: 1 });
  });

  it("lets an invited OWNER onboard too (the bootstrap path)", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ id: 7, role: "owner", status: "invited", permissions: [] }),
        currentLevel: "aal1",
        nextLevel: "aal1"
      })
    ).toEqual({ ok: true, role: "owner", staffId: 7 });
  });

  it("refuses an unlinked Supabase user — a session alone is not an invitation", () => {
    expect(evaluateOnboardingAccess({ ...base, staff: null })).toEqual({
      ok: false,
      reason: "no-staff"
    });
  });

  it("refuses a deactivated account", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ active: false, status: "deactivated" })
      })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("refuses a deactivated account that is still marked invited", () => {
    expect(
      evaluateOnboardingAccess({ ...base, staff: staff({ active: false, status: "invited" }) })
    ).toEqual({ ok: false, reason: "inactive" });
  });

  it("refuses a trainer", () => {
    expect(
      evaluateOnboardingAccess({
        ...base,
        staff: staff({ role: "trainer", status: "invited", permissions: [] })
      })
    ).toEqual({ ok: false, reason: "role" });
  });

  it("refuses with no session at all", () => {
    expect(
      evaluateOnboardingAccess({
        userId: null,
        staff: null,
        currentLevel: null,
        nextLevel: null
      })
    ).toEqual({ ok: false, reason: "signin" });
  });

  it("will not let an ALREADY ACTIVE account redo onboarding", () => {
    // Otherwise any session reaching /admin/welcome could set a new password.
    expect(evaluateOnboardingAccess(base)).toEqual({ ok: false, alreadyAccepted: true });
  });

  it("will not let an already active account redo onboarding at AAL1 either", () => {
    expect(
      evaluateOnboardingAccess({ ...base, currentLevel: "aal1", nextLevel: "aal2" })
    ).toEqual({ ok: false, alreadyAccepted: true });
  });
});

describe("redirect targets", () => {
  it("sends each failure somewhere it can be resolved", () => {
    expect(redirectTargetFor({ ok: false, reason: "signin" })).toBe("/admin/login");
    expect(redirectTargetFor({ ok: false, reason: "invited" })).toBe("/admin/welcome");
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

  it("does not carry a return path into onboarding", () => {
    // Onboarding always ends at MFA setup, so a stashed destination would only
    // survive to be replayed later.
    expect(redirectTargetFor({ ok: false, reason: "invited" }, "/admin/team")).toBe(
      "/admin/welcome"
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

  it("never bounces back into an auth or onboarding screen, which would loop", () => {
    expect(safeNextPath("/admin/login")).toBe("/admin");
    expect(safeNextPath("/admin/mfa/setup")).toBe("/admin");
    expect(safeNextPath("/admin/auth/callback")).toBe("/admin");
    expect(safeNextPath("/admin/welcome")).toBe("/admin");
  });
});
