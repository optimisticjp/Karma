import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PHOTO_MANIFEST,
  PHOTO_COUNT,
  PHOTOGRAPHED_COURSE_SLUGS,
  aspectOf,
  coursePhotoFor,
  photoSlot,
  photosInGroup
} from "../src/content/photo-manifest";
import { ICON_GROUPS, ICON_NAMES } from "../src/components/ui/Icon";
import { STITCH_SWATCHES } from "../src/components/kds/StitchSwatch";
import { courses } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const machineLabCss = read("src/app/machine-lab.css");
const globalsCss = read("src/app/globals.css");
const signatureSource = read("src/components/kds/StitchSwatch.tsx");
const iconSource = read("src/components/ui/Icon.tsx");

describe("photo manifest", () => {
  it("declares exactly the 32 photographs the owner's brief specifies", () => {
    expect(PHOTO_MANIFEST).toHaveLength(PHOTO_COUNT);
    expect(PHOTO_COUNT).toBe(32);
  });

  it("keeps every slot id unique — a slot must mean one shot", () => {
    expect(new Set(PHOTO_MANIFEST.map((s) => s.id)).size).toBe(PHOTO_MANIFEST.length);
  });

  it("gives every slot real dimensions, so a frame can reserve its own space", () => {
    for (const slot of PHOTO_MANIFEST) {
      expect(slot.width, slot.id).toBeGreaterThan(0);
      expect(slot.height, slot.id).toBeGreaterThan(0);
      expect(aspectOf(slot)).toBe(`${slot.width} / ${slot.height}`);
    }
  });

  it("briefs the photographer and the alt text on every slot", () => {
    for (const slot of PHOTO_MANIFEST) {
      expect(slot.label.length, slot.id).toBeGreaterThan(8);
      expect(slot.altGuidance.length, slot.id).toBeGreaterThan(15);
    }
  });

  it("matches the brief's group counts", () => {
    expect(photosInGroup("hero")).toHaveLength(3);
    expect(photosInGroup("course")).toHaveLength(8);
    expect(photosInGroup("work")).toHaveLength(6);
    expect(photosInGroup("trainer")).toHaveLength(3);
    expect(photosInGroup("studio")).toHaveLength(6);
    expect(photosInGroup("story")).toHaveLength(2);
    expect(photosInGroup("process")).toHaveLength(3);
    expect(photosInGroup("floor")).toHaveLength(1);
  });

  it("points each of the eight course stations at a course that exists", () => {
    const slugs = new Set(courses.map((c) => c.slug));
    expect(PHOTOGRAPHED_COURSE_SLUGS).toHaveLength(8);
    for (const slug of PHOTOGRAPHED_COURSE_SLUGS) {
      expect(slugs.has(slug), slug).toBe(true);
      expect(coursePhotoFor(slug)).toBeDefined();
    }
  });

  it("never assigns one photograph to two courses", () => {
    const assigned = PHOTO_MANIFEST.filter((s) => s.courseSlug).map((s) => s.courseSlug);
    expect(new Set(assigned).size).toBe(assigned.length);
  });

  it("throws on an unknown slot rather than rendering an unnamed frame", () => {
    expect(() => photoSlot("NOT_A_SLOT")).toThrow();
  });
});

describe("photography honesty", () => {
  it("ships no remote image source anywhere in the manifest or the frames", () => {
    const sources = [read("src/content/photo-manifest.ts"), read("src/components/kds/Frame.tsx")].join("\n");
    for (const host of [
      "unsplash",
      "pexels",
      "shutterstock",
      "istockphoto",
      "gettyimages",
      "freepik",
      "pixabay",
      "placeholder.com",
      "placekitten",
      "picsum.photos"
    ]) {
      expect(sources.toLowerCase()).not.toContain(host);
    }
  });

  it("states the no-stock rule where the next session will actually read it", () => {
    const manifest = read("src/content/photo-manifest.ts").toLowerCase();
    expect(manifest).toContain("stock");
    expect(manifest).toContain("generated");
  });
});

describe("icon family", () => {
  it("covers all four branded groups from the spec", () => {
    for (const [group, names] of Object.entries(ICON_GROUPS)) {
      for (const name of names) expect(ICON_NAMES, `${group}/${name}`).toContain(name);
    }
  });

  it("ships 15-30 branded icons — a family, not a one-off and not a library", () => {
    const branded = new Set([
      ...ICON_GROUPS.production,
      ...ICON_GROUPS.technique,
      ...ICON_GROUPS.digitising,
      ...ICON_GROUPS.troubleshooting
    ]);
    expect(branded.size).toBeGreaterThanOrEqual(15);
    expect(branded.size).toBeLessThanOrEqual(30);
  });

  it("keeps universal actions universal — nobody decodes a symbol to find Edit", () => {
    for (const name of ["pencil", "trash", "printer", "search", "arrow", "phone", "map"]) {
      expect(ICON_GROUPS.universal as readonly string[]).toContain(name);
    }
    const branded = new Set<string>([
      ...ICON_GROUPS.production,
      ...ICON_GROUPS.technique,
      ...ICON_GROUPS.digitising,
      ...ICON_GROUPS.troubleshooting
    ]);
    for (const name of ICON_GROUPS.universal) expect(branded.has(name), name).toBe(false);
  });

  it("names no machine manufacturer or model — an icon is not a claim", () => {
    const lowered = iconSource.toLowerCase();
    for (const brand of ["ricoma", "tajima", "barudan", "melco", "brother", "happy japan"]) {
      expect(lowered).not.toContain(brand);
    }
  });
});

