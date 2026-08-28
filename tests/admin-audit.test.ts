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

/**
 * Structural guards for the onboarding lifecycle. `acceptInvitation` and the
 * welcome action are database-bound, so these assert the properties that make
 * them safe rather than re-implementing a database in a unit test. Each one
 * encodes a rule that would be a security regression to lose quietly.
 */
describe("invitation acceptance is transactional and gates MFA", () => {
  const onboarding = readFileSync("src/lib/admin/onboarding.ts", "utf8");
  const action = readFileSync("src/app/admin/(auth)/welcome/actions.ts", "utf8");

  it("performs the status change and its audit row in ONE transaction", () => {
    expect(onboarding).toContain("db.transaction");
    const tx = onboarding.slice(onboarding.indexOf("db.transaction"));
    // Both writes live inside the transaction body.
    expect(tx).toContain("update(schema.staff)");
    expect(tx).toContain("insert(schema.auditLogs)");
    expect(tx).toContain("AUDIT_ACTIONS.adminAccepted");
  });

  it("only ever transitions a row that is still invited, active and console", () => {
    // The WHERE clause is the real guard: a deactivated account, a trainer row
    // or an already-accepted account must update nothing.
    expect(onboarding).toContain("eq(schema.staff.status, \"invited\")");
    expect(onboarding).toContain("eq(schema.staff.active, true)");
    expect(onboarding).toContain('inArray(schema.staff.role, ["owner", "admin"])');
  });

  it("checks the acceptance result BEFORE redirecting to MFA", () => {
    const guardIndex = action.indexOf('result === "failed"');
    const redirectIndex = action.lastIndexOf('redirect("/admin/mfa/setup")');
    expect(guardIndex).toBeGreaterThan(-1);
    expect(redirectIndex).toBeGreaterThan(-1);
    // A failed transition must stop the flow, not be walked past.
    expect(guardIndex).toBeLessThan(redirectIndex);
  });

  it("authorizes onboarding through the narrow guard, not 'any session'", () => {
    expect(action).toContain("resolveOnboarding()");
    const authIndex = action.indexOf("resolveOnboarding()");
    const updateIndex = action.indexOf("auth.updateUser");
    // Authorization happens before the password is touched.
    expect(authIndex).toBeLessThan(updateIndex);
  });

  it("never logs or audits the password", () => {
    expect(action).not.toMatch(/console\.(log|error|warn)\([^)]*password/i);
    expect(onboarding).not.toContain("password");
  });
});

/**
 * Deactivation must not claim a Supabase session revocation, because it does
 * not perform one: `auth.admin.signOut()` needs a live JWT, not a user id.
 */
describe("deactivation uses ban, never a user-id signOut", () => {
  const teamActions = readFileSync("src/app/admin/(console)/team/actions.ts", "utf8");
  const adminClient = readFileSync("src/lib/supabase/admin.ts", "utf8");

  it("never calls admin.signOut with anything", () => {
    expect(teamActions).not.toContain("admin.signOut(");
  });

  it("suspends through the documented ban_duration attribute", () => {
    expect(adminClient).toContain("ban_duration");
    expect(adminClient).toContain("876000h");
    expect(adminClient).toContain('"none"');
  });

  it("inspects the returned error rather than ignoring it", () => {
    const fn = adminClient.slice(adminClient.indexOf("export async function setSupabaseUserBanned"));
    expect(fn).toContain("const { error }");
    expect(fn).toContain("if (error)");
  });

  it("reactivation restores the lifecycle from accepted_at, not from status", () => {
    expect(teamActions).toContain("reactivatedStatus(target.acceptedAt)");
    expect(teamActions).toContain("acceptedAt: schema.staff.acceptedAt");
  });

  it("never deletes an auth user when deactivating", () => {
    const setActive = teamActions.slice(teamActions.indexOf("export async function setActiveAction"));
    expect(setActive).not.toContain("deleteSupabaseUser");
    expect(setActive).not.toContain("deleteUser");
  });
});

/**
 * The owner invariant now protects `status` as well as `role` and `active`,
 * because the access layer treats lifecycle as a security state. The SQL is
 * exercised against a real PostgreSQL during development; these assert the
 * shape of the rules so none of them can be dropped silently.
 */
