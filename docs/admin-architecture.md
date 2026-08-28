# Karma Console — admin platform architecture

The canonical reference for the staff-facing side of Karma Design Studio.
Supersedes the Neon + Better Auth direction described in earlier documents;
where an older document records what was true at the time, it now carries a
superseding note rather than being rewritten.

**Product name:** Karma Console · **URL:** `/admin` · **Dashboard:** "Today at Karma"

It is an internal operating system for one embroidery academy and design lab in
Mota Varachha, Surat — an academy CRM, a studio operations desk and an
embroidery production desk in one. It is deliberately not a generic school ERP
and not a generic admin template.

---

## 1. Architecture at a glance

```
                     ┌──────────────────────────────────────────┐
  Browser  ───────►  │  Cloudflare Worker (OpenNext + Next 15)   │
  /en /gu /admin     │                                          │
                     │  middleware:  /admin  → Supabase session  │
                     │               everything else → next-intl │
                     │                                          │
                     │  guard (src/lib/auth/guard.ts)            │
                     │    identity  → Supabase Auth              │
                     │    authority → staff row in Postgres      │
                     └───────┬───────────────────┬──────────────┘
                             │                   │
              Drizzle (node-postgres)     @supabase/ssr cookies
                             │                   │
                     ┌───────▼────────┐  ┌───────▼────────┐
                     │  Cloudflare    │  │  Supabase Auth │
                     │  HYPERDRIVE    │  │  password+TOTP │
                     └───────┬────────┘  └────────────────┘
                             │
                     ┌───────▼──────────────────────────────────┐
                     │  Supabase Postgres  (RLS on, no policies) │
                     │  staff · staff_permissions · audit_logs …│
                     └──────────────────────────────────────────┘

  Private files (B2B briefs, certificates, encrypted DB backups) → Cloudflare R2.
  NOT Supabase Storage. Transactional email → Resend.
```

**Supabase Auth proves identity. The Karma `staff` row decides authorization.**
That sentence is the whole security model; everything below is detail.

### What is deliberately absent

| Not used | Why |
| --- | --- |
| Neon | Replaced by Supabase Postgres. The dependency is gone from `package.json` and the lockfile. |
| Better Auth | Replaced by Supabase Auth. Never introduce it. |
| Supabase Storage | R2 is the object store, for briefs, certificates and backups alike. |
| Supabase Data API (`.from()`) | Karma has ONE data access layer: Drizzle over a trusted server connection. The Data API is locked out at the database (§4). |
| Any payment gateway | Fees are discussed in person or on WhatsApp. No links, no UPI, no checkout. Ever. |

---

## 2. Database strategy

Two connection paths, and the distinction matters:

| Path | Used by | Connection |
| --- | --- | --- |
| **Worker runtime** | every page, route handler and server action | `env.HYPERDRIVE.connectionString` |
| **CLI** | `db:generate`, `db:migrate`, `db:seed`, `db:backup`, `admin:bootstrap` | `DATABASE_URL` (direct) |

`src/lib/db/index.ts` resolves them in that order and falls back to
`DATABASE_URL` when the Hyperdrive binding is absent. That fallback is what
keeps `npm run build`, `npm test` and local development free of any Cloudflare
requirement — **Hyperdrive is never needed for a build to succeed**. It is also
the supported runtime path during the migration window, before the owner has
created the Hyperdrive configuration.

### Connection safety in a Worker

A Worker isolate is reused across requests belonging to different people, so a
Postgres connection must never outlive the request that opened it. Three things
guarantee that:

1. the pool is created **per request** (`cache()` scopes it to one render or one
   handler invocation) — there is no module-scope pool and no long-lived Node
   server pool;
2. `max: 1` — a request never holds more than one socket;
3. `maxUses: 1` — pg destroys the physical connection when it is released after
   a single checkout, so a socket is never handed to a second query.

