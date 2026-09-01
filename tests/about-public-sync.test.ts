import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/app/[locale]/about/page.tsx", "utf8");

describe("About follows Console public-course state", () => {
  it("uses the public resolver for counts and capability rows", () => {
    expect(source).toContain("getPublicCourses()");
    expect(source).toContain("String(publicCourses.length)");
    expect(source).toContain("publicCourses.map");
    expect(source).not.toContain("coursesByFamily.map");
  });

  it("uses the owner-confirmed 11 PM close instead of the stale 10:30 value", () => {
    expect(source).toContain('value: "11:00"');
    expect(source).not.toContain("10:30");
  });
});
