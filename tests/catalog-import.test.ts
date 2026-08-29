import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VERIFIED_CATALOG_ROWS } from "@/lib/admin/catalog-import";
import { GALLERY_TECHNIQUES } from "@/lib/admin/content";
import { techniqueChips } from "@/content/collections";
import { COURSE_DISPLAY_ORDER, courses, coursesByFamily } from "@/content/courses";

const actionSource = readFileSync(
  "src/app/admin/(console)/courses/import/actions.ts",
  "utf8"
);

describe("verified course catalogue import", () => {
  /**
   * The first eight came from the studio's YouTube bio. Flat Embroidery,
   * Appliqué & 3D and Cross Stitch were added after the owner confirmed they
   * are taught (2026-08-29).
   *
   * The slug order is asserted exactly on purpose: `sortOrder` is derived from
   * array position and the import upserts with `onConflictDoNothing`, so
   * REORDERING this list would leave already-imported rows on stale sort
   * positions that collide with the new ones. New courses must be appended.
   */
  it("projects every verified Karma course, in a stable appended order", () => {
    expect(VERIFIED_CATALOG_ROWS).toHaveLength(11);
    expect(new Set(VERIFIED_CATALOG_ROWS.map((course) => course.slug)).size).toBe(11);
    expect(VERIFIED_CATALOG_ROWS.map((course) => course.slug)).toEqual([
      "zardosi-machine-embroidery",
      "four-beads-machine-work",
      "sequence-work",
      "coding-cording-machine",
      "chain-multi-machine",
      "laser-work",
      "tufting",
      "emcad-embroidery-design",
      "flat-embroidery",
      "applique-3d-embroidery",
      "cross-stitch"
    ]);
  });

  it("does not invent unconfirmed durations and keeps every imported course active", () => {
    expect(VERIFIED_CATALOG_ROWS.every((course) => course.durationWeeks == null)).toBe(true);
    expect(VERIFIED_CATALOG_ROWS.every((course) => course.active)).toBe(true);
    expect(VERIFIED_CATALOG_ROWS.map((course) => course.sortOrder)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]);
  });

  it("is owner-only, idempotent by slug, and audits inserted courses", () => {
    expect(actionSource).toContain("authorizeAction({ ownerOnly: true })");
    expect(actionSource).toContain("onConflictDoNothing({ target: schema.courses.slug })");
    expect(actionSource).toContain("CATALOG_AUDIT_ACTIONS.courseCreated");
    expect(actionSource).toContain('reason: "verified Karma catalogue import"');
  });
});

describe("gallery technique taxonomy", () => {
  it("gives every selectable technique a public bilingual label", () => {
    // `chain` was selectable in Content Desk but had no entry here, so a
    // published chain piece rendered a blank chip on the public gallery.
    for (const technique of GALLERY_TECHNIQUES) {
      const chip = techniqueChips[technique];
      expect(chip, `missing chip for "${technique}"`).toBeTruthy();
      expect(chip.labelEn, `missing English label for "${technique}"`).toBeTruthy();
      expect(chip.labelGu, `missing Gujarati label for "${technique}"`).toBeTruthy();
    }
  });
});

describe("course display order", () => {
  it("covers every course exactly once", () => {
    expect([...COURSE_DISPLAY_ORDER].sort()).toEqual(courses.map((c) => c.slug).sort());
    expect(new Set(COURSE_DISPLAY_ORDER).size).toBe(courses.length);
  });

  it("keeps Zardosi leading and the foundation course right behind it", () => {
    // Owner decision, 2026-08-29. Presentation only: storage order, and so the
    // sortOrder the catalogue import writes, is deliberately untouched by this.
    expect(coursesByFamily[0].slug).toBe("zardosi-machine-embroidery");
    expect(coursesByFamily[1].slug).toBe("flat-embroidery");
  });

  it("still groups families in order and leaves storage order alone", () => {
    expect(coursesByFamily.map((c) => c.family)).toEqual([
      ...Array(8).fill("machine"),
      "modern",
      "modern",
      "software"
    ]);
    expect(courses[0].slug).toBe("zardosi-machine-embroidery");
    expect(courses[courses.length - 1].slug).toBe("cross-stitch");
  });
});
