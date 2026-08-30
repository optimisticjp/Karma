/**
 * Karma Design Studio: database schema (Supabase Postgres via Drizzle).
 * Implements the data model from the master plan, section 11.
 *
 * Public site uses: applications, service_enquiries, service_files, courses,
 * batches. Karma Console adds: staff roles + staff_permissions. The remaining
 * tables are modelled ahead of their modules so migrations stay additive.
 *
 * Rules encoded here:
 *  - attendance is unique per (session, student)
 *  - every sensitive mutation should also write to audit_logs (app-level duty)
 *  - consent timestamps are stored, not booleans alone (DPDP)
 *  - exactly one active owner, and at most five admin seats: enforced by
 *    database invariants in drizzle/0002_*.sql, not by UI alone
 */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";

/* ---------------------------------- enums --------------------------------- */

export const localeEnum = pgEnum("locale", ["en", "gu"]);

export const applicationStatusEnum = pgEnum("application_status", [
  "new",
  "contacted",
  "demo_scheduled",
  "visit_done",
  "accepted",
  "waitlisted",
  "documents_pending",
  "enrolled",
  "not_proceeding",
  "closed"
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "applied",
  "active",
  "completed",
  "dropped"
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused"
]);

/**
 * `owner` is the single superuser (bypasses the permission table entirely).
 * `admin` accounts hold explicitly granted permissions and are capped at five.
 * `trainer` is a staff record without Karma Console access; it predates the
 * console and is deliberately preserved.
 *
 * Appended, never reordered: Postgres enum values are positional.
 */
export const staffRoleEnum = pgEnum("staff_role", ["admin", "trainer", "owner"]);

/** Lifecycle of a console login, independent of `staff.active`. */
export const staffStatusEnum = pgEnum("staff_status", [
  "invited",
  "active",
  "deactivated"
]);

export const briefStatusEnum = pgEnum("brief_status", [
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
]);

export const certStatusEnum = pgEnum("cert_status", ["issued", "revoked"]);

/* ---------------------------------- people -------------------------------- */

export const staff = pgTable(
  "staff",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    role: staffRoleEnum("role").notNull().default("trainer"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 160 }),
    /**
     * Supabase Auth user id (a UUID). Kept as varchar rather than converted to
     * the uuid type: existing rows may hold non-UUID values from before this
     * migration, and a destructive cast for aesthetics is not worth the risk
     * (CLAUDE.md: additive migrations). Application code always compares it to
     * `user.id`, which Supabase returns as a string.
     */
    authUserId: varchar("auth_user_id", { length: 64 }).unique(),
    /** Console login lifecycle. `invited` = invitation sent, not yet accepted. */
    status: staffStatusEnum("status").notNull().default("active"),
    /** Master switch. An inactive record is denied by every guard, session or not. */
    active: boolean("active").notNull().default(true),
    /** Karma Console UI language for this person. Public site is unaffected. */
    adminLocale: localeEnum("admin_locale").notNull().default("en"),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    invitedBy: integer("invited_by").references((): AnyPgColumn => staff.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    index("idx_staff_role").on(t.role),
    /**
     * One administrative identity per email address. Case-insensitive, and
     * scoped to console roles so trainer records (which may legitimately share
     * a family mailbox, or have none) are never blocked.
     *
     * Written as `role <> 'trainer'` rather than `role in ('owner','admin')`
     * for two reasons: an index predicate must be IMMUTABLE (so `role::text`
     * is rejected), and the migration that adds 'owner' to staff_role cannot
     * evaluate that new value in the same transaction. Any future console role
     * is therefore covered automatically; a future NON-console role would need
     * this predicate revisited.
     */
    uniqueIndex("uq_staff_console_email")
      .on(sql`lower(${t.email})`)
      .where(sql`${t.email} is not null and ${t.role} <> 'trainer'`)
  ]
);

/**
 * Explicit permission grants. The owner is NOT represented here: the owner
 * bypasses this table and always holds every permission. Ordinary admins hold
 * only what has been granted, and every write to this table is owner-only and
 * audited (CLAUDE.md #7).
 */
