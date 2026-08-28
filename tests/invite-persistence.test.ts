import { describe, expect, it, vi } from "vitest";
import {
  persistInvitedAdmin,
  type InvitePersistenceDeps
} from "@/lib/admin/invite-persistence";
import { reactivatedStatus } from "@/lib/admin/lifecycle";

/**
 * An invitation spans two systems and only one of them has our transaction.
 * Supabase creates the auth user first, then Karma commits the staff row. These
 * cover what happens when the second half fails — including the seat race the
 * database trigger is there to lose safely.
 */

const deps = (over: Partial<InvitePersistenceDeps> = {}): InvitePersistenceDeps => ({
  persist: vi.fn(async () => undefined),
  hasStaffForAuthUser: vi.fn(async () => false),
  deleteAuthUser: vi.fn(async () => true),
  ...over
});

const SEAT_RACE = new Error(
  'karma_admin_seat_limit: all 5 admin seats are in use'
);

describe("invitation persistence", () => {
  it("commits and leaves the auth user alone on the happy path", async () => {
    const d = deps();
    const outcome = await persistInvitedAdmin("new-user-id", d);

    expect(outcome).toEqual({ status: "persisted" });
    expect(d.persist).toHaveBeenCalledOnce();
    // Nothing to compensate, so nothing is deleted and nothing is checked.
    expect(d.deleteAuthUser).not.toHaveBeenCalled();
    expect(d.hasStaffForAuthUser).not.toHaveBeenCalled();
  });

  it("deletes the just-created auth user when persistence fails", async () => {
    const d = deps({ persist: vi.fn(async () => { throw SEAT_RACE; }) });
    const outcome = await persistInvitedAdmin("new-user-id", d);

    expect(outcome.status).toBe("rolled-back");
    expect(d.deleteAuthUser).toHaveBeenCalledExactlyOnceWith("new-user-id");
  });

  it("loses the seat race without leaving an orphan", async () => {
    // Two invitations, one seat. The database admits one and rejects the other;
    // the loser must not leave a Supabase user behind.
    const winner = deps();
    const loser = deps({ persist: vi.fn(async () => { throw SEAT_RACE; }) });

    const [a, b] = await Promise.all([
      persistInvitedAdmin("winner-id", winner),
      persistInvitedAdmin("loser-id", loser)
    ]);

    expect(a.status).toBe("persisted");
    expect(b.status).toBe("rolled-back");
    expect(winner.deleteAuthUser).not.toHaveBeenCalled();
    expect(loser.deleteAuthUser).toHaveBeenCalledExactlyOnceWith("loser-id");
  });

  it("surfaces the original cause so the owner sees the right message", async () => {
    const d = deps({ persist: vi.fn(async () => { throw SEAT_RACE; }) });
    const outcome = await persistInvitedAdmin("new-user-id", d);

    expect(outcome.status).toBe("rolled-back");
    if (outcome.status === "persisted") return;
    expect(String((outcome.cause as Error).message)).toContain("karma_admin_seat_limit");
  });

  it("NEVER deletes an auth user that a staff row already points at", async () => {
    // If a staff row committed, the identity is real. Deleting it would orphan
    // the staff row instead — strictly worse than the problem being solved.
    const d = deps({
      persist: vi.fn(async () => { throw new Error("audit insert failed"); }),
      hasStaffForAuthUser: vi.fn(async () => true)
    });
    const outcome = await persistInvitedAdmin("linked-user-id", d);

    expect(outcome.status).toBe("orphan-requires-recovery");
    expect(d.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("does not delete when it cannot prove the user is unlinked", async () => {
    const d = deps({
      persist: vi.fn(async () => { throw new Error("db down"); }),
      hasStaffForAuthUser: vi.fn(async () => { throw new Error("db down"); })
    });
    const outcome = await persistInvitedAdmin("unknown-user-id", d);

    expect(outcome.status).toBe("orphan-requires-recovery");
    expect(d.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("reports recovery-required when cleanup itself fails", async () => {
    const d = deps({
      persist: vi.fn(async () => { throw SEAT_RACE; }),
      deleteAuthUser: vi.fn(async () => false)
    });
    const outcome = await persistInvitedAdmin("new-user-id", d);

    // A permanent orphan is never quietly reported as success.
    expect(outcome.status).toBe("orphan-requires-recovery");
  });

  it("reports recovery-required when cleanup throws", async () => {
    const d = deps({
      persist: vi.fn(async () => { throw SEAT_RACE; }),
      deleteAuthUser: vi.fn(async () => { throw new Error("supabase unreachable"); })
    });
    expect((await persistInvitedAdmin("new-user-id", d)).status).toBe(
      "orphan-requires-recovery"
    );
  });

  it("never reports a failure as success", async () => {
    for (const persist of [
      vi.fn(async () => { throw SEAT_RACE; }),
      vi.fn(async () => { throw new Error("connection reset"); })
    ]) {
      for (const deleteAuthUser of [vi.fn(async () => true), vi.fn(async () => false)]) {
        const outcome = await persistInvitedAdmin("id", deps({ persist, deleteAuthUser }));
        expect(outcome.status).not.toBe("persisted");
      }
    }
  });
});

/**
 * Deactivation overwrites `status`, so reactivation reads `accepted_at` — the
 * one field that still records whether the person ever accepted.
 */
describe("reactivation lifecycle", () => {
  it("returns a never-accepted admin to `invited`", () => {
    expect(reactivatedStatus(null)).toBe("invited");
    expect(reactivatedStatus(undefined)).toBe("invited");
  });

  it("returns a previously accepted admin to `active`", () => {
    expect(reactivatedStatus(new Date("2026-03-01T10:00:00Z"))).toBe("active");
  });

  it("survives the deactivate → reactivate round trip in both directions", () => {
    // never accepted: invited → deactivated → invited (still owes onboarding)
    expect(reactivatedStatus(null)).toBe("invited");
    // accepted: active → deactivated → active
    expect(reactivatedStatus(new Date())).toBe("active");
  });
});