We deliberately do **not** call `ctx.waitUntil(pool.end())`. `Pool.end()` marks
the pool as ending the instant it is invoked and `waitUntil` starts its promise
immediately, which would break every query issued afterwards. The short idle
timeout plus `maxUses: 1` closes sockets without that hazard.

Because `max: 1`, never check out a second client while holding one (no nested
transactions). Parallel queries serialise safely; the dashboard therefore uses a
single round trip.

---

## 3. Supabase Auth strategy

Current key model — the legacy `anon` / `service_role` names are not used:

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | build var | public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build var | public, ships in the browser bundle by design |
| `SUPABASE_SECRET_KEY` | **runtime secret** | privileged; server-only, never logged, never serialised |

Three clients, three jobs:

| Module | Key | Job |
| --- | --- | --- |
| `src/lib/supabase/client.ts` | publishable | browser, **auth flows only** (TOTP enrol/verify) |
| `src/lib/supabase/server.ts` | publishable | SSR cookie session for Server Components, Actions, Route Handlers |
| `src/lib/supabase/admin.ts` | **secret** | `server-only`; one job, admin invitations. `persistSession: false`, `autoRefreshToken: false` |

`getUser()` is used everywhere, never `getSession()`: `getSession` returns
whatever is in the cookie without contacting Supabase, so it can be replayed.

Middleware (`src/middleware.ts`) refreshes the session on `/admin/*` and hands
everything else to next-intl unchanged. It is **not** an access check —
middleware can be reasoned around, and the real decision needs the database.

---

## 4. Supabase Data API lockdown

The publishable key is public. Without this, anyone holding it could read
students, applications and design briefs through PostgREST. Migration
`0002_admin_foundation.sql` therefore applies two independent locks to all
eighteen application tables:

- `ENABLE ROW LEVEL SECURITY` with **no policies** — deny by default;
- `REVOKE ALL … FROM anon, authenticated` — no grants for the Data API roles.

Neither affects the backend: the migration runs as the table owner, and a table
owner bypasses RLS unless `FORCE ROW LEVEL SECURITY` is set (it is not).

> **Connect Hyperdrive with the role that owns these tables** — the `postgres`
> role in Supabase's connection string, the same one that runs the migrations.
> A different, non-owning role would be denied by RLS. Never "fix" that by
> adding a permissive `using (true)` policy; that would re-open the Data API.

---

## 5. Account model

**Exactly one Owner + at most five enabled Admins.** The Owner does not count
toward the five.

| Role | Console access | Notes |
| --- | --- | --- |
| `owner` | everything, always | the only superuser; bypasses the permission table entirely |
| `admin` | only what has been granted | capped at five enabled accounts |
| `trainer` | none (yet) | a staff record without console login; predates the console and is preserved |

A **seat** is consumed by any admin row with `active = true`. That includes a
pending invitation — the seat is reserved the moment the invitation goes out,
because the person can accept at any time. Deactivating an admin frees it
immediately.

### Invariants, and where they live

| Invariant | Application | Database |
| --- | --- | --- |
| One active owner | bootstrap script refuses a second | `karma_staff_invariants` trigger + advisory lock |
| Five admin seats | `validateInvite` → a sentence, not a 500 | same trigger + advisory lock |
| Owner cannot be deactivated or demoted | Team UI + `setActiveAction` | same trigger |
| One console identity per email | `validateInvite` | `uq_staff_console_email` partial unique index (case-insensitive) |
| One staff row per Supabase user | — | `staff_auth_user_id_unique` |

The trigger, not the UI, is what survives a race between two simultaneous
invitations: it takes `pg_advisory_xact_lock` before counting. The application
checks exist to produce a readable message.

The invariants are implemented as a plpgsql trigger rather than partial unique
indexes because `'owner'` is added to the `staff_role` enum by the same
migration, and Postgres refuses to evaluate a freshly added enum value in the
transaction that added it (drizzle applies all pending migrations in one
transaction). An index predicate must also be `IMMUTABLE`, which rules out
`role::text`. A plpgsql body is parsed at execution time and can additionally
take a lock.

