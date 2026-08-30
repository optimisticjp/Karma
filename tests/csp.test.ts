import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

/**
 * The Content-Security-Policy is a security control, and connect-src is the
 * directive that decides where the browser may send data. The Karma Console's
 * Supabase Auth client calls /auth/v1/user and /auth/v1/factors from the page,
 * so that origin has to be allowed — but only that origin.
 *
 * These read the real header the config emits, not a copy of the string.
 */

const SUPABASE_ORIGIN = "https://zauklynwqdjlgqdpwczy.supabase.co";

async function csp(): Promise<string> {
  const groups = await nextConfig.headers!();
  const all = groups.flatMap((group) => group.headers);
  const header = all.find((h) => h.key === "Content-Security-Policy");
  expect(header, "the CSP header must be present").toBeDefined();
  return header!.value;
}

function directive(policy: string, name: string): string[] {
  const found = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
  expect(found, `${name} must be present in the CSP`).toBeDefined();
  return found!.split(/\s+/).slice(1);
}

describe("content security policy", () => {
  it("lets the browser reach Supabase Auth", async () => {
    // Without this the console cannot sign in at all: Chrome blocks the
    // browser auth client's calls to /auth/v1/* on connect-src.
    expect(directive(await csp(), "connect-src")).toContain(SUPABASE_ORIGIN);
  });

  it("allow-lists connect-src by exact origin, never a wildcard", async () => {
    const policy = await csp();
    // A wildcard would permit XHR to every Supabase project on the internet,
    // which turns a CSP into an exfiltration path. There is exactly one
    // project, so it is named.
    expect(policy).not.toContain("*.supabase.co");
    expect(policy).not.toContain("https://*");

    expect(directive(policy, "connect-src")).toEqual([
      "'self'",
      "https://challenges.cloudflare.com",
      SUPABASE_ORIGIN
    ]);
  });

  it("keeps every other directive exactly as it was", async () => {
    const policy = await csp();
    // Widening connect-src must not have loosened anything around it.
    expect(directive(policy, "default-src")).toEqual(["'self'"]);
    expect(directive(policy, "frame-src")).toEqual(["https://challenges.cloudflare.com"]);
    expect(directive(policy, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(policy, "base-uri")).toEqual(["'self'"]);
    expect(directive(policy, "form-action")).toEqual(["'self'"]);
  });

  it("never permits eval, and keeps object/script sources closed", async () => {
    const policy = await csp();
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toContain("'unsafe-hashes'");
    // 'unsafe-inline' is still required for script-src/style-src by Next's
    // inline bootstrap; it must not spread to any other directive.
    expect(policy.match(/'unsafe-inline'/g)).toHaveLength(2);
    expect(directive(policy, "script-src")).toContain("'unsafe-inline'");
    expect(directive(policy, "style-src")).toContain("'unsafe-inline'");
  });

  it("still sends the other hardening headers", async () => {
    const groups = await nextConfig.headers!();
    const keys = groups.flatMap((group) => group.headers).map((h) => h.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Strict-Transport-Security",
        "Content-Security-Policy"
      ])
    );
  });
});
