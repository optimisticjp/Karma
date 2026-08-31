import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { courses } from "../src/content/courses";
import { machineNotes } from "../src/content/notes";
import { PHOTO_MANIFEST } from "../src/content/photo-manifest";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
};

const publicPages = walk("src/app/[locale]").filter((f) => f.endsWith("/page.tsx"));
const publicComponents = walk("src/components")
  .filter((f) => f.endsWith(".tsx"))
  .filter((f) => !f.startsWith("src/components/admin"));
const css = read("src/app/machine-lab.css");

/* ------------------------------------------------------------------ *
 * Dark surfaces are punctuation, not wallpaper
 * ------------------------------------------------------------------ */

describe("page rhythm holds across the whole public site", () => {
  it("puts no dark band on any public surface", () => {
    /* LIGHT-FIRST, 2026-08-31. This used to cap dark bands at four on the
       homepage and two per page — and that cap is exactly the shape of
       assertion that goes SILENTLY VACUOUS when the real number reaches zero.
       It is now the rule the owner actually gave: the public site does not
       use a dark full-width surface at all.
   
       `.on-carbon` itself is still defined in premium.css, deliberately — the
       compact-density plan §3 keeps a dark surface available for a small
       isolated overlay whose own content needs the contrast. What may not
       come back is a public SECTION wearing it. */
    const offenders = [...publicComponents, ...publicPages].filter((f) =>
      stripComments(read(f)).includes("on-carbon")
    );
    expect(offenders, "no public file may wear .on-carbon").toEqual([]);

    /* Non-vacuity: a walk that silently matched nothing would pass the line
       above without proving anything. */
    expect(publicComponents.length).toBeGreaterThan(20);
    expect(publicPages.length).toBeGreaterThan(10);
  });

  it("still varies its surface, so a long scroll is not one flat ground", () => {
    /* The danger on the other side of light-first is a beige monotone, and a
       four-surface vocabulary is what prevents it. The vocabulary changed with
       the public rebuild — `band-machine` / `-material` / `-human` / `-info`
       became the four GROUNDS — and the rule is the one it always was: all
       four must still be in use somewhere on the public site. */
    const all = [...publicComponents, ...publicPages].map((f) => read(f)).join("\n");
    for (const ground of ["on-canvas", "on-paper", "on-cloth", "on-mist"]) {
      expect(all, ground).toContain(ground);
    }
  });

  it("gives the console no dark band at all", () => {
    /* The console is a work desk under fluorescent light, not a brand
       surface. */
    for (const file of walk("src/app/admin").filter((f) => f.endsWith(".tsx"))) {
      expect(stripComments(read(file)), file).not.toContain("on-carbon");
    }
  });
});

/* ------------------------------------------------------------------ *
 * No fake technicality, anywhere
 * ------------------------------------------------------------------ */

describe("nothing invents a specification", () => {
  it("publishes no machine number the studio has not supplied", () => {
    const copy = collectStrings(en).concat(collectStrings(gu)).join(" ").toLowerCase();
    for (const unit of [
      "rpm",
      "stitches per minute",
      " spm",
      " gsm",
      "stitch density of",
      "needles per",
      "heads per"
    ]) {
      expect(copy, unit).not.toContain(unit);
    }
    /* And no "<number> head" / "<number> needle" machine claim. */
    expect(copy).not.toMatch(/\b\d+\s*-?\s*(head|needle)s?\b/);
  });

  it("invents no coordinate readout or engineering dashboard", () => {
    for (const file of publicComponents) {
      const source = stripComments(read(file));
      for (const banned of ["clientX", "clientY", "mousemove", "pointermove"]) {
        expect(source, `${file} / ${banned}`).not.toContain(banned);
      }
    }
  });

  it("loops no decorative animation", () => {
    for (const file of ["src/app/globals.css", "src/app/premium.css", "src/app/machine-lab.css"]) {
      const sheet = read(file);
      /* `infinite` may only appear on a loading skeleton, which is state. */
      for (const match of sheet.match(/animation:[^;]*infinite[^;]*/g) ?? []) {
        expect(match, `${file}: ${match}`).toMatch(/skeleton/);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * Accessibility hardening
 * ------------------------------------------------------------------ */

describe("keyboard and motion", () => {
  it("draws a focus ring inside every full-bleed row", () => {
    /* The global rule draws 3px OUTSIDE, which disappears inside a clipping
       container and can cost a horizontal scrollbar at 320px. */
    const block = css.slice(css.indexOf(".queue-link:focus-visible"));
    expect(block).toContain("outline-offset: -2px");
    for (const cls of [".mi-link", ".note-archive-link", ".rail-tab"]) {
      expect(css, cls).toContain(`${cls}:focus-visible`);
    }
  });

  it("covers everything this redesign animates under reduced motion", () => {
    const reduced = css.split("@media (prefers-reduced-motion: reduce)").slice(1).join("\n");
    for (const cls of [
      ".sig-el",
      ".btn-stitch::after",
      ".rail-media",
      ".queue-link",
      ".mi-link",
      ".m-l1"
    ]) {
      expect(reduced, cls).toContain(cls);
    }
  });

  it("lets a long unbroken token wrap instead of widening the page", () => {
    for (const cls of [".queue-row-meta", ".rail-caption"]) {
      expect(css, cls).toContain(cls);
    }
    expect(css).toContain("overflow-wrap: var(--break-anywhere)");
  });
});

/* ------------------------------------------------------------------ *
 * The creative-director question
 * ------------------------------------------------------------------ */

describe("does this read as a real studio or as a concept for one", () => {
  it("shows eleven real courses, not a curated shortlist", () => {
    expect(courses).toHaveLength(11);
    const book = read("src/components/kds/home/SampleBook.tsx");
    expect(book).toContain("coursesByFamily");
    /* The family filter narrows what is SHOWN; it must never narrow what
       exists. "All" is the default, so a visitor without scripting — and a
       crawler — sees the whole catalogue rather than one family. */
    expect(book).toContain('useState<FamilyKey | "all">("all")');
    expect(book).not.toMatch(/coursesByFamily\.slice\(/);
  });

  it("keeps every photograph a named, reserved frame rather than a stand-in", () => {
    expect(PHOTO_MANIFEST).toHaveLength(32);
    const sources = publicComponents.concat(publicPages).map(read).join("\n").toLowerCase();
    for (const host of ["unsplash", "pexels", "shutterstock", "istockphoto", "picsum", "placeholder.com"]) {
      expect(sources, host).not.toContain(host);
    }
  });

  it("still answers a working operator with faults, not adjectives", () => {
    /* Six named production faults on the homepage and eight technical notes
       are the things no competing institute has. If these ever thin out, the
       site has drifted back to being a brochure. */
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(en.home.problems[`p${n}f`], `p${n}`).toBeTruthy();
    }
    expect(machineNotes.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps the promise on the page, in both languages", () => {
    expect(en.home.hero.promise.toLowerCase()).toContain("prove it");
    expect(en.home.hero.h1.toLowerCase()).toContain("screen to stitch");
    expect(gu.home.hero.promise).toContain("મશીન");
  });

  it("adds no dependency across the whole redesign", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const banned of [
      "framer-motion",
      "gsap",
      "lottie-web",
      "three",
      "recharts",
      "chart.js",
      "swiper",
      "lucide-react",
      "react-icons",
      "@shadcn/ui",
      "pdfkit"
    ]) {
      expect(Object.keys(pkg.dependencies), banned).not.toContain(banned);
    }
  });
});
