import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";
import { staff, students } from "./schema";

/**
 * Staff-managed website content.
 *
 * A deliberately small, typed CMS rather than a generic page-builder. The
 * public site has a strong editorial system already; staff need to maintain
 * proof and frequently-changing content without being able to accidentally
 * dismantle layouts, typography or navigation.
 *
 * Supported kinds:
 * - faq            question + answer in EN/GU
 * - gallery        consented student work
 * - testimonial    consented student outcome/story
 * - homepage_stat  owner-verified numeric proof only
 *
 * `payload` is validated by src/lib/admin/content.ts before every write and is
 * never trusted merely because it came back from Postgres.
 */
export const contentItems = pgTable(
  "content_items",
  {
    id: serial("id").primaryKey(),
    kind: varchar("kind", { length: 30 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    studentId: integer("student_id").references(() => students.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),

    /**
     * Testimonial consent is separate from the student's photo-consent flag.
     * It records that staff has the student's permission to publish the quote.
     */
    consentConfirmed: boolean("consent_confirmed").notNull().default(false),
    consentConfirmedAt: timestamp("consent_confirmed_at", { withTimezone: true }),
    consentConfirmedBy: integer("consent_confirmed_by").references(() => staff.id),

    /** Homepage number claims are publishable only after the Owner verifies them. */
    ownerVerified: boolean("owner_verified").notNull().default(false),
    ownerVerifiedAt: timestamp("owner_verified_at", { withTimezone: true }),
    ownerVerifiedBy: integer("owner_verified_by").references(() => staff.id),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedBy: integer("updated_by").references(() => staff.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("uq_content_kind_slug").on(t.kind, t.slug),
    index("idx_content_kind_status").on(t.kind, t.status),
    index("idx_content_student").on(t.studentId),
    check(
      "chk_content_kind",
      sql`${t.kind} in ('faq', 'gallery', 'testimonial', 'homepage_stat')`
    ),
    check("chk_content_status", sql`${t.status} in ('draft', 'published', 'archived')`)
  ]
);
