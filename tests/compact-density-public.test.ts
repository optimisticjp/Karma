import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { clampAt, declaration, PHONE, ruleBody, stripComments, token } from "./helpers/measure";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else if (rel.endsWith(".tsx")) out.push(rel);
  }
  return out;
}

const premium = read("src/app/premium.css");
const machineLab = read("src/app/machine-lab.css");

/* ------------------------------------------------------------------ *
 * PageIntro was the public site's cost centre
 *
 * 56px above the eyebrow, 48px below the lede, and an aside that stacks
 * BETWEEN the page title and the page's own content at every width
 * under 900px. The two interior pages that already passed the
 * first-viewport test — /verify/[id] and the error boundary — are
 * precisely the two that decline this component.
 * ------------------------------------------------------------------ */

describe("the shared interior-page intro", () => {
  it("opens a phone on the compact scale", () => {
    expect(clampAt(token(premium, "--space-page-top") as string, PHONE)).toBeLessThanOrEqual(24);
    expect(clampAt(token(premium, "--space-page-bottom") as string, PHONE)).toBeLessThanOrEqual(20);
  });

  it("still opens up on a laptop", () => {
    /* The compaction is a phone compaction. An interior page at 1440px should
       read exactly as it did — this is the assertion that stops a later pass
       "simplifying" the clamps into flat values. */
    expect(clampAt(token(premium, "--space-page-top") as string, 1440)).toBeGreaterThanOrEqual(64);
    expect(clampAt(token(premium, "--space-page-bottom") as string, 1440)).toBeGreaterThanOrEqual(48);
  });

  it("keeps the aside a note on a phone and a rail on a laptop", () => {
    const aside = ruleBody(premium, ".page-intro-aside");
    expect(aside, ".page-intro-aside must exist").not.toBeNull();
    expect(clampAt(declaration(aside as string, "font-size") as string)).toBeLessThanOrEqual(14);
    expect(clampAt(declaration(aside as string, "padding-top") as string)).toBeLessThanOrEqual(12);
  });
});

/* ------------------------------------------------------------------ *
 * The one course with confirmed facts
 * ------------------------------------------------------------------ */

describe("a course page leads with what the institute has confirmed", () => {
  const page = stripComments(read("src/app/[locale]/courses/[slug]/page.tsx"));

  it("puts the verified operations ahead of the essay", () => {
    /* On EMCAD DAHAO — the only course with a confirmed duration and a
       published fee — those figures sat behind the intro, the drawn signature
       and a two-column essay: about 3,900px, roughly 4.6 phone screens, to
       reach the number a visitor came for. */
    const facts = page.indexOf("<CourseOperations");
    const essay = page.indexOf('t("whoTitle")');
    expect(facts).toBeGreaterThan(-1);
    expect(essay).toBeGreaterThan(-1);
    expect(facts, "CourseOperations must come before the who-is-it-for essay").toBeLessThan(essay);
  });

  it("lists related courses as index rows, not as a card grid", () => {
    /* Three <CourseCard>s in a mobile single column were 1,476px at the very
       bottom of the page. The Machine Index is the same component /courses
       uses, so a related row and a catalogue row cannot drift in what they may
       claim — which is why the card component was deleted rather than kept
       around for one caller. */
    expect(page).toContain("<MachineIndex");
    expect(page).not.toContain("CourseCard");
    expect(existsSync(join(process.cwd(), "src/components/course/CourseCard.tsx"))).toBe(false);
  });

  it("keeps the stitched rule a signature rather than a separator", () => {
    /* Nine of them on one page — under every heading — is decoration, and
       decoration is what the rule stops meaning when it repeats. */
    const marks = (page.match(/<StitchRule/g) ?? []).length
      + (stripComments(read("src/components/course/CourseOperations.tsx")).match(/<StitchRule/g) ?? []).length;
    expect(marks).toBeLessThanOrEqual(2);
  });

  it("does not open a syllabus panel for the reader", () => {
    const accordion = stripComments(read("src/components/course/ModuleAccordion.tsx"));
    expect(accordion).toContain("<details");
    expect(accordion).not.toContain("open={i === 0}");
  });
});

