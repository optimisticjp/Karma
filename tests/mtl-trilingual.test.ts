import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import en from "../messages/en.json";
import gu from "../messages/gu.json";
import hi from "../messages/hi.json";
import { routing, LOCALE_NAMES, OG_LOCALE, asLocale } from "@/i18n/routing";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const leaves = (o: unknown, path = ""): Array<[string, string]> => {
  if (typeof o === "string") return [[path, o]];
  if (Array.isArray(o)) return o.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (o && typeof o === "object")
    return Object.entries(o).flatMap(([k, v]) => leaves(v, `${path}.${k}`));
  return [];
};

const DEVANAGARI = /[ऀ-ॿ]/;
const GUJARATI = /[઀-૿]/;

/* ------------------------------------------------------------------ *
 * Hindi is a locale, not a button
 *
 * The owner's instruction was explicit: "Do NOT merely add a Hindi
 * button that falls back to English." These assertions are what makes
 * that mechanical rather than a promise.
 * ------------------------------------------------------------------ */

describe("the Hindi catalogue is actually Hindi", () => {
  const hiLeaves = leaves(hi);
  const enLeaves = new Map(leaves(en));

  it("carries the whole public catalogue", () => {
    expect(hiLeaves.length).toBeGreaterThan(800);
  });

  it("is written in Devanagari, not transliterated Latin", () => {
    /* At least four fifths of the prose must contain Devanagari. The rest is
       brand names, trade terms, numbers and the mixed-script WhatsApp
       prefills — all of which the Gujarati keeps in Latin too. */
    const prose = hiLeaves.filter(([, v]) => v.split(/\s+/).length > 3);
    const devanagari = prose.filter(([, v]) => DEVANAGARI.test(v));
    expect(devanagari.length / prose.length).toBeGreaterThan(0.8);
  });

  it("leaves no multi-word English sentence standing as a translation", () => {
    /* The precise failure this catches: a value copied from en.json because
       nobody translated it. A value may legitimately equal the English when
       it is a brand, a product name, a number or a trade label — so the test
       is scoped to values of more than three words with no Devanagari at all. */
    const untranslated = hiLeaves.filter(
      ([k, v]) =>
        enLeaves.get(k) === v && v.split(/\s+/).length > 3 && !DEVANAGARI.test(v)
    );
    expect(untranslated.map(([k]) => k)).toEqual([]);
  });

  it("contains no Gujarati script", () => {
    /* Not a hypothetical: the source catalogue the translation was built from
       carries Gujarati, and a copied value would be invisible in review. */
    const leaked = hiLeaves.filter(([, v]) => GUJARATI.test(v));
    expect(leaked.map(([k]) => k)).toEqual([]);
  });

  it("preserves every ICU placeholder and plural branch", () => {
    const PH = /\{\s*(\w+)\s*(?:\}|,\s*(?:plural|select|selectordinal))/g;
    const problems: string[] = [];
    for (const [k, v] of leaves(en)) {
      if (k.startsWith(".admin")) continue;
      const h = new Map(hiLeaves).get(k);
      if (h === undefined) continue;
      const a = [...v.matchAll(PH)].map((m) => m[1]).sort();
      const b = [...h.matchAll(PH)].map((m) => m[1]).sort();
      if (a.join() !== b.join()) problems.push(`${k}: ${a} vs ${b}`);
      if (v.includes("plural")) {
        for (const branch of v.matchAll(/(=\d+|one|other|few|many)\s*\{/g)) {
          if (!new RegExp(`${branch[1]}\\s*\\{`).test(h)) {
            problems.push(`${k}: lost plural branch ${branch[1]}`);
          }
        }
        if (v.includes("#") && !h.includes("#")) problems.push(`${k}: lost # marker`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("never uppercases a Devanagari string", () => {
    /* The Gujarati rule, applied to the second Indic script. There is no
       uppercase in Devanagari, so an ALL-CAPS value here can only be Latin
       copy that was styled rather than written — EXCEPT for the product name
       the institute itself writes in capitals, which is the one thing on this
       site that must never be re-cased. */
    const PRODUCT_NAMES = new Set(["EMCAD DAHAO", "EMCAD", "PDF", "ZIP", "AI", "PNG", "JPG"]);
    for (const [k, v] of hiLeaves) {
      if (DEVANAGARI.test(v)) continue;
      if (PRODUCT_NAMES.has(v.trim())) continue;
      expect(v, k).not.toMatch(/^[A-Z][A-Z\s]{4,}$/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Routing and metadata derive from the locale list
 * ------------------------------------------------------------------ */

describe("the locale set is derived, not restated", () => {
  it("routes three public locales with English as default", () => {
    expect([...routing.locales]).toEqual(["en", "gu", "hi"]);
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localeDetection).toBe(false);
  });

  it("names every locale in its own script, with a preview", () => {
    for (const locale of routing.locales) {
      const meta = LOCALE_NAMES[locale];
      expect(meta, locale).toBeTruthy();
      expect(meta.name.length, locale).toBeGreaterThan(0);
      expect(meta.preview.length, locale).toBeGreaterThan(0);
    }
    expect(LOCALE_NAMES.gu.name).toMatch(GUJARATI);
    expect(LOCALE_NAMES.hi.name).toMatch(DEVANAGARI);
  });

  it("has an OpenGraph tag per locale", () => {
    for (const locale of routing.locales) {
      expect(OG_LOCALE[locale], locale).toMatch(/^[a-z]{2}_IN$/);
    }
  });

  it("builds hreflang from the locale list rather than a hardcoded pair", () => {
    const seo = read("src/lib/seo.ts");
    expect(seo).toContain("routing.locales.map");
    expect(seo).toContain("routing.defaultLocale");
    /* The exact shape that was there before, and the one that would silently
       advertise two alternates on a three-locale site. */
    expect(stripComments(seo)).not.toContain('gu: `${site.url}/gu${path}`');
    expect(stripComments(seo)).not.toContain('locale === "gu" ? "gu_IN" : "en_IN"');
  });

  it("builds sitemap alternates from the locale list too", () => {
    /* These were two hardcoded entries while the URLs already iterated the
       list — so a third locale would have tripled the sitemap while every
       entry still claimed two alternates. */
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain("routing.locales.map((l) => [l, `${site.url}/${l}${path}`])");
    expect(stripComments(sitemap)).not.toContain("gu: `${site.url}/gu${path}`");
  });

  it("narrows an unknown string safely", () => {
    expect(asLocale("hi")).toBe("hi");
    expect(asLocale("fr")).toBe("en");
    expect(asLocale(undefined)).toBe("en");
  });
});

/* ------------------------------------------------------------------ *
 * The language chooser
 * ------------------------------------------------------------------ */

describe("the language chooser", () => {
  const chooser = read("src/components/site/LanguageChooser.tsx");
  const banner = read("src/components/site/LangBanner.tsx");

  it("offers every routed locale rather than a hardcoded pair", () => {
    expect(chooser).toContain("routing.locales.map");
    expect(stripComments(chooser)).not.toContain('"en" | "gu"');
  });

  it("uses no flags", () => {
    /* A flag is a country. None of these three is one, and Gujarati and Hindi
       are spoken in the same country as each other. */
    const clean = stripComments(chooser) + stripComments(banner);
    for (const flag of ["🇬🇧", "🇮🇳", "🇺🇸", "flag"]) {
      expect(clean.toLowerCase(), flag).not.toContain(flag.toLowerCase());
    }
  });

  it("marks each option with its own language for assistive tech", () => {
    expect(chooser).toContain("lang={code}");
    expect(banner).toContain("lang={code}");
  });

  it("preserves the route and remembers the choice without auto-redirecting", () => {
    expect(chooser).toContain("router.replace(pathname, { locale: next })");
    expect(chooser).toContain("kds-lang-choice");
    /* Remembering is not redirecting: `localeDetection` stays off and the URL
       still decides. */
    expect(read("src/i18n/routing.ts")).toContain("localeDetection: false");
  });

  it("is a real dialog", () => {
    expect(chooser).toContain('role="dialog"');
    expect(chooser).toContain('aria-modal="true"');
    expect(chooser).toContain('e.key === "Escape"');
    expect(chooser).toContain('e.key === "Tab"');
    expect(chooser).toContain("triggerRef.current?.focus()");
  });

  it("replaced the two-value pill entirely", () => {
    /* Three values do not fit a segmented pill, and a pill has nowhere to put
       the native-script preview line. */
    expect(() => read("src/components/site/LanguageToggle.tsx")).toThrow();
  });

  it("offers both other languages in the banner, not one", () => {
    expect(banner).toContain("otherLocales(");
    expect(stripComments(banner)).not.toContain('locale === "en" ? "gu" : "en"');
  });
});

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

describe("public navigation", () => {
  const header = read("src/components/site/Header.tsx");

  it("carries six desktop links and seven mobile rows", () => {
    /* Scoped to the NAV declaration: the file also builds MOBILE_NAV from it
       with an inline seventh entry, which the un-scoped match counted. */
    const navBlock = header.slice(header.indexOf("const NAV = ["), header.indexOf("] as const;"));
    const desktop = [...navBlock.matchAll(/\{ href: "(\/[a-z-]+)", key: "(\w+)" \}/g)];
    expect(desktop).toHaveLength(6);
    expect(desktop.map((m) => m[1])).toEqual([
      "/courses",
      "/batches",
      "/student-work",
      "/notes",
      "/services",
      "/about"
    ]);
    /* Mobile is the same six plus Contact — a phone menu is where someone
       looks for a phone number. */
    expect(header).toContain('MOBILE_NAV = [...NAV, { href: "/contact", key: "contact" }]');
  });

  it("drops Home, because the wordmark is the home link", () => {
    expect(stripComments(header)).not.toContain('key: "home"');
    expect(header).toContain('aria-label="Karma Design Studio: home"');
  });

  it("labels /about as Studio without renaming the route", () => {
    expect(header).toContain('{ href: "/about", key: "studio" }');
    for (const [name, cat] of [["en", en], ["gu", gu], ["hi", hi]] as const) {
      expect(cat.nav.studio, name).toBeTruthy();
      expect(cat.nav.batches, name).toBeTruthy();
    }
  });

  it("anchors Book free demo at the bottom of the mobile menu", () => {
    const menu = header.slice(header.indexOf("MOBILE_NAV.map"));
    expect(menu.indexOf('href="/admission"')).toBeGreaterThan(menu.indexOf("MOBILE_NAV.map"));
  });

  it("keeps the mobile menu a real dialog", () => {
    expect(header).toContain('role="dialog"');
    expect(header).toContain('aria-modal="true"');
    expect(header).toContain('e.key === "Escape"');
  });
});

/* ------------------------------------------------------------------ *
 * The content accessor
 * ------------------------------------------------------------------ */

describe("localized content resolves in one place", () => {
  const localized = read("src/lib/i18n/localized.ts");

  it("resolves a locale rather than branching on one", () => {
    expect(localized).toContain("const SUFFIX: Record<Locale, string>");
    expect(localized).toContain("export function pick(");
    expect(localized).toContain("export function tr(");
  });

  it("never falls back silently in development", () => {
    /* A silent fallback is indistinguishable from a translation that exists,
       which is exactly how a "Hindi" site stays English. */
    expect(localized).toContain("warnOnce");
    expect(localized).toContain('process.env.NODE_ENV === "production"');
  });

  it("distinguishes an absent optional field from an empty one", () => {
    /* `""` is truthy enough in JSX to leave a gap where a sentence should be;
       `undefined` lets the caller render nothing at all. */
    expect(localized).toContain("export function pickOptional(");
    expect(localized).toContain("return undefined;");
  });

  it("gives every locale a real Intl tag", () => {
    expect(localized).toContain('{ en: "en-IN", gu: "gu-IN", hi: "hi-IN" }');
  });
});

/* ------------------------------------------------------------------ *
 * The database boundary
 * ------------------------------------------------------------------ */

describe("the locale enum and what it does not imply", () => {
  it("widens the Postgres enum additively, in a new migration", () => {
    const migration = read("drizzle/0005_trilingual_locale.sql");
    expect(migration).toContain(`ALTER TYPE "public"."locale" ADD VALUE 'hi'`);
    /* Never edit an applied migration. */
    for (const old of ["0000", "0001", "0002", "0003", "0004"]) {
      const files = walk("drizzle").filter((f) => f.includes(`/${old}`) && f.endsWith(".sql"));
      expect(files.length, old).toBe(1);
    }
  });

  it("keeps Karma Console bilingual", () => {
    /* The Console shares the Postgres enum and does not share the decision.
       Widening a database enum permits a value; it does not require anything
       to use it. */
    const adminI18n = read("src/lib/admin/i18n.ts");
    expect(adminI18n).toContain('export const ADMIN_LOCALES = ["en", "gu"] as const');
    expect(stripComments(adminI18n)).not.toContain('"hi"');
  });

  it("narrows a stored locale before the Console renders it", () => {
    const staff = read("src/lib/auth/staff.ts");
    expect(staff).toContain("toAdminLocale");
  });

  it("lets a student's TEACHING language be Hindi", () => {
    /* Karma teaches in Gujarati and Hindi — verified. Being unable to record
       a Hindi-preferring student was a gap in the record, not a constraint
       anyone chose. */
    const forms = read("src/app/admin/(console)/students/StudentForms.tsx");
    expect(forms).toContain('<option value="hi">{copy.languageHi}</option>');
    const copy = read("src/lib/admin/students-copy.ts");
    expect((copy.match(/languageHi:/g) ?? []).length).toBe(2);
  });

  it("accepts a Hindi submission on the public forms", () => {
    const validation = read("src/lib/validation.ts");
    expect((validation.match(/z\.enum\(\["en", "gu", "hi"\]\)/g) ?? []).length).toBe(2);
  });
});

/* ------------------------------------------------------------------ *
 * Structured data
 * ------------------------------------------------------------------ */

describe("structured data agrees with itself about language", () => {
  it("states one set of teaching languages", () => {
    /* `availableLanguage` said ["gu","hi","en"] while `inLanguage` on the same
       page said ["gu","en"] — two JSON-LD blocks contradicting each other
       about whether Karma teaches in Hindi. It does. */
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain('const TEACHING_LANGUAGES = ["gu", "hi", "en"] as const');
    expect((schema.match(/TEACHING_LANGUAGES/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(stripComments(schema)).not.toContain('inLanguage: ["gu", "en"]');
  });
});
