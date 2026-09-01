# Karma Console record cleanup policy

**Effective:** 2026-09-01  
**Owner decision:** test records stay in the database for now; authorised institute admins must be able to clean duplicate, mistaken, test or otherwise unnecessary operational records from Karma Console.

This note supersedes the older **Owner-only permanent deletion** wording in `docs/admin-architecture.md` and any older comments that describe deletion as universally Owner-only. The central policy in `src/lib/admin/record-actions.ts` is the executable source of truth.

## Permission rule

Permanent deletion follows the same module-level `*.manage` permission that allows an admin to maintain that record. The Owner continues to bypass the permission table.

Examples:

- `courses.manage` can permanently delete an eligible course.
- `batches.manage` can permanently delete an eligible batch.
- `students.manage` can permanently delete an eligible student, guardian contact or enrolment.
- `applications.manage` can permanently delete an eligible enquiry or follow-up note.
- `attendance.manage` can permanently delete an **unlocked** attendance session.
- `fees.manage` can permanently delete a mistaken fee entry.
- `certificates.manage` can permanently delete a certificate **only after it has been revoked**.
- `design.manage` can permanently delete a design brief.
- `content.manage` can permanently delete a content item.

A manage permission never grants access to another module's records.

## Records that remain non-deletable

Some rows are evidence or security state rather than ordinary operational data. They deliberately remain outside permanent cleanup:

- `audit_logs`
- individual `attendance_records`
- `attendance_corrections`
- `staff` accounts
- generic `staff_permissions` rows through the record-delete route

Staff accounts are deactivated rather than destroyed. Team and permission administration remain Owner-only.

## Safety rules that still apply

Delegating the permission does **not** weaken the destructive flow. The sequence remains:

1. authenticate and authorise against the central record policy;
2. preflight the record and count dependencies;
3. refuse dangerous cascades;
4. require a typed confirmation;
5. require a written reason;
6. write a non-secret audit tombstone;
7. permanently delete the row in the same transaction.

Important dependency rules include:

- a course cannot be deleted while batches depend on it;
- a batch cannot be deleted while enrolments depend on it;
- a student cannot be deleted while enrolments depend on it;
- an enrolment cannot be deleted while fee entries or certificates depend on it;
- a locked attendance session cannot be deleted;
- an issued certificate must be revoked before deletion.

The database's existing cascades are not used as a shortcut around those checks.

## Console UX

Ordinary add/edit/archive work remains inside each module. `/admin/records` is the dedicated **Record cleanup** workspace for permanent deletion, including smaller child records that should not put a destructive button in every day-to-day screen. It only shows record types the current admin is authorised to delete, and each row still goes through the separate preflight/confirmation page.

Archived records are not the same as deleted records. Archive remains the default for genuine historical records that should leave operational pickers but keep their history. Permanent deletion is intended for test, duplicate, mistaken or genuinely unnecessary records.
