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
import { STITCH_SWATCHES } from "../src/components/kds/StitchSwatch";
import { notesForCourse } from "../src/content/notes";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const indexPage = read("src/app/[locale]/courses/page.tsx");
const detailPage = read("src/app/[locale]/courses/[slug]/page.tsx");
/* The pages became compositions of blocks in the THREAD / MACHINE / PROOF
   rebuild, so the rules below follow the block that renders them. Every rule
   is the one it always was; only its address changed. */
const catalogue = read("src/components/kds/courses/CourseCatalogue.tsx");
const familyMap = read("src/components/kds/courses/FamilyMap.tsx");
const courseHero = read("src/components/kds/courses/CourseHero.tsx");
const courseFacts = read("src/components/kds/courses/CourseFacts.tsx");
const related = read("src/components/kds/courses/RelatedCourses.tsx");

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
    expect(indexPage).toContain("CourseCatalogue");
    expect(catalogue).toContain("coursesByFamily");
    expect(read("src/components/kds/home/SampleBook.tsx")).toContain("coursesByFamily");
    /* And the old hand-rolled catalogue row is gone. */
    expect(indexPage).not.toContain("course-row");
  });

  it("shows all eleven in one list before any filter is touched", () => {
    const total = (Object.keys(families) as Array<keyof typeof families>).reduce(
      (sum, key) => sum + courses.filter((c) => c.family === key).length,
      0
    );
    expect(total).toBe(11);
    expect(coursesByFamily).toHaveLength(11);
    /* The catalogue used to be three family sections with a running number.
       It is one filterable grid now, and the rule that survives is the one
       that mattered: nothing is hidden behind the filter by default, and
       nobody may quietly truncate the list. */
    expect(catalogue).toContain('useState<FamilyKey | "all">("all")');
    expect(catalogue).not.toContain(".slice(");
  });

  it("heads a family with no course's own mark", () => {
    /* A signature or a swatch belongs to exactly one technique, and borrowing
       one to head eight courses would make the mark mean less than it does.
       A family is not a technique, so the family map carries neither. */
    expect(familyMap).not.toContain("TechniqueSignature");
    expect(familyMap).not.toContain("StitchSwatch");
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
      expect(STITCH_SWATCHES[course.slug], course.slug).toBeDefined();
    }
    /* The mark a course leads with on the rebuilt surfaces is its STITCH
       SWATCH — the signatures survive on `/about`, `/services` and the notes.
       The rule is the one it always was: every surface that lists a course
       leads with a photograph where the shoot covers it and the course's own
       mark where it does not, in the same box at the same size. */
    for (const source of [catalogue, related]) {
      expect(source).toContain("PhotoFrame");
      expect(source).toContain("StitchSwatch");
    }
    expect(courseHero).toContain("StitchSwatch");
  });

  it("leads a card or a page with this course's own photograph, never another's", () => {
    for (const source of [courseHero, catalogue, related]) {
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
    /* STITCH_SWATCHES[].description is the English spec note the design
       system is written against; the caption a visitor reads comes from the
       message catalogue, so it is bilingual. */
    expect(courseHero).toContain("signatures.${course.slug}");
    expect(courseHero).not.toContain("signature.description");
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
    expect(courseFacts).toContain("verifiedOperationsFor(course.slug)");
    expect(courseFacts).toContain("{verified ? (");
    expect(courseHero).toContain("verifiedOperationsFor(course.slug)");
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
    const code = stripComments(detailPage + courseFacts + courseHero).toLowerCase();
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
    expect(read("src/components/kds/courses/CourseBatches.tsx")).toContain(
      "notesForCourse(course.slug)"
    );
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
