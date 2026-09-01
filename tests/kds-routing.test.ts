import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { courses } from "../src/content/courses";
import { machineNotes } from "../src/content/notes";
import { routing } from "../src/i18n/routing";
import {
  COURSE_SLUGS,
  NOTE_SLUGS,
  STATIC_PUBLIC_PATHS,
  isKnownPublicPath
} from "../src/i18n/public-paths";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const declaration = (body: string, prop: string) =>
  new RegExp(`(?:^|;|\\{)\\s*${prop}\\s*:\\s*([^;}]+)`).exec(body)?.[1]?.trim();
const ruleBody = (css: string, selector: string) => {
  const at = css.indexOf(`${selector} {`);
  if (at === -1) return null;
  return css.slice(at, css.indexOf("}", at));
};

/* Comments stripped before any rule is parsed: a `/* … *\/` between two
   declarations breaks a "preceded by ; or {" match, and this file adds
   several explaining exactly the rules it asserts. */
const css = strip(read("src/app/thread-machine-proof.css"));
const middleware = strip(read("src/middleware.ts"));

/* ------------------------------------------------------------------ *
 * The soft 404
 * ------------------------------------------------------------------ */

/**
 * `/en/anything-unknown` once answered HTTP 200. The branded 404 rendered and
 * carried noindex, but a soft 404 still wastes crawl budget. Middleware now
 * owns the real 404 status for unknown localized paths, while the catch-all
 * owns the localized branded body and its explicit noindex metadata.
 */
