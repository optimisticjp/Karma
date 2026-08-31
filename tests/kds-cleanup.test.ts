import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/^\s*\/\/.*$/gm, " ");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else if (/\.tsx?$/.test(rel)) out.push(rel);
  }
  return out;
}

/** Everything the public site renders. The Console is deliberately excluded. */
const publicFiles = [
  ...walk("src/app/[locale]"),
  ...walk("src/app/design"),
  ...walk("src/components/kds"),
  ...walk("src/components/forms"),
  ...walk("src/components/site"),
  ...walk("src/components/ui")
];

/* ------------------------------------------------------------------ *
 * One public stylesheet
 * ------------------------------------------------------------------ */

/**
 * The public layout imported FOUR stylesheets: `globals.css`, `premium.css`,
 * `machine-lab.css` and `thread-machine-proof.css`. The middle two are the
 * KARMA CONSOLE's design system — 79 KB the rebuilt public site had stopped
 * using, and the last route by which the old visual language could still reach
 * a public page.
 *
 * Measured on a production server after the cut: a public page downloads
 * **116 KB** of CSS where it used to download **196 KB**.
 */
describe("the public site loads its own system and nothing else", () => {
  const layout = strip(read("src/app/[locale]/layout.tsx"));

  it("imports Tailwind and the public sheet, and neither Console sheet", () => {
    expect(layout).toContain('import "../globals.css"');
    expect(layout).toContain('import "../thread-machine-proof.css"');
    expect(layout).not.toContain('import "../premium.css"');
    expect(layout).not.toContain('import "../machine-lab.css"');
  });

  it("leaves the Console's own imports alone", () => {
    /* The cut must not become a Console change: `/admin` still needs both. */
    const admin = read("src/app/admin/layout.tsx");
    expect(admin).toContain('import "../premium.css"');
    expect(admin).toContain('import "../machine-lab.css"');
    expect(admin).not.toContain("thread-machine-proof");
  });

  it("keeps the design reference on the public sheet only", () => {
    /* Comments stripped: this layout's doc comment explains that it loads
       NEITHER Console sheet, and a raw read counts the explanation as an
       import. Fifth time in this repository. */
    const design = strip(read("src/app/design/layout.tsx"));
    expect(design).toContain('import "../thread-machine-proof.css"');
    expect(design).not.toContain("premium.css");
  });
});

/* ------------------------------------------------------------------ *
 * The superseded components are gone, not merely unused
 * ------------------------------------------------------------------ */

describe("the old public system is deleted", () => {
  const DELETED = [
    "src/components/ui/PageIntro.tsx",
    "src/components/ui/SectionHeading.tsx",
    "src/components/ui/MonoNote.tsx",
    "src/components/ui/StitchMark.tsx",
    "src/components/ui/StitchDivider.tsx",
    "src/components/ui/StitchPath.tsx",
    "src/components/ui/TechniqueSignature.tsx",
    "src/components/ui/Ledger.tsx",
    "src/components/ui/Surface.tsx",
    "src/components/ui/CountUp.tsx",
    /* Phase 9 */
    "src/components/ui/PhotoSlot.tsx",
    "src/components/ui/SampleTag.tsx",
    /* Phase 7 */
    "src/components/site/StoryCase.tsx",
    "src/components/site/TrainerProfile.tsx",
    "src/components/site/ReviewWall.tsx",
    "src/components/site/SocialAuthority.tsx",
    "src/components/ui/PullQuote.tsx"
  ];

  it("removes every superseded file rather than leaving it unimported", () => {
    /* An unused component is not harmless: it keeps its CSS alive, it shows
       up in a search for "how is this done here", and the next session copies
       it. */
    for (const file of DELETED) expect(existsSync(join(process.cwd(), file)), file).toBe(false);
  });

  it("leaves nothing importing them", () => {
    const names = DELETED.map((f) => f.split("/").pop()!.replace(".tsx", ""));
    for (const file of [...publicFiles, ...walk("src/components/admin"), ...walk("src/app/admin")]) {
      const src = strip(read(file));
      for (const name of names) {
        expect(src, `${file} imports ${name}`).not.toContain(`components/ui/${name}"`);
        expect(src, `${file} imports ${name}`).not.toContain(`components/site/${name}"`);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * No old visual vocabulary left in public markup
 * ------------------------------------------------------------------ */

describe("no public surface still speaks the superseded language", () => {
  /**
   * These are the class names of the previous two design generations. Some
   * still exist for the Console; none may appear in public markup, because
   * the public layout no longer loads the sheet that defines them — a page
   * using one would render unstyled rather than merely off-brand.
   */
  const OLD = [
    "page-intro",
    "ledger-row",
    "seam-note",
    "container-site",
    "mono-note",
    "tech-sig",
    "stitch-mark",
    "prose-measure",
    "text-stone",
    "text-vermilion",
    "text-smallmeta",
    "text-lead",
    "font-display",
    "btn-primary",
    "btn-secondary"
  ];

  it("uses none of the superseded class names", () => {
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const src = strip(read(file));
      for (const cls of OLD) {
        /* Matched inside a className only: `card` appears in prose about
           "a card shape" and in `.quote-card`, and a rule that fails on a
           sentence teaches the next session to reword the sentence. */
        const re = new RegExp(`className=[{("\`][^"\`]*\\b${cls}\\b`);
        if (re.test(src)) offenders.push(`${file} — ${cls}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("takes both forms onto the rebuilt system, defences intact", () => {
    /* The two public forms were the last markup on the old vocabulary. What
       changed is presentation ONLY — every defence below is asserted here so
       a restyle can never quietly drop one. */
    for (const file of [
      "src/components/forms/BriefForm.tsx",
      "src/components/forms/AdmissionForm.tsx"
    ]) {
      const src = read(file);
      expect(src, file).toContain("form-shell");
      /* The honeypot: the brief form names the input, the admission form
         reads it through a ref and posts it under the same key. Either way
         the field exists and the server still checks it. */
      expect(src, file).toMatch(/name="website"|ref=\{honeypot\}/);
      expect(src, file).toContain("startedAt"); // minimum-time check
      expect(src, file).toContain("TurnstileWidget");
      expect(src, file).toContain('aria-live'); // the persistent error region
    }
    expect(read("src/components/forms/AdmissionForm.tsx")).toContain("guardianPhone");
    expect(read("src/components/forms/AdmissionForm.tsx")).toContain("termsVersion");
  });
});
