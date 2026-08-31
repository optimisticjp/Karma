import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import en from "../messages/en.json";
import gu from "../messages/gu.json";
import { routing, asLocale, LOCALE_NAMES, OG_LOCALE } from "@/i18n/routing";
import { ADMIN_LOCALES } from "@/lib/admin/i18n";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const GUJARATI = /[઀-૿]/;
const DEVANAGARI = /[ऀ-ॿ]/;

/**
 * THE PUBLIC WEBSITE IS ENGLISH + GUJARATI.
 *
 * A Hindi public locale was implemented on 2026-08-31 and reversed by the
 * owner the same day. This suite is the reason it cannot come back by
 * accident: not because Hindi is wrong, but because a public locale is a
 * product decision, and the failure mode of adding one quietly is a language
 * a visitor is offered and then served English in.
 *
 * It is deliberately mechanical. Every assertion here is something a
 * well-meaning change could otherwise undo without anyone noticing until a
 * crawler had already indexed the result.
 *
 * If the owner ever does decide on a third language, this file is where that
 * decision gets recorded — after `messages/<locale>.json`, the content
 * sources, the routed catalogue and an APPLIED database migration all exist.
 */

describe("the public locale set", () => {
  it("routes exactly English and Gujarati, English first", () => {
    expect([...routing.locales]).toEqual(["en", "gu"]);
    expect(routing.defaultLocale).toBe("en");
  });

  it("never auto-redirects on browser language", () => {
    /* The URL decides. Offering is fine; redirecting is not — see the plan's
       decision log and Google's own i18n guidance. */
    expect(routing.localeDetection).toBe(false);
  });

  it("has one message catalogue per routed locale and no orphans", () => {
    /* The failure this catches: a locale in `routing.locales` with no
       catalogue behind it resolves at REQUEST time, not build time — so it is
       a 500 on a URL a crawler has already indexed, not a compile error. And
       the reverse, an orphan catalogue, is dead weight in the bundle. */
    const catalogues = readdirSync(join(process.cwd(), "messages"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(catalogues).toEqual([...routing.locales].sort());
  });

  it("ships no Hindi catalogue", () => {
    expect(existsSync(join(process.cwd(), "messages/hi.json"))).toBe(false);
  });

  it("names each locale in its own script", () => {
    for (const locale of routing.locales) {
      expect(LOCALE_NAMES[locale]?.name.length, locale).toBeGreaterThan(0);
      expect(OG_LOCALE[locale], locale).toMatch(/^[a-z]{2}_IN$/);
    }
    expect(LOCALE_NAMES.gu.name).toMatch(GUJARATI);
  });

  it("narrows an unknown string to the default rather than throwing", () => {
    expect(asLocale("gu")).toBe("gu");
    expect(asLocale("hi")).toBe("en");
    expect(asLocale("fr")).toBe("en");
    expect(asLocale(undefined)).toBe("en");
  });
});

/* ------------------------------------------------------------------ *
 * Nothing renders, links to, or advertises a Hindi page
 * ------------------------------------------------------------------ */

describe("no /hi surface exists", () => {
  it("derives hreflang alternates from the locale list", () => {
    /* Derived, not listed: a hreflang set that disagrees with the sitemap is
       worse than none, because it promises a crawler an alternate that 404s. */
    const seo = read("src/lib/seo.ts");
    expect(seo).toContain("routing.locales.map");
    expect(seo).toContain("routing.defaultLocale");
    expect(stripComments(seo)).not.toContain('"hi"');
  });

  it("derives sitemap alternates from the locale list", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain("routing.locales.map");
    expect(stripComments(sitemap)).not.toContain('"hi"');
  });

  it("has no routed Hindi segment anywhere in the app tree", () => {
    const app = walk("src/app").filter((f) => /\.(tsx|ts)$/.test(f));
    for (const file of app) {
      expect(file, file).not.toMatch(/\/hi\//);
    }
  });

  it("declares no Devanagari font on the public site", () => {
    /* A face nothing renders is payload on every public page, and its
       presence is the quiet way a removed locale half-returns. */
    expect(read("package.json")).not.toContain("noto-sans-devanagari");
    /* Enumerated rather than listed: stylesheets come and go across the
       rebuild, and a hardcoded list silently stops checking the one that was
       added after it was written. */
    const sheets = readdirSync(join(process.cwd(), "src/app")).filter((f) => f.endsWith(".css"));
    expect(sheets.length).toBeGreaterThanOrEqual(3);
    for (const sheet of sheets) {
      const css = stripComments(read(`src/app/${sheet}`));
      expect(css, sheet).not.toContain("Devanagari");
      expect(css, sheet).not.toContain("U+0900");
      expect(css, sheet).not.toContain(":lang(hi)");
    }
  });

  it("leaves no Devanagari string in either catalogue", () => {
    for (const [name, cat] of [["en", en], ["gu", gu]] as const) {
      const leaves: string[] = [];
      const walkCat = (node: unknown) => {
        if (typeof node === "string") leaves.push(node);
        else if (node && typeof node === "object") Object.values(node).forEach(walkCat);
      };
      walkCat(cat);
      const devanagari = leaves.filter((v) => DEVANAGARI.test(v));
      expect(devanagari, `${name}: ${devanagari[0] ?? ""}`).toEqual([]);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The database boundary
 * ------------------------------------------------------------------ */

describe("the locale enum matches the database", () => {
  it("declares only the values Postgres actually has", () => {
    /* This enum was widened to three values on 2026-08-31 alongside a
       migration that never ran, so for one day the type system promised a
       value Postgres would have rejected on insert. Widen it only in the same
       change as an APPLIED `ALTER TYPE`, never ahead of one. */
    expect(read("src/lib/db/schema.ts")).toContain(
      'export const localeEnum = pgEnum("locale", ["en", "gu"]);'
    );
  });

  it("has no unapplied migration left in the journal", () => {
    const journal = JSON.parse(read("drizzle/meta/_journal.json")) as {
      entries: { idx: number; tag: string }[];
    };
    const tags = journal.entries.map((e) => e.tag);
    expect(tags).not.toContain("0005_trilingual_locale");
    /* Every journal entry has both a SQL file and a snapshot on disk, and
       every SQL file on disk has a journal entry. A file without an entry
       never runs; an entry without a file crashes `db:migrate`. */
    const sql = readdirSync(join(process.cwd(), "drizzle")).filter((f) => f.endsWith(".sql")).sort();
    expect(sql.map((f) => f.replace(/\.sql$/, ""))).toEqual([...tags].sort());
    for (const entry of journal.entries) {
      expect(existsSync(join(process.cwd(), `drizzle/meta/${String(entry.idx).padStart(4, "0")}_snapshot.json`)), entry.tag).toBe(true);
    }
  });

  it("accepts only public locales from a public form", () => {
    /* `applications.locale` and `design_jobs.locale` record which language a
       visitor filled the form in, and are constrained by the same enum. */
    const validation = read("src/lib/validation.ts");
    expect(validation).not.toContain('z.enum(["en", "gu", "hi"])');
    expect((validation.match(/z\.enum\(\["en", "gu"\]\)/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("keeps Karma Console on its own two-value locale type", () => {
    /* The Console's language and the website's language are different
       decisions that happen to have the same answer. Do not merge the types. */
    expect([...ADMIN_LOCALES]).toEqual(["en", "gu"]);
  });
});

/* ------------------------------------------------------------------ *
 * What Karma TEACHES is not what the website is published in
 * ------------------------------------------------------------------ */

describe("teaching languages survive the website's locale set", () => {
  it("still publishes Gujarati, Hindi and English as teaching languages", () => {
    /* Removing the Hindi WEBSITE does not make the teaching monolingual.
       Karma teaches and supports students in Hindi — a confirmed fact in
       `docs/content-checklist.md` — and telling a crawler otherwise would
       lose the studio real students. */
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain('const TEACHING_LANGUAGES = ["gu", "hi", "en"] as const');
    expect(schema).toContain("availableLanguage: TEACHING_LANGUAGES");
    expect(schema).toContain("inLanguage: TEACHING_LANGUAGES");
  });

  it("does not derive the teaching languages from routing", () => {
    /* If it ever did, publishing the website in two languages would silently
       claim the studio only teaches in two. */
    const schema = stripComments(read("src/lib/schema.ts"));
    expect(schema).not.toContain("routing.locales");
  });

  it("keeps the studio's own published answer about class language", () => {
    /* The FAQ a visitor actually reads. A Hindi speaker asking "which
       language is training in?" must still be told yes. */
    const faqs = read("src/content/collections.ts");
    expect(faqs).toContain("Which language is training in?");
    expect(faqs).toContain("Gujarati and Hindi");
  });
});
