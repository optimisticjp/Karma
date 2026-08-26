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

export const admissionSchema = z
  .object({
    locale: z.enum(["en", "gu"]).default("gu"),
    fullName: z.string().trim().min(2).max(160),
    whatsapp: inMobile,
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    courseSlug: z.string().min(1).max(80),
    preferredTiming: z.enum(["morning", "evening"]),
    ageBand: z.enum(["under18", "18-25", "26-40", "40plus"]),
    guardianName: z.string().trim().max(160).optional().or(z.literal("")),
    guardianPhone: z.string().trim().max(20).optional().or(z.literal("")),
    occupation: z.string().min(1).max(40),
    experience: z.string().min(1).max(40),
    area: z.string().trim().min(1).max(160),
    // Audit fix: marketing attribution must not block an admission.
    heardFrom: z.string().max(60).optional().or(z.literal("")),
    goal: z.string().trim().max(1000).optional().or(z.literal("")),
    privacy: z.literal(true),
    comms: z.literal(true),
    utmSource: z.string().max(80).optional().or(z.literal("")),
    utmCampaign: z.string().max(80).optional().or(z.literal("")),
    startedAt: z.number(),
    turnstileToken: z.string().optional(),
    idempotencyKey: z.string().uuid().optional(),
    website: z.string().optional() // honeypot: checked in the route BEFORE validation
  })
  .superRefine((v, ctx) => {
    if (v.ageBand === "under18") {
      if (!v.guardianName || v.guardianName.length < 2)
        ctx.addIssue({ code: "custom", path: ["guardianName"], message: "guardian required" });
      if (!v.guardianPhone || !/^[6-9]\d{9}$/.test(cleanIndianMobile(v.guardianPhone)))
        ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "guardian phone required" });
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
