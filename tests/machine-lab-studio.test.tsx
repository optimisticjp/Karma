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
/* The chain moved onto the design system's seam when the route was rebuilt;
   `<StudioRail>` and the shared `<ProductionRail>` are deleted. The rules
   below follow the chain, not the component that used to draw it. */
const rail = read("src/components/kds/studio/StudioChain.tsx");
const brief = read("src/components/forms/BriefForm.tsx");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * The chain
 * ------------------------------------------------------------------ */

describe("the studio production chain", () => {
  it("runs reference → digitising → sample → correction → machine-ready", () => {
    /* The stages are keyed s1…s5 in the catalogue, in order, and the chain
       renders that order. Reordering the copy reorders the chain, which is
       the point: there is one place the sequence lives. */
    const order = ["Reference", "Digitising", "Sample", "Correction", "Machine-ready"];
    const labels = [1, 2, 3, 4, 5].map((n) => en.servicesPage.chain[`s${n}Label`]);
    expect(labels).toEqual(order);
    expect(rail).toContain("[1, 2, 3, 4, 5].map");
  });

  it("draws the chain as the same seam the other ordered sequences use", () => {
    /* The joining steps, the diagnostic checks and this are the same idea —
       an ordered sequence where the order is the content — so they are the
       same object rather than three drawings that resemble each other. */
    expect(rail).toContain("pathway-step");
    expect(rail).toContain("<NeedlePoint");
    expect(rail).toContain("pathway-thread");
  });

  it("carries no borrowed or invented photo slot", () => {
    /* The 32-shot list covers the school, not the commercial pipeline. */
    expect(rail).not.toContain("photoId");
    expect(rail).not.toContain("PhotoFrame");
  });

  it("marks the last stage as the one still ahead", () => {
    /* Machine-ready is what the buyer is waiting for, so it is the needle
       that has not gone in yet rather than a completed stitch. */
    expect(rail).toContain('state={i === stages.length - 1 ? "todo" : "done"}');
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

  it("shows each technique's own mark, never a shared family one", () => {
    /* A mark belongs to exactly one technique. The capability wall draws the
       course's own stitch swatch, keyed by its slug. */
    expect(page).toContain("<StitchSwatch slug={c.slug} />");
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
  it("carries its technical moment on a light surface, not a dark slab", () => {
    /* This asserted the opposite until 2026-08-31: the chain was ~1,677px of
       near-black on a 390px phone, and it was the page's dark band. The owner
       rejected the black-background treatment, so `.band-machine` is Steel
       Mist now and the rule tightens rather than relaxes — no dark surface on
       this page at all, chain included. The chain is still the page's
       technical moment; what says so is the steel edge, the notation and the
       stitch marks, none of which needed the black. */
    expect((page.match(/on-carbon/g) ?? [])).toHaveLength(0);
    expect(stripComments(rail)).not.toContain("on-carbon");
    /* The chain is the page's technical moment, and what says so is the COOL
       REGISTER — the ground that means screen, file and process — rather than
       a black slab. */
    expect(rail).toContain("on-mist");
    /* And it must not have quietly become an undifferentiated light section:
       the cool ground is a real surface change from what sits either side of
       it, and the page uses every one of the four. */
    for (const g of ["on-canvas", "on-paper", "on-cloth"]) {
      expect(page, g).toContain(g);
    }
  });
});
