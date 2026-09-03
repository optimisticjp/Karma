import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { admissionSchema, briefSchema } from "@/lib/validation";
import { validateDirectAdmission } from "@/lib/admin/students";
import { validateManualEnquiry } from "@/lib/admin/admissions";

const read = (path: string) => readFileSync(path, "utf8");

const directAdmission = {
  fullName: "Test Student",
  phone: "9876543210",
  whatsapp: "",
  email: "",
  area: "Mota Varachha",
  languagePref: "gu",
  isMinor: "",
  photoConsent: "",
  notes: "",
  fatherName: "",
  guardianName: "",
  guardianPhone: "9876543211",
  guardianRelation: "",
  referenceName: "",
  referencePhone: "",
  batchId: "3",
  joinedOn: "2026-09-01"
};

describe("public admission acknowledgement integrity", () => {
  it("has no branch that returns a fake admission success", () => {
    const route = read("src/app/api/admission/route.ts");
    const form = read("src/components/forms/AdmissionForm.tsx");

    expect(route).not.toContain("KDS-RECEIVED");
    expect(route).not.toContain("Date.now() - d.startedAt");
    expect(form).not.toContain('id="adm-website"');
    expect(form).not.toContain("startedAt.current");
  });

  it("accepts a valid admission payload without anti-bot timing fields", () => {
    const result = admissionSchema.safeParse({
      locale: "gu",
      fullName: "Test Applicant",
      whatsapp: "9876543210",
      email: "",
      courseSlug: "graphic-design",
      preferredTiming: "morning",
      preferredSchedule: "",
      demoSlot: "",
      ageBand: "26-40",
      fatherName: "",
      guardianName: "",
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
      turnstileToken: "token",
      idempotencyKey: "550e8400-e29b-41d4-a716-446655440000"
    });
    expect(result.success).toBe(true);
  });
});

describe("design brief acknowledgement integrity", () => {
  it("does not silently discard fast or autofilled submissions", () => {
    const route = read("src/app/api/brief/route.ts");
    const form = read("src/components/forms/BriefForm.tsx");
    expect(route).not.toContain("KDS-B-RECEIVED");
    expect(route).not.toContain("Date.now() - d.startedAt");
    expect(form).not.toContain('name="website"');
    expect(form).not.toContain("startedAt.current");
  });

  it("accepts a normal brief payload without timing or honeypot fields", () => {
    expect(
      briefSchema.safeParse({
        locale: "en",
        name: "Test Client",
        company: "",
        phone: "9876543210",
        email: "",
        productType: "",
        technique: "",
        dimensions: "",
        quantity: "",
        colourCount: "",
        fileFormat: "",
        deadline: "",
        details: "",
        turnstileToken: "token"
      }).success
    ).toBe(true);
  });
});

describe("direct admission errors are recoverable", () => {
  it("returns the exact controls that failed server validation", () => {
    const missingGuardian = validateDirectAdmission({ ...directAdmission, guardianPhone: "" });
    expect(missingGuardian.ok).toBe(false);
    if (!missingGuardian.ok) expect(missingGuardian.invalidFields).toContain("guardianPhone");

    const sameGuardian = validateDirectAdmission({ ...directAdmission, guardianPhone: directAdmission.phone });
    expect(sameGuardian.ok).toBe(false);
    if (!sameGuardian.ok) expect(sameGuardian.invalidFields).toContain("guardianPhone");

    const missingBatch = validateDirectAdmission({ ...directAdmission, batchId: "" });
    expect(missingBatch.ok).toBe(false);
    if (!missingBatch.ok) expect(missingBatch.invalidFields).toContain("batchId");
  });

  it("preserves submitted values and highlights invalid controls", () => {
    const action = read("src/app/admin/(console)/students/actions.ts");
    const form = read("src/app/admin/(console)/students/StudentForms.tsx");

    expect(action).toContain("const submittedValues = formSnapshot(formData)");
    expect(action).toContain("values: submittedValues, invalidFields: parsed.invalidFields");
    expect(form).toContain("restoreSubmittedForm");
    expect(form).toContain('classList.add("input-error")');
    expect(form).toContain('setAttribute("aria-invalid", "true")');
  });
});

describe("manual enquiry errors are recoverable", () => {
  it("returns exact invalid controls", () => {
    const result = validateManualEnquiry({
      fullName: "A",
      whatsapp: "bad",
      email: "bad",
      heardFrom: "walk_in",
      locale: "gu",
      ageBand: "under18",
      guardianName: "",
      guardianPhone: ""
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalidFields).toContain("fullName");
      expect(result.invalidFields).toContain("whatsapp");
      expect(result.invalidFields).toContain("email");
      expect(result.invalidFields).toContain("guardianName");
      expect(result.invalidFields).toContain("guardianPhone");
    }
  });

  it("preserves staff-entered values after a failed save", () => {
    const action = read("src/app/admin/(console)/admissions/actions.ts");
    const form = read("src/app/admin/(console)/admissions/AdmissionForms.tsx");
    expect(action).toContain("const submittedValues = formSnapshot(formData)");
    expect(action).toContain("values: submittedValues, invalidFields: parsed.invalidFields");
    expect(form).toContain("restoreSubmittedForm");
    expect(form).toContain('setAttribute("aria-invalid", "true")');
  });
});
