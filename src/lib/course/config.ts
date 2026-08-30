import { and, eq, isNull, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import {
  readCourseOperations,
  type CourseOperations,
  type DemoSlot,
  type ScheduleOption
} from "@/lib/admin/course-operations";
import { verifiedOperationsFor } from "@/content/course-operations";
import { courseBySlug, coursesByFamily } from "@/content/courses";
import { CURRENT_TERMS_VERSION, isKnownTermsVersion } from "@/content/admission-terms";

/**
 * ONE resolver for "how is this course configured?", used by the public
 * admission page AND by the admission API route.
 *
 * They must agree. If the page offered a demo slot the route then rejected, a
 * visitor would fill in a form and be told nothing was wrong with it; if the
 * route accepted a slot the page never offered, the institute would receive a
 * request for a time it does not run. So the option list and the validator come
 * from the same function, always.
 *
 * Precedence: the database row is the operational truth once it exists, because
 * that is what staff edit in Karma Console. The verified source profile
 * (`src/content/course-operations.ts`) is the fallback for a deploy whose
 * catalogue has not been imported yet, and for `npm run build`, which runs with
 * no database at all.
 */
export type CourseConfig = {
  slug: string;
  nameEn: string;
  nameGu: string;
  durationMonths: number | null;
  software: string | null;
  fees: { total: number; admission: number; balanceDueDays: number } | null;
  termsVersion: number;
  operations: CourseOperations;
  /** True when this came from the database rather than the source fallback. */
  fromDatabase: boolean;
};

function fromSource(slug: string): CourseConfig | null {
  const course = courseBySlug(slug);
  if (!course) return null;
  const verified = verifiedOperationsFor(slug);
  return {
    slug,
    nameEn: course.nameEn,
    nameGu: course.nameGu,
    durationMonths: verified?.durationMonths ?? course.durationMonths,
    software: verified?.software ?? null,
    fees: verified
      ? {
          total: verified.fees.feeTotal,
          admission: verified.fees.feeAdmission,
          balanceDueDays: verified.fees.feeBalanceDueDays
        }
      : null,
    termsVersion: verified?.termsVersion ?? CURRENT_TERMS_VERSION,
    operations: verified?.operations ?? readCourseOperations(null),
    fromDatabase: false
  };
}

/**
 * Reads a course's configuration. Falls back to source on any database
 * problem — an unreachable database must not make the admission form claim the
 * institute runs no batches.
 */
export async function getCourseConfig(slug: string): Promise<CourseConfig | null> {
  const db = getDb();
  if (!db) return fromSource(slug);

  try {
    const rows = await db
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        durationMonths: schema.courses.durationMonths,
        software: schema.courses.software,
        feeTotal: schema.courses.feeTotal,
        feeAdmission: schema.courses.feeAdmission,
        feeBalanceDueDays: schema.courses.feeBalanceDueDays,
        termsVersion: schema.courses.termsVersion,
        operations: schema.courses.operations
      })
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.slug, slug),
          eq(schema.courses.active, true),
          isNull(schema.courses.archivedAt)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return fromSource(slug);

    const operations = readCourseOperations(row.operations);
    const hasFees = row.feeTotal != null && row.feeAdmission != null;
    return {
      slug: row.slug,
      nameEn: row.nameEn,
      nameGu: row.nameGu,
      durationMonths: row.durationMonths,
      software: row.software,
      fees: hasFees
        ? {
            total: row.feeTotal as number,
            admission: row.feeAdmission as number,
            balanceDueDays: row.feeBalanceDueDays ?? 30
          }
        : null,
      termsVersion: isKnownTermsVersion(row.termsVersion)
        ? row.termsVersion
        : CURRENT_TERMS_VERSION,
      operations,
      fromDatabase: true
    };
  } catch (e) {
    console.error("[courses] config lookup failed; using source fallback", e);
    return fromSource(slug);
  }
}

/**
 * Configuration for every course the public admission form may offer. One
 * query, not one per course — the form lists the whole catalogue.
 */
export async function getPublicCourseConfigs(): Promise<CourseConfig[]> {
  const db = getDb();
  const catalogue = catalogueSlugs();
  if (!db) return catalogue.map((slug) => fromSource(slug)).filter(nonNull);

  try {
    const rows = await db
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        durationMonths: schema.courses.durationMonths,
        software: schema.courses.software,
        feeTotal: schema.courses.feeTotal,
        feeAdmission: schema.courses.feeAdmission,
        feeBalanceDueDays: schema.courses.feeBalanceDueDays,
        termsVersion: schema.courses.termsVersion,
        operations: schema.courses.operations
      })
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.active, true),
          isNull(schema.courses.archivedAt),
          or(eq(schema.courses.publicVisible, true), isNull(schema.courses.publicVisible))
        )
      );

    const byslug = new Map(rows.map((r) => [r.slug, r]));
    return catalogue
      .map((slug) => {
        const row = byslug.get(slug);
        if (!row) return fromSource(slug);
        const hasFees = row.feeTotal != null && row.feeAdmission != null;
        return {
          slug: row.slug,
          nameEn: row.nameEn,
          nameGu: row.nameGu,
          durationMonths: row.durationMonths,
          software: row.software,
          fees: hasFees
            ? {
                total: row.feeTotal as number,
                admission: row.feeAdmission as number,
                balanceDueDays: row.feeBalanceDueDays ?? 30
              }
            : null,
          termsVersion: isKnownTermsVersion(row.termsVersion)
            ? row.termsVersion
            : CURRENT_TERMS_VERSION,
          operations: readCourseOperations(row.operations),
          fromDatabase: true
        } satisfies CourseConfig;
      })
      .filter(nonNull);
  } catch (e) {
    console.error("[courses] catalogue config lookup failed; using source fallback", e);
    return catalogue.map((slug) => fromSource(slug)).filter(nonNull);
  }
}

function nonNull<T>(value: T | null): value is T {
  return value != null;
}

/**
 * The catalogue in DISPLAY order (`coursesByFamily`), so the admission form
 * lists courses the way the site lists them. Storage order stays untouched —
 * that is the catalogue-import contract, and a different question.
 */
function catalogueSlugs(): string[] {
  return coursesByFamily.map((c) => c.slug);
}

/* ------------------------- validating a submission ------------------------ */

export function scheduleOptionFor(
  config: Pick<CourseConfig, "operations">,
  key: string | null | undefined
): ScheduleOption | null {
  if (!key) return null;
  return config.operations.scheduleOptions.find((s) => s.key === key) ?? null;
}

export function demoSlotFor(
  config: Pick<CourseConfig, "operations">,
  key: string | null | undefined
): DemoSlot | null {
  if (!key) return null;
  return config.operations.demo?.slots.find((s) => s.key === key) ?? null;
}

/**
 * The legacy morning/evening field, derived from the precise slot rather than
 * asked twice. `preferredTiming` predates the timetable and is still read by
 * console filters and by the course-page CTAs, so it keeps working; the exact
 * slot key is stored alongside it in `preferredSchedule`.
 */
export function timingForSchedule(slot: ScheduleOption | null): "morning" | "evening" | null {
  if (!slot) return null;
  return slot.partOfDay === "morning" || slot.partOfDay === "afternoon" ? "morning" : "evening";
}
