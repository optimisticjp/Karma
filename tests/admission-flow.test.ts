import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateDirectAdmission, validateStudentInput } from "@/lib/admin/students";
import { validateManualEnquiry } from "@/lib/admin/admissions";
import { timingForSchedule } from "@/lib/course/config";
import { EMCAD_DAHAO } from "@/content/course-operations";

const read = (p: string) => readFileSync(p, "utf8");

const student = {
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

/* ------------------------ the guardian requirement ------------------------ */

describe("a parent/guardian contact on every formal admission", () => {
  it("requires a guardian mobile on a direct admission", () => {
    expect(validateDirectAdmission({ ...student, guardianPhone: "" }).ok).toBe(false);
    expect(validateDirectAdmission({ ...student, guardianPhone: "not a phone" }).ok).toBe(false);
    expect(validateDirectAdmission(student).ok).toBe(true);
  });

  it("normalises the guardian mobile the same way as the student's own", () => {
    const result = validateDirectAdmission({ ...student, guardianPhone: "+91 98765 43211" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.guardianPhone).toBe("9876543211");
  });

  it("refuses a guardian number that is just the student's number again", () => {
    expect(validateDirectAdmission({ ...student, guardianPhone: "9876543210" }).ok).toBe(false);
  });

  it("does NOT block editing a student admitted before the rule existed", () => {
    /**
     * Deliberate asymmetry. The rule bites where the commitment is made — a
     * formal admission — not on the edit form, which also has to be able to
     * correct a typo on a record created in 2026 with one number on it. A
     * validator that refuses to save an old record is a validator that stops
     * staff fixing it.
     */
    const person: Record<string, unknown> = { ...student };
    delete person.batchId;
    delete person.joinedOn;
    expect(validateStudentInput({ ...person, guardianPhone: "" }).ok).toBe(true);
  });

  it("keeps a staff-entered enquiry savable without one, but stores it when given", () => {
    /**
     * A member of staff is writing down a call that is happening now. Refusing
     * to save the lead because the caller has not given a second number yet
     * would lose the lead, which is the opposite of what the rule is for.
     */
    const enquiry = {
      fullName: "Caller",
      whatsapp: "9876543210",
      heardFrom: "phone",
      locale: "gu",
      ageBand: "26-40"
    };
    expect(validateManualEnquiry(enquiry).ok).toBe(true);

    // …and when staff DO have it, it is kept regardless of age. It used to be
    // discarded unless the caller was under 18.
    const withGuardian = validateManualEnquiry({
      ...enquiry,
      guardianName: "Parent",
      guardianPhone: "9876543211"
    });
    expect(withGuardian.ok).toBe(true);
    if (withGuardian.ok) {
      expect(withGuardian.value.guardianPhone).toBe("9876543211");
      expect(withGuardian.value.guardianName).toBe("Parent");
    }
  });

  it("still requires guardian details for a minor enquiry", () => {
    expect(
      validateManualEnquiry({
        fullName: "Young Caller",
        whatsapp: "9876543210",
        heardFrom: "walk_in",
        ageBand: "under18"
      }).ok
    ).toBe(false);
  });
});

/* ------------------------------- reference -------------------------------- */

describe("reference details", () => {
  it("are optional — nobody is asked to invent one", () => {
    expect(validateDirectAdmission({ ...student, referenceName: "", referencePhone: "" }).ok).toBe(true);
  });

  it("are validated when supplied", () => {
    expect(validateDirectAdmission({ ...student, referencePhone: "9876543212" }).ok).toBe(true);
    expect(validateDirectAdmission({ ...student, referencePhone: "123" }).ok).toBe(false);
  });
});

/* --------------------------- schedule and demo ---------------------------- */

describe("the timetable the form offers is the timetable the route accepts", () => {
  const formSource = read("src/components/forms/AdmissionForm.tsx");
  const pageSource = read("src/app/[locale]/admission/page.tsx");
  const routeSource = read("src/app/api/admission/route.ts");

  it("resolves both sides through the same function", () => {
    // If these ever come from different places, the form will offer a slot the
    // route rejects, or the studio will receive a request for a batch it does
    // not run.
    expect(pageSource).toContain("getPublicCourseConfigs()");
    expect(routeSource).toContain("getCourseConfig(d.courseSlug)");
    expect(routeSource).toContain("scheduleOptionFor(config, d.preferredSchedule)");
    expect(routeSource).toContain("demoSlotFor(config, d.demoSlot)");
  });

  it("rejects a slot key the course does not offer", () => {
    expect(routeSource).toContain('if (d.preferredSchedule && !schedule) return apiError("validation", 400, requestId);');
    expect(routeSource).toContain('if (d.demoSlot && !demo) return apiError("validation", 400, requestId);');
  });

  it("derives the legacy morning/evening field instead of asking twice", () => {
    const [day, midday, evening, night] = EMCAD_DAHAO.operations.scheduleOptions;
    expect(timingForSchedule(day)).toBe("morning");
    expect(timingForSchedule(midday)).toBe("morning");
    expect(timingForSchedule(evening)).toBe("evening");
    expect(timingForSchedule(night)).toBe("evening");
    expect(timingForSchedule(null)).toBeNull();
    expect(formSource).toContain("timingFor(data.preferredSchedule)");
  });

  it("clears a chosen slot when the course changes", () => {
    // A slot key belongs to one course; carrying it across would submit a key
    // the new course does not have.
    expect(formSource).toContain("preferredSchedule: \"\",");
    expect(formSource).toContain("demoSlot: \"\"");
  });

  it("presents the free demo as a preference, never as a booking", () => {
    expect(formSource).toContain("demoSlotHint");
    // No capacity, no seat count, no confirmation language anywhere near it.
    for (const banned of ["seatsLeft", "bookDemo", "reserveSlot"]) {
      expect(formSource, banned).not.toContain(banned);
    }
  });
});

/* --------------------------- terms acceptance ----------------------------- */

describe("admission norms acceptance", () => {
  const formSource = read("src/components/forms/AdmissionForm.tsx");
  const routeSource = read("src/app/api/admission/route.ts");
  const pageSource = read("src/app/[locale]/admission/page.tsx");

  it("is a separate acceptance from the privacy and contact consents", () => {
    expect(formSource).toContain('id="adm-terms"');
    expect(formSource).toContain("consents.terms");
    expect(formSource).toContain('errors.terms');
  });

  it("records the version accepted, and the time it was accepted", () => {
    expect(routeSource).toContain("termsVersion: d.termsVersion");
    expect(routeSource).toContain("termsAcceptedAt: now");
  });

  it("refuses a version this build does not know", () => {
    // Consent to text nobody can produce afterwards is worse than no consent.
    expect(routeSource).toContain("if (!isKnownTermsVersion(d.termsVersion))");
    expect(routeSource).toContain("if (config.termsVersion !== d.termsVersion)");
  });

  it("keeps the full norms out of the client bundle", () => {
    // Fifteen clauses in two languages is not a checkbox. They render on the
    // page as a server component; the form links to them.
    expect(pageSource).toContain("<AdmissionNorms");
    expect(formSource).not.toContain("ADMISSION_TERMS");
    expect(formSource).toContain("normsHref");
  });
});

/* ------------------- the agreement snapshot on joining -------------------- */

describe("the commercial agreement is snapshotted onto the enrolment", () => {
  const actions = read("src/app/admin/(console)/students/actions.ts");
  const feeActions = read("src/app/admin/(console)/fees/actions.ts");

  it("is captured on every path that creates an enrolment", () => {
    // Direct admission, enquiry conversion, and an additional enrolment.
    const captures = actions.split("agreementForBatch(tx,").length - 1;
    expect(captures).toBe(3);
    const inserts = actions.split("insert(schema.enrollments)").length - 1;
    expect(inserts).toBe(3);
    expect(actions.split("...agreement }").length - 1).toBe(3);
  });

  it("audits what was agreed, in the same transaction", () => {
    expect(actions.split("agreementAuditValues(agreement)").length - 1).toBe(3);
  });

  it("can only be changed deliberately, with a reason, and is audited", () => {
    expect(feeActions).toContain('authorizeAction({ permission: "fees.manage" })');
    expect(feeActions).toContain("FEE_AUDIT_ACTIONS.agreementUpdated");
    expect(feeActions).toContain("oldValue: before[0]");
    // A reason is mandatory in the validator, not merely encouraged.
    expect(read("src/lib/admin/fees.ts")).toContain("if (!enrollmentId || !reason || reason.length < 3) return { ok: false };");
  });

  it("refuses to set an agreed total below money already received", () => {
    expect(feeActions).toContain('if (d.agreedFeeTotal != null && d.agreedFeeTotal < received) return fail("belowReceived");');
  });
});

/* ------------------------- still no way to pay ---------------------------- */

describe("the admission flow takes no money", () => {
  it("names no payment provider and offers no checkout", () => {
    const sources = [
      "src/components/forms/AdmissionForm.tsx",
      "src/app/api/admission/route.ts",
      "src/app/[locale]/admission/page.tsx",
      "src/app/admin/(console)/fees/actions.ts"
    ]
      .map(read)
      .join("\n")
      .toLowerCase();
    for (const banned of ["razorpay", "stripe", "payu", "cashfree", "paytm", "upi://", "pay now"]) {
      expect(sources, banned).not.toContain(banned);
    }
  });
});
