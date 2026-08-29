"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb, schema } from "@/lib/db";
import { auditValues, CONTENT_AUDIT_ACTIONS } from "@/lib/admin/audit";
import {
  positiveContentId,
  validateContentInput,
  type ContentInput
} from "@/lib/admin/content";

export type ContentState = {
  status: "idle" | "success" | "error";
  message:
    | null
    | "created"
    | "updated"
    | "archived"
    | "denied"
    | "invalid"
    | "missing"
    | "duplicate"
    | "consent"
    | "owner"
    | "media"
    | "migration"
    | "generic";
};

const ok = (message: ContentState["message"]): ContentState => ({ status: "success", message });
const fail = (message: ContentState["message"]): ContentState => ({ status: "error", message });

function pgCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function dbFailure(error: unknown, tag: string): ContentState {
  const code = pgCode(error);
  console.error(tag, code ?? (error instanceof Error ? error.message : "unknown"));
  if (code === "42P01") return fail("migration");
  if (code === "23505") return fail("duplicate");
  if (code === "23503") return fail("missing");
  if (code === "23514" || code === "22P02") return fail("invalid");
  return fail("generic");
}

async function validateLinkedStudent(db: NonNullable<ReturnType<typeof getDb>>, data: ContentInput) {
  if (data.studentId == null) return { exists: true, photoConsent: false };
  const rows = await db
    .select({
      id: schema.students.id,
      photoConsent: schema.students.photoConsent,
      photoConsentAt: schema.students.photoConsentAt
    })
    .from(schema.students)
    .where(eq(schema.students.id, data.studentId))
    .limit(1);
  const row = rows[0];
  return {
    exists: Boolean(row),
    photoConsent: Boolean(row?.photoConsent && row.photoConsentAt)
  };
}

async function publicationProblem(
  db: NonNullable<ReturnType<typeof getDb>>,
  data: ContentInput,
  role: "owner" | "admin"
): Promise<ContentState["message"] | null> {
  const student = await validateLinkedStudent(db, data);
  if (!student.exists) return "missing";
  if (data.status !== "published") return null;

  if (data.kind === "gallery") {
    const payload = data.payload as { mediaUrl?: string };
    if (!payload.mediaUrl) return "media";
    if (data.studentId == null || !student.photoConsent) return "consent";
  }
  if (data.kind === "testimonial" && !data.consentConfirmed) return "consent";
  if (data.kind === "homepage_stat" && (role !== "owner" || !data.ownerVerified)) return "owner";
  return null;
}

function safeAuditPayload(data: ContentInput) {
  return {
    kind: data.kind,
    slug: data.slug,
    studentId: data.studentId,
    status: data.status,
    sortOrder: data.sortOrder,
    consentConfirmed: data.consentConfirmed,
    ownerVerified: data.ownerVerified
  };
}

function publicRevalidate() {
  revalidatePath("/admin/content");
  revalidatePath("/en");
  revalidatePath("/gu");
  revalidatePath("/en/admissions");
  revalidatePath("/gu/admissions");
  revalidatePath("/en/student-work");
  revalidatePath("/gu/student-work");
  revalidatePath("/en/success-stories");
  revalidatePath("/gu/success-stories");
}

export async function createContentAction(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  const auth = await authorizeAction({ permission: "content.manage" });
  if (!auth.ok) return fail("denied");
  const parsed = validateContentInput(Object.fromEntries(formData.entries()));
  if (!parsed.ok) return fail(parsed.reason);

  const db = getDb();
  if (!db) return fail("generic");
  const data: ContentInput = {
    ...parsed.value,
    // An ordinary admin can prepare a number but cannot self-certify it.
    ownerVerified: auth.session.role === "owner" ? parsed.value.ownerVerified : false
  };

  try {
    const problem = await publicationProblem(db, data, auth.session.role);
    if (problem) return fail(problem);
    const now = new Date();

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.contentItems)
        .values({
          kind: data.kind,
          slug: data.slug,
          payload: data.payload as Record<string, unknown>,
          studentId: data.studentId,
          status: data.status,
          sortOrder: data.sortOrder,
          consentConfirmed: data.consentConfirmed,
          consentConfirmedAt: data.consentConfirmed ? now : null,
          consentConfirmedBy: data.consentConfirmed ? auth.session.staff.id : null,
          ownerVerified: data.ownerVerified,
          ownerVerifiedAt: data.ownerVerified ? now : null,
          ownerVerifiedBy: data.ownerVerified ? auth.session.staff.id : null,
          publishedAt: data.status === "published" ? now : null,
          updatedBy: auth.session.staff.id,
          updatedAt: now
        })
        .returning({ id: schema.contentItems.id });
      const id = inserted[0]?.id;
      if (!id) throw new Error("content item insert returned no id");

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CONTENT_AUDIT_ACTIONS.itemCreated,
          entity: "content_item",
          entityId: id,
          newValue: safeAuditPayload(data),
          reason: data.status === "published" ? "website content created and published" : "website content created"
        })
      );
    });
  } catch (error) {
    return dbFailure(error, "[content] create");
  }

  publicRevalidate();
  return ok("created");
}