export const staffPermissions = pgTable(
  "staff_permissions",
  {
    id: serial("id").primaryKey(),
    staffId: integer("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    /** Validated against PERMISSIONS in src/lib/auth/permissions.ts. */
    permission: varchar("permission", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer("created_by").references(() => staff.id)
  },
  (t) => [
    uniqueIndex("uq_staff_permission").on(t.staffId, t.permission),
    index("idx_staff_permissions_staff").on(t.staffId)
  ]
);

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  admissionNo: varchar("admission_no", { length: 20 }).notNull().unique(), // KDS-2026-0142
  fullName: varchar("full_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 160 }),
  area: varchar("area", { length: 160 }),
  languagePref: localeEnum("language_pref").notNull().default("gu"),
  /** DEPRECATED: never write. Plaintext kiosk PIN idea rejected (audit);
   *  a hashed credential arrives only with the Phase 5 kiosk. Drop in a
   *  supervised migration. */
  pin: varchar("pin", { length: 8 }),
  isMinor: boolean("is_minor").notNull().default(false),
  /** From the institute's printed admission form. Distinct from a guardian. */
  fatherName: varchar("father_name", { length: 160 }),
  /** Who referred this student. Optional: nobody is asked to invent one. */
  referenceName: varchar("reference_name", { length: 160 }),
  referencePhone: varchar("reference_phone", { length: 20 }),
  photoConsent: boolean("photo_consent").notNull().default(false),
  photoConsentAt: timestamp("photo_consent_at", { withTimezone: true }),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedBy: integer("archived_by").references((): AnyPgColumn => staff.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [index("idx_students_archived").on(t.archivedAt)]);

export const guardians = pgTable("guardians", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id, { onDelete: "cascade" }),
  applicationId: integer("application_id").references(() => applications.id, {
    onDelete: "cascade"
  }),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  relation: varchar("relation", { length: 60 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

/* ------------------------------ catalog ----------------------------------- */

/**
 * The course catalogue, and — since the owner supplied verified operational
 * facts (2026-08-30) — the operational source of truth for how a course is
 * timetabled, what it teaches and what it costs.
 *
 * Storage split, deliberate (see src/lib/admin/course-operations.ts):
 *  - money, duration, software and the terms version are COLUMNS, because they
 *    are constrained, queried and snapshotted onto an enrolment;
 *  - the bounded per-course lists (timetable slots, demo slots, curriculum,
 *    practical points) are a single validated JSONB payload, because four
 *    child tables bought nothing but joins.
 *
 * `active` is the public/teaching switch. `archivedAt` is the lifecycle state:
 * an archived course is out of every operational picker but its history — the
 * students who took it, their fees, their certificates — is untouched.
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameGu: varchar("name_gu", { length: 160 }).notNull(),
  family: varchar("family", { length: 40 }).notNull(), // machine | modern | software
  /**
   * Weeks stays for the pre-2026-08-30 model and is null on every course.
   * Durations the owner has confirmed are recorded in MONTHS, because months
   * is what the institute says. Never convert one into the other.
   */
  durationWeeks: integer("duration_weeks"),
  durationMonths: integer("duration_months"),
  /** The digitising package taught, where a course teaches one. */
  software: varchar("software", { length: 80 }),
  /** Whole INR. Displayed publicly; collected offline. There is no gateway. */
  feeTotal: integer("fee_total"),
  feeAdmission: integer("fee_admission"),
  feeBalanceDueDays: integer("fee_balance_due_days"),
  /** Admission-norms version this course admits students under. */
  termsVersion: integer("terms_version"),
  /** Whether the course appears on the public site at all. */
  publicVisible: boolean("public_visible").notNull().default(true),
  modules: jsonb("modules"), // [{titleEn,titleGu,pointsEn[],pointsGu[]}]
  /** Validated by parseCourseOperations() before every write AND after every read. */
  operations: jsonb("operations"),
  active: boolean("active").notNull().default(true),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedBy: integer("archived_by").references(() => staff.id),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    index("idx_courses_archived").on(t.archivedAt),
    check(
      "chk_course_duration_months",
      sql`${t.durationMonths} is null or (${t.durationMonths} > 0 and ${t.durationMonths} <= 60)`
    ),
    /**
     * The admission amount can never exceed the total, and a total is required
     * before an admission amount means anything. Enforced here as well as in
     * the console because a fee plan is what a student's ledger is built from.
     */
    check(
      "chk_course_fees",
      sql`(${t.feeTotal} is null or ${t.feeTotal} >= 0)
        and (${t.feeAdmission} is null or (${t.feeTotal} is not null and ${t.feeAdmission} >= 0 and ${t.feeAdmission} <= ${t.feeTotal}))
        and (${t.feeBalanceDueDays} is null or (${t.feeBalanceDueDays} >= 0 and ${t.feeBalanceDueDays} <= 365))`
    )
  ]);

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).notNull(), // "Zardosi Evening A"
  days: varchar("days", { length: 60 }).notNull(), // "Mon-Sat"
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  seats: integer("seats").notNull().default(10),
  seatsTaken: integer("seats_taken").notNull().default(0),
  language: varchar("language", { length: 60 }).notNull().default("ગુજરાતી + Hindi"),
  trainerId: integer("trainer_id").references(() => staff.id),
  status: varchar("status", { length: 20 }).notNull().default("open"), // open|full|started|done
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedBy: integer("archived_by").references(() => staff.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    index("idx_batches_start").on(t.startDate),
    index("idx_batches_archived").on(t.archivedAt),
    index("idx_batches_status").on(t.status),
    index("idx_batches_course").on(t.courseId),
    check("chk_batch_seats", sql`${t.seats} >= 0 AND ${t.seatsTaken} >= 0 AND ${t.seatsTaken} <= ${t.seats}`),
    check("chk_batch_time", sql`${t.startTime} < ${t.endTime}`)
  ]);

/* ----------------------------- admissions --------------------------------- */

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 20 }).notNull().unique(), // KDS-2026-0001
  fullName: varchar("full_name", { length: 160 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 160 }),
  locale: localeEnum("locale").notNull().default("gu"),
  courseSlug: varchar("course_slug", { length: 80 }),
  preferredTiming: varchar("preferred_timing", { length: 20 }), // morning|evening
  experience: varchar("experience", { length: 40 }),
  occupation: varchar("occupation", { length: 40 }),
  area: varchar("area", { length: 160 }),
  goal: text("goal"),
  heardFrom: varchar("heard_from", { length: 60 }),
  /** DEPRECATED: unused (form uses goal). Drop in a supervised migration. */
  message: text("message"),
  ageBand: varchar("age_band", { length: 20 }), // under18|18-25|26-40|40plus
  fatherName: varchar("father_name", { length: 160 }),
  /**
   * A parent/guardian contact is required on EVERY new application by owner
   * decision (2026-08-30), not only for under-18s. The columns stay nullable
   * because applications taken before that decision have none, and migrations
   * here are additive; the requirement is enforced by validation on the way in.
   */
  guardianName: varchar("guardian_name", { length: 160 }),
  guardianPhone: varchar("guardian_phone", { length: 20 }),
  guardianRelation: varchar("guardian_relation", { length: 60 }),
  referenceName: varchar("reference_name", { length: 160 }),
  referencePhone: varchar("reference_phone", { length: 20 }),
  /** Key of the course schedule option the applicant asked for. */
  preferredSchedule: varchar("preferred_schedule", { length: 40 }),
  /** Key of the free-demo slot the applicant asked for. A preference, not a booking. */
  demoSlot: varchar("demo_slot", { length: 40 }),
  /** Which version of the admission norms was shown, and when it was accepted. */
  termsVersion: integer("terms_version"),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedBy: integer("archived_by").references(() => staff.id),
  privacyConsentAt: timestamp("privacy_consent_at", { withTimezone: true }),
  commsConsentAt: timestamp("comms_consent_at", { withTimezone: true }),
  utmSource: varchar("utm_source", { length: 80 }),
  utmCampaign: varchar("utm_campaign", { length: 80 }),
  duplicateOfPhone: boolean("duplicate_of_phone").notNull().default(false),
  idempotencyKey: varchar("idempotency_key", { length: 40 }).unique(),
  status: applicationStatusEnum("status").notNull().default("new"),
  assignedTo: integer("assigned_to").references(() => staff.id),
  nextFollowUp: date("next_follow_up"),
  closureReason: varchar("closure_reason", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    index("idx_applications_status").on(t.status),
    index("idx_applications_created").on(t.createdAt),
    index("idx_applications_followup").on(t.nextFollowUp),
    index("idx_applications_whatsapp").on(t.whatsapp),
    index("idx_applications_archived").on(t.archivedAt)
  ]);

