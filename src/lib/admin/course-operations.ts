/**
 * The operational shape of a course: how it is timetabled, what the free demo
 * offers, what is actually taught, and what it costs.
 *
 * WHY THIS IS SPLIT THE WAY IT IS
 * -------------------------------
 * Karma runs on a Supabase free project, so the model deliberately mixes two
 * storage strategies rather than picking one for consistency's sake:
 *
 *  - Money, duration, software and the terms version are **columns** on
 *    `courses`. They are queried, aggregated, constrained (`chk_course_fees`)
 *    and snapshotted onto an enrolment; a number that decides what a student
 *    owes does not belong inside an untyped blob.
 *  - Schedule options, the demo policy, the curriculum and the practical
 *    training points are a small, bounded, per-course **JSONB payload**. Four
 *    schedule rows and eleven curriculum lines per course would be four
 *    high-cardinality child tables bought for nothing: they are never joined,
 *    never aggregated and always read as a whole with the course.
 *
 * Neither half is a dumping ground. Everything here is validated on the way in
 * — `payload` coming back from Postgres is re-validated, never trusted because
 * it round-tripped (the same rule Content Desk follows).
 *
 * SCHEDULE OPTIONS ARE NOT BATCHES. A schedule option is "this course is
 * timetabled 08:00–12:00"; a batch is "this group of students starts on the
 * 4th, has 10 seats and a trainer". Do not create dated batch rows to
 * represent standard timetable slots.
 */

export const PARTS_OF_DAY = ["morning", "afternoon", "evening", "night"] as const;
export type PartOfDay = (typeof PARTS_OF_DAY)[number];

/** One timetable slot the course is regularly taught in. */
export type ScheduleOption = {
  /** Stable key used by the public form and by an admission record. */
  key: string;
  startTime: string; // HH:MM, 24h
  endTime: string; // HH:MM, 24h
  partOfDay: PartOfDay;
};

/** One slot a visitor may ask for their free demo in. */
export type DemoSlot = {
  key: string;
  startTime: string;
  endTime: string;
};

/**
 * The demo offer. `days` and `hours` are what the institute advertises; the
 * slots are preferences a visitor may express, NOT bookable inventory. Karma
 * does not maintain per-date demo capacity, and inventing it would mean the
 * site promising a seat nobody has reserved.
 */
export type DemoPolicy = {
  days: number;
  hours: number;
  free: boolean;
  slots: DemoSlot[];
};

/** A bilingual line of curriculum or practical training. */
export type BilingualLine = { en: string; gu: string };

/** The JSONB half of the operational model. */
export type CourseOperations = {
  scheduleOptions: ScheduleOption[];
  demo: DemoPolicy | null;
  curriculum: BilingualLine[];
  practical: BilingualLine[];
};

export const EMPTY_OPERATIONS: CourseOperations = {
  scheduleOptions: [],
  demo: null,
  curriculum: [],
  practical: []
};

/* ------------------------------- limits ---------------------------------- */

export const OPERATION_LIMITS = {
  scheduleOptions: 12,
  demoSlots: 12,
  curriculum: 40,
  practical: 40,
  lineLength: 200,
  keyLength: 40
} as const;

/** ₹1 crore is far past any plausible course fee and keeps a typo out of the ledger. */
export const MAX_COURSE_FEE = 10_000_000;
export const MAX_DURATION_MONTHS = 60;
export const MAX_BALANCE_DUE_DAYS = 365;

/* ------------------------------ validation -------------------------------- */

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function line(value: unknown): BilingualLine | null {
  if (!value || typeof value !== "object") return null;
  const en = text((value as { en?: unknown }).en, OPERATION_LIMITS.lineLength);
  const gu = text((value as { gu?: unknown }).gu, OPERATION_LIMITS.lineLength);
  return en && gu ? { en, gu } : null;
}

