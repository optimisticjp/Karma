import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const briefForm = readFileSync("src/components/forms/BriefForm.tsx", "utf8");

// R2 is intentionally deferred. The public form must never imply that private
// in-form file upload is already available while the file input is absent.
describe("brief form deferred upload copy", () => {
  it("keeps the localized workflow message and corrects the stale English clause", () => {
    expect(briefForm).toContain('t("form.filesDeferred")');
    expect(briefForm).toContain(
      "Private in-form upload will be enabled only after secure private storage is connected."
    );
  });

  it("keeps Turnstile on the brief form and refreshes a stale challenge safely", () => {
    expect(briefForm).toContain('<div key={challengeVersion}>');
    expect(briefForm).toContain('<TurnstileWidget onToken={setToken} />');
    expect(briefForm).toContain('fd.get("turnstileToken")');
    expect(briefForm).toContain('fd.set("turnstileToken", challengeToken)');
    expect(briefForm).toContain("setChallengeVersion((v) => v + 1)");
    expect(briefForm).toContain("setToken(undefined)");
  });
});
