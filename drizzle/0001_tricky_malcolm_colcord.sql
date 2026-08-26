ALTER TABLE "applications" ADD COLUMN "idempotency_key" varchar(40);--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "end_date" date;--> statement-breakpoint
CREATE INDEX "idx_applications_status" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_applications_created" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_applications_followup" ON "applications" USING btree ("next_follow_up");--> statement-breakpoint
CREATE INDEX "idx_applications_whatsapp" ON "applications" USING btree ("whatsapp");--> statement-breakpoint
CREATE INDEX "idx_sessions_date" ON "attendance_sessions" USING btree ("session_date");--> statement-breakpoint
CREATE INDEX "idx_batches_start" ON "batches" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_batches_status" ON "batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_batches_course" ON "batches" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_status" ON "certificates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_enrollment_student_batch" ON "enrollments" USING btree ("student_id","batch_id");--> statement-breakpoint
CREATE INDEX "idx_briefs_status" ON "service_enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_briefs_created" ON "service_enquiries" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_idempotency_key_unique" UNIQUE("idempotency_key");--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_auth_user_id_unique" UNIQUE("auth_user_id");--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "chk_batch_seats" CHECK ("batches"."seats" >= 0 AND "batches"."seats_taken" >= 0 AND "batches"."seats_taken" <= "batches"."seats");--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "chk_batch_time" CHECK ("batches"."start_time" < "batches"."end_time");--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "chk_fee_amounts" CHECK ("fee_records"."course_fee" >= 0 AND "fee_records"."discount" >= 0 AND "fee_records"."received" >= 0);