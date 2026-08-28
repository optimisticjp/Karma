import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import gu from "../messages/gu.json";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATE_KEYS
} from "@/lib/auth/permissions";

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

/**
 * Console copy lives in the same catalogs under `admin`, so the parity test
 * above already covers it. These add the console-specific rule: every
 * permission key, group and template the code can render must have a label in
 * BOTH languages, or the UI shows a raw key like "applications.manage".
 */
describe("Karma Console messages", () => {
  const catalogs = { en, gu } as const;

  it("labels every permission key in both languages", () => {
    for (const [locale, messages] of Object.entries(catalogs)) {
      const keys = messages.admin.permissions.keys as Record<string, string>;
      for (const permission of PERMISSIONS) {
        expect(keys[permission], `${locale}: ${permission}`).toBeTruthy();
      }
      // No stale labels for permissions that no longer exist.
      expect(Object.keys(keys).sort()).toEqual([...PERMISSIONS].sort());
    }
  });

  it("labels every permission group in both languages", () => {
    for (const [locale, messages] of Object.entries(catalogs)) {
      const groups = messages.admin.permissions.groups as Record<string, string>;
      for (const group of PERMISSION_GROUPS) {
        expect(groups[group.key], `${locale}: ${group.key}`).toBeTruthy();
      }
    }
  });

  it("labels every permission template in both languages", () => {
    for (const [locale, messages] of Object.entries(catalogs)) {
      const templates = messages.admin.team.templates as Record<string, string>;
      for (const key of PERMISSION_TEMPLATE_KEYS) {
        expect(templates[key], `${locale}: ${key}`).toBeTruthy();
      }
    }
  });

  it("never uppercases or letterspaces the Gujarati console copy", () => {
    // Gujarati is a first-class language here, not a translated afterthought:
    // a Gujarati string must never be a Latin string left untranslated.
    const skip = new Set(["brand", "studio", "login.title"]);
    const walk = (node: unknown, path: string) => {
      if (typeof node === "string") {
        if (skip.has(path)) return;
        // ALL-CAPS Latin is the tell-tale of copy that was styled, not written.
        expect(node, path).not.toMatch(/^[A-Z][A-Z\s]{3,}$/);
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          walk(v, path ? `${path}.${k}` : k);
        }
      }
    };
    walk(gu.admin, "");
  });
});
