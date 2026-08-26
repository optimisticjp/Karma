CREATE TYPE "public"."application_status" AS ENUM('new', 'contacted', 'demo_scheduled', 'visit_done', 'accepted', 'waitlisted', 'documents_pending', 'enrolled', 'not_proceeding', 'closed');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."brief_status" AS ENUM('new', 'review', 'info_needed', 'quote_prepared', 'quote_sent', 'approved', 'in_progress', 'sample_shared', 'revision', 'finalised', 'delivered', 'closed');--> statement-breakpoint
CREATE TYPE "public"."cert_status" AS ENUM('issued', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('applied', 'active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'gu');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'trainer');--> statement-breakpoint
CREATE TABLE "application_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"staff_id" integer,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(20) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"whatsapp" varchar(20) NOT NULL,
	"email" varchar(160),
	"locale" "locale" DEFAULT 'gu' NOT NULL,
	"course_slug" varchar(80),
	"preferred_timing" varchar(20),
	"experience" varchar(40),
	"occupation" varchar(40),
	"area" varchar(160),
	"goal" text,
	"heard_from" varchar(60),
	"message" text,
	"age_band" varchar(20),
	"guardian_name" varchar(160),
	"guardian_phone" varchar(20),
	"privacy_consent_at" timestamp with time zone,
	"comms_consent_at" timestamp with time zone,
	"utm_source" varchar(80),
	"utm_campaign" varchar(80),
	"duplicate_of_phone" boolean DEFAULT false NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"assigned_to" integer,
	"next_follow_up" date,
	"closure_reason" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "attendance_corrections" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"old_status" "attendance_status" NOT NULL,
	"new_status" "attendance_status" NOT NULL,
	"reason" varchar(300) NOT NULL,
	"requested_by" integer,
	"approved_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" "attendance_status" NOT NULL,
	"note" varchar(200),
	"method" varchar(20) DEFAULT 'manual' NOT NULL,
	"marked_by" integer,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"session_date" date NOT NULL,
	"opened_by" integer,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" varchar(120),
	"action" varchar(120) NOT NULL,
	"entity" varchar(80) NOT NULL,
	"entity_id" varchar(40),
	"old_value" jsonb,
	"new_value" jsonb,
	"reason" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"label" varchar(80) NOT NULL,
	"days" varchar(60) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"start_date" date NOT NULL,
	"seats" integer DEFAULT 10 NOT NULL,
	"seats_taken" integer DEFAULT 0 NOT NULL,
	"language" varchar(60) DEFAULT 'ગુજરાતી + Hindi' NOT NULL,
	"trainer_id" integer,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"cert_no" varchar(24) NOT NULL,
	"enrollment_id" integer NOT NULL,
	"student_name" varchar(160) NOT NULL,
	"course_name" varchar(160) NOT NULL,
	"issued_on" date NOT NULL,
	"grade" varchar(40),
	"status" "cert_status" DEFAULT 'issued' NOT NULL,
	"pdf_key" varchar(240),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_cert_no_unique" UNIQUE("cert_no")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name_en" varchar(160) NOT NULL,
	"name_gu" varchar(160) NOT NULL,
	"family" varchar(40) NOT NULL,
	"duration_weeks" integer,
	"modules" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"joined_on" date,
	"completed_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"course_fee" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"received" integer DEFAULT 0 NOT NULL,
	"method" varchar(30),
	"receipt_no" varchar(40),
	"due_date" date,
	"notes" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"application_id" integer,
	"name" varchar(160) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"relation" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(20) NOT NULL,
	"name" varchar(160) NOT NULL,
	"company" varchar(160),
	"phone" varchar(20) NOT NULL,
	"email" varchar(160),
	"product_type" varchar(120),
	"technique" varchar(120),
	"dimensions" varchar(120),
	"quantity" varchar(60),
	"colour_count" varchar(40),
	"file_format" varchar(60),
	"deadline" date,
	"details" text,
	"locale" "locale" DEFAULT 'en' NOT NULL,
	"status" "brief_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_enquiries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "service_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_id" integer NOT NULL,
	"file_name" varchar(240) NOT NULL,
	"r2_key" varchar(300) NOT NULL,
	"size_bytes" integer,
	"content_type" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_id" integer NOT NULL,
	"from_status" "brief_status",
	"to_status" "brief_status" NOT NULL,
	"by_staff" integer,
	"note" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"role" "staff_role" DEFAULT 'trainer' NOT NULL,
	"phone" varchar(20),
	"email" varchar(160),
	"auth_user_id" varchar(64),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"admission_no" varchar(20) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"whatsapp" varchar(20),
	"email" varchar(160),
	"area" varchar(160),
	"language_pref" "locale" DEFAULT 'gu' NOT NULL,
	"is_minor" boolean DEFAULT false NOT NULL,
	"photo_consent" boolean DEFAULT false NOT NULL,
	"photo_consent_at" timestamp with time zone,
	"pin" varchar(8),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_admission_no_unique" UNIQUE("admission_no")
);
--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_to_staff_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_record_id_attendance_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."attendance_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_requested_by_staff_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_approved_by_staff_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_attendance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."attendance_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_staff_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_opened_by_staff_id_fk" FOREIGN KEY ("opened_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_trainer_id_staff_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_files" ADD CONSTRAINT "service_files_enquiry_id_service_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."service_enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_enquiry_id_service_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."service_enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_by_staff_staff_id_fk" FOREIGN KEY ("by_staff") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_attendance_session_student" ON "attendance_records" USING btree ("session_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_session_batch_date" ON "attendance_sessions" USING btree ("batch_id","session_date");