export const applicationNotes = pgTable("application_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  staffId: integer("staff_id").references(() => staff.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

/**
 * A student in a batch — and the SNAPSHOT of what they agreed to.
 *
 * The agreement columns are copied from the course at the moment of joining and
 * are never recalculated from it afterwards. Editing a course to ₹40,000 next
 * year must not silently reprice a student who joined at ₹35,000; their ledger,
 * their balance and their due date are what they signed. Changing an existing
 * agreement is a deliberate, audited act on THIS row, with a reason.
 */
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  joinedOn: date("joined_on"),
  completedOn: date("completed_on"),
  /** Whole INR, as agreed on the joining date. Not a view of `courses`. */
  agreedFeeTotal: integer("agreed_fee_total"),
  agreedAdmissionAmount: integer("agreed_admission_amount"),
  /** When the balance falls due. Derived once, from the joining date. */
  agreedBalanceDueOn: date("agreed_balance_due_on"),
  agreedDurationMonths: integer("agreed_duration_months"),
  /** The course name as printed on their admission form. */
  agreedCourseName: varchar("agreed_course_name", { length: 160 }),
  termsVersion: integer("terms_version"),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  agreementNote: varchar("agreement_note", { length: 300 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    uniqueIndex("uq_enrollment_student_batch").on(t.studentId, t.batchId),
    check(
      "chk_enrollment_agreement",
      sql`(${t.agreedFeeTotal} is null or ${t.agreedFeeTotal} >= 0)
        and (${t.agreedAdmissionAmount} is null or (${t.agreedFeeTotal} is not null and ${t.agreedAdmissionAmount} >= 0 and ${t.agreedAdmissionAmount} <= ${t.agreedFeeTotal}))`
    )
  ]);

/* ----------------------------- attendance --------------------------------- */

export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    sessionDate: date("session_date").notNull(),
    openedBy: integer("opened_by").references(() => staff.id),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("uq_session_batch_date").on(t.batchId, t.sessionDate),
    index("idx_sessions_date").on(t.sessionDate)
  ]
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => attendanceSessions.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    note: varchar("note", { length: 200 }),
    method: varchar("method", { length: 20 }).notNull().default("manual"), // manual|qr|kiosk
    markedBy: integer("marked_by").references(() => staff.id),
    markedAt: timestamp("marked_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("uq_attendance_session_student").on(t.sessionId, t.studentId)]
);

