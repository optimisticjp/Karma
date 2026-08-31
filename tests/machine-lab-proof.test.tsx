import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { photosInGroup } from "../src/content/photo-manifest";
import { trainers, machineCases, stories } from "../src/content/collections";
import { courses } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const wall = read("src/components/kds/work/WorkWall.tsx");
const workPage = read("src/app/[locale]/student-work/page.tsx");
const storiesPage = read("src/app/[locale]/success-stories/page.tsx");
const storyCase = read("src/components/site/StoryCase.tsx");
const trainerProfile = read("src/components/site/TrainerProfile.tsx");
const aboutPage = read("src/app/[locale]/about/page.tsx");
const css = read("src/app/machine-lab.css");

/**
 * Policy tests read what a surface RENDERS, not what a comment explains. The
 * comment on <MaterialWall> says it never captions a frame with a student's
 * earning — which must not be the thing that fails the test banning the word.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The material archive
 * ------------------------------------------------------------------ */

describe("the material wall", () => {
  it("draws the archive and the homepage wall from the same six slots", () => {
    /* The ARRANGEMENTS differ on purpose — the archive is a material wall and
       the homepage is a bento anchored by the studio panorama — but both are
       the manifest's six work photographs and neither invents a seventh. */
    expect(workPage).toContain("WorkWall");
    expect(read("src/components/kds/home/ProofWall.tsx")).toContain('photosInGroup("work")');
    expect(read("src/components/kds/work/WorkWall.tsx")).toContain('photosInGroup("work")');
  });

  it("uses the six work slots and lets each keep its own shape", () => {
    expect(photosInGroup("work")).toHaveLength(6);
    expect(wall).toContain('photosInGroup("work")');
    /* No forced ratio: each frame asks the manifest for its own. */
    expect(wall).not.toContain("aspect-");
  });

  it("adds no per-frame decoration of its own", () => {
    /* The old wall singled ONE frame out with a registration mark, because a
       mark that appears on every image means nothing at all. The rebuilt frame
       settles it in the system instead: the two hairline registration ticks
       are drawn once, in CSS, as part of `.mframe` — so a caller cannot
       sprinkle them, and the wall carries no mark of its own. */
    expect(wall).not.toContain("RegistrationPoint");
    expect(wall).not.toContain("StitchMark");
    expect((wall.match(/<PhotoFrame/g) ?? []).length).toBeGreaterThan(0);
    const css = read("src/app/thread-machine-proof.css");
    expect((css.match(/\.kds \.mframe::after \{/g) ?? [])).toHaveLength(1);
  });

  it("keeps the reserved slots and the editable feed as two different things", () => {
    /* One is the studio's own shoot record; the other is a Content Desk feed
       carrying consent metadata. Merging them would lose one or the other. */
    expect(workPage).toContain("WorkWall");
    expect(workPage).toContain("PublishedWork");
    expect(wall).not.toContain("getPublicGallery");
    expect(read("src/components/kds/work/PublishedWork.tsx")).toContain("ManagedGalleryItem");
  });

  it("attaches no name, outcome or earning to a reserved frame", () => {
    const text = (JSON.stringify(en.workPage) + stripComments(wall)).toLowerCase();
    /* Word boundaries, not substrings: "replaced" contains "placed", and a
       test that fails on the word "replaced" teaches the next session to
       reword honest copy instead of keeping the rule. */
    for (const banned of [/\bsalary\b/, /\bearnings?\b/, /\bplaced\b/, /\bincome\b/, /₹/]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });
});

/* ------------------------------------------------------------------ *
 * BEFORE → LEARNED → NOW
 * ------------------------------------------------------------------ */

describe("the story grammar", () => {
  it("uses the three-step arc", () => {
    for (const cat of [en, gu]) {
      for (const key of ["before", "learned", "now"]) {
        expect(cat.proof.stories[key], key).toBeTruthy();
      }
    }
    expect(storyCase).toContain('t("before")');
    expect(storyCase).toContain('t("learned")');
    expect(storyCase).toContain('t("now")');
  });

  it("draws the arc on one stitch path with the brand geometry", () => {
    const block = css.slice(css.indexOf(".story-arc-steps::before"));
    expect(block).toContain("var(--color-vermilion) 0 9px, transparent 9px 15px");
    expect(block).toContain("background-size: 5px 15px, 2px 15px");
  });

  it("ends the arc on a knot, which is the mark for completion", () => {
    expect(storyCase).toContain("KnotPoint");
    expect(storyCase).toContain("i === steps.length - 1");
  });

  it("survives a story that has no LEARNED field", () => {
    /* A Content Desk story may not have filled it in. The arc drops the step
       rather than rendering an empty one. */
    expect(storyCase).toContain("filter(([, v]) => Boolean(v))");
  });

  it("claims no earning, salary or placement in any story's content", () => {
    /* Scoped to the STORY DATA and the component that renders it — not to the
       page's framing copy, which legitimately contains the sentence "none of
       them claims an income, a job or a placement". A test that fails on an
       honest disclaimer teaches the next session to delete the disclaimer. */
    const text = (
      JSON.stringify(stories) +
      JSON.stringify(en.proof.stories) +
      JSON.stringify(gu.proof.stories) +
      stripComments(storyCase)
    ).toLowerCase();
    /* Ban the CLAIM, not the trade word. "Placement, tack-down and cover
       stitching" is appliqué vocabulary and belongs in a story about what
       someone learned; "job placement" is a promise nobody here may make. */
    for (const banned of [
      /\bsalary\b/,
      /\bearnings?\b/,
      /\blakh\b/,
      /\bjob placement\b/,
      /\bplacement (guarantee|assistance|record|rate|support)\b/,
      /\b100% placement\b/,
      /\bjob guarantee\b/,
      /₹/
    ]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });

  it("says out loud that the samples claim no income, job or placement", () => {
    expect(en.storiesPage.sampleBody.toLowerCase()).toContain("claims an income");
    expect(gu.storiesPage.sampleBody.length).toBeGreaterThan(60);
  });
});

/* ------------------------------------------------------------------ *
 * Reserved portraits — frames, never people
 * ------------------------------------------------------------------ */

describe("reserved portraits", () => {
  it("holds the two story slots without a name on them", () => {
    expect(photosInGroup("story")).toHaveLength(2);
    expect(storiesPage).toContain('photosInGroup("story")');
    expect(en.storiesPage.portraitsNote.toLowerCase()).toContain("consent");
  });

  it("maps trainer portraits by slug, never by list position", () => {
    expect(trainerProfile).toContain("PORTRAIT_SLOT[trainer.slug]");
    expect(trainerProfile).not.toMatch(/PORTRAIT_SLOT\[\s*index/);
    /* A profile with no mapping keeps its own label rather than borrowing a
       frame briefed for someone else. */
    expect(trainerProfile).toContain("PhotoSlot label={trainer.photoLabel}");
  });

  it("maps only to trainer slots that exist", () => {
    const trainerSlots = photosInGroup("trainer").map((s) => s.id);
    for (const match of trainerProfile.matchAll(/"(T\d_[A-Z_]+)"/g)) {
      expect(trainerSlots, match[1]).toContain(match[1]);
    }
  });

  it("still publishes no Person structured data for an unconfirmed trainer", () => {
    expect(trainers.every((tr) => tr.sample)).toBe(true);
    const schema = read("src/lib/schema.ts");
    expect(schema).not.toContain('"@type": "Person"');
  });
});

/* ------------------------------------------------------------------ *
 * The studio, and the machine wall
 * ------------------------------------------------------------------ */

describe("studio and technique proof", () => {
  it("gives each of the eleven techniques its own mark on /about", () => {
    /* Three shared family swatches told a visitor which bucket a course sat
       in; eleven signatures tell them what the stitch does. */
    expect(aboutPage).toContain("TechniqueSignature");
    expect(aboutPage).not.toContain("TechniquePlate");
    expect(courses).toHaveLength(11);
  });

  it("shows the floor and the entrance as evidence of a real place", () => {
    expect(aboutPage).toContain("F1_STUDIO_FLOOR_WIDE");
    expect(aboutPage).toContain("A2_ENTRANCE_SIGNBOARD");
  });

  it("invents no machine specification on any proof surface", () => {
    const text = [
      JSON.stringify(en.aboutPage),
      JSON.stringify(gu.aboutPage),
      JSON.stringify(en.workPage)
    ]
      .join(" ")
      .toLowerCase();
    for (const spec of ["rpm", "stitches per minute", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
    expect(text).not.toMatch(/\d+\s*-?\s*(head|needle)s?\b/);
    expect(en.aboutPage.placeNote.toLowerCase()).toContain("head counts");
  });

  it("keeps the machine case notes as trade facts with no sample flag", () => {
    expect(machineCases.length).toBeGreaterThanOrEqual(4);
    for (const c of machineCases) {
      expect(c, c.slug).not.toHaveProperty("sample");
      expect(c.diagnosisEn.length, c.slug).toBeGreaterThan(20);
      expect(c.settingEn.length, c.slug).toBeGreaterThan(10);
    }
  });
});