function lines(value: unknown, max: number): BilingualLine[] | null {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > max) return null;
  const out: BilingualLine[] = [];
  for (const entry of value) {
    const parsed = line(entry);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

/**
 * Minutes between two HH:MM times on the same day. Returned rather than stored
 * so an edited slot can never disagree with its own advertised length.
 */
export function slotMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/** Whole hours where the slot divides evenly, otherwise a one-decimal number. */
export function slotHours(startTime: string, endTime: string): number {
  return Math.round((slotMinutes(startTime, endTime) / 60) * 10) / 10;
}

export function partOfDayFor(startTime: string): PartOfDay {
  const hour = Number(startTime.slice(0, 2));
  if (hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
}

function scheduleOption(value: unknown): ScheduleOption | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const key = text(v.key, OPERATION_LIMITS.keyLength);
  const startTime = typeof v.startTime === "string" && TIME.test(v.startTime) ? v.startTime : null;
  const endTime = typeof v.endTime === "string" && TIME.test(v.endTime) ? v.endTime : null;
  if (!key || !KEY.test(key) || !startTime || !endTime) return null;
  if (slotMinutes(startTime, endTime) <= 0) return null;
  const partOfDay =
    typeof v.partOfDay === "string" && (PARTS_OF_DAY as readonly string[]).includes(v.partOfDay)
      ? (v.partOfDay as PartOfDay)
      : partOfDayFor(startTime);
  return { key, startTime, endTime, partOfDay };
}

function demoSlot(value: unknown): DemoSlot | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const key = text(v.key, OPERATION_LIMITS.keyLength);
  const startTime = typeof v.startTime === "string" && TIME.test(v.startTime) ? v.startTime : null;
  const endTime = typeof v.endTime === "string" && TIME.test(v.endTime) ? v.endTime : null;
  if (!key || !KEY.test(key) || !startTime || !endTime) return null;
  if (slotMinutes(startTime, endTime) <= 0) return null;
  return { key, startTime, endTime };
}

function demoPolicy(value: unknown): DemoPolicy | null | undefined {
  if (value == null) return null;
  if (typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const days = Number(v.days);
  const hours = Number(v.hours);
  if (!Number.isInteger(days) || days < 0 || days > 31) return undefined;
  if (!Number.isFinite(hours) || hours <= 0 || hours > 12) return undefined;
  if (!Array.isArray(v.slots) || v.slots.length > OPERATION_LIMITS.demoSlots) return undefined;
  const slots: DemoSlot[] = [];
  for (const entry of v.slots) {
    const parsed = demoSlot(entry);
    if (!parsed) return undefined;
    if (slots.some((s) => s.key === parsed.key)) return undefined;
    slots.push(parsed);
  }
  return { days, hours, free: v.free !== false, slots };
}

/**
 * Validates the JSONB half. Returns null when anything is malformed — a course
 * with a half-parsed timetable is worse than a course with none, because the
 * public form would offer a slot the institute does not run.
 */
export function parseCourseOperations(value: unknown): CourseOperations | null {
  if (value == null) return { ...EMPTY_OPERATIONS };
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;

  const rawSchedule = v.scheduleOptions;
  if (rawSchedule != null && !Array.isArray(rawSchedule)) return null;
  const list = Array.isArray(rawSchedule) ? rawSchedule : [];
  if (list.length > OPERATION_LIMITS.scheduleOptions) return null;
  const scheduleOptions: ScheduleOption[] = [];
  for (const entry of list) {
    const parsed = scheduleOption(entry);
    if (!parsed) return null;
    if (scheduleOptions.some((s) => s.key === parsed.key)) return null;
    scheduleOptions.push(parsed);
  }

  const demo = demoPolicy(v.demo);
  if (demo === undefined) return null;

  const curriculum = lines(v.curriculum, OPERATION_LIMITS.curriculum);
  const practical = lines(v.practical, OPERATION_LIMITS.practical);
  if (!curriculum || !practical) return null;

  return { scheduleOptions, demo, curriculum, practical };
}

/**
 * Reads a payload that came back from Postgres. Never throws: a course whose
 * stored payload has drifted renders with no timetable rather than crashing a
 * staff page, and the drift is logged.
 */
export function readCourseOperations(value: unknown): CourseOperations {
  const parsed = parseCourseOperations(value);
  if (parsed) return parsed;
  console.error("[courses] stored operations payload failed validation; ignoring");
  return { ...EMPTY_OPERATIONS };
}

/* --------------------------- the money half ------------------------------- */

export type CourseFeePlan = {
  /** Total agreed course fee in whole rupees. */
  feeTotal: number;
  /** What the institute expects at admission. */
  feeAdmission: number;
  /** Days after joining by which the balance must be paid. */
  feeBalanceDueDays: number;
};

export function balanceOf(plan: Pick<CourseFeePlan, "feeTotal" | "feeAdmission">): number {
  return Math.max(0, plan.feeTotal - plan.feeAdmission);
}

/**
 * Adds `days` to an ISO date and returns an ISO date. Used for the balance due
 * date on a joining. Pure, so it can be tested without a clock.
 */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
