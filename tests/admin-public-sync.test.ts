import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("Console course settings drive public course surfaces", () => {
  const publicCourses = read("src/lib/course/public.ts");
  const config = read("src/lib/course/config.ts");

  it("requires active, public and unarchived database rows", () => {
    for (const source of [publicCourses, config]) {
      expect(source).toContain('eq(schema.courses.active, true)');
      expect(source).toContain('eq(schema.courses.publicVisible, true)');
      expect(source).toContain('isNull(schema.courses.archivedAt)');
    }
  });

  it("does not resurrect a deliberately hidden course when Postgres answered", () => {
    expect(config).toContain('return rows[0] ? fromDatabase(rows[0]) : null;');
    expect(config).not.toContain('if (!row) return fromSource(slug)');
  });

  it("publishes active Console-only courses instead of dropping unknown slugs", () => {
    expect(publicCourses).toContain("function consoleOnlyCourse");
    expect(publicCourses).toContain("if (!source) return consoleOnlyCourse(row)");
    expect(config).toContain("return rows.map(fromDatabase)");
    expect(config).not.toContain("filter((row) => catalogue.has(row.slug))");
  });

  it("uses the resolver across catalogue, detail, home, sitemap and structured data", () => {
    expect(read("src/app/[locale]/courses/page.tsx")).toContain("getPublicCourses()");
    expect(read("src/app/[locale]/courses/[slug]/page.tsx")).toContain("getPublicCourseBySlug(slug)");
    expect(read("src/app/[locale]/page.tsx")).toContain("getPublicCourses()");
    expect(read("src/app/sitemap.ts")).toContain("getPublicCourses()");
    const layout = read("src/app/[locale]/layout.tsx");
    expect(layout).toContain("getPublicCourses()");
    expect(layout).toContain("studioSchema(asLocale(locale), courses)");
  });

  it("publishes Console operational detail but keeps fee amounts off public pages", () => {
    expect(read("src/components/kds/courses/CourseHero.tsx")).toContain("config.durationMonths");
    expect(read("src/components/kds/courses/CourseHero.tsx")).toContain("config.software");
    const facts = read("src/components/kds/courses/CourseFacts.tsx");
    expect(facts).toContain("config.operations.scheduleOptions");
    expect(facts).not.toContain("config.fees");
    expect(read("src/components/kds/courses/CourseSyllabus.tsx")).toContain("config.operations.curriculum");
    expect(read("src/components/kds/courses/CourseFloor.tsx")).toContain("config.operations.practical");
    expect(read("src/components/kds/home/EmcadPanel.tsx")).toContain("getCourseConfig(EMCAD_DAHAO_SLUG)");
    expect(read("src/components/kds/home/EmcadPanel.tsx")).not.toContain("FeeSheet");
  });
});

describe("Console batches drive public batch surfaces", () => {
  const query = read("src/lib/db/queries.ts");

  it("keeps an open running intake visible until it ends", () => {
    expect(query).toContain('eq(schema.batches.status, "open")');
    expect(query).toContain("gte(schema.batches.endDate, today)");
    expect(query).not.toContain("gte(schema.batches.startDate, today)");
  });

  it("respects both batch and parent-course visibility", () => {
    expect(query).toContain("isNull(schema.batches.archivedAt)");
    expect(query).toContain('eq(schema.courses.active, true)');
    expect(query).toContain('eq(schema.courses.publicVisible, true)');
    expect(query).toContain("isNull(schema.courses.archivedAt)");
  });

  it("shows the Console batch label on every public batch surface", () => {
    expect(read("src/components/kds/batches/BatchBoard.tsx")).toContain("row.label");
    expect(read("src/components/kds/courses/CourseBatches.tsx")).toContain("row.label");
    expect(read("src/components/kds/home/BatchesVisit.tsx")).toContain("row.label");
  });
});

describe("Content Desk public mappings stay wired", () => {
  it("publishes FAQs, student stories, gallery and verified homepage stats through the shared reader", () => {
    const publicContent = read("src/lib/content/public.ts");
    expect(publicContent).toContain('published("faq")');
    expect(publicContent).toContain('published("testimonial")');
    expect(publicContent).toContain('published("gallery")');
    expect(publicContent).toContain('published("homepage_stat")');
    expect(publicContent).toContain("row.ownerVerified");
  });

  it("renders Content Desk homepage stats instead of ignoring them", () => {
    expect(read("src/components/kds/home/TrustSignals.tsx")).toContain("getHomepageStats()");
  });

  it("keeps the owner-confirmed evening fact correct even if Content Desk is unavailable", () => {
    const publicContent = read("src/lib/content/public.ts");
    expect(publicContent).toContain("11:00 PM");
    expect(publicContent).not.toContain("10:30 pm");
  });
});
