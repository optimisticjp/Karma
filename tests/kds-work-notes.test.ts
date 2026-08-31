import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { machineNotes } from "../src/content/notes";
import { machineCases } from "../src/content/collections";
import { photosInGroup } from "../src/content/photo-manifest";

/**
 * STUDENT WORK AND MACHINE NOTES.
 *
 * `tests/machine-lab-proof.test.tsx` still holds the archive's photography
 * rules and `tests/machine-lab-notes.test.tsx` still holds the notation and
 * no-blog rules. This suite asserts what the rebuilt COMPOSITIONS have to
 * keep, and the one thing both pages exist to protect: that nothing on either
 * of them claims something about a person that nobody has verified.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const code = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const workPage = read("src/app/[locale]/student-work/page.tsx");
const notesPage = read("src/app/[locale]/notes/page.tsx");
const notePage = read("src/app/[locale]/notes/[slug]/page.tsx");
const wall = read("src/components/kds/work/WorkWall.tsx");
const published = read("src/components/kds/work/PublishedWork.tsx");
const cases = read("src/components/kds/work/MachineCaseNotes.tsx");
const index = read("src/components/kds/notes/NotesIndex.tsx");

const blocks = [
  ...readdirSync("src/components/kds/work").map((f) =>
    code(read(join("src/components/kds/work", f)))
  ),
  ...readdirSync("src/components/kds/notes").map((f) =>
    code(read(join("src/components/kds/notes", f)))
  )
];

const ground = (file: string) => {
  const GROUNDS = ["on-canvas", "on-paper", "on-cloth", "on-mist"] as const;
  const source = code(read(file));
  const found = GROUNDS.filter((g) => source.includes(`${g}"`) || source.includes(`${g} `));
  expect(found.length, `${file} declares exactly one ground`).toBe(1);
  return found[0];
};

/* ------------------------------------------------------------------ *
 * Student work
 * ------------------------------------------------------------------ */

describe("student work", () => {
  it("composes the archive, the published feed, the case notes and a close", () => {
    for (const tag of ["WorkWall", "PublishedWork", "MachineCaseNotes", "CtaBand"]) {
      expect(workPage, tag).toContain(tag);
    }
    for (const gone of ["PageIntro", "SectionHeading", "MaterialWall", "WorkLedger"]) {
      expect(workPage, gone).not.toContain(gone);
    }
  });

  it("never puts two blocks with the same ground next to each other", () => {
    const grounds = [
      "src/components/kds/work/WorkWall.tsx",
      "src/components/kds/work/PublishedWork.tsx",
      "src/components/kds/work/MachineCaseNotes.tsx"
    ].map(ground);
    expect(new Set(grounds).size).toBe(grounds.length);
  });

  it("keeps the six reserved frames at their own ratios", () => {
    expect(photosInGroup("work")).toHaveLength(6);
    expect(wall).toContain('photosInGroup("work")');
    expect(wall).toContain("wall-masonry");
    /* No forced ratio: each frame asks the manifest for its own. */
    expect(wall).not.toContain("aspect-");
  });

  it("keeps the archive and the editable feed apart", () => {
    /* One is the studio's own shoot record with fixed slots; the other is a
       Content Desk feed carrying consent metadata. Merging them would make
       the shoot slots deletable from an admin screen, or strip the metadata
       that makes a published item publishable. */
    expect(wall).not.toContain("getPublicGallery");
    expect(published).toContain("ManagedGalleryItem");
    expect(published).toContain("g.sample ?");
    expect(published).toContain("SampleMark");
  });

  it("has an honest empty state for the feed rather than a borrowed image", () => {
    expect(published).toContain("publishedEmptyTitle");
    expect(en.workPage.publishedEmptyBody.toLowerCase()).toContain("stock");
    expect(en.workPage.publishedEmptyBody.toLowerCase()).toContain("consent");
  });
});

/* ------------------------------------------------------------------ *
 * The case notes
 * ------------------------------------------------------------------ */

