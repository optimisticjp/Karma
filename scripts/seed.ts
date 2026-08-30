/**
 * Seeds the verified course catalog and (if empty) a starter set of batches.
 * Usage: npm run db:seed   (needs DATABASE_URL in .env)
 *
 * Idempotent, and — since 2026-08-30 — NON-DESTRUCTIVE about operator data.
 *
 * It used to derive a zero-based `sortOrder` and upsert it, while the Karma
 * Console import derived a one-based one and never touched existing rows. So
 * the two paths disagreed by one on every course, and re-running the seed on a
 * live database silently renumbered the catalogue and undid whatever order the
 * owner had arranged in the console. Both paths now share ONE projection
 * (`VERIFIED_CATALOG_ROWS`), and a re-seed updates only the editorial fields
 * that genuinely come from source control (`CATALOG_RESEED_FIELDS`): never
 * `sort_order`, never `active`, never the fee plan, the timetable or the
 * archive state.
 *
 * Runs OUTSIDE the Cloudflare request runtime, so it connects directly to
 * Supabase Postgres with DATABASE_URL — never through Hyperdrive.
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { CATALOG_RESEED_FIELDS, VERIFIED_CATALOG_ROWS, catalogReseedSet } from "../src/lib/admin/catalog-import";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool, { schema });
  try {
    await seed(db);
  } finally {
    await pool.end();
  }
}

async function seed(db: ReturnType<typeof drizzle<typeof schema>>) {

  console.log("Seeding courses…");
  console.log(`  (a re-seed updates only ${CATALOG_RESEED_FIELDS.join(", ")})`);
  for (const row of VERIFIED_CATALOG_ROWS) {
    await db
      .insert(schema.courses)
      .values(row)
      .onConflictDoUpdate({
        target: schema.courses.slug,
        set: catalogReseedSet(row)
      });
    console.log("  ✓", row.slug);
  }

  const existing = await db.select({ n: sql<number>`count(*)` }).from(schema.batches);
  if (Number(existing[0].n) > 0) {
    console.log("Batches already present: skipping batch seed.");
    return;
  }

  console.log("Seeding starter batches (edit these in Supabase or the Karma Console)…");
  const plus = (d: number) => {
    const x = new Date();
    x.setDate(x.getDate() + d);
    return x.toISOString().slice(0, 10);
  };
  const defs: Array<[string, string, string, string, number]> = [
    ["zardosi-machine-embroidery", "Mon-Sat", "10:00", "12:00", 7],
    ["zardosi-machine-embroidery", "Mon-Sat", "19:00", "21:00", 10],
    ["sequence-work", "Mon-Sat", "16:00", "18:00", 12],
    ["emcad-embroidery-design", "Mon/Wed/Fri", "18:00", "20:00", 14]
  ];
  for (const [slug, days, st, et, offset] of defs) {
    const rows = await db
      .select({ id: schema.courses.id, nameEn: schema.courses.nameEn })
      .from(schema.courses)
      .where(eq(schema.courses.slug, slug))
      .limit(1);
    if (!rows[0]) continue;
    await db.insert(schema.batches).values({
      courseId: rows[0].id,
      label: `${rows[0].nameEn.split(" ")[0]} ${Number(st.slice(0, 2)) >= 16 ? "Evening" : "Day"}`,
      days,
      startTime: st,
      endTime: et,
      startDate: plus(offset),
      seats: 10,
      seatsTaken: 0
    });
    console.log("  ✓ batch:", slug, plus(offset), st);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
