import { describe, expect, it } from "vitest";
import { validateInvite, type InviteContext } from "@/lib/admin/invite";
import { PERMISSION_TEMPLATES } from "@/lib/auth/permissions";
import type { SeatRow } from "@/lib/auth/seats";

const owner: SeatRow = { role: "owner", active: true };
const admin = (active = true): SeatRow => ({ role: "admin", active });

const context = (over: Partial<InviteContext> = {}): InviteContext => ({
  existingConsoleEmails: ["owner@karma.test"],
  seats: [owner],
  ...over
});

const valid = {
  name: "Priya Patel",
  email: "priya@karma.test",
  template: "admissions",
  locale: "gu",
  permissions: []
};

describe("admin invitation validation", () => {
  it("accepts a well-formed invitation and applies the template", () => {
    const result = validateInvite(valid, context());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.email).toBe("priya@karma.test");
    expect(result.value.locale).toBe("gu");
    expect(result.value.permissions).toEqual([...PERMISSION_TEMPLATES.admissions]);
  });

  it("normalises the email and trims the name", () => {
    const result = validateInvite(
      { ...valid, name: "  Priya Patel  ", email: "  Priya@Karma.TEST " },
      context()
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.name).toBe("Priya Patel");
    expect(result.value.email).toBe("priya@karma.test");
  });

  it("rejects an invalid email", () => {
    for (const email of ["", "not-an-email", "a@b", "@karma.test", "priya@"]) {
      expect(validateInvite({ ...valid, email }, context())).toEqual({
        ok: false,
        reason: "invalidEmail"
      });
    }
  });

  it("rejects an unusable name", () => {
    expect(validateInvite({ ...valid, name: "P" }, context())).toEqual({
      ok: false,
      reason: "invalidName"
    });
    expect(validateInvite({ ...valid, name: "x".repeat(121) }, context())).toEqual({
      ok: false,
      reason: "invalidName"
    });
  });

  it("rejects an unknown permission key outright", () => {
    expect(
      validateInvite(
        { ...valid, permissions: ["students.view", "team.manage"] },
        context()
      )
    ).toEqual({ ok: false, reason: "invalidPermission" });
  });

  it("rejects an unknown template", () => {
    expect(validateInvite({ ...valid, template: "superuser" }, context())).toEqual({
      ok: false,
      reason: "invalidPermission"
    });
  });

  it("rejects a duplicate console email regardless of case", () => {
    expect(
      validateInvite(
        valid,
        context({ existingConsoleEmails: ["owner@karma.test", "PRIYA@karma.test"] })
      )
    ).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects the sixth admin", () => {
    expect(
      validateInvite(
        valid,
        context({ seats: [owner, admin(), admin(), admin(), admin(), admin()] })
      )
    ).toEqual({ ok: false, reason: "seatsFull" });
  });

  it("accepts again once an admin is deactivated", () => {
    const result = validateInvite(
      valid,
      context({ seats: [owner, admin(), admin(), admin(), admin(), admin(false)] })
    );
    expect(result.ok).toBe(true);
  });

  it("counts a pending invitation against the limit", () => {
    // A pending invite is an active admin row; five of them fill the console.
    expect(
      validateInvite(
        valid,
        context({ seats: [owner, admin(), admin(), admin(), admin(), admin()] })
      ).ok
    ).toBe(false);
  });

  it("keeps an explicit selection instead of the template when one is given", () => {
    const result = validateInvite(
      { ...valid, permissions: ["dashboard.view", "design.view"] },
      context()
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.permissions).toEqual(["dashboard.view", "design.view"]);
  });

  it("falls back to English for an unknown locale rather than failing", () => {
    const result = validateInvite({ ...valid, locale: "fr" }, context());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.locale).toBe("en");
  });

  it("cannot be used to create an owner: it only ever produces an admin invite", () => {
    // There is no role input at all — role is hard-coded to 'admin' by the
    // action, and the database refuses a second active owner besides.
    const result = validateInvite({ ...valid, template: "custom" }, context());
    expect(result.ok).toBe(true);
    expect(Object.keys(result.ok ? result.value : {})).not.toContain("role");
  });
});