### Ownership transfer

Not implemented, deliberately. It is a supervised recovery procedure, not a
dropdown: `ALTER TABLE staff DISABLE TRIGGER trg_karma_staff_invariants` inside
a reviewed transaction, deactivate the outgoing owner, promote the incoming one,
re-enable the trigger, write the audit rows by hand. Nothing in the UI can do
this, and nothing should.

---

## 6. Permissions

23 keys, listed in `src/lib/auth/permissions.ts`, validated by the application
before any of them reaches the database.

```
dashboard.view
applications.view   applications.manage
students.view       students.manage
courses.view        courses.manage
batches.view        batches.manage
attendance.view     attendance.manage
design.view         design.manage
certificates.view   certificates.manage
content.view        content.manage
fees.view           fees.manage
reports.view        audit.view        exports.run        settings.view
```

**There is no team permission, and there must never be one.** Team
administration is a property of being the Owner, so it cannot be granted away.
An ordinary Admin can never create, deactivate or re-permission another account.

An unknown key rejects the whole request rather than being dropped: silently
granting less than the owner intended is its own kind of bug.

### Templates

Starting points, not roles. The Owner picks one when inviting and then edits
individual permissions; nothing remembers which template was used, so a template
can never quietly re-assert itself later.

| Template | Shape |
| --- | --- |
| **Admissions** | dashboard, applications (view+manage), students, courses/batches read, reports |
| **Academy** | students, courses, batches, attendance, certificates, reports |
| **Design Lab** | design (view+manage), reports |
| **Operations** | applications, students, batches, fee ledger, reports, exports |
| **Content** | website content, courses, batches, students read |
| **Custom** | empty — a deliberate blank slate |

---

## 7. The access decision

Six conditions, evaluated in a fixed order by `evaluateAccess`
(`src/lib/auth/access.ts` — pure, and unit-tested for every state):

1. a verified Supabase user
2. a linked `staff` record
3. `staff.active === true`
4. a console role (owner or admin)
5. **MFA — the session is at AAL2**
6. the permission the operation requires

All six matter. A valid Supabase user without a staff row gets nothing. A
deactivated admin holding an old session is rejected on their very next request,
because `staff.active` is read server-side every time.

The staff checks run **before** MFA on purpose: a dead account is turned away
rather than walked through enrolling an authenticator it will never use.

Guards, all in `src/lib/auth/guard.ts` — nothing re-implements a role check
inline:

| Guard | For |
| --- | --- |
| `requireAdmin()` | any console page |
| `requireOwner()` | Team, and nothing else |
| `requirePermission(key)` | a specific capability |
| `authorizeAction(req)` | server actions — returns a typed failure, never redirects |

A server action must not redirect on an authorization failure: a redirect inside
a form submission reads as success to the caller.

> Navigation is not security. Every destination guards itself; hiding a link is
> courtesy.

---

## 8. MFA

TOTP is **mandatory for every console session, the Owner included**.

| Supabase state | Meaning | Where the guard sends them |
| --- | --- | --- |
| `currentLevel: aal1`, `nextLevel: aal1` | no factor enrolled | `/admin/mfa/setup` |
| `currentLevel: aal1`, `nextLevel: aal2` | factor enrolled, code not entered | `/admin/mfa/challenge` |
| `currentLevel: aal2` | satisfied | through |
| unknown / error | treated as unverified | `/admin/mfa/setup` |

Enrolment shows the Supabase QR plus a manual key, once. Karma never stores the
TOTP secret: there is no column for it and no code path that writes one.

Removing the only authenticator is not offered on the account page. An admin who
did that would be locked inside a console that requires AAL2, and a self-service
reset would be a way around mandatory MFA. **MFA recovery is a supervised owner
procedure — specified for the next phase, not implemented unsafely now.**

