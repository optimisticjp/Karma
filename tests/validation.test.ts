import { describe, expect, it } from "vitest";
import { admissionSchema, briefSchema } from "@/lib/validation";

const base = {
  locale: "gu",
  fullName: "Test Student",
  whatsapp: "+91 98765 43210",
  email: "",
  courseSlug: "tufting",
  preferredTiming: "evening",
  ageBand: "18-25",
  guardianName: "",
  guardianPhone: "",
  occupation: "student",
  experience: "beginner",
  area: "Mota Varachha",
  heardFrom: "",
  goal: "",
  privacy: true,
  comms: true,
  utmSource: "",
  utmCampaign: "",
  startedAt: Date.now() - 20000,
  website: ""
};

describe("admissionSchema", () => {
  it("accepts a valid application and normalizes the phone", () => {
    const r = admissionSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.whatsapp).toBe("9876543210");
  });
  it("treats attribution (heardFrom) as optional", () => {
    expect(admissionSchema.safeParse({ ...base, heardFrom: "" }).success).toBe(true);
  });
  it("requires guardian details for minors", () => {
    expect(admissionSchema.safeParse({ ...base, ageBand: "under18" }).success).toBe(false);
    expect(
      admissionSchema.safeParse({
        ...base,
        ageBand: "under18",
        guardianName: "Parent Name",
        guardianPhone: "9876543211"
      }).success
    ).toBe(true);
  });
  it("rejects invalid mobiles and missing consent", () => {
    expect(admissionSchema.safeParse({ ...base, whatsapp: "12345" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...base, privacy: false }).success).toBe(false);
  });
});

describe("briefSchema deadlines", () => {
  const brief = {
    locale: "en",
    name: "Boutique",
    phone: "9876543210",
    startedAt: String(Date.now() - 10000)
  };
  it("accepts empty or future dates", () => {
    expect(briefSchema.safeParse({ ...brief, deadline: "" }).success).toBe(true);
    const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    expect(briefSchema.safeParse({ ...brief, deadline: future }).success).toBe(true);
  });
  it("rejects past and malformed dates", () => {
    expect(briefSchema.safeParse({ ...brief, deadline: "2020-01-01" }).success).toBe(false);
    expect(briefSchema.safeParse({ ...brief, deadline: "not-a-date" }).success).toBe(false);
  });
});
