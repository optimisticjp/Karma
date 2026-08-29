import type { StaffStatus } from "@/lib/auth/access";

/**
 * Which lifecycle state a reactivated account returns to.
 *
 * Deactivating overwrites `status` with `deactivated`, which destroys the
 * evidence of where the account was before — so reactivation cannot read
 * `status` to decide. `accepted_at` is the durable evidence: it is set once,
 * when the person completes invitation acceptance, and is never cleared.
 *
 *   never accepted  → back to `invited`; the invitation still has to be done
 *   accepted before → back to `active`; they had a working account
 *
 * Getting this wrong would silently promote someone who never accepted their
 * invitation into a fully active console account.
 */
export function reactivatedStatus(acceptedAt: Date | null | undefined): StaffStatus {
  return acceptedAt ? "active" : "invited";
}
