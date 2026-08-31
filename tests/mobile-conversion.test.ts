import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { clampAt, declaration, ruleBody } from "./helpers/measure";
import { join } from "node:path";
import { site } from "../src/lib/site";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
/**
 * Read the CODE, not the prose.
 *
 * These files explain their own rules in comments — the layout says why the
 * dock is not in it, the dock says which number it must never dial — so a
 * substring check against the raw text fails on the explanation of the very
 * thing it is asserting. Every "must not contain" below reads this.
 */
const code = (p: string) =>
  read(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ").replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");

/**
 * The mobile conversion contract.
 *
 * Two things here are easy to break by accident and expensive to notice: the
 * two published mobile numbers drifting back into one role, and the analytics
 * hooks quietly gaining a field that carries something a visitor typed.
 */
describe("the two mobile numbers keep their separate roles", () => {
  it("publishes both, and they are different numbers", () => {
    expect(site.callPhone).toBe("918160517429");
    expect(site.whatsapp).toBe("919904376340");
    expect(site.callPhone).not.toBe(site.whatsapp);
  });

  it("never opens WhatsApp on the call number", () => {
    for (const file of [
      "src/components/kds/shell/ActionDock.tsx",
      "src/components/kds/shell/SiteHeader.tsx",
      "src/components/kds/shell/SiteFooter.tsx",
      "src/components/home/Hero.tsx",
      "src/app/[locale]/contact/page.tsx",
      "src/app/[locale]/courses/[slug]/page.tsx"
    ]) {
      const source = read(file);
      expect(source).not.toContain("wa.me/${site.callPhone}");
      expect(source).not.toMatch(/waLink\([^)]*callPhone/);
    }
  });

  it("dials the owner-published number from every explicit call-for-demo action", () => {
    for (const file of [
      "src/components/kds/shell/SiteHeader.tsx",
      "src/components/home/Hero.tsx",
      "src/app/[locale]/courses/[slug]/page.tsx"
    ]) {
      expect(read(file)).toContain("tel:+${site.callPhone}");
    }
  });

  it("lists both numbers in structured data rather than promoting one", () => {
    // Schema moved into one module in Phase 8 so the fact discipline lives in
    // one place; the assertion follows it rather than the page that used to
    // build it inline.
    const schema = read("src/lib/schema.ts");
    expect(schema).toContain("`+${site.callPhone}`");
    expect(schema).toContain("`+${site.whatsapp}`");
    expect(schema).toContain("`+${site.landline}`");
  });
});

/**
 * THE CONTEXTUAL DOCK REPLACED THE PERMANENT BAR.
 *
 * Until this phase every public page carried a two-item bar pinned to the
 * bottom of a phone screen: *Call for demo* and *Directions*. It sat on the
 * privacy policy, the terms page and the Machine Notes archive, where neither
 * action is the next step anybody is taking.
 *
 * The plan's §15 supersedes that with contextual conversion, and this suite
 * was rewritten deliberately to guard the NEW rule rather than fossilise the
 * old one. The phone-role protections above did not change and must not: they
 * are about which number is published as what, which no design decision
 * touches.
 */
