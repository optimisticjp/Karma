import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AUDIT_ACTIONS, auditValues } from "@/lib/admin/audit";

describe("audit entries", () => {
  it("names every team security event the platform must record", () => {
    expect(Object.values(AUDIT_ACTIONS)).toEqual([
      "admin.owner.bootstrapped",
      "admin.invited",
      "admin.accepted",
      "admin.permissions.changed",
      "admin.deactivated",
      "admin.reactivated"
    ]);
  });

  it("records actor, action, entity, old and new values", () => {
    const row = auditValues({
      actor: "1",
      action: AUDIT_ACTIONS.adminPermissionsChanged,
      entity: "staff",
      entityId: 7,
      oldValue: { permissions: ["students.view"] },
      newValue: { permissions: ["students.view", "students.manage"] },
      reason: "owner edited admin permissions"
    });

    expect(row).toEqual({
      actor: "1",
      action: "admin.permissions.changed",
      entity: "staff",
      entityId: "7",
      oldValue: { permissions: ["students.view"] },
      newValue: { permissions: ["students.view", "students.manage"] },
      reason: "owner edited admin permissions"
    });
  });

  it("normalises a missing entity id and reason to null rather than 'undefined'", () => {
    const row = auditValues({
      actor: "system",
      action: AUDIT_ACTIONS.ownerBootstrapped,
      entity: "staff"
    });
    expect(row.entityId).toBeNull();
    expect(row.reason).toBeNull();
    expect(row.oldValue).toBeNull();
  });

  it("truncates to the column widths instead of failing the mutation", () => {
    const row = auditValues({
      actor: "a".repeat(500),
      action: AUDIT_ACTIONS.adminInvited,
      entity: "e".repeat(500),
      entityId: "i".repeat(500),
      reason: "r".repeat(500)
    });
    expect(row.actor.length).toBe(120);
    expect(row.entity.length).toBe(80);
    expect(row.entityId?.length).toBe(40);
    expect(row.reason?.length).toBe(300);
  });
});

/**
 * A source-level guard for CLAUDE.md #7. These three mutations are the whole
 * of team administration; if one ever ships without its owner check or without
 * writing an audit row, that is a security regression, not a style slip.
 */
describe("team mutations are guarded and audited", () => {
  const source = readFileSync("src/app/admin/(console)/team/actions.ts", "utf8");
  const bodies = source
    .split(/export async function /)
    .slice(1)
    .map((chunk) => ({ name: chunk.slice(0, chunk.indexOf("(")), body: chunk }));

  it("covers exactly the three team mutations", () => {
    expect(bodies.map((b) => b.name).sort()).toEqual([
      "inviteAdminAction",
      "setActiveAction",
      "updatePermissionsAction"
    ]);
  });

  for (const name of [
    "inviteAdminAction",
    "updatePermissionsAction",
    "setActiveAction"
  ]) {
    it(`${name} starts with an owner-only authorization check`, () => {
      const body = bodies.find((b) => b.name === name)?.body ?? "";
      expect(body).toContain("authorizeAction({ ownerOnly: true })");
      // The check must come before any database work in the function.
      expect(body.indexOf("authorizeAction")).toBeLessThan(
        body.indexOf("getDb()") === -1 ? Infinity : body.indexOf("getDb()")
      );
    });

    it(`${name} writes an audit row`, () => {
      const body = bodies.find((b) => b.name === name)?.body ?? "";
      expect(body).toContain("schema.auditLogs");
      expect(body).toContain("AUDIT_ACTIONS.");
    });
  }

  it("never puts a secret, token or invitation link into an audit value", () => {
    for (const forbidden of [
      "SUPABASE_SECRET_KEY",
      "access_token",
      "refresh_token",
      "password",
      "totp",
      "action_link"
    ]) {
      expect(source.toLowerCase()).not.toContain(`${forbidden.toLowerCase()}:`);
    }
  });
});
