import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  RECORD_ENTITIES,
  RECORD_POLICY,
  canPerform,
  deletableEntities,
  policyFor,
  supportsAction,
  type ActionSubject,
  type RecordEntity
} from "@/lib/admin/record-actions";
import { confirmationMatches } from "@/lib/admin/destructive";
import { PERMISSIONS, type Permission } from "@/lib/auth/permissions";

const read = (p: string) => readFileSync(p, "utf8");

const owner: ActionSubject = { role: "owner", has: () => true };
const adminWithEverything: ActionSubject = { role: "admin", has: () => true };
const adminWithNothing: ActionSubject = { role: "admin", has: () => false };
const adminWith = (...granted: Permission[]): ActionSubject => ({
  role: "admin",
  has: (permission) => granted.includes(permission)
});

/* ------------------------- deletion is owner-only ------------------------- */

describe("permanent deletion", () => {
  it("is refused to an admin holding EVERY permission there is", () => {
    /**
     * The single most important assertion in this file. An admin can be granted
     * every module's manage permission and still cannot destroy a record:
     * destroying history is not a delegated capability. If this ever passes for
     * an admin, the owner-only rule has been lost.
     */
    for (const entity of RECORD_ENTITIES) {
      expect(canPerform(adminWithEverything, entity, "delete"), entity).toBe(false);
      expect(canPerform(adminWithNothing, entity, "delete"), entity).toBe(false);
    }
  });

  it("is available to the Owner, but only where the policy allows it at all", () => {
    for (const entity of RECORD_ENTITIES) {
      const allowed = RECORD_POLICY[entity].deletableBy === "owner";
      expect(canPerform(owner, entity, "delete"), entity).toBe(allowed);
    }
    expect(deletableEntities().length).toBeGreaterThan(0);
  });

  it("can never touch audit history, attendance evidence, or an enrolment", () => {
    /**
     * Audit rows are the evidence that a deletion happened; a system that could
     * delete them would have no evidence at exactly the moment it mattered.
     * An attendance correction is the record that a locked register was
     * changed. An enrolment carries the fee agreement a student signed.
     */
    for (const entity of ["audit_log", "attendance_correction", "attendance_record", "enrollment"] as const) {
      expect(RECORD_POLICY[entity].deletableBy, entity).toBe("never");
      expect(canPerform(owner, entity, "delete"), entity).toBe(false);
      expect(supportsAction(entity, "delete"), entity).toBe(false);
    }
  });

  it("can never delete a staff account, whatever the caller's role", () => {
    // Accounts are deactivated: audit rows must keep pointing at a real
    // identity, and the karma_staff_invariants trigger refuses a DELETE of the
    // owner row regardless of what the application believes.
    expect(RECORD_POLICY.staff.deletableBy).toBe("never");
    expect(canPerform(owner, "staff", "delete")).toBe(false);
    expect(RECORD_POLICY.staff_permission.deletableBy).toBe("never");
  });

  it("keeps team administration ungrantable — no permission key reaches it", () => {
    for (const entity of ["staff", "staff_permission"] as const) {
      expect(RECORD_POLICY[entity].managePermission, entity).toBeNull();
      expect(canPerform(adminWithEverything, entity, "edit"), entity).toBe(false);
    }
    expect(canPerform(owner, "staff", "edit")).toBe(true);
  });
});

/* ---------------------------- ordinary actions ---------------------------- */

