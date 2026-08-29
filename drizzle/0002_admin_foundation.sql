CREATE TYPE "public"."staff_status" AS ENUM('invited', 'active', 'deactivated');--> statement-breakpoint
ALTER TYPE "public"."staff_role" ADD VALUE IF NOT EXISTS 'owner';--> statement-breakpoint
CREATE TABLE "staff_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer NOT NULL,
	"permission" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "status" "staff_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "admin_locale" "locale" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "invited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "invited_by" integer;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "deactivated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_created_by_staff_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_staff_permission" ON "staff_permissions" USING btree ("staff_id","permission");--> statement-breakpoint
CREATE INDEX "idx_staff_permissions_staff" ON "staff_permissions" USING btree ("staff_id");--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_invited_by_staff_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_staff_role" ON "staff" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_staff_console_email" ON "staff" USING btree (lower("email")) WHERE "staff"."email" is not null and "staff"."role" <> 'trainer';
--> statement-breakpoint
-- ---------------------------------------------------------------------------
-- Account invariants. These are NOT decorations on top of the UI: an ordinary
-- admin who reaches a server action directly, or two invitations racing each
-- other, must still hit a wall in the database.
--
-- Why a trigger and not three partial unique indexes: 'owner' is added to the
-- staff_role enum by this very migration, and Postgres refuses to evaluate a
-- freshly added enum value in the transaction that added it (drizzle applies
-- every pending migration in one transaction). An index predicate must also be
-- IMMUTABLE, which rules out `role::text`. A plpgsql body is parsed at
-- execution time, so it may use the literal freely — and it can additionally
-- take a lock, which an index cannot.
-- ---------------------------------------------------------------------------

-- INVARIANTS, all four of them:
--   1. At most one ACTIVE owner. A deactivated historical owner row stays
--      permitted, so a supervised ownership handover remains possible later.
--   2. At most five admin SEATS. A seat is consumed by any admin row with
--      active = true, which deliberately includes a pending invitation
--      (status = 'invited'): the seat is reserved the moment the invitation
--      goes out. Deactivating an admin frees the seat.
--   3. The owner can be neither deactivated, demoted, nor moved backwards
--      through its lifecycle by an ordinary write. Only the onboarding
--      transition invited -> active is allowed.
--   4. The owner row cannot be DELETED. Protecting only UPDATE would leave the
--      obvious hole: `delete from staff where role = 'owner'` would remove the
--      sole superuser and satisfy every other rule on the way out.
--
-- pg_advisory_xact_lock serialises both counts, so two writes racing each
-- other cannot both read "one seat left" and both succeed.
--
-- A supervised ownership transfer is the one procedure that legitimately needs
-- past these rules; it runs `ALTER TABLE staff DISABLE TRIGGER
-- trg_karma_staff_invariants` inside its own reviewed transaction.
CREATE OR REPLACE FUNCTION "karma_staff_invariants"() RETURNS trigger AS $$
DECLARE
  seats_used integer;
  owners_active integer;