describe("owner lifecycle is part of the database invariant", () => {
  const migration = readFileSync("drizzle/0002_admin_foundation.sql", "utf8");
  const ownerBlock = migration.slice(
    migration.indexOf("IF TG_OP = 'UPDATE' AND OLD.role = 'owner' THEN"),
    migration.indexOf("-- 1. Exactly one active owner")
  );

  it("fires on INSERT, UPDATE and DELETE", () => {
    expect(migration).toContain("BEFORE INSERT OR UPDATE OR DELETE ON \"staff\"");
  });

  it("still refuses to delete or demote the owner, or switch it off", () => {
    expect(migration).toContain("the owner account cannot be deleted");
    expect(ownerBlock).toContain("the owner role cannot be changed here");
    expect(ownerBlock).toContain("the owner account cannot be deactivated");
  });

  it("allows the onboarding transition invited -> active", () => {
    // If this list ever loses 'active', every owner invitation deadlocks.
    expect(ownerBlock).toContain("IF OLD.status = 'invited' THEN");
    expect(ownerBlock).toContain("NEW.status NOT IN ('invited', 'active')");
  });

  it("pins an accepted owner to active — no going back to invited or deactivated", () => {
    expect(ownerBlock).toContain("ELSIF OLD.status = 'active' THEN");
    expect(ownerBlock).toContain("NEW.status <> 'active'");
  });

  it("fails closed on a corrupt owner lifecycle rather than normalising it", () => {
    expect(ownerBlock).toContain("unexpected state");
    expect(ownerBlock).toContain("resolve it under supervision");
  });

  it("keeps the seat and single-owner counts under an advisory lock", () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtext('karma_owner_seat'))");
    expect(migration).toContain("pg_advisory_xact_lock(hashtext('karma_admin_seats'))");
  });
});

/**
 * Reactivation changes Karma first and Supabase second. If the Supabase step
 * cannot be confirmed, the owner must not be told "reactivated" — that admin
 * may still be unable to sign in.
 */
describe("reactivation reports the Supabase step truthfully", () => {
  const teamActions = readFileSync("src/app/admin/(console)/team/actions.ts", "utf8");
  const setActive = teamActions.slice(
    teamActions.indexOf("export async function setActiveAction")
  );

  it("has a warning state distinct from success", () => {
    expect(teamActions).toContain('"idle" | "error" | "success" | "warning"');
    expect(teamActions).toContain('"reactivatedAuthPending"');
    expect(teamActions).toContain('"deactivatedAuthPending"');
  });

  it("returns the warning only when the ban/unban was not applied", () => {
    expect(setActive).toContain('authConfirmed = banResult === "applied"');
    expect(setActive).toContain("if (!authConfirmed)");
    // lastIndexOf, because setActiveAction also returns ok(...) early when the
    // account is already in the requested state — that path never calls
    // Supabase, so it is not the return this ordering is about.
    const warnIndex = setActive.indexOf('warn(activate ? "reactivatedAuthPending"');
    const finalOkIndex = setActive.lastIndexOf('return ok(activate ? "reactivated"');
    expect(warnIndex).toBeGreaterThan(-1);
    // The warning is returned before the plain success line is reached.
    expect(warnIndex).toBeLessThan(finalOkIndex);
  });

  it("does NOT roll the Karma change back when Supabase is unavailable", () => {
    // The database write is committed before the Supabase call is even made.
    const txIndex = setActive.indexOf("await db.transaction");
    const banIndex = setActive.indexOf("setSupabaseUserBanned");
    expect(txIndex).toBeGreaterThan(-1);
    expect(txIndex).toBeLessThan(banIndex);
    expect(setActive).not.toContain("rollback");
  });

  it("never leaks a Supabase status code into the owner-facing message", () => {
    // banResult may appear in the server log line, but never inside the warn()
    // state helper that builds what the owner sees.
    expect(setActive).toContain("console.warn");
    // lastIndexOf: the FIRST `if (!authConfirmed)` is the server log line,
    // which may legitimately carry the status. The last one is the branch that
    // builds the owner-facing TeamState, and that must carry nothing.
    const stateWarn = setActive.slice(setActive.lastIndexOf("if (!authConfirmed) {"));
    expect(stateWarn).not.toContain("banResult");
    expect(stateWarn).toContain('return warn(activate ? "reactivatedAuthPending"');
  });
});
