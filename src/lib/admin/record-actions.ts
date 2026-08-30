import type { Permission } from "@/lib/auth/permissions";

/**
 * ONE model for what may be done to an operational record.
 *
 * The owner replaced the old blanket rule — "archive, never hard-delete" — on
 * 2026-08-30. Permanent deletion now exists. This file is the whole policy, in
 * one place, so a module cannot quietly invent a softer or harsher rule of its
 * own, and so the question "can this be deleted, and by whom?" has exactly one
 * answer to read.
 *
 * Five verbs, and not every record gets all five:
 *
 *   add       create a record
 *   edit      change it
 *   archive   take it out of every operational picker, keep all its history
 *   restore   put it back
 *   delete    remove the row permanently, after a tombstone is written
 *
 * Three principles the table below encodes:
 *
 *  1. **Archive is the ordinary path; deletion is the exception.** Archiving is
 *     reversible and loses nothing. Deletion is for a record that should never
 *     have existed — a duplicate, a test row, a mistaken entry — not for tidying.
 *  2. **Deletion is Owner-only**, even for an admin holding the module's manage
 *     permission. Destroying history is not a delegated capability.
 *  3. **Some things are never deletable at all.** Audit history is evidence
 *     about deletions, so a system that let it be deleted would be a system
 *     with no evidence at the moment it mattered most. The single Owner
 *     identity is protected by the `karma_staff_invariants` database trigger,
 *     not merely by this table.
 */

export const RECORD_ACTIONS = ["add", "edit", "archive", "restore", "delete"] as const;
export type RecordAction = (typeof RECORD_ACTIONS)[number];

export const RECORD_ENTITIES = [
  "course",
  "batch",
  "application",
  "application_note",
  "student",
  "guardian",
  "enrollment",
  "attendance_session",
  "attendance_record",
  "attendance_correction",
  "fee_record",
  "certificate",
  "service_enquiry",
  "content_item",
  "staff",
  "staff_permission",
  "audit_log"
] as const;
export type RecordEntity = (typeof RECORD_ENTITIES)[number];

/** How much a mis-click would cost, which decides how hard deletion is to reach. */
export type ConfirmationStyle =
  /** Type the record's own identifier — an admission number, a slug, a label. */
  | "identifier"
  /** Type the word DELETE. Enough for a row that carries no dependent history. */
  | "word"
  /** Not deletable at all. */
  | "none";

export type RecordPolicy = {
  actions: readonly RecordAction[];
  /** The permission an admin needs for add/edit/archive/restore. */
  managePermission: Permission | null;
  /** Who may permanently delete. `never` means nobody, including the Owner. */
  deletableBy: "owner" | "never";
  confirmation: ConfirmationStyle;
  /**
   * Entities whose existence BLOCKS deletion. Not a cascade: the operator is
   * shown what depends on the record and must deal with it deliberately.
   */
  blockedBy: readonly RecordEntity[];
  /** Why this row looks the way it does. Read it before changing one. */
  note: string;
};

