import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import {
  faqs as sourceFaqs,
  galleryItems as sourceGallery,
  stories as sourceStories,
  type Faq,
  type GalleryItem,
  type Story
} from "@/content/collections";
import { GALLERY_TECHNIQUES } from "@/lib/admin/content";

export type ManagedGalleryItem = GalleryItem & { mediaUrl?: string };
export type ManagedStory = Story & { mediaUrl?: string };
export type HomepageStat = { labelEn: string; labelGu: string; value: string; slug: string };

type PublishedRow = {
  slug: string;
  payload: unknown;
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: Record<string, unknown>, key: string, required = true): string | null {
  const candidate = value[key];
  if (typeof candidate !== "string") return required ? null : "";
  const clean = candidate.trim();
  if (required && !clean) return null;
  return clean;
}

/**
 * Public reads fail soft only for the Content Desk table. This is deliberate:
 * code can deploy before migration 0003 is applied and the existing verified
 * source content stays online. No other database failure is turned into fake
 * content; it is logged and the same source fallback is used.
 */
async function published(kind: "faq" | "gallery" | "testimonial" | "homepage_stat"): Promise<PublishedRow[]> {
  const db = getDb();
  if (!db) return [];
  try {
    return await db
      .select({ slug: schema.contentItems.slug, payload: schema.contentItems.payload })
      .from(schema.contentItems)
      .where(and(eq(schema.contentItems.kind, kind), eq(schema.contentItems.status, "published")))
      .orderBy(asc(schema.contentItems.sortOrder), asc(schema.contentItems.id));
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error
      ? (error as { code?: unknown }).code
      : null;
    if (code !== "42P01") {
      console.error(`[content-public] ${kind} read failed`, code ?? (error instanceof Error ? error.message : "unknown"));
    }
    return [];
  }
}

export async function getPublicFaqs(): Promise<Faq[]> {
  const rows = await published("faq");
  const managed = rows.flatMap((row) => {
    const p = record(row.payload);
    if (!p) return [];
    const qEn = text(p, "questionEn");
    const qGu = text(p, "questionGu");
    const aEn = text(p, "answerEn");
    const aGu = text(p, "answerGu");
    return qEn && qGu && aEn && aGu ? [{ qEn, qGu, aEn, aGu }] : [];
  });
  if (managed.length === 0) return sourceFaqs;

  // Managed answers win, but existing verified source FAQs stay available until
  // staff has deliberately recreated/replaced them in Content Desk.
  const managedQuestions = new Set(managed.map((item) => item.qEn.trim().toLowerCase()));
  return [
    ...managed,
    ...sourceFaqs.filter((item) => !managedQuestions.has(item.qEn.trim().toLowerCase()))
  ];
}

export async function getPublicStories(): Promise<ManagedStory[]> {
  const rows = await published("testimonial");
  const managed = rows.flatMap((row) => {
    const p = record(row.payload);
    if (!p) return [];
    const nameEn = text(p, "nameEn");
    const nameGu = text(p, "nameGu");
    const courseEn = text(p, "courseEn");
    const courseGu = text(p, "courseGu");
    const quoteEn = text(p, "quoteEn");
    const quoteGu = text(p, "quoteGu");
    const beforeEn = text(p, "beforeEn", false);
    const beforeGu = text(p, "beforeGu", false);
    const afterEn = text(p, "afterEn", false);
    const afterGu = text(p, "afterGu", false);
    const mediaUrl = text(p, "mediaUrl", false);
    if (!nameEn || !nameGu || !courseEn || !courseGu || !quoteEn || !quoteGu || beforeEn == null || beforeGu == null || afterEn == null || afterGu == null || mediaUrl == null) return [];
    return [{
      sample: false,
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
      photoLabel: `${nameEn} — published student story`,
      ...(mediaUrl ? { mediaUrl } : {})
    }];
  });
  // Once a real consented story exists, sample stories disappear entirely.
  return managed.length > 0 ? managed : sourceStories;
}

export async function getPublicGallery(): Promise<ManagedGalleryItem[]> {
  const rows = await published("gallery");
  const techniques = new Set<string>(GALLERY_TECHNIQUES);
  const managed = rows.flatMap((row) => {
    const p = record(row.payload);
    if (!p) return [];
    const technique = text(p, "technique");
    const titleEn = text(p, "titleEn");
    const titleGu = text(p, "titleGu");
    const noteEn = text(p, "noteEn", false);
    const noteGu = text(p, "noteGu", false);
    const mediaUrl = text(p, "mediaUrl");
    if (!technique || !techniques.has(technique) || !titleEn || !titleGu || noteEn == null || noteGu == null || !mediaUrl) return [];
    return [{
      sample: false,
      technique,
      ratio: "4/5" as const,
      titleEn,
      titleGu,
      noteEn,
      noteGu,
      hasPair: false,
      photoLabel: `${titleEn} — consented student work`,
      mediaUrl
    }];
  });
  // A real portfolio should never be padded out with labelled fake examples.
  return managed.length > 0 ? managed : sourceGallery;
}

export async function getHomepageStats(): Promise<HomepageStat[]> {
  const rows = await published("homepage_stat");
  return rows.flatMap((row) => {
    const p = record(row.payload);
    if (!p) return [];
    const labelEn = text(p, "labelEn");
    const labelGu = text(p, "labelGu");
    const value = text(p, "value");
    return labelEn && labelGu && value ? [{ labelEn, labelGu, value, slug: row.slug }] : [];
  });
}
