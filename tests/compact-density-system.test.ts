import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clampAt, contrastRatio, declaration, PHONE, ruleBody, stripComments, token } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const globals = read("src/app/globals.css");
const premium = read("src/app/premium.css");
const machineLab = read("src/app/machine-lab.css");
const SHEETS = [
  ["globals.css", globals],
  ["premium.css", premium],
  ["machine-lab.css", machineLab]
] as const;

/* ------------------------------------------------------------------ *
 * Steel Mist — the light technical surface
 *
 * A surface owns the text colours that work on it. Adding one means
 * measuring every secondary token against it BEFORE putting body copy
 * there, which is the rule `.bg-sand` was written to establish.
 * ------------------------------------------------------------------ */

describe("Steel Mist", () => {
  const mist = token(globals, "--color-mist");

  it("is declared as a plain hex so it can actually be measured", () => {
    /* Read the value out of the token rather than hardcoding it here: a test
       carrying its own copy of the colour keeps passing after a retune while
       the real surface has moved. */
    expect(mist, "--color-mist must exist").not.toBeNull();
    expect(mist).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("clears AA for every text role placed on it", () => {
    for (const [name, hex] of [
      ["stone", "#605e56"],
      ["vermilion-deep", "#a93a27"],
      ["needle", "#29617a"],
      ["zari-deep", "#8a4e2c"]
    ] as const) {
      expect(contrastRatio(hex, mist as string), `${name} on Steel Mist`).toBeGreaterThanOrEqual(4.5);
    }
    /* Carbon body text clears AAA, which is what lets the band carry prose. */
    expect(contrastRatio("#111716", mist as string)).toBeGreaterThanOrEqual(7);
  });

  it("keeps bright vermilion large-text-only, the same rule as on Cotton", () => {
    /* Not a defect of the surface — the accent fails on small text against
       every ground in this palette, which is why `vermilion-deep` exists.
       Asserting the failure keeps the reason legible, the way the sand block
       in hardening.test.ts does. */
    expect(contrastRatio("#c54832", mist as string)).toBeLessThan(4.5);
    expect(contrastRatio("#c54832", "#f5f0e6")).toBeLessThan(4.5);
  });

  it("needs no re-pointed token block, unlike Sand", () => {
    const bandBlock = ruleBody(machineLab, ".band-machine");
    expect(bandBlock).not.toBeNull();
    expect(bandBlock as string).toContain("var(--color-mist)");
    for (const t of ["--color-stone:", "--color-needle:", "--color-vermilion-deep:", "--color-zari-deep:"]) {
      expect(bandBlock as string, t).not.toContain(t);
    }
  });

  it("gives its hairline enough contrast to be a hairline", () => {
    const line = token(globals, "--color-mist-line");
    expect(line).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrastRatio(line as string, "#111716")).toBeGreaterThanOrEqual(7);
  });
});

/* ------------------------------------------------------------------ *
 * The compact scale, measured at the reference phone
 * ------------------------------------------------------------------ */

describe("public rhythm computes to the compact scale on a phone", () => {
  /* The plan's band is 20-32px for a mobile section gap. All three tiers
     survive — a page needs dynamics — but every one of them has to land
     inside the band at 390px. Measured, never string-matched: a later session
     may re-express any of these clamps freely. */
  const TIERS = [
    [".section-major", 32],
    [".section", 32],
    [".section-compact", 32]
  ] as const;

  for (const [selector, ceiling] of TIERS) {
    it(`${selector} stays within ${ceiling}px at 390px`, () => {
      const body = ruleBody(globals, selector);
      expect(body, `${selector} must exist`).not.toBeNull();
      const value = declaration(body as string, "padding-block");
      expect(value, `${selector} padding-block`).not.toBeNull();
      expect(clampAt(value as string, PHONE)).toBeLessThanOrEqual(ceiling);
    });
  }

  it("still opens up on a laptop — this is a mobile compaction, not a shorter site", () => {
    const at = (selector: string) =>
      clampAt(declaration(ruleBody(globals, selector) as string, "padding-block") as string, 1440);
    expect(at(".section-major")).toBeGreaterThanOrEqual(64);
    expect(at(".section")).toBeGreaterThanOrEqual(48);
    /* And the three tiers stay genuinely different, or the page loses its
       dynamics and reads as one continuous scroll — the failure v3 fixed. */
    expect(at(".section-major")).toBeGreaterThan(at(".section"));
    expect(at(".section")).toBeGreaterThan(at(".section-compact"));
  });

  it("keeps the rhythm utilities on the compact scale", () => {
    const COMPACT = [4, 6, 8, 12, 16, 20, 24, 32];
    for (const name of ["--space-eyebrow-to-h", "--space-h-to-lede", "--space-lede-to-action"]) {
      const px = clampAt(token(globals, name) as string, PHONE);
      expect(COMPACT, `${name} = ${px}px`).toContain(px);
    }
    expect(clampAt(token(globals, "--space-heading-to-content") as string, PHONE)).toBeLessThanOrEqual(24);
  });
});

describe("the mobile type scale lands inside the plan's bands", () => {
  /* An allow-list of tokens with the band each one is written against, so the
     assertion is the plan's own table rather than a snapshot of today's
     numbers. Desktop is checked only for a floor: the compaction is a phone
     compaction and a laptop should still read as it always did. */
  const BANDS: Array<[string, number, number, number]> = [
    // token, phone min, phone max, desktop floor
    ["--text-display-xl", 30, 36, 64],
    ["--text-display", 28, 36, 56],
    ["--text-h1", 24, 30, 48],
    ["--text-h2", 18, 22, 40],
    ["--text-h3", 17, 22, 28],
    ["--text-h4", 15, 18, 22],
    ["--text-lead", 14, 17, 18],
    ["--text-bodylg", 14, 17, 17],
    ["--text-smallmeta", 12, 15, 13],
    ["--text-eyebrow", 11, 13, 11],
    ["--text-btn", 13, 16, 13]
  ];

  for (const [name, lo, hi, desktopFloor] of BANDS) {
    it(`${name} is ${lo}-${hi}px on a phone`, () => {
      const value = token(globals, name);
      expect(value, `${name} must exist`).not.toBeNull();
      const px = clampAt(value as string, PHONE);
      expect(px, `${name} at 390px`).toBeGreaterThanOrEqual(lo);
      expect(px, `${name} at 390px`).toBeLessThanOrEqual(hi);
      expect(clampAt(value as string, 1440), `${name} at 1440px`).toBeGreaterThanOrEqual(desktopFloor);
    });
  }

  it("keeps every size token's line-height and letter-spacing with it", () => {
    /* A --text-* token is three values. Setting only font-size drops the
       paired line-height and the heading silently falls back to body 1.625 —
       the bug behind "every display heading reads airy". */
    for (const name of ["--text-display-xl", "--text-display", "--text-h1", "--text-h2", "--text-h3"]) {
      expect(globals, `${name}--line-height`).toContain(`${name}--line-height`);
      expect(globals, `${name}--letter-spacing`).toContain(`${name}--letter-spacing`);
    }
  });

  it("does not buy density from the tap target", () => {
    const btn = ruleBody(globals, ".btn");
    expect(clampAt(declaration(btn as string, "min-height") as string)).toBeGreaterThanOrEqual(44);
    const gu = ruleBody(globals, ":lang(gu) .btn");
    expect(clampAt(declaration(gu as string, "min-height") as string)).toBeGreaterThanOrEqual(44);
  });
});

/* ------------------------------------------------------------------ *
 * Gujarati, swept the other way round
 *
 * The existing sweep checks that a `:lang(gu)` block which MENTIONS
 * text-transform or letter-spacing neutralises it correctly. That
 * cannot catch a new label class with no `:lang(gu)` rule at all —
 * which is exactly what a density pass produces, because it multiplies
 * chips, kv-labels, status lights and filter pills.
 * ------------------------------------------------------------------ */

describe("every uppercased or letterspaced class has a Gujarati neutraliser", () => {
  /* Rules whose content is never Gujarati script. Each is named with what it
     actually renders, because "add it to the list" is the way this test would
     be defeated, and a reader has to be able to check the claim. */
  const NEVER_GUJARATI: Array<[string, string]> = [
    [".site-brand-word", 'the wordmark — always the Latin "Karma Design Studio"'],
    [".workflow-index", "a two-digit step numeral"],
    [".review-score-value", "a rating numeral"],
    [".review-stars", "star glyphs"],
    [".emcad-total", "a rupee amount in tabular figures"]
  ];

  const rules = SHEETS.flatMap(([file, css]) => {
    const clean = stripComments(css);
    const out: Array<{ file: string; selector: string; body: string }> = [];
    for (const m of clean.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
      const selector = m[1].trim().replace(/\s+/g, " ");
      /* An at-rule's own body is not a selector. `@theme { --x: 1 }` would
         otherwise arrive here as a rule called "theme" carrying every token in
         the file, and letter-spacing tokens live in there. */
      const precededByAt = m.index !== undefined && clean.slice(0, m.index).trimEnd().endsWith("@");
      if (!selector || selector.startsWith("@") || precededByAt) continue;
      out.push({ file, selector, body: m[2] });
    }
    return out;
  });

  it("finds enough rules to be measuring something", () => {
    expect(rules.length).toBeGreaterThan(300);
  });

  it("covers every one", () => {
    const guSelectors = rules.filter((r) => r.selector.includes(":lang(gu)")).map((r) => r.selector);
    expect(guSelectors.length).toBeGreaterThanOrEqual(20);

    const uncovered: string[] = [];
    for (const rule of rules) {
      if (rule.selector.includes(":lang(gu)")) continue;
      const upper = /text-transform:\s*uppercase/.test(rule.body);
      const tracking = /letter-spacing:\s*(-?[\d.]+)(em|rem|px)/.exec(rule.body);
      const tracked = tracking !== null && Number(tracking[1]) !== 0;
      if (!upper && !tracked) continue;

      const classes = rule.selector.match(/\.[A-Za-z0-9_-]+/g) ?? [];
      if (classes.some((c) => NEVER_GUJARATI.some(([allowed]) => allowed === c))) continue;
      /* Tightening Gujarati is as wrong as spacing it out, so a negative
         tracking counts too. */
      const covered = guSelectors.some((gu) => classes.some((c) => gu.includes(c)));
      if (!covered) uncovered.push(`${rule.file}  ${rule.selector}`);
    }

    expect(uncovered, "these need a :lang(gu) neutraliser").toEqual([]);
  });

  it("keeps its allow-list honest: every entry still exists in the stylesheets", () => {
    const all = SHEETS.map(([, css]) => css).join("\n");
    for (const [selector, why] of NEVER_GUJARATI) {
      expect(all, `${selector} (${why}) is stale`).toContain(`${selector} {`);
    }
  });
});
