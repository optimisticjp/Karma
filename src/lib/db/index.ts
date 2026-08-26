import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

/**
 * Returns a Drizzle client, or null when DATABASE_URL is not configured.
 * Callers must handle null (the site runs in "sample data" mode until
 * Neon is connected; forms respond in demo mode).
 */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("placeholder")) return null;
  try {
    const sql = neon(url);
    return drizzle(sql, { schema });
  } catch (e) {
    console.error("[db] failed to init Neon client", e);
    return null;
  }
}

export { schema };
