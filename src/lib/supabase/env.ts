/**
 * Supabase configuration, read in one place.
 *
 * Only the PUBLIC pair lives here. `SUPABASE_SECRET_KEY` is read exclusively by
 * `src/lib/supabase/admin.ts`, which is `server-only`, so the secret has no
 * path into a client bundle through this module.
 */

export function supabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || null;
}

export function supabasePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || null;
}

export type SupabasePublicConfig = { url: string; publishableKey: string };

/** Null when Supabase Auth has not been configured for this deployment. */
export function supabasePublicConfig(): SupabasePublicConfig | null {
  const url = supabaseUrl();
  const publishableKey = supabasePublishableKey();
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}
