import { cleanIndianMobile, isIndianMobile } from "@/lib/phone";

export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "demo_scheduled",
  "visit_done",
  "accepted",
  "waitlisted",
  "documents_pending",
  "enrolled",
  "not_proceeding",
  "closed"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const MANUAL_ENQUIRY_SOURCES = [
  "walk_in",
  "phone",
  "whatsapp",
  "referral",
  "instagram",
  "google",
  "other"
] as const;
export type ManualEnquirySource = (typeof MANUAL_ENQUIRY_SOURCES)[number];

const STATUS_SET: ReadonlySet<string> = new Set(APPLICATION_STATUSES);
const SOURCE_SET: ReadonlySet<string> = new Set(MANUAL_ENQUIRY_SOURCES);

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && STATUS_SET.has(value);
}

export type ApplicationUpdateInput = {
  status: ApplicationStatus;
  assignedTo: number | null;
  nextFollowUp: string | null;
  closureReason: string | null;
};

function optionalPositiveId(value: unknown): number | null | undefined {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function optionalDate(value: unknown): string | null | undefined {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : value;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalText(value: unknown, max: number): string | null {
  return cleanText(value, max) || null;
}

export function validateApplicationUpdate(input: {
  status: unknown;
  assignedTo: unknown;
  nextFollowUp: unknown;
  closureReason: unknown;
}): { ok: true; value: ApplicationUpdateInput } | { ok: false } {
  if (!isApplicationStatus(input.status)) return { ok: false };
  const assignedTo = optionalPositiveId(input.assignedTo);
  const nextFollowUp = optionalDate(input.nextFollowUp);

  let closureReason: string | null = null;
  if (input.closureReason != null && input.closureReason !== "") {
    if (typeof input.closureReason !== "string") return { ok: false };
    const clean = input.closureReason.trim();
    if (!clean || clean.length > 200) return { ok: false };
    closureReason = clean;
  }

  if (input.status !== "closed" && input.status !== "not_proceeding") {
    closureReason = null;
  }

  return {
    ok: true,
    value: { status: input.status, assignedTo, nextFollowUp, closureReason }
  };
}

export type ManualEnquiryInput = {
  fullName: string;
  whatsapp: string;
  email: string | null;
  locale: "en" | "gu";
  courseSlug: string | null;
  preferredTiming: string | null;
  area: string | null;
  goal: string | null;
  heardFrom: ManualEnquirySource;
  ageBand: string | null;
  fatherName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  referenceName: string | null;
  referencePhone: string | null;
  assignedTo: number | null;
  nextFollowUp: string | null;
};

export type ManualEnquiryField =
  | "fullName"
  | "whatsapp"
  | "email"
  | "heardFrom"
  | "guardianName"
  | "guardianPhone"
  | "referencePhone"
  | "assignedTo"
  | "nextFollowUp";

export function manualEnquiryInvalidFields(input: Record<string, unknown>): ManualEnquiryField[] {
  const invalid = new Set<ManualEnquiryField>();
  const fullName = cleanText(input.fullName, 160);
  const whatsapp = cleanIndianMobile(cleanText(input.whatsapp, 30));
  const email = optionalText(input.email, 160)?.toLowerCase() ?? null;
  const ageBand = optionalText(input.ageBand, 20);
  const guardianName = optionalText(input.guardianName, 160);
  const rawGuardianPhone = optionalText(input.guardianPhone, 30);
  const guardianPhone = rawGuardianPhone ? cleanIndianMobile(rawGuardianPhone) : null;
  const rawReferencePhone = optionalText(input.referencePhone, 30);
  const referencePhone = rawReferencePhone ? cleanIndianMobile(rawReferencePhone) : null;
  const assignedTo = optionalPositiveId(input.assignedTo);
  const nextFollowUp = optionalDate(input.nextFollowUp);
  const heardFrom = input.heardFrom;

  if (fullName.length < 2) invalid.add("fullName");
  if (!isIndianMobile(whatsapp)) invalid.add("whatsapp");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid.add("email");
  if (assignedTo === undefined) invalid.add("assignedTo");
  if (nextFollowUp === undefined) invalid.add("nextFollowUp");
  if (typeof heardFrom !== "string" || !SOURCE_SET.has(heardFrom)) invalid.add("heardFrom");
  if (guardianPhone && !isIndianMobile(guardianPhone)) invalid.add("guardianPhone");
  if (referencePhone && !isIndianMobile(referencePhone)) invalid.add("referencePhone");
  if (ageBand === "under18" && !guardianName) invalid.add("guardianName");
  if (ageBand === "under18" && !guardianPhone) invalid.add("guardianPhone");
  return [...invalid];
}

export function validateManualEnquiry(input: Record<string, unknown>):
  | { ok: true; value: ManualEnquiryInput }
  | { ok: false; invalidFields: ManualEnquiryField[] } {
  const invalidFields = manualEnquiryInvalidFields(input);
  if (invalidFields.length > 0) return { ok: false, invalidFields };

  const fullName = cleanText(input.fullName, 160);
  const whatsapp = cleanIndianMobile(cleanText(input.whatsapp, 30));
  const email = optionalText(input.email, 160)?.toLowerCase() ?? null;
  const courseSlug = optionalText(input.courseSlug, 80);
  const preferredTiming = optionalText(input.preferredTiming, 20);
  const area = optionalText(input.area, 160);
  const goal = optionalText(input.goal, 2000);
  const ageBand = optionalText(input.ageBand, 20);
  const fatherName = optionalText(input.fatherName, 160);
  const guardianName = optionalText(input.guardianName, 160);
  const rawGuardianPhone = optionalText(input.guardianPhone, 30);
  const guardianPhone = rawGuardianPhone ? cleanIndianMobile(rawGuardianPhone) : null;
  const referenceName = optionalText(input.referenceName, 160);
  const rawReferencePhone = optionalText(input.referencePhone, 30);
  const referencePhone = rawReferencePhone ? cleanIndianMobile(rawReferencePhone) : null;
  const assignedTo = optionalPositiveId(input.assignedTo);
  const nextFollowUp = optionalDate(input.nextFollowUp);
  const heardFrom = input.heardFrom;

  if (assignedTo === undefined || nextFollowUp === undefined) return { ok: false };

  return {
    ok: true,
    value: {
      fullName,
      whatsapp,
      email,
      locale: input.locale === "en" ? "en" : "gu",
      courseSlug,
      preferredTiming,
      area,
      goal,
      heardFrom: heardFrom as ManualEnquirySource,
      ageBand,
      fatherName,
      /**
       * A staff-entered enquiry KEEPS whatever guardian details staff have,
       * regardless of age — the previous code discarded them unless the caller
       * was under 18, so a parent's number given on the phone was thrown away.
       *
       * It is not *required* here, unlike the public form and a formal
       * admission. This surface is a member of staff writing down a call that
       * is happening right now; refusing to save a lead because the caller has
       * not yet given a second number would lose the lead, which is the exact
       * opposite of what the rule is for. The requirement bites where the
       * commitment is made — see `validateDirectAdmission`.
       */
      guardianName,
      guardianPhone,
      referenceName,
      referencePhone,
      assignedTo,
      nextFollowUp
    }
  };
}

export function validateApplicationNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= 1 && clean.length <= 2000 ? clean : null;
}

export function positiveApplicationId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