describe("archive, restore and edit", () => {
  it("need the module's manage permission, and nothing else opens them", () => {
    expect(canPerform(adminWith("courses.manage"), "course", "archive")).toBe(true);
    expect(canPerform(adminWith("courses.manage"), "course", "restore")).toBe(true);
    expect(canPerform(adminWith("courses.manage"), "batch", "archive")).toBe(false);
    expect(canPerform(adminWith("batches.manage"), "batch", "archive")).toBe(true);
    expect(canPerform(adminWith("students.manage"), "student", "archive")).toBe(true);
    expect(canPerform(adminWith("fees.manage"), "student", "archive")).toBe(false);
  });

  it("names only real permission keys", () => {
    // A typo here would silently make an action ungrantable.
    for (const entity of RECORD_ENTITIES) {
      const key = RECORD_POLICY[entity].managePermission;
      if (key == null) continue;
      expect(PERMISSIONS as readonly string[], entity).toContain(key);
    }
  });

  it("does not offer archiving where the record has a lifecycle instead", () => {
    // An enrolment already says everything archiving would, through
    // applied → active → completed | dropped.
    expect(supportsAction("enrollment", "archive")).toBe(false);
    expect(supportsAction("attendance_record", "archive")).toBe(false);
  });

  it("does not offer editing a ledger entry or a follow-up note", () => {
    // A corrected receipt would leave the original amount nowhere; an edited
    // follow-up note stops being a record of what was said.
    expect(supportsAction("fee_record", "edit")).toBe(false);
    expect(supportsAction("application_note", "edit")).toBe(false);
  });
});

/* ------------------------------ dependencies ------------------------------ */

describe("dependencies block deletion rather than cascading", () => {
  it("blocks a course on its batches and a batch on its enrolments", () => {
    /**
     * courses→batches and batches→enrolments are ON DELETE CASCADE in the
     * schema, so deleting a course really WOULD take every batch, enrolment,
     * attendance record, fee row and certificate under it. These two blocks are
     * what stop that from ever being one click.
     */
    expect(policyFor("course").blockedBy).toContain("batch");
    expect(policyFor("batch").blockedBy).toContain("enrollment");
    expect(policyFor("student").blockedBy).toContain("enrollment");
  });

  it("has a preflight branch for EVERY entity the policy says is deletable", () => {
    /**
     * The gap this catches, found by reading the diff after it had already
     * merged: `guardian`, `application_note` and `content_item` were listed as
     * deletable and had no branch in `preflight()`, so the switch fell through
     * to null and the action reported "missing". A record the policy said was
     * deletable simply refused — a silent gap, not a visible error, and exactly
     * what adding a new entity would reintroduce.
     */
    const source = read("src/lib/admin/destructive.ts");
    for (const entity of deletableEntities()) {
      expect(source, `preflight has no branch for "${entity}"`).toContain(`case "${entity}": {`);
    }
  });

  it("shows the operator the counts before asking for a confirmation", () => {
    const page = read("src/app/admin/(console)/records/[entity]/[id]/delete/page.tsx");
    expect(page).toContain("preflight(db, entity, id)");
    expect(page).toContain("copy.whatDepends");
    // The confirmation form appears only when nothing blocks the deletion.
    expect(page).toContain("report.blocked");
  });
});

/* ----------------------------- confirmations ------------------------------ */

describe("typed confirmation", () => {
  it("asks for the record's own identifier where a mistake is expensive", () => {
    // Typing "KDS-2026-0142" requires having read WHICH student this is.
    // Typing "DELETE" only requires wanting to get past a dialog.
    for (const entity of ["course", "batch", "student", "certificate"] as const) {
      expect(policyFor(entity).confirmation, entity).toBe("identifier");
    }
    expect(confirmationMatches("student", "KDS-2026-0142", "KDS-2026-0142")).toBe(true);
    expect(confirmationMatches("student", "KDS-2026-0142", "kds-2026-0142  ")).toBe(true);
    expect(confirmationMatches("student", "KDS-2026-0142", "DELETE")).toBe(false);
    expect(confirmationMatches("student", "KDS-2026-0142", "")).toBe(false);
    expect(confirmationMatches("student", "KDS-2026-0142", null)).toBe(false);
  });

  it("accepts the word DELETE only where the record carries no dependent history", () => {
    expect(policyFor("fee_record").confirmation).toBe("word");
    expect(confirmationMatches("fee_record", "#12", "delete")).toBe(true);
    expect(confirmationMatches("fee_record", "#12", "#12")).toBe(false);
  });

  it("never matches for an entity that cannot be deleted", () => {
    expect(confirmationMatches("audit_log", "1", "DELETE")).toBe(false);
    expect(confirmationMatches("enrollment", "1", "DELETE")).toBe(false);
  });
});