describe("machine case notes", () => {
  it("carries no sample marker, because it claims nothing about a person", () => {
    /* Each is an ordinary production fault with its ordinary cause — trade
       knowledge that would be equally true in any unit in Surat, so there is
       nothing here for the owner to verify.

       Read what it RENDERS, not what its comment explains: the comment says
       "carries no sample marker", and that must not be the thing that fails
       the test banning the word. */
    expect(code(cases)).not.toContain("SampleMark");
    expect(code(cases)).not.toContain("sample");
    expect(JSON.stringify(machineCases)).not.toContain('"sample"');
  });

  it("keeps a fixed five-field schema", () => {
    expect(cases).toContain('["diagnosis", "change", "setting", "result"]');
    for (const c of machineCases) {
      for (const field of ["problemEn", "diagnosisEn", "changeEn", "settingEn", "resultEn"]) {
        expect((c as Record<string, unknown>)[field], `${c.slug}/${field}`).toBeTruthy();
      }
    }
  });

  it("names no person, client or student in any case", () => {
    const blob = JSON.stringify(machineCases).toLowerCase();
    for (const banned of ["our student", "one of our", "pvt", "ltd", "®", "™"]) {
      expect(blob, banned).not.toContain(banned);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The notes archive
 * ------------------------------------------------------------------ */

describe("the notes archive", () => {
  it("renders every note on the server and narrows client-side", () => {
    /* The controls are an enhancement, not a gate: with no JavaScript the
       complete archive is still on the page. */
    expect(notesPage).toContain("machineNotes.map");
    expect(index).toContain('useState("all")');
    expect(index).toContain('useState("")');
  });

  it("searches the question, the fault and the tags — not the answer", () => {
    /* Matching the whole answer makes a common word return every note. */
    const haystack = index.slice(index.indexOf("const haystack"), index.indexOf("return haystack"));
    expect(haystack).toContain('pick(note, "question", locale)');
    expect(haystack).toContain('pick(note, "issue", locale)');
    expect(haystack).toContain("note.tags");
    expect(haystack).not.toContain('"answer"');
  });

  it("filters by the taxonomy the notes actually carry", () => {
    expect(index).toContain("note.courseSlug");
    for (const note of machineNotes) {
      expect(note.courseSlug, note.slug).toBeTruthy();
    }
  });

  it("says how many notes are shown, for a reader who cannot see the list", () => {
    expect(index).toContain('aria-live="polite"');
    expect(index).toContain('t("count", { count: shown.length })');
  });

  it("is still not a blog", () => {
    const source = code(index + notesPage + notePage).toLowerCase();
    for (const blogism of ["publisheddate", "byline", "readmore", "read more", "posted on"]) {
      expect(source, blogism).not.toContain(blogism);
    }
  });
});

describe("a note page", () => {
  it("answers in the first screen, then explains", () => {
    const at = (needle: string) => notePage.indexOf(needle);
    expect(at("{answer}")).toBeGreaterThan(-1);
    expect(at("{answer}")).toBeLessThan(at('t("whyTitle")'));
    expect(at('t("whyTitle")')).toBeLessThan(at('t("detailTitle")'));
  });

  it("draws the checks as a seam, because the order is the method", () => {
    expect(notePage).toContain("pathway-step");
    expect(notePage).toContain('pickList(note, "checks", l)');
  });

  it("emits a reference article and never a person", () => {
    expect(notePage).toContain("noteSchema");
    const schema = code(read("src/lib/schema.ts"));
    expect(schema).toContain("TechArticle");
    expect(schema).not.toContain('"author"');
  });

  it("counts the hop from a note to its course", () => {
    /* The note-to-course hop is the conversion this content system exists to
       produce, so it is the one that is measured. */
    expect(notePage).toContain('event="note_course_click"');
  });
});

/* ------------------------------------------------------------------ *
 * What neither page may do
 * ------------------------------------------------------------------ */

describe("both pages", () => {
  it("attach no name, outcome or earning to anything", () => {
    const text = (
      JSON.stringify(en.workPage) +
      JSON.stringify(gu.workPage) +
      JSON.stringify(en.notesPage) +
      JSON.stringify(gu.notesPage) +
      blocks.join(" ")
    ).toLowerCase();
    /* Word boundaries, not substrings: "replaced" contains "placed", and a
       test that fails on the word "replaced" teaches the next session to
       reword honest copy instead of keeping the rule. */
    for (const banned of [/\bsalary\b/, /\bearnings?\b/, /\bplaced\b/, /\bincome\b/, /₹/]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });

  it("invent no machine specification", () => {
    const text = (blocks.join(" ") + JSON.stringify(en.notesPage)).toLowerCase();
    for (const spec of ["rpm", "spm", "stitches per minute", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
  });

  it("resolve every locale through pick(), never a ternary", () => {
    for (const source of [...blocks, code(workPage), code(notesPage), code(notePage)]) {
      expect(source).not.toMatch(/locale === "gu" \?/);
      expect(source).not.toMatch(/\bgu \? /);
    }
  });
});
