export const CERTIFICATE_ATTENDANCE_THRESHOLD = 75;

export function positiveCertificateId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function certificateDate(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function certificateGrade(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean ? clean.slice(0, 40) : null;
}

export function certificateReason(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= 3 && clean.length <= 300 ? clean : null;
}

export function attendancePercent(total: number, presentOrLate: number): number | null {
  if (total <= 0) return null;
  return Math.round((presentOrLate / total) * 100);
}

export function certificateEligible(enrollmentStatus: string, attendance: number | null): boolean {
  return enrollmentStatus === "completed" && attendance != null && attendance >= CERTIFICATE_ATTENDANCE_THRESHOLD;
}
