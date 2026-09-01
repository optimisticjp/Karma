import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("production security migration", () => {
  const migration = read("drizzle/0005_security_hardening.sql");
  const journal = read("drizzle/meta/_journal.json");

  it("pins the staff trigger search path", () => {
    expect(migration).toContain(
      'ALTER FUNCTION "public"."karma_staff_invariants"() SET search_path = pg_catalog, public;'
    );
  });

  it("removes app-role execution from the Supabase RLS helper when present", () => {
    expect(migration).toContain("to_regprocedure('public.rls_auto_enable()')");
    expect(migration).toContain(
      "REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;"
    );
  });

  it("is registered as the only 0005 migration", () => {
    expect(journal).toContain('"tag": "0005_security_hardening"');
    expect(journal).not.toContain("trilingual_locale");
  });
});

describe("database backup safety", () => {
  const script = read("scripts/backup.ts");
  const workflow = read(".github/workflows/backup.yml");

  it("discovers public base tables instead of maintaining a stale table list", () => {
    expect(script).toContain("information_schema.tables");
    expect(script).toContain("table_schema = 'public'");
    expect(script).toContain("table_type = 'BASE TABLE'");
    expect(script).not.toContain("const TABLES = [");
  });

  it("fails rather than producing an empty backup", () => {
    expect(script).toContain("No public application tables found");
  });

  it("uploads only an encrypted backup artifact", () => {
    expect(workflow).toContain("BACKUP_ENCRYPTION_PASSPHRASE");
    expect(workflow).toContain("--symmetric --cipher-algo AES256");
    expect(workflow).toContain("path: db-backup.tar.gz.gpg");
    expect(workflow).not.toContain("path: backups/");
  });
});

describe("operations record", () => {
  const operations = read("docs/operations.md");

  it("does not repeat the stale 0004-unapplied claim", () => {
    expect(operations).not.toContain("0004_course_operations` (2026-08-30) has not been applied");
    expect(operations).toContain("`0000` through `0005`\nare applied");
  });
});
