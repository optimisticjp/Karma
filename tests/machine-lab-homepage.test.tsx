import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily } from "../src/content/courses";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG } from "../src/content/course-operations";
import { PHOTOGRAPHED_COURSE_SLUGS, photosInGroup } from "../src/content/photo-manifest";
import { TECHNIQUE_SIGNATURES } from "../src/components/ui/TechniqueSignature";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const home = read("src/app/[locale]/page.tsx");
const emcadSource = read("src/components/home/EmcadDecision.tsx");
const indexSource = read("src/components/courses/MachineIndex.tsx");
const wallSource = read("src/components/home/StudentWorkWall.tsx");
const studioSource = read("src/components/home/WhereYouLearn.tsx");
const trainersSource = read("src/components/home/Trainers.tsx");
const css = read("src/app/machine-lab.css");

/**
 * Policy tests read what the page RENDERS, not what a comment explains. A
 * doc comment saying "no RPM, ever" must not fail the test that bans RPM.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const orderOf = (...tags: string[]) => tags.map((tag) => home.indexOf(`<${tag} />`));
const isAscending = (xs: number[]) => xs.every((x, i) => i === 0 || (x > xs[i - 1] && x > -1));

/* ------------------------------------------------------------------ *
 * The 30-second decision, in the order people actually ask
 * ------------------------------------------------------------------ */

describe("homepage architecture", () => {
  it("answers the questions in order", () => {
    const sequence = orderOf(
      "Hero",
      "TrustRail",
      "ProductionRailSection",
      "ProductionWorkflow",
      "CourseCatalogue",
      "ProblemsSolved",
      "MachineProof",
      "EmcadDecision",
      "Investment",
      "BatchesTeaser",
      "StudentWorkWall",
      "Trainers",
      "WhereYouLearn",
      "HomeFaq",
      "BusinessBand",
      "CtaBand"
    );
    expect(isAscending(sequence)).toBe(true);
  });

  it("never runs two dark bands together", () => {
    /* A dark surface is punctuation. Two in a row is wallpaper. */
    const sections: Array<[string, string]> = [
      ["Hero", "src/components/home/Hero.tsx"],
      ["TrustRail", "src/components/home/TrustRail.tsx"],
      ["ProductionRailSection", "src/components/home/ProductionRailSection.tsx"],
      ["ProductionWorkflow", "src/components/home/ProductionWorkflow.tsx"],
      ["CourseCatalogue", "src/components/home/CourseCatalogue.tsx"],
      ["ProblemsSolved", "src/components/home/ProblemsSolved.tsx"],
      ["MachineProof", "src/components/home/MachineProof.tsx"],
      ["EmcadDecision", "src/components/home/EmcadDecision.tsx"],
      ["Investment", "src/components/home/Investment.tsx"],
      ["BatchesTeaser", "src/components/home/BatchesTeaser.tsx"],
      ["StudentWorkWall", "src/components/home/StudentWorkWall.tsx"],
      ["Trainers", "src/components/home/Trainers.tsx"],
      ["WhereYouLearn", "src/components/home/WhereYouLearn.tsx"],
      ["LatestVideos", "src/components/home/LatestVideos.tsx"],
      ["Reviews", "src/components/home/Reviews.tsx"],
      ["VisitStudio", "src/components/home/VisitStudio.tsx"],
      ["HomeFaq", "src/components/home/HomeFaq.tsx"],
      ["BusinessBand", "src/components/home/BusinessBand.tsx"],
      ["CtaBand", "src/components/home/CtaBand.tsx"]
    ];
    /* Order them as the page renders them, then look for adjacent darks. */
    const rendered = sections
      .filter(([tag]) => home.includes(`<${tag} />`))
      .sort((a, b) => home.indexOf(`<${a[0]} />`) - home.indexOf(`<${b[0]} />`))
      .map(([tag, file]) => ({ tag, dark: read(file).includes("on-carbon") }));

    expect(rendered.length).toBeGreaterThan(12);
    for (let i = 1; i < rendered.length; i += 1) {
      const pair = `${rendered[i - 1].tag} → ${rendered[i].tag}`;
      expect(rendered[i - 1].dark && rendered[i].dark, pair).toBe(false);
    }
  });

  it("uses no endless card grid for the catalogue", () => {
    const catalogue = read("src/components/home/CourseCatalogue.tsx");
    expect(catalogue).toContain("MachineIndex");
    expect(catalogue).not.toContain("card-lift");
  });
});

