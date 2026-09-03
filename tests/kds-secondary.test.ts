import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { privacySections, termsItems } from "../src/content/legal";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/**
 * PHASE 7 — the secondary public system.
 *
 * /services · /about · /contact · /success-stories · /verify · /verify/[id] ·
 * /privacy · /terms, plus the three route states.
 *
 * These are the pages a visitor reaches with a SPECIFIC question — can this
 * studio take my job, is this a real place, how do I reach it, is this
 * certificate real, what do you do with my number. Every rule below protects
 * an answer, not an arrangement.
 */

const PAGES = {
  services: "src/app/[locale]/services/page.tsx",
  about: "src/app/[locale]/about/page.tsx",
  contact: "src/app/[locale]/contact/page.tsx",
  stories: "src/app/[locale]/success-stories/page.tsx",
  verify: "src/app/[locale]/verify/page.tsx",
  verifyResult: "src/app/[locale]/verify/[id]/page.tsx",
  privacy: "src/app/[locale]/privacy/page.tsx",
  terms: "src/app/[locale]/terms/page.tsx"
} as const;

const STATES = [
  "src/app/[locale]/loading.tsx",
  "src/app/[locale]/not-found.tsx",
  "src/app/[locale]/error.tsx"
];

const source = Object.fromEntries(
  Object.entries(PAGES).map(([k, p]) => [k, read(p)])
) as Record<keyof typeof PAGES, string>;

/* A policy test must read what a page RENDERS, never what a comment explains:
   the doc comment on the verify result deliberately names `seal-in` as the
   thing it removed, and that must not be what fails the ban. */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ------------------------------------------------------------------ *
 * One system, and it is the new one
 * ------------------------------------------------------------------ */

