import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { courseBySlug, coursesByFamily, type Course } from "@/content/courses";
import { getDb, schema } from "@/lib/db";

/**
 * Public course identity is editorial + operational.
 *
 * Existing source-controlled courses keep their richer editorial copy. A course
 * created entirely in Karma Console is also a first-class public course once
 * staff marks it active + public. For those rows we build a deliberately
 * conservative shell from database facts instead of dropping the course or
 * inventing curriculum, outcomes or machine claims.
 */
export type PublicCourse = Course & {
  sortOrder: number;
  fromDatabase: boolean;
};

type PublicCourseRow = {
  slug: string;
  nameEn: string;
  nameGu: string;
  family: string;
  durationWeeks: number | null;
  durationMonths: number | null;
  software: string | null;
  sortOrder: number;
};

function sourceCourses(): PublicCourse[] {
  return coursesByFamily.map((course, index) => ({
    ...course,
    sortOrder: index + 1,
    fromDatabase: false
  }));
}

function consoleOnlyCourse(row: PublicCourseRow): PublicCourse {
  const software = row.software?.trim() || undefined;
  return {
    slug: row.slug,
    family: row.family as Course["family"],
    nameEn: row.nameEn,
    nameGu: row.nameGu,
    leadEn: "This course is published from Karma Console. Current teaching and demo details are confirmed at the studio.",
    leadGu: "આ કોર્સ Karma Consoleમાંથી પ્રકાશિત છે. હાલની ટ્રેનિંગ અને ડેમોની વિગતો સ્ટુડિયોમાં કન્ફર્મ કરવામાં આવે છે.",
    whoEn: "Ask the studio whether this course matches your current level and goal.",
    whoGu: "આ કોર્સ તમારા હાલના લેવલ અને લક્ષ્ય માટે યોગ્ય છે કે નહીં તે સ્ટુડિયોમાં પૂછો.",
    outcomesEn: [],
    outcomesGu: [],
    durationWeeks: row.durationWeeks,
    durationMonths: row.durationMonths,
    photoLabel: `${row.nameEn} course studio photograph`,
    modules: [],
    production: {
      producesEn: "Current course work and practical details are confirmed at the studio.",
      producesGu: "હાલના કોર્સના કામ અને પ્રેક્ટિકલની વિગતો સ્ટુડિયોમાં કન્ફર્મ કરવામાં આવે છે.",
      problemsEn: [],
      problemsGu: [],
      machineEn: "Practical setup confirmed at the studio",
      machineGu: "પ્રેક્ટિકલ સેટઅપ સ્ટુડિયોમાં કન્ફર્મ કરવામાં આવે છે",
      ...(software ? { softwareEn: software, softwareGu: software } : {}),
      practiceEn: "The current practical plan is confirmed at the studio.",
      practiceGu: "હાલનો પ્રેક્ટિકલ પ્લાન સ્ટુડિયોમાં કન્ફર્મ કરવામાં આવે છે.",
      outputsEn: [],
      outputsGu: []
    },
    sortOrder: row.sortOrder,
    fromDatabase: true
  };
}

function overlayCourse(row: PublicCourseRow): PublicCourse | null {
  if (row.family !== "machine" && row.family !== "modern" && row.family !== "software") return null;
  const source = courseBySlug(row.slug);
  if (!source) return consoleOnlyCourse(row);
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

const publicSelection = {
  slug: schema.courses.slug,
  nameEn: schema.courses.nameEn,
  nameGu: schema.courses.nameGu,
  family: schema.courses.family,
  durationWeeks: schema.courses.durationWeeks,
  durationMonths: schema.courses.durationMonths,
  software: schema.courses.software,
  sortOrder: schema.courses.sortOrder
};

export async function getPublicCourses(): Promise<PublicCourse[]> {
  const db = getDb();
  if (!db) return sourceCourses();

  try {
    const rows = await db
      .select(publicSelection)
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
    return source
      ? {
          ...source,
          sortOrder: coursesByFamily.findIndex((c) => c.slug === slug) + 1,
          fromDatabase: false
        }
      : null;
  }

  try {
    const rows = await db
      .select(publicSelection)
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
    return source
      ? {
          ...source,
          sortOrder: coursesByFamily.findIndex((c) => c.slug === slug) + 1,
          fromDatabase: false
        }
      : null;
  }
}
