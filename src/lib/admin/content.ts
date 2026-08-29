export const CONTENT_KINDS = ["faq", "gallery", "testimonial", "homepage_stat"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const GALLERY_TECHNIQUES = [
  "zardosi",
  "beads",
  "sequence",
  "coding",
  "chain",
  "laser",
  "tufting",
  "emcad"
] as const;
export type GalleryTechnique = (typeof GALLERY_TECHNIQUES)[number];

export type FaqPayload = {
  questionEn: string;
  questionGu: string;
  answerEn: string;
  answerGu: string;
};

export type GalleryPayload = {
  technique: GalleryTechnique;
  titleEn: string;
  titleGu: string;
  noteEn: string;
  noteGu: string;
  mediaUrl: string;
};

export type TestimonialPayload = {
  nameEn: string;
  nameGu: string;
  courseEn: string;
  courseGu: string;
  quoteEn: string;
  quoteGu: string;
  beforeEn: string;
  beforeGu: string;
  afterEn: string;
  afterGu: string;
  mediaUrl: string;
};

export type HomepageStatPayload = {
  labelEn: string;
  labelGu: string;
  value: string;
};

export type ContentPayload = FaqPayload | GalleryPayload | TestimonialPayload | HomepageStatPayload;

export type ContentInput = {
  kind: ContentKind;
  slug: string;
  payload: ContentPayload;
  studentId: number | null;
  status: ContentStatus;
  sortOrder: number;
  consentConfirmed: boolean;
  ownerVerified: boolean;
};

export type ContentValidation =
  | { ok: true; value: ContentInput }
  | { ok: false; reason: "invalid" | "media" };

const KIND_SET: ReadonlySet<string> = new Set(CONTENT_KINDS);
const STATUS_SET: ReadonlySet<string> = new Set(CONTENT_STATUSES);
const TECHNIQUE_SET: ReadonlySet<string> = new Set(GALLERY_TECHNIQUES);

export function isContentKind(value: unknown): value is ContentKind {
  return typeof value === "string" && KIND_SET.has(value);
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === "string" && STATUS_SET.has(value);
}

function requiredText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= 1 && clean.length <= max ? clean : null;
}

function optionalText(value: unknown, max: number): string | null {
  if (value == null || value === "") return "";
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length <= max ? clean : null;
}

function slug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean) && clean.length <= 100 ? clean : null;
}

function integer(value: unknown, min: number, max: number): number | null {
  if (value == null || value === "") return min;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function optionalPositiveId(value: unknown): number | null | undefined {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function checked(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

function mediaUrl(value: unknown): string | null {
  const clean = optionalText(value, 500);
  if (clean == null) return null;
  if (!clean) return "";
  if (clean.startsWith("/")) return clean;
  try {
    const url = new URL(clean);
    return url.protocol === "https:" ? clean : null;
  } catch {
    return null;
  }
}

/**
 * Pure validator used by the Content Desk server action and regression tests.
 * It validates the JSON shape before it ever reaches Postgres.
 */
export function validateContentInput(input: Record<string, unknown>): ContentValidation {
  if (!isContentKind(input.kind) || !isContentStatus(input.status)) return { ok: false, reason: "invalid" };
  const cleanSlug = slug(input.slug);
  const sortOrder = integer(input.sortOrder, 0, 10_000);
  const studentId = optionalPositiveId(input.studentId);
  if (!cleanSlug || sortOrder == null || studentId === undefined) return { ok: false, reason: "invalid" };

  let payload: ContentPayload;
  if (input.kind === "faq") {
    const questionEn = requiredText(input.questionEn, 300);
    const questionGu = requiredText(input.questionGu, 500);
    const answerEn = requiredText(input.answerEn, 2_000);
    const answerGu = requiredText(input.answerGu, 3_000);
    if (!questionEn || !questionGu || !answerEn || !answerGu) return { ok: false, reason: "invalid" };
    payload = { questionEn, questionGu, answerEn, answerGu };
  } else if (input.kind === "gallery") {
    const technique = typeof input.technique === "string" && TECHNIQUE_SET.has(input.technique)
      ? (input.technique as GalleryTechnique)
      : null;
    const titleEn = requiredText(input.titleEn, 200);
    const titleGu = requiredText(input.titleGu, 300);
    const noteEn = optionalText(input.noteEn, 500);
    const noteGu = optionalText(input.noteGu, 700);
    const cleanMediaUrl = mediaUrl(input.mediaUrl);
    if (!technique || !titleEn || !titleGu || noteEn == null || noteGu == null || cleanMediaUrl == null) {
      return { ok: false, reason: "invalid" };
    }
    if (input.status === "published" && !cleanMediaUrl) return { ok: false, reason: "media" };
    payload = { technique, titleEn, titleGu, noteEn, noteGu, mediaUrl: cleanMediaUrl };
  } else if (input.kind === "testimonial") {
    const nameEn = requiredText(input.nameEn, 160);
    const nameGu = requiredText(input.nameGu, 240);
    const courseEn = requiredText(input.courseEn, 160);
    const courseGu = requiredText(input.courseGu, 240);
    const quoteEn = requiredText(input.quoteEn, 1_200);
    const quoteGu = requiredText(input.quoteGu, 1_800);
    const beforeEn = optionalText(input.beforeEn, 300);
    const beforeGu = optionalText(input.beforeGu, 450);
    const afterEn = optionalText(input.afterEn, 300);
    const afterGu = optionalText(input.afterGu, 450);
    const cleanMediaUrl = mediaUrl(input.mediaUrl);
    if (!nameEn || !nameGu || !courseEn || !courseGu || !quoteEn || !quoteGu || beforeEn == null || beforeGu == null || afterEn == null || afterGu == null || cleanMediaUrl == null) {
      return { ok: false, reason: "invalid" };
    }
    payload = {
      nameEn,
      nameGu,
      courseEn,
      courseGu,
      quoteEn,
      quoteGu,
      beforeEn,
      beforeGu,
      afterEn,
      afterGu,
      mediaUrl: cleanMediaUrl
    };
  } else {
    const labelEn = requiredText(input.labelEn, 120);
    const labelGu = requiredText(input.labelGu, 180);
    const value = requiredText(input.value, 24);
    if (!labelEn || !labelGu || !value || !/\d/.test(value)) return { ok: false, reason: "invalid" };
    payload = { labelEn, labelGu, value };
  }

  return {
    ok: true,
    value: {
      kind: input.kind,
      slug: cleanSlug,
      payload,
      studentId,
      status: input.status,
      sortOrder,
      consentConfirmed: checked(input.consentConfirmed),
      ownerVerified: checked(input.ownerVerified)
    }
  };
}

export function positiveContentId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function contentSummary(kind: ContentKind, payload: unknown): string {
  if (!payload || typeof payload !== "object") return "—";
  const p = payload as Record<string, unknown>;
  const candidate = kind === "faq"
    ? p.questionEn
    : kind === "gallery"
      ? p.titleEn
      : kind === "testimonial"
        ? p.nameEn
        : p.labelEn;
  return typeof candidate === "string" && candidate.trim() ? candidate : "—";
}
