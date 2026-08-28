import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getAssuranceLevel, getVerifiedUser } from "@/lib/supabase/server";
import { getStaffByAuthUserId, type StaffRecord } from "./staff";
import {
  evaluateAccess,
  hasPermission,
  type AccessDecision,
  type AccessFailureReason,
  type AccessRequirement,
  type AccessSubject
} from "./access";
import type { Permission } from "./permissions";
import { redirectTargetFor } from "./redirect";

// Re-exported so callers only ever import guards from one place.
export { redirectTargetFor };

/**
 * THE authorization entry point for the Karma Console.
 *
 * Every protected page, layout and server action calls one of these. Nothing
 * re-implements a role check inline, so there is one place to audit and one
 * place to change. A hidden nav link, a client-side permission object and a
 * route that "isn't linked anywhere" are all decoration; this is the wall.
 */

export type Session = {
  userId: string;
  email: string | null;
  staff: StaffRecord;
  role: "owner" | "admin";
};

type ResolvedSubject = {
  subject: AccessSubject;
  staff: StaffRecord | null;
  userId: string | null;
  email: string | null;
};

/**
 * Resolves the caller ONCE per request: verified Supabase user → linked staff
 * record → assurance level. Cached with no arguments so every guard call in a
 * render shares the same three lookups (the requirement is applied afterwards,
 * against the cached subject).
 */
const resolveSubject = cache(async (): Promise<ResolvedSubject> => {
  const empty: AccessSubject = {
    userId: null,
    staff: null,
    currentLevel: null,
    nextLevel: null
  };

  const user = await getVerifiedUser();
  if (!user) return { subject: empty, staff: null, userId: null, email: null };

  const staff = await getStaffByAuthUserId(user.id);
  const { currentLevel, nextLevel } = await getAssuranceLevel();

  return {
    subject: {
      userId: user.id,
      staff: staff
        ? {
            id: staff.id,
            role: staff.role,
            active: staff.active,
            permissions: staff.permissions
          }
        : null,
      currentLevel,
      nextLevel
    },
    staff,
    userId: user.id,
    email: user.email ?? null
  };
});

export async function resolveAccess(requirement: AccessRequirement = {}): Promise<{
  decision: AccessDecision;
  staff: StaffRecord | null;
  userId: string | null;
  email: string | null;
}> {
  const { subject, staff, userId, email } = await resolveSubject();
  return { decision: evaluateAccess(subject, requirement), staff, userId, email };
}

/**
 * Page guard. Redirects rather than throwing, so an unauthorised visit lands
 * somewhere explicable instead of on an error boundary.
 *
 * `from` is the path to return to afterwards; it is re-validated by
 * `safeNextPath` before it is ever used as a redirect target.
 */
export async function requireSession(
  requirement: AccessRequirement = {},
  from?: string
): Promise<Session> {
  const { decision, staff, userId, email } = await resolveAccess(requirement);
  if (!decision.ok || !staff || !userId) {
    redirect(redirectTargetFor(decision, from));
  }
  return { userId, email, staff, role: decision.role };
}

/** Any console account (owner or admin), MFA satisfied. */
export function requireAdmin(from?: string) {
  return requireSession({}, from);
}

/** Owner only — team administration, and nothing else may use this. */
export function requireOwner(from?: string) {
  return requireSession({ ownerOnly: true }, from);
}

/** A specific capability. The owner always passes. */
export function requirePermission(permission: Permission, from?: string) {
  return requireSession({ permission }, from);
}

/* ------------------------------ server actions ---------------------------- */

export type ActionAuth =
  | { ok: true; session: Session }
  | { ok: false; reason: AccessFailureReason };

/**
 * Action guard. Server actions must NOT redirect on an authorization failure:
 * a redirect inside a form submission reads as success to the caller. These
 * return a typed failure that the action turns into a message instead.
 */
export async function authorizeAction(
  requirement: AccessRequirement = {}
): Promise<ActionAuth> {
  const { decision, staff, userId, email } = await resolveAccess(requirement);
  if (!decision.ok) return { ok: false, reason: decision.reason };
  if (!staff || !userId) return { ok: false, reason: "no-staff" };
  return { ok: true, session: { userId, email, staff, role: decision.role } };
}

/**
 * Convenience for rendering: does the CURRENT caller hold this permission?
 * Used to decide which nav entries to draw. Navigation is not security — every
 * destination guards itself — but showing someone a door they cannot open is
 * bad design.
 */
export async function currentCan(permission: Permission): Promise<boolean> {
  const { staff } = await resolveAccess();
  return hasPermission(staff, permission);
}
