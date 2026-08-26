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
- **Breach readiness:** contact chain = owner + developer; Neon and
  Cloudflare dashboards list incident status pages.

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
- No auth surface exists yet (Phase 1 has no accounts): smallest possible
  attack surface until Phase 2 ships Better Auth with invite-only staff
  accounts and app-layer role checks on every admin action.

## Phase 2+ security TODO (carried into prompts)
- Better Auth: session cookies (httpOnly, secure), invite-only signup,
  admin/trainer roles; every server action re-checks session + role.
- Audit log writes on all sensitive mutations (schema is ready).
- Signed, time-limited downloads for brief files via authed routes.
- Optional: Cloudflare WAF rate-limit rule on `/api/*`.

## Production hardening added after external audit
- **Fail-closed matrix:** in production (`NODE_ENV=production`, no
  `ALLOW_DEMO_MODE`), missing DATABASE_URL → 503 `service_unavailable`;
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
