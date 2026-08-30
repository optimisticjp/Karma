import { z } from "zod";
import { cleanIndianMobile } from "./phone";

const inMobile = z
  .string()
  .transform(cleanIndianMobile)
  .refine((s) => /^[6-9]\d{9}$/.test(s), "invalid mobile");

const isoDateNotPast = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00");
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime() - 24 * 60 * 60 * 1000;
};

/** A slot key from a course's timetable or demo policy. Validated against the
 *  course's OWN options in the route — this only checks the shape. */
const slotKey = z
  .string()
  .trim()
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid slot");

export const admissionSchema = z
  .object({
    locale: z.enum(["en", "gu"]).default("gu"),
    fullName: z.string().trim().min(2).max(160),
    whatsapp: inMobile,
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    courseSlug: z.string().min(1).max(80),
    preferredTiming: z.enum(["morning", "evening"]),
    /** The exact timetable slot the applicant asked for, when the course has one. */
    preferredSchedule: slotKey.optional().or(z.literal("")),
    /** The free-demo slot they would prefer. A preference, not a booking. */
    demoSlot: slotKey.optional().or(z.literal("")),
    ageBand: z.enum(["under18", "18-25", "26-40", "40plus"]),
    fatherName: z.string().trim().max(160).optional().or(z.literal("")),
    guardianName: z.string().trim().max(160).optional().or(z.literal("")),
    /**
     * REQUIRED for every applicant, not only under-18s. Owner decision,
     * 2026-08-30: the institute wants a parent/guardian contact on every
     * admission. It is enforced here rather than in the database because
     * applications taken before that decision legitimately have none, and
     * migrations in this repository are additive.
     */
    guardianPhone: inMobile,
    referenceName: z.string().trim().max(160).optional().or(z.literal("")),
    referencePhone: z.string().trim().max(20).optional().or(z.literal("")),
    occupation: z.string().min(1).max(40),
    experience: z.string().min(1).max(40),
    area: z.string().trim().min(1).max(160),
    // Audit fix: marketing attribution must not block an admission.
    heardFrom: z.string().max(60).optional().or(z.literal("")),
    goal: z.string().trim().max(1000).optional().or(z.literal("")),
    privacy: z.literal(true),
    comms: z.literal(true),
    /** Acceptance of the institute's admission norms. */
    terms: z.literal(true),
    /** Which version was shown. Checked against the known versions in the route. */
    termsVersion: z.number().int().positive(),
    utmSource: z.string().max(80).optional().or(z.literal("")),
    utmCampaign: z.string().max(80).optional().or(z.literal("")),
    startedAt: z.number(),
    turnstileToken: z.string().optional(),
    idempotencyKey: z.string().uuid().optional(),
    website: z.string().optional() // honeypot: checked in the route BEFORE validation
  })
  .superRefine((v, ctx) => {
    if (v.ageBand === "under18" && (!v.guardianName || v.guardianName.length < 2)) {
      ctx.addIssue({ code: "custom", path: ["guardianName"], message: "guardian required" });
    }
    /* A guardian number that is the student's own number is not a second
       contact. Catching it here saves the front desk a wasted call. */
    if (v.guardianPhone === v.whatsapp) {
      ctx.addIssue({
        code: "custom",
        path: ["guardianPhone"],
        message: "guardian phone must differ"
      });
    }
    if (v.referencePhone && !/^[6-9]\d{9}$/.test(cleanIndianMobile(v.referencePhone))) {
      ctx.addIssue({ code: "custom", path: ["referencePhone"], message: "invalid mobile" });
    }
  });

export type AdmissionInput = z.infer<typeof admissionSchema>;

export const briefSchema = z.object({
  locale: z.enum(["en", "gu"]).default("en"),
  name: z.string().trim().min(2).max(160),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  phone: inMobile,
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  productType: z.string().trim().max(120).optional().or(z.literal("")),
  technique: z.string().trim().max(120).optional().or(z.literal("")),
  dimensions: z.string().trim().max(120).optional().or(z.literal("")),
  quantity: z.string().trim().max(60).optional().or(z.literal("")),
  colourCount: z.string().trim().max(40).optional().or(z.literal("")),
  fileFormat: z.string().trim().max(60).optional().or(z.literal("")),
  deadline: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((s) => !s || isoDateNotPast(s), "invalid date"),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
  startedAt: z.coerce.number(),
  turnstileToken: z.string().optional(),
  website: z.string().optional()
});

export type BriefInput = z.infer<typeof briefSchema>;
