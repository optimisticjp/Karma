import { and, asc, eq, gte, isNull } from "drizzle-orm";
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

/**
 * Upcoming open batches. Audit fixes applied:
 *  - courseSlug filter and status filter run in SQL, before LIMIT
 *  - sample data appears ONLY outside production (or ALLOW_DEMO_MODE)
 *  - production failures return honest empty/error states, never fiction
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
    const today = new Date().toISOString().slice(0, 10);
    const conditions = [
      gte(schema.batches.startDate, today),
      eq(schema.batches.status, "open"),
      /* Archived rows are out of the operational picture, and the public site
         is the most operational surface there is: a visitor must never be
         shown a batch the studio has taken out of play. */
      isNull(schema.batches.archivedAt),
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
      .orderBy(asc(schema.batches.startDate))
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