describe("conversion chrome is contextual, not permanent", () => {
  const dock = code("src/components/kds/shell/ActionDock.tsx");
  const layout = code("src/app/[locale]/layout.tsx");

  /** The four high-intent routes the plan names. */
  const HIGH_INTENT = [
    "src/app/[locale]/admission/page.tsx",
    "src/app/[locale]/admissions/page.tsx",
    "src/app/[locale]/batches/page.tsx",
    "src/app/[locale]/courses/[slug]/page.tsx"
  ];

  /** Routes that must NOT carry it. A bar on a privacy policy is chrome. */
  const GENERAL = [
    "src/app/[locale]/page.tsx",
    "src/app/[locale]/privacy/page.tsx",
    "src/app/[locale]/terms/page.tsx",
    "src/app/[locale]/notes/page.tsx",
    "src/app/[locale]/contact/page.tsx"
  ];

  it("is rendered by the high-intent routes and by no others", () => {
    for (const file of HIGH_INTENT) {
      expect(read(file), file).toContain("<ActionDock");
    }
    for (const file of GENERAL) {
      expect(code(file), file).not.toContain("ActionDock");
    }
  });

  it("is not in the layout, so it cannot become permanent by accident", () => {
    /* The failure this catches: somebody moves it up to the layout "so every
       page gets it", which is precisely the decision the owner reversed. */
    expect(layout).not.toContain("ActionDock");
    expect(layout).not.toContain("MobileTabBar");
    expect(layout).not.toContain("WhatsAppFab");
  });

  it("offers the demo and WhatsApp — not call and directions", () => {
    expect(dock).toContain("bookDemo");
    expect(dock).toContain("waLink");
    expect(dock).not.toContain("directions");
    expect(dock).not.toContain("mapsUrl");
  });

  it("never opens WhatsApp on the call number", () => {
    /* The one protection that survives every redesign unchanged. */
    expect(dock).not.toContain("callPhone");
  });

  it("gives back the space it covers", () => {
    /* A fixed bar that does not reserve its own height hides the last element
       on every page that carries it. The dock adds the class itself rather
       than trusting each route to remember. */
    expect(dock).toContain('classList.add("has-dock")');
    expect(dock).toContain('classList.remove("has-dock")');
    const css = read("src/app/thread-machine-proof.css");
    expect(css).toContain(".kds.has-dock");
    expect(css).toContain("var(--dock-h)");
  });

  it("keeps both actions past the tap floor", () => {
    const css = read("src/app/thread-machine-proof.css");
    const body = ruleBody(css, ".kds .dock > *") as string;
    expect(clampAt(declaration(body, "min-height") as string)).toBeGreaterThanOrEqual(44);
  });

  it("disappears on a laptop, where the header's action is always visible", () => {
    const css = read("src/app/thread-machine-proof.css");
    const desktop = css.slice(css.indexOf("@media (min-width: 64rem) {\n  .kds .dock"));
    expect(desktop.slice(0, 160)).toContain("display: none");
  });

  it("carries no route list of its own", () => {
    /* A component that decides where it belongs from a hardcoded array of
       paths goes stale the moment a route is renamed. A route opts in. */
    expect(dock).not.toContain("usePathname");
    expect(dock).not.toContain("/privacy");
  });
});

describe("contact keeps its three channels in the first viewport", () => {
  const contact = read("src/app/[locale]/contact/page.tsx");

  it("exposes call, WhatsApp and directions without a dock", () => {
    /* Plan §15. Contact does not get a dock precisely because a bar would
       cover the three actions the page exists to offer. */
    expect(contact).toContain("tel:+${site.callPhone}");
    expect(contact).toContain("mapsUrl");
    expect(contact.includes("waLink") || contact.includes("wa.me")).toBe(true);
  });
});

describe("analytics carries no personal data", () => {
  const analytics = read("src/lib/analytics.ts");

  it("allows only enumerable context keys", () => {
    expect(analytics).toContain(
      'const ALLOWED = ["course", "surface", "locale", "step", "channel", "note"] as const'
    );
    for (const pii of ["name", "phone", "email", "whatsapp", "message", "goal", "area"]) {
      expect(analytics).not.toContain(`"${pii}"`);
    }
  });

  it("makes no network request and loads no third-party script", () => {
    expect(analytics).not.toContain("fetch(");
    expect(analytics).not.toContain("XMLHttpRequest");
    expect(analytics).not.toContain("navigator.sendBeacon");
    // Script *injection*, not the word — the file's own comment explains that
    // loading a third-party script is exactly what this module avoids.
    expect(analytics).not.toContain("createElement(\"script\")");
    expect(analytics).not.toContain("document.head.append");
  });

  it("sends only the course slug from the admission form, never a typed field", () => {
    const form = read("src/components/forms/AdmissionForm.tsx");
    const calls = form.match(/track\([^;]*\);/gs) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      for (const field of ["fullName", "whatsapp", "email", "goal", "area", "guardian"]) {
        expect(call).not.toContain(field);
      }
    }
  });
});

describe("the demo funnel asks the cheapest question first", () => {
  const form = read("src/components/forms/AdmissionForm.tsx");

  it("validates course and timing on step one, identity on step two", () => {
    const validate = form.slice(form.indexOf("const validate ="), form.indexOf("const focusField"));
    const stepOne = validate.slice(validate.indexOf("if (s === 0)"), validate.indexOf("if (s === 1)"));
    const stepTwo = validate.slice(validate.indexOf("if (s === 1)"), validate.indexOf("if (s === 2)"));
    expect(stepOne).toContain("courseSlug");
    expect(stepOne).toContain("preferredTiming");
    expect(stepTwo).toContain("fullName");
    expect(stepTwo).toContain("whatsapp");
  });

  it("gives phone fields a dialpad keyboard and tel autofill", () => {
    expect(form).toContain('type: "tel"');
    expect(form).toContain('inputMode: "tel"');
    expect(form).toContain('autoComplete: "tel"');
  });
});
