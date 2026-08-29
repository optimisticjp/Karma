import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VERIFIED_CATALOG_ROWS } from "@/lib/admin/catalog-import";

const actionSource = readFileSync(
  "src/app/admin/(console)/courses/import/actions.ts",
  "utf8"
);

describe("verified course catalogue import", () => {
  it("projects exactly the eight verified Karma courses with unique slugs", () => {
    expect(VERIFIED_CATALOG_ROWS).toHaveLength(8);
    expect(new Set(VERIFIED_CATALOG_ROWS.map((course) => course.slug)).size).toBe(8);
    expect(VERIFIED_CATALOG_ROWS.map((course) => course.slug)).toEqual([
      "zardosi-machine-embroidery",
      "four-beads-machine-work",
      "sequence-work",
      "coding-cording-machine",
      "chain-multi-machine",
      "laser-work",
      "tufting",
      "emcad-embroidery-design"
    ]);
  });

  it("does not invent unconfirmed durations and keeps every imported course active", () => {
    expect(VERIFIED_CATALOG_ROWS.every((course) => course.durationWeeks == null)).toBe(true);
    expect(VERIFIED_CATALOG_ROWS.every((course) => course.active)).toBe(true);
    expect(VERIFIED_CATALOG_ROWS.map((course) => course.sortOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("is owner-only, idempotent by slug, and audits inserted courses", () => {
    expect(actionSource).toContain("authorizeAction({ ownerOnly: true })");
    expect(actionSource).toContain("onConflictDoNothing({ target: schema.courses.slug })");
    expect(actionSource).toContain("CATALOG_AUDIT_ACTIONS.courseCreated");
    expect(actionSource).toContain('reason: "verified Karma catalogue import"');
  });
});
