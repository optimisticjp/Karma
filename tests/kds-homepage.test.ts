import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { courses, coursesByFamily } from "../src/content/courses";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG, KARMA_SOFTWARE } from "../src/content/course-operations";
import { PHOTO_MANIFEST, photosInGroup } from "../src/content/photo-manifest";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
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

describe("homepage architecture", () => {
  it("renders the ten blocks in the order the questions arrive", () => {
    const at = BLOCKS.map((tag) => page.indexOf(`<${tag}`));
    expect(at.every((p) => p > -1)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("puts the money question inside the first half of the page", () => {
    const at = (tag: string) => page.indexOf(`<${tag}`);
    for (const later of ["ProofWall", "HomeVoices", "TrustSignals", "BatchesVisit"]) {
      expect(at("EmcadPanel"), `EmcadPanel before ${later}`).toBeLessThan(at(later));
    }
  });

  it("never puts two blocks with the same ground next to each other", () => {
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
    expect(new Set(grounds.map((g) => g.ground)).size).toBe(4);
  });

  it("gives every block a different shape, not ten copies of one card", () => {
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

describe("the hero", () => {
  it("names the one software Karma teaches from the Console-backed EMCAD config", () => {
    expect(KARMA_SOFTWARE).toBe("EMCAD DAHAO");
    expect(page).toContain("getCourseConfig(EMCAD_DAHAO_SLUG)");
    expect(page).toContain("<HomeHero courses={courses} emcad={emcad}");
    expect(hero).toContain("emcad?.software");
    expect(hero).not.toContain("KARMA_SOFTWARE");
  });

  it("renders the demo from the Console-backed record rather than a round number", () => {
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(EMCAD_DAHAO.operations.demo?.free).toBe(true);
    expect(hero).toContain("emcad?.operations.demo");
    expect(hero).toContain("demo.days");
    expect(hero).not.toContain("EMCAD_DAHAO.operations.demo");
    expect(en.home.hero.factDemoLabel).toContain("EMCAD DAHAO");
    expect(gu.home.hero.factDemoLabel).toContain("EMCAD DAHAO");
  });

  it("says where the studio is, and that teaching happens on machines", () => {
    expect(en.home.hero.factWhereValue).toContain("Mota Varachha");
    expect(gu.home.hero.factWhereValue).toContain("મોટા વરાછા");
    expect(en.home.hero.factPracticalValue.toLowerCase()).toContain("machine");
    expect(gu.home.hero.factPracticalValue).toContain("મશીન");
  });

  it("quotes no fee in the hero", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.hero);
      expect(block).not.toContain("35,000");
      expect(block).not.toContain("₹");
    }
  });

  it("never lets one course's duration become the site's", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.hero);
      if (/3\s*(months|મહિના)/.test(block)) expect(block).toContain("EMCAD DAHAO");
      expect(block.toLowerCase()).not.toContain("12 week");
      expect(block.toLowerCase()).not.toContain("twelve week");
    }
  });

  it("keeps follower counts out of the fact row", () => {
    expect(hero).not.toContain("@/content/proof");
    expect(read(`${HOME_DIR}/TrustSignals.tsx`)).toContain("@/content/proof");
  });

  it("uses the three reserved hero slots, each a real manifest frame", () => {
    for (const id of ["H1_EMCAD_SCREEN", "H2_MACHINE_STITCHING", "H3_FINISHED_PIECE"]) {
      expect(hero, id).toContain(id);
      expect(PHOTO_MANIFEST.some((s) => s.id === id), id).toBe(true);
    }
    expect((hero.match(/hero-scene-thread/g) ?? [])).toHaveLength(1);
  });

  it("is one markup tree, not a desktop collage plus a mobile copy", () => {
    expect(hero).not.toMatch(/className="[^"]*\blg:hidden\b/);
    expect(hero).not.toMatch(/className="[^"]*\bhidden lg:\b/);
  });
});

