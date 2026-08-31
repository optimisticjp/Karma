import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily } from "../src/content/courses";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG, KARMA_SOFTWARE } from "../src/content/course-operations";
import { PHOTO_MANIFEST, photosInGroup } from "../src/content/photo-manifest";

/**
 * THE HOMEPAGE, REBUILT.
 *
 * This suite replaces `machine-lab-homepage` and `machine-lab-shell`, which
 * asserted the composition of a twenty-section page whose components no longer
 * exist. What was worth keeping was never the section order of that page — it
 * was the FACTUAL and ACCESSIBILITY rules underneath it, and every one of them
 * is carried forward here against the new components:
 *
 *  - EMCAD DAHAO figures are rendered from the verified record, never typed
 *    into a message catalogue;
 *  - one course's confirmed facts never become the site's;
 *  - no online payment, anywhere, and the page says so;
 *  - no invented machine specification;
 *  - no student name, outcome or earning attached to a photograph;
 *  - no other digitising package;
 *  - the signature interaction never autoplays and never needs a drag.
 *
 * The old suites additionally asserted a specific twenty-tag order and a
 * four-band rhythm. Those encoded the composition the owner rejected, so they
 * are replaced rather than weakened: the durable rule — the order is a
 * DECISION and two adjacent sections never share a surface — is asserted
 * below against the ten blocks that exist now.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/* Policy tests read what the page RENDERS, not what a comment explains. A doc
   comment saying "no RPM, ever" must not fail the test that bans RPM. */
const code = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* eslint-disable @typescript-eslint/no-explicit-any */
const en = JSON.parse(read("messages/en.json")) as any;
const gu = JSON.parse(read("messages/gu.json")) as any;

const HOME_DIR = "src/components/kds/home";
const page = read("src/app/[locale]/page.tsx");
const hero = read(`${HOME_DIR}/HomeHero.tsx`);
const emcad = read(`${HOME_DIR}/EmcadPanel.tsx`);
const wall = read(`${HOME_DIR}/ProofWall.tsx`);
const smp = read(`${HOME_DIR}/ScreenMachineProof.tsx`);
const book = read(`${HOME_DIR}/SampleBook.tsx`);

const BLOCKS = [
  "HomeHero",
  "EntryPaths",
  "SampleBook",
  "ScreenMachineProof",
  "EmcadPanel",
  "ProofWall",
  "HomeVoices",
  "TrustSignals",
  "BatchesVisit",
  "HomeClose"
] as const;

/* ------------------------------------------------------------------ *
 * The composition
 * ------------------------------------------------------------------ */

