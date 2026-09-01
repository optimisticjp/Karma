import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("public and Console course UX", () => {
  it("uses the requested EN।ગુજ language mark and keeps it visible in Console", () => {
    const publicSwitch = read("src/components/kds/shell/LocaleSwitch.tsx");
    const adminBar = read("src/components/admin/AdminLanguageBar.tsx");
    const adminLayout = read("src/app/admin/(console)/layout.tsx");
    expect(publicSwitch).toContain('code === "en" ? "EN" : "ગુજ"');
    expect(publicSwitch).toContain('className="locale-separator">।</span>');
    expect(adminBar).toContain("EN।ગુજ");
    expect(adminBar).toContain('value="en"');
    expect(adminBar).toContain('value="gu"');
    expect(adminLayout).toContain("<AdminLanguageBar locale={session.staff.adminLocale} />");
  });

  it("has an explicit Home item in the public menu", () => {
    const header = read("src/components/kds/shell/SiteHeader.tsx");
    expect(header).toContain('{ href: "/", key: "home" }');
  });

  it("places social trust immediately after the hero", () => {
    const home = read("src/app/[locale]/page.tsx");
    expect(home.indexOf("<TrustSignals />")).toBeGreaterThan(home.indexOf("<HomeHero"));
    expect(home.indexOf("<TrustSignals />")).toBeLessThan(home.indexOf("<EntryPaths />"));
  });

  it("shows admission norms without a collapsed details control", () => {
    const norms = read("src/components/site/AdmissionNorms.tsx");
    expect(norms).toContain('id="admission-norms"');
    expect(norms).not.toContain("<details");
    expect(norms).not.toContain("<summary");
  });

  it("keeps public fee amounts private while retaining Console fee records", () => {
    const facts = read("src/components/kds/courses/CourseFacts.tsx");
    const emcad = read("src/components/kds/home/EmcadPanel.tsx");
    const adminCourses = read("src/app/admin/(console)/courses/page.tsx");
    expect(facts).not.toContain("config.fees");
    expect(facts).not.toContain("FeeSheet");
    expect(emcad).not.toContain("FeeSheet");
    expect(adminCourses).toContain("Internal fee record");
    expect(adminCourses).toContain("course.feeTotal");
    expect(adminCourses).toContain("course.termsVersion");
  });

  it("makes selected Book Demo choices visibly vermilion", () => {
    const css = read("src/app/requested-ux.css");
    expect(css).toContain(".choice-chip:has(input:checked)");
    expect(css).toContain("var(--color-vermilion-deep)");
    expect(css).toContain('content: "✓"');
  });

  it("refreshes Turnstile for long forms and retries", () => {
    const widget = read("src/components/forms/TurnstileWidget.tsx");
    const brief = read("src/components/forms/BriefForm.tsx");
    expect(widget).toContain('"refresh-expired": "auto"');
    expect(widget).toContain('"refresh-timeout": "auto"');
    expect(widget).toContain('"response-field-name": "turnstileToken"');
    expect(brief).toContain("challengeVersion");
    expect(brief).toContain('data.error === "turnstile"');
  });
});