/* ------------------------------------------------------------------ *
 * The archive and the proof pages
 * ------------------------------------------------------------------ */

describe("secondary public surfaces", () => {
  it("makes the notes index an archive, not eight articles", () => {
    /* Every row printed its complete answer — 196 to 355 characters — so eight
       notes filled about 1,150px and the archive stopped being scannable,
       which is the one thing an archive is for. The whole answer is still on
       the note itself. */
    const answer = ruleBody(machineLab, ".note-archive-answer");
    expect(answer, ".note-archive-answer must exist").not.toBeNull();
    expect(answer as string).toContain("-webkit-line-clamp: 2");
  });

  it("puts a story before the frames reserved for its photographs", () => {
    /* A page called Success stories opened with 470 characters of caveat and
       two empty frames, and the first actual story began about 1,350px down.
       The frames stay — labelled, honest, and never filled with stock — they
       just stop standing in front of the content they illustrate. */
    const page = stripComments(read("src/app/[locale]/success-stories/page.tsx"));
    expect(page.indexOf("<StoryCase")).toBeLessThan(page.indexOf("portraitsLabel"));
    /* And the reserved frames are still there, still named, still honest. */
    expect(page).toContain("<ManifestPhoto");
    expect(page).toContain("portraitsNote");
  });

  it("reserves the shape a page actually lands as", () => {
    /* The skeleton held 616px of three-card grid at every width, for routes
       (/notes, /terms, /services, /privacy) that all land as hairline row
       lists — so it guaranteed the layout jump it exists to prevent. */
    const loading = stripComments(read("src/app/[locale]/loading.tsx"));
    expect(loading).toContain("md:grid-cols-3");
    expect(loading).toContain("h-12 md:h-40");
    expect(loading).not.toContain("h-48");
  });

  it("sets six body terms as body, not as six headlines", () => {
    const terms = stripComments(read("src/app/[locale]/terms/page.tsx"));
    expect(terms).toContain("ledger is-prose");
    const prose = ruleBody(premium, ".ledger.is-prose .ledger-title");
    expect(prose, ".ledger.is-prose must exist").not.toBeNull();
    expect(declaration(prose as string, "font-weight")).toBe("400");
  });
});

/* ------------------------------------------------------------------ *
 * The compact spacing scale, swept across the public tree
 * ------------------------------------------------------------------ */

describe("public vertical spacing stays on the compact scale", () => {
  /* Scale: 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32px — Tailwind steps up to 8. */
  const publicFiles = [
    ...walk("src/app/[locale]"),
    ...walk("src/components").filter((f) => !f.startsWith("src/components/admin/"))
  ];

  it("finds enough files to be measuring something", () => {
    expect(publicFiles.length).toBeGreaterThan(40);
  });

  it("uses no unprefixed vertical step above 8", () => {
    /* Breakpoint-prefixed variants are exempt: §21 explicitly allows more room
       on a larger screen. What it forbids is spending a phone's viewport on
       whitespace.

       Scanned inside className string literals only, after stripping comments —
       a doc-block that says "this used to be mt-16" is not a violation, and
       that false positive is this repository's documented failure mode. */
    const step = /(?<![\w:-])(mt|mb|pt|pb|py|gap-y|space-y)-(\d+(?:\.\d+)?)\b/g;
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const source = stripComments(read(file));
      for (const attr of source.matchAll(/className="([^"]*)"/g)) {
        for (const util of attr[1].matchAll(step)) {
          if (Number(util[2]) > 8) offenders.push(`${file}  ${util[0]}`);
        }
      }
    }
    expect(offenders, "these exceed the compact scale on a phone").toEqual([]);
  });
});
