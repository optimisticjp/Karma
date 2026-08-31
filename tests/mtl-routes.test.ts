import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../src/i18n/routing";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const exists = (p: string) => existsSync(join(process.cwd(), p));

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The public route map
 *
 * `docs/modern-textile-lab-ia.md` §1. The rule that matters most here
 * is the one about NOT renaming: every URL that worked before this
 * redesign still works, because a public URL is a promise to everyone
 * who has already shared it.
 * ------------------------------------------------------------------ */

const PUBLIC_ROUTES = [
  "",
  "/courses",
  "/courses/[slug]",
  "/batches",
  "/admission",
  "/admissions",
  "/student-work",
  "/notes",
  "/notes/[slug]",
  "/services",
  "/about",
  "/contact",
  "/success-stories",
  "/verify",
  "/verify/[id]",
  "/privacy",
  "/terms"
];

describe("the public route map", () => {
  it("has a page for every route the IA lists", () => {
    for (const route of PUBLIC_ROUTES) {
      const path = `src/app/[locale]${route}/page.tsx`;
      expect(exists(path), path).toBe(true);
    }
  });

  it("renames nothing", () => {
    /* `/about` displays as "Studio" in navigation and keeps its URL. A label
       is a display decision; a URL is a promise. */
    expect(exists("src/app/[locale]/about/page.tsx")).toBe(true);
    expect(exists("src/app/[locale]/studio/page.tsx")).toBe(false);
    /* `/admissions` answers "what are the rules", `/batches` answers "when can
       I come". Neither redirects to the other. */
    expect(exists("src/app/[locale]/admissions/page.tsx")).toBe(true);
    expect(exists("src/app/[locale]/batches/page.tsx")).toBe(true);
  });

  it("lists every public route in the sitemap", () => {
    const sitemap = read("src/app/sitemap.ts");
    for (const route of PUBLIC_ROUTES) {
      if (route.includes("[")) continue; // dynamic routes are mapped from content
      const needle = route === "" ? '""' : `"${route}"`;
      expect(sitemap, route).toContain(needle);
    }
    /* And it enumerates locales rather than hardcoding two, so a third locale
       is a routing change and not a sitemap change. */
    expect(sitemap).toContain("routing.locales.map");
  });

  it("points no public link at a route that does not exist", () => {
    /* The failure this catches is a `href="/studio"` typed because the nav
       label says Studio. */
    const files = [
      ...walk("src/components").filter((f) => f.endsWith(".tsx") && !f.includes("/admin/")),
      ...walk("src/app/[locale]").filter((f) => f.endsWith(".tsx"))
    ];
    const known = new Set(PUBLIC_ROUTES.map((r) => (r === "" ? "/" : r)));
    for (const file of files) {
      const source = stripComments(read(file));
      const hrefs = [...source.matchAll(/href="(\/[a-z0-9/-]*)"/g)].map((m) => m[1]);
      for (const href of hrefs) {
        const path = href.split("#")[0].replace(/\/$/, "") || "/";
        /* Skip anything that is not a locale-relative app route. */
        if (path.startsWith("/api") || path.startsWith("/admin") || path === "/") continue;
        const first = "/" + path.split("/")[1];
        expect(
          known.has(path) || known.has(first) || [...known].some((k) => k.startsWith(first + "/")),
          `${file} → ${href}`
        ).toBe(true);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * /batches — real rows or nothing
 * ------------------------------------------------------------------ */

describe("the public batches route", () => {
  const page = read("src/app/[locale]/batches/page.tsx");

  it("reads the database rather than the sample generator", () => {
    /* `sampleBatches()` in src/content/courses.ts fabricates start dates,
       seat counts, a per-batch language and — the one the plan forbids by
       name — a "Sat-Sun" weekend row. It is the only such string in the
       repository. This page must never call it. */
    expect(page).toContain("getUpcomingBatches");
    expect(stripComments(page)).not.toContain("sampleBatches");
  });

  it("keeps the sample generator out of production entirely", () => {
    const queries = read("src/lib/db/queries.ts");
    /* Every sampleBatches call site is behind the demo-mode gate. */
    const calls = [...queries.matchAll(/sampleBatches\(/g)];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      const before = queries.slice(Math.max(0, call.index! - 220), call.index!);
      expect(before, "sampleBatches must sit behind demoModeAllowed").toContain("demoModeAllowed");
    }
  });

  it("renders every uncertain field conditionally", () => {
    /* A batch row that carries no days renders no days; one that carries no
       language says nothing about language. The plan forbids inventing any of
       them, and the way to not invent a field is to not render it. */
    expect(page).toContain("row.days ?");
    expect(page).toContain("row.language ?");
    expect(page).toContain("row.startTime && row.endTime ?");
  });

  it("does not turn an untracked capacity into scarcity", () => {
    /* `seats` of 0 means the studio does not track a capacity for this batch.
       Rendering "0 seats left" would manufacture urgency out of a null. */
    expect(page).toContain("row.seats > 0 ? row.seats - row.seatsTaken : null");
    expect(page).toContain("seatsLeft !== null ?");
  });

  it("has an honest empty state that still gives somewhere to go", () => {
    expect(page).toContain("emptyTitle");
    expect(page).toContain("emptyBody");
    expect(page).toContain("errorTitle");
    /* And the empty state offers the demo, WhatsApp and a call rather than a
       fabricated batch. */
    expect(page).toContain("waLink");
    expect(page).toContain("tel:+${site.callPhone}");
  });

  it("bounds the query", () => {
    expect(page).toMatch(/getUpcomingBatches\(\{\s*limit:\s*\d+/);
  });

  it("is bilingual, and will be trilingual", () => {
    const en = JSON.parse(read("messages/en.json"));
    const gu = JSON.parse(read("messages/gu.json"));
    for (const [name, cat] of [["en", en], ["gu", gu]] as const) {
      expect(cat.batchesPage, name).toBeTruthy();
      expect(cat.meta.batches, name).toBeTruthy();
      expect(cat.nav.batches, name).toBeTruthy();
    }
    /* Gujarati is not the English string copied across. */
    expect(gu.nav.batches).not.toBe(en.nav.batches);
    expect(gu.batchesPage.title).not.toBe(en.batchesPage.title);
  });

  it("is reachable from navigation", () => {
    expect(read("src/components/site/Header.tsx")).toContain('href: "/batches"');
    expect(read("src/components/site/Footer.tsx")).toContain('href="/batches"');
  });
});

/* ------------------------------------------------------------------ *
 * The locale contract, as it stands before Hindi lands
 * ------------------------------------------------------------------ */

describe("locale routing", () => {
  it("never auto-redirects on browser language", () => {
    const routingSource = read("src/i18n/routing.ts");
    expect(routingSource).toContain("localeDetection: false");
  });

  it("keeps every locale always-prefixed", () => {
    /* next-intl's default with no `localePrefix` override is "always", which
       is what every public URL in this project assumes. */
    const routingSource = read("src/i18n/routing.ts");
    expect(routingSource).not.toContain('localePrefix: "as-needed"');
    expect(routingSource).not.toContain('localePrefix: "never"');
  });

  it("derives the locale type rather than restating it", () => {
    const routingSource = read("src/i18n/routing.ts");
    expect(routingSource).toContain("(typeof routing.locales)[number]");
    expect(routing.defaultLocale).toBe("en");
  });
});
