import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  PROOF,
  remainingSampleProof,
  reviews,
  socialChannels,
  stories,
  testimonials,
  trainers,
  partners,
  stats,
  verifiedOnly,
  type ProofItem
} from "../src/content/proof";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

/**
 * THE SAMPLE / SEO FIREWALL.
 *
 * The owner explicitly authorised sample and studio-supplied proof on the
 * Workers.dev preview so the site can be reviewed as a finished product
 * rather than as a set of empty frames
 * (`docs/karma-creative-freedom-trust-proof-addendum.md` §§6–9).
 *
 * That is only safe because of the line these tests defend:
 *
 *   **The VISIBLE preview may be rich. The STRUCTURED DATA must stay factual.**
 *
 * A sample review card says "Sample preview" on screen. A rich result in
 * Google cannot say that — it is repeated as fact, it is cached, and it
 * follows the business around long after the content is fixed. So nothing
 * unverified may reach schema, and the check is mechanical rather than a
 * habit somebody has to remember.
 */

/* ------------------------------------------------------------------ *
 * The registry is complete and honest about itself
 * ------------------------------------------------------------------ */

describe("the proof registry", () => {
  it("gives every item a unique id", () => {
    const ids = PROOF.map((i) => i.id);
    expect(new Set(ids).size, ids.join(",")).toBe(ids.length);
  });

  it("holds every proof array, so the launch audit sees all of it", () => {
    /* An item outside `PROOF` is an item the pre-launch gate never reports,
       which is exactly how a sample name survives to a custom domain. */
    const counted =
      reviews.length +
      testimonials.length +
      stories.length +
      trainers.length +
      partners.length +
      socialChannels.length +
      1 /* the rating */ +
      stats.length;
    expect(PROOF).toHaveLength(counted);
  });

  it("tells the replacement round what to do with everything unverified", () => {
    for (const item of PROOF) {
      if (item.status === "verified") continue;
      expect(item.replaceWith, `${item.id} has no replacement instruction`).toBeTruthy();
      expect(item.replaceWith!.length, item.id).toBeGreaterThan(20);
    }
  });

  it("reports every unverified item to the pre-launch gate", () => {
    const remaining = remainingSampleProof();
    expect(remaining).toHaveLength(PROOF.filter((i) => i.status !== "verified").length);
    expect(remaining.every((r) => !r.replaceWith.startsWith("⚠"))).toBe(true);
  });

  it("distinguishes studio-supplied figures from invented ones", () => {
    /* "The studio told us this" and "we made this up for the preview" are
       different claims and the model must not blur them. The follower counts
       and the Google rating are real numbers nobody has audited. */
    const supplied = PROOF.filter((i) => i.status === "owner_provided").map((i) => i.id);
    expect(supplied).toEqual(["so-instagram", "so-facebook", "rt-google"]);
  });

  it("marks nothing as verified that has not been through the gate", () => {
    /* Today the only verified proof is operational fact — the eleven
       techniques, the live practical, the two-day demo. No review, story,
       trainer or partner is verified yet, and claiming one would be the
       whole failure this file exists to prevent. */
    const verified = verifiedOnly(PROOF as ProofItem[]);
    expect(verified.every((i) => i.kind === "stat")).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Nothing unverified reaches structured data
 * ------------------------------------------------------------------ */

describe("structured data stays factual", () => {
  const schema = stripComments(read("src/lib/schema.ts"));

  it("does not read the proof registry at all", () => {
    /* The strongest possible form of the rule: the schema builder has no
       access to proof, so it cannot leak any. If a verified review is ever
       published, it comes through `verifiedOnly()` and this test changes to
       say so deliberately. */
    expect(schema).not.toContain("content/proof");
    expect(schema).not.toContain("from \"@/content/proof\"");
  });

  it("emits no rating, review or person type", () => {
    for (const banned of ["aggregateRating", "AggregateRating", '"Review"', '"Person"', "ratingValue", "reviewCount"]) {
      expect(schema, banned).not.toContain(banned);
    }
  });

  it("publishes no review count anywhere", () => {
    /* An AggregateRating needs one. The figure circulating online is an
       aggregate nobody could verify, and the registry deliberately records
       the rating without a count so one cannot be assembled by accident. */
    const rating = PROOF.find((i) => i.id === "rt-google");
    expect(rating && "count" in rating ? rating.count : undefined).toBeUndefined();
  });

  it("keeps sample proof out of every JSON-LD builder", () => {
    const builders = walk("src/lib")
      .filter((f) => f.endsWith(".ts"))
      .filter((f) => stripComments(read(f)).includes("@context"));
    expect(builders.length).toBeGreaterThan(0);
    for (const file of builders) {
      expect(stripComments(read(file)), file).not.toContain("content/proof");
    }
  });
});

/* ------------------------------------------------------------------ *
 * The visible disclosure
 * ------------------------------------------------------------------ */

describe("sample proof is visibly marked", () => {
  const proofComponents = read("src/components/kds/proof.tsx");

  it("puts the marker inside each module, not in the caller's hands", () => {
    /* A disclosure a caller can forget is a disclosure that will be
       forgotten. Every format below renders `SampleMark` itself. */
    for (const format of [
      "FeaturedReview",
      "ReviewRail",
      "RatingBlock",
      "StoryJourney",
      "TrustedByRail",
      "SocialProof",
      "MicroProof"
    ]) {
      const start = proofComponents.indexOf(`export function ${format}(`);
      expect(start, format).toBeGreaterThan(-1);
      const next = proofComponents.indexOf("\nexport function ", start + 1);
      const body = proofComponents.slice(start, next === -1 ? undefined : next);
      expect(body, `${format} renders no SampleMark`).toContain("SampleMark");
    }
  });

  it("says something different for studio-supplied than for invented", () => {
    expect(proofComponents).toContain("Sample preview");
    expect(proofComponents).toContain("Studio-supplied");
  });

  it("renders nothing at all for verified proof", () => {
    expect(proofComponents).toContain('if (status === "verified") return null;');
  });

  it("styles the marker so it cannot be invisible", () => {
    const css = read("src/app/thread-machine-proof.css");
    expect(css).toContain(".kds .is-sample");
  });
});

/* ------------------------------------------------------------------ *
 * What sample copy may and may not say
 * ------------------------------------------------------------------ */

describe("sample copy stays within the factual rules", () => {
  const allCopy = JSON.stringify(PROOF).toLowerCase();

  it("promises no earnings, salary, job or placement outcome", () => {
    /* The one rule sample content does NOT relax. An invented review is a
       placeholder; an invented income claim is the kind of promise that
       brings a training institute real trouble, and a visitor cannot tell
       the difference between a sample promise and a real one. */
    for (const banned of ["salary", "earn ", "earning", "income", "₹", "lakh", "guaranteed", "placement", "job guarantee"]) {
      expect(allCopy, banned).not.toContain(banned);
    }
  });

  it("teaches no other digitising package", () => {
    /* Admission norm #1: EMCAD DAHAO is the only software Karma teaches. */
    expect(allCopy).not.toContain("wilcom");
  });

  it("does not publish an unverified batch-size claim", () => {
    /* "Small batches" appeared in a design recommendation and is NOT a
       confirmed fact. It must not arrive through a sample review either. */
    expect(allCopy).not.toContain("small batch");
    expect(allCopy).not.toContain("નાની બેચ");
  });

  it("invents no machine specification", () => {
    for (const spec of ["rpm", "stitches per minute", "head machine", "needles"]) {
      expect(allCopy, spec).not.toContain(spec);
    }
  });

  it("names no real company as a partner", () => {
    /* Fictional placeholder marks are allowed; implying a real brand endorses
       Karma is not. These names are invented and are marked as sample. */
    expect(partners.every((p) => p.status === "sample")).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Bilingual parity
 * ------------------------------------------------------------------ */

describe("proof is bilingual", () => {
  it("gives every English field a Gujarati sibling", () => {
    /* A sample review that exists only in English renders English on a
       Gujarati page, which is the silent fallback the whole i18n contract
       exists to prevent. */
    const problems: string[] = [];
    for (const item of PROOF) {
      for (const key of Object.keys(item)) {
        if (!key.endsWith("En")) continue;
        const gu = `${key.slice(0, -2)}Gu`;
        const value = (item as unknown as Record<string, unknown>)[gu];
        if (typeof value !== "string" || value.trim() === "") {
          problems.push(`${item.id}.${gu}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("writes real Gujarati, not the English left untranslated", () => {
    const GUJARATI = /[઀-૿]/;
    const problems: string[] = [];
    for (const item of PROOF) {
      for (const [key, value] of Object.entries(item)) {
        if (!key.endsWith("Gu") || typeof value !== "string") continue;
        /* Trade terms stay Latin inside a Gujarati sentence — that is how the
           floor talks — so the test is that SOME Gujarati is present, not
           that all of it is. A short label may legitimately be all-Latin
           (e.g. a business type), so only sentences are checked.

           The studio's own name is the one string on this site that is never
           translated, in either direction. */
        if (value.split(/\s+/).length < 4) continue;
        if (value.includes("Karma Design Studio")) continue;
        if (!GUJARATI.test(value)) problems.push(`${item.id}.${key}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
