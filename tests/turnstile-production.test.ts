import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const verifier = readFileSync("src/lib/turnstile.ts", "utf8");
const widget = readFileSync("src/components/forms/TurnstileWidget.tsx", "utf8");
const configRoute = readFileSync("src/app/api/turnstile/config/route.ts", "utf8");
const wrangler = readFileSync("wrangler.jsonc", "utf8");

describe("production Turnstile wiring", () => {
  it("validates token length, action, hostname and bounds Siteverify", () => {
    expect(verifier).toContain("token.length > 2_048");
    expect(verifier).toContain('data.action === "public_form"');
    expect(verifier).toContain("hostnames.has(hostname)");
    expect(verifier).toContain("AbortSignal.timeout(10_000)");
  });

  it("loads the public site key at runtime and clears expired/error tokens", () => {
    expect(widget).toContain('fetch("/api/turnstile/config"');
    expect(widget).toContain('action: "public_form"');
    expect(widget).toContain('"expired-callback": () => onToken("")');
    expect(widget).toContain('"error-callback": () => onToken("")');
  });

  it("never exposes the Turnstile secret from the public config endpoint", () => {
    expect(configRoute).toContain("TURNSTILE_SITE_KEY");
    expect(configRoute).not.toContain("TURNSTILE_SECRET_KEY");
  });

  it("pins the current production hostname for Siteverify checks", () => {
    expect(wrangler).toContain(
      '"TURNSTILE_HOSTNAMES": "karma-design-studio.essanciaonline.workers.dev"'
    );
  });
});