describe("technique signatures", () => {
  it("gives every course in the catalogue a signature, and invents none", () => {
    const slugs = courses.map((c) => c.slug).sort();
    expect(Object.keys(STITCH_SWATCHES).sort()).toEqual(slugs);
    expect(courses).toHaveLength(11);
  });

  it("describes what each signature draws", () => {
    for (const [slug, sig] of Object.entries(STITCH_SWATCHES)) {
      expect(sig.describes.length, slug).toBeGreaterThan(15);
      expect(sig.render(), slug).toBeTruthy();
    }
  });

  it("carries no invented specification — no numbers presented as facts", () => {
    const rendered = stripComments(signatureSource).toLowerCase();
    for (const unit of ["rpm", "spm", "gsm", "stitches/", "stitches per", "mm/s"]) {
      expect(rendered).not.toContain(unit);
    }
  });

  it("builds once and never loops", () => {
    expect(machineLabCss).not.toMatch(/animation[^;]*infinite/);
    expect(machineLabCss).not.toMatch(/animation-iteration-count:\s*infinite/);
  });

  it("hides nothing without JavaScript: every start state is .js-gated", () => {
    const hidden = machineLabCss
      .split("\n")
      .filter((l) => l.includes(".sig-play") && l.includes("{"))
      .filter((l) => !l.includes(".is-in"));
    expect(hidden.length).toBeGreaterThanOrEqual(3);
    for (const line of hidden) expect(line.trim().startsWith(".js "), line).toBe(true);
  });
});

describe("stitch semantics", () => {
  it("keeps exactly the shared marks used by the rebuilt system", () => {
    const marks = read("src/components/kds/marks.tsx");
    const exported = [...marks.matchAll(/^export function (\w+)/gm)].map((m) => m[1]);
    expect(exported).toEqual(["ThreadLine", "NeedlePoint", "HoopWindow", "ThreadProgress"]);
  });

  it("keeps the running stitch geometry identical to the brand spec (9 on, 6 off)", () => {
    const tmp = read("src/app/thread-machine-proof.css");
    expect(tmp).toContain("var(--brand-accent) 0 9px, transparent 9px 15px");
    expect(tmp).toContain("background-size: 15px 2px");
  });
});

