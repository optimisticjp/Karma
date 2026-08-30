import { isKnownTermsVersion } from "@/content/admission-terms";
import {
  MAX_BALANCE_DUE_DAYS,
  MAX_COURSE_FEE,
  MAX_DURATION_MONTHS
} from "./course-operations";

export const COURSE_FAMILIES = ["machine", "modern", "software"] as const;
export type CourseFamily = (typeof COURSE_FAMILIES)[number];

export const BATCH_STATUSES = ["open", "full", "started", "done"] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export type CourseInput = {
  slug: string;
  nameEn: string;
  nameGu: string;
  family: CourseFamily;
  durationWeeks: number | null;
  /** Months, where the owner has confirmed one. Never derived from weeks. */
  durationMonths: number | null;
  software: string | null;
  feeTotal: number | null;
  feeAdmission: number | null;
  feeBalanceDueDays: number | null;
  termsVersion: number | null;
  publicVisible: boolean;
  sortOrder: number;
  active: boolean;
};

export type BatchInput = {
  courseId: number;
  label: string;
  days: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string | null;
  seats: number;
  language: string;
  trainerId: number | null;
  status: BatchStatus;
};

type Validation<T> = { ok: true; value: T } | { ok: false };

function cleanText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length < min || text.length > max) return null;
  return text;
}

function integer(value: unknown, min: number, max: number): number | null {
  const text = typeof value === "string" ? value.trim() : value;
  if (text === "" || text == null) return null;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function optionalInteger(value: unknown, min: number, max: number): number | null | undefined {
  if (value == null || value === "") return null;
  const parsed = integer(value, min, max);
  return parsed == null ? undefined : parsed;
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return value;
}

function validTime(value: unknown): string | null {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  return value;
}

const checkbox = (value: unknown) =>
  value === true || value === "true" || value === "on";

export function validateCourseInput(input: {
  slug: unknown;
  nameEn: unknown;
  nameGu: unknown;
  family: unknown;
  durationWeeks?: unknown;
  durationMonths?: unknown;
  software?: unknown;
  feeTotal?: unknown;
  feeAdmission?: unknown;
  feeBalanceDueDays?: unknown;
  termsVersion?: unknown;
  publicVisible?: unknown;
  sortOrder?: unknown;
  active?: unknown;
}): Validation<CourseInput> {
  const slug = cleanText(input.slug, 2, 80)?.toLowerCase() ?? null;
  const nameEn = cleanText(input.nameEn, 2, 160);
  const nameGu = cleanText(input.nameGu, 2, 160);
  const family =
    typeof input.family === "string" && COURSE_FAMILIES.includes(input.family as CourseFamily)
      ? (input.family as CourseFamily)
      : null;
  const durationWeeks = optionalInteger(input.durationWeeks, 1, 104);
  const durationMonths = optionalInteger(input.durationMonths, 1, MAX_DURATION_MONTHS);
  const feeTotal = optionalInteger(input.feeTotal, 0, MAX_COURSE_FEE);
  const feeAdmission = optionalInteger(input.feeAdmission, 0, MAX_COURSE_FEE);
  const feeBalanceDueDays = optionalInteger(input.feeBalanceDueDays, 0, MAX_BALANCE_DUE_DAYS);
  const software = input.software == null || input.software === "" ? null : cleanText(input.software, 1, 80);
  const rawTermsVersion = optionalInteger(input.termsVersion, 1, 9999);
  const sortOrder = input.sortOrder == null || input.sortOrder === "" ? 0 : integer(input.sortOrder, -999, 999);

  if (
    !slug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !nameEn ||
    !nameGu ||
    !family ||
    durationWeeks === undefined ||
    durationMonths === undefined ||
    feeTotal === undefined ||
    feeAdmission === undefined ||
    feeBalanceDueDays === undefined ||
    rawTermsVersion === undefined ||
    (input.software != null && input.software !== "" && !software) ||
    sortOrder == null
  ) {
    return { ok: false };
  }

  /* Mirrors chk_course_fees. Rejected in the application as well as the
     database so an operator gets a message rather than a constraint error. */
  if (feeAdmission != null && feeTotal == null) return { ok: false };
  if (feeAdmission != null && feeTotal != null && feeAdmission > feeTotal) return { ok: false };
  /* A version that does not exist would record consent to text nobody can
     produce. Better to refuse the course edit than to store the number. */
  if (rawTermsVersion != null && !isKnownTermsVersion(rawTermsVersion)) return { ok: false };

  return {
    ok: true,
    value: {
      slug,
      nameEn,
      nameGu,
      family,
      durationWeeks,
      durationMonths,
      software,
      feeTotal,
      feeAdmission,
      feeBalanceDueDays,
      termsVersion: rawTermsVersion,
      publicVisible: input.publicVisible === undefined ? true : checkbox(input.publicVisible),
      sortOrder,
      active: checkbox(input.active)
    }
  };
}

export function validateBatchInput(input: {
  courseId: unknown;
  label: unknown;
  days: unknown;
  startTime: unknown;
  endTime: unknown;
  startDate: unknown;
  endDate?: unknown;
  seats: unknown;
  language: unknown;
  trainerId?: unknown;
  status: unknown;
}): Validation<BatchInput> {
  const courseId = integer(input.courseId, 1, Number.MAX_SAFE_INTEGER);
  const label = cleanText(input.label, 2, 80);
  const days = cleanText(input.days, 2, 60);
  const startTime = validTime(input.startTime);
  const endTime = validTime(input.endTime);
  const startDate = validDate(input.startDate);
  const endDate = input.endDate == null || input.endDate === "" ? null : validDate(input.endDate);
  const seats = integer(input.seats, 1, 500);
  const language = cleanText(input.language, 2, 60);
  const trainerId = optionalInteger(input.trainerId, 1, Number.MAX_SAFE_INTEGER);
  const status =
    typeof input.status === "string" && BATCH_STATUSES.includes(input.status as BatchStatus)
      ? (input.status as BatchStatus)
      : null;

  if (
    courseId == null ||
    !label ||
    !days ||
    !startTime ||
    !endTime ||
    startTime >= endTime ||
    !startDate ||
    input.endDate !== "" && input.endDate != null && !endDate ||
    (endDate != null && endDate < startDate) ||
    seats == null ||
    !language ||
    trainerId === undefined ||
    !status
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    value: {
      courseId,
      label,
      days,
      startTime,
      endTime,
      startDate,
      endDate,
      seats,
      language,
      trainerId,
      status
    }
  };
}
