import { and, asc, eq, gte, isNull, or } from "drizzle-orm";
import { getDb, schema } from "./index";
import { demoModeAllowed } from "@/lib/env";
import { sampleBatches, type BatchRow } from "@/content/courses";

export type BatchesResult = {
  rows: BatchRow[];
  /** True only when clearly-labelled sample rows are shown (never in production). */
  sample: boolean;
  /** Database configured but the query failed. */
  error?: boolean;
  /** Database not configured at all. */
  unavailable?: boolean;
};

function kolkataDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

/**
 * Publicly available batches.
 *
 * A batch stays on the public board while its status is `open` and it has not
 * ended. Its start date may already be in the past: that is a running intake,
 * not an expired one. Staff close admissions by changing the status, setting
 * an end date in the past, archiving the batch, or hiding/deactivating its
 * course. All of those Console decisions are enforced in this SQL query.
 */
export async function getUpcomingBatches(opts?: {
  limit?: number;
  courseSlug?: string;
}): Promise<BatchesResult> {
  const db = getDb();
  const limit = opts?.limit ?? 12;

  if (!db) {
    if (demoModeAllowed) {
      return { rows: sampleBatches(opts?.courseSlug).slice(0, limit), sample: true };
    }
    return { rows: [], sample: false, unavailable: true };
  }

  try {
    const today = kolkataDate();
    const conditions = [
      eq(schema.batches.status, "open"),
      or(isNull(schema.batches.endDate), gte(schema.batches.endDate, today))!,
      isNull(schema.batches.archivedAt),
      eq(schema.courses.active, true),
      eq(schema.courses.publicVisible, true),
      isNull(schema.courses.archivedAt)
    ];
    if (opts?.courseSlug) conditions.push(eq(schema.courses.slug, opts.courseSlug));

    const rows = await db
      .select({
        id: schema.batches.id,
        label: schema.batches.label,
        days: schema.batches.days,
        startTime: schema.batches.startTime,
        endTime: schema.batches.endTime,
        startDate: schema.batches.startDate,
        seats: schema.batches.seats,
        seatsTaken: schema.batches.seatsTaken,
        language: schema.batches.language,
        courseSlug: schema.courses.slug,
        courseNameEn: schema.courses.nameEn,
        courseNameGu: schema.courses.nameGu
      })
      .from(schema.batches)
      .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
      .where(and(...conditions))
      .orderBy(asc(schema.batches.startDate), asc(schema.batches.startTime))
      .limit(limit);

    return { rows: rows as BatchRow[], sample: false };
  } catch (e) {
    console.error("[db] getUpcomingBatches failed", e);
    if (demoModeAllowed) {
      return { rows: sampleBatches(opts?.courseSlug).slice(0, limit), sample: true, error: true };
    }
    return { rows: [], sample: false, error: true };
  }
}

export async function getCertificate(certNo: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select()
      .from(schema.certificates)
      .where(eq(schema.certificates.certNo, certNo))
      .limit(1);
    return rows[0] ?? null;
  } catch (e) {
    console.error("[db] getCertificate failed", e);
    return null;
  }
}
