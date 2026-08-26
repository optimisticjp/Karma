/**
 * Seeds the verified course catalog and (if empty) a starter set of batches.
 * Usage: npm run db:seed   (needs DATABASE_URL in .env)
 * Idempotent: courses upsert by slug; batches only insert when none exist.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { courses as courseContent } from "../src/content/courses";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }
  const db = drizzle(neon(url), { schema });

  console.log("Seeding courses…");
  for (const [i, c] of courseContent.entries()) {
    await db
      .insert(schema.courses)
      .values({
        slug: c.slug,
        nameEn: c.nameEn,
        nameGu: c.nameGu,
        family: c.family,
        durationWeeks: c.durationWeeks,
        modules: c.modules,
        sortOrder: i
      })
      .onConflictDoUpdate({
        target: schema.courses.slug,
        set: {
          nameEn: c.nameEn,
          nameGu: c.nameGu,
          family: c.family,
          durationWeeks: c.durationWeeks,
          modules: c.modules,
          sortOrder: i
        }
      });
    console.log("  ✓", c.slug);
  }

  const existing = await db.select({ n: sql<number>`count(*)` }).from(schema.batches);
  if (Number(existing[0].n) > 0) {
    console.log("Batches already present: skipping batch seed.");
    return;
  }

  console.log("Seeding starter batches (edit these in Neon or the Phase 2 admin)…");
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
