/**
 * VERIFIED operational facts, supplied by Karma Design Studio (2026-08-30) on
 * its own printed admission material.
 *
 * Scope discipline, and it matters: everything in this file describes the
 * **EMCAD DAHAO Embroidery Designing** course and nothing else. The three-month
 * duration, the ₹35,000 fee, the four timetable slots and the two-day free demo
 * are that course's facts. Every other Karma course still has an unconfirmed
 * duration and no published fee (docs/content-checklist.md Q1, Q12) and MUST
 * NOT inherit these numbers because they were convenient.
 *
 * Where the operational truth lives at runtime: the `courses` table, managed
 * from Karma Console. This file is the verified seed and the build-time
 * fallback for the public site when a database row has not been imported yet —
 * the same source-fallback pattern `src/lib/content/public.ts` uses.
 *
 * "3 Months" is what the business said. It is stored as months and is NOT
 * silently converted into twelve weeks anywhere.
 */
import type { CourseFeePlan, CourseOperations } from "@/lib/admin/course-operations";
import { CURRENT_TERMS_VERSION } from "./admission-terms";

/**
 * How the institute names itself on admission material. The legal name in
 * `src/lib/site.ts` is unchanged; this is the training-centre line that heads
 * the printed forms and the EMCAD DAHAO course page.
 */
export const TRAINING_CENTRE_LINE_EN = "EMCAD DAHAO Embroidery Training Centre";
export const TRAINING_CENTRE_LINE_GU = "EMCAD DAHAO એમ્બ્રોઇડરી ટ્રેનિંગ સેન્ટર";

/** The one digitising package Karma teaches. Karma does not teach Wilcom. */
export const KARMA_SOFTWARE = "EMCAD DAHAO";

export type VerifiedCourseOperations = {
  slug: string;
  /** Months, as the institute states it. Never converted to weeks. */
  durationMonths: number;
  software: string;
  fees: CourseFeePlan;
  termsVersion: number;
  operations: CourseOperations;
};

export const EMCAD_DAHAO_SLUG = "emcad-embroidery-design";

/**
 * Free demo: 2 days, 2 hours a session. The four slots are PREFERENCES a
 * visitor may express, not bookable inventory — Karma keeps no per-date demo
 * capacity, and pretending otherwise would have the site promise a seat that
 * nobody has actually reserved.
 */
const EMCAD_DAHAO_OPERATIONS: CourseOperations = {
  scheduleOptions: [
    { key: "morning-0800", startTime: "08:00", endTime: "12:00", partOfDay: "morning" },
    { key: "midday-1200", startTime: "12:00", endTime: "16:00", partOfDay: "afternoon" },
    { key: "evening-1600", startTime: "16:00", endTime: "20:00", partOfDay: "evening" },
    { key: "night-2000", startTime: "20:00", endTime: "23:00", partOfDay: "night" }
  ],
  demo: {
    days: 2,
    hours: 2,
    free: true,
    slots: [
      { key: "demo-1000", startTime: "10:00", endTime: "12:00" },
      { key: "demo-1400", startTime: "14:00", endTime: "16:00" },
      { key: "demo-1800", startTime: "18:00", endTime: "20:00" },
      { key: "demo-2100", startTime: "21:00", endTime: "23:00" }
    ]
  },
  curriculum: [
    { en: "Multi Design", gu: "મલ્ટી ડિઝાઇન" },
    { en: "Sequence Design (2 to 12)", gu: "સિકવન્સ ડિઝાઇન (2 થી 12)" },
    { en: "Coding Design", gu: "કોડિંગ ડિઝાઇન" },
    { en: "Beads Design (2 to 8)", gu: "બીડ્સ ડિઝાઇન (2 થી 8)" },
    { en: "Laser Design", gu: "લેસર ડિઝાઇન" },
    { en: "Looping Design", gu: "લૂપિંગ ડિઝાઇન" },
    { en: "Chain Stitch Design", gu: "ચેઇન સ્ટિચ ડિઝાઇન" },
    { en: "Towel Work Design", gu: "ટોવેલ વર્ક ડિઝાઇન" },
    { en: "Boring Design", gu: "બોરિંગ ડિઝાઇન" },
    { en: "Zardoshi Design", gu: "ઝરદોશી ડિઝાઇન" },
    { en: "Ribbon Work Design", gu: "રિબન વર્ક ડિઝાઇન" }
  ],
  practical: [
    { en: "100% live practical machine training", gu: "100% લાઇવ પ્રેક્ટિકલ મશીન ટ્રેનિંગ" },
    { en: "Live machine practical", gu: "લાઇવ મશીન પ્રેક્ટિકલ" },
    { en: "Sample making", gu: "સેમ્પલ મેકિંગ" },
    { en: "Device connection & setting", gu: "ડિવાઇસ કનેક્શન અને સેટિંગ" },
    { en: "Machine troubleshooting", gu: "મશીન ટ્રબલશૂટિંગ" },
    { en: "Production knowledge", gu: "પ્રોડક્શન નોલેજ" },
    { en: "Practical machine output", gu: "પ્રેક્ટિકલ મશીન આઉટપુટ" }
  ]
};

/**
 * ₹35,000 total · ₹25,000 at admission · ₹10,000 balance within one month of
 * joining. Displayed transparently on the public site; COLLECTED OFFLINE. There
 * is no gateway, no checkout, no payment link and no UPI request anywhere in
 * this repository, and none is to be added.
 */
export const EMCAD_DAHAO: VerifiedCourseOperations = {
  slug: EMCAD_DAHAO_SLUG,
  durationMonths: 3,
  software: KARMA_SOFTWARE,
  fees: { feeTotal: 35_000, feeAdmission: 25_000, feeBalanceDueDays: 30 },
  termsVersion: CURRENT_TERMS_VERSION,
  operations: EMCAD_DAHAO_OPERATIONS
};

/**
 * Every course whose operational facts the owner has actually confirmed.
 * Deliberately one entry. Adding a course here is a claim that the institute
 * supplied its duration, its fee plan and its timetable in writing.
 */
export const VERIFIED_COURSE_OPERATIONS: VerifiedCourseOperations[] = [EMCAD_DAHAO];

export function verifiedOperationsFor(slug: string): VerifiedCourseOperations | undefined {
  return VERIFIED_COURSE_OPERATIONS.find((c) => c.slug === slug);
}