/* ------------------------------------------------------------------ *
 * The Machine Index
 * ------------------------------------------------------------------ */

describe("the Machine Index", () => {
  it("lists all eleven courses, not a curated selection", () => {
    expect(coursesByFamily).toHaveLength(11);
    expect(coursesByFamily).toHaveLength(courses.length);
    expect(read("src/components/home/CourseCatalogue.tsx")).toContain(
      "courses={coursesByFamily}"
    );
  });

  it("leads with a photograph where the shoot covers a course, a signature where it does not", () => {
    expect(indexSource).toContain("coursePhotoFor");
    expect(indexSource).toContain("TechniqueSignature");
    /* Eight photographed, three signature-led, eleven covered. */
    expect(PHOTOGRAPHED_COURSE_SLUGS).toHaveLength(8);
    const signatureLed = courses
      .map((c) => c.slug)
      .filter((slug) => !PHOTOGRAPHED_COURSE_SLUGS.includes(slug));
    expect(signatureLed).toHaveLength(3);
    for (const slug of signatureLed) {
      expect(TECHNIQUE_SIGNATURES[slug], slug).toBeDefined();
    }
  });

  it("shows a duration only where the owner confirmed one", () => {
    expect(indexSource).toContain("verifiedOperationsFor");
    /* Today that is EMCAD DAHAO and nothing else. */
    const confirmed = courses.filter((c) => c.slug === EMCAD_DAHAO_SLUG);
    expect(confirmed).toHaveLength(1);
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
  });

  it("puts no fee on a catalogue row", () => {
    expect(indexSource).not.toContain("feeTotal");
    expect(indexSource).not.toContain("₹");
  });

  it("renders every row at the same size whether it has a photograph or not", () => {
    /* Otherwise the three signature-led courses become visibly second-class,
       and the layout moves when the eight photographs arrive. */
    const block = css.slice(css.indexOf(".mi-photo,"), css.indexOf(".mi-body {"));
    expect(block).toContain("width: 100%");
  });
});

/* ------------------------------------------------------------------ *
 * The EMCAD DAHAO decision block
 * ------------------------------------------------------------------ */

describe("the EMCAD DAHAO decision block", () => {
  it("reads every figure from the verified record, not from a message", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.emcad);
      expect(block).not.toContain("35,000");
      expect(block).not.toContain("25,000");
      expect(block).not.toContain("10,000");
      expect(block).not.toContain("35000");
      /* The duration is rendered too — the catalogue holds only labels. */
      expect(block).not.toMatch(/\b3 months\b/);
    }
    expect(emcadSource).toContain("EMCAD_DAHAO");
    expect(emcadSource).toContain("fees.feeTotal");
    expect(emcadSource).toContain("fees.feeAdmission");
    expect(emcadSource).toContain("fees.feeBalanceDueDays");
    expect(emcadSource).toContain("operations.scheduleOptions");
  });

  it("states the fee split the studio actually confirmed", () => {
    expect(EMCAD_DAHAO.fees.feeTotal).toBe(35_000);
    expect(EMCAD_DAHAO.fees.feeAdmission).toBe(25_000);
    expect(EMCAD_DAHAO.fees.feeTotal - EMCAD_DAHAO.fees.feeAdmission).toBe(10_000);
    expect(EMCAD_DAHAO.fees.feeBalanceDueDays).toBe(30);
  });

  it("shows the four batch timings and the two-day demo", () => {
    expect(EMCAD_DAHAO.operations.scheduleOptions).toHaveLength(4);
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.hours).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.free).toBe(true);
  });

  it("offers no way to pay online, and says so", () => {
    const code = emcadSource.toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://", "pay now"]) {
      expect(code, provider).not.toContain(provider);
    }
    expect(en.home.emcad.offline.toLowerCase()).toContain("no online payment");
    expect(en.home.emcad.offline.toLowerCase()).toContain("no gateway");
  });

  it("names the one course these facts belong to, in both languages", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.emcad.h2).toContain("EMCAD DAHAO");
      /* And says out loud that they do not travel to the other ten. */
      expect(cat.home.emcad.sub.length).toBeGreaterThan(60);
    }
    expect(en.home.emcad.sub.toLowerCase()).toContain("other ten");
    expect(emcadSource).toContain("EMCAD_DAHAO_SLUG");
  });
});