export const attendanceCorrections = pgTable("attendance_corrections", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id")
    .notNull()
    .references(() => attendanceRecords.id, { onDelete: "cascade" }),
  oldStatus: attendanceStatusEnum("old_status").notNull(),
  newStatus: attendanceStatusEnum("new_status").notNull(),
  reason: varchar("reason", { length: 300 }).notNull(),
  requestedBy: integer("requested_by").references(() => staff.id),
  approvedBy: integer("approved_by").references(() => staff.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

/* ----------------------------- certificates ------------------------------- */

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certNo: varchar("cert_no", { length: 24 }).notNull().unique(), // KDS-C-0231
  enrollmentId: integer("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  studentName: varchar("student_name", { length: 160 }).notNull(),
  courseName: varchar("course_name", { length: 160 }).notNull(),
  issuedOn: date("issued_on").notNull(),
  grade: varchar("grade", { length: 40 }),
  status: certStatusEnum("status").notNull().default("issued"),
  pdfKey: varchar("pdf_key", { length: 240 }), // R2 object key
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [index("idx_certificates_status").on(t.status)]);

/* ------------------------------- B2B briefs ------------------------------- */

export const serviceEnquiries = pgTable("service_enquiries", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 20 }).notNull().unique(), // KDS-B-0001
  name: varchar("name", { length: 160 }).notNull(),
  company: varchar("company", { length: 160 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 160 }),
  productType: varchar("product_type", { length: 120 }),
  technique: varchar("technique", { length: 120 }),
  dimensions: varchar("dimensions", { length: 120 }),
  quantity: varchar("quantity", { length: 60 }),
  colourCount: varchar("colour_count", { length: 40 }),
  fileFormat: varchar("file_format", { length: 60 }),
  deadline: date("deadline"),
  details: text("details"),
  locale: localeEnum("locale").notNull().default("en"),
  status: briefStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    index("idx_briefs_status").on(t.status),
    index("idx_briefs_created").on(t.createdAt)
  ]);

export const serviceFiles = pgTable("service_files", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id")
    .notNull()
    .references(() => serviceEnquiries.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 240 }).notNull(),
  r2Key: varchar("r2_key", { length: 300 }).notNull(),
  sizeBytes: integer("size_bytes"),
  contentType: varchar("content_type", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const serviceStatusHistory = pgTable("service_status_history", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id")
    .notNull()
    .references(() => serviceEnquiries.id, { onDelete: "cascade" }),
  fromStatus: briefStatusEnum("from_status"),
  toStatus: briefStatusEnum("to_status").notNull(),
  byStaff: integer("by_staff").references(() => staff.id),
  note: varchar("note", { length: 300 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

/* ------------------------- fee ledger (opt-in) ----------------------------- */

/** Amounts are whole INR (no paise); documented convention. */
export const feeRecords = pgTable("fee_records", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  courseFee: integer("course_fee").notNull(),
  discount: integer("discount").notNull().default(0),
  received: integer("received").notNull().default(0),
  method: varchar("method", { length: 30 }), // cash|bank|upi
  receiptNo: varchar("receipt_no", { length: 40 }),
  dueDate: date("due_date"),
  notes: varchar("notes", { length: 300 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
},
  (t) => [
    check(
      "chk_fee_amounts",
      sql`${t.courseFee} >= 0 AND ${t.discount} >= 0 AND ${t.received} >= 0`
    )
  ]);

/* -------------------------------- audit ----------------------------------- */

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actor: varchar("actor", { length: 120 }), // staff id or "system"
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 80 }).notNull(),
  entityId: varchar("entity_id", { length: 40 }),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  reason: varchar("reason", { length: 300 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