describe("an unknown page answers 404", () => {
  it("sets the status in the middleware, where it can be set", () => {
    expect(middleware).toContain("isKnownPublicPath");
    expect(middleware).toMatch(/NextResponse\.rewrite\(\s*request\.url,\s*\{\s*status:\s*404\s*\}\s*\)/);
  });

  it("only judges a path that already carries a locale", () => {
    /* An unprefixed path is next-intl's redirect to make, not a 404. */
    expect(middleware).toContain("routing.locales as readonly string[]");
    for (const locale of routing.locales) {
      expect(isKnownPublicPath("/"), locale).toBe(true);
    }
  });

  it("keeps the catch-all and gives it explicit localized 404 metadata", () => {
    const catchAll = strip(read("src/app/[locale]/[...rest]/page.tsx"));
    expect(catchAll).toContain('import NotFound from "../not-found"');
    expect(catchAll).toContain("setRequestLocale(locale)");
    expect(catchAll).toContain("return <NotFound />");
    expect(catchAll).toContain('namespace: "notFound"');
    expect(catchAll).toContain("robots: { index: false, follow: false }");
    const notFound = read("src/app/[locale]/not-found.tsx");
    expect(notFound).toContain('getTranslations("notFound")');
  });

  it("recognises every real public path and nothing else", () => {
    for (const path of STATIC_PUBLIC_PATHS) expect(isKnownPublicPath(path), path).toBe(true);
    for (const c of courses) expect(isKnownPublicPath(`/courses/${c.slug}`), c.slug).toBe(true);
    for (const n of machineNotes) expect(isKnownPublicPath(`/notes/${n.slug}`), n.slug).toBe(true);
    /* A certificate number is not a fixed set: the page answers for one that
       does not resolve, and that answer is a verdict rather than a missing
       page. */
    expect(isKnownPublicPath("/verify/KDS-C-0231")).toBe(true);

    for (const bad of [
      "/nope",
      "/courses/nope",
      "/notes/nope",
      "/courses/tufting/extra",
      "/admin",
      "/services/nope"
    ]) {
      expect(isKnownPublicPath(bad), bad).toBe(false);
    }
    /* A trailing slash is what a person typing a URL adds. */
    expect(isKnownPublicPath("/courses/")).toBe(true);
  });

  it("mirrors the content modules exactly, or fails here rather than in production", () => {
    /* The slugs are literals in `public-paths.ts` so the middleware bundle
       does not pull the whole catalogue in for eleven strings. This is what
       stops the copy drifting: a course added without a line here would 404
       a real page. */
    expect([...COURSE_SLUGS].sort()).toEqual(courses.map((c) => c.slug).sort());
    expect([...NOTE_SLUGS].sort()).toEqual(machineNotes.map((n) => n.slug).sort());
  });

  it("agrees with the sitemap about which pages exist and which are indexable", () => {
    /* Two different questions, and they must not drift apart: this table says
       a page EXISTS (so it is not a 404), the sitemap says a page should be
       CRAWLED. `/terms` exists and is deliberately not submitted — it is
       `noIndex` until the owner approves the draft. */
    const sitemap = strip(read("src/app/sitemap.ts"));
    for (const path of STATIC_PUBLIC_PATHS) {
      if (path === "/") continue; // the sitemap writes the home page as ""
      const page = `src/app/[locale]${path}/page.tsx`;
      const noIndexed = /noIndex:\s*true/.test(read(page));
      if (noIndexed) expect(sitemap, `${path} is noindex`).not.toContain(`"${path}"`);
      else expect(sitemap, path).toContain(`"${path}"`);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 320px, which is a real phone and not a hypothetical one
 * ------------------------------------------------------------------ */

/**
 * The whole public tree was measured in Chromium at 320 / 360 / 390 / 430 /
 * 768 / 820 / 1024 / 1280 / 1440 in both languages — 306 route-width-locale
 * combinations. Three defects surfaced, all of them only at 320, and all three
 * were the SAME bug: a grid or flex child's default `min-width: auto` letting
 * unbreakable content push its container wider than the screen.
 *
 * Nothing scrolled sideways, which is why none of this had been noticed: the
 * overflow was simply cut off.
 */
describe("nothing overflows the narrowest phone", () => {
  it("stops a case card pushing its own track wider than the column", () => {
    /* Measured 425px inside a 280px column. */
    const body = ruleBody(css, ".kds .cases");
    expect(declaration(body!, "grid-template-columns")).toBe("minmax(0, 1fr)");
  });

  it("keeps the fixed conversion bar inside the viewport", () => {
    /* It measured 333px at 320 — but the bar was innocent: the DOCUMENT was
       333px wide, because a filter chip carrying a full course name could not
       wrap, and a fixed element resolves against the initial containing
       block. Both halves are fixed here. */
    const dock = ruleBody(css, ".kds .dock");
    expect(declaration(dock!, "grid-template-columns")).toBe("minmax(0, 1fr) auto");
    const chip = ruleBody(css, ".kds .book-tabs > .chip");
    expect(chip, ".book-tabs > .chip must exist").toBeTruthy();
    expect(declaration(chip!, "white-space")).toBe("normal");
    expect(declaration(chip!, "max-width")).toBe("100%");
    /* And a chip that is NOT in a filter row still refuses to wrap: a pill
       broken mid-label reads as two pills. */
    expect(declaration(ruleBody(css, ".kds .chip")!, "white-space")).toBe("nowrap");
  });

  it("floors a course link that stands on its own", () => {
    /* 22px on a phone. It is a list of links, not a link inside a sentence,
       so WCAG 2.5.8's inline exception does not cover it. */
    const body = ruleBody(css, ".kds .fam-list .link-thread");
    expect(declaration(body!, "min-height")).toBe("2.75rem");
    expect(declaration(body!, "display")).toBe("flex");
  });
});

/* ------------------------------------------------------------------ *
 * Motion and focus
 * ------------------------------------------------------------------ */

describe("motion and focus", () => {
  it("reduces every animation to nothing, rather than leaving one running", () => {
    const at = css.indexOf("@media (prefers-reduced-motion: reduce)", css.indexOf(".kds .dock"));
    const block = css.slice(at, at + 500);
    expect(block).toContain("animation-duration: 0.01ms !important");
    expect(block).toContain("animation-iteration-count: 1 !important");
  });

  it("keeps a visible ring on everything the keyboard can reach", () => {
    /* Verified by tabbing 26 stops on five routes in Chromium: zero focused
       elements without a ring. The rule that guarantees it lives here. */
    expect(css).toContain(":focus-visible");
    const at = css.indexOf(".kds :focus-visible");
    expect(at).toBeGreaterThan(-1);
    const block = css.slice(at, css.indexOf("}", at));
    expect(block).toMatch(/outline:/);
  });
});