CREATE TABLE "content_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(30) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"student_id" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"consent_confirmed" boolean DEFAULT false NOT NULL,
	"consent_confirmed_at" timestamp with time zone,
	"consent_confirmed_by" integer,
	"owner_verified" boolean DEFAULT false NOT NULL,
	"owner_verified_at" timestamp with time zone,
	"owner_verified_by" integer,
	"published_at" timestamp with time zone,
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_content_kind" CHECK ("content_items"."kind" in ('faq', 'gallery', 'testimonial', 'homepage_stat')),
	CONSTRAINT "chk_content_status" CHECK ("content_items"."status" in ('draft', 'published', 'archived'))
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_consent_confirmed_by_staff_id_fk" FOREIGN KEY ("consent_confirmed_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_owner_verified_by_staff_id_fk" FOREIGN KEY ("owner_verified_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_updated_by_staff_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_content_kind_slug" ON "content_items" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "idx_content_kind_status" ON "content_items" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "idx_content_student" ON "content_items" USING btree ("student_id");--> statement-breakpoint

-- Keep the browser's Supabase Data API key unable to read or mutate Content Desk.
-- The trusted Worker/Hyperdrive connection uses the table-owning Postgres role.
ALTER TABLE "content_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON public.content_items FROM %I', r);
      EXECUTE format('REVOKE ALL ON SEQUENCE public.content_items_id_seq FROM %I', r);
    END IF;
  END LOOP;
END
$$;
