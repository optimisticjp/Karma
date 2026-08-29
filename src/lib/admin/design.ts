import { cleanIndianMobile, isIndianMobile } from "@/lib/phone";

export const DESIGN_STATUSES = [
  "new",
  "review",
  "info_needed",
  "quote_prepared",
  "quote_sent",
  "approved",
  "in_progress",
  "sample_shared",
  "revision",
  "finalised",
  "delivered",
  "closed"
] as const;
export type DesignStatus = (typeof DESIGN_STATUSES)[number];

export function isDesignStatus(value: unknown): value is DesignStatus {
  return typeof value === "string" && DESIGN_STATUSES.includes(value as DesignStatus);
}

function text(value: unknown, max: number): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function optional(value: unknown, max: number): string | null { return text(value, max) || null; }
function date(value: unknown): string | null | "invalid" { const v = text(value, 10); return !v ? null : /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "invalid"; }

export type DesignJobInput = {
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  productType: string | null;
  technique: string | null;
  dimensions: string | null;
  quantity: string | null;
  colourCount: string | null;
  fileFormat: string | null;
  deadline: string | null;
  details: string | null;
  locale: "en" | "gu";
};

export function validateDesignJob(input: Record<string, unknown>): { ok: true; value: DesignJobInput } | { ok: false } {
  const name = text(input.name, 160);
  const phone = cleanIndianMobile(text(input.phone, 30));
  const email = optional(input.email, 160)?.toLowerCase() ?? null;
  const deadline = date(input.deadline);
  if (name.length < 2 || !isIndianMobile(phone) || deadline === "invalid") return { ok: false };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false };
  return { ok: true, value: {
    name,
    company: optional(input.company, 160),
    phone,
    email,
    productType: optional(input.productType, 120),
    technique: optional(input.technique, 120),
    dimensions: optional(input.dimensions, 120),
    quantity: optional(input.quantity, 60),
    colourCount: optional(input.colourCount, 40),
    fileFormat: optional(input.fileFormat, 60),
    deadline,
    details: optional(input.details, 4000),
    locale: input.locale === "gu" ? "gu" : "en"
  } };
}

export function positiveDesignId(value: unknown): number | null { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : null; }
export function designNote(value: unknown): string | null { const v = text(value, 300); return v || null; }
