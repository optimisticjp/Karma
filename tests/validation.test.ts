import { describe, expect, it } from "vitest";
import { admissionSchema, briefSchema } from "@/lib/validation";

const base = {
  locale: "gu",
  fullName: "Test Student",
  whatsapp: "+91 98765 43210",
  email: "",
  courseSlug: "tufting",
  preferredTiming: "evening",
  preferredSchedule: "",
  demoSlot: "",
  ageBand: "18-25",
  fatherName: "",
  guardianName: "",
  /* Required of EVERY applicant since 2026-08-30, not only under-18s. */
  guardianPhone: "9876543211",
  referenceName: "",
  referencePhone: "",
  occupation: "student",
  experience: "beginner",
  area: "Mota Varachha",
  heardFrom: "",
  goal: "",
  privacy: true,
  comms: true,
  terms: true,
  termsVersion: 1,
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
  it("requires a parent/guardian mobile from EVERY applicant, not only minors", () => {
    /**
     * Owner decision, 2026-08-30. Before it, an adult applicant could submit
     * with no second contact at all, and the studio had one number for a
     * three-month course.
     */
    expect(admissionSchema.safeParse({ ...base, guardianPhone: "" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...base, guardianPhone: "12345" }).success).toBe(false);
    const ok = admissionSchema.safeParse({ ...base, guardianPhone: "+91 98765 43211" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.guardianPhone).toBe("9876543211");
  });

  it("rejects a guardian number that is just the applicant's own number again", () => {
    // Two identical numbers is one contact wearing a hat, and the front desk
    // finds out by wasting a call.
    expect(
      admissionSchema.safeParse({ ...base, guardianPhone: "9876543210" }).success
    ).toBe(false);
  });

  it("still requires a guardian NAME for minors", () => {
    expect(admissionSchema.safeParse({ ...base, ageBand: "under18" }).success).toBe(false);
    expect(
      admissionSchema.safeParse({
        ...base,
        ageBand: "under18",
        guardianName: "Parent Name"
      }).success
    ).toBe(true);
  });

  it("requires acceptance of the admission norms, with a version", () => {
    expect(admissionSchema.safeParse({ ...base, terms: false }).success).toBe(false);
    const withoutVersion: Record<string, unknown> = { ...base };
    delete withoutVersion.termsVersion;
    expect(admissionSchema.safeParse(withoutVersion).success).toBe(false);
  });

  it("accepts optional reference details, and rejects a malformed reference mobile", () => {
    // Nobody is asked to invent a reference.
    expect(admissionSchema.safeParse({ ...base, referenceName: "", referencePhone: "" }).success).toBe(true);
    expect(admissionSchema.safeParse({ ...base, referencePhone: "9876543212" }).success).toBe(true);
    expect(admissionSchema.safeParse({ ...base, referencePhone: "123" }).success).toBe(false);
  });

  it("accepts only well-formed slot keys, leaving the real check to the route", () => {
    // The route validates the key against THAT COURSE'S own options; this only
    // rejects a shape that could never be one.
    expect(admissionSchema.safeParse({ ...base, preferredSchedule: "morning-0800" }).success).toBe(true);
    expect(admissionSchema.safeParse({ ...base, demoSlot: "demo-1000" }).success).toBe(true);
    expect(admissionSchema.safeParse({ ...base, preferredSchedule: "Morning 0800" }).success).toBe(false);
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
