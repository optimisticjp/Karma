# Security & DPDP notes

## Data we hold (Phase 1)
- Admission applications: name, WhatsApp, optional email, course/timing
  choices, the chosen timetable and free-demo slot, age band, occupation,
  experience, area, optional note, **a parent/guardian mobile for every
  applicant**, a guardian name for minors, an optional father's name, an
  optional reference name and mobile, consent timestamps, the accepted
  admission-norms version and its acceptance time, UTM tags.
- Design briefs: contact + project details, files in private R2.

## DPDP Act 2023 alignment (review with counsel before launch)
- **Consent:** two explicit checkboxes on the form; timestamps stored
  (`privacy_consent_at`, `comms_consent_at`), not booleans alone.
- **Minors:** under-18 requires a guardian name in addition to the phone; the
  guardian fields are enforced server-side (zod superRefine), not just UI.
- **A third-party contact on every application (2026-08-30).** The owner now
  requires a parent/guardian mobile from every applicant, not only minors. Two
  DPDP consequences follow, and neither is decorative. First, the site is
  collecting a number belonging to **someone who is not filling in the form**:
  `/privacy` must say plainly that an applicant supplies a parent or guardian's
  number and what it is used for, and a data request about that number has to be
  answerable. Second, it widens what the weekly backup artifact contains —
  `docs/operations.md` already flags those artifacts as PII-bearing. **Review
  both with counsel before launch**, alongside the retention period.
- **Consent is versioned.** Acceptance of the institute's admission norms is
  stored as a version number plus a timestamp, and a submission quoting a
  version this build does not know is rejected. Consent to text that cannot be
  reproduced afterwards is not consent. Published versions are immutable
  (`src/content/admission-terms.ts`); a rule change is a new version. This is
  the "consent text versioning" item that was previously listed as a known TODO
  — for admission norms. The privacy and communications consents are still a
  bare timestamp with no version attached.
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
- Staff auth is Supabase Auth with **invite-only email/password sign-in** and app-layer authorization on every console page and server action. Details below.

## Karma Console security (shipped)

Full architecture: `docs/admin-architecture.md`.

**Identity vs authority.** Supabase Auth proves identity. The Karma `staff` row
decides authorization. A valid Supabase user with no staff record gets nothing,
and `user_metadata` is never consulted — an editable `role: "owner"` claim means
precisely nothing.

**The access decision** (`src/lib/auth/access.ts`, pure and unit-tested) requires: verified user → linked staff record → `active` → console role → lifecycle **`status === "active"`** → the required permission. Karma Console is password-only; assurance level is not an access gate. A deactivated admin holding an old session is rejected on their very next request.

**An invited account is not a console account.** A pending invitation is stored `active: true` because it reserves one of the five seats. An `invited` row reaches `/admin/welcome` and nothing else. `requireInvitedConsoleUser()` still demands a verified Supabase user, linked staff record, active account, console role and lifecycle `invited`. An unlinked or deactivated account cannot onboard, and an already accepted account cannot set its password again.

**Acceptance is transactional.** The `invited → active` transition, `accepted_at` and the `admin.accepted` audit row commit together or not at all. If they fail, onboarding stops with a generic retryable error; retries are idempotent and write no duplicate audit row.

**Invitations are a token-hash flow, not PKCE.** `inviteUserByEmail()` does not
support PKCE — the installed `@supabase/auth-js` states this itself — so
`/admin/auth/callback` verifies `token_hash` with `type` compared for equality
against `"invite"`. That type is attacker-controlled URL input and is never cast
into `EmailOtpType`, so a `recovery`, `signup` or `magiclink` link cannot enter
admin onboarding through that endpoint. The Supabase **Invite user** email
template must be set to the token-hash form for this to work at all; the exact
snippet is in `docs/admin-architecture.md` §9.

**Invitation consistency.** A Supabase auth user is created before the Karma
staff row can reference it, so a failure in between (a lost seat race, a
database blip) is compensated: the just-created auth user is deleted, but only
after confirming no staff row points at it. If the cleanup itself fails, a
recovery-required event is logged without any secret, id or email, the owner
sees a generic failure, and the manual procedure is in
`docs/admin-architecture.md`. No orphan is ever reported as success.

**No public sign-up.** No registration route, no self-service role selection, no
password reset that could enumerate addresses. Every account arrives through an
owner invitation; the single Owner arrives through a CLI bootstrap that refuses
to create a second one.

**Owner is never adopted from an existing identity.** If the bootstrap script's
`inviteUserByEmail()` call fails — most often because an auth user already holds
that address — it fails closed and tells the operator to inspect the account.
It does not search Supabase for a matching email and link whatever it finds: a
stale test account, or one registered with the owner's address before bootstrap
ran, would otherwise become the highest-privilege identity in the system. Only
the auth user that a successful invitation just created is ever linked.

