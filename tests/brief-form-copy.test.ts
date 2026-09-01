import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const briefForm = readFileSync("src/components/forms/BriefForm.tsx", "utf8");

// R2 is intentionally deferred. The public form must never imply that private
// in-form file upload is already available while the file input is absent.
describe("brief form deferred upload copy", () => {
  it("states the current file workflow honestly in both public locales", () => {
    expect(briefForm).toContain("Private in-form upload is not enabled yet.");
    expect(briefForm).toContain("સિક્યોર પ્રાઇવેટ સ્ટોરેજ જોડાયા પછી જ ફોર્મમાં અપલોડ ચાલુ થશે.");
    expect(briefForm).not.toContain("Private in-form upload is switched on with secure storage.");
  });

  it("keeps Turnstile on the brief form", () => {
    expect(briefForm).toContain("<TurnstileWidget onToken={setToken} />");
    expect(briefForm).toContain('fd.set("turnstileToken", token)');
  });
});
