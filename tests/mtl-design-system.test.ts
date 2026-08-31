import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, ruleBody, stripComments, token, contrastRatio } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const lab = read("src/app/textile-lab.css");
const globals = read("src/app/globals.css");
const publicLayout = read("src/app/[locale]/layout.tsx");
const adminLayout = read("src/app/admin/layout.tsx");

/* ------------------------------------------------------------------ *
 * The Console boundary
 *
 * There is no shared root layout in this project: `[locale]/layout.tsx`
 * and `admin/layout.tsx` are two independent roots. That is what makes
 * a public-only stylesheet possible, and it is also what makes this the
 * single most important thing to assert — the whole redesign rests on
 * it, and one stray import in the admin layout would undo it silently.
 * ------------------------------------------------------------------ */

describe("Modern Textile Lab cannot reach Karma Console", () => {
  it("is imported by the public root layout and not the admin one", () => {
    expect(publicLayout).toContain('import "../textile-lab.css"');
    expect(adminLayout).not.toContain("textile-lab");
  });

  it("scopes every rule to the public body class", () => {
    /* Belt and braces: the import boundary already stops it, and the scope
       stops a future shared import too. Everything outside `@font-face`,
       `@keyframes`, `@media` wrappers and comments must sit under
       `.site-body`. */
    const clean = stripComments(lab);
    const selectors = [...clean.matchAll(/(^|\})\s*([^{}@]+?)\s*\{/g)]
      .map((m) => m[2].trim())
      .filter((s) => s && !s.startsWith("from") && !s.startsWith("to") && !s.includes("%"));
    for (const selector of selectors) {
      for (const part of selector.split(",")) {
        const s = part.trim();
        if (!s) continue;
        expect(s.startsWith(".site-body"), `unscoped selector: ${s}`).toBe(true);
      }
    }
  });

  it("keeps the Console's own tokens out of the public scope", () => {
    /* The bridge re-points shared colour tokens. It must not touch the two
       tokens the Console owns outright, or the compact app bar and bottom
       navigation move. */
    const body = ruleBody(lab, ".site-body");
    expect(body).toBeTruthy();
    expect(body!).not.toContain("--console-header-h");
    expect(body!).not.toContain("--console-bar-h");
  });

  it("declares no Devanagari face on either sheet", () => {
    /* The public site is EN + GU. A Devanagari face was declared here for one
       day, for a Hindi locale the owner then reversed.

       `stripComments` first: globals.css mentions Devanagari in the prose
       explaining which shared marks the Gujarati subset claims. The claim
       here is that neither sheet declares a Devanagari FACE, not that neither
       says the word. */
    expect(stripComments(lab)).not.toContain("Devanagari");
    expect(stripComments(globals)).not.toContain("Devanagari");
  });
});

/* ------------------------------------------------------------------ *
 * The palette, measured
 * ------------------------------------------------------------------ */

