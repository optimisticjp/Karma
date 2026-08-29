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
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelation: string | null;
};

export function validateStudentInput(input: Record<string, unknown>):
  | { ok: true; value: StudentInput }
  | { ok: false } {
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

  if (fullName.length < 2 || !isIndianMobile(phone) || parsedEmail === "invalid") return { ok: false };
  if (whatsapp && !isIndianMobile(whatsapp)) return { ok: false };
  if (isMinor && (!guardianName || !guardianPhone || !isIndianMobile(guardianPhone))) return { ok: false };
  if (guardianPhone && !isIndianMobile(guardianPhone)) return { ok: false };

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
      guardianName,
      guardianPhone,
      guardianRelation
    }
  };
}

export type DirectAdmissionInput = StudentInput & {
  batchId: number;
  joinedOn: string | null;
};

export function validateDirectAdmission(input: Record<string, unknown>):
  | { ok: true; value: DirectAdmissionInput }
  | { ok: false } {
  const student = validateStudentInput(input);
  const batchId = positiveId(input.batchId);
  const joinedOn = optionalDate(input.joinedOn);
  if (!student.ok || !batchId || joinedOn === "invalid") return { ok: false };
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
