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

describe("permanent deletion", () => {
  it("follows the module manage permission for delegated cleanup", () => {
    expect(canPerform(adminWith("courses.manage"), "course", "delete")).toBe(true);
    expect(canPerform(adminWith("batches.manage"), "batch", "delete")).toBe(true);
    expect(canPerform(adminWith("students.manage"), "student", "delete")).toBe(true);
    expect(canPerform(adminWith("students.manage"), "enrollment", "delete")).toBe(true);
    expect(canPerform(adminWith("fees.manage"), "fee_record", "delete")).toBe(true);
    expect(canPerform(adminWith("certificates.manage"), "certificate", "delete")).toBe(true);
    expect(canPerform(adminWith("content.manage"), "content_item", "delete")).toBe(true);

    expect(canPerform(adminWithNothing, "course", "delete")).toBe(false);
    expect(canPerform(adminWith("fees.manage"), "student", "delete")).toBe(false);
    expect(canPerform(adminWith("students.manage"), "fee_record", "delete")).toBe(false);
  });

  it("lets the Owner delete every entity the policy marks deletable", () => {
    for (const entity of RECORD_ENTITIES) {
      const allowed = RECORD_POLICY[entity].deletableBy !== "never";
      expect(canPerform(owner, entity, "delete"), entity).toBe(allowed);
    }
    expect(deletableEntities().length).toBeGreaterThan(0);
  });

  it("keeps security and evidence records non-deletable", () => {
    for (const entity of [
      "audit_log",
      "attendance_correction",
      "attendance_record",
      "staff",
      "staff_permission"
    ] as const) {
      expect(RECORD_POLICY[entity].deletableBy, entity).toBe("never");
      expect(canPerform(owner, entity, "delete"), entity).toBe(false);
      expect(canPerform(adminWithEverything, entity, "delete"), entity).toBe(false);
      expect(supportsAction(entity, "delete"), entity).toBe(false);
    }
  });

  it("keeps team administration ungrantable", () => {
    for (const entity of ["staff", "staff_permission"] as const) {
      expect(RECORD_POLICY[entity].managePermission, entity).toBeNull();
      expect(canPerform(adminWithEverything, entity, "edit"), entity).toBe(false);
    }
    expect(canPerform(owner, "staff", "edit")).toBe(true);
  });
});

describe("ordinary actions", () => {
  it("needs the module manage permission for archive and restore", () => {
    expect(canPerform(adminWith("courses.manage"), "course", "archive")).toBe(true);
    expect(canPerform(adminWith("courses.manage"), "course", "restore")).toBe(true);
    expect(canPerform(adminWith("courses.manage"), "batch", "archive")).toBe(false);
    expect(canPerform(adminWith("batches.manage"), "batch", "archive")).toBe(true);
    expect(canPerform(adminWith("students.manage"), "student", "archive")).toBe(true);
  });

  it("names only real permission keys", () => {
    for (const entity of RECORD_ENTITIES) {
      const key = RECORD_POLICY[entity].managePermission;
      if (key == null) continue;
      expect(PERMISSIONS as readonly string[], entity).toContain(key);
    }
  });

  it("uses lifecycle states where archive or edit would destroy meaning", () => {
    expect(supportsAction("enrollment", "archive")).toBe(false);
    expect(supportsAction("attendance_record", "archive")).toBe(false);
    expect(supportsAction("fee_record", "edit")).toBe(false);
    expect(supportsAction("application_note", "edit")).toBe(false);
  });
});

describe("dependencies block deletion rather than cascading", () => {
  it("blocks high-value parent records", () => {
    expect(policyFor("course").blockedBy).toContain("batch");
    expect(policyFor("batch").blockedBy).toContain("enrollment");
    expect(policyFor("student").blockedBy).toContain("enrollment");
    expect(policyFor("enrollment").blockedBy).toContain("fee_record");
    expect(policyFor("enrollment").blockedBy).toContain("certificate");
  });

  it("has a preflight branch for every deletable entity", () => {
    const source = read("src/lib/admin/destructive.ts");
    for (const entity of deletableEntities()) {
      expect(source, `preflight has no branch for "${entity}"`).toContain(`case "${entity}": {`);
    }
  });

  it("shows dependency counts before confirmation", () => {
    const page = read("src/app/admin/(console)/records/[entity]/[id]/delete/page.tsx");
    expect(page).toContain("preflight(db, entity, id)");
    expect(page).toContain("copy.whatDepends");
    expect(page).toContain("report.blocked");
  });
});

