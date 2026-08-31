import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PHOTO_MANIFEST } from "../src/content/photo-manifest";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG } from "../src/content/course-operations";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const json = (p: string) => JSON.parse(read(p)) as Record<string, never>;

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const heroSource = read("src/components/home/Hero.tsx");
const railSource = read("src/components/ui/ProductionRail.tsx");
const homeSource = read("src/app/[locale]/page.tsx");
const css = read("src/app/machine-lab.css");

/* eslint-disable @typescript-eslint/no-explicit-any */
const en = json("messages/en.json") as any;
const gu = json("messages/gu.json") as any;

/* ------------------------------------------------------------------ *
 * The hero answers the four questions, without photography
 * ------------------------------------------------------------------ */

describe("the hero states EMCAD, the machine, Surat and the demo", () => {
  it("names EMCAD DAHAO as the software, in both languages", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.hero.factSoftwareValue).toBe("EMCAD DAHAO");
    }
  });

  it("offers the free two-day demo the studio actually runs", () => {
    /* The demo really is two days — this is not a marketing round number. */
    expect(EMCAD_DAHAO.operations.demo?.days).toBe(2);
    expect(en.home.hero.ctaDemo.toLowerCase()).toContain("2-day");
    expect(en.home.hero.ctaDemo.toLowerCase()).toContain("free");
    expect(gu.home.hero.ctaDemo).toContain("2");
  });

  it("says where the studio is", () => {
    expect(en.home.hero.factWhereValue).toContain("Mota Varachha");
    expect(gu.home.hero.factWhereValue).toContain("મોટા વરાછા");
  });

  it("says the teaching happens on live machines", () => {
    expect(en.home.hero.factPracticalValue.toLowerCase()).toContain("machine");
    expect(gu.home.hero.factPracticalValue).toContain("મશીન");
  });
});

describe("the hero never lets one course's facts become the site's", () => {
  it("labels the three-month duration as the EMCAD DAHAO course's own", () => {
    expect(EMCAD_DAHAO.slug).toBe(EMCAD_DAHAO_SLUG);
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
    for (const cat of [en, gu]) {
      /* The value is the duration; the LABEL has to carry the scope, or a
         visitor reads "3 months" as true of all eleven courses. */
      expect(cat.home.hero.factDurationLabel).toContain("EMCAD DAHAO");
    }
    expect(en.home.hero.factDurationValue).toBe("3 months");
  });

  it("never restates the three months as twelve weeks", () => {
    for (const cat of [en, gu]) {
      const hero = JSON.stringify(cat.home.hero).toLowerCase();
      expect(hero).not.toContain("12 week");
      expect(hero).not.toContain("twelve week");
    }
  });

  it("quotes no fee in the hero — fees are discussed offline", () => {
    for (const cat of [en, gu]) {
      const hero = JSON.stringify(cat.home.hero);
      expect(hero).not.toContain("35,000");
      expect(hero).not.toContain("₹");
    }
  });

  it("keeps follower counts out of the machine-fact row", () => {
    /* Social proof is a different kind of claim and lives in its own band.
       Mixing them makes the verified facts read as marketing. */
    expect(heroSource).not.toContain("ownerProvidedFacts");
    expect(read("src/components/home/TrustRail.tsx")).toContain("ownerProvidedFacts");
  });

  it("attributes the social numbers to the studio rather than to a review body", () => {
    for (const cat of [en, gu]) {
      expect(cat.home.trust.source.length).toBeGreaterThan(40);
    }
    expect(en.home.trust.source.toLowerCase()).toContain("not a verified review");
  });
});

/* ------------------------------------------------------------------ *
 * One thread, one Level-4 moment
 * ------------------------------------------------------------------ */

