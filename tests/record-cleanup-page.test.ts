import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deletableEntities } from "@/lib/admin/record-actions";

const source = readFileSync("src/app/admin/(console)/records/page.tsx", "utf8");

describe("record cleanup workspace", () => {
  it("lists every entity the permanent-delete policy allows", () => {
    for (const entity of deletableEntities()) {
      expect(source, entity).toContain(`case \"${entity}\": {`);
    }
  });

  it("does not expose security or immutable evidence tables", () => {
    for (const entity of ["staff", "staff_permission", "audit_log", "attendance_record", "attendance_correction"]) {
      expect(source).not.toContain(`case \"${entity}\": {`);
    }
  });

  it("derives visibility from the same permission policy as the destructive action", () => {
    expect(source).toContain("requireAdmin(\"/admin/records\")");
    expect(source).toContain('canPerform(subject, entity, "delete")');
    expect(source).toContain("deletableEntities()");
  });

  it("never deletes directly from the listing", () => {
    expect(source).toContain("/delete`}");
    expect(source).not.toContain("db.delete(");
    expect(source).not.toContain("tx.delete(");
  });
});
