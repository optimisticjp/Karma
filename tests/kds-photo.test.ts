import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  PHOTO_MANIFEST,
  PHOTOGRAPHED_COURSE_SLUGS,
  PHOTO_PENDING,
  aspectOf,
  coursePhotoFor
} from "../src/content/photo-manifest";
import { courses } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
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

const sourceFiles = walk("src").filter((f) => !f.includes("photo-manifest"));
const blob = sourceFiles.map((f) => strip(read(f))).join("\n");
const frame = read("src/components/kds/Frame.tsx");
/* The comment in `Frame.tsx` NAMES the `role="img"` it removed, so a ban that
   reads the raw file fails on the explanation rather than on the code. Strip
   comments first — this repository has tripped over it four times. */
const frameCode = strip(frame);

/**
 * THE 32 PHOTOGRAPHS.
 *
 * None of them exists. The whole public site is built around the shape each
 * one will occupy, so that the day the files arrive is a content change and
 * not a layout change. These tests hold that promise from three directions:
 * the manifest is complete, every slot is placed in a real composition, and
 * nothing anywhere fills one with something it is not.
 */

/* ------------------------------------------------------------------ *
 * The manifest is the shoot list, exactly
 * ------------------------------------------------------------------ */

describe("the manifest matches the owner's brief", () => {
  it("holds thirty-two slots and no more", () => {
    expect(PHOTO_MANIFEST).toHaveLength(32);
    expect(new Set(PHOTO_MANIFEST.map((s) => s.id)).size).toBe(32);
  });

  it("keeps the brief's own grouping", () => {
    /* The counts come from the owner's shoot list (2026-08-30). A slot added
       or dropped here is a change to what the photographer was asked for, and
       is the owner's call rather than a developer's. */
    const counts: Record<string, number> = {};
    for (const slot of PHOTO_MANIFEST) counts[slot.group] = (counts[slot.group] ?? 0) + 1;
    expect(counts).toEqual({
      hero: 3,
      course: 8,
      work: 6,
      trainer: 3,
      studio: 6,
      story: 2,
      process: 3,
      floor: 1
    });
  });

  it("gives every slot the intrinsic size the frame reserves from", () => {
    /* This is what makes the swap layout-shift-free: the box is already the
       photograph's shape, so dropping the file in moves nothing. A slot with
       no dimensions would reserve nothing and the page would jump. */
    for (const slot of PHOTO_MANIFEST) {
      expect(slot.width, slot.id).toBeGreaterThan(0);
      expect(slot.height, slot.id).toBeGreaterThan(0);
      expect(aspectOf(slot), slot.id).toBe(`${slot.width} / ${slot.height}`);
    }
    expect(frameCode).toContain("aspectRatio: aspectOf(slot)");
  });

  it("tells the photographer what the shot is and the writer what the alt must say", () => {
    for (const slot of PHOTO_MANIFEST) {
      expect(slot.label.length, slot.id).toBeGreaterThan(12);
      expect(slot.altGuidance.length, slot.id).toBeGreaterThan(12);
      /* Guidance is an instruction, not a description of a photograph nobody
         has seen. It must never be pasted into an `alt`. */
      expect(slot.altGuidance, slot.id).not.toBe(slot.label);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Every slot is somewhere, and somewhere is the right place
 * ------------------------------------------------------------------ */

describe("every reserved slot is placed in a real composition", () => {
  const groupsRendered = new Set(
    [...blob.matchAll(/photosInGroup\("(\w+)"\)/g)].map((m) => m[1])
  );

  it("leaves no slot unplaced", () => {
    /* A slot nobody renders is a shot the owner is being asked to take for a
       page that will not show it. */
    const unplaced = PHOTO_MANIFEST.filter((slot) => {
      if (blob.includes(`"${slot.id}"`)) return false;
      if (groupsRendered.has(slot.group)) return false;
      if (slot.courseSlug && blob.includes("coursePhotoFor")) return false;
      return true;
    });
    expect(unplaced.map((s) => s.id)).toEqual([]);
  });

  it("resolves a course's photograph by slug, never by position", () => {
    /* Eight of the eleven courses have a station in the shoot. Mapping by
       array position would hand the zardosi photograph to the sequence course
       the first time somebody reorders the catalogue. */
    for (const slug of PHOTOGRAPHED_COURSE_SLUGS) {
      expect(coursePhotoFor(slug)?.courseSlug, slug).toBe(slug);
    }
    expect(coursePhotoFor("no-such-course")).toBeUndefined();
    expect(blob).not.toMatch(/coursePhotoFor\(\s*(?:courses|shown)\[/);
  });

  it("gives the three courses with no station their own mark instead", () => {
    /* Flat, appliqué/3D and cross stitch are not in the shoot. They are NOT
       given another course's photograph, and they are not left with an empty
       box either — the technique's own stitch swatch stands in, which is a
       drawing of that stitch rather than a picture of somebody else's. */
    const withoutPhoto = courses
      .filter((c) => !PHOTOGRAPHED_COURSE_SLUGS.includes(c.slug))
      .map((c) => c.slug);
    expect(withoutPhoto).toHaveLength(3);
    for (const file of [
      "src/components/kds/courses/CourseCatalogue.tsx",
      "src/components/kds/courses/RelatedCourses.tsx"
    ]) {
      const src = strip(read(file));
      expect(src, file).toContain("coursePhotoFor");
      expect(src, file).toContain("<StitchSwatch slug={course.slug} />");
    }
    /* And every course carries its swatch on its own page, photographed or
       not, so the eleven read as one catalogue. */
    expect(strip(read("src/components/kds/courses/CourseHero.tsx"))).toContain(
      "<StitchSwatch slug={course.slug} />"
    );
  });
});

/* ------------------------------------------------------------------ *
 * Nothing fills a frame with something it is not
 * ------------------------------------------------------------------ */

describe("no fake fill, anywhere", () => {
  it("loads no photograph from anywhere but this repository", () => {
    /* Stock, a generated image, another institute's work or another course's
       photograph are all the same failure: a false claim about this business
       that would outlive the fix. */
    for (const banned of [
      "unsplash",
      "pexels",
      "shutterstock",
      "istockphoto",
      "placeholder.com",
      "picsum",
      "via.placeholder"
    ]) {
      expect(blob.toLowerCase(), banned).not.toContain(banned);
    }
    expect(blob).not.toMatch(/<img[^>]+src=["']https?:/);
  });

  it("keeps the placeholder honest to a screen reader", () => {
    /* It used to be `role="img"` labelled with the shoot brief — telling
       somebody who cannot see the page that there IS a photograph of an EMCAD
       DAHAO screen. There is not. */
    expect(frameCode).not.toContain('role="img"');
    expect(frameCode).not.toContain("aria-label={slot.label}");
    expect(frameCode).toContain("PHOTO_PENDING");
    expect(frameCode).toContain('<span className="sr-only">');
    expect(PHOTO_PENDING).toMatch(/[઀-૿]/); // says it in Gujarati too
    expect(PHOTO_PENDING.toLowerCase()).toContain("pending");
  });

  it("never presents the shoot guidance as if it described a photograph", () => {
    expect(blob).not.toMatch(/alt=\{[^}]*altGuidance/);
    expect(blob).not.toMatch(/alt=\{[^}]*slot\.label/);
  });

  it("states the rule where the next session will read it", () => {
    for (const file of ["src/content/photo-manifest.ts", "src/components/kds/Frame.tsx"]) {
      const doc = read(file);
      expect(doc.toLowerCase(), file).toContain("stock");
      expect(doc.toLowerCase(), file).toContain("another institute");
    }
  });
});

/* ------------------------------------------------------------------ *
 * The frame reserves the space, and nobody overrides it
 * ------------------------------------------------------------------ */

describe("the swap will not move the page", () => {
  it("lets no call site impose its own ratio on a reserved frame", () => {
    /* `<PhotoFrame>` takes no ratio prop, on purpose: a frame built 3:2 for a
       photograph that arrives 4:5 is the layout shift this whole manifest
       exists to prevent. */
    const props = frameCode.slice(
      frameCode.indexOf("export function PhotoFrame"),
      frameCode.indexOf("const slot: PhotoSlotSpec")
    );
    expect(props).toContain("scale?:");
    expect(props).not.toContain("ratio");
    /* `<MachineFrame>` DOES take one, and should: it wraps content that brings
       no intrinsic size of its own. The rule is about the reserved slots. */
    expect(frameCode).toContain("ratio?:");
    const callSites = [...blob.matchAll(/<PhotoFrame[^>]*>/g)].map((m) => m[0]);
    expect(callSites.length).toBeGreaterThan(10);
    for (const call of callSites) {
      expect(call, call).not.toContain("ratio=");
      expect(call, call).not.toMatch(/aspect-\[/);
    }
  });

  it("reserves the space with a real ground rather than an empty hole", () => {
    /* The old placeholder was a dashed box with a camera icon, so a page full
       of them read as broken. This one is cloth with a weave and a contact
       sheet mark. */
    const css = read("src/app/thread-machine-proof.css");
    const block = css.slice(css.indexOf(".kds .photo-wait {"), css.indexOf(".kds .on-mist .photo-wait"));
    expect(block).toContain("background-color: var(--s-cloth)");
    expect(block).toContain("repeating-linear-gradient");
    expect(block).not.toContain("dashed");
  });
});
