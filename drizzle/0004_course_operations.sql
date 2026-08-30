ALTER TABLE "applications" ADD COLUMN "father_name" varchar(160);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "guardian_relation" varchar(60);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "reference_name" varchar(160);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "reference_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "preferred_schedule" varchar(40);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "demo_slot" varchar(40);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "terms_version" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "duration_months" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "software" varchar(80);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "fee_total" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "fee_admission" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "fee_balance_due_days" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "terms_version" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "public_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "operations" jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreed_fee_total" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreed_admission_amount" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreed_balance_due_on" date;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreed_duration_months" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreed_course_name" varchar(160);--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "terms_version" integer;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "agreement_note" varchar(300);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "father_name" varchar(160);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "reference_name" varchar(160);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "reference_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "archived_by" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_archived_by_staff_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_archived_by_staff_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_archived_by_staff_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_archived_by_staff_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_applications_archived" ON "applications" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "idx_batches_archived" ON "batches" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "idx_courses_archived" ON "courses" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "idx_students_archived" ON "students" USING btree ("archived_at");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "chk_course_duration_months" CHECK ("courses"."duration_months" is null or ("courses"."duration_months" > 0 and "courses"."duration_months" <= 60));--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "chk_course_fees" CHECK (("courses"."fee_total" is null or "courses"."fee_total" >= 0)
        and ("courses"."fee_admission" is null or ("courses"."fee_total" is not null and "courses"."fee_admission" >= 0 and "courses"."fee_admission" <= "courses"."fee_total"))
        and ("courses"."fee_balance_due_days" is null or ("courses"."fee_balance_due_days" >= 0 and "courses"."fee_balance_due_days" <= 365)));--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "chk_enrollment_agreement" CHECK (("enrollments"."agreed_fee_total" is null or "enrollments"."agreed_fee_total" >= 0)
        and ("enrollments"."agreed_admission_amount" is null or ("enrollments"."agreed_fee_total" is not null and "enrollments"."agreed_admission_amount" >= 0 and "enrollments"."agreed_admission_amount" <= "enrollments"."agreed_fee_total")));