describe("the hero composition", () => {
  it("uses the three hero photograph slots, in screen → machine → result order", () => {
    const order = ["H1_EMCAD_SCREEN", "H2_MACHINE_STITCHING", "H3_FINISHED_PIECE"];
    const positions = order.map((id) => heroSource.indexOf(id));
    expect(positions.every((p) => p > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    /* And each is a real slot with a reserved ratio. */
    for (const id of order) {
      expect(PHOTO_MANIFEST.some((s) => s.id === id), id).toBe(true);
    }
  });

  it("draws ONE continuous thread, not three connectors that line up", () => {
    const rails = heroSource.match(/<StitchRail/g) ?? [];
    expect(rails).toHaveLength(1);
    expect(heroSource).toContain("hero-thread-rail");
  });

  it("keeps the vertical stitch geometry identical to the horizontal rule", () => {
    /* 9 on the surface, 6 off it, a penetration dot at every stitch head. */
    const rail = css.slice(css.indexOf(".stitch-rail {"));
    expect(rail).toContain("var(--stitch-color) 0 9px, transparent 9px 15px");
    expect(rail).toContain("background-size: 5px 15px, 2px 15px");
  });

  it("is the page's only Level-4 moment", () => {
    expect(homeSource.match(/<Hero \/>/g) ?? []).toHaveLength(1);
    /* Nothing else on the homepage may draw a full-height thread. */
    expect(read("src/components/home/ProductionRailSection.tsx")).not.toContain("StitchRail");
  });

  it("is one markup tree, not a desktop collage plus a mobile copy", () => {
    /* A duplicated tree would show up as breakpoint-gated visibility classes
       wrapping whole compositions. */
    expect(heroSource).not.toMatch(/className="[^"]*\blg:hidden\b/);
    expect(heroSource).not.toMatch(/className="[^"]*\bhidden lg:\b/);
  });
});

/* ------------------------------------------------------------------ *
 * The production rail
 * ------------------------------------------------------------------ */

describe("the Screen-to-Stitch rail", () => {
  it("is generic: the stages are a prop, so a longer B2B chain reuses it", () => {
    expect(railSource).toContain("stages: RailStage[]");
    expect(railSource).not.toContain("P1_DESIGN");
    expect(read("src/components/home/ProductionRailSection.tsx")).toContain("P1_DESIGN");
  });

  it("drives the three process slots from the manifest", () => {
    const section = read("src/components/home/ProductionRailSection.tsx");
    for (const id of ["P1_DESIGN", "P2_MACHINE", "P3_RESULT"]) {
      expect(section, id).toContain(id);
      expect(PHOTO_MANIFEST.some((s) => s.id === id), id).toBe(true);
    }
  });

  it("never autoplays and never loops", () => {
    const code = stripComments(railSource);
    expect(code).not.toContain("setInterval");
    expect(code).not.toContain("setTimeout");
    expect(code).not.toContain("useEffect");
  });

  it("requires no horizontal drag: every stage is reachable by scrolling", () => {
    const code = stripComments(railSource);
    for (const gesture of ["onPointerMove", "onTouchMove", "onDrag", "draggable"]) {
      expect(code, gesture).not.toContain(gesture);
    }
  });

  it("renders a real tablist with keyboard support", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { ProductionRail } = await import("../src/components/ui/ProductionRail");
    const stages = ["design", "machine", "result"].map((key, i) => ({
      key,
      label: key.toUpperCase(),
      caption: `caption ${key}`,
      detail: `detail ${key}`,
      photoId: ["P1_DESIGN", "P2_MACHINE", "P3_RESULT"][i]
    }));
    const html = renderToStaticMarkup(<ProductionRail stages={stages} label="Production stages" />);

    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? [])).toHaveLength(3);
    expect((html.match(/role="tabpanel"/g) ?? [])).toHaveLength(1);
    /* Roving tabindex: exactly one tab is in the tab order. */
    expect((html.match(/tabindex="0"/g) ?? []).length).toBeGreaterThanOrEqual(1);
    expect((html.match(/tabindex="-1"/g) ?? [])).toHaveLength(2);

    /* Every stage's media is present at every width — nothing is hidden
       behind an interaction a thumb has to discover. */
    for (const id of ["P1_DESIGN", "P2_MACHINE", "P3_RESULT"]) {
      expect(html, id).toContain(`data-photo-slot="${id}"`);
    }
    for (const key of ["design", "machine", "result"]) {
      expect(html, key).toContain(`caption ${key}`);
    }
    /* Only the selected stage's detail is in the panel. */
    expect(html).toContain("detail design");
    expect(html).not.toContain("detail machine");

    expect(railSource).toContain("ArrowRight");
    expect(railSource).toContain("Home");
    expect(railSource).toContain("End");
  });
});

