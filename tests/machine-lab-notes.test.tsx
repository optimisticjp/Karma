import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { machineNotes } from "../src/content/notes";
import { courseBySlug } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const index = read("src/app/[locale]/notes/page.tsx");
const article = read("src/app/[locale]/notes/[slug]/page.tsx");
/* The notation is CSS and copy now rather than a component; `<NoteSpec>` was
   deleted with the rebuild. */
const rows = read("src/components/kds/notes/NotesIndex.tsx");
const tmp = read("src/app/thread-machine-proof.css");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The ISSUE label is a label, not a new claim
 * ------------------------------------------------------------------ */

describe("the archive notation", () => {
  it("gives every note a short bilingual issue label", () => {
    for (const note of machineNotes) {
      expect(note.issueEn, note.slug).toBeTruthy();
      expect(note.issueGu, note.slug).toBeTruthy();
      /* Two or three words. A sentence here would be a second answer. */
      expect(note.issueEn.split(/\s+/).length, note.slug).toBeLessThanOrEqual(3);
    }
  });

  it("carries no measurement anywhere in the notation", () => {
    /* The archive earns its authority by being right about causes, not by
       printing numbers nobody supplied. */
    const notation = (
      stripComments(rows) +
      machineNotes.map((n) => `${n.issueEn} ${n.issueGu}`).join(" ")
    ).toLowerCase();
    for (const unit of ["rpm", "spm", "gsm", "mm", "stitches per", "%"]) {
      expect(notation, unit).not.toContain(unit);
    }
  });

  it("marks a row once, and with the mark that means 'current'", () => {
    /* One mark per row. The old spec block used a registration point for
       "precision / reference"; the rebuilt row uses the needle, which is the
       system's mark for the thing you are looking at. */
    expect((rows.match(/<NeedlePoint/g) ?? [])).toHaveLength(1);
    expect(rows).not.toContain("RegistrationPoint");
  });

  it("keeps the notation out of the prose", () => {
    /* The uppercase technical label belongs to the fault line and the index,
       never to the question or the answer a person reads. */
    const block = tmp.slice(tmp.indexOf(".kds .note-issue"));
    expect(block).toContain("color: var(--brand-accent-strong)");
    expect(rows).toContain('className="t-h4 mt-1 block"');
    expect(rows).toContain('className="t-meta note-answer mt-1 block"');
  });
});

/* ------------------------------------------------------------------ *
 * The archive stays inside the archive
 * ------------------------------------------------------------------ */

describe("the notation does not leak into the rest of the site", () => {
  it("keeps the fault notation on the notes surfaces and nowhere else", () => {
    /* `<NoteSpec>` was the component that carried it; the rebuilt archive
       carries it as `.note-issue` on the row and on the note's own page. The
       rule is the one it always was: at full strength here, and nowhere else.
       If the whole site looked like this, the notation would stop meaning
       "this is a record" and start meaning "this is how the brand
       decorates". */
    expect(read("src/components/kds/notes/NotesIndex.tsx")).toContain("note-issue");
    expect(article).toContain("note-issue");
    expect(article).toContain('t("issueLabel")');
    for (const page of [
      "src/app/[locale]/page.tsx",
      "src/app/[locale]/courses/page.tsx",
      "src/app/[locale]/courses/[slug]/page.tsx",
      "src/app/[locale]/about/page.tsx",
      "src/app/[locale]/contact/page.tsx"
    ]) {
      expect(read(page), page).not.toContain("note-issue");
    }
  });
});

/* ------------------------------------------------------------------ *
 * The index reads as an archive, not a reading list
 * ------------------------------------------------------------------ */

describe("the notes index", () => {
  it("shows the note number, the course and the fault on every row", () => {
    const rows = read("src/components/kds/notes/NotesIndex.tsx");
    expect(rows).toContain('String(i + 1).padStart(2, "0")');
    expect(rows).toContain('pick(note, "issue", locale)');
    /* The course is what the chips filter on, and every note carries one. */
    expect(rows).toContain("courseChips");
  });

  it("lets an operator find the note for the fault they are hitting", () => {
    /* Nobody browses machine notes; they arrive with a fault. The search
       matches the question, the fault label and the tags — not the whole
       answer, because a common word would then return everything. */
    const rows = read("src/components/kds/notes/NotesIndex.tsx");
    expect(rows).toContain("note.tags");
    expect(rows).not.toContain('pick(note, "answer", locale),\n      ...note.tags');
    expect(rows).toContain("searchEmpty");
  });

  it("is still not a blog", () => {
    const code = stripComments(index).toLowerCase();
    for (const blogism of ["publisheddate", "author", "readmore", "read more", "posted"]) {
      expect(code, blogism).not.toContain(blogism);
    }
  });

  it("numbers a note the same way on the index and on its own page", () => {
    expect(article).toContain("machineNotes.findIndex((n) => n.slug === note.slug) + 1");
  });
});

/* ------------------------------------------------------------------ *
 * The trade knowledge is unchanged
 * ------------------------------------------------------------------ */

describe("the notes themselves", () => {
  it("still ships every field in both languages", () => {
    for (const n of machineNotes) {
      for (const f of [
        "questionEn", "questionGu", "answerEn", "answerGu",
        "whyEn", "whyGu", "detailEn", "detailGu",
        "exampleEn", "exampleGu"
      ] as const) {
        expect(n[f].length, `${n.slug}.${f}`).toBeGreaterThan(20);
      }
      expect(n.checksEn.length, n.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("still points every note at a real course", () => {
    for (const n of machineNotes) {
      expect(courseBySlug(n.courseSlug), n.slug).toBeDefined();
    }
  });

  it("still teaches one digitising package and names no other", () => {
    const all = JSON.stringify(machineNotes).toLowerCase();
    expect(all).not.toContain("wilcom");
  });

  it("still names no person, client, statistic or promised result", () => {
    const bodies = machineNotes
      .map((n) => `${n.exampleEn} ${n.answerEn} ${n.whyEn} ${n.detailEn}`)
      .join(" ")
      .toLowerCase();
    for (const banned of [/\bour student\b/, /\bclient named\b/, /\bguarantee\b/, /\b\d+% of students\b/]) {
      expect(bodies, String(banned)).not.toMatch(banned);
    }
  });

  it("labels the issue row in both languages", () => {
    for (const cat of [en, gu]) {
      expect(cat.notesPage.issueLabel).toBeTruthy();
    }
  });
});