/* ------------------------------------------------------------------ *
 * Proof surfaces: the material wall, the studio, the trainers
 * ------------------------------------------------------------------ */

describe("the material wall", () => {
  it("uses the six work slots from the manifest", () => {
    expect(photosInGroup("work")).toHaveLength(6);
    expect(wallSource).toContain('photosInGroup("work")');
  });

  it("lets each piece keep its own shape", () => {
    /* A uniform tile grid throws away the one thing worth showing about
       textile work. Frames take their ratio from the manifest. */
    expect(wallSource).not.toContain("aspect-");
    expect(css).toContain(".work-wall {");
  });

  it("attaches no student name, outcome or earning to a frame", () => {
    for (const banned of ["student", "earning", "salary", "placed", "job"]) {
      expect(en.home.wall.sub.toLowerCase(), banned).not.toContain(banned);
    }
  });
});

describe("where you actually learn", () => {
  it("shows the floor, the entrance and the four machine stations", () => {
    for (const id of [
      "A1_MACHINE_FLOOR",
      "A2_ENTRANCE_SIGNBOARD",
      "A3_ZARDOSI_MACHINE",
      "A4_BEADS_MACHINE",
      "A5_LASER_MACHINE",
      "A6_TUFTING_MACHINE",
      "F1_STUDIO_FLOOR_WIDE"
    ]) {
      expect(studioSource, id).toContain(id);
    }
    expect(photosInGroup("studio")).toHaveLength(6);
  });

  it("invents no machine specification", () => {
    const text = [
      stripComments(studioSource),
      JSON.stringify(en.home.studio),
      JSON.stringify(gu.home.studio)
    ]
      .join(" ")
      .toLowerCase();
    for (const spec of ["rpm", "stitches per minute", "spm", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
    /* No head count, capacity or speed figure of any kind: a number beside a
       machine word is exactly the invented specification that is banned. */
    expect(text).not.toMatch(/\d+\s*-?\s*(head|needle|machine)s?\b/);
    /* And says why the stations carry no numbers. */
    expect(en.home.studio.noSpecsNote.toLowerCase()).toContain("verified");
  });
});

describe("the reserved trainer portraits", () => {
  it("uses the three trainer slots", () => {
    expect(photosInGroup("trainer")).toHaveLength(3);
    expect(trainersSource).toContain('photosInGroup("trainer")');
  });

  it("names a photograph, never a person who does not exist", () => {
    /* The frames carry a shoot brief and nothing else — no invented name,
       role or speciality. */
    expect(trainersSource).not.toContain("sample: true");
    expect(en.home.trainers.portraitsNote.toLowerCase()).toContain("photograph");
    for (const cat of [en, gu]) {
      expect(JSON.stringify(cat.home.trainers)).not.toContain("Master Faculty");
    }
  });
});

/* ------------------------------------------------------------------ *
 * Copy that has to stay true
 * ------------------------------------------------------------------ */

describe("homepage copy", () => {
  it("names six production faults, each with a cause", () => {
    for (const cat of [en, gu]) {
      for (const n of [1, 2, 3, 4, 5, 6]) {
        expect(cat.home.problems[`p${n}f`], `p${n}f`).toBeTruthy();
        expect(cat.home.problems[`p${n}c`].length, `p${n}c`).toBeGreaterThan(30);
      }
    }
    expect(read("src/components/home/ProblemsSolved.tsx")).toContain("[1, 2, 3, 4, 5, 6]");
  });

  it("closes on the line the studio chose", () => {
    expect(en.home.cta.h2.toLowerCase()).toContain("should not stop at the screen");
    expect(en.home.cta.sub.toLowerCase()).toContain("prove it on the machine");
  });

  it("names the software in full where the workflow describes digitising", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.workflow.s2d).toContain("EMCAD DAHAO");
    }
  });

  it("still teaches no other digitising package", () => {
    const everything = JSON.stringify(en.home) + JSON.stringify(gu.home);
    expect(everything.toLowerCase()).not.toContain("wilcom");
  });
});
