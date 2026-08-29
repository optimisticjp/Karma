/**
 * The access decision, as a pure function.
 *
 * Supabase Auth proves IDENTITY. The Karma `staff` row decides AUTHORIZATION.
 * Six things must all hold before an admin request may touch console data,
 * and they are evaluated here in a fixed order so that every route, server
 * action and test agrees on the answer:
 *
 *   1. a verified Supabase user
 *   2. a linked staff record
 *   3. staff.active === true
 *   4. a console role (owner or admin; trainer has no console access yet)
 *   5. lifecycle status === "active"  (an `invited` account is still onboarding)
 *   6. the permission the operation requires
 *
 * Karma Console uses password-only sign-in. Supabase assurance-level fields are
 * still carried on the subject for compatibility with existing sessions and
 * legacy MFA routes, but they do not gate console access.
 */
import type { Permission } from "./permissions";

export type ConsoleRole = "owner" | "admin";
export type StaffRole = ConsoleRole | "trainer";

/**
 * Console account lifecycle. Independent of `active`, which is the master
 * switch, and of the role, which is the capability.
 *
 *   invited     — seat reserved, invitation not yet accepted. Onboarding only.
 *   active      — a working console account.
 *   deactivated — no access of any kind, onboarding included.
 */
export type StaffStatus = "invited" | "active" | "deactivated";

/** What the guard knows about the caller. Everything is server-sourced. */
export type AccessSubject = {
  /** Null when there is no verified Supabase user at all. */
  userId: string | null;
  /** Null when no `staff` row is linked to that Supabase user. */
  staff: {
    id: number;
    role: StaffRole;
    /** Master switch. False denies everything, immediately. */
    active: boolean;
    /** Lifecycle state. Only `active` may reach ordinary console data. */
    status: StaffStatus;
    /**
     * Explicit grants. Never consulted for an owner: `hasPermission` short
     * circuits, so an empty array on an owner still means "everything".
     */
    permissions: readonly Permission[];
  } | null;
  /** Supabase assurance level for the current session; not an access gate. */
  currentLevel: "aal1" | "aal2" | null;
  /** Supabase assurance level the session could reach; not an access gate. */
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
       * `signin`        → no verified user; send to /admin/login
       * `no-staff`      → valid Supabase user with no linked staff record
       * `inactive`      → staff record switched off, or lifecycle deactivated
       * `role`          → staff record exists but has no console access
       * `invited`       → invitation not yet accepted; send to /admin/welcome
       * `mfa-setup` / `mfa-challenge` are retained only for legacy redirect
       * compatibility; password-only access no longer emits them
       * `permission`    → console user without the required permission
       */
      reason:
        | "signin"
        | "no-staff"
        | "inactive"
        | "role"
        | "invited"
        | "mfa-setup"
        | "mfa-challenge"
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

type ConsoleStaff = NonNullable<AccessSubject["staff"]> & { role: ConsoleRole };

/** Steps 1-4, shared by ordinary console access and onboarding. */
function checkIdentityAndRole(
  subject: AccessSubject
): { ok: true; staff: ConsoleStaff } | { ok: false; reason: AccessFailureReason } {
  // 1. identity
  if (!subject.userId) return { ok: false, reason: "signin" };

  // 2. a linked staff record — Supabase identity alone grants nothing
  const staff = subject.staff;
  if (!staff) return { ok: false, reason: "no-staff" };

  // 3. the master switch, checked before anything else can matter
  if (!staff.active || staff.status === "deactivated") {
    return { ok: false, reason: "inactive" };
  }

  // 4. a role that can use the console at all
  if (!isConsoleRole(staff.role)) return { ok: false, reason: "role" };

  return { ok: true, staff: staff as ConsoleStaff };
}

/**
 * Ordinary Karma Console access. Password-authenticated sessions are enough;
 * staff lifecycle, role and permissions remain authoritative.
 */
export function evaluateAccess(
  subject: AccessSubject,
  requirement: AccessRequirement = {}
): AccessDecision {
  const pre = checkIdentityAndRole(subject);
  if (!pre.ok) return pre;
  const staff = pre.staff;

  // 5. lifecycle. An invited account is still onboarding and cannot reach
  //    ordinary console data until password setup/acceptance has completed.
  if (staff.status !== "active") return { ok: false, reason: "invited" };

  // 6. the operation itself
  if (requirement.ownerOnly && staff.role !== "owner") {
    return { ok: false, reason: "role" };
  }
  if (requirement.permission && !hasPermission(staff, requirement.permission)) {
    return { ok: false, reason: "permission" };
  }

  return { ok: true, role: staff.role, staffId: staff.id };
}

/**
 * Invitation acceptance (`/admin/welcome`) is deliberately narrow: only a
 * verified Supabase user linked to an active invited Owner/Admin staff record
 * may use it. After acceptance the account signs in with password only.
 */
export type OnboardingDecision =
  | { ok: true; role: ConsoleRole; staffId: number }
  | { ok: false; alreadyAccepted: true }
  | { ok: false; alreadyAccepted?: false; reason: AccessFailureReason };

export function evaluateOnboardingAccess(subject: AccessSubject): OnboardingDecision {
  const pre = checkIdentityAndRole(subject);
  if (!pre.ok) return { ok: false, reason: pre.reason };
  const staff = pre.staff;

  // An accepted account must not redo onboarding: it would be a second chance
  // to set a password from any session that reaches this URL.
  if (staff.status === "active") return { ok: false, alreadyAccepted: true };

  return { ok: true, role: staff.role, staffId: staff.id };
}