export const RECORD_POLICY: Record<RecordEntity, RecordPolicy> = {
  course: {
    actions: ["add", "edit", "archive", "restore", "delete"],
    managePermission: "courses.manage",
    deletableBy: "owner",
    confirmation: "identifier",
    blockedBy: ["batch"],
    note: "A course with batches is the root of every student's history on it. `courses.batches` is declared ON DELETE CASCADE, so deleting one WOULD take the batches, their enrolments, attendance, fees and certificates with it. Blocking on batches is what stops that; do not relax it and rely on the cascade."
  },
  batch: {
    actions: ["add", "edit", "archive", "restore", "delete"],
    managePermission: "batches.manage",
    deletableBy: "owner",
    confirmation: "identifier",
    blockedBy: ["enrollment"],
    note: "Same reasoning one level down: a batch cascades to its enrolments, and an enrolment owns attendance, fees and certificates."
  },
  application: {
    actions: ["add", "edit", "archive", "restore", "delete"],
    managePermission: "applications.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "An enquiry owns only its own notes and guardian rows, which go with it. A student converted from it is a separate record and is untouched. Archive is still the normal way to close one — deletion is for a duplicate or a spam submission."
  },
  application_note: {
    actions: ["add", "delete"],
    managePermission: "applications.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "A follow-up note is not edited: correcting the record of what was said is how a follow-up trail stops being a follow-up trail. A wrong note is deleted and a new one written."
  },
  student: {
    actions: ["add", "edit", "archive", "restore", "delete"],
    managePermission: "students.manage",
    deletableBy: "owner",
    confirmation: "identifier",
    blockedBy: ["enrollment"],
    note: "Archiving a student is the answer to almost every real case — they left, they never started, they are a duplicate of someone still enrolled. Deletion is blocked while any enrolment exists, because that enrolment carries attendance, fees and possibly a publicly verifiable certificate."
  },
  guardian: {
    actions: ["add", "edit", "delete"],
    managePermission: "students.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "A contact detail. It has no history of its own, and a wrong one should simply go."
  },
  enrollment: {
    actions: ["add", "edit"],
    managePermission: "students.manage",
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "An enrolment is not archived and not deleted — it has a lifecycle (`applied → active → completed | dropped`) that already says everything archiving would, and it holds the fee agreement the student signed. Deleting one would erase what somebody agreed to pay. Drop it instead."
  },
  attendance_session: {
    actions: ["add", "edit", "delete"],
    managePermission: "attendance.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "A session opened on the wrong date is a real mistake worth removing, and it takes its own records with it. A LOCKED session is refused at the action, because locking is the moment the register became a record."
  },
  attendance_record: {
    actions: ["edit"],
    managePermission: "attendance.manage",
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "One student's mark in a session. It is corrected, never removed — a missing row and an absence mark are indistinguishable afterwards, and the correction trail is the point."
  },
  attendance_correction: {
    actions: [],
    managePermission: "attendance.manage",
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "The evidence that a locked register was changed, by whom and why. Deletable evidence is not evidence."
  },
  fee_record: {
    actions: ["add", "delete"],
    managePermission: "fees.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "A ledger entry is never edited — a corrected receipt would leave the original amount nowhere. A genuinely mistaken entry is deleted by the Owner, and the tombstone keeps the amount, the method and the receipt number."
  },
  certificate: {
    actions: ["add", "edit", "delete"],
    managePermission: "certificates.manage",
    deletableBy: "owner",
    confirmation: "identifier",
    blockedBy: [],
    note: "A certificate has a PUBLIC verification URL. Deleting an issued one turns a link a student may have given an employer into a 404, which reads as a forgery rather than a withdrawal. The action therefore refuses unless the certificate has been REVOKED first — revocation is the honest public answer."
  },
  service_enquiry: {
    actions: ["add", "edit", "delete"],
    managePermission: "design.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "A B2B brief owns its status history and file rows. When R2 is activated, deletion must also remove the objects those rows point at — until then there are no objects, and the tombstone records the file names."
  },
  content_item: {
    actions: ["add", "edit", "archive", "restore", "delete"],
    managePermission: "content.manage",
    deletableBy: "owner",
    confirmation: "word",
    blockedBy: [],
    note: "Content Desk archives through its OWN `status` column and its own action, not through the shared archive path — `isArchivable()` deliberately excludes it, so do not wire a RecordMenu archive button here expecting it to work. Deletion is for a draft that should never have been made. Consent and owner-verification timestamps are preserved by archiving and lost by deleting, which is the point of preferring archive."
  },
  staff: {
    actions: ["add", "edit", "archive", "restore"],
    managePermission: null,
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "Accounts are deactivated, never deleted: audit rows must keep pointing at a real identity, and the `karma_staff_invariants` trigger refuses a DELETE of the owner row regardless of what the application thinks. Team administration is Owner-only and has no permission key at all — see docs/admin-architecture.md."
  },
  staff_permission: {
    actions: ["add", "delete"],
    managePermission: null,
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "Grants are added and removed through the Owner-only permission editor, which replaces the whole set in a transaction. There is no per-row destructive UI, and this is not that door."
  },
  audit_log: {
    actions: [],
    managePermission: null,
    deletableBy: "never",
    confirmation: "none",
    blockedBy: [],
    note: "Immutable evidence, not a CRUD resource. Every permanent deletion in this system writes an audit row BEFORE the row disappears; a system that could then delete the audit row would have no evidence at exactly the moment it mattered. Retention is a separate, deliberate operational decision, not a delete button."
  }
};

/* ------------------------------ the decision ------------------------------ */

export type ActorRole = "owner" | "admin";

export type ActionSubject = {
  role: ActorRole;
  has: (permission: Permission) => boolean;
};

export function policyFor(entity: RecordEntity): RecordPolicy {
  return RECORD_POLICY[entity];
}

export function supportsAction(entity: RecordEntity, action: RecordAction): boolean {
  return RECORD_POLICY[entity].actions.includes(action);
}

/**
 * May this caller perform this action on this kind of record?
 *
 * Navigation and buttons use this so an operator is not shown a door they
 * cannot open — but it is NOT the wall. Every server action re-checks
 * authorization through `authorizeAction`, exactly as every other console
 * mutation does.
 */
export function canPerform(
  subject: ActionSubject,
  entity: RecordEntity,
  action: RecordAction
): boolean {
  const policy = RECORD_POLICY[entity];
  if (!policy.actions.includes(action)) return false;

  if (action === "delete") {
    if (policy.deletableBy === "never") return false;
    /* Owner-only by design, even for an admin holding the manage permission:
       destroying history is not a delegated capability. */
    return subject.role === "owner";
  }

  if (subject.role === "owner") return true;
  /* A null permission means Owner-only with no key that could grant it. */
  if (policy.managePermission == null) return false;
  return subject.has(policy.managePermission);
}

/** Every entity an operator can permanently delete, for documentation and tests. */
export function deletableEntities(): RecordEntity[] {
  return RECORD_ENTITIES.filter((e) => RECORD_POLICY[e].deletableBy === "owner");
}