---

## 9. Invitation flow

```
Owner → /admin/team → Invite admin
   ↓ name, email, template, optional custom permissions, console language
authorizeAction({ ownerOnly: true })      owner + active + AAL2
validateInvite(...)                       email, name, keys, duplicates, seats
supabase.auth.admin.inviteUserByEmail()   SUPABASE_SECRET_KEY, one call
   ↓ ONE transaction
staff row (status 'invited') + staff_permissions rows + audit_logs row
   ↓ invitee clicks the emailed link
/admin/auth/callback   handles BOTH `code` (PKCE) and `token_hash` + `type`
/admin/welcome         sets a password (12+ chars); status → 'active'
/admin/mfa/setup       enrols an authenticator   ← forced, no way past
Karma Console                                     ← only at AAL2
```

Karma stores no invitation token, logs no invitation URL, and never echoes
Supabase's error text (it distinguishes "already registered" from other
failures, which is an enumeration signal).

An expired or already-used link lands on `/admin/welcome?state=expired` with an
honest message and no detail about why.

---

## 10. Initial owner bootstrap

There is no public way to create an Owner.

```bash
npm run admin:bootstrap -- --dry-run    # check; changes nothing
npm run admin:bootstrap                 # invite and link the owner
```

Needs `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`INITIAL_OWNER_EMAIL`, optionally `INITIAL_OWNER_NAME`.

- if **this** email is already the owner → exits 0, changes nothing
- if a **different** owner exists → refuses and exits 1
- otherwise → invites, inserts `role = owner`, writes one audit row

It never sets a password, never prints a secret, never prints the invitation
link, and never guesses an address. Run it yourself; nothing runs it for you.

---

## 11. Audit

Reuses the existing `audit_logs` table — actor, action, entity, old value, new
value, reason, timestamp. No parallel subsystem.

`admin.owner.bootstrapped` · `admin.invited` · `admin.accepted` ·
`admin.permissions.changed` · `admin.deactivated` · `admin.reactivated`

Never written: passwords, TOTP secrets, access or refresh tokens, the Supabase
secret key, database credentials, raw invitation links. A test asserts every
team mutation both starts with the owner check and writes an audit row.

Audit rows are never deleted, which is one reason accounts are deactivated
rather than removed: an audit row must keep pointing at a real staff record.

---

## 12. Console modules

| Module | State |
| --- | --- |
| Login, MFA setup, MFA challenge, invite acceptance | shipped |
| Protected shell + navigation | shipped |
| Today at Karma | shipped (real counts only) |
| Team (owner-only) | shipped |
| Account & security | shipped |
| Admissions CRM | later phase |
| Student 360 | later phase |
| Courses & batches editor | later phase |
| Attendance | later phase |
| Certificates | later phase |
| Design Desk | later phase |
| Content desk | later phase |
| Offline fee ledger | later phase, owner opt-in |
| Reports & exports | later phase |

Unshipped modules appear in the navigation, marked plainly unavailable. They do
not open screens of invented rows.

**Today at Karma** counts only what the current schema actually holds: new
applications, follow-ups due, applications this week, running and upcoming
batches, new and open design briefs, plus real audit activity. Dates are pinned
to `Asia/Kolkata`, so "today" means today in Surat. With no database connected
the page says exactly that rather than showing a plausible zero.

---

## 13. Console design

The existing "Digital Thread" system (`docs/design-system.md`), denser. Same
tokens, same one vermilion accent, borders over shadows, status colours used
only as statuses. Admin primitives live in `globals.css`: `.panel`, `.navlink`,
`.metric`, `.table-admin`, `.status`, `.empty-state`, `.alert`.

No charts, no donuts, no gradients, no glassmorphism, no decorative cards, no
stock photography, no large component framework — the Worker budget and the
studio's taste point the same way.

Console copy lives in `messages/{en,gu}.json` under `admin`, so the EN/GU parity
test covers it exactly as it covers the public site. Server components translate
and pass finished strings into client components as props, which keeps the
catalogs out of the browser bundle. `staff.admin_locale` holds each person's
preference; a cookie covers the pre-login screens. **Gujarati is never
uppercased or letterspaced** — `.microlabel` and `.eyebrow` self-neutralise.

The public site's `/en` and `/gu` routing is untouched. The console lives
outside the `[locale]` segment on purpose: staff type `/admin`, not `/en/admin`.

---

## 14. R2

R2 stays **private**. No public buckets, no unauthenticated object URLs.

| Use | State |
| --- | --- |
| B2B brief files (`karma-brief-files`) | in use by the public brief form |
| Design Desk assets (`.dst .emb .pes .jef .pdf .ai .zip`) | later phase |
| Certificate PDFs | later phase |
| Encrypted database backups (`karma-db-backups`) | later phase |

Authenticated downloads will flow through authorised server routes or
short-lived signed access, gated on `design.view` / `certificates.view`. The
permission model already carries those keys.

---

## 15. Backups

Today: `npm run db:backup` exports every table to CSV; the weekly GitHub Action
keeps artifacts for 90 days and fails loudly on a partial export. It now reads
Supabase over `DATABASE_URL`; the Neon-specific assumptions are gone.

Target: nightly `pg_dump` → compress → **encrypt** → private R2
(`karma-db-backups`), retaining ~30 daily and ~12 monthly. Not built in this
phase; the exports contain PII, so treat the artifacts accordingly.

---

## 16. Environment variables

| Variable | Kind | Where |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build var | `wrangler.jsonc` `vars` |
| `NEXT_PUBLIC_SUPABASE_URL` | build var | Cloudflare build variables |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build var | Cloudflare build variables |
| `SUPABASE_SECRET_KEY` | **runtime secret** | `wrangler secret put` |
| `DATABASE_URL` | CLI; runtime secret only while Hyperdrive is pending | `.env`, GitHub Actions secret, `wrangler secret put` |
| `RESEND_API_KEY` | runtime secret | `wrangler secret put` |
| `TURNSTILE_SECRET_KEY` | runtime secret | `wrangler secret put` (later) |
| `CRON_SECRET` | runtime secret | `wrangler secret put` + GitHub secret |
| `INITIAL_OWNER_EMAIL` / `_NAME` | CLI only | local shell for the bootstrap run |

`NEXT_PUBLIC_*` values are inlined into the bundle at **build** time, so they
must exist in Cloudflare's build variables, not only as secrets. Secrets are
read at **runtime** and must never appear in `wrangler.jsonc`.

---

## 17. Manual setup checklist

Nothing below can be done from the repository. Work top to bottom.

**Supabase**

1. Create a Supabase project (region closest to India). Save the database
   password in a password manager — it is shown once.
2. Project Settings → API keys: copy the **Project URL**, the **publishable**
   key (`sb_publishable_…`) and the **secret** key (`sb_secret_…`).
3. Project Settings → Database → copy the direct **connection string**.
4. Authentication → Sign In / Providers → **Email**: enable email + password.
5. Authentication → Sign In / Providers → **disable public sign-ups**. Karma is
   invitation-only; this is not optional.
6. Authentication → Multi-Factor → enable **TOTP**.
7. Authentication → URL Configuration → **Site URL**:
   `https://karma-design-studio.essanciaonline.workers.dev`
