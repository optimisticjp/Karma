import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily, families } from "../src/content/courses";
import {
  EMCAD_DAHAO,
  EMCAD_DAHAO_SLUG,
  VERIFIED_COURSE_OPERATIONS
} from "../src/content/course-operations";
import { PHOTOGRAPHED_COURSE_SLUGS, coursePhotoFor } from "../src/content/photo-manifest";
import { TECHNIQUE_SIGNATURES } from "../src/components/ui/TechniqueSignature";
import { notesForCourse } from "../src/content/notes";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const indexPage = read("src/app/[locale]/courses/page.tsx");
const detailPage = read("src/app/[locale]/courses/[slug]/page.tsx");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The course index
 * ------------------------------------------------------------------ */

describe("the course index", () => {
  it("reads the same catalogue as the homepage, so the two cannot drift", () => {
    /* The PRESENTATIONS are now deliberately different — `/courses` is a
       ledger and the homepage is a rail of swatches, because the plan asks
       for each surface to be composed for what it carries rather than for
       one component to be reused everywhere.

       What must not diverge is the DATA. Both read `coursesByFamily`, so a
       course cannot exist on one and be missing from the other. */
    expect(indexPage).toContain("MachineIndex");
    expect(indexPage).toContain("coursesByFamily");
    expect(read("src/components/kds/home/SampleBook.tsx")).toContain("coursesByFamily");
    /* And the old hand-rolled catalogue row is gone. */
    expect(indexPage).not.toContain("course-row");
  });

  it("numbers all eleven continuously across the three families", () => {
    const total = (Object.keys(families) as Array<keyof typeof families>).reduce(
      (sum, key) => sum + courses.filter((c) => c.family === key).length,
      0
    );
    expect(total).toBe(11);
    expect(coursesByFamily).toHaveLength(11);
    /* Each family section starts where the previous one ended. */
    expect(indexPage).toContain("const startAt = counter + 1;");
    expect(indexPage).toContain("counter += list.length;");
  });

  it("heads a family with an icon, never with one course's signature", () => {
    /* A signature belongs to exactly one technique. Borrowing one to head nine
       courses would make the mark mean less than it does. */
    expect(indexPage).toContain("FAMILY_ICON");
    expect(indexPage).not.toContain("TechniqueSignature");
  });

  it("marks only facts, never an invented difficulty rating", () => {
    for (const cat of [en, gu]) {
      const cues = Object.keys(cat.coursesPage.cue);
      expect(cues.sort()).toEqual(["foundation", "leads"]);
    }
    const text = JSON.stringify(en.coursesPage).toLowerCase();
    for (const label of ["beginner", "intermediate", "advanced", "level 1", "easy", "hard"]) {
      expect(text, label).not.toContain(label);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Eight photographed, three signature-led, eleven covered
 * ------------------------------------------------------------------ */

describe("photography policy across the catalogue", () => {
  it("covers eight courses and leaves three without, deliberately", () => {
    expect(PHOTOGRAPHED_COURSE_SLUGS).toHaveLength(8);
    const uncovered = courses
      .map((c) => c.slug)
      .filter((slug) => !PHOTOGRAPHED_COURSE_SLUGS.includes(slug));
    expect(uncovered).toHaveLength(3);
    /* Not dropped from the catalogue, and not given someone else's photo. */
    for (const slug of uncovered) {
      expect(coursesByFamily.some((c) => c.slug === slug), slug).toBe(true);
      expect(coursePhotoFor(slug), slug).toBeUndefined();
    }
  });

  it("gives every course a technique signature, photographed or not", () => {
    for (const course of courses) {
      expect(TECHNIQUE_SIGNATURES[course.slug], course.slug).toBeDefined();
    }
    expect(detailPage).toContain("TechniqueSignature");
    /* This also asserted on <CourseCard>, which was deleted on 2026-08-31 when
       the related-courses grid became the Machine Index. The rule is unchanged
       and now has one home instead of two: every surface that lists a course
       leads with a photograph where the shoot covers it and the technique
       signature where it does not. */
    expect(read("src/components/courses/MachineIndex.tsx")).toContain("TechniqueSignature");
  });

  it("leads a card or a page with this course's own photograph, never another's", () => {
    for (const source of [detailPage, read("src/components/courses/MachineIndex.tsx")]) {
      expect(source).toContain("coursePhotoFor(course.slug)");
    }
  });

  it("captions every signature in both languages", () => {
    for (const cat of [en, gu]) {
      for (const course of courses) {
        const caption = cat.courseDetail.signatures[course.slug];
        expect(caption, course.slug).toBeTruthy();
        expect(caption.length, course.slug).toBeGreaterThan(30);
      }
    }
  });

  it("keeps the internal signature spec and the visitor-facing caption separate", () => {
    /* TECHNIQUE_SIGNATURES[].description is the English spec note the design
       system is written against; the caption a visitor reads comes from the
       message catalogue, so it is bilingual. */
    expect(detailPage).toContain("signatures.${course.slug}");
    expect(detailPage).not.toContain("signature.description");
  });
});

/* ------------------------------------------------------------------ *
 * One course's facts never become another's
 * ------------------------------------------------------------------ */

describe("the duration and fee policy", () => {
  it("has exactly one course with confirmed operational facts", () => {
    expect(VERIFIED_COURSE_OPERATIONS).toHaveLength(1);
    expect(VERIFIED_COURSE_OPERATIONS[0].slug).toBe(EMCAD_DAHAO_SLUG);
  });

  it("leaves the other ten with no duration in the catalogue data", () => {
    for (const course of courses) {
      if (course.slug === EMCAD_DAHAO_SLUG) continue;
      expect(course.durationMonths, course.slug).toBeNull();
      expect(course.durationWeeks, course.slug).toBeNull();
    }
  });

  it("renders operational facts only for a course that has them", () => {
    expect(detailPage).toContain("verifiedOperationsFor(course.slug)");
    expect(detailPage).toContain("{verified ? (");
  });

  it("says 'ask the studio' rather than guessing, for the ten", () => {
    for (const cat of [en, gu]) {
      expect(cat.courseDetail.confirmDuration.length).toBeGreaterThan(5);
      expect(cat.courseDetail.feeBody.length).toBeGreaterThan(20);
    }
  });

  it("keeps the EMCAD page the reference bar", () => {
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
    expect(EMCAD_DAHAO.fees.feeTotal).toBe(35_000);
    expect(EMCAD_DAHAO.operations.scheduleOptions).toHaveLength(4);
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.curriculum.length).toBeGreaterThanOrEqual(8);
    expect(EMCAD_DAHAO.operations.practical.length).toBeGreaterThanOrEqual(1);
  });

  it("offers no way to pay online from a course page", () => {
    const code = stripComments(detailPage).toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://", "pay now"]) {
      expect(code, provider).not.toContain(provider);
    }
  });
});

/* ------------------------------------------------------------------ *
 * No course reads as a duplicated template
 * ------------------------------------------------------------------ */

describe("every course page is specific", () => {
  it("gives each course its own produces line, faults and outputs", () => {
    const produces = courses.map((c) => c.production.producesEn);
    expect(new Set(produces).size).toBe(courses.length);

    const outputs = courses.map((c) => c.production.outputsEn.join("|"));
    expect(new Set(outputs).size).toBe(courses.length);

    const problems = courses.map((c) => c.production.problemsEn.join("|"));
    expect(new Set(problems).size).toBe(courses.length);
  });

  it("gives each course its own practice and machine description", () => {
    expect(new Set(courses.map((c) => c.production.practiceEn)).size).toBe(courses.length);
    expect(new Set(courses.map((c) => c.production.machineEn)).size).toBe(courses.length);
  });

  it("names a digitising package only where one is actually taught", () => {
    const withSoftware = courses.filter((c) => c.production.softwareEn);
    for (const course of withSoftware) {
      expect(course.production.softwareEn, course.slug).toContain("EMCAD DAHAO");
    }
    /* And never the package the institute's own rule says it does not teach. */
    expect(JSON.stringify(courses).toLowerCase()).not.toContain("wilcom");
  });

  it("links each course to the Machine Notes that answer its questions", () => {
    expect(detailPage).toContain("notesForCourse(course.slug)");
    const linked = courses.filter((c) => notesForCourse(c.slug).length > 0);
    expect(linked.length).toBeGreaterThanOrEqual(4);
  });
});

/* ------------------------------------------------------------------ *
 * Naming
 * ------------------------------------------------------------------ */

describe("the software is named in full on the surfaces this phase rebuilt", () => {
  it("says EMCAD DAHAO on the course index and its metadata", () => {
    for (const cat of [en, gu]) {
      expect(JSON.stringify(cat.coursesPage)).not.toContain("emCAD");
      expect(cat.meta.courses.description).not.toContain("emCAD");
      expect(cat.meta.home.description).not.toContain("emCAD");
    }
  });
});
