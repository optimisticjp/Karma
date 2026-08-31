import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily, families } from "../src/content/courses";
import { EMCAD_DAHAO_SLUG, verifiedOperationsFor } from "../src/content/course-operations";
import { STITCH_SWATCHES } from "../src/components/kds/StitchSwatch";

/**
 * THE CATALOGUE AND THE COURSE TEMPLATE.
 *
 * `tests/machine-lab-courses.test.tsx` still holds the DATA rules — eleven
 * courses, eight photographed, one course with confirmed operations, no two
 * pages sharing a produces line. This suite holds the rules the rebuilt
 * COMPOSITION has to keep: what a tile may claim, what the template may
 * publish, and what neither may invent.
 */

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

/* ------------------------------------------------------------------ *
 * The catalogue
 * ------------------------------------------------------------------ */

describe("the catalogue", () => {
  it("composes five blocks and no leftover page furniture", () => {
    for (const tag of ["CoursesIntro", "CourseCatalogue", "FamilyMap", "CoursePathway", "CtaBand"]) {
      expect(indexPage, tag).toContain(`<${tag}`);
    }
    /* The old page's primitives are gone from this route, not hidden. */
    for (const gone of ["PageIntro", "SectionHeading", "Ledger", "Reveal"]) {
      expect(indexPage, gone).not.toContain(gone);
    }
  });

  it("names every course as a link, so the section is navigable as text", () => {
    /* The family map lists all eleven again, which is how somebody who would
       rather read than scan gets through the page — and how a crawler sees
       eleven internal links with real anchor text. */
    const familyMap = read(`${DIR}/FamilyMap.tsx`);
    expect(familyMap).toContain("coursesInFamily(key)");
    expect(familyMap).toContain("/courses/${course.slug}");
  });

  it("gives a tile no fee, ever", () => {
    for (const source of [
      catalogue,
      read(`${DIR}/RelatedCourses.tsx`),
      /* The hero states the confirmed facts and NOT the money: the fee has a
         block of its own where the payment terms can sit with it. */
      read(`${DIR}/CourseHero.tsx`)
    ]) {
      expect(source).not.toContain("feeTotal");
      expect(source).not.toContain("₹");
    }
    /* And no fee is typed into the catalogue page's copy either. */
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.coursesPage);
      expect(block).not.toContain("₹");
      expect(block).not.toContain("35,000");
    }
  });

  it("shows a duration only where the owner confirmed one", () => {
    expect(catalogue).toContain("verifiedOperationsFor(course.slug)");
    expect(catalogue).toContain("verified?.durationMonths");
    const confirmed = courses.filter((c) => verifiedOperationsFor(c.slug)?.durationMonths);
    expect(confirmed.map((c) => c.slug)).toEqual([EMCAD_DAHAO_SLUG]);
  });

  it("keeps the media box identical whether a course is photographed or not", () => {
    /* Otherwise the three courses the shoot does not cover become visibly
       second-class, and the grid moves when the eight photographs arrive. */
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
    /* Tab semantics promise a tabpanel the control owns and moves focus into.
       This narrows a list already on the page, so the honest roles are a group
       of toggle buttons with `aria-pressed`. */
    expect(catalogue).toContain('role="group"');
    expect(catalogue).toContain("aria-pressed=");
    expect(catalogue).not.toContain('role="tab"');
    /* The homepage sample book runs the same control and was corrected with
       it, so the two cannot drift apart in their semantics. */
    const book = read("src/components/kds/home/SampleBook.tsx");
    expect(book).toContain("aria-pressed=");
    expect(book).not.toContain('role="tab"');
  });
});

/* ------------------------------------------------------------------ *
 * The course template
 * ------------------------------------------------------------------ */

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
    /* On a phone a second sticky bar would compete with the header and the
       action dock for the same thumb. */
    expect(nav).toContain('aria-label={t("navLabel")}');
    const rule = css.slice(css.indexOf(".kds .course-nav {"), css.indexOf(".kds .course-nav-link"));
    expect(rule).toContain("display: none");
    expect(rule).toContain("@media (min-width: 64rem)");
    expect(rule).toContain("position: sticky");
    /* And a jumped-to heading never lands under the two sticky bars. */
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

/* ------------------------------------------------------------------ *
 * What neither surface may invent
 * ------------------------------------------------------------------ */

describe("course facts", () => {
  it("publishes a fee for exactly one course, and says so on the other ten", () => {
    expect(facts).toContain("verifiedOperationsFor(course.slug)");
    /* Both branches state that there is no way to pay online. */
    expect(en.courseDetail.feeNoGateway.toLowerCase()).toContain("no online payment");
    expect(en.courseDetail.feeNoGateway.toLowerCase()).toContain("no gateway");
    expect(en.courseOps.feeOffline.toLowerCase()).toContain("no online payment");
    /* And the honest branch does not quote a number nobody confirmed. */
    for (const cat of [en, gu]) {
      const ask = JSON.stringify([cat.courseDetail.feeAskTitle, cat.courseDetail.feeAskNote]);
      expect(ask).not.toMatch(/\d{2},\d{3}/);
    }
  });

  it("renders every published figure from the verified record", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.courseDetail) + JSON.stringify(cat.courseOps);
      for (const figure of ["35,000", "25,000", "10,000", "35000"]) {
        expect(block, figure).not.toContain(figure);
      }
    }
    expect(facts).toContain("verified.fees.feeTotal");
    expect(facts).toContain("verified.fees.feeAdmission");
    expect(facts).toContain("verified.operations.scheduleOptions");
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
    /* The machine is DESCRIBED — what it does and what it is for. */
    expect(floor).toContain('pick(p, "machine", locale)');
  });

  it("publishes no week or month inside a syllabus module title", () => {
    /* These titles used to read "Weeks 1-2" … "Final week", which published a
       seven-week duration for ten courses whose duration the owner has NOT
       confirmed — and contradicted the one course that has (three months). */
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
    /* The template used to carry a trainer card built from sample data. Real
       names, specialities and portraits go on when the owner supplies them —
       together with the photographs, not before. */
    const everything = blocks.join(" ");
    expect(everything).not.toContain("trainers");
    expect(everything).not.toContain("sample-machine-trainer");
  });
});

/* ------------------------------------------------------------------ *
 * Bilingual, structurally
 * ------------------------------------------------------------------ */

describe("both languages", () => {
  it("resolves every locale through pick(), never a ternary", () => {
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