describe("homepage architecture", () => {
  it("renders the ten blocks in the order the questions arrive", () => {
    const at = BLOCKS.map((tag) => page.indexOf(`<${tag} />`));
    expect(at.every((p) => p > -1)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("puts the money question inside the first half of the page", () => {
    /* The one course with a confirmed duration and a published fee must not
       sit behind five screens of preamble — that was the single worst thing
       about the page this replaces. */
    const at = (tag: string) => page.indexOf(`<${tag} />`);
    for (const later of ["ProofWall", "HomeVoices", "TrustSignals", "BatchesVisit"]) {
      expect(at("EmcadPanel"), `EmcadPanel before ${later}`).toBeLessThan(at(later));
    }
  });

  it("never puts two blocks with the same ground next to each other", () => {
    /* Two adjacent sections sharing a surface is what makes a long scroll
       read as one slab. Every block declares exactly one ground. */
    const GROUNDS = ["on-canvas", "on-paper", "on-cloth", "on-mist"] as const;
    const grounds = BLOCKS.map((tag) => {
      const source = code(read(`${HOME_DIR}/${tag}.tsx`));
      const found = GROUNDS.filter((g) => source.includes(`${g}"`) || source.includes(`${g} `));
      expect(found.length, `${tag} declares exactly one ground`).toBe(1);
      return { tag, ground: found[0] };
    });
    for (let i = 1; i < grounds.length; i += 1) {
      const pair = `${grounds[i - 1].tag} → ${grounds[i].tag}`;
      expect(grounds[i - 1].ground === grounds[i].ground, pair).toBe(false);
    }
    /* Non-vacuity: all four grounds are actually in play. */
    expect(new Set(grounds.map((g) => g.ground)).size).toBe(4);
  });

  it("gives every block a different shape, not ten copies of one card", () => {
    /* The addendum's §2: the site may use familiar patterns; what it must not
       do is use the same one nine times. Each block owns its own layout
       class, and no shared `card` component sits under all of them. */
    for (const tag of BLOCKS) {
      expect(read(`${HOME_DIR}/${tag}.tsx`), tag).not.toContain("card-lift");
    }
  });

  it("keeps the old homepage components deleted rather than orphaned", () => {
    const dirs = readdirSync("src/components", { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(dirs).not.toContain("home");
  });
});

/* ------------------------------------------------------------------ *
 * The hero
 * ------------------------------------------------------------------ */

describe("the hero", () => {
  it("names the one software Karma teaches, from source", () => {
    expect(KARMA_SOFTWARE).toBe("EMCAD DAHAO");
    expect(hero).toContain("KARMA_SOFTWARE");
  });

  it("renders the demo from the verified record rather than a round number", () => {
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.free).toBe(true);
    expect(hero).toContain("EMCAD_DAHAO.operations.demo");
    /* And the label carries the course the demo belongs to, so a visitor
       cannot read it as an offer on all eleven. */
    expect(en.home.hero.factDemoLabel).toContain("EMCAD DAHAO");
    expect(gu.home.hero.factDemoLabel).toContain("EMCAD DAHAO");
  });

  it("says where the studio is, and that teaching happens on machines", () => {
    expect(en.home.hero.factWhereValue).toContain("Mota Varachha");
    expect(gu.home.hero.factWhereValue).toContain("મોટા વરાછા");
    expect(en.home.hero.factPracticalValue.toLowerCase()).toContain("machine");
    expect(gu.home.hero.factPracticalValue).toContain("મશીન");
  });

  it("quotes no fee — fees are discussed offline", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.hero);
      expect(block).not.toContain("35,000");
      expect(block).not.toContain("₹");
    }
  });

  it("never lets one course's duration become the site's", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.hero);
      /* Wherever a duration is stated in the hero, the same string names the
         course it belongs to. */
      if (/3\s*(months|મહિના)/.test(block)) {
        expect(block).toContain("EMCAD DAHAO");
      }
      /* And it is never restated in weeks. */
      expect(block.toLowerCase()).not.toContain("12 week");
      expect(block.toLowerCase()).not.toContain("twelve week");
    }
  });

  it("keeps follower counts out of the fact row", () => {
    /* Social proof is a different kind of claim and lives in its own block.
       Mixing them makes the verified facts read as marketing. */
    expect(hero).not.toContain("@/content/proof");
    expect(read(`${HOME_DIR}/TrustSignals.tsx`)).toContain("@/content/proof");
  });

  it("uses the three reserved hero slots, each a real manifest frame", () => {
    for (const id of ["H1_EMCAD_SCREEN", "H2_MACHINE_STITCHING", "H3_FINISHED_PIECE"]) {
      expect(hero, id).toContain(id);
      expect(PHOTO_MANIFEST.some((s) => s.id === id), id).toBe(true);
    }
    /* One continuous thread down the scene, not three connectors that happen
       to line up. */
    expect((hero.match(/hero-scene-thread/g) ?? [])).toHaveLength(1);
  });

  it("is one markup tree, not a desktop collage plus a mobile copy", () => {
    expect(hero).not.toMatch(/className="[^"]*\blg:hidden\b/);
    expect(hero).not.toMatch(/className="[^"]*\bhidden lg:\b/);
  });
});

/* ------------------------------------------------------------------ *
 * The sample book
 * ------------------------------------------------------------------ */

