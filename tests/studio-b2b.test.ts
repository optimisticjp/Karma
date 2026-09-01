import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { studioProblems, studioProjects, services } from "../src/content/collections";
import { coursesByFamily } from "../src/content/courses";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/**
 * The studio page makes commercial promises, which is a different risk from
 * the rest of the site: a turnaround, a file format or a client name that
 * turns out to be wrong costs the owner a customer, not just credibility.
 */
describe("the studio page promises nothing that has not been confirmed", () => {
  const page = read("src/app/[locale]/services/page.tsx");
  const en = JSON.parse(read("messages/en.json")) as Record<string, Record<string, unknown>>;
  const copy = JSON.stringify(en.servicesPage).toLowerCase();

  it("states no turnaround time", () => {
    for (const claim of [
      "24 hour", "24-hour", "48 hour", "48-hour",
      "same day", "same-day", "next day", "next-day",
      "within 3 days", "guaranteed delivery"
    ]) {
      expect(copy).not.toContain(claim);
    }
    // And says so explicitly rather than staying silent.
    expect(copy).toContain("depends on the technique");
  });

  it("claims no specific machine file format as supported", () => {
    // Naming .dst/.emb/.pes as supported is a compatibility promise nobody
    // has verified. The page asks instead.
    for (const fmt of [".dst", ".emb", ".pes", ".jef", ".exp"]) {
      expect(copy).not.toContain(fmt);
    }
    expect(copy).toContain("tell us the format your machine takes");
  });

  it("offers no file upload while private storage is off", () => {
    const form = read("src/components/forms/BriefForm.tsx");
    expect(form).not.toContain('type="file"');
    expect(form).toContain("filesDeferred");
  });

  it("keeps the brief API and its file guards intact for when storage lands", () => {
    const form = read("src/components/forms/BriefForm.tsx");
    expect(form).toContain("MAX_FILES");
    expect(form).toContain("MAX_FILE_BYTES");
    // The route still handles files; only the input is deferred.
    expect(read("src/app/api/brief/route.ts")).toContain("filesStored");
  });

  it("builds machine capability from the Console-visible catalogue, so it cannot overclaim", () => {
    expect(page).toContain("getPublicCourses()");
    expect(page).toContain("publicCourses.map");
    /* Every technique on the wall is a currently public course the school
       teaches, so hiding a course in Console removes the matching public
       capability instead of leaving a stale commercial promise behind. */
    expect(page).toContain('pick(c, "name", l)');
    expect(page).not.toMatch(/\b11 techniques\b/);
  });
});

describe("studio content is grounded in services the studio already offers", () => {
  it("names a service on every problem, and no invented ones", () => {
    const offered = services.map((s) => s.titleEn.toLowerCase()).join(" ");
    for (const p of studioProblems) {
      expect(p.serviceEn.length).toBeGreaterThan(3);
      // Each problem's service maps onto the studio's own vocabulary.
      const words = p.serviceEn.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
      expect(words.some((w) => offered.includes(w) || "digitising digitizing reconstruction correction development".includes(w))).toBe(true);
    }
  });

  it("keeps sample projects generic — no named client, no endorsement", () => {
    for (const p of studioProjects) {
      expect(p.sample).toBe(true);
      const blob = `${p.titleEn} ${p.briefEn} ${p.deliveredEn}`.toLowerCase();
      for (const word of ["ltd", "pvt", "limited", "brand", "client:", "®", "™"]) {
        expect(blob).not.toContain(word);
      }
    }
  });

  it("gives every studio row both languages", () => {
    for (const p of studioProblems) {
      for (const f of ["askEn", "askGu", "serviceEn", "serviceGu", "returnsEn", "returnsGu"] as const) {
        expect(p[f].length).toBeGreaterThan(3);
      }
    }
    for (const p of studioProjects) {
      for (const f of ["titleEn", "titleGu", "briefEn", "briefGu", "deliveredEn", "deliveredGu"] as const) {
        expect(p[f].length).toBeGreaterThan(3);
      }
    }
  });

  it("keeps the source fallback catalogue complete", () => {
    expect(coursesByFamily.length).toBe(11);
  });
});