/* ------------------------------------------------------------------ *
 * Page rhythm, buttons and the mobile conversion bar
 * ------------------------------------------------------------------ */

describe("page rhythm", () => {
  it("defines the four bands", () => {
    for (const band of [".band-machine", ".band-material", ".band-human", ".band-info"]) {
      expect(css, band).toContain(`${band} {`);
    }
  });

  it("has no second surface implementation: bands never re-point the palette", () => {
    const bandBlock = css.slice(css.indexOf(".band-machine {"), css.indexOf(".band-info {"));
    expect(bandBlock).not.toContain("--color-carbon:");
    expect(bandBlock).not.toContain("--color-ivory:");
    /* A band sets its own background and texture and nothing else. Steel Mist
       is a token it USES; re-pointing one here is what would fork the
       palette. */
    expect(bandBlock).toContain("var(--color-mist)");
  });

  it("gives the hero the light technical band, not a black slab", () => {
    /* This required `on-carbon` on the hero until 2026-08-31 — it was the one
       assertion that positively demanded the public site's loudest surface be
       near-black. The owner rejected that treatment. The rule it was really
       protecting, that the hero is a deliberate SURFACE rather than an
       unstyled page top, survives intact and is asserted directly. */
    expect(stripComments(heroSource)).not.toContain("on-carbon");
    expect(heroSource).toContain("band-machine");
  });

  it("follows the hero with a different surface", () => {
    /* The durable rule was never "dark, then light" — it was that the section
       after the hero changes surface, which is what stops a long scroll
       reading as one continuous slab. Light-on-light keeps that true: the
       hero is Steel Mist, the trust rail is Cotton. */
    const heroAt = homeSource.indexOf("<Hero />");
    const trustAt = homeSource.indexOf("<TrustRail />");
    expect(heroAt).toBeGreaterThan(-1);
    expect(trustAt).toBeGreaterThan(heroAt);
    const trust = read("src/components/home/TrustRail.tsx");
    expect(trust).toContain("band-info");
    expect(trust).not.toContain("band-machine");
  });
});

describe("button microinteractions", () => {
  it("draws exactly three stitches under the primary label — and no glow", () => {
    const block = css.slice(css.indexOf(".btn-stitch::after"), css.indexOf(".btn-stitch:hover"));
    expect(block).toContain("width: 39px");
    expect(block).toContain("currentColor 0 9px, transparent 9px 15px");
    expect(block).not.toContain("box-shadow");
    expect(block).not.toContain("filter: drop-shadow");
  });

  it("shows the finished state under reduced motion", () => {
    /* All of them, not just the last: the stylesheet has more than one
       reduced-motion block and gained another during the hardening pass.
       What matters is that the rule is covered SOMEWHERE, not where. */
    const reduced = css
      .split("@media (prefers-reduced-motion: reduce)")
      .slice(1)
      .join("\n");
    expect(reduced).toContain(".btn-stitch::after");
    expect(reduced).toContain("transition: none !important");
  });
});

/* The permanent Call/Directions bar this suite used to guard is GONE. It was
   pinned to every public page including the privacy policy and the notes
   archive, and the plan's §15 replaces it with the contextual `<ActionDock>`
   on the four high-intent routes. What that dock must do — and the phone-role
   protections that survived the change intact — is asserted in
   `tests/mobile-conversion.test.ts` and `tests/kds-shell.test.ts`. */

describe("the shell adds no dependency", () => {
  it("uses no animation or carousel library", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const banned of ["swiper", "embla-carousel-react", "keen-slider", "framer-motion", "gsap"]) {
      expect(Object.keys(pkg.dependencies), banned).not.toContain(banned);
    }
  });
});
