import { cache } from "react";
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

/**
 * Database access for Karma.
 *
 * Architecture (docs/admin-architecture.md):
 *   Cloudflare Worker runtime  →  HYPERDRIVE binding  →  Supabase Postgres
 *   CLI / migrations / seeds / backups / local dev  →  direct DATABASE_URL
 *
 * A Worker isolate is reused across requests that may belong to different
 * users, so a Postgres connection must never outlive the request that opened
 * it. Three things guarantee that here:
 *
 *   1. The pool is created per request (`cache()` scopes it to one render /
 *      one handler invocation). There is deliberately no module-scope pool
 *      and no long-lived Node server pool.
 *   2. `max: 1` — a request never holds more than one socket.
 *   3. `maxUses: 1` — pg destroys the physical connection when it is released
 *      after a single checkout, so a socket is never handed to a second
 *      query, let alone a second request.
 *
 * We intentionally do NOT call `ctx.waitUntil(pool.end())`: `Pool.end()` marks
 * the pool as ending the moment it is invoked, and `waitUntil` starts the
 * promise immediately, which would break every query issued after it. The
 * short idle timeout plus `maxUses: 1` closes sockets without that hazard.
 *
 * The binding is read through OpenNext's public `getCloudflareContext()` API,
 * in SYNC mode. Sync is the right mode here and not a shortcut: it resolves
 * from the context the Worker entrypoint (and `initOpenNextCloudflareForDev`)
 * has already put in place, and it throws everywhere else instead of starting
 * a wrangler/miniflare proxy. That is exactly the behaviour we want, because
 * it means `next build`, vitest and the CLI scripts never require Cloudflare
 * or a Hyperdrive binding to exist — they take the DATABASE_URL fallback, and
 * report "not configured" when that is absent too.
 */

type Resolved = {
  connectionString: string;
  /** True when the string came from the Hyperdrive binding. */
  viaHyperdrive: boolean;
};

function directUrl(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("placeholder")) return null;
  return url;
}

/**
 * The Hyperdrive connection string for this request, or null when there is no
 * Cloudflare context (a build, a test, a CLI script) or no binding configured
 * yet. `getCloudflareContext()` throws in sync mode outside a Worker request,
 * which is the documented behaviour and the fallback signal we rely on.
 */
function hyperdriveConnectionString(): string | null {
  try {
    const { env } = getCloudflareContext();
    const binding = (env as unknown as Record<string, unknown>)["HYPERDRIVE"] as
      | { connectionString?: string }
      | undefined;
    return binding?.connectionString ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves the connection for THIS request. Hyperdrive wins whenever the
 * binding exists; the direct DATABASE_URL is the documented fallback for local
 * development and for the window before the owner creates the Hyperdrive
 * configuration.
 */
function resolveConnection(): Resolved | null {
  const hyperdrive = hyperdriveConnectionString();
  if (hyperdrive) return { connectionString: hyperdrive, viaHyperdrive: true };
  const url = directUrl();
  if (!url) return null;
  return { connectionString: url, viaHyperdrive: false };
}

/**
 * Returns a Drizzle client for the current request, or null when neither the
 * HYPERDRIVE binding nor DATABASE_URL is configured. Callers MUST handle null:
 * in production that means a typed 503, never invented data (CLAUDE.md #4).
 *
 * `cache()` deduplicates within one request, so a request opens at most one
 * pool regardless of how many components, actions or helpers ask for it.
 */
export const getDb = cache((): Db | null => {
  const resolved = resolveConnection();
  if (!resolved) return null;
  try {
    const pool = new Pool({
      connectionString: resolved.connectionString,
      max: 1,
      maxUses: 1,
      idleTimeoutMillis: 5_000,
      allowExitOnIdle: true,
      // Hyperdrive terminates TLS to the origin for us. A direct Supabase URL
      // carries its own `sslmode` in the connection string.
      ...(resolved.viaHyperdrive ? { ssl: false } : {})
    });
    return drizzle(pool, { schema });
  } catch (e) {
    console.error("[db] failed to create Postgres client", e);
    return null;
  }
});

/**
 * True when a database connection can be established for this request.
 * Used by /api/health; never reveals host, user, password or binding id.
 */
export function dbConfigured(): boolean {
  return resolveConnection() !== null;
}

/** True when this request would be served through the Hyperdrive binding. */
export function dbViaHyperdrive(): boolean {
  return resolveConnection()?.viaHyperdrive ?? false;
}

export { schema };
