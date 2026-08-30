import { describe, expect, it } from "vitest";
import { studioSchema } from "../src/lib/schema";

describe("opening-hours schema fact discipline", () => {
  it("does not publish day-by-day business hours before owner confirmation", () => {
    const studio = studioSchema("en") as Record<string, unknown>;

    expect(studio).not.toHaveProperty("openingHoursSpecification");
    expect(JSON.stringify(studio)).not.toContain("OpeningHoursSpecification");
    expect(JSON.stringify(studio)).not.toContain('"closes":"22:30"');
  });
});