/* -------------------------- the action, in source ------------------------- */

describe("the delete action", () => {
  const actions = read("src/app/admin/(console)/records/actions.ts");

  it("writes the tombstone BEFORE removing the row, in one transaction", () => {
    /**
     * Order matters and is the point of the test. Writing the audit row after
     * the delete would mean a failure between the two left a deletion with no
     * record of who did it or what was destroyed — exactly the case an audit
     * log exists for.
     */
    const auditAt = actions.indexOf("RECORD_AUDIT_ACTIONS.deleted");
    const deleteAt = actions.indexOf("await tx.delete(table)");
    expect(auditAt).toBeGreaterThan(-1);
    expect(deleteAt).toBeGreaterThan(-1);
    expect(auditAt).toBeLessThan(deleteAt);
    expect(actions).toContain("db.transaction(async (tx) =>");
  });

  it("is owner-guarded at the action as well as at the page", () => {
    expect(actions).toContain('authorizeAction({ ownerOnly: true })');
    expect(actions).toContain('canPerform(subjectFor(auth.session), entity, "delete")');
    const page = read("src/app/admin/(console)/records/[entity]/[id]/delete/page.tsx");
    expect(page).toContain("requireOwner(");
  });

  it("re-runs the preflight server-side rather than trusting the page", () => {
    expect(actions).toContain("await preflight(db, entity, id)");
    expect(actions).toContain('if (report.blocked) return fail("blocked")');
    expect(actions).toContain("confirmationMatches(entity, report.identifier, formData.get(\"confirm\"))");
    expect(actions).toContain('if (reason.length < 3) return fail("confirm")');
  });

  it("refuses a locked attendance session and an un-revoked certificate", () => {
    expect(actions).toContain('if (report.refusal === "locked") return fail("locked")');
    expect(actions).toContain('if (report.refusal === "revokeFirst") return fail("revokeFirst")');
  });

  it("keeps a credential out of every tombstone", () => {
    // The tombstone is a short, deliberate set of identifying fields — never
    // the whole row, and never anything secret (CLAUDE.md).
    const tombstone = actions.slice(actions.indexOf("function tombstone("));
    for (const banned of ["password", "token", "secret", "authUserId", "pin", "apiKey"]) {
      expect(tombstone.toLowerCase(), banned).not.toContain(banned.toLowerCase());
    }
  });
});

/* --------------------- archived rows leave the pickers -------------------- */

describe("an archived record is out of the operational picture", () => {
  const files: Array<[string, string]> = [
    ["src/app/admin/(console)/students/page.tsx", "the admission batch picker"],
    ["src/app/admin/(console)/attendance/page.tsx", "the attendance batch picker"],
    ["src/app/admin/(console)/admissions/page.tsx", "the enquiry course picker"],
    ["src/lib/db/queries.ts", "the public upcoming-batches feed"]
  ];

  it("is filtered out of every picker, including the public site", () => {
    for (const [file, what] of files) {
      expect(read(file), what).toContain("isNull(schema.");
      expect(read(file), what).toMatch(/isNull\(schema\.(courses|batches|students|applications)\.archivedAt\)/);
    }
  });

  it("is still findable, so archived never looks the same as deleted", () => {
    for (const file of [
      "src/app/admin/(console)/courses/page.tsx",
      "src/app/admin/(console)/students/page.tsx",
      "src/app/admin/(console)/admissions/page.tsx"
    ]) {
      expect(read(file), file).toContain("showArchived");
    }
  });
});

/* ------------------------------ policy notes ------------------------------ */

describe("the policy explains itself", () => {
  it("gives every entity a reason someone can read before changing it", () => {
    for (const entity of RECORD_ENTITIES) {
      expect(RECORD_POLICY[entity].note.length, entity).toBeGreaterThan(60);
    }
  });

  it("covers every entity exactly once", () => {
    const keys = Object.keys(RECORD_POLICY) as RecordEntity[];
    expect(new Set(keys).size).toBe(RECORD_ENTITIES.length);
    expect([...keys].sort()).toEqual([...RECORD_ENTITIES].sort());
  });
});
