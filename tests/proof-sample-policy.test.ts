import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  galleryItems,
  machineCases,
  sampleReviews,
  stories,
  trainers
} from "../src/content/collections";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/**
 * The sample-content contract.
 *
 * Workers.dev is publicly reachable, so sample content ships to real visitors
 * during this pre-domain stage. That is allowed — the owner asked for the
 * whole visual system populated — but only under conditions that make it
 * impossible to mistake for verified fact, and impossible to leak into
 * structured data where a search engine would repeat it as truth.
 *
 * These tests hold that line mechanically, because a reviewer reading a diff
 * cannot see what the rendered page claims.
 */
describe("sample content is marked at the source", () => {
  it("flags every unverified identity as a sample", () => {
    for (const s of stories) expect(s.sample).toBe(true);
    for (const t of trainers) expect(t.sample).toBe(true);
    for (const r of sampleReviews) expect(r.sample).toBe(true);
    for (const g of galleryItems) expect(g.sample).toBe(true);
  });

  it("does not reuse the old ValidTheme template's invented names", () => {
    // The discarded site's testimonials and "faculty". None may reappear.
    const banned = ["Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "validtheme"];
    const blob = JSON.stringify({ stories, trainers, sampleReviews }).toLowerCase();
    for (const name of banned) expect(blob).not.toContain(name.toLowerCase());
  });

  it("never promises earnings, salary, a job or a placement", () => {
    const blob = JSON.stringify({ stories, trainers, sampleReviews }).toLowerCase();
    for (const claim of [
      "guaranteed",
      "guarantee",
      "salary",
      "job placement",
      "placement assistance",
      "100%",
      "earn ₹",
      "per month",
      "₹"
    ]) {
      expect(blob).not.toContain(claim);
    }
    // "Placement" alone is a legitimate embroidery term — where a patch sits
    // before it is tacked down — so it is matched in its job sense only.
    expect(blob).toContain("placement, tack-down");
  });

  it("keeps trainer experience as a range rather than a precise year count", () => {
    for (const t of trainers) {
      // "Over a decade", "Several years" — never "12 years".
      expect(t.experienceEn).not.toMatch(/\b\d+\s*(\+)?\s*years?\b/i);
    }
  });
});

describe("machine case notes are technique facts, not claims about people", () => {
  it("carries no sample flag, because there is no identity to verify", () => {
    for (const c of machineCases) {
      expect(c).not.toHaveProperty("sample");
    }
  });

  it("gives every case a full diagnosis chain in both languages", () => {
    for (const c of machineCases) {
      for (const field of [
        "problemEn", "problemGu",
        "diagnosisEn", "diagnosisGu",
        "changeEn", "changeGu",
        "settingEn", "settingGu",
        "resultEn", "resultGu"
      ] as const) {
        expect(c[field].length).toBeGreaterThan(20);
      }
    }
  });
});

describe("sample content never reaches structured data", () => {
  const jsonLdSources = [
    "src/app/[locale]/layout.tsx",
    "src/app/[locale]/courses/[slug]/page.tsx"
  ];

  it("emits no Review, AggregateRating or Person schema anywhere", () => {
    for (const file of jsonLdSources) {
      const source = read(file);
      expect(source).not.toContain("AggregateRating");
      expect(source).not.toContain('"@type": "Review"');
      expect(source).not.toContain('"@type": "Person"');
    }
  });

  it("keeps offers and timeRequired out of Course schema while fees and durations are unconfirmed", () => {
    // Property syntax, not prose: the file's own comment names both fields to
    // explain why they are absent, and that comment is the documentation this
    // test exists to keep honest.
    const source = read("src/app/[locale]/courses/[slug]/page.tsx");
    expect(source).not.toContain("offers:");
    expect(source).not.toContain("timeRequired:");
  });

  it("does not present the owner-provided rating as an independently verified fact", () => {
    const site = read("src/lib/site.ts");
    // The flag that would let the rating be stated as verified stays off.
    expect(site).toContain("googleRating48: false");
    // And the owner-provided value is a separate export with its own contract.
    expect(site).toContain("export const ownerProvidedFacts");
  });
});

describe("every public surface that renders a sample also renders its tag", () => {
  const surfaces = [
    "src/components/site/StoryCase.tsx",
    "src/components/site/TrainerProfile.tsx",
    "src/components/site/ReviewWall.tsx",
    "src/components/work/WorkLedger.tsx",
    "src/components/home/Reviews.tsx"
  ];

  it("imports and renders <SampleTag /> guarded on the sample flag", () => {
    for (const file of surfaces) {
      const source = read(file);
      expect(source).toContain("SampleTag");
      expect(source).toMatch(/sample \?/);
    }
  });
});

describe("Content Desk replaces samples rather than sitting beside them", () => {
  it("prefers managed rows and falls back to source content only when empty", () => {
    const source = read("src/lib/content/public.ts");
    expect(source).toContain("return managed.length > 0 ? managed : sourceStories");
    expect(source).toContain("return managed.length > 0 ? managed : sourceGallery");
  });

  it("marks every managed row as verified, not sample", () => {
    const source = read("src/lib/content/public.ts");
    // Both managed builders stamp sample:false; nothing else may set it true.
    expect(source.match(/sample: false/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source).not.toContain("sample: true");
  });
});
