/**
 * Exports every public application table to CSV in ./backups.
 * Usage: npm run db:backup
 *
 * Runs OUTSIDE the Cloudflare request runtime, so it connects directly to
 * Supabase Postgres with DATABASE_URL — never through Hyperdrive. Exports
 * contain PII: treat the artifacts accordingly (docs/security.md).
 *
 * The table list is discovered from PostgreSQL at runtime. The current static
 * list matched production at this audit, but it could silently miss a future
 * table while the workflow still stayed green. Managed Supabase schemas such
 * as auth/storage and Drizzle's migration ledger are intentionally outside this
 * interim CSV backup.
 *
 * Roadmap (docs/admin-architecture.md): pg_dump → compress → encrypt →
 * private R2 bucket, with daily/monthly retention. Encrypted CSV artifacts are
 * the interim mechanism, not the destination.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { Pool } from "pg";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    // Spreadsheet formula-injection guard (audit): neutralise =+-@ leads.
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url, max: 1 });
  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync("backups", { recursive: true });
  const failures: string[] = [];

  const tableResult = await pool.query<{ table_name: string }>(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `);
  const tables = tableResult.rows.map((row) => row.table_name);
  if (tables.length === 0) {
    await pool.end();
    throw new Error("No public application tables found; refusing to create an empty backup.");
  }

  for (const table of tables) {
    try {
      const res = await pool.query(`select * from public.${quoteIdent(table)}`);
      const rows = res.rows as Record<string, unknown>[];
      writeFileSync(`backups/${stamp}-${table}.csv`, toCsv(rows));
      console.log(`  ✓ ${table}: ${rows.length} rows`);
    } catch (e) {
      failures.push(table);
      console.error(`  ✖ ${table}: FAILED (${(e as Error).message})`);
    }
  }
  await pool.end();
  if (failures.length > 0) {
    console.error(`Backup INCOMPLETE. Failed tables: ${failures.join(", ")}`);
    process.exit(1); // audit: a partial backup must fail the workflow
  }
  console.log(`Backup complete: ${tables.length} public tables → ./backups`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
