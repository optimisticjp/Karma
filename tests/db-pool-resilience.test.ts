import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/lib/db/index.ts", "utf8");

describe("Cloudflare Postgres pool resilience", () => {
  it("consumes pg background error events instead of letting EventEmitter crash the Worker", () => {
    expect(source).toContain('pool.on("error"');
    expect(source).toContain("client discarded");
  });

  it("bounds connection establishment instead of hanging a request indefinitely", () => {
    expect(source).toContain("connectionTimeoutMillis: 5_000");
  });

  it("does not log the resolved connection string from the pool error listener", () => {
    const start = source.indexOf('pool.on("error"');
    const end = source.indexOf("return drizzle", start);
    const listener = source.slice(start, end);
    expect(listener).not.toContain("resolved.connectionString");
  });
});
