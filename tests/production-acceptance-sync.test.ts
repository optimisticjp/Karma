import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("Console visibility reaches every public course surface", () => {
  it("uses the public course resolver on About and Services", () => {
    const about = read("src/app/[locale]/about/page.tsx");
    const services = read("src/app/[locale]/services/page.tsx");

    for (const source of [about, services]) {
      expect(source).toContain("getPublicCourses()");
      expect(source).toContain("publicCourses.map");
      expect(source).not.toContain("coursesByFamily.map");
    }
    expect(about).toContain("String(publicCourses.length)");
  });

  it("does not link a Machine Note to a course hidden in Console", () => {
    const note = read("src/app/[locale]/notes/[slug]/page.tsx");
    expect(note).toContain("getPublicCourseBySlug(note.courseSlug)");
    expect(note).not.toContain("courseBySlug(note.courseSlug)");
  });

  it("keeps homepage course-specific facts behind the Console resolver", () => {
    const page = read("src/app/[locale]/page.tsx");
    const hero = read("src/components/kds/home/HomeHero.tsx");
    expect(page).toContain("getCourseConfig(EMCAD_DAHAO_SLUG)");
    expect(page).toContain("<HomeHero courses={courses} emcad={emcad}");
    expect(hero).toContain("visible.has(slug)");
    expect(hero).toContain('t("swatchMore", { count: more })');
    expect(hero).not.toContain("EMCAD_DAHAO.operations");
    expect(hero).not.toContain("KARMA_SOFTWARE");
  });
});

describe("Admissions does not keep a second demo configuration", () => {
  it("passes the Console-resolved EMCAD demo to both decision-page blocks", () => {
    const page = read("src/app/[locale]/admissions/page.tsx");
    const intro = read("src/components/kds/admissions/AdmissionsIntro.tsx");
    const demo = read("src/components/kds/admissions/DemoBlock.tsx");

    expect(page).toContain("getCourseConfig(EMCAD_DAHAO_SLUG)");
    expect(page).toContain("<AdmissionsIntro demo={demo}");
    expect(page).toContain("<DemoBlock demo={demo}");
    expect(intro).not.toContain("EMCAD_DAHAO.operations");
    expect(demo).not.toContain("EMCAD_DAHAO.operations");
  });
});

describe("routing failures are explicit rather than soft or stale", () => {
  it("renders unknown localized routes with 404 metadata", () => {
    const catchAll = read("src/app/[locale]/[...rest]/page.tsx");
    expect(catchAll).toContain('robots: { index: false, follow: false }');
    expect(catchAll).toContain("<NotFound />");
    expect(catchAll).not.toContain("notFound();");
  });

  it("uses only public courses in 404 suggestions", () => {
    const notFound = read("src/app/[locale]/not-found.tsx");
    expect(notFound).toContain("getPublicCourses()");
    expect(notFound).toContain("courses.slice(0, 6)");
    expect(notFound).not.toContain("coursesByFamily");
  });

  it("redirects a deliberately hidden known course to the public catalogue", () => {
    const detail = read("src/app/[locale]/courses/[slug]/page.tsx");
    expect(detail).toContain('redirect(`/${locale}/courses`)');
    expect(detail).not.toContain("notFound();");
  });
});

describe("owner-confirmed operational facts stay current", () => {
  it("uses 11:00 pm in the runtime correction layer and About stats", () => {
    const request = read("src/i18n/request.ts");
    const about = read("src/app/[locale]/about/page.tsx");
    expect(request).toContain("11:00 pm");
    expect(request).toContain('timingEvening: "સાંજ (11:00 સુધી)"');
    expect(request).not.toContain("10:30");
    expect(about).toContain('value: "11:00"');
    expect(about).not.toContain("10:30");
  });

  it("does not send a batch id the admission model does not store", () => {
    const board = read("src/components/kds/batches/BatchBoard.tsx");
    expect(board).toContain('src: "batches"');
    expect(board).not.toContain("batch: String(row.id)");
  });
});

describe("certificate verification reflects revocation", () => {
  it("never gives a revoked certificate the Verified verdict", () => {
    const verify = read("src/app/[locale]/verify/[id]/page.tsx");
    expect(verify).toContain('const revoked = cert?.status === "revoked"');
    expect(verify).toContain('revoked ? "bad"');
    expect(verify).toContain('revoked\n        ? t("revoked")');
    expect(verify).toContain('state === "ok" ? "check" : "misregistration"');
    expect(verify).not.toContain('revoked ? "ok"');
  });
});