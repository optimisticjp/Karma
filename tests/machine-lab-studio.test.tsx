import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { courses } from "../src/content/courses";
import { studioProblems, studioProjects, services } from "../src/content/collections";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const page = read("src/app/[locale]/services/page.tsx");
const rail = read("src/components/studio/StudioRail.tsx");
const railBase = read("src/components/ui/ProductionRail.tsx");
const brief = read("src/components/forms/BriefForm.tsx");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The chain
 * ------------------------------------------------------------------ */

describe("the studio production chain", () => {
  it("runs reference → digitising → sample → correction → machine-ready", () => {
    const order = ["reference", "digitising", "sample", "correction", "ready"];
    const positions = order.map((key) => rail.indexOf(`key: "${key}"`));
    expect(positions.every((p) => p > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("reuses the homepage's rail rather than forking it", () => {
    expect(rail).toContain("ProductionRail");
    expect(read("src/components/home/ProductionRailSection.tsx")).toContain("ProductionRail");
    /* Which is the whole reason the rail takes its stages as a prop. */
    expect(railBase).toContain("stages: RailStage[]");
  });

  it("carries drawn marks, never a borrowed or invented photo slot", () => {
    /* The 32-shot list covers the school, not the commercial pipeline. */
    expect(rail).not.toContain("photoId");
    for (const mark of ["RegistrationPoint", "BrokenPath", "KnotPoint", "StitchRule"]) {
      expect(rail, mark).toContain(mark);
    }
  });

  it("uses each mark for the thing that mark means", () => {
    /* correction is the one that must be the broken path: failure /
       production problem. machine-ready is the knot: completion. */
    const correction = rail.slice(rail.indexOf('key: "correction"'), rail.indexOf('key: "ready"'));
    expect(correction).toContain("BrokenPath");
    const ready = rail.slice(rail.indexOf('key: "ready"'));
    expect(ready).toContain("KnotPoint");
  });
});

/* ------------------------------------------------------------------ *
 * The three things this page still will not say
 * ------------------------------------------------------------------ */

describe("nothing unconfirmed is promised", () => {
  it("publishes no turnaround time", () => {
    const copy = (JSON.stringify(en.servicesPage) + JSON.stringify(gu.servicesPage)).toLowerCase();
    for (const promise of [
      /\bwithin \d+ (hours|days|working days)\b/,
      /\b\d+\s*-\s*\d+ days\b/,
      /\bsame day\b/,
      /\b24 hours\b/,
      /\bturnaround of\b/
    ]) {
      expect(copy, String(promise)).not.toMatch(promise);
    }
    /* And says so: the copy asks for the buyer's deadline instead. */
    expect(en.servicesPage.chain.s5Detail.toLowerCase()).toContain("deadline");
  });

  it("names no delivered file format", () => {
    const copy = (JSON.stringify(en.servicesPage) + JSON.stringify(gu.servicesPage)).toLowerCase();
    for (const fmt of [".dst", ".emb", ".pes", ".exp", ".jef", "dst file", "tajima format"]) {
      expect(copy, fmt).not.toContain(fmt);
    }
    expect(en.servicesPage.chain.s5Detail.toLowerCase()).toContain("what your machine reads");
  });

  it("quotes no price and offers no online payment", () => {
    const copy = JSON.stringify(en.servicesPage) + JSON.stringify(gu.servicesPage);
    expect(copy).not.toContain("₹");
    const code = stripComments(page).toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://"]) {
      expect(code, provider).not.toContain(provider);
    }
  });

  it("still offers no file upload, and says so instead of showing a dead control", () => {
    expect(brief).not.toContain('type="file"');
    expect(brief).not.toContain("accept=");
    expect(brief.toLowerCase()).toContain("upload");
  });
});

/* ------------------------------------------------------------------ *
 * Capability and proof
 * ------------------------------------------------------------------ */

describe("what the studio says it can do", () => {
  it("draws the capability list from the catalogue, so it cannot overclaim", () => {
    expect(page).toContain("coursesByFamily.map");
    expect(courses).toHaveLength(11);
  });

  it("shows each technique's own signature, not a shared family swatch", () => {
    expect(page).toContain("TechniqueSignature");
    expect(page).not.toContain("TechniquePlate");
  });

  it("names no client and shows no logo", () => {
    for (const project of studioProjects) {
      expect(project.titleEn.length, project.titleEn).toBeGreaterThan(3);
    }
    const copy = JSON.stringify(studioProjects) + JSON.stringify(studioProblems);
    expect(copy.toLowerCase()).not.toContain("logo of");
    expect(page).not.toContain("clientLogo");
  });

  it("keeps every advertised service as one the studio already offers", () => {
    expect(services.length).toBeGreaterThanOrEqual(4);
    expect(studioProblems.length).toBeGreaterThanOrEqual(4);
  });
});

describe("band rhythm on the services page", () => {
  it("uses one dark band and does not put another beside it", () => {
    /* The chain is the page's technical moment; the sections either side of
       it are light. */
    expect((page.match(/on-carbon/g) ?? [])).toHaveLength(0);
    expect(rail).toContain("on-carbon band-machine");
    const chainAt = page.indexOf("<StudioRail />");
    const nextSection = page.indexOf("<section", chainAt);
    expect(page.slice(chainAt, nextSection + 120)).not.toContain("on-carbon");
  });
});
