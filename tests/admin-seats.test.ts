import { describe, expect, it } from "vitest";
import {
  MAX_ADMIN_SEATS,
  canInviteAdmin,
  countAdminSeats,
  seatsRemaining,
  type SeatRow
} from "@/lib/auth/seats";

/**
 * The account model: one Owner, plus at most five enabled Admins.
 *
 * These cover the application layer. The same rules are enforced again by the
 * `karma_staff_invariants` trigger in drizzle/0002_admin_foundation.sql, which
 * is what protects against a race between two simultaneous invitations — the
 * application check produces the message, the database check produces the
 * guarantee.
 */

const owner: SeatRow = { role: "owner", active: true };
const admin = (active = true): SeatRow => ({ role: "admin", active });
const trainer: SeatRow = { role: "trainer", active: true };

describe("admin seats", () => {
  it("the owner never consumes a seat", () => {
    expect(countAdminSeats([owner])).toBe(0);
    expect(seatsRemaining([owner])).toBe(MAX_ADMIN_SEATS);
    expect(canInviteAdmin([owner])).toBe(true);
  });

  it("trainers never consume a seat either", () => {
    expect(countAdminSeats([owner, trainer, trainer, trainer])).toBe(0);
  });

  it("allows exactly five admins", () => {
    const rows: SeatRow[] = [owner];
    for (let i = 0; i < MAX_ADMIN_SEATS; i++) {
      expect(canInviteAdmin(rows)).toBe(true);
      rows.push(admin());
    }
    expect(countAdminSeats(rows)).toBe(5);
    expect(seatsRemaining(rows)).toBe(0);
  });

  it("refuses the sixth admin", () => {
    const rows: SeatRow[] = [owner, admin(), admin(), admin(), admin(), admin()];
    expect(canInviteAdmin(rows)).toBe(false);
  });

  it("counts a pending invitation as a used seat", () => {
    // An invited-but-not-accepted admin is `active: true` with status
    // 'invited': the seat is reserved the moment the invitation goes out,
    // because the person can accept at any time.
    const rows: SeatRow[] = [owner, admin(), admin(), admin(), admin(), admin()];
    expect(countAdminSeats(rows)).toBe(5);
    expect(canInviteAdmin(rows)).toBe(false);
  });

  it("frees the seat when an admin is deactivated", () => {
    const rows: SeatRow[] = [owner, admin(), admin(), admin(), admin(), admin(false)];
    expect(countAdminSeats(rows)).toBe(4);
    expect(seatsRemaining(rows)).toBe(1);
    expect(canInviteAdmin(rows)).toBe(true);
  });

  it("never reports a negative remainder if the database is over quota", () => {
    const rows: SeatRow[] = Array.from({ length: 8 }, () => admin());
    expect(seatsRemaining(rows)).toBe(0);
    expect(canInviteAdmin(rows)).toBe(false);
  });

  it("holds the documented maximum at five", () => {
    expect(MAX_ADMIN_SEATS).toBe(5);
  });
});