describe("the seven public colours", () => {
  const t = (name: string) => token(lab, name) as string;

  it("declares exactly the palette the plan specifies", () => {
    expect(t("--mtl-canvas")).toBe("#f7f4ee");
    expect(t("--mtl-paper")).toBe("#ffffff");
    expect(t("--mtl-ink")).toBe("#171918");
    expect(t("--mtl-ink-muted")).toBe("#666864");
    expect(t("--mtl-thread")).toBe("#d44b35");
    expect(t("--mtl-sand")).toBe("#e9e1d5");
    expect(t("--mtl-charcoal")).toBe("#202321");
  });

  it("keeps primary text at AAA on every ground", () => {
    for (const ground of ["--mtl-canvas", "--mtl-paper", "--mtl-sand"]) {
      expect(contrastRatio(t("--mtl-ink"), t(ground)), ground).toBeGreaterThanOrEqual(7);
    }
  });

  it("carries a deep step for every colour that fails small text at its stated value", () => {
    /* Measured, and the reason both deep tokens exist:
         thread   on canvas 3.94 — below the 4.5 body floor
         inkMuted on sand   4.34 — below it too
       The answer is a darker step, never a brighter accent. */
    expect(contrastRatio(t("--mtl-thread"), t("--mtl-canvas"))).toBeLessThan(4.5);
    expect(contrastRatio(t("--mtl-ink-muted"), t("--mtl-sand"))).toBeLessThan(4.5);

    for (const ground of ["--mtl-canvas", "--mtl-paper", "--mtl-sand"]) {
      expect(
        contrastRatio(t("--mtl-thread-deep"), t(ground)),
        `thread-deep on ${ground}`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(t("--mtl-ink-muted-deep"), t(ground)),
        `ink-muted-deep on ${ground}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps secondary copy at AA on the two grounds it is used on", () => {
    for (const ground of ["--mtl-canvas", "--mtl-paper"]) {
      expect(contrastRatio(t("--mtl-ink-muted"), t(ground)), ground).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("makes the sand surface swap in the deep muted ink rather than hoping", () => {
    const body = ruleBody(lab, ".site-body .surface-sand");
    expect(body).toBeTruthy();
    expect(declaration(body!, "--color-stone")).toBe("var(--mtl-ink-muted-deep)");
  });

  it("keeps light copy legible on the one charcoal surface", () => {
    expect(contrastRatio(t("--mtl-paper"), t("--mtl-charcoal"))).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t("--mtl-charcoal-muted"), t("--mtl-charcoal"))).toBeGreaterThanOrEqual(4.5);
  });

  it("retires the two hues this palette does not have", () => {
    /* Needle Blue and Zari Copper are mapped into the seven rather than
       deleted: ninety files reference them, and an undefined token in
       Tailwind v4 silently falls back to currentColor — which is exactly how
       `border-rule` already went wrong in the Console. */
    const body = ruleBody(lab, ".site-body") as string;
    expect(declaration(body, "--color-needle")).toBe("var(--mtl-ink-muted-deep)");
    expect(declaration(body, "--color-zari")).toBe("var(--mtl-thread)");
    expect(declaration(body, "--color-zari-deep")).toBe("var(--mtl-thread-deep)");
  });
});

/* ------------------------------------------------------------------ *
 * Type scale
 * ------------------------------------------------------------------ */

describe("the type scale", () => {
  const at = (name: string, vw = 390) => clampAt(token(lab, name) as string, vw);

  it("lands inside the plan's mobile ranges at 390px", () => {
    expect(at("--text-h1")).toBeGreaterThanOrEqual(32);
    expect(at("--text-h1")).toBeLessThanOrEqual(38);
    expect(at("--text-h2")).toBeGreaterThanOrEqual(24);
    expect(at("--text-h2")).toBeLessThanOrEqual(28);
    expect(at("--text-h3")).toBeGreaterThanOrEqual(18);
    expect(at("--text-h3")).toBeLessThanOrEqual(21);
    expect(at("--text-smallmeta")).toBeGreaterThanOrEqual(12);
    expect(at("--text-smallmeta")).toBeLessThanOrEqual(15);
    expect(at("--text-btn")).toBeGreaterThanOrEqual(14);
    expect(at("--text-btn")).toBeLessThanOrEqual(15);
  });

  it("lands inside the plan's desktop ranges at 1440px", () => {
    expect(at("--text-h1", 1440)).toBeGreaterThanOrEqual(52);
    expect(at("--text-h1", 1440)).toBeLessThanOrEqual(64);
    expect(at("--text-h2", 1440)).toBeGreaterThanOrEqual(34);
    expect(at("--text-h2", 1440)).toBeLessThanOrEqual(42);
    expect(at("--text-h3", 1440)).toBeGreaterThanOrEqual(22);
    expect(at("--text-h3", 1440)).toBeLessThanOrEqual(26);
  });

  it("never shrinks body copy into a technical manual", () => {
    /* The instruction is explicit in both directions: no giant headings to
       imply premium, and no 14px body to imply precision. */
    expect(at("--text-body")).toBeGreaterThanOrEqual(15);
    expect(at("--text-bodylg")).toBeGreaterThanOrEqual(15);
  });

  it("keeps the ladder strictly ascending at both ends", () => {
    /* Every step here is a distinct role. `lead` and `bodylg` are deliberately
       absent: they are one role wearing two names and are asserted equal
       below, rather than forced into an ordering nobody could justify. */
    const ladder = ["--text-eyebrow", "--text-smallmeta", "--text-body", "--text-lead", "--text-h4", "--text-h3", "--text-h2", "--text-h1"];
    for (const vw of [390, 1440]) {
      for (let i = 1; i < ladder.length; i++) {
        expect(at(ladder[i], vw), `${ladder[i]} vs ${ladder[i - 1]} @${vw}`).toBeGreaterThan(
          at(ladder[i - 1], vw)
        );
      }
    }
  });

  it("does not keep two names for one size", () => {
    expect(token(lab, "--text-bodylg")).toBe(token(lab, "--text-lead"));
  });
});

/* ------------------------------------------------------------------ *
 * Scripts
 * ------------------------------------------------------------------ */

describe("script-specific typography", () => {
  it("gives Gujarati its own font stack rather than sharing the Latin one", () => {
    const gu = ruleBody(lab, ".site-body :lang(gu)") as string;
    expect(gu).toContain("--font-body");
    expect(gu).toContain("Gujarati");
  });

  it("ships no Devanagari face", () => {
    /* The public website is English + Gujarati. A Devanagari @font-face was
       added on 2026-08-31 for a Hindi locale and removed the same day with
       it; a font nothing renders is payload on every public page. */
    expect(stripComments(lab)).not.toContain("Devanagari");
    expect(stripComments(lab)).not.toContain("U+0900");
    expect(stripComments(lab)).not.toContain(":lang(hi)");
  });

  it("never uppercases or letterspaces Gujarati", () => {
    const gu = ruleBody(lab, ".site-body :lang(gu)") as string;
    expect(gu).toContain("letter-spacing: 0");
    expect(lab).toContain(".site-body :lang(gu) .eyebrow");
    expect(lab).toContain("text-transform: none");
  });

  it("gives Gujarati the line height its marks need", () => {
    /* Gujarati carries marks above and below the line. Latin leading clips
       them, which is a rendering bug that looks like a design choice. */
    expect(lab).toContain(".site-body :lang(gu) { line-height: 1.8; }");
  });
});

/* ------------------------------------------------------------------ *
 * Texture, surfaces and motion
 * ------------------------------------------------------------------ */

describe("texture is a moment, not a wallpaper", () => {
  it("offers exactly four texture treatments", () => {
    const textures = [...lab.matchAll(/\.site-body \.(tex-[a-z]+|thread-divider)\s*\{/g)].map((m) => m[1]);
    expect(new Set(textures)).toEqual(new Set(["tex-weave", "tex-cad", "tex-grain", "thread-divider"]));
  });

  it("keeps every texture faint enough to sit behind content", () => {
    /* The rule is that texture is noticed after the content. Anything above
       about 10% alpha is noticed first.

       Scoped to the texture rules on purpose: the first version of this swept
       the whole file and caught the bottom sheet's 45% scrim, which is a
       scrim doing its job, not a texture failing at one. */
    for (const name of ["tex-weave", "tex-cad", "tex-grain"]) {
      const body = ruleBody(lab, `.site-body .${name}`);
      expect(body, name).toBeTruthy();
      const alphas = [...body!.matchAll(/rgb\(23 25 24 \/ (0?\.\d+)\)/g)].map((m) => Number(m[1]));
      expect(alphas.length, name).toBeGreaterThan(0);
      for (const a of alphas) expect(a, `${name} alpha ${a}`).toBeLessThanOrEqual(0.1);
    }
  });

  it("draws the divider with the same running stitch as the rest of the system", () => {
    const body = ruleBody(lab, ".site-body .thread-divider") as string;
    expect(body).toContain("var(--mtl-thread) 0 9px, transparent 9px 15px");
    expect(body).toContain("circle 1.75px at 1.75px 50%");
  });
});

describe("the one dark public surface", () => {
  it("is a single named class, not a band in the vocabulary", () => {
    expect(lab).toContain(".site-body .surface-business");
    /* A `band-*` name would invite reuse by habit. A section either is the
       services hero or it is not. */
    expect(lab).not.toContain(".band-charcoal");
    expect(lab).not.toContain(".band-dark");
  });

  it("re-points the tokens rather than hoping every child sets its own colour", () => {
    const body = ruleBody(lab, ".site-body .surface-business") as string;
    expect(declaration(body, "--color-carbon")).toBe("var(--mtl-paper)");
    expect(declaration(body, "--color-stone")).toBe("var(--mtl-charcoal-muted)");
    /* Thread is 3.67:1 on charcoal, so small text there uses the light muted
       instead of a brighter red — the same rule as on canvas. */
    expect(declaration(body, "--color-vermilion-deep")).toBe("var(--mtl-thread)");
  });
});

describe("motion", () => {
  it("moves a button's arrow by 2-3px and nothing else", () => {
    const body = ruleBody(lab, ".site-body .btn:hover .arrow") as string;
    expect(body).toContain("translateX(2.5px)");
  });

  it("scales a gallery image by about 1.02 and only where hover exists", () => {
    expect(lab).toContain("scale(1.02)");
    expect(lab).toContain("@media (hover: hover)");
  });

  it("has no loop, parallax, marquee or cursor follower", () => {
    const clean = stripComments(lab);
    for (const banned of ["infinite", "parallax", "marquee", "background-attachment: fixed"]) {
      expect(clean, banned).not.toContain(banned);
    }
  });

  it("honours prefers-reduced-motion", () => {
    expect(lab).toContain("@media (prefers-reduced-motion: reduce)");
    const block = lab.slice(lab.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation: none");
    expect(block).toContain("transition: none");
  });
});

describe("controls keep their floor", () => {
  it("keeps every interactive primitive at 44px", () => {
    for (const selector of [".site-body .lab-tab", ".site-body .action-bar > *"]) {
      const body = ruleBody(lab, selector);
      expect(body, selector).toBeTruthy();
      expect(clampAt(declaration(body!, "min-height") as string), selector).toBeGreaterThanOrEqual(44);
    }
  });

  it("reserves the action bar's height from the token the bar is built from", () => {
    /* Two literals that must be edited together is how 8px of ground showed
       under every public footer the last time. */
    const reserve = ruleBody(lab, ".site-body.has-action-bar") as string;
    expect(reserve).toContain("var(--mtl-actionbar-h)");
    expect(reserve).toContain("env(safe-area-inset-bottom)");
    const bar = ruleBody(lab, ".site-body .action-bar") as string;
    expect(bar).toContain("env(safe-area-inset-bottom)");
  });

  it("states a selected tab by more than colour", () => {
    expect(lab).toContain('[aria-selected="true"]');
    expect(lab).toContain('[aria-current="true"]');
  });
});
