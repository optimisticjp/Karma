import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { addDays } from "@/lib/admin/course-operations";
import { CURRENT_TERMS_VERSION, isKnownTermsVersion } from "@/content/admission-terms";

/**
 * The commercial agreement a student joins under, captured ONCE.
 *
 * Why a snapshot and not a join. A course's fee is edited from Karma Console.
 * If a student's balance were computed from the course row, raising the fee
 * next year would silently increase what every current student owes — and the
 * first anyone would know is a parent at the front desk holding a receipt that
 * no longer adds up.
 *
 * So the numbers are copied onto the enrolment at the moment of joining and are
 * never recalculated from the course again. Changing an existing student's
 * agreement is a separate, deliberate, audited act on that enrolment row, with
 * a reason.
 */
export type EnrollmentAgreement = {
  agreedFeeTotal: number | null;
  agreedAdmissionAmount: number | null;
  agreedBalanceDueOn: string | null;
  agreedDurationMonths: number | null;
  agreedCourseName: string | null;
  termsVersion: number;
  termsAcceptedAt: Date;
};

type Db = NonNullable<ReturnType<typeof getDb>>;
/** The transaction handle Drizzle hands to `db.transaction(async (tx) => …)`. */
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Reads the fee plan a batch's course currently publishes and turns it into the
 * enrolment's snapshot.
 *
 * A course with no published fee plan yields a snapshot with null amounts
 * rather than a guess: the fee is then agreed in person and recorded on the
 * ledger, which is exactly how the other ten courses work today.
 */
export async function agreementForBatch(
  tx: Tx | Db,
  batchId: number,
  joinedOn: string
): Promise<EnrollmentAgreement> {
  const rows = await tx
    .select({
      nameEn: schema.courses.nameEn,
      feeTotal: schema.courses.feeTotal,
      feeAdmission: schema.courses.feeAdmission,
      feeBalanceDueDays: schema.courses.feeBalanceDueDays,
      durationMonths: schema.courses.durationMonths,
      termsVersion: schema.courses.termsVersion
    })
    .from(schema.batches)
    .innerJoin(schema.courses, eq(schema.batches.courseId, schema.courses.id))
    .where(eq(schema.batches.id, batchId))
    .limit(1);

  const course = rows[0];
  const now = new Date();
  if (!course) {
    return {
      agreedFeeTotal: null,
      agreedAdmissionAmount: null,
      agreedBalanceDueOn: null,
      agreedDurationMonths: null,
      agreedCourseName: null,
      termsVersion: CURRENT_TERMS_VERSION,
      termsAcceptedAt: now
    };
  }

  const hasPlan = course.feeTotal != null;
  const balanceDueDays = course.feeBalanceDueDays ?? 30;

  return {
    agreedFeeTotal: hasPlan ? course.feeTotal : null,
    agreedAdmissionAmount: hasPlan ? course.feeAdmission : null,
    /* Only meaningful when there is a balance to fall due. */
    agreedBalanceDueOn:
      hasPlan && course.feeAdmission != null && course.feeTotal! > course.feeAdmission
        ? addDays(joinedOn, balanceDueDays)
        : null,
    agreedDurationMonths: course.durationMonths,
    agreedCourseName: course.nameEn,
    termsVersion: isKnownTermsVersion(course.termsVersion)
      ? course.termsVersion
      : CURRENT_TERMS_VERSION,
    termsAcceptedAt: now
  };
}

/** Non-secret fields worth writing into the audit row for an agreement. */
export function agreementAuditValues(agreement: EnrollmentAgreement) {
  return {
    agreedFeeTotal: agreement.agreedFeeTotal,
    agreedAdmissionAmount: agreement.agreedAdmissionAmount,
    agreedBalanceDueOn: agreement.agreedBalanceDueOn,
    agreedDurationMonths: agreement.agreedDurationMonths,
    agreedCourseName: agreement.agreedCourseName,
    termsVersion: agreement.termsVersion
  };
}
