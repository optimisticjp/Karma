/**
 * The access decision, as a pure function.
 *
 * Supabase Auth proves IDENTITY. The Karma `staff` row decides AUTHORIZATION.
 * Six things must all hold before an admin request may touch application data,
 * and they are evaluated here in a fixed order so that every route, server
 * action and test agrees on the answer:
 *
 *   1. a verified Supabase user
 *   2. a linked staff record
 *   3. staff.active === true
 *   4. a console role (owner or admin; trainer has no console access yet)
 *   5. MFA — the session is at AAL2
 *   6. the permission the operation requires
 *
 * Keeping this pure is deliberate: the interesting states (inactive admin
 * holding an old session, AAL1 with a factor already enrolled, valid Supabase
 * user with no staff row) are exactly the ones that are painful to reproduce
 * against a live Supabase project, and they are all covered by unit tests.
 */
import type { Permission } from "./permissions";

export type ConsoleRole = "owner" | "admin";
export type StaffRole = ConsoleRole | "trainer";

/** What the guard knows about the caller. Everything is server-sourced. */
export type AccessSubject = {
  /** Null when there is no verified Supabase user at all. */
  userId: string | null;
  /** Null when no `staff` row is linked to that Supabase user. */
  staff: {
    id: number;
    role: StaffRole;
    active: boolean;
    /**
     * Explicit grants. Never consulted for an owner: `hasPermission` short
     * circuits, so an empty array on an owner still means "everything".
     */
    permissions: readonly Permission[];
  } | null;
  /** Supabase assurance level for the CURRENT session. */
  currentLevel: "aal1" | "aal2" | null;
  /**
   * The level the session COULD reach. `aal2` here with `currentLevel: aal1`
   * is Supabase's way of saying "this user already has a verified factor",
   * which is what separates "go enrol" from "go enter your code".
   */
  nextLevel: "aal1" | "aal2" | null;
};

export type AccessRequirement = {
  /** Owner-only screens (Team). Ignores permissions entirely. */
  ownerOnly?: boolean;
  /** Permission required for this operation, if any. */
  permission?: Permission;
};

export type AccessDecision =
  | { ok: true; role: ConsoleRole; staffId: number }
  | {
      ok: false;
      /**
       * `signin`  → no verified user; send to /admin/login
       * `mfa-setup`     → authenticated, no factor enrolled yet
       * `mfa-challenge` → authenticated, factor enrolled, code not entered
       * `no-staff`  → valid Supabase user with no linked staff record
       * `inactive`  → staff record switched off
       * `role`      → staff record exists but has no console access
       * `permission`→ console user without the required permission
       */
      reason:
        | "signin"
        | "mfa-setup"
        | "mfa-challenge"
        | "no-staff"
        | "inactive"
        | "role"
        | "permission";
    };

export type AccessFailureReason = Extract<AccessDecision, { ok: false }>["reason"];

export function isConsoleRole(role: StaffRole): role is ConsoleRole {
  return role === "owner" || role === "admin";
}

/**
 * True when this staff record holds the permission. The owner short circuits:
 * owner privileges are a property of the role, never a set of rows, so they
 * cannot be partially revoked by editing `staff_permissions`.
 */
export function hasPermission(
  staff: { role: StaffRole; permissions: readonly Permission[] } | null,
  permission: Permission
): boolean {
  if (!staff) return false;
  if (staff.role === "owner") return true;
  if (!isConsoleRole(staff.role)) return false;
  return staff.permissions.includes(permission);
}

export function evaluateAccess(
  subject: AccessSubject,
  requirement: AccessRequirement = {}
): AccessDecision {
  // 1. identity
  if (!subject.userId) return { ok: false, reason: "signin" };

  // 2 + 3 + 4. the staff record is authoritative, and it is checked BEFORE
  // MFA so that a deactivated account is never walked through an enrolment
  // flow it has no business completing.
  const staff = subject.staff;
  if (!staff) return { ok: false, reason: "no-staff" };
  if (!staff.active) return { ok: false, reason: "inactive" };
  if (!isConsoleRole(staff.role)) return { ok: false, reason: "role" };

  // 5. MFA is mandatory for every console session, owner included.
  if (subject.currentLevel !== "aal2") {
    return {
      ok: false,
      reason: subject.nextLevel === "aal2" ? "mfa-challenge" : "mfa-setup"
    };
  }

  // 6. the operation itself
  if (requirement.ownerOnly && staff.role !== "owner") {
    return { ok: false, reason: "role" };
  }
  if (requirement.permission && !hasPermission(staff, requirement.permission)) {
    return { ok: false, reason: "permission" };
  }

  return { ok: true, role: staff.role, staffId: staff.id };
}
