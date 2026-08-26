import { describe, expect, it } from "vitest";
import { hasValidSignature } from "@/lib/files";

const make = (name: string, bytes: number[]) =>
  new File([new Uint8Array(bytes)], name);

describe("upload signature validation", () => {
  it("accepts a real PNG header", async () => {
    expect(
      await hasValidSignature(make("design.png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ).toBe(true);
  });
  it("rejects a renamed file (JPG bytes as .png)", async () => {
    expect(await hasValidSignature(make("fake.png", [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]))).toBe(
      false
    );
  });
  it("accepts modern .ai files that are PDF-compatible", async () => {
    expect(
      await hasValidSignature(make("art.ai", [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]))
    ).toBe(true);
  });
  it("rejects unknown extensions outright", async () => {
    expect(await hasValidSignature(make("run.exe", [0x4d, 0x5a, 0, 0, 0, 0, 0, 0]))).toBe(false);
  });
});