describe("the secondary routes are on the rebuilt system", () => {
  it("uses no primitive from the superseded public system", () => {
    /* `<PageIntro>`, `<MonoNote>`, `<LedgerRow>` and the `container-site` /
       `section band-*` scaffolding belong to the system this rebuild
       replaces. A page still importing one is a page that was reskinned
       rather than rebuilt — which is exactly what the owner stopped. */
    for (const [name, file] of Object.entries(PAGES)) {
      const s = stripComments(read(file));
      for (const old of ["PageIntro", "MonoNote", "LedgerRow", "container-site", "band-info"]) {
        expect(s, `${name} · ${old}`).not.toContain(old);
      }
    }
  });

  it("opens every secondary route with the one shared page head", () => {
    /* The variety this site needs lives in the blocks BELOW the opening. A
       different first screen per page would read as a different site per
       page. The routes that earn a bespoke opening — home, the catalogue, a
       course, the notes archive — are not in this list. */
    for (const key of ["services", "about", "contact", "stories", "verify", "privacy", "terms"] as const) {
      expect(source[key], key).toContain("<PageHead");
    }
    /* The certificate RESULT is the exception, and deliberately so: it must
       answer before it introduces itself. */
    expect(source.verifyResult).not.toContain("<PageHead");
    expect(source.verifyResult).toContain('id="verdict-heading"');
  });

  it("never lets two neighbouring bands share a ground", () => {
    /* The grounds are the site's rhythm; two in a row is a seam that
       disappears. `<PageHead>` defaults to paper, `<StudioChain>` is mist and
       `<CtaBand>` names its own — all three counted, or the check would miss
       the joins that actually broke. */
    const groundsOf = (s: string): string[] => {
      const out: string[] = [];
      for (const m of s.matchAll(
        /<PageHead|<StudioChain|ground="(on-[a-z]+)"|className="band[a-z-]* (on-[a-z]+)"/g
      )) {
        if (m[0].startsWith("<PageHead")) out.push("on-paper");
        else if (m[0].startsWith("<StudioChain")) out.push("on-mist");
        else out.push(m[1] ?? m[2]);
      }
      return out;
    };
    for (const [name, s] of Object.entries(source)) {
      const grounds = groundsOf(stripComments(s));
      expect(grounds.length, name).toBeGreaterThan(0);
      for (let i = 1; i < grounds.length; i += 1) {
        expect(`${name}: ${grounds[i - 1]} → ${grounds[i]}`).not.toBe(
          `${name}: ${grounds[i]} → ${grounds[i]}`
        );
      }
      /* A page long enough to have four bands uses at least three grounds. */
      if (grounds.length >= 4) expect(new Set(grounds).size, name).toBeGreaterThanOrEqual(3);
    }
  });

  it("resolves every locale through the accessor, never through a ternary", () => {
    /* CLAUDE.md non-negotiable #1. The else-branch of `locale === "gu" ? … :
       …` renders a MISSING Gujarati string as English and looks exactly like
       a translated one. Both legal pages carried two of them until Phase 7. */
    for (const [name, file] of Object.entries(PAGES)) {
      const s = stripComments(read(file));
      expect(s, name).not.toMatch(/locale === "gu"/);
      expect(s, name).not.toMatch(/\bgu \? /);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The B2B studio promises only what the floor has confirmed
 * ------------------------------------------------------------------ */

describe("/services", () => {
  it("quotes no turnaround, no price and no guarantee", () => {
    /* The studio has confirmed none of the three, and a B2B page that invents
       a delivery window is writing a cheque the floor has to cash. The copy
       asks for the buyer's deadline instead of announcing ours. */
    const en = JSON.parse(read("messages/en.json")) as Record<string, never>;
    const text = (JSON.stringify(en["servicesPage"]) + stripComments(source.services)).toLowerCase();
    for (const banned of [
      /₹/,
      /\b\d+\s*(hour|hr|day|week)s?\s*(turnaround|delivery)\b/,
      /\bwithin \d+ (hour|day)s?\b/,
      /\bguarantee[ds]?\b/,
      /\bsame.day\b/
    ]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });

  it("draws the commercial chain as a seam, not with the school's photographs", () => {
    /* The owner's 32-shot list covers the school, not the commercial
       pipeline. Borrowing a classroom frame would caption commercial work
       with a photograph of a class. */
    const chain = stripComments(read("src/components/kds/studio/StudioChain.tsx"));
    expect(chain).not.toContain("PhotoFrame");
    expect(chain).not.toContain("photosInGroup");
    expect(chain).toContain("<NeedlePoint");
    expect(chain).toContain("<ThreadLine vertical");
  });

  it("keeps the brief form's defences and its confidentiality promise", () => {
    expect(source.services).toContain("<BriefForm");
    expect(source.services).toContain('t("confidential")');
    const form = read("src/components/forms/BriefForm.tsx");
    for (const defence of ["TurnstileWidget", "turnstileToken", "MAX_FILES", "MAX_FILE_BYTES"]) {
      expect(form, defence).toContain(defence);
    }
    expect(read("src/app/api/brief/route.ts")).not.toContain("KDS-B-RECEIVED");
  });
});

/* ------------------------------------------------------------------ *
 * Contact — ranked channels, and two numbers kept apart
 * ------------------------------------------------------------------ */

describe("/contact", () => {
  it("ranks the channels instead of presenting five equal options", () => {
    expect(source.contact).toContain('className="channels"');
    expect(source.contact).toContain("channel channel-primary");
    /* Exactly one primary: a ranking with two firsts is not a ranking. */
    expect((source.contact.match(/primary: true/g) ?? [])).toHaveLength(1);
  });

  it("never labels the call number as WhatsApp", () => {
    /* Two mobile numbers, two roles. The owner has not confirmed which
       answers which, so each row names its own channel. */
    const s = stripComments(source.contact);
    const waRow = s.slice(s.indexOf("waLink("), s.indexOf("landlineLabel"));
    expect(waRow).toContain("site.phoneDisplay");
    expect(s).not.toMatch(/icon: "whatsapp"[\s\S]{0,200}callPhone/);
  });

  it("takes every number from the one source of truth", () => {
    /* A phone number typed into a page is a phone number that goes stale in
       one place only. */
    const s = stripComments(source.contact);
    expect(s).not.toMatch(/\b\d{10}\b/);
    for (const field of ["site.whatsapp", "site.landline", "site.callPhone", "site.email"]) {
      expect(s, field).toContain(field);
    }
  });

  it("reserves the entrance frame rather than standing in for it", () => {
    expect(source.contact).toContain("A2_ENTRANCE_SIGNBOARD");
  });
});

/* ------------------------------------------------------------------ *
 * Certificate verification — the surface that must not perform
 * ------------------------------------------------------------------ */

describe("/verify", () => {
  const files = [PAGES.verify, PAGES.verifyResult, "src/components/site/VerifyForm.tsx"];

  it("puts no motion anywhere in the verification flow", () => {
    /* The result used to arrive inside a `seal-in` animation on a dashed
       circle. A certificate stamping itself is precisely the gesture a fake
       one would make. */
    for (const file of files) {
      const s = stripComments(read(file));
      for (const motion of ["Reveal", "seal-in", "media-unveil", "stitch-wipe", "animate"]) {
        expect(s, `${file} · ${motion}`).not.toContain(motion);
      }
    }
  });

  it("answers with a word and a mark, never with colour alone", () => {
    /* This page gets printed, forwarded and read on a cracked phone in
       daylight. Status colour is the fourth signal and never the first. */
    const s = source.verifyResult;
    expect(s).toContain("verdict verdict-${state}");
    expect(s).toContain('t("validTitle")');
    expect(s).toContain('t("invalidTitle")');
    expect(s).toContain("<Icon name={mark}");
    const css = read("src/app/thread-machine-proof.css");
    for (const state of ["ok", "bad", "wait"]) {
      expect(css, state).toContain(`.kds .verdict-${state} {`);
    }
  });

  it("treats a number that does not resolve as a reason to call, not a verdict on a person", () => {
    const en = JSON.parse(read("messages/en.json")) as { verifyPage: Record<string, string> };
    expect(en.verifyPage.invalidBody.toLowerCase()).toContain("contact the studio");
    for (const banned of [/\bfake\b/, /\bfraud\b/, /\bforged\b/]) {
      expect(en.verifyPage.invalidBody.toLowerCase(), String(banned)).not.toMatch(banned);
    }
    /* The studio's phone is on the page whatever the verdict. */
    expect(source.verifyResult).toContain("site.phoneDisplay");
  });

  it("keeps a per-certificate result out of the index", () => {
    /* A page carrying a named person's completion record must not be
       crawlable. This is a privacy decision, not an SEO one. */
    expect(source.verifyResult).toContain("index: false");
    expect(source.verifyResult).not.toContain("pageMeta");
  });

  it("degrades honestly when the records system is not reachable", () => {
    /* Not "invalid" — unavailable. Answering "not found" because the database
       is unconfigured would call a real certificate fake. */
    expect(source.verifyResult).toContain("getDb() !== null");
    expect(source.verifyResult).toContain('!dbConfigured ? "wait"');
  });
});

/* ------------------------------------------------------------------ *
 * The two legal documents
 * ------------------------------------------------------------------ */

describe("privacy and terms", () => {
  it("keeps the terms page out of the index until the owner approves it", () => {
    /* ⚠ Draft. A styling phase must not publish it — see
       docs/content-checklist.md. */
    expect(source.terms).toContain("noIndex: true");
    expect(source.privacy).not.toContain("noIndex");
  });

  it("carries a real Gujarati translation of every clause", () => {
    expect(privacySections.length).toBeGreaterThanOrEqual(5);
    for (const s of privacySections) {
      expect(s.headingGu.trim(), s.id).not.toBe("");
      expect(s.headingGu, s.id).not.toBe(s.headingEn);
      expect(s.bodyGu.length, s.id).toBe(s.bodyEn.length);
      for (const line of s.bodyGu) expect(line.trim(), s.id).not.toBe("");
    }
    expect(termsItems.length).toBeGreaterThanOrEqual(6);
    for (const t of termsItems) {
      expect(t.textGu.trim(), t.id).not.toBe("");
      expect(t.textGu, t.id).not.toBe(t.textEn);
    }
  });

  it("states no fee, refund window or course duration", () => {
    /* Those are the owner's to state, and a terms page is the worst possible
       place to guess one. The unconfirmed durations of ten courses make an
       invented "within 7 days" here a factual claim about all of them. */
    const text = JSON.stringify([privacySections, termsItems]).toLowerCase();
    for (const banned of [/₹/, /\brefund\b/, /\b\d+\s*(day|week|month)s?\b/, /\bfee of\b/]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });

  it("keeps the studio's contact route in one place", () => {
    /* The clause carries a `{email}` token rather than a second copy of the
       address, so `src/lib/site.ts` stays the only place it is written. */
    const rights = privacySections.find((s) => s.id === "rights");
    expect(rights?.bodyEn[0]).toContain("{email}");
    expect(rights?.bodyGu[0]).toContain("{email}");
    expect(source.privacy).toContain('line.replace("{email}", site.email)');
    expect(JSON.stringify([privacySections, termsItems])).not.toContain("@");
  });

  it("says the payment rule the whole site depends on", () => {
    /* No payment gateway exists, anywhere. The terms are where that is
       stated rather than implied. */
    const payment = termsItems.find((t) => t.id === "payment");
    expect(payment?.textEn.toLowerCase()).toContain("no online payment");
  });
});

/* ------------------------------------------------------------------ *
 * The catalogue answers every key these routes ask for
 * ------------------------------------------------------------------ */

describe("message keys resolve on every public route", () => {
  /**
   * next-intl does NOT fail a build on a missing key — it logs
   * `MISSING_MESSAGE` and renders the key path into the page. On a public
   * marketing site that is a visible defect that ships silently, and it
   * shipped twice during this rebuild before a running page was read.
   *
   * `tests/kds-shell.test.ts` does this for `src/components/kds/**`. This does
   * it for the ROUTES, which bind their namespaces differently: a page reaches
   * for several at once inside `Promise.all`, so the binding has to be matched
   * positionally rather than by a `const t = …` line.
   */
  const en = JSON.parse(read("messages/en.json")) as Record<string, unknown>;
  const gu = JSON.parse(read("messages/gu.json")) as Record<string, unknown>;

  const lookup = (cat: Record<string, unknown>, path: string) =>
    path.split(".").reduce<unknown>((node, part) => {
      if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
        return (node as Record<string, unknown>)[part];
      }
      return undefined;
    }, cat);

  /** Namespace bindings in a route file, all three shapes. */
  function bindings(src: string): Map<string, string> {
    const map = new Map<string, string>();
    for (const m of src.matchAll(/const (\w+) = (?:await )?(?:use|get)Translations\(\s*"([^"]+)"/g)) {
      map.set(m[1], m[2]);
    }
    /* `getTranslations({ locale, namespace: "meta.contact" })` — the form
       `generateMetadata` has to use, because it resolves a locale it was
       handed rather than the request's. */
    for (const m of src.matchAll(
      /const (\w+) = await getTranslations\(\{[^}]*namespace:\s*"([^"]+)"/g
    )) {
      map.set(m[1], m[2]);
    }
    /* `const [t, tc, l] = await Promise.all([getTranslations("a"),
       getTranslations("b"), getLocale()])` — paired in order, with the
       non-translation entries holding their slot so nothing shifts. */
    for (const m of src.matchAll(
      /const \[([^\]]+)\] = await Promise\.all\(\[([\s\S]*?)\]\);/g
    )) {
      const names = m[1].split(",").map((n) => n.trim());
      const calls = m[2].split(/,(?![^(]*\))/).map((c) => c.trim());
      names.forEach((name, i) => {
        const ns = /(?:use|get)Translations\(\s*"([^"]+)"/.exec(calls[i] ?? "");
        if (ns) map.set(name, ns[1]);
      });
    }
    return map;
  }

  /* A plain walk, not a glob: the route root is literally `[locale]`, and a
     glob reads those brackets as a character class. */
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(join(process.cwd(), dir))) {
      const rel = `${dir}/${entry}`;
      if (statSync(join(process.cwd(), rel)).isDirectory()) out.push(...walk(rel));
      else if (rel.endsWith("/page.tsx")) out.push(rel);
    }
    return out;
  }

  const routeFiles = [...walk("src/app/[locale]"), ...STATES];

  it("finds every literal key the public routes ask for", () => {
    expect(routeFiles.length).toBeGreaterThanOrEqual(12);
    const missing: string[] = [];
    let checked = 0;

    for (const file of routeFiles) {
      const whole = stripComments(read(file));
      /* `generateMetadata` binds its own `t` to the `meta.*` namespace and
         the component below binds the SAME name to the page's namespace, so
         the two are resolved as separate scopes. Flattening them reported
         `contactPage.description` — a key nobody asks for — as missing. */
      const metaStart = whole.indexOf("export async function generateMetadata");
      /* Measured from the END of the signature, not from its start: the
         destructured `params` argument puts a `}` in column 1 three lines in,
         and cutting there left most of the function in the other scope. */
      const sigEnd = whole.indexOf("Promise<Metadata> {", metaStart);
      const metaEnd = metaStart === -1 ? -1 : whole.indexOf("\n}", Math.max(sigEnd, metaStart));
      const scopes =
        metaStart === -1
          ? [whole]
          : [whole.slice(metaStart, metaEnd + 2), whole.slice(0, metaStart) + whole.slice(metaEnd + 2)];

      for (const src of scopes) {
        const nsOf = bindings(src);
        if (nsOf.size === 0) continue;
        for (const call of src.matchAll(/\b(\w+)\(\s*"([^"]+)"/g)) {
          const ns = nsOf.get(call[1]);
          if (!ns) continue;
          const path = `${ns}.${call[2]}`;
          checked += 1;
          if (lookup(en, path) === undefined) missing.push(`en · ${path} (${file})`);
          if (lookup(gu, path) === undefined) missing.push(`gu · ${path} (${file})`);
        }
      }
    }

    /* Non-vacuity: a scan that stopped matching fails here rather than
       reporting an empty set of problems. */
    expect(checked).toBeGreaterThan(120);
    expect(missing).toEqual([]);
  });
});
