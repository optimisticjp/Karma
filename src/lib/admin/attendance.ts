export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return typeof value === "string" && ATTENDANCE_STATUSES.includes(value as AttendanceStatus);
}

export function positiveAttendanceId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function validIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : value;
}

export function validMonth(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value) ? value : null;
}

export function correctionReason(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= 3 && clean.length <= 300 ? clean : null;
}

export function attendanceNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean ? clean.slice(0, 200) : null;
}

export function sessionIsLocked(createdAt: Date, lockedAt: Date | null, now = new Date()): boolean {
  if (lockedAt) return true;
  return now.getTime() - createdAt.getTime() >= 24 * 60 * 60 * 1000;
}

export function dateInsideBatch(date: string, startDate: string, endDate: string | null): boolean {
  return date >= startDate && (endDate == null || date <= endDate);
}
