import { z } from "zod";
import {
  isPermissionTemplate,
  parsePermissions,
  templatePermissions,
  type Permission,
  type PermissionTemplate
} from "@/lib/auth/permissions";
import { canInviteAdmin, type SeatRow } from "@/lib/auth/seats";
import { isAdminLocale, type AdminLocale } from "./i18n";

/**
 * Everything an admin invitation must satisfy before a single row is written
 * or a single email is sent — as a pure function, so all of it is testable
 * without a Supabase project.
 *
 * It does NOT check who is asking. That is the caller's first line
 * (`authorizeAction({ ownerOnly: true })`), because authorization must not be
 * something a validator can be talked out of.
 */

export type InviteRejection =
  | "invalidName"
  | "invalidEmail"
  | "invalidPermission"
  | "duplicate"
  | "seatsFull";

export type InviteContext = {
  /** Emails already held by console accounts (owner + admin), any case. */
  existingConsoleEmails: readonly string[];
  /** Current staff rows, for the seat count. */
  seats: readonly SeatRow[];
};

export type ValidInvite = {
  name: string;
  email: string;
  locale: AdminLocale;
  template: PermissionTemplate;
  permissions: Permission[];
};

export type InviteValidation =
  | { ok: true; value: ValidInvite }
  | { ok: false; reason: InviteRejection };

const fieldSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(160)
});

export function validateInvite(
  input: {
    name: unknown;
    email: unknown;
    template: unknown;
    locale: unknown;
    permissions: unknown;
  },
  context: InviteContext
): InviteValidation {
  const parsed = fieldSchema.safeParse({ name: input.name, email: input.email });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, reason: field === "name" ? "invalidName" : "invalidEmail" };
  }

  if (!isPermissionTemplate(input.template)) {
    return { ok: false, reason: "invalidPermission" };
  }

  // An unknown permission key rejects the whole invitation rather than being
  // dropped: quietly granting less than the owner chose is its own bug.
  const requested = parsePermissions(input.permissions);
  if (requested === null) return { ok: false, reason: "invalidPermission" };

  const { name, email } = parsed.data;

  // One administrative identity per address, case-insensitively. The database
  // has the same rule as a unique index; this exists to produce a sentence.
  if (context.existingConsoleEmails.some((e) => e.toLowerCase() === email)) {
    return { ok: false, reason: "duplicate" };
  }

  // A pending invitation already holds a seat, so this is checked before the
  // invitation is sent, not after.
  if (!canInviteAdmin(context.seats)) return { ok: false, reason: "seatsFull" };

  return {
    ok: true,
    value: {
      name,
      email,
      locale: isAdminLocale(input.locale) ? input.locale : "en",
      template: input.template,
      // An empty explicit selection falls back to the chosen template, so
      // "Admissions + send" does what it looks like it does.
      permissions: requested.length > 0 ? requested : templatePermissions(input.template)
    }
  };
}
