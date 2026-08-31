import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { clampAt, contrastRatio, ruleBody, stripComments, token, PHONE } from "./helpers/measure";
import { courses } from "../src/content/courses";
import { STITCH_SWATCHES } from "../src/components/kds/StitchSwatch";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const css = read("src/app/thread-machine-proof.css");
const clean = stripComments(css);

const DESKTOP = 1440;

/**
 * THREAD / MACHINE / PROOF — the foundation, measured.
 *
 * The previous design system was stopped because it was a token bridge over
 * the old one. These tests are the mechanical part of making sure this one is
 * not: they check that the system declares its own values, that those values
 * are the ones the plan asked for, that Karma Console cannot be reached, and
 * that the logo-neutral claim is arithmetic rather than an aspiration.
 *
 * Every contrast ratio below is recomputed from the file on every run. If
 * somebody changes a hex, this fails with the number.
 */

/* ------------------------------------------------------------------ *
 * Console isolation — the rule that must never quietly break
 * ------------------------------------------------------------------ */

describe("the public system cannot reach Karma Console", () => {
  it("is imported by the public roots only", () => {
    const importsOf = (p: string) =>
      [...read(p).matchAll(/^import "([^"]+)";$/gm)].map((m) => m[1]);
    expect(importsOf("src/app/[locale]/layout.tsx")).toContain("../thread-machine-proof.css");
    expect(importsOf("src/app/design/layout.tsx")).toContain("../thread-machine-proof.css");
    expect(importsOf("src/app/admin/layout.tsx")).not.toContain("../thread-machine-proof.css");
  });

  it("scopes every rule to .kds", () => {
    /* The second lock. Even a stray import into the admin tree restyles
       nothing, because nothing there carries the class. */
    const selectors = clean
      .split("}")
      .map((block) => block.split("{")[0].trim())
      .filter(Boolean)
      .filter((s) => !s.startsWith("@") && !s.startsWith("from") && !s.startsWith("to") && !/^\d+%$/.test(s));

    const unscoped = selectors.filter((sel) =>
      sel
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .some((s) => !s.startsWith(".kds"))
    );
    expect(unscoped).toEqual([]);
  });

  it("adds nothing to the stylesheet the Console shares", () => {
    /* `globals.css` carries Tailwind's @theme, the reset and the fonts, and
       Karma Console runs on it. The rebuild is not allowed to change it. */
    const globals = read("src/app/globals.css");
    expect(globals).not.toContain("--brand-accent");
    expect(globals).not.toContain(".kds");
  });

  it("left no fourth generation of public CSS loaded", () => {
    /* The plan's §2.3: the site must not finish with several stylesheet
       generations fighting through source order. `textile-lab.css` was
       replaced by this file rather than layered under it. */
    const sheets = readdirSync(join(process.cwd(), "src/app")).filter((f) => f.endsWith(".css"));
    expect(sheets).not.toContain("textile-lab.css");
    /* The IMPORTS, not the prose — the comment beside them explains what was
       replaced, and a substring check would fail on its own explanation. */
    const imports = [...read("src/app/[locale]/layout.tsx").matchAll(/^import "([^"]+)";$/gm)].map((m) => m[1]);
    expect(imports).not.toContain("../textile-lab.css");
    expect(imports).toContain("../thread-machine-proof.css");
  });
});

/* ------------------------------------------------------------------ *
 * The logo-neutral accent adapter
 * ------------------------------------------------------------------ */

