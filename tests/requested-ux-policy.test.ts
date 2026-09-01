import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("owner-requested catalogue policy", () => {
  it("gives Console-created public courses conservative fallback content", () => {
    const source = read("src/lib/course/public.ts");
    expect(source).toContain("function consoleOnlyCourse");
    expect(source).toContain("modules: []");
    expect(source).toContain("outcomesEn: []");
    expect(source).toContain("outputsEn: []");
  });

  it("does not filter Book Demo choices back to source-controlled slugs", () => {
    const config = read("src/lib/course/config.ts");
    expect(config).toContain("return rows.map(fromDatabase)");
    expect(config).not.toContain("catalogue.has(row.slug)");
  });
});
