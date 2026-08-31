import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else if (rel.endsWith(".tsx")) out.push(rel);
  }
  return out;
}

/** WCAG-relevant contrast, computed the way a browser does. */
function ratio(a: string, b: string) {
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, bl] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe("secondary text clears AA on every surface it is used on", () => {
  const COTTON = "#f5f0e6";
  const RAW = "#e9decd";
  const SAND = "#ded0b8";

  it("passes on Cotton and Raw Silk with the base tokens", () => {
    for (const [name, hex] of [
      ["stone", "#605e56"],
      ["vermilion-deep", "#a93a27"],
      ["needle", "#29617a"],
      ["zari-deep", "#8a4e2c"]
    ] as const) {
      expect(ratio(hex, COTTON), `${name} on cotton`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(hex, RAW), `${name} on raw silk`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("passes on Sand only with the re-pointed tokens, which is why they exist", () => {
    // The base values fail here — this is the regression the .bg-sand block
    // was added to fix, and asserting the failure keeps the reason visible.
    expect(ratio("#605e56", SAND)).toBeLessThan(4.5);

    for (const [name, hex] of [
      ["stone", "#5b5951"],
      ["vermilion-deep", "#9e3624"],
      ["needle", "#286078"],
      ["zari-deep", "#854b2a"]
    ] as const) {
      expect(ratio(hex, SAND), `${name} on sand`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps the sand overrides in the stylesheet", () => {
    const css = read("src/app/premium.css");
    expect(css).toContain("--color-stone: #5b5951;");
    expect(css).toContain("--color-vermilion-deep: #9e3624;");
    expect(css).toContain("--color-needle: #286078;");
    expect(css).toContain("--color-zari-deep: #854b2a;");
  });
});

describe("motion is fully optional", () => {
  const globals = read("src/app/globals.css");
  const premium = read("src/app/premium.css");

  it("returns every animated primitive to its final state under reduced motion", () => {
    const block = globals.slice(globals.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const cls of [".reveal", ".stitch-draw", ".rule-stitch", ".media-unveil"]) {
      expect(block, cls).toContain(cls);
    }
    expect(premium).toContain(".stitch-wipe { clip-path: none !important;");
  });

  it("hijacks no scroll and autoplays no media", () => {
    for (const file of walk("src/components").concat(walk("src/app"))) {
      const source = read(file);
      expect(source, file).not.toContain("scroll-snap-type: y mandatory");
      expect(source, file).not.toContain("autoPlay");
      expect(source, file).not.toContain("<video");
      expect(source, file).not.toContain("<audio");
    }
  });
});

describe("layout survives text the studio did not write", () => {
  it("keeps the break rule available, and renders no foreign feed without it", () => {
    /* A string this studio did not write — a YouTube title, a handle, a
       hashtag — is an unbreakable token that will overflow a clipped box.
       `.u-break` is the answer and it stays defined.

       The homepage video shelf was the only public surface rendering one, and
       it left with the rebuild. So the live rule is now the SCAN: if a public
       component ever renders feed text again, it has to opt in. */
    expect(read("src/app/globals.css")).toContain(".u-break");
    const feedish = walk("src/components")
      .filter((f) => f.endsWith(".tsx"))
      .filter((f) => /youtube|\bfeed\b/i.test(read(f)) && read(f).includes("v.title"));
    for (const file of feedish) {
      expect(read(file), file).toContain("u-break");
    }
  });

  it("drops the brand tail on a cramped header row, not on a narrow viewport", () => {
    const css = read("src/app/premium.css");
    // A viewport media query never fires at 200% zoom, where the row is
    // actually cramped. The container query is the correct test.
    expect(css).toContain("container-type: inline-size");
    expect(css).toContain("@container (max-width: 22rem)");
  });
});

describe("fonts load only what a page needs", () => {
  const globals = read("src/app/globals.css");

  it("restricts the Gujarati face to the Gujarati block", () => {
    // The full package pulled a symbols and a math subset — 36.8KB — on every
    // page, to draw an arrow and a row of stars.
    expect(globals).not.toContain('@import "@fontsource-variable/noto-sans-gujarati"');
    expect(globals).toContain("U+0A80-0AFF");
    expect(globals).toContain("noto-sans-gujarati-gujarati-wght-normal.woff2");
  });

  it("loads the accent face as italic only", () => {
    expect(globals).toContain('@fontsource-variable/playfair-display/wght-italic.css');
  });

  it("swaps rather than blocking paint", () => {
    expect(globals).toContain("font-display: swap");
  });
});

describe("the public shell cannot leak into Karma Console", () => {
  it("scopes every shell rule to .site-body", () => {
    const css = read("src/app/premium.css");
    expect(css).toContain(
      ".site-body { padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom)); }"
    );
    /* The rule this protects: the public bar's reservation is scoped to
       `.site-body`. An unscoped `body` rule once reserved 64px at the bottom
       of every Karma Console screen, which has no bar to clear. */
    expect(css).not.toContain("\n  body { padding-bottom:");
  });

  it("keeps the console on its own root layout", () => {
    const admin = read("src/app/admin/layout.tsx");
    expect(admin).toContain('className="console-root');
    expect(admin).not.toContain("site-body");
    expect(admin).toContain("robots");
  });
});

describe("forms announce what they are doing", () => {
  it("keeps a live region present rather than inserting one on error", () => {
    const brief = read("src/components/forms/BriefForm.tsx");
    expect(brief).toContain('aria-live="assertive"');
    expect(brief).toContain("aria-busy");
    const admission = read("src/components/forms/AdmissionForm.tsx");
    expect(admission).toContain('aria-live="polite"');
    expect(admission).toContain('role="alert"');
  });

  it("wires every field to an error id and an invalid state", () => {
    const admission = read("src/components/forms/AdmissionForm.tsx");
    expect(admission).toContain("aria-invalid");
    expect(admission).toContain("aria-describedby");
  });
});

describe("no third-party request is made from a public page", () => {
  it("embeds no social widget, map iframe or analytics script", () => {
    for (const file of walk("src/components").concat(walk("src/app"))) {
      const source = read(file);
      expect(source, file).not.toContain("<iframe");
      expect(source, file).not.toContain("googletagmanager");
      expect(source, file).not.toContain("connect.facebook.net");
      expect(source, file).not.toContain("platform.instagram.com");
    }
  });
});
