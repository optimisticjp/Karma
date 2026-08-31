-- Trilingual public locale (2026-08-31).
--
-- The public site gained Hindi, and `applications.locale` / `design_jobs.locale`
-- record the language a visitor filled the form in. Without this value a Hindi
-- submission fails on insert.
--
-- ADDITIVE AND IRREVERSIBLE. Postgres has no `DROP VALUE` for an enum, which is
-- the reason this is a one-line migration and not a type rewrite: adding a
-- value is cheap and safe, removing one is not. Nothing is required to use it —
-- Karma Console keeps writing only `en` or `gu`, constrained in TypeScript by
-- `AdminLocale`, because staff choose a console language and Hindi is a public
-- decision.
--
-- Note for whoever applies this: a freshly added enum value cannot be USED in
-- the same transaction that adds it. This migration only adds it, so that is
-- not a problem here — but do not append a seed to this file that inserts a
-- row with locale 'hi'.

ALTER TYPE "public"."locale" ADD VALUE 'hi';
