import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");
const premium = read("src/app/premium.css");
const globals = read("src/app/globals.css");

/**
 * The console's dense pass, pinned where it is easy to undo by accident.
 *
 * These assert on source text, like the other console tests, and for the same
 * reason: they are protecting a decision rather than a behaviour, and a
 * decision survives a refactor only if something fails when it is dropped.
 */

describe("density and touch size are not in tension", () => {
  it("keeps every row control at or above a 44px hit area", () => {
    // WCAG 2.5.5. The row is visually tight; the target overflows it with
    // negative margin rather than the row growing to fit.
    const tap = premium.slice(premium.indexOf(".tap {"), premium.indexOf(".tap:hover"));
    expect(tap).toContain("min-width: 2.75rem");
    expect(tap).toContain("min-height: 2.75rem");
    expect(tap).toContain("margin: -0.5rem -0.375rem");

    const item = premium.slice(premium.indexOf(".rec-menu__item {"), premium.indexOf(".rec-menu__item:hover"));
    expect(item).toContain("min-height: 2.75rem");
  });

  it("respects the phone's safe area at the bottom of the screen", () => {
    // A bottom sheet that ends under the home indicator hides its last action.
    expect(premium).toContain("padding: 0.5rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom))");
    expect(premium).toContain(".console-main > :last-child { padding-bottom: env(safe-area-inset-bottom); }");
  });

  it("gives a phone the full width instead of a shrunken desktop canvas", () => {
    const phone = premium.slice(premium.indexOf("@media (max-width: 767px) {\n  .console-main"));
    expect(phone).toContain("padding-inline: 0.75rem");
  });

  it("keeps search and filters reachable while a long list scrolls", () => {
    const toolbar = premium.slice(premium.indexOf(".toolbar {"), premium.indexOf(".toolbar .input"));
    expect(toolbar).toContain("position: sticky");
    // Clears the mobile console header, and sits at the top on desktop where
    // there is no header to clear.
    /* The anchor was a literal hand-matched to a `min-h-16` in the shell
       component, two files apart. It reads the app bar's own token now, so a
       change to the bar height cannot leave a gap or an overlap that nothing
       catches — which is a stricter rule than the number ever was. */
    expect(toolbar).toContain("top: var(--console-header-h)");
    expect(read("src/app/globals.css")).toContain("--console-header-h:");
    expect(read("src/app/premium.css")).toContain(".console-appbar { height: var(--console-header-h); }");
    expect(premium).toContain(".toolbar { top: 0; }");
  });

  it("never letterspaces or uppercases Gujarati in the new primitives", () => {
    // CLAUDE.md #1. Latin tracking on Gujarati is unreadable, and the new
    // uppercase label style is exactly where this gets forgotten.
    expect(premium).toContain(":lang(gu) .chip { letter-spacing: 0; }");
    expect(premium).toContain(":lang(gu) .kv-label { letter-spacing: 0; text-transform: none;");
  });
});

describe("the dense pass added no component kit", () => {
  it("builds the record menu from a native <details>, not a library", () => {
    const menu = read("src/components/admin/RecordMenu.tsx");
    expect(menu).toContain("<details");
    expect(menu).toContain("<summary");
    // A popover library, a portal or a focus-trap dependency would all show up
    // as an import; the Worker has a 3 MB budget and this is a menu.
    for (const banned of ["@radix-ui", "@headlessui", "floating-ui", "react-modal", "framer-motion"]) {
      expect(menu, banned).not.toContain(banned);
    }
  });

  it("closes on Escape and on a click elsewhere, like every other menu", () => {
    const menu = read("src/components/admin/RecordMenu.tsx");
    expect(menu).toContain('event.key === "Escape"');
    expect(menu).toContain('document.addEventListener("pointerdown"');
  });

  it("does not fetch a dependency count for every row of a list", () => {
    // Deletion is a link to its own page precisely so a preflight query runs
    // once, when somebody actually means it — not N times on every render.
    const menu = read("src/components/admin/RecordMenu.tsx");
    expect(menu).toContain("/admin/records/${entity}/${id}/delete");
    expect(menu).not.toContain("preflight");
  });
});

describe("status colour stays status-only", () => {
  it("adds red as a status, never as decoration", () => {
    // Design system rule: vermilion is the one interface accent; green, amber
    // and red mean something.
    expect(globals).toContain(".status-error { color: var(--color-error); }");
  });
});