describe("typed confirmation", () => {
  it("uses identifiers where a wrong click is expensive", () => {
    for (const entity of ["course", "batch", "student", "certificate"] as const) {
      expect(policyFor(entity).confirmation, entity).toBe("identifier");
    }
    expect(confirmationMatches("student", "KDS-2026-0142", "KDS-2026-0142")).toBe(true);
    expect(confirmationMatches("student", "KDS-2026-0142", "kds-2026-0142  ")).toBe(true);
    expect(confirmationMatches("student", "KDS-2026-0142", "DELETE")).toBe(false);
  });

  it("uses DELETE for lower-identity cleanup records", () => {
    expect(policyFor("fee_record").confirmation).toBe("word");
    expect(policyFor("enrollment").confirmation).toBe("word");
    expect(confirmationMatches("fee_record", "#12", "delete")).toBe(true);
    expect(confirmationMatches("enrollment", "#12", "DELETE")).toBe(true);
  });

  it("never matches for entities that cannot be deleted", () => {
    expect(confirmationMatches("audit_log", "1", "DELETE")).toBe(false);
    expect(confirmationMatches("attendance_record", "1", "DELETE")).toBe(false);
  });
});

describe("the delete action", () => {
  const actions = read("src/app/admin/(console)/records/actions.ts");
  const page = read("src/app/admin/(console)/records/[entity]/[id]/delete/page.tsx");

  it("writes the tombstone before deleting, inside one transaction", () => {
    const auditAt = actions.indexOf("RECORD_AUDIT_ACTIONS.deleted");
    const deleteAt = actions.indexOf("await tx.delete(table)");
    expect(auditAt).toBeGreaterThan(-1);
    expect(deleteAt).toBeGreaterThan(-1);
    expect(auditAt).toBeLessThan(deleteAt);
    expect(actions).toContain("db.transaction(async (tx) =>");
  });

  it("re-checks centralized authorization in both page and action", () => {
    expect(page).toContain("requireAdmin(");
    expect(page).toContain('canPerform(subject, entity, "delete")');
    expect(actions).toContain("policy.managePermission");
    expect(actions).toContain("authorizeAction(");
    expect(actions).toContain('canPerform(subjectFor(auth.session), entity, "delete")');
  });

  it("re-runs preflight and confirmation server-side", () => {
    expect(actions).toContain("await preflight(db, entity, id)");
    expect(actions).toContain('if (report.blocked) return fail("blocked")');
    expect(actions).toContain('if (report.refusal === "locked") return fail("locked")');
    expect(actions).toContain('if (report.refusal === "revokeFirst") return fail("revokeFirst")');
    expect(actions).toContain("confirmationMatches(entity, report.identifier, formData.get(\"confirm\"))");
    expect(actions).toContain('if (reason.length < 3) return fail("confirm")');
  });

  it("keeps credentials out of tombstones", () => {
    const tombstone = actions.slice(actions.indexOf("function tombstone("));
    for (const banned of ["password", "token", "secret", "authUserId", "pin", "apiKey"]) {
      expect(tombstone.toLowerCase(), banned).not.toContain(banned.toLowerCase());
    }
  });
});

describe("archived rows leave operational pickers", () => {
  const files: Array<[string, string]> = [
    ["src/app/admin/(console)/students/page.tsx", "student admission batch picker"],
    ["src/app/admin/(console)/attendance/page.tsx", "attendance batch picker"],
    ["src/app/admin/(console)/admissions/page.tsx", "enquiry course picker"],
    ["src/lib/db/queries.ts", "public upcoming-batches feed"]
  ];

  it("filters archived records from operational choices", () => {
    for (const [file, what] of files) {
      expect(read(file), what).toContain("isNull(schema.");
      expect(read(file), what).toMatch(/isNull\(schema\.(courses|batches|students|applications)\.archivedAt\)/);
    }
  });

  it("keeps archived records findable", () => {
    for (const file of [
      "src/app/admin/(console)/courses/page.tsx",
      "src/app/admin/(console)/students/page.tsx",
      "src/app/admin/(console)/admissions/page.tsx"
    ]) {
      expect(read(file), file).toContain("showArchived");
    }
  });
});

describe("policy completeness", () => {
  it("explains every entity", () => {
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
