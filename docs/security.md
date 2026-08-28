# Security & DPDP notes

## Data we hold (Phase 1)
- Admission applications: name, WhatsApp, optional email, course/timing
  choices, age band, occupation, experience, area, optional note, guardian
  name+phone for minors, consent timestamps, UTM tags.
- Design briefs: contact + project details, files in private R2.

## DPDP Act 2023 alignment (review with counsel before launch)
- **Consent:** two explicit checkboxes on the form; timestamps stored
  (`privacy_consent_at`, `comms_consent_at`), not booleans alone.
- **Minors:** under-18 requires guardian name + phone at submission; the
  guardian fields are enforced server-side (zod superRefine), not just UI.
- **Purpose limitation:** data is used to respond to the enquiry. No ads, no
  resale; stated plainly in `/privacy`.
- **Data requests:** footer "Data request" mailto; commit to a response SLA
  with the owner and note it in the privacy page when decided.
- **Retention:** decide with the owner (suggested: applications 12 months
  after closure; briefs per client agreement), then implement a cleanup
  script + document it.
- **Breach readiness:** contact chain = owner + developer; Supabase and
  Cloudflare dashboards list incident status pages.
- **Staff data:** the console holds student, guardian and B2B records. Access
  is permission-based, every sensitive mutation is audited, and there is no
  public API that dumps admin records. Exports require `exports.run`.

## Technical controls in place
- Spam: honeypot checked BEFORE validation (quiet fake success), minimum
  fill time, Turnstile server verification, strict zod schemas, Indian
  mobile normalization.
- Secrets only via Wrangler secrets / GitHub Actions secrets; nothing in git.
- R2 bucket private; object keys unguessable-ish (`briefs/{ref}/{ts}-name`),
  but treat privacy as coming from access control, not key secrecy: files
  are only reachable through server code.
- Cron endpoint requires `Bearer CRON_SECRET`.
- HTML in notification emails escapes user-provided free text.
- Staff auth is Supabase Auth with **mandatory TOTP MFA**, invitation-only
  accounts and app-layer authorization on every console page and server
  action. Details below.

## Karma Console security (shipped)

Full architecture: `docs/admin-architecture.md`.

**Identity vs authority.** Supabase Auth proves identity. The Karma `staff` row
decides authorization. A valid Supabase user with no staff record gets nothing,
and `user_metadata` is never consulted — an editable `role: "owner"` claim means
precisely nothing.

**The access decision** (`src/lib/auth/access.ts`, pure and unit-tested) needs
all six of: verified user → linked staff record → `active` → console role →
**AAL2** → the required permission. Staff checks run before MFA, so a
deactivated account is turned away rather than walked through enrolment. A
deactivated admin holding an old session is rejected on their very next request.

**No public sign-up.** No registration route, no self-service role selection, no
password reset that could enumerate addresses. Every account arrives through an
owner invitation; the single Owner arrives through a CLI bootstrap that refuses
to create a second one.

**Sign-in** runs as a Server Action so Karma's own controls apply on top of
Supabase's: per-IP and per-email rate limiting (the same best-effort helper the
public forms use), and one generic message — `Email or password is incorrect.` —
whatever went wrong. It never reveals whether an address exists, whether an
account is deactivated, or whether it is the Owner. Passwords and tokens are
never logged.

**MFA is mandatory** for every console session including the Owner's. The TOTP
secret is shown once during enrolment and never stored by Karma: there is no
column for it. Removing the only authenticator is not offered — recovery is a
supervised owner procedure, specified rather than implemented unsafely.

**Owner-only team administration.** Inviting, deactivating and re-permissioning
accounts require the owner role at AAL2, checked inside each server action, not
only in the page. There is deliberately no permission key that unlocks it, so it
cannot be granted to an admin. One Owner and five admin seats are enforced by a
database trigger with an advisory lock as well as by the application, so a race
between two invitations cannot slip past.

**Supabase Data API lockdown.** The publishable key is public. Migration 0002
enables RLS with no policies on all eighteen app tables and revokes all grants
from `anon` and `authenticated`, so that key cannot read a student, an
application or a design brief through PostgREST. The backend is unaffected: it
connects as the table owner, which bypasses RLS (no `FORCE ROW LEVEL SECURITY`).

**Open redirect defence.** Every `?next=` goes through `safeNextPath`, which
accepts only internal `/admin` paths — no absolute URLs, no `//host`, no
backslashes, no encoded slashes, no control characters, and never an auth screen
(which would loop).

**Secret handling.** `SUPABASE_SECRET_KEY` is read only by a `server-only`
module, never exported, logged, serialised into a response, or prefixed with
`NEXT_PUBLIC_`. Its client disables session persistence and auto-refresh. Audit
rows never carry a password, TOTP secret, token, key, credential or invitation
link — a test asserts it.

**Sign-out** is a POST (a GET that destroys a session can be triggered by any
image tag) and revokes globally, not just this browser's cookie.

**Admin pages are `force-dynamic`** and never statically generated, so no
authenticated content can leak into build output or an edge cache.

## Security TODO (next phases)
- MFA recovery: a supervised owner-initiated factor reset, with audit.
- Signed, time-limited downloads for brief files and certificate PDFs via
  authed routes gated on `design.view` / `certificates.view`.
- Cloudflare WAF rate-limit rules on `/api/*` and `/admin/*`.
- Ownership transfer as a documented, reviewed procedure (not a UI control).
- Encrypted `pg_dump` backups to a private R2 bucket.
- Consent text versioning and a notification outbox (see phase prompts).

## Production hardening added after external audit
- **Fail-closed matrix:** in production (`NODE_ENV=production`, no
  `ALLOW_DEMO_MODE`), no reachable database → 503 `service_unavailable`;
  missing TURNSTILE_SECRET_KEY → 503 `turnstile_unavailable`; missing R2
  binding blocks submissions that include files (`files_unavailable`).
  The UI keeps a WhatsApp path in every failure state, so a misconfigured
  deploy inconveniences, but never silently swallows, a lead.
- **Headers:** CSP (self + Turnstile + i.ytimg.com images), HSTS, nosniff,
  DENY framing, strict referrer, minimal permissions policy (next.config.ts).
- **Rate limiting layers:** (1) best-effort in-memory per-IP per isolate,
  (2) DB-backed 3 submissions per phone per 10 minutes, (3) REQUIRED at
  deploy: Cloudflare WAF rate rule on `/api/*` (e.g. 20 req/min per IP);
  free plan includes one rate-limiting rule.
- **Uploads:** magic-byte signature validation, svg/eps banned, count/size
  caps enforced server-side with typed errors.
- **Idempotency:** applications carry a client UUID; retries can't double.
- **Backups contain PII:** GitHub artifacts are private to the repo, but
  treat downloads accordingly; delete local copies after use. Restore is a
  manual CSV import for now (documented limitation until Phase 5 tooling).
- **ALLOW_DEMO_MODE=true** exists for staging only. Never set it on the
  production worker.