export async function updateContentAction(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  const auth = await authorizeAction({ permission: "content.manage" });
  if (!auth.ok) return fail("denied");
  const contentId = positiveContentId(formData.get("contentId"));
  const parsed = validateContentInput(Object.fromEntries(formData.entries()));
  if (!contentId || !parsed.ok) return fail(parsed.ok ? "invalid" : parsed.reason);

  const db = getDb();
  if (!db) return fail("generic");

  try {
    const before = await db
      .select({
        id: schema.contentItems.id,
        kind: schema.contentItems.kind,
        slug: schema.contentItems.slug,
        studentId: schema.contentItems.studentId,
        status: schema.contentItems.status,
        sortOrder: schema.contentItems.sortOrder,
        consentConfirmed: schema.contentItems.consentConfirmed,
        consentConfirmedAt: schema.contentItems.consentConfirmedAt,
        consentConfirmedBy: schema.contentItems.consentConfirmedBy,
        ownerVerified: schema.contentItems.ownerVerified,
        ownerVerifiedAt: schema.contentItems.ownerVerifiedAt,
        ownerVerifiedBy: schema.contentItems.ownerVerifiedBy,
        publishedAt: schema.contentItems.publishedAt
      })
      .from(schema.contentItems)
      .where(eq(schema.contentItems.id, contentId))
      .limit(1);
    const existing = before[0];
    if (!existing) return fail("missing");

    const data: ContentInput = {
      ...parsed.value,
      ownerVerified:
        auth.session.role === "owner" ? parsed.value.ownerVerified : existing.ownerVerified
    };
    const problem = await publicationProblem(db, data, auth.session.role);
    if (problem) return fail(problem);
    const now = new Date();
    const justPublished = existing.status !== "published" && data.status === "published";

    await db.transaction(async (tx) => {
      await tx
        .update(schema.contentItems)
        .set({
          kind: data.kind,
          slug: data.slug,
          payload: data.payload as Record<string, unknown>,
          studentId: data.studentId,
          status: data.status,
          sortOrder: data.sortOrder,
          consentConfirmed: data.consentConfirmed,
          consentConfirmedAt: data.consentConfirmed ? existing.consentConfirmedAt ?? now : null,
          consentConfirmedBy: data.consentConfirmed ? existing.consentConfirmedBy ?? auth.session.staff.id : null,
          ownerVerified: data.ownerVerified,
          ownerVerifiedAt: data.ownerVerified ? existing.ownerVerifiedAt ?? now : null,
          ownerVerifiedBy: data.ownerVerified ? existing.ownerVerifiedBy ?? auth.session.staff.id : null,
          publishedAt: data.status === "published" ? existing.publishedAt ?? now : null,
          updatedBy: auth.session.staff.id,
          updatedAt: now
        })
        .where(eq(schema.contentItems.id, contentId));

      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: justPublished ? CONTENT_AUDIT_ACTIONS.itemPublished : CONTENT_AUDIT_ACTIONS.itemUpdated,
          entity: "content_item",
          entityId: contentId,
          oldValue: {
            kind: existing.kind,
            slug: existing.slug,
            studentId: existing.studentId,
            status: existing.status,
            sortOrder: existing.sortOrder,
            consentConfirmed: existing.consentConfirmed,
            ownerVerified: existing.ownerVerified
          },
          newValue: safeAuditPayload(data),
          reason: justPublished ? "website content published" : "website content updated"
        })
      );
    });
  } catch (error) {
    return dbFailure(error, "[content] update");
  }

  publicRevalidate();
  return ok("updated");
}

export async function archiveContentAction(formData: FormData): Promise<void> {
  const auth = await authorizeAction({ permission: "content.manage" });
  if (!auth.ok) return;
  const contentId = positiveContentId(formData.get("contentId"));
  if (!contentId) return;
  const db = getDb();
  if (!db) return;

  try {
    const before = await db
      .select({ id: schema.contentItems.id, status: schema.contentItems.status, slug: schema.contentItems.slug, kind: schema.contentItems.kind })
      .from(schema.contentItems)
      .where(and(eq(schema.contentItems.id, contentId), eq(schema.contentItems.status, "published")))
      .limit(1);
    const existing = before[0] ?? (await db
      .select({ id: schema.contentItems.id, status: schema.contentItems.status, slug: schema.contentItems.slug, kind: schema.contentItems.kind })
      .from(schema.contentItems)
      .where(eq(schema.contentItems.id, contentId))
      .limit(1))[0];
    if (!existing) return;

    await db.transaction(async (tx) => {
      await tx
        .update(schema.contentItems)
        .set({ status: "archived", updatedBy: auth.session.staff.id, updatedAt: new Date() })
        .where(eq(schema.contentItems.id, contentId));
      await tx.insert(schema.auditLogs).values(
        auditValues({
          actor: String(auth.session.staff.id),
          action: CONTENT_AUDIT_ACTIONS.itemArchived,
          entity: "content_item",
          entityId: contentId,
          oldValue: { kind: existing.kind, slug: existing.slug, status: existing.status },
          newValue: { status: "archived" },
          reason: "website content archived"
        })
      );
    });
  } catch (error) {
    dbFailure(error, "[content] archive");
    return;
  }

  publicRevalidate();
}
