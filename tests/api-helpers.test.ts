import { describe, expect, it } from "vitest";
import { escapeHtml, rateLimit } from "@/lib/api";

describe("escapeHtml", () => {
  it("neutralises script and attribute injection", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
    expect(escapeHtml(null)).toBe("");
  });
});

describe("rateLimit (best-effort, per-isolate)", () => {
  it("allows up to the limit then blocks within the window", () => {
    const key = `t:${Math.random()}`;
    expect(rateLimit(key, 2, 60000)).toBe(true);
    expect(rateLimit(key, 2, 60000)).toBe(true);
    expect(rateLimit(key, 2, 60000)).toBe(false);
  });
});