describe("design system v4 foundation", () => {
  it("adds v4 tokens without renaming a single v3 token the console depends on", () => {
    for (const token of [
      "--color-ivory:",
      "--color-carbon:",
      "--color-vermilion:",
      "--color-needle:",
      "--color-line:",
      "--color-stone:",
      "--font-display:",
      "--ease-out-soft:"
    ]) {
      expect(globalsCss, token).toContain(token);
    }
    for (const token of ["--font-mono:", "--dur-l1:", "--dur-l4:", "--ease-machine:", "--texture-strength:"]) {
      expect(globalsCss, token).toContain(token);
    }
  });

  it("loads no new font for machine notation — the platform stack only", () => {
    const monoDecl = globalsCss.slice(globalsCss.indexOf("--font-mono:"));
    expect(monoDecl.slice(0, 200)).toContain("ui-monospace");
    const imports = globalsCss.match(/@import "@fontsource[^"]+"/g) ?? [];
    expect(imports).toHaveLength(2);
  });

  it("neutralises uppercase and letterspacing for Gujarati on every new label class", () => {
    for (const cls of [".mono-note", ".lab-glass-label"]) {
      const guRule = machineLabCss.includes(`:lang(gu) ${cls}`);
      expect(guRule, cls).toBe(true);
    }
    const guBlocks = machineLabCss.split(":lang(gu)").slice(1);
    expect(guBlocks.length).toBeGreaterThanOrEqual(3);
    for (const block of guBlocks) {
      const body = block.slice(0, block.indexOf("}"));
      if (body.includes("text-transform")) expect(body).toContain("text-transform: none");
      if (body.includes("letter-spacing")) expect(body).toContain("letter-spacing: 0");
    }
  });

  it("defines all four motion levels and no fifth", () => {
    for (const level of [1, 2, 3, 4]) {
      expect(globalsCss).toContain(`--dur-l${level}:`);
      expect(machineLabCss).toContain(`.m-l${level} {`);
    }
    expect(globalsCss).not.toContain("--dur-l5:");
  });

  it("shows the finished state under prefers-reduced-motion", () => {
    const block = machineLabCss.slice(machineLabCss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation: none !important");
    expect(block).toContain("opacity: 1 !important");
    expect(block).toContain("clip-path: none !important");
    expect(block).toContain("stroke-dashoffset: 0 !important");
  });

  it("restricts glass to one panel treatment — no frosted card variant", () => {
    expect(machineLabCss).toContain(".lab-glass {");
    expect(stripComments(machineLabCss)).not.toContain(".lab-glass--card");
    expect(machineLabCss).toContain("@supports not ((backdrop-filter");
  });

  it("keeps textures at 2-5% strength", () => {
    const strength = globalsCss.match(/--texture-strength:\s*([\d.]+)/);
    expect(strength).not.toBeNull();
    const value = Number(strength![1]);
    expect(value).toBeGreaterThanOrEqual(0.02);
    expect(value).toBeLessThanOrEqual(0.05);
  });

  it("keeps the machine light steel and vermilion — no SaaS aurora", () => {
    const block = machineLabCss.slice(
      machineLabCss.indexOf(".machine-light::before"),
      machineLabCss.indexOf(".machine-light::before") + 700
    );
    expect(block).toContain("rgb(41 97 122");
    expect(block).toContain("rgb(197 72 50");
    for (const banned of ["purple", "violet", "#7c3aed", "#8b5cf6", "magenta"]) {
      expect(block.toLowerCase()).not.toContain(banned);
    }
  });

  it("keeps Console CSS admin-only and the public THREAD / MACHINE / PROOF sheet public-only", () => {
    const publicLayout = stripComments(read("src/app/[locale]/layout.tsx"));
    const adminLayout = stripComments(read("src/app/admin/layout.tsx"));

    expect(publicLayout).toContain('thread-machine-proof.css');
    expect(publicLayout).not.toContain('premium.css');
    expect(publicLayout).not.toContain('machine-lab.css');

    expect(adminLayout).toContain('premium.css');
    expect(adminLayout).toContain('machine-lab.css');
    expect(adminLayout.indexOf('machine-lab.css')).toBeGreaterThan(adminLayout.indexOf('premium.css'));
    expect(adminLayout).not.toContain('thread-machine-proof.css');
  });

  it("adds no new runtime dependency for the design system", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    for (const banned of [
      "shadcn-ui",
      "@shadcn/ui",
      "recharts",
      "chart.js",
      "framer-motion",
      "gsap",
      "lottie-web",
      "three",
      "lucide-react",
      "react-icons"
    ]) {
      expect(Object.keys(pkg.dependencies), banned).not.toContain(banned);
    }
  });
});

describe("primitives render", () => {
  it("renders every icon in the family", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { Icon } = await import("../src/components/ui/Icon");
    for (const name of ICON_NAMES) {
      const html = renderToStaticMarkup(<Icon name={name} />);
      expect(html, name).toContain("<svg");
      expect(html.includes("<path") || html.includes("<circle") || html.includes("<rect"), name).toBe(true);
      expect(html, name).toContain('aria-hidden="true"');
    }
  });

  it("renders all eleven technique marks, decoratively and fluidly", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { StitchSwatch } = await import("../src/components/kds/StitchSwatch");
    for (const slug of Object.keys(STITCH_SWATCHES)) {
      const html = renderToStaticMarkup(<StitchSwatch slug={slug} />);
      expect(html, slug).toContain('aria-hidden="true"');
      expect(html, slug).toContain("viewBox");
      expect(html, slug).not.toMatch(/<svg[^>]*\swidth="/);
    }
  });

  it("returns nothing rather than an empty frame for an unknown course", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { StitchSwatch } = await import("../src/components/kds/StitchSwatch");
    expect(renderToStaticMarkup(<StitchSwatch slug="not-a-course" />)).toBe("");
  });

  it("renders each stitch mark and each manifest frame", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const marks = await import("../src/components/kds/marks");
    for (const Mark of [marks.ThreadLine, marks.NeedlePoint]) {
      expect(renderToStaticMarkup(<Mark />)).toContain("<span");
    }

    const { PhotoFrame } = await import("../src/components/kds/Frame");
    for (const slot of PHOTO_MANIFEST) {
      const html = renderToStaticMarkup(<PhotoFrame id={slot.id} scale="lead" />);
      expect(html, slot.id).toContain(`aspect-ratio:${slot.width} / ${slot.height}`);
      expect(html, slot.id).toContain(slot.label);
    }
  });

  it("still writes a stage index zero-padded, wherever it appears", async () => {
    const chain = read("src/components/kds/studio/StudioChain.tsx");
    expect(chain).toContain('String(i + 1).padStart(2, "0")');
    const terms = read("src/app/[locale]/terms/page.tsx");
    expect(terms).toContain('String(i + 1).padStart(2, "0")');
  });
});
