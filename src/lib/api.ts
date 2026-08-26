import { NextResponse } from "next/server";

/** Shared API contracts + helpers (audit: typed error codes, escaping, ids). */
export type ApiErrorCode =
  | "bad_json"
  | "bad_form"
  | "validation"
  | "turnstile"
  | "turnstile_unavailable"
  | "service_unavailable"
  | "files_unavailable"
  | "too_many_files"
  | "file_type"
  | "file_size"
  | "rate_limited"
  | "unauthorized"
  | "not_configured"
  | "server";

export function apiError(code: ApiErrorCode, status: number, requestId?: string) {
  return NextResponse.json({ ok: false as const, error: code, requestId }, { status });
}

export function newRequestId() {
  return crypto.randomUUID().slice(0, 8);
}

export function getIp(req: Request) {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

/** Escape EVERY user-controlled value interpolated into email HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Best-effort in-memory rate limiter. Workers isolates don't share state,
 * so this is a speed bump, not a wall: the real per-IP wall is a Cloudflare
 * WAF rate-limiting rule on /api/* (docs/security.md). DB-backed per-phone
 * throttling in the routes is the stateful layer.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}
