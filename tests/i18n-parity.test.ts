import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import gu from "../messages/gu.json";

/** Bilingual parity is a hard rule (CLAUDE.md #1): structures must mirror. */
function compareShape(a: unknown, b: unknown, path: string, problems: string[]) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) problems.push(`${path}: array/non-array mismatch`);
    else if (a.length !== b.length) problems.push(`${path}: array length ${a.length} vs ${b.length}`);
    return;
  }
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    const missingInB = ka.filter((k) => !kb.includes(k));
    const missingInA = kb.filter((k) => !ka.includes(k));
    for (const k of missingInB) problems.push(`${path}.${k}: missing in gu`);
    for (const k of missingInA) problems.push(`${path}.${k}: missing in en`);
    for (const k of ka.filter((k) => kb.includes(k))) {
      compareShape(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
        `${path}.${k}`,
        problems
      );
    }
    return;
  }
  if (typeof a !== typeof b) problems.push(`${path}: type ${typeof a} vs ${typeof b}`);
}

describe("message catalogs", () => {
  it("en and gu mirror each other key-for-key", () => {
    const problems: string[] = [];
    compareShape(en, gu, "messages", problems);
    expect(problems).toEqual([]);
  });
});
