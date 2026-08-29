import { courses } from "@/content/courses";

/**
 * Database rows for the verified studio catalogue.
 *
 * `src/content/courses.ts` remains the single source of truth until the public
 * course pages are moved fully onto the database. This projection deliberately
 * imports only fields the catalogue table currently owns; unconfirmed
 * durations stay null rather than being guessed.
 */
export const VERIFIED_CATALOG_ROWS = courses.map((course, index) => ({
  slug: course.slug,
  nameEn: course.nameEn,
  nameGu: course.nameGu,
  family: course.family,
  durationWeeks: course.durationWeeks,
  sortOrder: index + 1,
  active: true
}));
