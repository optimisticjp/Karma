import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "../src/lib/site";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

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
      "src/components/site/MobileTabBar.tsx",
      "src/components/home/Hero.tsx",
      "src/components/site/Footer.tsx",
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
      "src/components/site/MobileTabBar.tsx",
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

describe("the mobile bar is two actions, not navigation", () => {
  const bar = read("src/components/site/MobileTabBar.tsx");

  it("offers exactly call and directions", () => {
    expect(bar).toContain("call_demo_click");
    expect(bar).toContain("directions_click");
    // No route links: navigation belongs to the header menu.
    expect(bar).not.toContain('href="/courses"');
    expect(bar).not.toContain('href="/admission"');
    expect(bar).not.toContain("usePathname");
  });

  it("keeps clear of the home indicator and never covers content", () => {
    const css = read("src/app/premium.css");
    expect(css).toContain("padding-bottom: env(safe-area-inset-bottom)");
    expect(css).toContain(".site-body { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); }");
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
