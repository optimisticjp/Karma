"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "./env";

/**
 * Browser Supabase client — AUTH ONLY.
 *
 * It exists for the flows that genuinely have to run in the browser: entering a
 * TOTP code, enrolling an authenticator, signing out. It is NOT a data client:
 * Karma has exactly one data access layer (Drizzle over a trusted server-side
 * Postgres connection), and the app tables deny the publishable key at the
 * database level anyway (migration 0002).
 *
 * Only the publishable key reaches this file. The secret key never does.
 */
export function createClient() {
  const config = supabasePublicConfig();
  if (!config) {
    throw new Error("Supabase Auth is not configured for this deployment.");
  }
  return createBrowserClient(config.url, config.publishableKey);
}
