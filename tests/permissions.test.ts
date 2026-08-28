import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATES,
  PERMISSION_TEMPLATE_KEYS,
  isPermission,
  isPermissionTemplate,
  parsePermissions,
  templatePermissions,
  type Permission
} from "@/lib/auth/permissions";
import { evaluateAccess, hasPermission, type AccessSubject } from "@/lib/auth/access";

const subject = (over: Partial<AccessSubject> = {}): AccessSubject => ({
  userId: "user-1",
  staff: { id: 1, role: "admin", active: true, permissions: [] },
  currentLevel: "aal2",
  nextLevel: "aal2",
  ...over
});

describe("permission keys", () => {
  it("rejects unknown keys instead of silently dropping them", () => {
    expect(isPermission("students.view")).toBe(true);
    expect(isPermission("students.delete")).toBe(false);
    expect(isPermission("team.manage")).toBe(false);
    expect(isPermission(42)).toBe(false);

    expect(parsePermissions(["students.view", "reports.view"])).toEqual([
      "students.view",
      "reports.view"
    ]);
    // One bad key rejects the WHOLE request: a typo must never quietly grant
    // less than the owner intended.
    expect(parsePermissions(["students.view", "students.delete"])).toBeNull();
    expect(parsePermissions("students.view")).toBeNull();
  });

  it("de-duplicates without reordering", () => {
    expect(parsePermissions(["reports.view", "students.view", "reports.view"])).toEqual([
      "reports.view",
      "students.view"
    ]);
  });

  it("has no permission that could unlock team administration", () => {
    // Team administration is a property of being the owner. If a key like
    // team.manage ever appears here, an admin could be granted it.
    for (const key of PERMISSIONS) {
      expect(key.startsWith("team.")).toBe(false);
    }
  });

  it("groups every permission exactly once", () => {
    const grouped = PERMISSION_GROUPS.flatMap((g) => g.permissions);
    expect([...grouped].sort()).toEqual([...PERMISSIONS].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});

describe("permission templates", () => {
  it("only ever contains known keys", () => {
    for (const key of PERMISSION_TEMPLATE_KEYS) {
      expect(parsePermissions(templatePermissions(key))).not.toBeNull();
    }
  });

  it("recognises its own template names and nothing else", () => {
    expect(isPermissionTemplate("academy")).toBe(true);
    expect(isPermissionTemplate("owner")).toBe(false);
    expect(isPermissionTemplate(null)).toBe(false);
  });

  it("starts custom empty, so 'custom' can never over-grant", () => {
    expect(PERMISSION_TEMPLATES.custom).toEqual([]);
  });

  it("gives each template a shape that matches its job", () => {
    expect(PERMISSION_TEMPLATES.admissions).toContain("applications.manage");
    expect(PERMISSION_TEMPLATES.academy).toContain("attendance.manage");
    expect(PERMISSION_TEMPLATES.designLab).toContain("design.manage");
    expect(PERMISSION_TEMPLATES.operations).toContain("fees.manage");
    expect(PERMISSION_TEMPLATES.content).toContain("content.manage");

    // A template must never hand out the whole console by accident.
    for (const key of PERMISSION_TEMPLATE_KEYS) {
      expect(templatePermissions(key).length).toBeLessThan(PERMISSIONS.length);
    }
  });
});

describe("hasPermission", () => {
  it("gives the owner every permission without a single grant row", () => {
    const owner = { role: "owner" as const, permissions: [] as Permission[] };
    for (const key of PERMISSIONS) {
      expect(hasPermission(owner, key)).toBe(true);
    }
  });

  it("gives an admin only what was granted", () => {
    const admin = { role: "admin" as const, permissions: ["students.view"] as Permission[] };
    expect(hasPermission(admin, "students.view")).toBe(true);
    expect(hasPermission(admin, "students.manage")).toBe(false);
    expect(hasPermission(admin, "audit.view")).toBe(false);
  });

  it("gives a trainer nothing, even with grants attached", () => {
    const trainer = {
      role: "trainer" as const,
      permissions: ["students.view", "audit.view"] as Permission[]
    };
    expect(hasPermission(trainer, "students.view")).toBe(false);
  });

  it("gives a missing staff record nothing", () => {
    expect(hasPermission(null, "dashboard.view")).toBe(false);
  });
});

describe("permission enforcement through the access guard", () => {
  it("lets an admin through only for granted permissions", () => {
    const s = subject({
      staff: { id: 2, role: "admin", active: true, permissions: ["applications.view"] }
    });
    expect(evaluateAccess(s, { permission: "applications.view" })).toEqual({
      ok: true,
      role: "admin",
      staffId: 2
    });
    expect(evaluateAccess(s, { permission: "applications.manage" })).toEqual({
      ok: false,
      reason: "permission"
    });
  });

  it("refuses an ordinary admin the Team screen whatever they hold", () => {
    const s = subject({
      staff: { id: 3, role: "admin", active: true, permissions: [...PERMISSIONS] }
    });
    expect(evaluateAccess(s, { ownerOnly: true })).toEqual({ ok: false, reason: "role" });
  });

  it("lets the owner into the Team screen", () => {
    const s = subject({ staff: { id: 1, role: "owner", active: true, permissions: [] } });
    expect(evaluateAccess(s, { ownerOnly: true })).toEqual({
      ok: true,
      role: "owner",
      staffId: 1
    });
  });

  it("refuses a deactivated admin even with an otherwise perfect session", () => {
    const s = subject({
      staff: { id: 4, role: "admin", active: false, permissions: ["dashboard.view"] }
    });
    expect(evaluateAccess(s, { permission: "dashboard.view" })).toEqual({
      ok: false,
      reason: "inactive"
    });
  });

  it("refuses a trainer console access", () => {
    const s = subject({ staff: { id: 5, role: "trainer", active: true, permissions: [] } });
    expect(evaluateAccess(s)).toEqual({ ok: false, reason: "role" });
  });
});
