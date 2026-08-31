import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../src/i18n/routing";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else if (/\.tsx?$/.test(rel)) out.push(rel);
  }
  return out;
}

const sourceFiles = walk("src");

function leaves(node: unknown, prefix = "", out: Array<[string, unknown]> = []) {
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) leaves(v, path, out);
    else out.push([path, v]);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Nothing in the catalogue that no page asks for
 * ------------------------------------------------------------------ */

/**
 * WHY AN UNUSED MESSAGE IS A DEFECT, NOT MERELY UNTIDY
 * ----------------------------------------------------
 * The rebuild left **249 dead leaves** behind — 22% of the catalogue. Copy no
 * page renders still has to be translated, still has to be reviewed against
 * the factual rules, and still passes the EN/GU parity check, so it makes the
 * parity check look like coverage while covering nothing. Worse, it drifts:
 * `proof.stories.before` and `home.voices.before` said different things, and
 * only one of them was on screen.
 *
 * So: every public message must be reachable from a page. The scan below is
 * the same one `tests/kds-secondary.test.ts` uses for missing keys, run in the
 * other direction.
 */
describe("the catalogue carries no copy the site does not render", () => {
  /**
   * A namespace whose keys are built at runtime — `t(`s${n}Label`)`,
   * `t(step.key)` — cannot be scanned literally, so its whole subtree is
   * treated as live. That is a deliberate hole, and a small one: the
   * namespaces it covers are listed by the scan itself rather than by hand.
   */
  const RESERVED = new Set([
    /* Held for the day R2 is activated; `tests/compact-density-final.test.ts`
       explains why deleting it would lose the limits the API still enforces. */
    "servicesPage.form.filesHelp"
  ]);

  const scopesOf = (whole: string) => {
    const a = whole.indexOf("export async function generateMetadata");
    if (a === -1) return [whole];
    const sig = whole.indexOf("Promise<Metadata> {", a);
    const b = whole.indexOf("\n}", Math.max(sig, a));
    return [whole.slice(a, b + 2), whole.slice(0, a) + whole.slice(b + 2)];
  };

  const used = new Set<string>();
  const bound = new Set<string>();
  const computed = new Set<string>();

  for (const file of sourceFiles) {
    for (const src of scopesOf(strip(read(file)))) {
      const nsOf = new Map<string, string>();
      for (const m of src.matchAll(
        /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:use|get)Translations\(\s*"([^"]+)"/g
      )) {
        nsOf.set(m[1], m[2]);
      }
      for (const m of src.matchAll(
        /(?:const|let)\s+(\w+)\s*=\s*await\s+getTranslations\(\{[^}]*namespace:\s*"([^"]+)"/g
      )) {
        nsOf.set(m[1], m[2]);
      }
      for (const m of src.matchAll(
        /(?:const|let)\s+(\w+)\s*=\s*createTranslator\(\{[^}]*namespace:\s*"([^"]+)"/g
      )) {
        nsOf.set(m[1], m[2]);
      }
      for (const m of src.matchAll(/const \[([^\]]+)\] = await Promise\.all\(\[([\s\S]*?)\]\);/g)) {
        const names = m[1].split(",").map((n) => n.trim());
        const calls = m[2].split(/,(?![^(]*\))/).map((c) => c.trim());
        names.forEach((n, i) => {
          const g = /(?:use|get)Translations\(\s*"([^"]+)"/.exec(calls[i] ?? "");
          if (g) nsOf.set(n, g[1]);
        });
      }
      for (const ns of nsOf.values()) bound.add(ns);
      /* `t("x")` and `t.raw("x")` — the raw form reads a list or an object
         and is how five of the "dead" keys were nearly deleted. */
      for (const m of src.matchAll(/\b(\w+)(?:\.raw)?\(\s*"([^"]+)"/g)) {
        const ns = nsOf.get(m[1]);
        if (ns) used.add(`${ns}.${m[2]}`);
      }
      for (const m of src.matchAll(/\b(\w+)(?:\.raw)?\(\s*[`\w$]/g)) {
        const ns = nsOf.get(m[1]);
        if (ns) computed.add(ns);
      }
    }
  }
  /* The Console reaches `admin.*` through `getAdminT()`, a wrapper this scan
     cannot follow, and the Console is out of scope for the public rebuild. */
  bound.add("admin");
  computed.add("admin");

  it("finds no public message that no page renders", () => {
    const orphans: string[] = [];
    for (const [path] of leaves(en)) {
      if (used.has(path) || RESERVED.has(path)) continue;
      const owner = [...bound]
        .filter((ns) => path === ns || path.startsWith(`${ns}.`))
        .sort((a, b) => b.length - a.length)[0];
      if (!owner) orphans.push(path);
      else if (!computed.has(owner)) orphans.push(path);
    }
    expect(orphans).toEqual([]);
  });

  it("is actually scanning something", () => {
    /* Non-vacuity. A scan that stopped matching would report zero orphans and
       look like a pass. */
    expect(used.size).toBeGreaterThan(500);
    expect(bound.size).toBeGreaterThan(20);
  });

  it("keeps both catalogues the same shape", () => {
    const e = leaves(en).map(([k]) => k);
    const g = leaves(gu).map(([k]) => k);
    expect(e.filter((k) => !g.includes(k))).toEqual([]);
    expect(g.filter((k) => !e.includes(k))).toEqual([]);
  });

  it("leaves no empty Gujarati string behind an English one", () => {
    const empty: string[] = [];
    for (const [path, value] of leaves(gu)) {
      if (typeof value === "string" && value.trim() === "") empty.push(path);
    }
    expect(empty).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * Metadata
 * ------------------------------------------------------------------ */

describe("page metadata", () => {
  const entries = Object.entries(en.meta) as Array<[string, { title: string; description: string }]>;

  it("gives every page its own title and description, in both languages", () => {
    expect(entries.length).toBeGreaterThanOrEqual(12);
    for (const cat of [en, gu]) {
      const titles = Object.values(cat.meta).map((m: any) => m.title);
      const descs = Object.values(cat.meta).map((m: any) => m.description);
      expect(new Set(titles).size).toBe(titles.length);
      expect(new Set(descs).size).toBe(descs.length);
    }
  });

  it("keeps every title and description inside what a result actually shows", () => {
    /* A title past ~60 characters and a description past ~160 are truncated in
       the result, and what gets cut is the END — which on this site is the
       studio's name. The two highest-intent local titles (home, courses) drop
       the brand suffix instead of the locality: "Mota Varachha" and "Surat"
       are the words somebody types, and the brand is already in the
       LocalBusiness schema on every page. */
    for (const [name, cat] of [["en", en], ["gu", gu]] as const) {
      for (const [page, m] of Object.entries(cat.meta) as Array<[string, any]>) {
        expect(m.title.length, `${name}.${page} title`).toBeLessThanOrEqual(60);
        expect(m.description.length, `${name}.${page} description`).toBeLessThanOrEqual(160);
      }
    }
    expect(en.meta.home.title).toContain("Mota Varachha");
    expect(en.meta.home.title).toContain("Surat");
    expect(en.meta.courses.title).toContain("Mota Varachha");
  });

  it("promises no outcome in a search result that the page itself refuses to claim", () => {
    /* `meta.stories` used to read "businesses started, jobs landed, skills
       that pay" — for a page whose every story is a SAMPLE and whose own copy
       says none of them claims an income, a job or a placement. A description
       is a claim; it may not say what the page will not. */
    const text = JSON.stringify([en.meta, gu.meta]).toLowerCase();
    for (const banned of [
      /\bjobs? landed\b/,
      /\bskills that pay\b/,
      /\bplacement\b/,
      /\bsalary\b/,
      /\bearn\b/,
      /\bguarantee/,
      /₹/
    ]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
    expect(en.meta.stories.description.toLowerCase()).toContain("consent");
  });

  it("routes every public page's metadata through the one helper", () => {
    const pages = walk("src/app/[locale]").filter((f) => f.endsWith("/page.tsx"));
    for (const page of pages) {
      const src = read(page);
      if (!src.includes("generateMetadata")) continue;
      if (/index:\s*false/.test(src)) continue;
      expect(src, page).toContain("pageMeta");
    }
  });
});

/* ------------------------------------------------------------------ *
 * Breadcrumbs
 * ------------------------------------------------------------------ */

describe("breadcrumbs", () => {
  const SECOND_LEVEL = [
    ["courses", "src/app/[locale]/courses/page.tsx"],
    ["batches", "src/app/[locale]/batches/page.tsx"],
    ["admissions", "src/app/[locale]/admissions/page.tsx"],
    ["admission", "src/app/[locale]/admission/page.tsx"],
    ["work", "src/app/[locale]/student-work/page.tsx"],
    ["notes", "src/app/[locale]/notes/page.tsx"],
    ["services", "src/app/[locale]/services/page.tsx"],
    ["about", "src/app/[locale]/about/page.tsx"],
    ["stories", "src/app/[locale]/success-stories/page.tsx"],
    ["contact", "src/app/[locale]/contact/page.tsx"],
    ["verify", "src/app/[locale]/verify/page.tsx"],
    ["privacy", "src/app/[locale]/privacy/page.tsx"]
  ] as const;

  it("gives every indexable second-level page a trail", () => {
    for (const [page, file] of SECOND_LEVEL) {
      expect(read(file), file).toContain(`<PageCrumbs page="${page}"`);
      for (const cat of [en, gu]) expect(cat.crumbs[page], `${page} label`).toBeTruthy();
    }
  });

  it("names both crumbs in the language of the page they describe", () => {
    /* The home crumb was the literal English word "Home" on every Gujarati
       page — a structured-data description of a page in a language the page
       is not written in. The note trail was worse: an English section name
       AND the English question. */
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain("home = \"Home\"");
    expect(read("src/components/kds/PageCrumbs.tsx")).toContain('t("home")');
    const note = read("src/app/[locale]/notes/[slug]/page.tsx");
    expect(note).toContain('tcr("notes")');
    expect(note).toContain('pick(note, "question", l)');
    expect(note).not.toContain('["Machine Notes", "/notes"]');
    expect(read("src/app/[locale]/courses/[slug]/page.tsx")).toContain('tcr("home")');
  });

  it("keeps a breadcrumb label separate from the nav link that shares its page", () => {
    /* A breadcrumb names a PLACE and a nav link invites a CLICK. Sharing one
       string would eventually make one of them wrong — and `crumbs` also has
       to name the four pages the header does not link at all. */
    for (const key of ["admission", "stories", "verify", "privacy"]) {
      expect(en.crumbs[key], key).toBeTruthy();
      expect(en.nav[key], `nav.${key} must not exist`).toBeUndefined();
    }
  });
});

/* ------------------------------------------------------------------ *
 * Two locales, and the sitemap that has to agree with them
 * ------------------------------------------------------------------ */

describe("EN and GU, and nothing else", () => {
  it("derives hreflang and the sitemap from the same locale list", () => {
    /* A hreflang set that disagrees with the sitemap is worse than none.
       Both iterate `routing.locales`; neither lists a locale by hand. */
    expect([...routing.locales]).toEqual(["en", "gu"]);
    const seo = read("src/lib/seo.ts");
    const sitemap = read("src/app/sitemap.ts");
    expect(seo).toContain("routing.locales.map");
    expect(sitemap).toContain("routing.locales.map");
    for (const file of [seo, sitemap]) {
      expect(file).not.toMatch(/["']hi["']/);
    }
  });

  it("submits no page it has told the crawler to ignore", () => {
    /* `/terms` is noIndex while the owner's review is open, and a sitemap
       entry for a page told not to be indexed is a contradiction the crawler
       reports back as an error. */
    const sitemap = strip(read("src/app/sitemap.ts"));
    expect(sitemap).not.toContain('"/terms"');
    expect(sitemap).not.toContain("/verify/");
    expect(read("src/app/[locale]/terms/page.tsx")).toContain("noIndex: true");
  });

  it("emits one structured-data locale per page and never a third", () => {
    const schema = read("src/lib/schema.ts");
    expect(schema).not.toMatch(/["']hi[-_]/);
    /* `inLanguage` / `availableLanguage` are TEACHING languages, and Hindi is
       genuinely one of them. That is a fact about the classroom, not a
       website locale, and removing it would make the site less true. */
    expect(schema).toMatch(/availableLanguage|inLanguage/);
  });
});

/* ------------------------------------------------------------------ *
 * The factual firewall, stated once more at the copy layer
 * ------------------------------------------------------------------ */

describe("public copy states nothing the studio has not confirmed", () => {
  const publicCopy = JSON.stringify(
    Object.fromEntries(Object.entries(en).filter(([k]) => k !== "admin"))
  ).toLowerCase();
  const publicCopyGu = JSON.stringify(
    Object.fromEntries(Object.entries(gu).filter(([k]) => k !== "admin"))
  ).toLowerCase();

  it("names no digitising software but the one the institute teaches", () => {
    for (const cat of [publicCopy, publicCopyGu]) {
      expect(cat).not.toContain("wilcom");
      expect(cat).not.toContain("hatch");
      expect(cat).not.toContain("pulse ambassador");
    }
    expect(publicCopy).toContain("emcad");
  });

  it("prints no fee anywhere in the catalogue", () => {
    /* Every rupee figure on the site is rendered from
       `src/content/course-operations.ts`, the one verified record. A number
       typed into a message is a number nobody can trace. */
    for (const cat of [publicCopy, publicCopyGu]) {
      expect(cat).not.toContain("₹");
      expect(cat).not.toMatch(/\b\d{2},\d{3}\b/);
    }
  });

  it("invents no machine specification", () => {
    for (const cat of [publicCopy, publicCopyGu]) {
      expect(cat).not.toContain("rpm");
      expect(cat).not.toContain("stitches per minute");
      expect(cat).not.toMatch(/\d+\s*-?\s*(head|needle)s?\b/);
    }
  });

  it("claims no duration for a course the owner has not confirmed one for", () => {
    /* EMCAD DAHAO is three months, recorded in months. No other course has a
       confirmed duration, and a generic "3-month course" line in shared copy
       would apply that fact to all eleven. */
    const shared = JSON.stringify([en.coursesPage, gu.coursesPage, en.courseDetail, gu.courseDetail]);
    expect(shared).not.toMatch(/\b\d+\s*(months?|weeks?|મહિન|અઠવાડ)/i);
  });
});
