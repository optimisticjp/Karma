import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { courseBySlug, coursesByFamily, type Course } from "@/content/courses";
import { getDb, schema } from "@/lib/db";

/**
 * Public course identity is editorial + operational:
 *
 * - source control owns the long-form teaching copy, production notes, photos
 *   and syllabus structure;
 * - Karma Console owns whether a course is live, whether it is public, its
 *   public name/family/order and the operational figures stored on the row.
 *
 * Once a database is configured, a missing/hidden/inactive/archived row is a
 * deliberate Console decision and MUST NOT be silently resurrected from the
 * source catalogue. Source fallback exists only for builds/deployments where
 * the database is unavailable, or when the database query itself fails.
 */
export type PublicCourse = Course & {
  sortOrder: number;
  fromDatabase: boolean;
};

function sourceCourses(): PublicCourse[] {
  return coursesByFamily.map((course, index) => ({
    ...course,
    sortOrder: index + 1,
    fromDatabase: false
  }));
}

function overlayCourse(row: {
  slug: string;
  nameEn: string;
  nameGu: string;
  family: string;
  durationWeeks: number | null;
  durationMonths: number | null;
  sortOrder: number;
}): PublicCourse | null {
  const source = courseBySlug(row.slug);
  if (!source) return null;
  if (row.family !== "machine" && row.family !== "modern" && row.family !== "software") return null;
  return {
    ...source,
    nameEn: row.nameEn,
    nameGu: row.nameGu,
    family: row.family,
    durationWeeks: row.durationWeeks,
    durationMonths: row.durationMonths,
    sortOrder: row.sortOrder,
    fromDatabase: true
  };
}

export async function getPublicCourses(): Promise<PublicCourse[]> {
  const db = getDb();
  if (!db) return sourceCourses();

  try {
    const rows = await db
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        family: schema.courses.family,
        durationWeeks: schema.courses.durationWeeks,
        durationMonths: schema.courses.durationMonths,
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

    return rows.flatMap((row) => {
      const course = overlayCourse(row);
      return course ? [course] : [];
    });
  } catch (error) {
    console.error("[courses] public catalogue lookup failed; using source fallback", error);
    return sourceCourses();
  }
}

export async function getPublicCourseBySlug(slug: string): Promise<PublicCourse | null> {
  const db = getDb();
  if (!db) {
    const source = courseBySlug(slug);
    return source ? { ...source, sortOrder: coursesByFamily.findIndex((c) => c.slug === slug) + 1, fromDatabase: false } : null;
  }

  try {
    const rows = await db
      .select({
        slug: schema.courses.slug,
        nameEn: schema.courses.nameEn,
        nameGu: schema.courses.nameGu,
        family: schema.courses.family,
        durationWeeks: schema.courses.durationWeeks,
        durationMonths: schema.courses.durationMonths,
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

    return rows[0] ? overlayCourse(rows[0]) : null;
  } catch (error) {
    console.error("[courses] public course lookup failed; using source fallback", error);
    const source = courseBySlug(slug);
    return source ? { ...source, sortOrder: coursesByFamily.findIndex((c) => c.slug === slug) + 1, fromDatabase: false } : null;
  }
}
