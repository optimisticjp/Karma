import { and, asc, eq, isNull } from "drizzle-orm";
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
 * One resolver for how a PUBLIC course is configured. When Postgres is
 * reachable, Console state is authoritative: hidden, inactive, archived or
 * missing rows are not resurrected from source control. Source fallback exists
 * only when no database is configured (build/dev) or the query itself fails.
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
  sortOrder: number;
  fromDatabase: boolean;
};

function sourceRank(slug: string) {
  const index = coursesByFamily.findIndex((course) => course.slug === slug);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index + 1;
}

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
    sortOrder: sourceRank(slug),
    fromDatabase: false
  };
}

type DbCourseConfigRow = {
  slug: string;
  nameEn: string;
  nameGu: string;
  durationMonths: number | null;
  software: string | null;
  feeTotal: number | null;
  feeAdmission: number | null;
  feeBalanceDueDays: number | null;
  termsVersion: number | null;
  operations: unknown;
  sortOrder: number;
};

function fromDatabase(row: DbCourseConfigRow): CourseConfig {
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
    termsVersion: isKnownTermsVersion(row.termsVersion) ? row.termsVersion : CURRENT_TERMS_VERSION,
    operations: readCourseOperations(row.operations),
    sortOrder: row.sortOrder,
    fromDatabase: true
  };
}

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
        operations: schema.courses.operations,
        sortOrder: schema.courses.sortOrder
      })
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.slug, slug),
          eq(schema.courses.active, true),
          eq(schema.courses.publicVisible, true),
          isNull(schema.courses.archivedAt)
        )
      )
      .limit(1);

    return rows[0] ? fromDatabase(rows[0]) : null;
  } catch (error) {
    console.error("[courses] config lookup failed; using source fallback", error);
    return fromSource(slug);
  }
}

/** Configuration for every course the public admission form may offer. */
export async function getPublicCourseConfigs(): Promise<CourseConfig[]> {
  const db = getDb();
  const catalogue = new Set(catalogueSlugs());
  if (!db) return coursesByFamily.map((course) => fromSource(course.slug)).filter(nonNull);

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
        operations: schema.courses.operations,
        sortOrder: schema.courses.sortOrder
      })
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.active, true),
          eq(schema.courses.publicVisible, true),
          isNull(schema.courses.archivedAt)
        )
      )
      .orderBy(asc(schema.courses.sortOrder), asc(schema.courses.nameEn));

    return rows.filter((row) => catalogue.has(row.slug)).map(fromDatabase);
  } catch (error) {
    console.error("[courses] catalogue config lookup failed; using source fallback", error);
    return coursesByFamily.map((course) => fromSource(course.slug)).filter(nonNull);
  }
}

function nonNull<T>(value: T | null): value is T {
  return value != null;
}

function catalogueSlugs(): string[] {
  return coursesByFamily.map((course) => course.slug);
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

export function timingForSchedule(slot: ScheduleOption | null): "morning" | "evening" | null {
  if (!slot) return null;
  return slot.partOfDay === "morning" || slot.partOfDay === "afternoon" ? "morning" : "evening";
}
