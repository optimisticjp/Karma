-- Security hardening discovered during the 2026-09-01 production audit.
-- The staff invariant trigger is repo-owned, so pin its lookup path.
ALTER FUNCTION "public"."karma_staff_invariants"() SET search_path = pg_catalog, public;
--> statement-breakpoint
-- Supabase may install this event-trigger helper outside Drizzle. If present,
-- keep it callable by privileged roles only; app roles never need EXECUTE.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END
$$;
