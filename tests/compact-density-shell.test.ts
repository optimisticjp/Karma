import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, ruleBody, stripComments, token } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const globals = read("src/app/globals.css");
const premium = read("src/app/premium.css");
const header = read("src/components/site/Header.tsx");
const footer = read("src/components/site/Footer.tsx");
const banner = read("src/components/site/LangBanner.tsx");
const fab = read("src/components/site/WhatsAppFab.tsx");

/* ------------------------------------------------------------------ *
 * Fixed chrome: one height, one token, every consumer
 *
 * The public shell had FOUR hand-matched literals for two heights — the
 * header's `h-16 md:h-20`, the scrim's `top-16 md:top-20`, two
 * `calc(100dvh - Nrem)` caps on the menu panel, and `.site-body`'s
 * bottom reservation. They had already drifted: the reservation was
 * 4rem against a 3.5rem bar, which rendered as an 8px strip of Cotton
 * under the footer of every public page.
 * ------------------------------------------------------------------ */

describe("the public chrome measures itself from tokens", () => {
  it("declares each height exactly once", () => {
    for (const name of ["--header-h", "--tabbar-h", "--tabbar-item-h"]) {
      const declarations = (globals.match(new RegExp(`${name}\\s*:`, "g")) ?? []).length;
      expect(declarations, `${name} declared ${declarations} times in globals.css`).toBe(1);
    }
  });

  it("has the header, its scrim and its panel all read --header-h", () => {
    /* `.site-header` has two rules — one for its transition, one for its box —
       so this asserts the declaration rather than slicing the first match. */
    expect(premium).toContain(".site-header { height: var(--header-h); }");
    expect(declaration(ruleBody(premium, ".site-menu-scrim") as string, "top")).toBe("var(--header-h)");
    expect(declaration(ruleBody(premium, ".site-menu-panel") as string, "max-height")).toBe(
      "calc(100dvh - var(--header-h))"
    );
    /* And no literal height survives at the call site to drift away from it. */
    const shell = stripComments(header);
    expect(shell).not.toMatch(/\bh-16\b|\bmd:h-20\b|\btop-16\b|\bmd:top-20\b/);
    expect(shell).not.toContain("100dvh-4rem");
  });

  it("keeps the header past the tap floor even while compact", () => {
    /* 56px still leaves the 44px hamburger six pixels of air. Below the tap
       floor the header would be denser and unusable, which is not a trade
       this redesign is allowed to make. */
    expect(clampAt(token(globals, "--header-h") as string)).toBeGreaterThanOrEqual(48);
  });
});

/* ------------------------------------------------------------------ *
 * Stacking: the bar may not paint over the things meant to cover it
 * ------------------------------------------------------------------ */

describe("the fixed action bar stays under the modal chrome", () => {
  it("ranks below the mobile-menu scrim and the language banner", () => {
    /* It was z-45 against their z-40, so the Call/Directions bar painted ON
       TOP of the scrim of an aria-modal dialog and stayed pointer-tappable
       outside its focus trap — and it covered both of the banner's buttons.
       Neither is a taste question about layering. */
    const barZ = Number(declaration(ruleBody(premium, ".tabbar") as string, "z-index"));
    expect(Number.isFinite(barZ)).toBe(true);
    expect(stripComments(header)).toContain("site-menu-scrim");
    expect(stripComments(header)).toContain("z-40");
    expect(stripComments(banner)).toContain("z-40");
    expect(barZ, "the bar must rank below z-40").toBeLessThan(40);
  });

  it("docks the language banner clear of the bar at every width", () => {
    const rule = ruleBody(premium, ".lang-banner");
    expect(rule, ".lang-banner must exist").not.toBeNull();
    expect(declaration(rule as string, "bottom")).toContain("var(--tabbar-h)");
    expect(declaration(rule as string, "bottom")).toContain("env(safe-area-inset-bottom)");
  });

  it("has stopped testing for a component that does not exist", () => {
    /* `hasStickyBar` looked for a per-page sticky action bar that has not
       existed as a component for two redesigns. In the banner it meant the
       collision-avoiding branch never fired; in the FAB it suppressed the
       WhatsApp action on the three highest-intent routes on the site, at
       widths where the bar it was avoiding is hidden anyway. */
    expect(banner).not.toContain("hasStickyBar");
    expect(fab).not.toContain("hasStickyBar");
  });
});