describe("the sample book", () => {
  it("reaches all eleven courses, not a curated selection", () => {
    expect(coursesByFamily).toHaveLength(11);
    expect(coursesByFamily).toHaveLength(courses.length);
    expect(book).toContain("coursesByFamily");
    expect(book).not.toContain(".slice(");
  });

  it("shows a duration only where the owner confirmed one", () => {
    expect(book).toContain("verifiedOperationsFor");
    const confirmed = courses.filter((c) => c.slug === EMCAD_DAHAO_SLUG);
    expect(confirmed).toHaveLength(1);
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
  });

  it("puts no fee on a catalogue row", () => {
    expect(book).not.toContain("feeTotal");
    expect(book).not.toContain("₹");
  });
});

/* ------------------------------------------------------------------ *
 * The EMCAD DAHAO decision panel
 * ------------------------------------------------------------------ */

describe("the EMCAD DAHAO decision panel", () => {
  it("reads every figure from the verified record, not from a message", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.emcad);
      expect(block).not.toContain("35,000");
      expect(block).not.toContain("25,000");
      expect(block).not.toContain("10,000");
      expect(block).not.toContain("35000");
      expect(block).not.toMatch(/\b3 months\b/);
    }
    expect(emcad).toContain("EMCAD_DAHAO");
    expect(emcad).toContain("fees.feeTotal");
    expect(emcad).toContain("fees.feeAdmission");
    expect(emcad).toContain("fees.feeBalanceDueDays");
    expect(emcad).toContain("operations.scheduleOptions");
  });

  it("states the fee split the studio actually confirmed", () => {
    expect(EMCAD_DAHAO.fees.feeTotal).toBe(35_000);
    expect(EMCAD_DAHAO.fees.feeAdmission).toBe(25_000);
    expect(EMCAD_DAHAO.fees.feeTotal - EMCAD_DAHAO.fees.feeAdmission).toBe(10_000);
    expect(EMCAD_DAHAO.fees.feeBalanceDueDays).toBe(30);
  });

  it("shows the four batch timings and the free two-day demo", () => {
    expect(EMCAD_DAHAO.operations.scheduleOptions).toHaveLength(4);
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.hours).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.free).toBe(true);
  });

  it("offers no way to pay online, and says so", () => {
    const lowered = code(emcad).toLowerCase();
    for (const provider of ["razorpay", "stripe", "payu", "cashfree", "upi://", "pay now"]) {
      expect(lowered, provider).not.toContain(provider);
    }
    expect(en.home.emcad.offline.toLowerCase()).toContain("no online payment");
    expect(en.home.emcad.offline.toLowerCase()).toContain("no gateway");
  });

  it("names the one course these facts belong to, in both languages", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.emcad.h2).toContain("EMCAD DAHAO");
      expect(cat.home.emcad.sub.length).toBeGreaterThan(60);
    }
    expect(en.home.emcad.sub.toLowerCase()).toContain("other ten");
    expect(emcad).toContain("EMCAD_DAHAO_SLUG");
  });
});

/* ------------------------------------------------------------------ *
 * The signature interaction
 * ------------------------------------------------------------------ */

describe("screen → machine → proof", () => {
  it("never autoplays and never loops", () => {
    const source = code(smp);
    expect(source).not.toContain("setInterval");
    expect(source).not.toContain("setTimeout");
    expect(source).not.toContain("useEffect");
  });

  it("requires no drag: every state is reachable by tapping a 44px control", () => {
    const source = code(smp);
    for (const gesture of ["onPointerMove", "onTouchMove", "onDrag", "draggable"]) {
      expect(source, gesture).not.toContain(gesture);
    }
  });

  it("is a real tablist with keyboard support", () => {
    expect(smp).toContain('role="tablist"');
    expect(smp).toContain('role="tab"');
    expect(smp).toContain('role="tabpanel"');
    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      expect(smp, key).toContain(`"${key}"`);
    }
  });

  it("drives its process frames from the manifest", () => {
    for (const id of ["P1_DESIGN", "P2_MACHINE", "P3_RESULT"]) {
      expect(smp, id).toContain(id);
      expect(PHOTO_MANIFEST.some((s) => s.id === id), id).toBe(true);
    }
  });

  it("says the faults are drawn diagrams, not a student's record", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.smp.foot.length).toBeGreaterThan(40);
    }
    const foot = en.home.smp.foot.toLowerCase();
    expect(foot).toContain("drawn");
    expect(foot).toContain("not a record");
  });
});

