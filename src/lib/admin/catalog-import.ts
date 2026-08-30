import { courses } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";

/**
 * Database rows for the verified studio catalogue.
 *
 * `src/content/courses.ts` remains the editorial source of truth for the public
 * catalogue; the `courses` table is the OPERATIONAL source of truth once a row
 * exists. This projection imports the fields the table owns, and unconfirmed
 * durations stay null rather than being guessed.
 *
 * ORDERING — read this before changing either number.
 * `sortOrder` is `index + 1`, one-based, and `scripts/seed.ts` uses the SAME
 * projection so the two paths can no longer disagree. They used to: the seed
 * wrote a zero-based `sortOrder` and upserted it, so running `npm run db:seed`
 * against a live database silently renumbered every course and undid whatever
 * order the operator had arranged in Karma Console. Both paths now leave
 * `sort_order` alone on an existing row — see `CATALOG_RESEED_FIELDS`.
 */
export const VERIFIED_CATALOG_ROWS = courses.map((course, index) => {
  const verified = verifiedOperationsFor(course.slug);
  return {
    slug: course.slug,
    nameEn: course.nameEn,
    nameGu: course.nameGu,
    family: course.family,
    durationWeeks: course.durationWeeks,
    modules: course.modules,
    /** One-based, derived from storage position. Courses are appended, never inserted. */
    sortOrder: index + 1,
    active: true,
    /* Operational facts, present only where the owner has actually confirmed them. */
    durationMonths: verified?.durationMonths ?? null,
    software: verified?.software ?? null,
    feeTotal: verified?.fees.feeTotal ?? null,
    feeAdmission: verified?.fees.feeAdmission ?? null,
    feeBalanceDueDays: verified?.fees.feeBalanceDueDays ?? null,
    termsVersion: verified?.termsVersion ?? null,
    operations: verified?.operations ?? null
  };
});

export type CatalogRow = (typeof VERIFIED_CATALOG_ROWS)[number];

/**
 * The only fields a RE-run of the seed may overwrite on a course that already
 * exists: the editorial identity that genuinely comes from source control.
 *
 * Everything absent from this list is operator-managed and must survive a
 * re-seed — `sortOrder` (the console's display arrangement), `active` and
 * `publicVisible` (whether the course is being taught and shown), the fee plan,
 * the timetable and the archive state. A seed script that "helpfully" restores
 * source values would quietly undo the owner's own decisions.
 */
export const CATALOG_RESEED_FIELDS = ["nameEn", "nameGu", "family", "modules"] as const;

export function catalogReseedSet(row: CatalogRow): Pick<CatalogRow, (typeof CATALOG_RESEED_FIELDS)[number]> {
  return { nameEn: row.nameEn, nameGu: row.nameGu, family: row.family, modules: row.modules };
}

/**
 * The verified operational facts alone, for courses that have them. Used by the
 * owner-only console action that pushes newly confirmed facts (duration, fee
 * plan, timetable, demo policy, curriculum) onto an already-imported course row.
 */
export const VERIFIED_OPERATIONS_ROWS = VERIFIED_CATALOG_ROWS.filter(
  (row) => row.operations != null
).map((row) => ({
  slug: row.slug,
  durationMonths: row.durationMonths,
  software: row.software,
  feeTotal: row.feeTotal,
  feeAdmission: row.feeAdmission,
  feeBalanceDueDays: row.feeBalanceDueDays,
  termsVersion: row.termsVersion,
  operations: row.operations
}));
