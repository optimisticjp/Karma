import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { machineNotes } from "../src/content/notes";
import { ADMISSION_TERMS } from "../src/content/admission-terms";

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

const sourceFiles = [
  ...walk("src").filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
];

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
};

/* ------------------------------------------------------------------ *
 * The software is named the same everywhere
 * ------------------------------------------------------------------ */

describe("EMCAD DAHAO is named consistently", () => {
  it("uses no half-name in any user-facing string", () => {
    /* Each phase renamed the surfaces it rebuilt; this is the sweep for the
       rest. `emcad` stays as a slug and an object key — those are
       identifiers, not names a visitor reads. */
    for (const cat of [en, gu]) {
      for (const value of collectStrings(cat)) {
        expect(value, value.slice(0, 60)).not.toContain("emCAD");
      }
    }
    for (const file of sourceFiles) {
      expect(read(file), file).not.toContain("emCAD");
    }
  });

  it("keeps the slug and the technique key untouched", () => {
    /* Renaming an identifier would break a URL and an upsert; the rename was
       display text only. */
    const collections = read("src/content/collections.ts");
    expect(collections).toContain('technique: "emcad"');
    expect(collections).toContain('courseSlug: "emcad-embroidery-design"');
    expect(read("src/content/courses.ts")).toContain('slug: "emcad-embroidery-design"');
  });

  it("does not sacrifice a real search term to the rename", () => {
    /* People type the short name. A tag is a search theme, not a brand
       statement. */
    const tags = machineNotes.flatMap((n) => n.tags).map((t) => t.toLowerCase());
    expect(tags.some((t) => t.includes("emcad dahao"))).toBe(true);
    expect(tags.some((t) => t === "emcad classes surat")).toBe(true);
  });

  it("still teaches one package, and names the other only in the quoted rule", () => {
    const catalogues = JSON.stringify(en) + JSON.stringify(gu);
    expect(catalogues.toLowerCase()).not.toContain("wilcom");
    /* The one legitimate occurrence is the institute's own admission norm. */
    const terms = JSON.stringify(ADMISSION_TERMS).toLowerCase();
    expect(terms).toContain("wilcom");
  });
});

/* ------------------------------------------------------------------ *
 * Query shapes
 * ------------------------------------------------------------------ */

describe("console reads are bounded", () => {
  it("aggregates attendance in Postgres rather than tallying every mark in Node", () => {
    const certs = read("src/app/admin/(console)/certificates/page.tsx");
    expect(certs).toContain("groupBy(");
    expect(certs).toContain("count(*)");
    /* The old shape selected one row per attendance mark and counted them in
       a loop. A single batch of 30 students over three months is ~2,300
       rows, and the table only grows. */
    expect(certs).not.toContain("status: schema.attendanceRecords.status })");
  });

  it("scopes the fee ledger to the enrolments on screen", () => {
    const fees = read("src/app/admin/(console)/fees/page.tsx");
    expect(fees).toContain("inArray(schema.feeRecords.enrollmentId, enrollmentIds)");
    /* It used to be every receipt ever written, on every page load. */
    expect(fees).not.toContain(".from(schema.feeRecords).orderBy(");
  });

  it("caps every Today at Karma queue", () => {
    const dashboard = read("src/lib/admin/dashboard.ts");
    expect((dashboard.match(/limit \$\{QUEUE_LIMIT/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});

/* ------------------------------------------------------------------ *
 * PII discipline
 * ------------------------------------------------------------------ */

describe("analytics never carries what a visitor typed", () => {
  it("passes no name, phone, email or free text to track()", () => {
    const banned = [
      "fullName",
      "whatsapp:",
      "guardianPhone",
      "email:",
      "area:",
      "goal",
      "reference:",
      "message"
    ];
    for (const file of sourceFiles) {
      const source = stripComments(read(file));
      for (const call of source.match(/track\([^)]*\)/gs) ?? []) {
        for (const field of banned) {
          expect(call, `${file}: ${call.slice(0, 80)}`).not.toContain(field);
        }
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * Structured data and served artifacts
 * ------------------------------------------------------------------ */

describe("structured data keeps its fact discipline", () => {
  it("has exactly one module that emits JSON-LD", () => {
    const emitters = sourceFiles.filter((f) => read(f).includes('"@context"'));
    expect(emitters).toEqual(["src/lib/schema.ts"]);
  });

  it("publishes no price, no rating and no review", () => {
    const schema = read("src/lib/schema.ts");
    for (const banned of ['"offers"', '"price"', "aggregateRating", '"review"', '"Review"']) {
      expect(stripComments(schema), banned).not.toContain(banned);
    }
  });

  it("claims a duration only for the course that has one", () => {
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain("timeRequired");
    expect(schema).toContain("durationMonths");
  });
});

describe("served artifacts state the same facts as the site", () => {
  it("builds llms.txt from the verified record", () => {
    const route = read("src/app/llms.txt/route.ts");
    expect(route).toContain("EMCAD_DAHAO");
    expect(route).toContain("KARMA_SOFTWARE");
    /* No figure typed into the route itself. */
    expect(route).not.toContain("35,000");
    expect(route).not.toContain("₹35000");
  });

  it("ships a sitemap and robots that agree on what is indexable", () => {
    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");
    expect(sitemap).toContain("routing.locales");
    expect(robots.toLowerCase()).toContain("/admin");
  });
});

/* ------------------------------------------------------------------ *
 * Copy tone
 * ------------------------------------------------------------------ */

describe("copy stays in the studio's voice", () => {
  it("uses none of the generic institute phrases the brief bans", () => {
    const banned = [
      "unlock your creativity",
      "embark on",
      "world-class",
      "best-in-class",
      "transform your passion",
      "cutting-edge",
      "state-of-the-art",
      "unleash",
      "one-stop"
    ];
    for (const cat of [en, gu]) {
      const all = collectStrings(cat).join(" ").toLowerCase();
      for (const phrase of banned) {
        expect(all, phrase).not.toContain(phrase);
      }
    }
  });

  it("keeps Gujarati out of every uppercase or letterspaced treatment", () => {
    /* Every label style that uppercases or letterspaces must self-neutralise
       under :lang(gu). This is the sweep across all three stylesheets. */
    for (const file of ["src/app/globals.css", "src/app/premium.css", "src/app/machine-lab.css"]) {
      const css = read(file);
      const guBlocks = css.split(":lang(gu)").slice(1);
      for (const block of guBlocks) {
        const body = block.slice(0, block.indexOf("}"));
        if (body.includes("text-transform")) expect(body, file).toContain("text-transform: none");
        if (body.includes("letter-spacing")) expect(body, file).toContain("letter-spacing: 0");
      }
    }
  });
});