describe("the brand accent is replaceable", () => {
  const accent = token(css, "--brand-accent") as string;
  const strong = token(css, "--brand-accent-strong") as string;
  const onAccent = token(css, "--brand-on-accent") as string;
  const canvas = token(css, "--s-canvas") as string;
  const cloth = token(css, "--s-cloth") as string;
  const mistDeep = token(css, "--s-mist-deep") as string;

  it("declares exactly four brand variables", () => {
    const declared = [...clean.matchAll(/--brand-[a-z-]+:/g)].map((m) => m[0]);
    expect(new Set(declared)).toEqual(
      new Set(["--brand-accent:", "--brand-accent-strong:", "--brand-accent-soft:", "--brand-on-accent:"])
    );
  });

  it("hardcodes no other hue anywhere in the file", () => {
    /* Every chromatic decision must run through the four variables above, or
       a future logo in another colour means redesigning pages. Greys, the
       three status colours and pure black/white alphas are allowed. */
    const ALLOWED = new Set(
      [
        token(css, "--s-paper"),
        token(css, "--s-canvas"),
        token(css, "--s-cloth"),
        token(css, "--s-mist"),
        token(css, "--s-mist-deep"),
        token(css, "--ink"),
        token(css, "--ink-muted"),
        token(css, "--line"),
        token(css, "--line-cool"),
        token(css, "--line-strong"),
        token(css, "--ok"),
        token(css, "--warn"),
        token(css, "--bad"),
        token(css, "--brand-accent"),
        token(css, "--brand-accent-strong"),
        token(css, "--brand-accent-soft"),
        token(css, "--brand-on-accent")
      ].map((v) => (v ?? "").toLowerCase())
    );
    const hexes = [...clean.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase());
    const stray = [...new Set(hexes)].filter((h) => !ALLOWED.has(h));
    expect(stray).toEqual([]);
  });

  it("carries its own text colour at 4.5:1", () => {
    /* A primary action is normal-size text by WCAG's definition, so 4.5 is
       the floor and not 3.0. This is why there are two reds. */
    expect(contrastRatio(onAccent, strong)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps accent TEXT readable on every ground", () => {
    for (const ground of [canvas, cloth, mistDeep]) {
      expect(contrastRatio(strong, ground), `${strong} on ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps the thread accent above the 3:1 non-text floor", () => {
    /* The brighter red is only ever a fill, a mark or large type. */
    for (const ground of [canvas, cloth, mistDeep]) {
      expect(contrastRatio(accent, ground), `${accent} on ${ground}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("would still work if the owner's logo arrived in another colour", () => {
    /* The claim in the file header, recomputed. If one of these ever fails,
       the header is wrong and has to change with it. */
    const alternates = { blue: "#1f5fa8", green: "#1f6b43", gold: "#8a6a12", black: "#14171a" };
    for (const [name, hex] of Object.entries(alternates)) {
      expect(contrastRatio(hex, canvas), `${name} on canvas`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio("#ffffff", hex), `white on ${name}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Ink and surfaces
 * ------------------------------------------------------------------ */

describe("ink is readable on every ground", () => {
  const grounds = ["--s-paper", "--s-canvas", "--s-cloth", "--s-mist", "--s-mist-deep"].map(
    (n) => [n, token(css, n) as string] as const
  );

  it("has five grounds across two material registers", () => {
    expect(grounds.every(([, v]) => /^#[0-9a-f]{6}$/i.test(v))).toBe(true);
    /* The cool register is what stops the site reading as beige minimalism,
       so its existence is asserted rather than assumed. */
    const mist = token(css, "--s-mist") as string;
    const cloth = token(css, "--s-cloth") as string;
    const blueness = (hex: string) => parseInt(hex.slice(5, 7), 16) - parseInt(hex.slice(1, 3), 16);
    expect(blueness(mist)).toBeGreaterThan(blueness(cloth));
  });

  it("passes 4.5:1 for BODY copy on all five, with one muted ink", () => {
    /* One muted ink and no per-surface variant, precisely so there is nothing
       to forget: it has to clear the floor on the deepest ground. */
    const muted = token(css, "--ink-muted") as string;
    for (const [name, ground] of grounds) {
      expect(contrastRatio(muted, ground), `muted on ${name}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("passes 7:1 for primary ink on all five", () => {
    const ink = token(css, "--ink") as string;
    for (const [name, ground] of grounds) {
      expect(contrastRatio(ink, ground), `ink on ${name}`).toBeGreaterThanOrEqual(7);
    }
  });

  it("keeps status colours independent of the brand", () => {
    /* "This batch is full" must not change colour because a logo arrived. */
    for (const name of ["--ok", "--warn", "--bad"]) {
      const value = token(css, name) as string;
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/i);
      expect(value.toLowerCase()).not.toBe((token(css, "--brand-accent") as string).toLowerCase());
      for (const [gname, ground] of grounds) {
        expect(contrastRatio(value, ground), `${name} on ${gname}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("declares no full-width dark surface", () => {
    /* Plan §9.1, absolute for this redesign — including the Services hero,
       which the previous direction had made charcoal. */
    const grounds5 = grounds.map(([, v]) => v);
    for (const g of grounds5) {
      expect(contrastRatio("#ffffff", g), g).toBeLessThan(1.6);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Type
 * ------------------------------------------------------------------ */

describe("the type scale is the plan's scale", () => {
  const at = (name: string, vw: number) => clampAt(token(css, name) as string, vw);

  it("hits the plan's mobile targets at 390", () => {
    /* Plan §10. Hero 34–40, page h1 28–34, h2 23–28, h3 18–21,
       body 15.5–17, meta 12–14, buttons 14–15. */
    expect(at("--t-h1-hero", PHONE)).toBeGreaterThanOrEqual(34);
    expect(at("--t-h1-hero", PHONE)).toBeLessThanOrEqual(40);
    expect(at("--t-h1", PHONE)).toBeGreaterThanOrEqual(28);
    expect(at("--t-h1", PHONE)).toBeLessThanOrEqual(34);
    expect(at("--t-h2", PHONE)).toBeGreaterThanOrEqual(23);
    expect(at("--t-h2", PHONE)).toBeLessThanOrEqual(28);
    expect(at("--t-h3", PHONE)).toBeGreaterThanOrEqual(18);
    expect(at("--t-h3", PHONE)).toBeLessThanOrEqual(21);
    expect(at("--t-body", PHONE)).toBeGreaterThanOrEqual(15.5);
    expect(at("--t-body", PHONE)).toBeLessThanOrEqual(17);
    expect(at("--t-meta", PHONE)).toBeGreaterThanOrEqual(12);
    expect(at("--t-meta", PHONE)).toBeLessThanOrEqual(14);
    expect(at("--t-btn", PHONE)).toBeGreaterThanOrEqual(14);
    expect(at("--t-btn", PHONE)).toBeLessThanOrEqual(15.5);
  });

  it("hits the plan's desktop targets at 1440", () => {
    expect(at("--t-h1-hero", DESKTOP)).toBeGreaterThanOrEqual(54);
    expect(at("--t-h1-hero", DESKTOP)).toBeLessThanOrEqual(68);
    expect(at("--t-h1", DESKTOP)).toBeGreaterThanOrEqual(44);
    expect(at("--t-h1", DESKTOP)).toBeLessThanOrEqual(56);
    expect(at("--t-h2", DESKTOP)).toBeGreaterThanOrEqual(32);
    expect(at("--t-h2", DESKTOP)).toBeLessThanOrEqual(42);
    expect(at("--t-h3", DESKTOP)).toBeGreaterThanOrEqual(22);
    expect(at("--t-h3", DESKTOP)).toBeLessThanOrEqual(27);
  });

  it("never lets a level cross the one below it", () => {
    /* The bug this catches is real and has happened here before: a clamp
       whose slope differs from its neighbour's crosses over at one width, and
       a heading renders smaller than its own lede at exactly 390px. */
    const order = ["--t-display", "--t-h1-hero", "--t-h1", "--t-h2", "--t-h3", "--t-h4", "--t-body", "--t-meta", "--t-micro"];
    for (const vw of [320, 360, PHONE, 430, 768, 820, 1024, 1280, DESKTOP, 1920]) {
      for (let i = 1; i < order.length; i += 1) {
        expect(
          at(order[i - 1], vw),
          `${order[i - 1]} > ${order[i]} at ${vw}`
        ).toBeGreaterThan(at(order[i], vw));
      }
    }
  });

  it("keeps the lede above body and at or below h4 at every width", () => {
    for (const vw of [320, PHONE, 768, 1024, DESKTOP]) {
      expect(at("--t-lede", vw), `lede > body at ${vw}`).toBeGreaterThan(at("--t-body", vw));
      expect(at("--t-lede", vw), `lede <= h3 at ${vw}`).toBeLessThanOrEqual(at("--t-h3", vw));
    }
  });

  it("does not make small technical type the dominant voice", () => {
    /* Plan §10: "avoid tiny machine-manual typography as the dominant voice".
       The technical label exists and is bounded; what makes it rare is that
       it is one token rather than the default heading treatment. */
    expect(at("--t-micro", PHONE)).toBeGreaterThanOrEqual(11.5);
    expect(clean).toContain("--t-micro");
  });
});

/* ------------------------------------------------------------------ *
 * Gujarati
 * ------------------------------------------------------------------ */

describe("Gujarati is protected by the system, not by each call site", () => {
  it("switches tracking off rather than asking callers to remember", () => {
    const body = ruleBody(css, ".kds :lang(gu)") as string;
    expect(body).toContain("letter-spacing: 0");
    expect(body).toContain("--track-display: 0");
    expect(body).toContain("--track-tight: 0");
  });

  it("never uppercases a Gujarati label", () => {
    expect(clean).toContain(".kds :lang(gu) .t-micro");
    expect(clean).toContain("text-transform: none");
  });

  it("gives the script the line height its marks need", () => {
    const body = ruleBody(css, ".kds :lang(gu)") as string;
    const lh = Number(/line-height:\s*([\d.]+)/.exec(body)?.[1]);
    expect(lh).toBeGreaterThanOrEqual(1.7);
  });

  it("falls back from the italic accent, which has no Gujarati", () => {
    expect(clean).toContain(".kds :lang(gu) .t-editorial");
  });
});

/* ------------------------------------------------------------------ *
 * Motion
 * ------------------------------------------------------------------ */

describe("motion", () => {
  it("uses several grammars rather than fading everything upward", () => {
    /* Plan §13 and addendum §16: more than one motion idea, each with a job.
       "Every section fades up" is the template tell. */
    const keyframes = [...clean.matchAll(/@keyframes\s+([a-z-]+)/g)].map((m) => m[1]);
    expect(new Set(keyframes).size).toBeGreaterThanOrEqual(4);
  });

  it("loops nothing and follows no cursor", () => {
    expect(clean).not.toContain("infinite");
    expect(clean).not.toContain("alternate");
    expect(clean).not.toMatch(/animation:[^;]*\binfinite\b/);
  });

  it("renders a COMPLETE final state under reduced motion", () => {
    /* Not a shorter animation — the whole thing, finished. A thread that has
       not drawn is an invisible rule, so it is given its full size back. */
    const block = clean.slice(clean.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation-duration: 0.01ms");
    expect(block).toContain(".kds .thread-draw { background-size: 15px 2px; }");
    expect(block).toContain(".kds .tile:hover img { transform: none; }");
  });

  it("gives both thread orientations a block box", () => {
    /* Both render on a `<span>`, and an inline box ignores width and height —
       so the vertical thread was invisible until it declared `display`. */
    for (const selector of [".kds .thread", ".kds .thread-v"]) {
      expect(ruleBody(css, selector), selector).toContain("display: block");
    }
  });

  it("keeps one stitch geometry across every stitched thing", () => {
    /* 9 on, 6 off — the thread, the progress bar and the link underline all
       measure the same, because one mark has to look like one mark. */
    const stitched = [...clean.matchAll(/0 9px, transparent 9px 15px/g)];
    expect(stitched.length).toBeGreaterThanOrEqual(4);
  });
});

/* ------------------------------------------------------------------ *
 * Touch targets and focus
 * ------------------------------------------------------------------ */

describe("interaction", () => {
  it("gives every action a 44px-plus target", () => {
    for (const selector of [".kds .act", ".kds .act-quiet"]) {
      const body = ruleBody(css, selector) as string;
      const min = /min-height:\s*([\d.]+)rem/.exec(body)?.[1];
      expect(Number(min) * 16, selector).toBeGreaterThanOrEqual(44);
    }
  });

  it("keeps focus visible and never removes an outline", () => {
    expect(clean).toContain(".kds :focus-visible");
    expect(clean).not.toContain("outline: none");
    expect(clean).not.toContain("outline: 0");
  });

  it("offsets anchors from the sticky header", () => {
    expect(clean).toContain("scroll-padding-top");
  });

  it("buttons are square-cornered, not pills", () => {
    /* A 999px radius is app chrome. These are machine controls. */
    const body = ruleBody(css, ".kds .act") as string;
    expect(body).toContain("border-radius: var(--r-ui)");
    expect(clampAt(token(css, "--r-ui") as string, PHONE)).toBeLessThanOrEqual(8);
  });
});

/* ------------------------------------------------------------------ *
 * The swatches
 * ------------------------------------------------------------------ */

describe("every course has a stitch swatch", () => {
  const source = read("src/components/kds/StitchSwatch.tsx");

  it("covers all eleven courses and invents no twelfth", () => {
    expect(courses).toHaveLength(11);
    expect(Object.keys(STITCH_SWATCHES).sort()).toEqual(courses.map((c) => c.slug).sort());
  });

  it("states no machine specification", () => {
    /* A drawing that invents a specification is the same false claim as a
       stock photograph, and harder to spot. */
    const text = stripComments(source).toLowerCase();
    for (const spec of ["rpm", "stitches per minute", " spm", "mm/s", "needles"]) {
      expect(text, spec).not.toContain(spec);
    }
  });

  it("draws in the brand accent rather than a hardcoded hue", () => {
    /* Otherwise eleven swatches quietly stay red when the logo turns blue. */
    expect(source).toContain("var(--brand-accent)");
    const hexes = [...stripComments(source).matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => m[0]);
    /* One white remains, as the documented fallback for the ground a drawing
       punches back through when no tile background is set. */
    expect(hexes.every((h) => h.toLowerCase() === "#fff")).toBe(true);
  });

  it("puts EMCAD on the cool register and nothing else", () => {
    const machine = Object.entries(STITCH_SWATCHES).filter(([, s]) => s.register === "machine");
    expect(machine.map(([slug]) => slug)).toEqual(["emcad-embroidery-design"]);
  });
});

/* ------------------------------------------------------------------ *
 * The showcase itself
 * ------------------------------------------------------------------ */

describe("the design reference", () => {
  it("is not indexed and not in the sitemap", () => {
    expect(read("src/app/design/layout.tsx")).toContain("index: false");
    expect(read("src/app/sitemap.ts")).not.toContain("/design");
  });

  it("renders on the new system alone", () => {
    /* It loads globals for the reset and fonts, and neither of the two older
       public stylesheets. Anything that only looks right on a public page is
       borrowing from the old system, and this is where that shows up. */
    /* Read the IMPORTS, not the prose: the comment above them names the two
       sheets it is deliberately not loading, and a substring check on the
       whole file would fail on the explanation of its own rule. */
    const imports = [...read("src/app/design/layout.tsx").matchAll(/^import "([^"]+)";$/gm)].map((m) => m[1]);
    expect(imports).toContain("../globals.css");
    expect(imports).toContain("../thread-machine-proof.css");
    expect(imports).not.toContain("../premium.css");
    expect(imports).not.toContain("../machine-lab.css");
  });

  it("demonstrates every primitive the quality gate lists", () => {
    const page = read("src/app/design/page.tsx");
    for (const primitive of [
      "StitchSwatch",
      "ThreadLine",
      "NeedlePoint",
      "HoopWindow",
      "ThreadProgress",
      "MachineFrame",
      "PhotoFrame",
      "FeaturedReview",
      "ReviewRail",
      "RatingBlock",
      "StoryJourney",
      "TrustedByRail",
      "SocialProof",
      "MicroProof"
    ]) {
      expect(page, primitive).toContain(primitive);
    }
    for (const treatment of ["glass", "glow-screen", "bento", "strip", "board", "act-primary", "chip"]) {
      expect(page, treatment).toContain(treatment);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Weight
 * ------------------------------------------------------------------ */

describe("the system stays one system", () => {
  it("is one public stylesheet, not a folder of overrides", () => {
    /* The rule that matters is the COUNT, not the bytes: the old public
       system reached 5,600 lines across three sheets fighting through source
       order, which is how it became impossible to know what any class did.
       One file can be read start to finish. */
    const sheets = readdirSync(join(process.cwd(), "src/app")).filter((f) => f.endsWith(".css"));
    const publicSheets = sheets.filter((f) => f === "thread-machine-proof.css");
    expect(publicSheets).toEqual(["thread-machine-proof.css"]);
  });

  it("has not sprawled", () => {
    /* A sprawl guard, deliberately NOT a performance budget — the Worker gzip
       measured at deploy is the performance budget, and this file compresses
       heavily. The ceiling has headroom for the routes still to be rebuilt;
       if it is ever hit, the answer is to look for duplication rather than to
       raise it again. */
    const bytes = statSync(join(process.cwd(), "src/app/thread-machine-proof.css")).size;
    expect(bytes).toBeLessThan(96_000);
  });
});
