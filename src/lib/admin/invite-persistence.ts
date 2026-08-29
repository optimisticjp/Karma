/**
 * Keeping Supabase Auth and the Karma database consistent when an invitation
 * is sent.
 *
 * The problem this exists to solve: an invitation touches two systems, and only
 * one of them has our transaction. Supabase creates the auth user first (it has
 * to — the staff row stores its id), then Karma commits the staff row,
 * permission grants and audit entry. Anything that fails in between leaves a
 * Supabase auth user with no Karma identity: an orphan that can sign in, hold
 * nothing, and confuse the next person who reads the user list.
 *
 * The five-seat trigger makes this concrete rather than theoretical. Four seats
 * are taken; two invitations are sent at the same moment; both pass the
 * friendly pre-check; both Supabase users get created; the database trigger
 * admits one staff row and rejects the other. Without compensation, the loser
 * is a permanent orphan.
 *
 * So: if persistence fails, the auth user created moments ago for THIS
 * invitation is deleted. That is safe precisely because it never became a Karma
 * identity — no staff row, no committed audit history, nothing referring to it.
 * `hasStaffForAuthUser` is checked first so a partially-committed row can never
 * be orphaned from its auth user by this cleanup.
 *
 * Ordinary admin deactivation must never delete an auth user. This is the one
 * exception, and it is narrow by construction.
 *
 * The dependencies are injected so every branch — including the ones that need
 * a Supabase failure — is unit-testable without a Supabase project.
 */

export type InvitePersistenceOutcome =
  /** Staff row, grants and audit committed. */
  | { status: "persisted" }
  /** Persistence failed; the new auth user was cleaned up. No orphan. */
  | { status: "rolled-back"; cause: unknown }
  /**
   * Persistence failed AND cleanup failed. An orphaned Supabase auth user
   * remains and a human has to remove it — see docs/admin-architecture.md.
   */
  | { status: "orphan-requires-recovery"; cause: unknown };

export type InvitePersistenceDeps = {
  /** Commits the staff row, its permission grants and the audit entry. */
  persist: () => Promise<void>;
  /** True when a staff row already references this auth user. */
  hasStaffForAuthUser: (authUserId: string) => Promise<boolean>;
  /** Best-effort privileged delete of the just-created auth user. */
  deleteAuthUser: (authUserId: string) => Promise<boolean>;
};

/**
 * Runs the Karma-side persistence for an invitation and compensates if it
 * fails. `authUserId` must be the user Supabase created for THIS request —
 * never a pre-existing account.
 */
export async function persistInvitedAdmin(
  authUserId: string,
  deps: InvitePersistenceDeps
): Promise<InvitePersistenceOutcome> {
  try {
    await deps.persist();
    return { status: "persisted" };
  } catch (cause) {
    // Never delete an auth user that a staff row points at. If persistence got
    // far enough to commit one, the identity is real and must be kept.
    let linked = true;
    try {
      linked = await deps.hasStaffForAuthUser(authUserId);
    } catch {
      // Cannot prove it is unlinked, so do not delete. Report for recovery.
      return { status: "orphan-requires-recovery", cause };
    }
    if (linked) return { status: "orphan-requires-recovery", cause };

    let deleted = false;
    try {
      deleted = await deps.deleteAuthUser(authUserId);
    } catch {
      deleted = false;
    }

    return deleted
      ? { status: "rolled-back", cause }
      : { status: "orphan-requires-recovery", cause };
  }
}
