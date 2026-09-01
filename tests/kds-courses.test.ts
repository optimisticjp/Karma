import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily, families } from "../src/content/courses";
import { EMCAD_DAHAO_SLUG, verifiedOperationsFor } from "../src/content/course-operations";
import { STITCH_SWATCHES } from "../src/components/kds/StitchSwatch";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const code = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const DIR = "src/components/kds/courses";
const indexPage = read("src/app/[locale]/courses/page.tsx");
const detailPage = read("src/app/[locale]/courses/[slug]/page.tsx");
const catalogue = read(`${DIR}/CourseCatalogue.tsx`);
const facts = read(`${DIR}/CourseFacts.tsx`);
const floor = read(`${DIR}/CourseFloor.tsx`);
const nav = read(`${DIR}/CourseNav.tsx`);
const css = read("src/app/thread-machine-proof.css");

const blocks = readdirSync(DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => code(read(join(DIR, f))));

describe("the catalogue", () => {
  it("composes five blocks and no leftover page furniture", () => {
    for (const tag of ["CoursesIntro", "CourseCatalogue", "FamilyMap", "CoursePathway", "CtaBand"]) {
      expect(indexPage, tag).toContain(`<${tag}`);
    }
    for (const gone of ["PageIntro", "SectionHeading", "Ledger", "Reveal"]) {
      expect(indexPage, gone).not.toContain(gone);
    }
  });

  it("names every public course as a link, using the Console-filtered list", () => {
    const familyMap = read(`${DIR}/FamilyMap.tsx`);
    expect(indexPage).toContain("getPublicCourses()");
    expect(familyMap).toContain("courses.filter((course) => course.family === key)");
    expect(familyMap).toContain("/courses/${course.slug}");
  });

  it("gives a tile no fee, ever", () => {
    for (const source of [catalogue, read(`${DIR}/RelatedCourses.tsx`), read(`${DIR}/CourseHero.tsx`)]) {
      expect(source).not.toContain("feeTotal");
      expect(source).not.toContain("₹");
    }
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.coursesPage);
      expect(block).not.toContain("₹");
      expect(block).not.toContain("35,000");
    }
  });

  it("shows Console-managed duration only when a public course has one", () => {
    expect(catalogue).toContain("course.durationMonths");
    expect(catalogue).not.toContain("verifiedOperationsFor(course.slug)");
    const confirmed = courses.filter((c) => verifiedOperationsFor(c.slug)?.durationMonths);
    expect(confirmed.map((c) => c.slug)).toEqual([EMCAD_DAHAO_SLUG]);
  });

  it("keeps the media box identical whether a course is photographed or not", () => {
    const block = css.slice(css.indexOf(".kds .cat-media > .swatch,"));
    expect(block.slice(0, 200)).toContain("aspect-ratio: 4 / 3");
    expect(block.slice(0, 200)).toContain(".kds .cat-media > .mframe");
  });

  it("gives all eleven courses their own swatch", () => {
    for (const course of courses) {
      expect(STITCH_SWATCHES[course.slug], course.slug).toBeDefined();
    }
    expect(Object.keys(STITCH_SWATCHES).length).toBeGreaterThanOrEqual(courses.length);
  });

  it("filters with buttons that say what they are", () => {
    expect(catalogue).toContain('role="group"');
    expect(catalogue).toContain("aria-pressed=");
    expect(catalogue).not.toContain('role="tab"');
    const book = read("src/components/kds/home/SampleBook.tsx");
    expect(book).toContain("aria-pressed=");
    expect(book).not.toContain('role="tab"');
  });
});

