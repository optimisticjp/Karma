import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { decideOwnerBootstrap, type OwnerRow } from "@/lib/admin/bootstrap";
import { persistInvitedAdmin } from "@/lib/admin/invite-persistence";

/**
 * Owner is the highest-privilege identity in Karma, and the bootstrap script is
 * the only thing that can create one. These cover the decision it makes, the
 * compensation it performs when persistence fails, and — most importantly — the
 * thing it must never do again: adopt a pre-existing Supabase auth user as
 * Owner because the email happened to match.
 */

const owner = (over: Partial<OwnerRow> = {}): OwnerRow => ({
  id: 1,
  email: "owner@karma.test",
  status: "active",
  ...over
});

describe("owner bootstrap decision", () => {
  it("invites when no owner exists", () => {
    expect(decideOwnerBootstrap([], "owner@karma.test")).toEqual({ action: "invite" });
  });

  it("is idempotent when the intended owner already exists", () => {
    expect(decideOwnerBootstrap([owner()], "owner@karma.test")).toEqual({
      action: "already-owner",
      staffId: 1,
      status: "active"
    });
  });

  it("is idempotent for an owner who has not accepted yet", () => {
    // Re-running after sending the invitation must not send a second one or
    // create a second row.
    expect(decideOwnerBootstrap([owner({ status: "invited" })], "owner@karma.test")).toEqual({
      action: "already-owner",
      staffId: 1,
      status: "invited"
    });
  });

  it("matches the intended owner case-insensitively", () => {
    expect(
      decideOwnerBootstrap([owner({ email: "Owner@Karma.TEST" })], "owner@karma.test").action
    ).toBe("already-owner");
    expect(decideOwnerBootstrap([owner()], "  OWNER@KARMA.TEST  ").action).toBe(
      "already-owner"
    );
  });

  it("REFUSES when a different owner already exists", () => {
    expect(decideOwnerBootstrap([owner({ email: "someone@else.test" })], "owner@karma.test")).toEqual({
      action: "refuse",
      reason: "different-owner"
    });
  });

  it("refuses rather than adopting an owner row that has no email", () => {
    // Matching on a null would be matching on nothing.
    expect(decideOwnerBootstrap([owner({ email: null })], "owner@karma.test")).toEqual({
      action: "refuse",
      reason: "different-owner"
    });
  });

  it("never invites while any owner exists", () => {
    for (const rows of [
      [owner()],
      [owner({ email: "other@karma.test" })],
      [owner({ status: "invited", email: "other@karma.test" })]
    ]) {
      expect(decideOwnerBootstrap(rows, "owner@karma.test").action).not.toBe("invite");
    }
  });
});

/**
 * The bootstrap reuses the same compensation helper as the admin invite path,
 * so an owner whose staff row fails to commit does not leave a Supabase user
 * behind with no Karma identity.
 */
describe("owner bootstrap persistence and cleanup", () => {
  const deps = (over = {}) => ({
    persist: vi.fn(async () => undefined),
    hasStaffForAuthUser: vi.fn(async () => false),
    deleteAuthUser: vi.fn(async () => true),
    ...over
  });

  it("commits and keeps the new auth user on success", async () => {
    const d = deps();
    expect(await persistInvitedAdmin("new-owner-auth-id", d)).toEqual({ status: "persisted" });
    expect(d.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("removes the just-created auth user when the owner row fails to commit", async () => {
    const d = deps({ persist: vi.fn(async () => { throw new Error("db down"); }) });
    const outcome = await persistInvitedAdmin("new-owner-auth-id", d);

    expect(outcome.status).toBe("rolled-back");
    expect(d.deleteAuthUser).toHaveBeenCalledExactlyOnceWith("new-owner-auth-id");
  });

  it("reports recovery-required when cleanup fails, never success", async () => {
    const d = deps({
      persist: vi.fn(async () => { throw new Error("db down"); }),
      deleteAuthUser: vi.fn(async () => false)
    });
    expect((await persistInvitedAdmin("new-owner-auth-id", d)).status).toBe(
      "orphan-requires-recovery"
    );
  });

  it("never deletes an auth user a staff row already points at", async () => {
    const d = deps({
      persist: vi.fn(async () => { throw new Error("audit insert failed"); }),
      hasStaffForAuthUser: vi.fn(async () => true)
    });
    const outcome = await persistInvitedAdmin("linked-id", d);

    expect(outcome.status).toBe("orphan-requires-recovery");
    expect(d.deleteAuthUser).not.toHaveBeenCalled();
  });
});

/**
 * Structural guards for the script itself. The removed fallback is the whole
 * point of this pass: if it ever comes back, an attacker-created or stale
 * Supabase account with the owner's email becomes Owner.
 */
describe("the bootstrap script never adopts an existing auth identity", () => {
  const script = readFileSync("scripts/bootstrap-owner.ts", "utf8");

  it("does not search the Supabase user list", () => {
    expect(script).not.toContain("listUsers");
    expect(script).not.toContain("findAuthUserId");
  });

  it("links ONLY the id returned by this invitation", () => {
    expect(script).toContain("const newAuthUserId = data.user.id;");
    expect(script).toContain("authUserId: newAuthUserId");
  });

  it("fails closed when the invitation cannot be created", () => {
    const guard = script.indexOf("if (error || !data?.user?.id)");
    const link = script.indexOf("const newAuthUserId");
    expect(guard).toBeGreaterThan(-1);
    // The refusal comes before anything is linked.
    expect(guard).toBeLessThan(link);
    // Wording, ignoring how the source happens to wrap it.
    const flat = script.replace(/\s+/g, " ");
    expect(flat).toContain("NOT automatically grant Owner access to an existing Auth identity");
  });

  it("compensates through the shared helper rather than its own logic", () => {
    expect(script).toContain("persistInvitedAdmin");
    expect(script).toContain("hasStaffForAuthUser");
  });

  it("prints recovery instructions without secrets", () => {
    const recovery = script.slice(script.indexOf("MANUAL RECOVERY REQUIRED"));
    for (const forbidden of [
      "secretKey",
      "databaseUrl",
      "SUPABASE_SECRET_KEY",
      "action_link",
      "access_token",
      "ownerEmail}"
    ]) {
      expect(recovery, forbidden).not.toContain(forbidden);
    }
    // The masked address is deliberately shown: the operator typed it.
    expect(recovery).toContain("${masked}");
  });

  it("keeps the staff row and its audit entry in one transaction", () => {
    const persist = script.slice(script.indexOf("persist: async ()"));
    expect(persist).toContain("db.transaction");
    const tx = persist.slice(persist.indexOf("db.transaction"));
    expect(tx).toContain("insert(schema.staff)");
    expect(tx).toContain("insert(schema.auditLogs)");
    expect(tx).toContain("admin.owner.bootstrapped");
  });
});