8. Same screen → **Redirect URLs**, add:
   - `https://karma-design-studio.essanciaonline.workers.dev/admin/auth/callback`
   - `http://localhost:3000/admin/auth/callback`
   - Cloudflare preview builds get their own hostname. Add it **after** the
     first preview deploy exists, once you can read the real URL — the pattern
     cannot be known from the repository, and a broad wildcard is not worth
     guessing. Do **not** add `karmadesignstudio.in` yet.

**Cloudflare — build variables** (Workers & Pages → karma-design-studio →
Settings → Variables → Build)

9. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `NEXT_PUBLIC_SITE_URL`.

**Cloudflare — runtime secrets**

10. `npx wrangler secret put SUPABASE_SECRET_KEY`
11. `npx wrangler secret put DATABASE_URL` — only until Hyperdrive is bound.

**Cloudflare — Hyperdrive**

12. `npx wrangler hyperdrive create karma-supabase --connection-string="postgresql://USER:PASSWORD@HOST:5432/postgres"`
13. Paste the returned id into `wrangler.jsonc` → `hyperdrive[0].id` and
    uncomment the block. Commit that change; the id is a configuration
    identifier, not a credential — the password lives in Hyperdrive, not in git.
14. Redeploy, then confirm `/api/health` reports `dbViaHyperdrive: true` and
    remove the temporary `DATABASE_URL` secret.

