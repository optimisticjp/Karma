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
const spec = read("src/components/notes/NoteSpec.tsx");
const css = read("src/app/machine-lab.css");

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
      stripComments(spec) +
      machineNotes.map((n) => `${n.issueEn} ${n.issueGu}`).join(" ")
    ).toLowerCase();
    for (const unit of ["rpm", "spm", "gsm", "mm", "stitches per", "%"]) {
      expect(notation, unit).not.toContain(unit);
    }
  });

  it("marks the issue row with a registration point and nothing else", () => {
    /* Precision / reference — the mark's one meaning. One per note header. */
    expect(spec).toContain("RegistrationPoint");
    expect((spec.match(/<RegistrationPoint/g) ?? [])).toHaveLength(1);
  });

  it("keeps the mono notation out of the prose", () => {
    /* Mono is for the notation around a note, never for the body inside it. */
    const noteCss = css.slice(css.indexOf(".note-spec-id {"));
    expect(noteCss).toContain(".note-archive-question");
    expect(noteCss.slice(noteCss.indexOf(".note-archive-question"))).toContain(
      "font-family: var(--font-display)"
    );
    expect(noteCss).not.toContain(".note-archive-answer {\n  font-family: var(--font-mono)");
  });
});

/* ------------------------------------------------------------------ *
 * The archive stays inside the archive
 * ------------------------------------------------------------------ */

describe("the notation does not leak into the rest of the site", () => {
  it("uses NoteSpec only on the notes surfaces", () => {
    expect(index).toContain("NoteSpec");
    expect(article).toContain("NoteSpec");
    for (const page of [
      "src/app/[locale]/page.tsx",
      "src/app/[locale]/courses/page.tsx",
      "src/app/[locale]/courses/[slug]/page.tsx",
      "src/app/[locale]/about/page.tsx",
      "src/app/[locale]/contact/page.tsx"
    ]) {
      expect(read(page), page).not.toContain("NoteSpec");
    }
  });
});

/* ------------------------------------------------------------------ *
 * The index reads as an archive, not a reading list
 * ------------------------------------------------------------------ */

describe("the notes index", () => {
  it("shows the note number, the technique and the fault on every row", () => {
    expect(index).toContain("index={i + 1}");
    expect(index).toContain("technique=");
    expect(index).toContain("issue={gu ? n.issueGu : n.issueEn}");
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