BEGIN
  -- 4. DELETE is handled first and separately: it has OLD but no NEW, so every
  --    NEW.* reference below would raise. Admin and trainer rows may still be
  --    deleted by a supervised operator — the Karma UI never deletes anyone,
  --    it deactivates — but the owner row is protected outright.
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'owner' THEN
      RAISE EXCEPTION 'karma_owner_locked: the owner account cannot be deleted'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  -- 3. The owner may never be demoted, deactivated, or moved backwards through
  --    its lifecycle by an ordinary write. `status` is a security state — the
  --    access layer requires 'active' and treats 'deactivated' as denied — so
  --    it is protected here exactly like `role` and `active`.
  --
  --    The ONE lifecycle transition that must stay open is onboarding:
  --      invited -> active   (the owner accepting their own invitation)
  --
  --    Ordinary fields — name, admin_locale, last_seen_at, accepted_at — are
  --    untouched by any of this and change freely.
  IF TG_OP = 'UPDATE' AND OLD.role = 'owner' THEN
    IF NEW.role <> 'owner' THEN
      RAISE EXCEPTION 'karma_owner_locked: the owner role cannot be changed here'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.active = false THEN
      RAISE EXCEPTION 'karma_owner_locked: the owner account cannot be deactivated'
        USING ERRCODE = 'check_violation';
    END IF;

    IF OLD.status = 'invited' THEN
      -- Accepting the invitation is allowed; anything else is not. In
      -- particular an invited owner cannot be shelved as 'deactivated'.
      IF NEW.status NOT IN ('invited', 'active') THEN
        RAISE EXCEPTION 'karma_owner_locked: the owner lifecycle cannot move from invited to %', NEW.status
          USING ERRCODE = 'check_violation';
      END IF;
    ELSIF OLD.status = 'active' THEN
      -- Once accepted, the owner stays accepted. No going back to invited
      -- (which would strand the console with no usable owner) and no
      -- deactivation (which the access layer would read as denied).
      IF NEW.status <> 'active' THEN
        RAISE EXCEPTION 'karma_owner_locked: the owner lifecycle cannot move from active to %', NEW.status
          USING ERRCODE = 'check_violation';
      END IF;
    ELSE
      -- OLD.status is 'deactivated': a state ordinary writes cannot produce, so
      -- reaching it means a supervised override or direct manipulation left the
      -- row inconsistent. Fail closed rather than quietly normalising it — a
      -- human has to look at how it got there.
      RAISE EXCEPTION 'karma_owner_locked: owner lifecycle is in an unexpected state (%); resolve it under supervision', OLD.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- 1. Exactly one active owner. Checked only when a row BECOMES an active
  --    owner, so ordinary updates to the owner row are untouched.
  IF NEW.role = 'owner' AND NEW.active = true
     AND (TG_OP = 'INSERT' OR OLD.role <> 'owner' OR OLD.active = false) THEN
    PERFORM pg_advisory_xact_lock(hashtext('karma_owner_seat'));
    SELECT count(*) INTO owners_active
      FROM "staff"
     WHERE role = 'owner' AND active = true AND id <> NEW.id;
    IF owners_active > 0 THEN
      RAISE EXCEPTION 'karma_single_owner: an active owner already exists'
        USING ERRCODE = 'unique_violation';
    END IF;
  END IF;

  -- 2. Five admin seats. Checked only when a seat is NEWLY consumed, so
  --    ordinary updates to an admin row (last_seen_at, name, locale) neither
  --    count rows nor take the lock.
  IF NEW.role = 'admin' AND NEW.active = true
     AND (TG_OP = 'INSERT' OR OLD.role <> 'admin' OR OLD.active = false) THEN
    PERFORM pg_advisory_xact_lock(hashtext('karma_admin_seats'));
    SELECT count(*) INTO seats_used
      FROM "staff"
     WHERE role = 'admin' AND active = true AND id <> NEW.id;
    IF seats_used >= 5 THEN
      RAISE EXCEPTION 'karma_admin_seat_limit: all 5 admin seats are in use'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

DROP TRIGGER IF EXISTS "trg_karma_staff_invariants" ON "staff";--> statement-breakpoint

CREATE TRIGGER "trg_karma_staff_invariants"
  BEFORE INSERT OR UPDATE OR DELETE ON "staff"
  FOR EACH ROW EXECUTE FUNCTION "karma_staff_invariants"();--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Supabase Data API lockdown.
--
-- Karma has exactly ONE data access layer: Drizzle over a trusted direct
-- Postgres connection (through Hyperdrive in the Worker). The browser holds a
-- publishable key for Supabase AUTH only and must never be able to read a
-- student, an application or a design brief through PostgREST.
--
-- Two independent locks, because either alone can be undone by a dashboard
-- click: (a) no grants at all for the Data API roles, (b) RLS enabled with no
-- policies, which denies everything by default.
--
-- Neither affects our backend: the migration runs as the table owner, and a
-- table owner bypasses RLS unless FORCE ROW LEVEL SECURITY is set (it is not).
-- Connect Hyperdrive with the role that owns these tables — see
-- docs/admin-architecture.md.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'staff', 'staff_permissions', 'students', 'guardians', 'courses', 'batches',
    'applications', 'application_notes', 'enrollments', 'attendance_sessions',
    'attendance_records', 'attendance_corrections', 'certificates',
    'service_enquiries', 'service_files', 'service_status_history',
    'fee_records', 'audit_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM %I', t, r);
      END IF;
    END LOOP;
  END LOOP;
END
$$;

