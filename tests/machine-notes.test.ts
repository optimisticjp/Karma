import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { machineNotes, noteBySlug, notesForCourse } from "../src/content/notes";
import { courses } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("machine notes are complete and bilingual", () => {
  it("ships between six and ten notes, as the brief asks", () => {
    expect(machineNotes.length).toBeGreaterThanOrEqual(6);
    expect(machineNotes.length).toBeLessThanOrEqual(10);
  });

  it("fills every field in both languages — no half-translated note ships", () => {
    for (const n of machineNotes) {
      for (const f of [
        "questionEn", "questionGu", "answerEn", "answerGu",
        "whyEn", "whyGu", "detailEn", "detailGu",
        "exampleEn", "exampleGu"
      ] as const) {
        expect(n[f].length, `${n.slug}.${f}`).toBeGreaterThan(20);
      }
      expect(n.checksEn.length).toBeGreaterThanOrEqual(3);
      expect(n.checksEn.length).toBe(n.checksGu.length);
    }
  });

  it("has unique slugs and points every note at a real course", () => {
    expect(new Set(machineNotes.map((n) => n.slug)).size).toBe(machineNotes.length);
    const slugs = new Set(courses.map((c) => c.slug));
    for (const n of machineNotes) expect(slugs.has(n.courseSlug), n.slug).toBe(true);
  });

  it("links both ways: note to course, and course back to note", () => {
    const note = machineNotes[0];
    expect(noteBySlug(note.slug)).toBe(note);
    expect(notesForCourse(note.courseSlug)).toContain(note);
    expect(read("src/app/[locale]/courses/[slug]/page.tsx")).toContain("notesForCourse");
  });
});

describe("notes claim nothing about a person", () => {
  it("names no student, client or trainer in any example", () => {
    const blob = JSON.stringify(machineNotes).toLowerCase();
    for (const word of ["ltd", "pvt", "our student", "one of our students", "®", "™"]) {
      expect(blob).not.toContain(word);
    }
  });

  it("promises no outcome, income or guarantee", () => {
    const blob = JSON.stringify(machineNotes).toLowerCase();
    for (const claim of ["guarantee", "guaranteed", "salary", "job placement", "₹"]) {
      expect(blob).not.toContain(claim);
    }
  });

  it("invents no video URL — media fields stay unset until the owner supplies one", () => {
    for (const n of machineNotes) {
      expect(n.reelUrl).toBeUndefined();
      expect(n.youtubeUrl).toBeUndefined();
      expect(n.thumbnail).toBeUndefined();
    }
  });

  it("emits TechArticle with no fabricated author or date", () => {
    const page = read("src/app/[locale]/notes/[slug]/page.tsx");
    expect(page).toContain('"@type": "TechArticle"');
    expect(page).not.toContain('"@type": "Person"');
    expect(page).not.toContain("datePublished");
    expect(page).not.toContain("author:");
  });
});

describe("notes are discoverable", () => {
  it("lists the index and every note in the sitemap", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain('"/notes"');
    expect(sitemap).toContain("machineNotes.map((n) => `/notes/${n.slug}`)");
  });

  it("covers the search themes the brief names, in the notes' own tags", () => {
    const tags = machineNotes.flatMap((n) => n.tags.map((t) => t.toLowerCase())).join(" | ");
    for (const theme of [
      "emcad classes surat",
      "wilcom embroidery training surat",
      "machine embroidery training surat",
      "embroidery design classes surat",
      "computerised embroidery design course",
      "beads and sequence training",
      "practical embroidery machine training"
    ]) {
      expect(tags, theme).toContain(theme);
    }
  });

  it("reaches the notes from the header and the footer", () => {
    expect(read("src/components/site/Header.tsx")).toContain('href: "/notes"');
    expect(read("src/components/site/Footer.tsx")).toContain('href="/notes"');
  });
});