describe("the sample book", () => {
  it("receives the full Console-filtered catalogue rather than curating locally", () => {
    expect(coursesByFamily).toHaveLength(11);
    expect(coursesByFamily).toHaveLength(courses.length);
    expect(page).toContain("getPublicCourses()");
    expect(page).toContain("<SampleBook courses={courses}");
    expect(book).toContain("{ courses }: { courses: Course[] }");
    expect(book).not.toContain(".slice(");
  });

  it("shows the duration carried by each Console-backed public course", () => {
    expect(book).toContain("course.durationMonths");
    expect(book).not.toContain("verifiedOperationsFor");
    const confirmed = courses.filter((c) => c.slug === EMCAD_DAHAO_SLUG);
    expect(confirmed).toHaveLength(1);
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
  });

  it("puts no fee on a catalogue row", () => {
    expect(book).not.toContain("feeTotal");
    expect(book).not.toContain("₹");
  });
});

describe("the EMCAD DAHAO decision panel", () => {
  it("reads every figure from the same Console configuration as admission/course detail", () => {
    for (const cat of [en, gu]) {
      const block = JSON.stringify(cat.home.emcad);
      expect(block).not.toContain("35,000");
      expect(block).not.toContain("25,000");
      expect(block).not.toContain("10,000");
      expect(block).not.toContain("35000");
      expect(block).not.toMatch(/\b3 months\b/);
    }
    expect(emcad).toContain("getCourseConfig(EMCAD_DAHAO_SLUG)");
    expect(emcad).toContain("money(fees.total)");
    expect(emcad).toContain("money(fees.admission)");
    expect(emcad).toContain("fees.balanceDueDays");
    expect(emcad).toContain("operations.scheduleOptions.map");
  });

  it("keeps the verified seed as the reference bar for the confirmed facts", () => {
    expect(EMCAD_DAHAO.fees.feeTotal).toBe(35_000);
    expect(EMCAD_DAHAO.fees.feeAdmission).toBe(25_000);
    expect(EMCAD_DAHAO.fees.feeTotal - EMCAD_DAHAO.fees.feeAdmission).toBe(10_000);
    expect(EMCAD_DAHAO.fees.feeBalanceDueDays).toBe(30);
  });

  it("keeps four verified timetable slots and the free two-day demo seed", () => {
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
    for (const cat of [en, gu]) expect(cat.home.smp.foot.length).toBeGreaterThan(40);
    const foot = en.home.smp.foot.toLowerCase();
    expect(foot).toContain("drawn");
    expect(foot).toContain("not a record");
  });
});

describe("the proof wall", () => {
  it("uses the six work slots from the manifest", () => {
    expect(photosInGroup("work")).toHaveLength(6);
    expect(wall).toContain('photosInGroup("work")');
  });

  it("lets each piece keep its own shape", () => {
    expect(wall).not.toContain("aspect-");
  });

  it("attaches no student name, outcome or earning to a frame", () => {
    for (const banned of ["student", "earning", "salary", "placed", "job"]) {
      expect(en.home.wall.sub.toLowerCase(), banned).not.toContain(banned);
      expect(en.home.wall.h2.toLowerCase(), banned).not.toContain(banned);
    }
  });
});

const homeSources = readdirSync(HOME_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => code(read(join(HOME_DIR, f))));

const RENDERED = ["hero", "paths", "book", "smp", "emcad", "wall", "voices", "trust", "when", "close"] as const;
const homeCopy = (cat: any) => RENDERED.map((ns) => JSON.stringify(cat.home[ns])).join(" ");

describe("homepage facts", () => {
  it("reserves all thirty-two photographs and invents none", () => {
    expect(PHOTO_MANIFEST).toHaveLength(32);
  });

  it("invents no machine specification", () => {
    const text = [...homeSources, homeCopy(en), homeCopy(gu)].join(" ").toLowerCase();
    for (const spec of ["rpm", "stitches per minute", "spm", "mm/s"]) {
      expect(text, spec).not.toContain(spec);
    }
    expect(text).not.toMatch(/\d+\s*-?\s*(head|needle)s?\b/);
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