**The owner's lifecycle is a database invariant.** Because the access layer
reads `status` as a security state, the trigger allows an owner row exactly one
transition — `invited → active`, the owner accepting their own invitation. Going
back to `invited`, moving to `deactivated`, demotion, deactivation and deletion
are all refused, and an owner row already in an unexplained `deactivated` state
refuses every ordinary write rather than being silently normalised.

**Sign-in** runs as a Server Action so Karma's own controls apply on top of
Supabase's: per-IP and per-email rate limiting (the same best-effort helper the
public forms use), and one generic message — `Email or password is incorrect.` —
whatever went wrong. It never reveals whether an address exists, whether an
account is deactivated, or whether it is the Owner. Passwords and tokens are
never logged.

**Password-only sign-in is the product policy.** Supabase Auth verifies the password; Karma's staff lifecycle, role and explicit permissions remain the authorization controls. There is no authenticator enrollment/challenge or MFA recovery flow in Karma Console.

**Owner-only team administration.** Inviting, deactivating and re-permissioning
accounts require the owner role, checked inside each server action, not
only in the page. There is deliberately no permission key that unlocks it, so it
cannot be granted to an admin. One Owner and five admin seats are enforced by a
database trigger with an advisory lock as well as by the application, so a race
between two invitations cannot slip past. The owner row cannot be deactivated,
demoted **or deleted**: the trigger fires on `BEFORE INSERT OR UPDATE OR
DELETE`, so `delete from staff where role = 'owner'` is refused too.

**Deactivation is immediate — and precisely what it says.** Karma sets
`active = false` and `status = 'deactivated'`; every protected request re-reads
that row, so the account is refused on its very next request. Supabase is
*additionally* asked to suspend the user with
`updateUserById(id, { ban_duration: '876000h' })` (`'none'` lifts it on
reactivation), and that result is inspected and logged as a status only — a
failure there is never fatal and is never reported as something it is not.

Two claims are deliberately avoided. This is **not** a session revocation:
`auth.admin.signOut()` requires a valid logged-in JWT, not a user id, so it
cannot be driven from a staff row, and Karma does not call it. And disabling the
Karma account does not by itself invalidate an already-issued Supabase access
token — what it guarantees is that the token buys nothing, because authorization
is Karma's decision, made from the database on every request. The auth user is
never deleted on deactivation; audit rows must keep pointing at a real identity.

**Reactivation cannot silently promote.** Deactivation overwrites `status`, so
reactivation restores from `accepted_at` instead: an account that never accepted
returns to `invited` and still owes onboarding; one that accepted returns to
`active`.

**Supabase Data API lockdown.** The publishable key is public. Migration 0002
enables RLS with no policies on the eighteen app tables that existed then and
revokes all grants from `anon` and `authenticated`; migration 0003 applies the
same two locks to `content_items`, so all nineteen are covered. That key cannot
read a student, an
application or a design brief through PostgREST. The backend is unaffected: it
connects as the table owner, which bypasses RLS (no `FORCE ROW LEVEL SECURITY`).

**Open redirect defence.** Every `?next=` goes through `safeNextPath`, which
accepts only internal `/admin` paths — no absolute URLs, no `//host`, no
backslashes, no encoded slashes, no control characters, and never an auth screen
(which would loop).

**Secret handling.** `SUPABASE_SECRET_KEY` is read only by a `server-only`
module, never exported, logged, serialised into a response, or prefixed with
`NEXT_PUBLIC_`. Its client disables session persistence and auto-refresh. Audit
rows never carry a password, token, key, credential or invitation
link — a test asserts it.

**Sign-out** is a POST (a GET that destroys a session can be triggered by any
image tag) and uses `scope: "global"`, so it revokes the refresh token rather
than only clearing this browser's cookie. This one CAN revoke, because it runs
with the person's own session — unlike admin deactivation, which has no JWT to
work with.

**Admin pages are `force-dynamic`** and never statically generated, so no
authenticated content can leak into build output or an edge cache.

## Security TODO (next phases)
- Audit entries for login success/failure (the schema already supports them).
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
- **Headers:** CSP (self + Turnstile + i.ytimg.com images + the Supabase
  project origin on `connect-src`, so the console's browser auth client can
  reach `/auth/v1/*`), HSTS, nosniff, DENY framing, strict referrer, minimal
  permissions policy (next.config.ts). Third-party hosts are allow-listed as
  exact origins — never `*.supabase.co`, which would open XHR to every
  Supabase project. Changing the Supabase project means updating the CSP;
  `tests/csp.test.ts` pins the directive.
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
