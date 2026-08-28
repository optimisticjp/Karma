> **Superseded in part (Phase 2, this repository's admin foundation).** This
> document is a record of the audit response as it stood, and is left intact as
> history. Two items have since changed direction: the database is **Supabase
> Postgres** (reached through Cloudflare Hyperdrive in the Worker), not Neon;
> and staff authentication is **Supabase Auth with mandatory TOTP MFA**, not
> Better Auth. The deferred "Admin/trainer portals, auth" row is now partly
> delivered. See `docs/admin-architecture.md` for the current architecture.

# Audit response — what changed, what's deferred, and why

Maps the external audit to this codebase. "Fixed" items are implemented and
covered by build + tests; "Deferred" items name their gate.

## Fixed: production safety (fail closed)
| Audit finding | Fix |
| --- | --- |
| Silent demo fallbacks could lose real leads in production | `src/lib/env.ts`: demo/sample behavior only outside production (or explicit `ALLOW_DEMO_MODE=true` for staging). Prod without DB/Turnstile/R2-for-files returns typed 503s; UIs route people to WhatsApp. |
| Turnstile skipped when unconfigured | Fail-closed in production in both routes (`turnstile_unavailable` 503). |
| courseSlug filtered after LIMIT (wrong/empty results) | Filter moved into SQL with `status='open'` (`src/lib/db/queries.ts`). |
| Sample data indistinguishable from failure | Query returns `{sample,error,unavailable}`; BatchTable + home widget render honest empty/error states with a WhatsApp path. |
| /api/health always ok | Reports 503 in production when DB/Turnstile/email are missing; booleans only. |
| Email HTML injection | `escapeHtml` applied to every interpolated value in all three mails (tested). |
| Files: silent slice, extension-only checks, svg/eps risk | >3 rejected; per-file 8MB + 20MB total; svg/eps removed; magic-byte signature validation (`src/lib/files.ts`, tested); missing R2 blocks file submissions in prod. |
| No rate limiting | Layered: best-effort in-memory per-IP + DB-backed 3-per-phone/10-min throttle + documented Cloudflare WAF rule (`docs/security.md`). |
| No security headers | CSP, HSTS, nosniff, frame-deny, referrer + permissions policy in `next.config.ts`. |
| No error boundaries / loading states | `[locale]/error.tsx`, `global-error.tsx`, `loading.tsx`; API errors carry a request id. |
| Backups: formula injection, silent partial success | Cell guard for `=+-@`; any table failure exits 1 and fails the workflow. |
| Digest via GET; unescaped names | POST + escaping + "still marked new" count. |
| Duplicate submissions on retry | Client idempotency key persisted in the draft; server returns the existing reference. |
| sitemap lastModified always "now" | Stable `CONTENT_LAST_UPDATED` constant. |

## Fixed: truthfulness
- Hero numeric claims (4.8★, 500+) replaced with structural facts; the
  numbers are gated behind `verifiedFacts` in `src/lib/site.ts` and stay off
  until the owner confirms (checklist Q9). "Lifetime support" and
  "100% practical" and "every student gets a machine" reworded.
- Gallery/stories metadata no longer says "real" while samples are shown;
  sample tags remain mandatory; legal drafts are `noindex` until reviewed.
- Crown emoji removed from header/footer brand (kept only inside WhatsApp
  prefill texts, where it's the studio's own social voice).

## Fixed: conversion + accessibility
- Context-preserving CTAs: batch rows, course pages and the sticky bar link
  to `/admission?course=…&timing=…` and the form preselects with a visible
  "Applying for" chip. Attribution (heardFrom) is optional.
- Form a11y: `aria-invalid` + `aria-describedby` everywhere, error summary
  (`role="alert"`) with click-to-focus, focus moves to the first invalid
  field, step changes focus the heading and announce via live region,
  progressbar semantics, success heading receives focus. Applicant + B2B
  confirmation emails (bilingual) when an address is given.
- Mobile menu is a real dialog: backdrop, Escape, focus trap, focus restore,
  scroll lock. Language banner docks bottom-left on desktop and rises above
  the sticky bar (collision management). Reveal supports `as="li"` (valid
  `<ol>`), animations are `.js`-gated so no-JS users see everything, one
  shared IntersectionObserver, anchors respect the sticky header.
- Homepage: single composed hero canvas (no triple stack), plus a
  "Visit the studio" section with address, hours, map and tap-to-talk.

## Fixed: performance + engineering
- Home is static; batches load from cached `/api/batches` (s-maxage 300)
  with skeletons; YouTube RSS is fetch-cached 6h; Fraunces trimmed to the
  SOFT axis file. Schema migration 0001 adds indexes on every hot path,
  unique enrolment per (student,batch), seat/time/fee check constraints,
  `batches.end_date`, and the idempotency key. Vitest suite (16 tests) runs
  in CI: validation, phone, escaping, rate limit, file signatures, and full
  EN/GU catalog parity.

## Deferred, with gates
| Item | Gate |
| --- | --- |
| Admin/trainer/student portals, auth, attendance, certificates | Owner decisions Q1-Q10 (`docs/owner-decisions.md`) + the audit's own auth security prerequisites. Prompts updated in `docs/phase-prompts.md`; schema is ready. |
| OG images, real photography, trainer/story content | The studio shoot + checklist answers; placeholders stay honestly labelled. |
| Playwright E2E | Vitest covers logic now; E2E lands with Phase 2 when there are flows worth scripting end-to-end. |
| Cloudflare WAF rate rule, Resend domain, UptimeRobot | Dashboard steps at deploy time (`docs/deployment.md`). |
| Dropping deprecated `students.pin` / `applications.message` | Supervised destructive migration (kept additive-only here). |
| Consent text versioning, notification outbox, soft-delete policy | Phase 2 schema work; specified in the updated prompts. |
