import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clampAt,
  contrastRatio,
  declaration,
  lengthPx,
  luminance,
  NARROW,
  PHONE,
  ruleBody,
  stripComments,
  token
} from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/*
 * The compact-density redesign states every target as a rendered pixel value
 * at a phone width, and almost every value in these stylesheets is a clamp.
 * The phases that follow assert those targets through `tests/helpers/measure`,
 * so the helpers themselves are worth their own suite: a measurement bug would
 * make every later density assertion pass or fail for the wrong reason.
 */
describe("density measurement helpers", () => {
  it("evaluates a clamp at a viewport width the way a browser does", () => {
    // The live section rhythm, so a maths error shows up against real values.
    expect(clampAt("clamp(2.5rem, 1.9rem + 2.6vw, 4.5rem)", PHONE)).toBeCloseTo(40.54, 1);
    // Below the lower bound the min wins.
    expect(clampAt("clamp(2.5rem, 1.9rem + 2.6vw, 4.5rem)", NARROW)).toBeCloseTo(40, 1);
    // Above the upper bound the max wins.
    expect(clampAt("clamp(2.5rem, 1.9rem + 2.6vw, 4.5rem)", 1920)).toBeCloseTo(72, 1);
  });

  it("handles a plain length as well as a clamp", () => {
    expect(clampAt("1rem")).toBe(16);
    expect(clampAt("12px")).toBe(12);
    expect(lengthPx("2.6vw", 390)).toBeCloseTo(10.14, 2);
  });

  it("throws on a value it cannot parse rather than returning NaN", () => {
    // A silent NaN would make `expect(value).toBeLessThanOrEqual(32)` fail in a
    // way that reads as a density regression when it is a parse failure.
    expect(() => clampAt("calc(100% - 2rem)")).toThrow();
    expect(() => luminance("oklch(0.9 0.02 250)")).toThrow();
  });

  it("slices a rule body by exact selector and reads one declaration", () => {
    const css = read("src/app/globals.css");
    const body = ruleBody(css, ".section");
    expect(body).not.toBeNull();
    expect(declaration(body as string, "padding-block")).toContain("clamp(");
    // An absent selector is null, never an empty string that measures as zero.
    expect(ruleBody(css, ".this-selector-does-not-exist")).toBeNull();
    // `.section` must not be satisfied by `.section-major`: the three rhythm
    // tiers are measured separately and a prefix match would conflate them.
    expect(declaration(ruleBody(css, ".section-compact") as string, "padding-block")).not.toBe(
      declaration(ruleBody(css, ".section") as string, "padding-block")
    );
  });

  it("reads a design token out of the theme block", () => {
    expect(token(read("src/app/globals.css"), "--color-ivory")).toBe("#f5f0e6");
  });

  it("agrees with the contrast numbers already pinned in the design system", () => {
    // docs/design-system.md records these as measured, not estimated.
    expect(contrastRatio("#111716", "#f5f0e6")).toBeCloseTo(15.97, 1);
    expect(contrastRatio("#605e56", "#f5f0e6")).toBeCloseTo(5.72, 1);
    expect(contrastRatio("#29617a", "#f5f0e6")).toBeCloseTo(5.99, 1);
  });

  it("strips comments so a scan cannot fail on the code's own explanation", () => {
    // This is the repository's documented failure mode: a ban that fires on the
    // honest note explaining why the rule exists teaches the next session to
    // delete the note.
    const source = `/* never uppercase Gujarati */\n.chip { text-transform: uppercase; }`;
    expect(stripComments(source)).not.toContain("never uppercase");
    expect(stripComments(source)).toContain("text-transform: uppercase");
  });
});
