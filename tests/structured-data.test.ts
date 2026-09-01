import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { courseSchema, studioSchema, noteSchema, breadcrumbSchema, faqSchema } from "../src/lib/schema";
import { courses } from "../src/content/courses";
import { machineNotes } from "../src/content/notes";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out);
    else if (rel.endsWith(".tsx") || rel.endsWith(".ts")) out.push(rel);
  }
  return out;
}

describe("structured data is built in one place", () => {
  it("emits no schema type outside src/lib/schema.ts", () => {
    const offenders: string[] = [];
    for (const file of [...walk("src/app"), ...walk("src/components")]) {
      const source = read(file);
      if (source.includes('"@context"')) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("nothing unverified reaches a search engine", () => {
  const everything = JSON.stringify([
    studioSchema("en", courses),
    studioSchema("gu", courses),
    ...courses.map((c) => courseSchema(c, "en")),
    ...machineNotes.map((n) =>
      noteSchema({ slug: n.slug, headline: n.questionEn, description: n.answerEn, locale: "en" })
    ),
    breadcrumbSchema("en", [["Courses", "/courses"]]),
    faqSchema([{ q: "q", a: "a" }])
  ]);

  it("never emits a rating", () => {
    expect(everything).not.toContain("aggregateRating");
    expect(everything).not.toContain("ratingValue");
    expect(everything).not.toContain("reviewCount");
    expect(everything).not.toContain("4.8");
  });

  it("never emits a review or a named person", () => {
    expect(everything).not.toContain('"Review"');
    expect(everything).not.toContain('"Person"');
    expect(everything).not.toContain("author");
  });

  it("never emits a price or an offer", () => {
    for (const key of ["offers", "price", "priceCurrency"]) {
      expect(everything, key).not.toContain(key);
    }
  });

  it("emits a duration ONLY for the one course whose duration the owner confirmed", () => {
    const withDuration = courses.filter((c) => c.durationMonths != null);
    expect(withDuration.map((c) => c.slug)).toEqual(["emcad-embroidery-design"]);

    const emitted = courses
      .map((c) => courseSchema(c, "en") as Record<string, unknown>)
      .filter((ld) => "timeRequired" in ld);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].timeRequired).toBe("P3M");
    expect(everything).not.toContain("P12W");
  });

  it("carries no sample identity", () => {
    for (const name of ["Sample:", "Hetal", "Rina", "Jignesh", "Nikita", "Rajesh", "Nidhi"]) {
      expect(everything, name).not.toContain(name);
    }
  });
});

describe("the local identity is complete and consistent", () => {
  const studio = studioSchema("en", courses) as Record<string, unknown>;

  it("declares both business types, because it is genuinely both", () => {
    expect(studio["@type"]).toEqual(["LocalBusiness", "EducationalOrganization"]);
  });

  it("publishes all three numbers rather than promoting one", () => {
    expect((studio.telephone as string[]).length).toBe(3);
  });

  it("keeps the landmark in the street address, where a first-timer needs it", () => {
    const address = studio.address as Record<string, string>;
    expect(address.streetAddress).toContain("Dhara Arcade");
    expect(address.addressLocality).toContain("Mota Varachha");
  });

  it("offers exactly the public course list handed to the schema", () => {
    const visible = courses.slice(0, 3);
    const scoped = studioSchema("en", visible) as Record<string, unknown>;
    const catalog = scoped.hasOfferCatalog as { itemListElement: Array<Record<string, unknown>> };
    expect(catalog.itemListElement).toHaveLength(visible.length);
    expect(catalog.itemListElement.map((item) => item.name)).toEqual(visible.map((course) => course.nameEn));
    for (const item of catalog.itemListElement) {
      expect((item.provider as Record<string, string>)["@id"]).toContain("#studio");
    }
  });
});

describe("every page is discoverable and the console is not", () => {
  const sitemap = read("src/app/sitemap.ts");

  it("includes every public surface it has not told the crawler to skip", () => {
    for (const path of [
      '""', '"/courses"', '"/admissions"', '"/admission"', '"/student-work"',
      '"/notes"', '"/services"', '"/about"', '"/success-stories"', '"/contact"',
      '"/verify"', '"/privacy"'
    ]) {
      expect(sitemap, path).toContain(path);
    }
    expect(sitemap).not.toContain('"/terms"');
    expect(sitemap).toContain("getPublicCourses()");
    expect(sitemap).toContain("courses.map((course) => `/courses/${course.slug}`)");
    expect(sitemap).toContain("machineNotes.map((note) => `/notes/${note.slug}`)");
  });

  it("never lists an admin route", () => {
    expect(sitemap).not.toContain("/admin");
  });

  it("disallows the console in robots.txt as well as in its metadata", () => {
    const robots = read("src/app/robots.ts");
    expect(robots).toContain('"/admin"');
    expect(robots).toContain('"/api/"');
  });
});

describe("courses are individually optimised", () => {
  it("gives every course a distinct description with local relevance", () => {
    const descriptions = courses.map((c) => c.production.producesEn);
    expect(new Set(descriptions).size).toBe(courses.length);
    const page = read("src/app/[locale]/courses/[slug]/page.tsx");
    expect(page).toContain("Mota Varachha, Surat");
  });

  it("gives every course a distinct name in both languages", () => {
    expect(new Set(courses.map((c) => c.nameEn)).size).toBe(courses.length);
    expect(new Set(courses.map((c) => c.nameGu)).size).toBe(courses.length);
  });
});

describe("the launch steps are written down but not executed", () => {
  const doc = read("docs/launch-checklist.md");

  it("documents the canonical switch, Search Console and the Maps profile", () => {
    expect(doc).toContain("NEXT_PUBLIC_SITE_URL");
    expect(doc).toContain("Search Console");
    expect(doc).toContain("Google Business Profile");
  });

  it("has not changed the site URL default away from the placeholder domain", () => {
    expect(read("src/lib/site.ts")).toContain("process.env.NEXT_PUBLIC_SITE_URL ??");
  });
});
