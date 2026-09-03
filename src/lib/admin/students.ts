import { cleanIndianMobile, isIndianMobile } from "@/lib/phone";

export const ENROLLMENT_STATUSES = ["applied", "active", "completed", "dropped"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const STUDENT_LANGUAGES = ["gu", "en"] as const;
export type StudentLanguage = (typeof STUDENT_LANGUAGES)[number];

export function isEnrollmentStatus(value: unknown): value is EnrollmentStatus {
  return typeof value === "string" && ENROLLMENT_STATUSES.includes(value as EnrollmentStatus);
}

export function positiveId(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(String(value ?? ""));
  return Number.isInteger(n) && n > 0 ? n : null;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalText(value: unknown, max: number): string | null {
  const v = text(value, max);
  return v || null;
}

function email(value: unknown): string | null | "invalid" {
  const v = text(value, 160).toLowerCase();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : "invalid";
}

export type StudentInput = {
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  area: string | null;
  languagePref: StudentLanguage;
  isMinor: boolean;
  photoConsent: boolean;
  notes: string | null;
  /** From the institute's printed admission form. Distinct from a guardian. */
  fatherName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelation: string | null;
  /** Who referred this student. Optional: nobody invents one. */
  referenceName: string | null;
  referencePhone: string | null;
};

/**
 * Where the guardian rule bites, and where it deliberately does not.
 *
 * Owner decision (2026-08-30): a parent/guardian mobile is required on every
 * admission. `requireGuardian` turns that on for a FORMAL admission — the
 * direct-admission and conversion forms that produce a student record and a
 * printed sheet — and leaves it off for `validateStudentInput` used on its own,
 * because that also edits students admitted before the rule existed, and a
 * validator that refuses to save an old record is a validator that stops staff
 * correcting a typo.
 */
export type StudentValidationOptions = { requireGuardian?: boolean };

export function validateStudentInput(
  input: Record<string, unknown>,
  options: StudentValidationOptions = {}
): { ok: true; value: StudentInput } | { ok: false } {
  const fullName = text(input.fullName, 160);
  const rawPhone = text(input.phone, 30);
  const phone = cleanIndianMobile(rawPhone);
  const rawWhatsapp = text(input.whatsapp, 30);
  const whatsapp = rawWhatsapp ? cleanIndianMobile(rawWhatsapp) : null;
  const parsedEmail = email(input.email);
  const languagePref = input.languagePref === "en" ? "en" : "gu";
  const isMinor = input.isMinor === true || input.isMinor === "on" || input.isMinor === "true";
  const photoConsent =
    input.photoConsent === true || input.photoConsent === "on" || input.photoConsent === "true";
  const guardianName = optionalText(input.guardianName, 160);
  const rawGuardianPhone = text(input.guardianPhone, 30);
  const guardianPhone = rawGuardianPhone ? cleanIndianMobile(rawGuardianPhone) : null;
  const guardianRelation = optionalText(input.guardianRelation, 60);
  const fatherName = optionalText(input.fatherName, 160);
  const referenceName = optionalText(input.referenceName, 160);
  const rawReferencePhone = text(input.referencePhone, 30);
  const referencePhone = rawReferencePhone ? cleanIndianMobile(rawReferencePhone) : null;

  if (fullName.length < 2 || !isIndianMobile(phone) || parsedEmail === "invalid") return { ok: false };
  if (whatsapp && !isIndianMobile(whatsapp)) return { ok: false };
  if (isMinor && (!guardianName || !guardianPhone || !isIndianMobile(guardianPhone))) return { ok: false };
  if (guardianPhone && !isIndianMobile(guardianPhone)) return { ok: false };
  if (referencePhone && !isIndianMobile(referencePhone)) return { ok: false };
  if (options.requireGuardian && (!guardianPhone || !isIndianMobile(guardianPhone))) return { ok: false };
  /* A guardian number identical to the student's own is not a second contact. */
  if (guardianPhone && guardianPhone === phone) return { ok: false };

  return {
    ok: true,
    value: {
      fullName,
      phone,
      whatsapp,
      email: parsedEmail,
      area: optionalText(input.area, 160),
      languagePref,
      isMinor,
      photoConsent,
      notes: optionalText(input.notes, 2000),
      fatherName,
      guardianName,
      guardianPhone,
      guardianRelation,
      referenceName,
      referencePhone
    }
  };
}

export type DirectAdmissionInput = StudentInput & {
  batchId: number;
  joinedOn: string | null;
};

/**
 * A formal admission. The guardian mobile is required here (owner decision,
 * 2026-08-30): this is the path that produces a student record, an enrolment,
 * a fee agreement and a printed admission sheet.
 */
export type DirectAdmissionField =
  | "fullName"
  | "phone"
  | "whatsapp"
  | "email"
  | "guardianName"
  | "guardianPhone"
  | "referencePhone"
  | "batchId"
  | "joinedOn";

export function directAdmissionInvalidFields(input: Record<string, unknown>): DirectAdmissionField[] {
  const invalid = new Set<DirectAdmissionField>();
  const fullName = text(input.fullName, 160);
  const phone = cleanIndianMobile(text(input.phone, 30));
  const rawWhatsapp = text(input.whatsapp, 30);
  const whatsapp = rawWhatsapp ? cleanIndianMobile(rawWhatsapp) : null;
  const parsedEmail = email(input.email);
  const isMinor = input.isMinor === true || input.isMinor === "on" || input.isMinor === "true";
  const guardianName = optionalText(input.guardianName, 160);
  const rawGuardianPhone = text(input.guardianPhone, 30);
  const guardianPhone = rawGuardianPhone ? cleanIndianMobile(rawGuardianPhone) : null;
  const rawReferencePhone = text(input.referencePhone, 30);
  const referencePhone = rawReferencePhone ? cleanIndianMobile(rawReferencePhone) : null;

  if (fullName.length < 2) invalid.add("fullName");
  if (!isIndianMobile(phone)) invalid.add("phone");
  if (whatsapp && !isIndianMobile(whatsapp)) invalid.add("whatsapp");
  if (parsedEmail === "invalid") invalid.add("email");
  if (isMinor && !guardianName) invalid.add("guardianName");
  if (!guardianPhone || !isIndianMobile(guardianPhone)) invalid.add("guardianPhone");
  if (guardianPhone && isIndianMobile(guardianPhone) && isIndianMobile(phone) && guardianPhone === phone) invalid.add("guardianPhone");
  if (referencePhone && !isIndianMobile(referencePhone)) invalid.add("referencePhone");
  if (!positiveId(input.batchId)) invalid.add("batchId");
  if (optionalDate(input.joinedOn) === "invalid") invalid.add("joinedOn");
  return [...invalid];
}
export function validateDirectAdmission(input: Record<string, unknown>):
  | { ok: true; value: DirectAdmissionInput }
  | { ok: false; invalidFields: DirectAdmissionField[] } {
  const invalidFields = directAdmissionInvalidFields(input);
  if (invalidFields.length > 0) return { ok: false, invalidFields };

  const student = validateStudentInput(input, { requireGuardian: true });
  const batchId = positiveId(input.batchId);
  const joinedOn = optionalDate(input.joinedOn);
  if (!student.ok || !batchId || joinedOn === "invalid") return { ok: false, invalidFields: [] };
  return { ok: true, value: { ...student.value, batchId, joinedOn } };
}

export function validateApplicationConversion(input: Record<string, unknown>):
  | { ok: true; value: { applicationId: number; batchId: number; joinedOn: string | null } }
  | { ok: false } {
  const applicationId = positiveId(input.applicationId);
  const batchId = positiveId(input.batchId);
  const joinedOn = optionalDate(input.joinedOn);
  if (!applicationId || !batchId || joinedOn === "invalid") return { ok: false };
  return { ok: true, value: { applicationId, batchId, joinedOn } };
}

export function validateEnrollmentCreate(input: Record<string, unknown>):
  | { ok: true; value: { studentId: number; batchId: number; joinedOn: string | null } }
  | { ok: false } {
  const studentId = positiveId(input.studentId);
  const batchId = positiveId(input.batchId);
  const joinedOn = optionalDate(input.joinedOn);
  if (!studentId || !batchId || joinedOn === "invalid") return { ok: false };
  return { ok: true, value: { studentId, batchId, joinedOn } };
}

export function validateEnrollmentStatus(input: Record<string, unknown>):
  | { ok: true; value: { enrollmentId: number; status: EnrollmentStatus; completedOn: string | null } }
  | { ok: false } {
  const enrollmentId = positiveId(input.enrollmentId);
  const status = input.status;
  const completedOn = optionalDate(input.completedOn);
  if (!enrollmentId || !isEnrollmentStatus(status) || completedOn === "invalid") return { ok: false };
  if (status === "completed" && !completedOn) return { ok: false };
  return { ok: true, value: { enrollmentId, status, completedOn: status === "completed" ? completedOn : null } };
}

function optionalDate(value: unknown): string | null | "invalid" {
  const v = text(value, 10);
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "invalid";
}
