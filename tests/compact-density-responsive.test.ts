import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { declaration, ruleBody, stripComments } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const globals = read("src/app/globals.css");
const premium = read("src/app/premium.css");
const lab = read("src/app/machine-lab.css");

/* ------------------------------------------------------------------ *
 * Phase 9 — what a real browser found that reading the file could not
 *
 * These assertions all come from measuring Chromium at 320/360/375/390/
 * 430/768/820/1024/1280/1440 on twenty routes in both locales. Each one
 * pins a fact that was WRONG in the shipped build and is now right; the
 * measurement itself cannot run in CI, so the CSS fact stands in for it.
 * ------------------------------------------------------------------ */

describe("the cascade runs the right way round", () => {
  it("puts the hero's phone overrides after the base rules they override", () => {
    /* THE bug of this phase, and it was invisible in the source: a media query
       adds no specificity, so `.hero-frame-knot { left: -2.25rem }` declared
       BELOW the phone block won on source order and the knot rendered 36px off
       the left edge of a 390px viewport — measured at left=-18, right=-3,
       entirely out of sight. `.hero-frame-step` never stacked and
       `.hero-thread-foot` kept its 2.25rem rail padding for the same reason.

       Order is the whole assertion. If a later session moves either block,
       this fails rather than the layout silently half-applying again. */
    const base = lab.indexOf(".hero-frame-knot {\n  position: absolute;");
    const override = lab.indexOf(".hero-frame-knot {\n    left: 0;");
    expect(base, "base rule not found").toBeGreaterThan(-1);
    expect(override, "phone override not found").toBeGreaterThan(-1);
    expect(override).toBeGreaterThan(base);

    const stepBase = lab.indexOf(".hero-frame-step {\n  display: flex;");
    const stepOverride = lab.indexOf(".hero-frame-step {\n    flex-direction: column;");
    expect(stepOverride).toBeGreaterThan(stepBase);

    const footBase = lab.indexOf(".hero-thread-foot {\n  display: flex;");
    const footOverride = lab.indexOf(".hero-thread-foot { padding-left: 0;");
    expect(footOverride).toBeGreaterThan(footBase);
  });

  it("runs the three-across hero all the way to the staggered composition", () => {
    /* 640-959px fell back to the vertical base layout, where the hero measured
       2,128px at 768 against 1,139px at 1024 — the single worst block in the
       tablet range, on the widest screens that still have no room for it. */
    expect(lab).not.toContain("@media (max-width: 639px)");
    expect(lab).toContain("@media (max-width: 959px)");
    expect(lab).toContain("@media (min-width: 960px)");
  });
});

describe("a control that stands on its own is a control-sized target", () => {
  it("floors the brand mark inside the header it already fills", () => {
    /* The site's home link, and the most-tapped control in the header, was a
       28px target inside a 56px bar. */
    const body = ruleBody(premium, ".site-brand-mark");
    expect(body).toBeTruthy();
    expect(declaration(body!, "min-height")).toBe("2.75rem");
  });

  it("floors the tertiary CTA so it does not drift by language", () => {
    /* Its height came from the line box plus padding, so it measured 44px in
       English and 41.2px in Gujarati on the same hero at the same width. A
       control beside a `.btn` matches the `.btn` floor in both. */
    const body = ruleBody(premium, ".cta-tertiary");
    expect(declaration(body!, "min-height")).toBe("2.75rem");
  });

  it("has one class for the section-level 'see all' link", () => {
    /* Six call sites, five spellings of the same affordance, measuring 26px,
       32px and 32px. It is not an inline link inside a sentence, so WCAG
       2.5.8's inline exception does not cover it. */
    const body = ruleBody(premium, ".link-more");
    expect(body).toBeTruthy();
    expect(declaration(body!, "min-height")).toBe("2.75rem");
    for (const file of ["src/app/[locale]/verify/[id]/page.tsx"]) {
      const source = read(file);
      expect(source, file).toContain("link-more");
      expect(stripComments(source), file).not.toContain("min-h-8 shrink-0");
    }
    /* The rebuilt surfaces use `.act-quiet` for the same job. It carries the
       floor in the system rather than at each call site, which is why the
       list above shrinks as routes are rebuilt rather than growing. */
    const tmp = read("src/app/thread-machine-proof.css");
    expect(declaration(ruleBody(tmp, ".kds .act-quiet")!, "min-height")).toBe("2.75rem");
  });

  it("floors the links in the hero caption row", () => {
    const body = ruleBody(lab, ".hero-thread-foot a");
    expect(declaration(body!, "min-height")).toBe("2.75rem");
  });
});

describe("nothing lands behind the sticky chrome", () => {
  it("reserves the chrome at both ends of the scroll container", () => {
    /* `scroll-margin-top` on `[id]` only covers an anchor jump. Keyboard focus
       scrolling had nothing: tabbing to the last card on /contact at 390px put
       it half-behind the fixed tab bar, measured. `scroll-padding` covers the
       anchor jump, `scrollIntoView()` and focus at once. */
    /* Slice first: `globals.css` has three `html` rules and `ruleBody` takes
       the first, which is `scroll-behavior: smooth`. */
    const block = globals.slice(globals.indexOf("clear the sticky chrome at BOTH ends"));
    const body = ruleBody(block, "html");
    expect(body).toBeTruthy();
    expect(declaration(body!, "scroll-padding-top")).toContain("--header-h");
    const bottom = declaration(body!, "scroll-padding-bottom");
    expect(bottom).toContain("--tabbar-h");
    expect(bottom).toContain("env(safe-area-inset-bottom)");
  });

  it("gives the console its own chrome heights rather than sharing a constant", () => {
    /* `globals.css` is shared between the two products and their bars are not
       the same height. One constant would be wrong on one of them. */
    const block = globals.slice(globals.indexOf("clear the sticky chrome at BOTH ends"));
    const body = ruleBody(block, "html:has(> body.console-root)");
    expect(body).toBeTruthy();
    expect(declaration(body!, "scroll-padding-top")).toContain("--console-header-h");
    expect(declaration(body!, "scroll-padding-bottom")).toContain("--console-bar-h");
  });

  it("stops reserving bottom chrome where there is none", () => {
    /* `.tabbar` is `xl:hidden` and `.console-bar` is `lg:hidden`. */
    expect(globals).toContain("@media (min-width: 1280px)");
    expect(globals).toContain("@media (min-width: 1024px)");
  });
});

describe("a wider screen is never a taller page", () => {
  it("puts the studio photographs side by side at the tablet breakpoint", () => {
    /* Two 4:3 frames stacked full-width at exactly 768px were 1,076px — taller
       than the same band on a 430px phone. The grid went 2-up at 800. */
    expect(lab).toContain("@media (min-width: 768px) {\n  .about-place {");
  });

  it("puts the work wall three across at the tablet breakpoint", () => {
    /* Two columns at 768 made each tile ~350px wide against ~200px on a phone,
       so the wall grew as the screen did: 967px at 430, 1,623px at 820. */
    expect(lab).toContain("@media (min-width: 768px) {\n  .work-wall {");
    expect(lab).not.toContain("@media (min-width: 900px) {\n  .work-wall {");
  });

  it("splits the About cards at md rather than lg", () => {
    const about = read("src/app/[locale]/about/page.tsx");
    expect(about).toContain("md:grid-cols-2");
    expect(stripComments(about)).not.toContain("lg:grid-cols-2");
  });
});
