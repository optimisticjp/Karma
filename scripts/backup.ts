/**
 * Exports every table to CSV in ./backups (plan 12.3: weekly via GitHub
 * Actions, artifacts kept 90 days; the run also wakes Neon on free tier).
 * Usage: npm run db:backup
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const TABLES = [
  "staff",
  "students",
  "guardians",
  "courses",
  "batches",
  "applications",
  "application_notes",
  "enrollments",
  "attendance_sessions",
  "attendance_records",
  "attendance_corrections",
  "certificates",
  "service_enquiries",
  "service_files",
  "service_status_history",
  "fee_records",
  "audit_logs"
];

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

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing.");
    process.exit(1);
  }
  const sql = neon(url);
  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync("backups", { recursive: true });
  const failures: string[] = [];

  for (const table of TABLES) {
    try {
      const rows = (await sql.query(`select * from "${table}"`)) as Record<string, unknown>[];
      writeFileSync(`backups/${stamp}-${table}.csv`, toCsv(rows));
      console.log(`  ✓ ${table}: ${rows.length} rows`);
    } catch (e) {
      failures.push(table);
      console.error(`  ✖ ${table}: FAILED (${(e as Error).message})`);
    }
  }
  if (failures.length > 0) {
    console.error(`Backup INCOMPLETE. Failed tables: ${failures.join(", ")}`);
    process.exit(1); // audit: a partial backup must fail the workflow
  }
  console.log("Backup complete: ./backups");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
