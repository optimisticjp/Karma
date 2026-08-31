import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { routing } from "../src/i18n/routing";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const LOCALE_ROOT = "src/app/[locale]";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const localeFiles = walk(LOCALE_ROOT);
const componentFiles = walk("src/components").filter((f) => f.endsWith(".tsx"));

/* ------------------------------------------------------------------ *
 * Every EN route has a GU route, structurally
 * ------------------------------------------------------------------ */

describe("route parity", () => {
  it("serves every locale from one tree", () => {
    /* A hard equality on purpose, and the suite's tripwire for adding a
       public locale. It was relaxed to `toContain` on 2026-08-31 to admit a
       Hindi website and restored the same day when the owner reversed that;
       a locale is a product decision, and this is where it gets made rather
       than discovered.

       What it guards beyond the list: there is ONE route tree, so no route
       can exist in one language and not another. */
    expect([...routing.locales]).toEqual(["en", "gu"]);
    expect(routing.defaultLocale).toBe("en");

    const pages = localeFiles.filter((f) => f.endsWith("/page.tsx"));
    expect(pages.length).toBeGreaterThanOrEqual(12);
    for (const page of pages) {
      expect(relative(LOCALE_ROOT, page).startsWith(".."), page).toBe(false);
    }
  });

  it("keeps the console deliberately outside the locale segment", () => {
    /* Staff type /admin, never /en/admin. This is a decision, not an
       oversight — see docs/project-context.md §9. */
    const adminPages = walk("src/app/admin").filter((f) => f.endsWith("/page.tsx"));
    expect(adminPages.length).toBeGreaterThan(5);
    for (const page of adminPages) {
      expect(page.startsWith("src/app/admin"), page).toBe(true);
    }
  });

  it("gives every indexable public page hreflang through the one metadata helper", () => {
    /* A per-certificate verify URL is deliberately noindex — hreflang on a
       page search engines are told to ignore would be pointless, and
       requiring it here would push a later session into adding it. */
    const pages = localeFiles.filter((f) => {
      if (!f.endsWith("/page.tsx")) return false;
      const source = read(f);
      if (!source.includes("generateMetadata")) return false;
      return !/index:\s*false/.test(source);
    });
    expect(pages.length).toBeGreaterThanOrEqual(10);
    for (const page of pages) {
      expect(read(page), page).toContain("pageMeta");
    }
  });
});

/* ------------------------------------------------------------------ *
 * No page forgets which language it is in
 * ------------------------------------------------------------------ */

describe("bilingual rendering", () => {
  it("never renders an English field without a Gujarati branch", () => {
    /* This is the check that would have caught the 404: it listed course
       names as `c.nameEn` unconditionally, so the Gujarati 404 showed
       English. A `key={x.nameEn}` is fine and excluded — a React key must
       NOT change with the locale. */
    const offenders: string[] = [];
    for (const file of [...localeFiles.filter((f) => f.endsWith(".tsx")), ...componentFiles]) {
      const source = read(file);
      source.split("\n").forEach((line, i) => {
        if (!/[={]\{?\s*[a-zA-Z_]+\.[a-zA-Z]+En\s*\}/.test(line)) return;
        if (/\bkey=/.test(line)) return;
        if (/gu \?|Gu :/.test(line)) return;
        /* Structured data and analytics are deliberately English-only. */
        if (/Schema\(|headline|description|courseName|event=|props=/.test(line)) return;
        offenders.push(`${file}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("translates the loading state", () => {
    const loading = read("src/app/[locale]/loading.tsx");
    expect(loading).toContain("useTranslations");
    expect(loading).not.toContain(">Loading…<");
    for (const cat of [en, gu]) {
      expect(cat.common.loadingNote).toBeTruthy();
    }
  });
});

/* ------------------------------------------------------------------ *
 * The states themselves
 * ------------------------------------------------------------------ */

describe("404", () => {
  it("uses the studio's own words", () => {
    expect(en.notFound.title.toLowerCase()).toContain("thread ends here");
    expect(en.notFound.body.toLowerCase()).toContain("design path");
    expect(en.notFound.homeCta.toLowerCase()).toContain("back to karma");
    for (const key of ["title", "body", "homeCta"]) {
      expect(gu.notFound[key], key).toBeTruthy();
    }
  });

  it("marks it with a thread that stops, which is the mark for a break", () => {
    /* `<BrokenPath>` carried this before the rebuild; the system's own
       running stitch does now, drawn short and ending. The rule is the one it
       always was: this mark means something failed, so it appears here and
       nowhere a page is working. */
    const source = read("src/app/[locale]/not-found.tsx");
    expect(source).toContain("<ThreadLine");
    expect(source).toContain("The thread, ending");
    expect(read("src/app/[locale]/page.tsx")).not.toContain("BrokenPath");
  });
});

describe("loading", () => {
  it("never holds the render back for decoration", () => {
    const loading = read("src/app/[locale]/loading.tsx");
    expect(loading).not.toContain("setTimeout");
    expect(loading).not.toContain("useEffect");
    const css = read("src/app/machine-lab.css");
    const block = css.slice(css.indexOf(".loading-note {"), css.indexOf(".loading-stitch {") + 200);
    expect(block).not.toContain("animation:");
  });

  it("announces itself", () => {
    const loading = read("src/app/[locale]/loading.tsx");
    expect(loading).toContain('role="status"');
    expect(loading).toContain('aria-live="polite"');
  });
});

describe("verify and the legal pages stay low-motion", () => {
  it("puts no reveal or seal animation on a verification result", () => {
    /* Someone here is an employer checking whether a certificate is real.
       The restraint is the credibility. */
    const form = read("src/components/site/VerifyForm.tsx");
    for (const motion of ["Reveal", "seal-in", "media-unveil", "stitch-wipe"]) {
      expect(form, motion).not.toContain(motion);
    }
  });

  it("puts no reveal animation on the terms or the privacy page", () => {
    for (const page of ["src/app/[locale]/terms/page.tsx", "src/app/[locale]/privacy/page.tsx"]) {
      const source = read(page);
      expect(source, page).not.toContain("<Reveal");
    }
  });

  it("keeps the terms page out of the index until the owner approves it", () => {
    const source = read("src/app/[locale]/terms/page.tsx");
    expect(source).toContain("noIndex");
  });
});
