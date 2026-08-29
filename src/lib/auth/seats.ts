/**
 * The account model: exactly one Owner, plus at most five enabled Admins.
 *
 * The database enforces this too (trigger `karma_staff_invariants`, migration
 * 0002) — this module is the layer that produces a useful message instead of a
 * 500, and it is what the tests exercise. Neither layer is decorative: the
 * trigger stops a race or a direct SQL write, this stops a rude error page.
 */

export const MAX_ADMIN_SEATS = 5;

export type SeatRow = {
  role: "owner" | "admin" | "trainer";
  active: boolean;
};

/**
 * A seat is consumed by any admin row that is still enabled. That deliberately
 * includes a pending invitation: the seat is reserved the moment the invite
 * goes out, because the person can accept at any time. Deactivating an admin
 * frees the seat immediately. The Owner never consumes one.
 */
export function countAdminSeats(rows: readonly SeatRow[]): number {
  return rows.filter((r) => r.role === "admin" && r.active).length;
}

export function seatsRemaining(rows: readonly SeatRow[]): number {
  return Math.max(0, MAX_ADMIN_SEATS - countAdminSeats(rows));
}

export function canInviteAdmin(rows: readonly SeatRow[]): boolean {
  return seatsRemaining(rows) > 0;
}