describe("the course template", () => {
  const ORDER = [
    "CourseHero",
    "CourseNav",
    "CourseFacts",
    "CourseMake",
    "CourseFaults",
    "CourseFloor",
    "CourseSyllabus",
    "CourseBatches",
    "RelatedCourses",
    "CtaBand"
  ];

  it("renders its blocks in the order the decision is made", () => {
    const at = ORDER.map((tag) => detailPage.indexOf(`<${tag}`));
    expect(at.every((p) => p > -1)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("never puts two blocks with the same ground next to each other", () => {
    const GROUNDS = ["on-canvas", "on-paper", "on-cloth", "on-mist"] as const;
    const banded = ORDER.filter((tag) => tag !== "CourseNav" && tag !== "CtaBand").map((tag) => {
      const source = code(read(`${DIR}/${tag}.tsx`));
      const found = GROUNDS.filter((g) => source.includes(`${g}"`) || source.includes(`${g} `));
      expect(found.length, `${tag} declares exactly one ground`).toBe(1);
      return { tag, ground: found[0] };
    });
    for (let i = 1; i < banded.length; i += 1) {
      const pair = `${banded[i - 1].tag} → ${banded[i].tag}`;
      expect(banded[i - 1].ground === banded[i].ground, pair).toBe(false);
    }
    expect(new Set(banded.map((b) => b.ground)).size).toBe(4);
  });

  it("carries its own navigation, on a laptop only", () => {
    expect(nav).toContain('aria-label={t("navLabel")}');
    const rule = css.slice(css.indexOf(".kds .course-nav {"), css.indexOf(".kds .course-nav-link"));
    expect(rule).toContain("display: none");
    expect(rule).toContain("@media (min-width: 64rem)");
    expect(rule).toContain("position: sticky");
    expect(css).toContain("scroll-margin-top: calc(var(--header-h) + 3.5rem)");
  });

  it("keeps the contextual dock and carries the course into it", () => {
    expect(detailPage).toContain('<ActionDock surface="course"');
    expect(detailPage).toContain("demoHref={`/admission?course=${course.slug}`}");
  });

  it("still emits course and breadcrumb structured data, and no offer", () => {
    expect(detailPage).toContain("courseSchema(course, l)");
    expect(detailPage).toContain("breadcrumbSchema(");
    const schema = code(read("src/lib/schema.ts"));
    for (const banned of ["\"offers\"", "aggregateRating", "priceCurrency"]) {
      expect(schema, banned).not.toContain(banned);
    }
  });

  it("keeps the local-search description on every course", () => {
    expect(detailPage).toContain("Mota Varachha, Surat");
    expect(detailPage).toContain("મોટા વરાછા, સુરત");
  });
});

describe("course facts", () => {
  it("keeps current fee amounts off the public course page", () => {
    expect(facts).not.toContain("config.fees");
    expect(facts).not.toContain("FeeSheet");
    expect(en.courseDetail.feeNoGateway.toLowerCase()).toContain("no online payment");
    expect(en.courseDetail.feeNoGateway.toLowerCase()).toContain("no gateway");
    for (const cat of [en, gu]) {
      const ask = JSON.stringify([cat.courseDetail.feeAskTitle, cat.courseDetail.feeAskNote]);
      expect(ask).not.toMatch(/\d{2},\d{3}/);
    }
  });

  it("renders public operational figures from the Console but not fee figures", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.courseDetail) + JSON.stringify(cat.courseOps);
      for (const figure of ["35,000", "25,000", "10,000", "35000"]) {
        expect(block, figure).not.toContain(figure);
      }
    }
    expect(facts).not.toContain("money(fees.total)");
    expect(facts).not.toContain("money(fees.admission)");
    expect(facts).toContain("schedule.map((slot)");
  });

  it("offers no way to pay online from anywhere in the course tree", () => {
    const everything = blocks.join(" ").toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "paytm", "upi://", "pay now"]) {
      expect(everything, provider).not.toContain(provider);
    }
  });

  it("invents no machine specification", () => {
    const text = [...blocks, JSON.stringify(en.courseDetail), JSON.stringify(gu.courseDetail)]
      .join(" ")
      .toLowerCase();
    for (const spec of ["rpm", "stitches per minute", "spm", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
    expect(text).not.toMatch(/\d+\s*-?\s*(head|needle)s?\b/);
    expect(floor).toContain('pick(p, "machine", locale)');
  });

  it("publishes no week or month inside a syllabus module title", () => {
    const source = read("src/content/courses.ts");
    const titles = [...source.matchAll(/title(?:En|Gu): [`"]([^`"]*)[`"]/g)].map((m) => m[1]);
    expect(titles.length).toBeGreaterThanOrEqual(8);
    for (const title of titles) {
      expect(title.toLowerCase(), title).not.toMatch(/week|month|અઠવાડિયું|મહિન/);
    }
  });

  it("promises no earning, salary or placement on either surface", () => {
    const copy = (
      JSON.stringify(en.coursesPage) +
      JSON.stringify(gu.coursesPage) +
      JSON.stringify(en.courseDetail) +
      JSON.stringify(gu.courseDetail)
    ).toLowerCase();
    for (const banned of ["salary", "placement", "guaranteed job", "earn ₹"]) {
      expect(copy, banned).not.toContain(banned);
    }
  });

  it("names no other digitising package", () => {
    const everything = (
      blocks.join(" ") +
      JSON.stringify(en.coursesPage) +
      JSON.stringify(en.courseDetail)
    ).toLowerCase();
    expect(everything).not.toContain("wilcom");
  });

  it("names no trainer who has not been confirmed", () => {
    const everything = blocks.join(" ");
    expect(everything).not.toContain("trainers");
    expect(everything).not.toContain("sample-machine-trainer");
  });
});

describe("both languages", () => {
  it("resolves every locale through shared helpers, never a ternary", () => {
    for (const source of blocks) {
      expect(source).not.toMatch(/locale === "gu" \?/);
      expect(source).not.toMatch(/\bgu \?/);
    }
  });

  it("keeps the family names and course names bilingual at the source", () => {
    for (const key of Object.keys(families) as Array<keyof typeof families>) {
      expect(families[key].nameGu, key).toBeTruthy();
      expect(families[key].introGu, key).toBeTruthy();
    }
    for (const course of coursesByFamily) {
      expect(course.nameGu, course.slug).toBeTruthy();
      expect(course.production.producesGu, course.slug).toBeTruthy();
    }
  });
});
