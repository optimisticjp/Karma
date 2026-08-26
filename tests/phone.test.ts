import { describe, expect, it } from "vitest";
import { cleanIndianMobile, isIndianMobile } from "@/lib/phone";

describe("Indian mobile normalization", () => {
  it("strips spaces, dashes and +91", () => {
    expect(cleanIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(cleanIndianMobile("91-9876543210")).toBe("9876543210");
    expect(cleanIndianMobile("98765-43210")).toBe("9876543210");
  });
  it("keeps a bare 10-digit number", () => {
    expect(cleanIndianMobile("9876543210")).toBe("9876543210");
  });
  it("validates the 6-9 leading digit rule", () => {
    expect(isIndianMobile("+91 98765 43210")).toBe(true);
    expect(isIndianMobile("1234567890")).toBe(false);
    expect(isIndianMobile("98765")).toBe(false);
  });
});
