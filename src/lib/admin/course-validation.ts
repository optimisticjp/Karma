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

export function validateCourseInput(input: {
  slug: unknown;
  nameEn: unknown;
  nameGu: unknown;
  family: unknown;
  durationWeeks?: unknown;
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
  const sortOrder = input.sortOrder == null || input.sortOrder === "" ? 0 : integer(input.sortOrder, -999, 999);

  if (
    !slug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !nameEn ||
    !nameGu ||
    !family ||
    durationWeeks === undefined ||
    sortOrder == null
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    value: {
      slug,
      nameEn,
      nameGu,
      family,
      durationWeeks,
      sortOrder,
      active: input.active === true || input.active === "true" || input.active === "on"
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