/* ------------------------------------------------------------------ *
 * The footer, which is on every page and was the tallest thing on the
 * public site
 * ------------------------------------------------------------------ */

describe("the footer", () => {
  it("leads with the phone number on a phone", () => {
    /* It measured 1,031px at 390px with the studio's number 686px inside it,
       below a full viewport of slogan and prose. `order-first` moves the visit
       block on screen without moving it in the DOM, so the desktop composition
       is unchanged and the reading order still follows the visual one.

       Scanned with comments stripped: the note explaining the decision names
       the class, and matching that instead of the markup is how this test
       would silently stop checking anything. */
    const markup = stripComments(footer);
    const visitAt = markup.indexOf('aria-label={t("learn")}');
    const orderAt = markup.indexOf("order-first");
    expect(visitAt).toBeGreaterThan(-1);
    expect(orderAt).toBeGreaterThan(visitAt);
    expect(markup).toContain("order-first lg:order-none");
    expect(markup).toContain(`href={\`tel:+\${site.callPhone}\`}`);
  });

  it("shows a phone the same links a laptop shows", () => {
    /* The two link columns were `hidden md:block`, so the mobile footer was
       simultaneously the tallest one on the site and the one with the fewest
       links. At 13px in two columns they cost about 130px. */
    expect(footer).not.toContain('className="hidden md:block lg:col-span-2"');
    expect((footer.match(/footer-nav/g) ?? []).length).toBe(2);
  });

  it("is light, and says so through structure rather than a slab", () => {
    /* It was never dark — Raw Silk via `.band-human`. Recorded because the
       compact-density brief assumed otherwise, and a later session should not
       "fix" a tone that was already right. */
    expect(footer).toContain("band-human");
    expect(stripComments(footer)).not.toContain("on-carbon");
    expect(footer).toContain("border-t border-line");
  });
});

/* ------------------------------------------------------------------ *
 * The hero's first viewport
 * ------------------------------------------------------------------ */

describe("the hero earns its viewport", () => {
  const hero = read("src/components/home/Hero.tsx");
  const machineLab = read("src/app/machine-lab.css");

  it("puts the actions before the thread in one markup tree", () => {
    /* At 390x844 the demo CTA used to sit 16px behind the tab bar in English
       and entirely below the fold in Gujarati — the first-class locale paying
       the larger penalty on the most important screen. The order of the
       composition is what fixes that, and it must stay one DOM: a
       breakpoint-gated second copy is what `machine-lab-shell` bans. */
    expect(hero.indexOf("action-row")).toBeLessThan(hero.indexOf("hero-thread"));
    expect(hero.indexOf("hero-facts")).toBeLessThan(hero.indexOf("action-row"));
  });

  it("runs the three frames across a phone, not down it", () => {
    /* One column made each 4:3 frame 235px tall, so `01 SCREEN / 02 MACHINE /
       03 RESULT` cost 933px — more than a whole viewport for the part of the
       page that is supposed to be read at a glance.

       The bound moved from 639px to 959px in Phase 9: measured in a browser,
       640-959px was falling back to exactly the vertical layout this replaced,
       and the hero was 2,128px at 768 against 1,139px at 1024. The claim is
       unchanged — three across below the staggered composition — so the
       assertion follows the block rather than the number. */
    const narrow = machineLab.split("@media (max-width: 959px)").slice(1).join("\n");
    expect(narrow).toContain(".hero-thread-list");
    expect(narrow).toContain("repeat(3, minmax(0, 1fr))");
  });

  it("keeps the thread one continuous stitch when it turns", () => {
    /* The rail is drawn, not rotated: same 9-on/6-off geometry and the same
       penetration dot at every stitch head, turned through 90 degrees. A mark
       that changes geometry when it changes axis stops being the same mark. */
    const narrow = machineLab.split("@media (max-width: 959px)").slice(1).join("\n");
    expect(narrow).toContain("linear-gradient(90deg, var(--stitch-color) 0 9px, transparent 9px 15px)");
    expect(narrow).toContain("circle 1.75px at 1.75px 50%");
    /* And it is laid down along its own axis rather than wiped top-down. */
    expect(premium).toContain(".js .hero-thread-rail.stitch-wipe.stitch-path--from-top { clip-path: inset(0 100% 0 0); }");
  });
});
