import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/app/[locale]/verify/[id]/page.tsx", "utf8");

describe("public certificate revocation verdict", () => {
  it("does not treat a revoked record as a valid certificate", () => {
    expect(source).toContain('const revoked = cert?.status === "revoked"');
    expect(source).toContain('cert && !revoked ? "ok" : "bad"');
  });

  it("uses revoked copy without the Verified check state", () => {
    expect(source).toContain('revoked\n        ? t("revoked")');
    expect(source).toContain('state === "ok" ? "check" : "misregistration"');
  });
});
