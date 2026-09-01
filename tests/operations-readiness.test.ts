import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const prose = (source: string) => source.replace(/\s+/g, " ");

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
  const normalized = prose(operations);

  it("does not repeat the stale 0004-unapplied claim", () => {
    expect(operations).not.toContain("0004_course_operations` (2026-08-30) has not been applied");
    expect(normalized).toContain("`0000` through `0005` are applied");
  });

  it("matches the deployed health gate while Resend is deferred", () => {
    expect(normalized).toContain("database, Supabase Auth or Turnstile");
    expect(normalized).toContain("Deferred Resend does **not** make the site unhealthy");
    expect(normalized).toContain("`checks.email` remains visible");
    expect(normalized).not.toContain("Auth, Turnstile or email is unconfigured");
  });

  it("records the accepted free-plan password-protection limitation", () => {
    expect(normalized).toContain("current free plan does not expose that control");
    expect(normalized).toContain("accepted plan limitation");
  });
});

describe("owner-only launch checklist", () => {
  const checklist = read("docs/content-checklist.md");
  const normalized = prose(checklist);

  it("does not reopen the resolved closing-time conflict", () => {
    expect(normalized).toContain("latest closing/evening-batch time: **11:00 PM**");
    expect(normalized).not.toContain("10:30");
  });

  it("keeps the owner-approved public fee privacy policy", () => {
    expect(normalized).toContain("public fee amounts remain intentionally private");
    expect(normalized).not.toContain("published in full");
  });

  it("records the final photo allocation instead of asking again which courses get images", () => {
    expect(normalized).toContain("The eight course photographs are already assigned");
    expect(normalized).toContain("Flat Embroidery, Appliqué & 3D and Cross Stitch");
  });

  it("keeps sample proof and Terms as explicit pre-domain gates", () => {
    expect(normalized).toContain("replaced with real approved proof or hidden");
    expect(normalized).toContain("`/terms` remains a draft");
  });
});

describe("live production smoke", () => {
  const workflow = read(".github/workflows/live-smoke.yml");

  it("runs after successful main CI and can also be dispatched manually", () => {
    expect(workflow).toContain('workflows: ["CI"]');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("workflow_run.head_branch == 'main'");
    expect(workflow).toContain("workflow_run.conclusion == 'success'");
  });

  it("waits for real production health and requires the request-path dependencies", () => {
    expect(workflow).toContain("/api/health");
    expect(workflow).toContain('["db", "supabaseAuth", "turnstile"]');
    expect(workflow).toContain("health payload is not production-ready");
  });

  it("smokes both locales and asserts a real 404", () => {
    expect(workflow).toContain("/en/courses");
    expect(workflow).toContain("/gu/courses");
    expect(workflow).toContain("/en/admission");
    expect(workflow).toContain("/gu/admission");
    expect(workflow).toContain("expected 404");
  });
});