/* ------------------------------------------------------------------ *
 * The proof wall
 * ------------------------------------------------------------------ */

describe("the proof wall", () => {
  it("uses the six work slots from the manifest", () => {
    expect(photosInGroup("work")).toHaveLength(6);
    expect(wall).toContain('photosInGroup("work")');
  });

  it("lets each piece keep its own shape", () => {
    /* A uniform tile grid throws away the one thing worth showing about
       textile work. Frames take their ratio from the manifest. */
    expect(wall).not.toContain("aspect-");
  });

  it("attaches no student name, outcome or earning to a frame", () => {
    for (const banned of ["student", "earning", "salary", "placed", "job"]) {
      expect(en.home.wall.sub.toLowerCase(), banned).not.toContain(banned);
      expect(en.home.wall.h2.toLowerCase(), banned).not.toContain(banned);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Facts the whole page has to keep
 * ------------------------------------------------------------------ */

const homeSources = readdirSync(HOME_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => code(read(join(HOME_DIR, f))));

/**
 * The namespaces the ten blocks actually render.
 *
 * `messages.home` still carries copy written for the twenty-section page this
 * replaces — sixteen namespaces that no component reads any more. They are
 * translated assets rather than dead weight and several will be drawn on when
 * the pages that own those subjects are rebuilt, so they are kept and are
 * resolved in the Phase 8 copy pass. Scanning them here would test text the
 * homepage does not publish, so the copy rules below read what it renders.
 */
const RENDERED = [
  "hero",
  "paths",
  "book",
  "smp",
  "emcad",
  "wall",
  "voices",
  "trust",
  "when",
  "close"
] as const;

const homeCopy = (cat: any) =>
  RENDERED.map((ns) => JSON.stringify(cat.home[ns])).join(" ");

describe("homepage facts", () => {
  it("reserves all thirty-two photographs and invents none", () => {
    expect(PHOTO_MANIFEST).toHaveLength(32);
  });

  it("invents no machine specification", () => {
    const text = [...homeSources, homeCopy(en), homeCopy(gu)].join(" ").toLowerCase();
    for (const spec of ["rpm", "stitches per minute", "spm", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
    /* A head or needle count is a specification nobody has verified. Machines
       are named by the technique they run and by nothing else. */
    expect(text).not.toMatch(/\d+\s*-?\s*(head|needle)s?\b/);
    /* A counted quantity of machines is the same claim in another shape.
       A stage index — "02 machine" — is not, which is why this asks for a
       hyphenated compound or a plural rather than any digit nearby. */
    expect(text).not.toMatch(/\d+\s*-\s*machines?\b|\d+\s+machines\b/);
  });

  it("still teaches no other digitising package", () => {
    const everything = [...homeSources, homeCopy(en), homeCopy(gu)].join(" ").toLowerCase();
    expect(everything).not.toContain("wilcom");
  });

  it("promises no earning, salary or placement", () => {
    const copy = (homeCopy(en) + homeCopy(gu)).toLowerCase();
    for (const banned of ["salary", "placement", "guaranteed job", "earn ₹"]) {
      expect(copy, banned).not.toContain(banned);
    }
  });

  it("closes on the line the studio chose", () => {
    expect(en.home.close.h2.toLowerCase()).toContain("should not stop at the screen");
    expect(en.home.close.sub.toLowerCase()).toContain("machine");
  });
});

describe("the homepage adds no dependency", () => {
  it("uses no animation or carousel library", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const banned of ["swiper", "embla-carousel-react", "keen-slider", "framer-motion", "gsap"]) {
      expect(Object.keys(pkg.dependencies), banned).not.toContain(banned);
    }
  });
});