**Database migration** (only after reviewing the SQL)

15. Locally, with `DATABASE_URL` set to the direct Supabase connection:
    `npm run db:migrate` — applies `0000`, `0001` and `0002`.
16. Optional: `npm run db:seed` for the verified course catalog.

**First owner**

17. Set `INITIAL_OWNER_EMAIL` (and `INITIAL_OWNER_NAME`) in `.env`.
18. `npm run admin:bootstrap -- --dry-run`, then `npm run admin:bootstrap`.
19. Open the invitation email, set a password, scan the authenticator QR, enter
    the six-digit code.
20. Sign in at `/admin/login`, then invite the first admin from `/admin/team`.

**Still outstanding, on purpose**

21. Turnstile keys — the owner is configuring these separately, later.
22. The custom domain `karmadesignstudio.in` — a launch step, connected only
    when the owner says the website is complete.

---

## 18. Cost posture

Free tiers, deliberately: Cloudflare Workers, Cloudflare Hyperdrive, Cloudflare
R2, Supabase, Resend, GitHub Actions. No paid dependency has been added.

Provider limits change, so none is written here as a fact. **Re-check every
provider's current free-tier limits before launch**, especially the Worker
bundle size (`npx wrangler deploy --dry-run` reports the gzip figure) and the
Supabase free-project pause policy.

---

## 19. Where things live

```
src/lib/db/index.ts            Hyperdrive → Postgres, request-scoped
src/lib/db/schema.ts           Drizzle schema (staff, staff_permissions, …)
src/lib/supabase/env.ts        public config, one place
src/lib/supabase/client.ts     browser, auth only
src/lib/supabase/server.ts     SSR cookie session
src/lib/supabase/admin.ts      server-only, privileged, invitations
src/lib/supabase/middleware.ts session refresh
src/lib/auth/permissions.ts    keys, groups, templates
src/lib/auth/access.ts         the six-step decision, pure
src/lib/auth/seats.ts          one owner + five admin seats, pure
src/lib/auth/redirect.ts       safe `next=`, redirect targets, pure
src/lib/auth/staff.ts          staff lookup + grants
src/lib/auth/guard.ts          requireAdmin / requireOwner / requirePermission
src/lib/admin/audit.ts         audit actions and row shape
src/lib/admin/invite.ts        invitation validation, pure
src/lib/admin/dashboard.ts     Today's counts, one round trip
src/lib/admin/i18n.ts          console translations (EN/GU)
src/app/admin/(auth)/…         login, MFA, welcome, no-access
src/app/admin/(console)/…      shell, Today, Team, account
src/app/admin/auth/callback    invite / recovery callback
src/components/admin/…         ConsoleShell, Metric, SignOutLink, LocaleToggle
scripts/bootstrap-owner.ts     the only way to create an Owner
drizzle/0002_admin_foundation.sql   roles, permissions, invariants, RLS lockdown
```
