import type { StaffStatus } from "@/lib/auth/access";

/**
 * The decision the owner-bootstrap script makes before it touches anything.
 *
 * Pure, so the three outcomes that matter — "already done", "refuse", "go
 * ahead" — are testable without a Supabase project or a database. The script
 * itself then only performs the decision.
 */

export type OwnerRow = {
  id: number;
  email: string | null;
  status: StaffStatus;
};

export type OwnerBootstrapDecision =
  /** The intended owner already exists. Idempotent: change nothing. */
  | { action: "already-owner"; staffId: number; status: StaffStatus }
  /** Somebody else already owns this installation. Refuse. */
  | { action: "refuse"; reason: "different-owner" }
  /** No owner yet. Invite the intended address. */
  | { action: "invite" };

/**
 * Compares the intended owner against the active owner rows that exist.
 *
 * Email comparison is case-insensitive, matching `uq_staff_console_email`.
 * A row with no email can never be "the intended owner": matching on a null
 * would be matching on nothing.
 */
export function decideOwnerBootstrap(
  activeOwners: readonly OwnerRow[],
  intendedEmail: string
): OwnerBootstrapDecision {
  const wanted = intendedEmail.trim().toLowerCase();

  const mine = activeOwners.find((o) => (o.email ?? "").toLowerCase() === wanted);
  if (mine) return { action: "already-owner", staffId: mine.id, status: mine.status };

  // Any other active owner means this installation is already owned. Karma
  // allows exactly one, and a script is not the place to take it over.
  if (activeOwners.length > 0) return { action: "refuse", reason: "different-owner" };

  return { action: "invite" };
}
