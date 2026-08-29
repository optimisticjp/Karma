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

const STATUS_SET: ReadonlySet<string> = new Set(APPLICATION_STATUSES);

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

export function validateApplicationUpdate(input: {
  status: unknown;
  assignedTo: unknown;
  nextFollowUp: unknown;
  closureReason: unknown;
}): { ok: true; value: ApplicationUpdateInput } | { ok: false } {
  if (!isApplicationStatus(input.status)) return { ok: false };
  const assignedTo = optionalPositiveId(input.assignedTo);
  const nextFollowUp = optionalDate(input.nextFollowUp);
  if (assignedTo === undefined || nextFollowUp === undefined) return { ok: false };

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

export function validateApplicationNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= 1 && clean.length <= 2000 ? clean : null;
}

export function positiveApplicationId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
