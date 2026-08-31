import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  EMPTY_OPERATIONS,
  addDays,
  balanceOf,
  parseCourseOperations,
  partOfDayFor,
  readCourseOperations,
  slotHours,
  slotMinutes
} from "@/lib/admin/course-operations";
import {
  ADMISSION_TERMS,
  CURRENT_TERMS_VERSION,
  admissionTerms,
  currentAdmissionTerms,
  isKnownTermsVersion
} from "@/content/admission-terms";
import {
  EMCAD_DAHAO,
  EMCAD_DAHAO_SLUG,
  KARMA_SOFTWARE,
  VERIFIED_COURSE_OPERATIONS,
  verifiedOperationsFor
} from "@/content/course-operations";
import { courses } from "@/content/courses";
import {
  CATALOG_RESEED_FIELDS,
  VERIFIED_CATALOG_ROWS,
  VERIFIED_OPERATIONS_ROWS,
  catalogReseedSet
} from "@/lib/admin/catalog-import";

const read = (p: string) => readFileSync(p, "utf8");

/* ------------------------- the verified course facts ---------------------- */

describe("EMCAD DAHAO — the facts the owner supplied", () => {
  it("is three MONTHS, and is never restated as weeks", () => {
    // "3 Months" is what the business said. Twelve weeks is a different
    // sentence, and it is not the one the institute prints on its own sheet.
    expect(EMCAD_DAHAO.durationMonths).toBe(3);
    const course = courses.find((c) => c.slug === EMCAD_DAHAO_SLUG);
    expect(course?.durationMonths).toBe(3);
    expect(course?.durationWeeks).toBeNull();
  });

  it("does not leak its duration or its fee onto any other course", () => {
    // The single most plausible way this task goes wrong: one course's
    // confirmed facts quietly becoming the catalogue's defaults.
    expect(VERIFIED_COURSE_OPERATIONS.map((c) => c.slug)).toEqual([EMCAD_DAHAO_SLUG]);
    for (const course of courses) {
      if (course.slug === EMCAD_DAHAO_SLUG) continue;
      expect(course.durationMonths, course.slug).toBeNull();
      expect(course.durationWeeks, course.slug).toBeNull();
      expect(verifiedOperationsFor(course.slug), course.slug).toBeUndefined();
    }
  });

  it("carries the fee plan exactly: 35,000 total, 25,000 at admission, 10,000 in a month", () => {
    expect(EMCAD_DAHAO.fees.feeTotal).toBe(35_000);
    expect(EMCAD_DAHAO.fees.feeAdmission).toBe(25_000);
    expect(balanceOf(EMCAD_DAHAO.fees)).toBe(10_000);
    expect(EMCAD_DAHAO.fees.feeBalanceDueDays).toBe(30);
  });

  it("teaches EMCAD DAHAO and names no other software", () => {
    expect(EMCAD_DAHAO.software).toBe(KARMA_SOFTWARE);
    expect(KARMA_SOFTWARE).toBe("EMCAD DAHAO");
  });

  it("offers four batch timings — three of four hours and one night batch of three", () => {
    const slots = EMCAD_DAHAO.operations.scheduleOptions;
    expect(slots.map((s) => `${s.startTime}-${s.endTime}`)).toEqual([
      "08:00-12:00",
      "12:00-16:00",
      "16:00-20:00",
      "20:00-23:00"
    ]);
    expect(slots.slice(0, 3).every((s) => slotHours(s.startTime, s.endTime) === 4)).toBe(true);
    expect(slotHours(slots[3].startTime, slots[3].endTime)).toBe(3);
    expect(slots[3].partOfDay).toBe("night");
  });

  it("offers a free two-day demo with four two-hour slots", () => {
    const demo = EMCAD_DAHAO.operations.demo;
    expect(demo?.free).toBe(true);
    expect(demo?.days).toBe(2);
    expect(demo?.hours).toBe(2);
    expect(demo?.slots.map((s) => `${s.startTime}-${s.endTime}`)).toEqual([
      "10:00-12:00",
      "14:00-16:00",
      "18:00-20:00",
      "21:00-23:00"
    ]);
    for (const slot of demo?.slots ?? []) {
      expect(slotHours(slot.startTime, slot.endTime), slot.key).toBe(2);
    }
  });

  it("lists every technique and every practical point the institute named", () => {
    expect(EMCAD_DAHAO.operations.curriculum.map((c) => c.en)).toEqual([
      "Multi Design",
      "Sequence Design (2 to 12)",
      "Coding Design",
      "Beads Design (2 to 8)",
      "Laser Design",
      "Looping Design",
      "Chain Stitch Design",
      "Towel Work Design",
      "Boring Design",
      "Zardoshi Design",
      "Ribbon Work Design"
    ]);
    expect(EMCAD_DAHAO.operations.practical).toHaveLength(7);
    // Bilingual parity is not optional for anything a student reads.
    for (const line of [
      ...EMCAD_DAHAO.operations.curriculum,
      ...EMCAD_DAHAO.operations.practical
    ]) {
      expect(line.en.trim().length, line.en).toBeGreaterThan(0);
      expect(line.gu.trim().length, line.en).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------ no gateway -------------------------------- */

describe("there is still no way to pay online", () => {
  it("names no payment provider anywhere in the source", () => {
    // The fee is now published. That is transparency, not commerce: the
    // moment a provider appears in this tree, someone has crossed the line.
    const sources = [
      "src/content/course-operations.ts",
      "src/components/kds/FeeSheet.tsx",
      "src/components/kds/courses/CourseFacts.tsx",
      "src/components/kds/home/EmcadPanel.tsx",
      "src/app/[locale]/courses/[slug]/page.tsx",
      "src/lib/schema.ts"
    ].map(read).join("\n").toLowerCase();
    // Provider names and payment intents only. The prose in these files says
    // "no checkout, no payment link" out loud, so matching on those words
    // would fail on the very sentence that states the policy.
    for (const banned of ["razorpay", "stripe", "payu", "cashfree", "paytm", "upi://", "pay now"]) {
      expect(sources, banned).not.toContain(banned);
    }
  });
});

/* ---------------------------- admission terms ----------------------------- */

describe("admission norms are versioned", () => {
  it("has exactly one active version, and it is the current one", () => {
    const active = ADMISSION_TERMS.filter((t) => t.status === "active");
    expect(active).toHaveLength(1);
    expect(active[0].version).toBe(CURRENT_TERMS_VERSION);
    expect(currentAdmissionTerms().version).toBe(CURRENT_TERMS_VERSION);
  });

  it("carries all fifteen institute rules, numbered as printed, in both languages", () => {
    const terms = currentAdmissionTerms();
    expect(terms.clauses).toHaveLength(15);
    expect(terms.clauses.map((c) => c.n)).toEqual([...Array(15)].map((_, i) => i + 1));
    for (const clause of terms.clauses) {
      expect(clause.gu.trim().length, `gu #${clause.n}`).toBeGreaterThan(0);
      expect(clause.en.trim().length, `en #${clause.n}`).toBeGreaterThan(0);
    }
  });

  it("keeps the commercial rules intact rather than softening them", () => {
    // Rules 8, 12 and 14 are the ones a well-meaning rewrite would blur.
    const terms = currentAdmissionTerms();
    const byNumber = (n: number) => terms.clauses.find((c) => c.n === n);
    expect(byNumber(1)?.gu).toContain("EMCAD DAHAO");
    expect(byNumber(2)?.gu).toContain("100% Live Practical Machine");
    expect(byNumber(8)?.en.toLowerCase()).toContain("will not be refunded");
    expect(byNumber(12)?.en.toLowerCase()).toContain("will not be refunded");
    expect(byNumber(14)?.en.toLowerCase()).toContain("no fees paid will be refunded");
    expect(byNumber(5)?.en.toLowerCase()).toContain("free of charge");
  });

  it("carries the student declaration in both languages", () => {
    const terms = currentAdmissionTerms();
    expect(terms.declarationGu).toContain("KARMA DESIGN STUDIO");
    expect(terms.declarationEn.toLowerCase()).toContain("read, understood and accepted");
  });

  it("recognises known versions and rejects anything else", () => {
    expect(isKnownTermsVersion(CURRENT_TERMS_VERSION)).toBe(true);
    expect(isKnownTermsVersion(999)).toBe(false);
    expect(isKnownTermsVersion("1")).toBe(false);
    expect(isKnownTermsVersion(null)).toBe(false);
    expect(admissionTerms(999)).toBeUndefined();
  });

  it("ties the EMCAD DAHAO course to a version that exists", () => {
    expect(isKnownTermsVersion(EMCAD_DAHAO.termsVersion)).toBe(true);
  });
});

/* ------------------------------- validation ------------------------------- */

describe("course operations validation", () => {
  const valid = {
    scheduleOptions: [{ key: "morning-0800", startTime: "08:00", endTime: "12:00" }],
    demo: { days: 2, hours: 2, free: true, slots: [{ key: "d1", startTime: "10:00", endTime: "12:00" }] },
    curriculum: [{ en: "Multi Design", gu: "મલ્ટી ડિઝાઇન" }],
    practical: [{ en: "Sample making", gu: "સેમ્પલ મેકિંગ" }]
  };

  it("accepts a well-formed payload and derives the part of day", () => {
    const parsed = parseCourseOperations(valid);
    expect(parsed?.scheduleOptions[0].partOfDay).toBe("morning");
    expect(parsed?.demo?.slots).toHaveLength(1);
  });

  it("treats null as an empty, valid configuration", () => {
    expect(parseCourseOperations(null)).toEqual(EMPTY_OPERATIONS);
  });

  it("rejects a slot that ends before it starts, or at the same minute", () => {
    expect(
      parseCourseOperations({ ...valid, scheduleOptions: [{ key: "a", startTime: "12:00", endTime: "08:00" }] })
    ).toBeNull();
    expect(
      parseCourseOperations({ ...valid, scheduleOptions: [{ key: "a", startTime: "12:00", endTime: "12:00" }] })
    ).toBeNull();
  });

  it("rejects a malformed time, a bad key and a duplicate key", () => {
    expect(parseCourseOperations({ ...valid, scheduleOptions: [{ key: "a", startTime: "8:00", endTime: "12:00" }] })).toBeNull();
    expect(parseCourseOperations({ ...valid, scheduleOptions: [{ key: "Not A Key", startTime: "08:00", endTime: "12:00" }] })).toBeNull();
    expect(
      parseCourseOperations({
        ...valid,
        scheduleOptions: [
          { key: "a", startTime: "08:00", endTime: "12:00" },
          { key: "a", startTime: "12:00", endTime: "16:00" }
        ]
      })
    ).toBeNull();
  });

  it("rejects a curriculum line that is missing one of the two languages", () => {
    expect(parseCourseOperations({ ...valid, curriculum: [{ en: "Multi Design", gu: "" }] })).toBeNull();
    expect(parseCourseOperations({ ...valid, curriculum: [{ en: "", gu: "મલ્ટી" }] })).toBeNull();
  });

  it("rejects an over-long list rather than truncating it", () => {
    const many = Array.from({ length: 41 }, (_, i) => ({ en: `t${i}`, gu: `ટ${i}` }));
    expect(parseCourseOperations({ ...valid, curriculum: many })).toBeNull();
  });

  it("round-trips the real EMCAD DAHAO payload", () => {
    expect(parseCourseOperations(JSON.parse(JSON.stringify(EMCAD_DAHAO.operations)))).toEqual(
      EMCAD_DAHAO.operations
    );
  });

  it("degrades to empty rather than throwing when stored data has drifted", () => {
    // A staff page must not 500 because a payload was hand-edited in Postgres.
    expect(readCourseOperations({ scheduleOptions: "nonsense" })).toEqual(EMPTY_OPERATIONS);
  });

  it("computes slot lengths and parts of day", () => {
    expect(slotMinutes("08:00", "12:00")).toBe(240);
    expect(slotHours("20:00", "23:00")).toBe(3);
    expect(slotHours("10:00", "11:30")).toBe(1.5);
    expect(partOfDayFor("08:00")).toBe("morning");
    expect(partOfDayFor("12:00")).toBe("afternoon");
    expect(partOfDayFor("16:00")).toBe("evening");
    expect(partOfDayFor("20:00")).toBe("night");
  });

  it("adds days across a month boundary for the balance due date", () => {
    expect(addDays("2026-01-15", 30)).toBe("2026-02-14");
    expect(addDays("2026-12-20", 30)).toBe("2027-01-19");
  });
});

/* ----------------------- seed / import order coherence -------------------- */

describe("the seed and the console import agree about ordering", () => {
  /**
   * The bug this pins: `scripts/seed.ts` derived a ZERO-based `sortOrder` and
   * upserted it, while `catalog-import.ts` derived a ONE-based one and never
   * touched an existing row. So the two disagreed by one on every course, and
   * running `npm run db:seed` against a live database silently renumbered the
   * catalogue and undid the order the owner had arranged in Karma Console.
   */
  const seedSource = read("scripts/seed.ts");

  it("has one projection, used by both paths", () => {
    expect(seedSource).toContain("VERIFIED_CATALOG_ROWS");
    expect(seedSource).not.toContain("sortOrder: i");
    expect(VERIFIED_CATALOG_ROWS.map((c) => c.sortOrder)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]);
  });

  it("never lets a re-seed overwrite operator-managed course fields", () => {
    // sortOrder, active, publicVisible, the fee plan, the timetable and the
    // archive state all belong to the operator once a row exists.
    expect([...CATALOG_RESEED_FIELDS]).toEqual(["nameEn", "nameGu", "family", "modules"]);
    const set = catalogReseedSet(VERIFIED_CATALOG_ROWS[0]) as Record<string, unknown>;
    for (const forbidden of [
      "sortOrder",
      "active",
      "publicVisible",
      "feeTotal",
      "feeAdmission",
      "operations",
      "archivedAt"
    ]) {
      expect(set, forbidden).not.toHaveProperty(forbidden);
    }
    expect(seedSource).toContain("set: catalogReseedSet(row)");
  });

  it("projects verified operational facts only for confirmed courses", () => {
    expect(VERIFIED_OPERATIONS_ROWS.map((r) => r.slug)).toEqual([EMCAD_DAHAO_SLUG]);
    expect(VERIFIED_OPERATIONS_ROWS[0].feeTotal).toBe(35_000);
    const unconfirmed = VERIFIED_CATALOG_ROWS.filter((r) => r.slug !== EMCAD_DAHAO_SLUG);
    expect(unconfirmed.every((r) => r.feeTotal == null && r.durationMonths == null)).toBe(true);
  });

  it("keeps the operational apply path owner-only, audited and separate from the insert-only import", () => {
    const actions = read("src/app/admin/(console)/courses/import/actions.ts");
    expect(actions).toContain("authorizeAction({ ownerOnly: true })");
    expect(actions).toContain("onConflictDoNothing({ target: schema.courses.slug })");
    expect(actions).toContain('reason: "verified operational facts applied"');
    expect(actions).toContain("CATALOG_AUDIT_ACTIONS.courseUpdated");
  });
});
