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
                     │  HYPERDRIVE    │  │ email+password │
                     └───────┬────────┘  └────────────────┘
                             │
                     ┌───────▼──────────────────────────────────┐
                     │  Supabase Postgres  (RLS on, no policies) │
                     │  staff · staff_permissions · audit_logs …│
                     └──────────────────────────────────────────┘

  Private files (B2B briefs, certificates, encrypted DB backups) → Cloudflare R2.
  NOT Supabase Storage. Auth/invitation email → Supabase custom SMTP.
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

The binding is read through OpenNext's public `getCloudflareContext()` API, in
**sync** mode. Sync is the correct mode here rather than a shortcut: it resolves
from the context the Worker entrypoint (and `initOpenNextCloudflareForDev`) has
already installed, and it throws everywhere else instead of spinning up a
wrangler/miniflare proxy. That throw *is* the fallback signal, caught and turned
into "use `DATABASE_URL`". No OpenNext internals are touched.

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
| `src/lib/supabase/client.ts` | publishable | browser, **auth flows only** (sign-in/session refresh) |
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
`0002_admin_foundation.sql` therefore applies two independent locks to the
eighteen application tables that existed at the time, and migration
`0003_content_desk.sql` applies the same two locks to `content_items` — so all
**nineteen** app tables are locked today:

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

### Lifecycle: `staff.status`

`active` is the master switch, `role` is the capability, and `status` is where
the account is in its life. All three are enforced; none is decorative.

| status | Seat | May reach | May NOT reach |
| --- | --- | --- | --- |
| `invited` | **yes** — reserved from the moment the invite is sent | `/admin/welcome` (set a password) | any console page or server action |
| `active` | yes | the console, subject to permissions | — |
| `deactivated` | no — the seat is freed | nothing at all | onboarding/auth screens, the console |

The `invited` row is `active: true` on purpose: the seat has to be held. That
makes `status` load-bearing rather than informational — without it, an invited account would be indistinguishable from an accepted one. The
access decision therefore checks it (§7), and `/admin/welcome` is the only path
an `invited` account can take.

**Reactivation reads `accepted_at`, not `status`.** Deactivating overwrites
`status` with `deactivated`, which destroys the evidence of where the account
was. `accepted_at` is set once, at acceptance, and never cleared:

- never accepted → reactivates to `invited`; they still owe onboarding
- accepted before → reactivates to `active`

Reading `status` instead would silently promote someone who never accepted their
invitation into a fully working console account.

### Invariants, and where they live

| Invariant | Application | Database |
| --- | --- | --- |
| One active owner | bootstrap script refuses a second | `karma_staff_invariants` trigger + advisory lock |
| Five admin seats | `validateInvite` → a sentence, not a 500 | same trigger + advisory lock |
| Owner cannot be deactivated or demoted | Team UI + `setActiveAction` | same trigger |
| **Owner cannot be DELETED** | the UI never deletes anyone | same trigger, on `BEFORE ... DELETE` |
| **Owner lifecycle cannot go backwards** | nothing in the UI attempts it | same trigger (see below) |
| One console identity per email | `validateInvite` | `uq_staff_console_email` partial unique index (case-insensitive) |
| One staff row per Supabase user | — | `staff_auth_user_id_unique` |

The trigger fires `BEFORE INSERT OR UPDATE OR DELETE`. Protecting only UPDATE
would have left the obvious hole — `delete from staff where role = 'owner'`
removes the sole superuser while satisfying every other rule on the way out. The
DELETE branch is handled first and separately because a delete has `OLD` and no
`NEW`; admin and trainer rows can still be deleted by a supervised operator.

**The owner's `status` is protected too**, because the access layer reads it as
a security state: `active` is required, `deactivated` is denied. So the trigger
allows exactly one lifecycle move on an owner row:

| From | To | |
| --- | --- | --- |
| `invited` | `invited` | allowed — an ordinary edit that leaves status alone |
| `invited` | `active` | **allowed** — the owner accepting their own invitation |
| `invited` | `deactivated` | rejected |
| `active` | `active` | allowed |
| `active` | `invited` | rejected — would strand the console with no usable owner |
| `active` | `deactivated` | rejected — the access layer would read it as denied |
| `deactivated` | anything | rejected, fail closed |

That last row is deliberate. An owner row can only reach `deactivated` through a
supervised override or direct manipulation, so finding one means something went
wrong; the trigger refuses every ordinary write on it, including a well-meaning
"fix", rather than quietly normalising a state nobody can explain. A human
resolves it with the trigger disabled.

Ordinary fields — `name`, `admin_locale`, `last_seen_at`, `accepted_at` — are
untouched by any of this and change freely, on an invited owner as well as an
active one.

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

### What deactivation actually does

Deactivating an admin does two things, and it is worth being precise about which
one is the control:

1. **Karma sets `active = false` and `status = 'deactivated'`.** This is the
   real, immediate kill switch. Every protected request re-reads the staff row
   server-side, so the account is refused on its very next request — page,
   server action and onboarding/auth screens alike.
2. **Supabase suspends the auth user** via
   `auth.admin.updateUserById(id, { ban_duration: '876000h' })`, and lifts it
   with `{ ban_duration: 'none' }` on reactivation. This is defence in depth: it
   stops Supabase minting or refreshing tokens for that user.

Step 2 is best effort. Its result is inspected and logged as a status only; a
failure is never fatal to step 1 and is **never reported to the owner as
something it is not**. The two directions fail differently, so Team reports them
differently:

- **Deactivating** — a failed ban is not a security problem, because Karma
  already denies the account. The owner sees "account deactivated" with a note
  that the sign-in provider could not be updated as well.
- **Reactivating** — a failed *unban* matters operationally: Karma says the
  admin is back while Supabase may still refuse their sign-in. Reporting a plain
  "reactivated" there would be untrue, so the owner gets a warning telling them
  to try again shortly. The Karma record is **not** rolled back for it.

Neither message exposes a Supabase status code or internal detail.

Two things this deliberately does **not** claim:

- It is **not** a session revocation. `auth.admin.signOut()` takes a valid
  logged-in JWT, not a user id, so it cannot be driven from a staff row. Passing
  a UUID there would be a silent no-op at best. Karma does not call it.
- Disabling the Karma account does not, by itself, invalidate an already-issued
  Supabase access token. What it does is guarantee that the token buys nothing:
  authorization is Karma's decision, made from the database on every request.

The Supabase auth user is **never deleted** on deactivation — the audit trail
refers to that identity. Accounts are deactivated, never removed.

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

Seven conditions, evaluated in a fixed order by `evaluateAccess`
(`src/lib/auth/access.ts` — pure, and unit-tested for every state):

1. a verified Supabase user
2. a linked `staff` record
3. `staff.active === true` (and not lifecycle `deactivated`)
4. a console role (owner or admin)
5. **lifecycle `status === "active"`** — an `invited` account is still onboarding
6. the permission the operation requires

All six matter. A valid Supabase user without a staff row gets nothing. A deactivated admin holding an old session is rejected on their next request because `staff.active` is read server-side every time. An invited account is sent to `/admin/welcome` and reaches no console data.

Guards, all in `src/lib/auth/guard.ts` — nothing re-implements a role check
inline:

| Guard | For |
| --- | --- |
| `requireAdmin()` | any console page |
| `requireOwner()` | Team, and nothing else |
| `requirePermission(key)` | a specific capability |
| `authorizeAction(req)` | server actions — returns a typed failure, never redirects |
| `requireInvitedConsoleUser()` / `resolveOnboarding()` | `/admin/welcome` only |

`requireInvitedConsoleUser()` is the narrow onboarding guard. It demands a verified Supabase user, a **linked** staff record, `active`, a console role and lifecycle `invited`. An unlinked/deactivated account cannot use onboarding, and an already accepted account is sent onward rather than being allowed to set a password a second time.

A server action must not redirect on an authorization failure: a redirect inside
a form submission reads as success to the caller.

> Navigation is not security. Every destination guards itself; hiding a link is
> courtesy.

---

## 8. Password-only sign-in

Karma Console deliberately uses invite-only email + password sign-in. Supabase assurance-level fields remain compatibility metadata in the auth layer, but they do not gate console access. The security controls are the verified Supabase identity, linked/active staff lifecycle, owner/admin role, explicit permission checks, invitation-only account creation, seat limits, database RLS lockdown and audit logging.

There are no MFA setup/challenge routes and no authenticator recovery workflow.

---

## 9. Invitation flow

```
Owner → /admin/team → Invite admin
   ↓ name, email, template, optional custom permissions, console language
authorizeAction({ ownerOnly: true })      owner + active
validateInvite(...)                       email, name, keys, duplicates, seats
supabase.auth.admin.inviteUserByEmail()   SUPABASE_SECRET_KEY, one call
   ↓ ONE transaction  (compensated if it fails — see below)
staff row (status 'invited') + staff_permissions rows + audit_logs row
   ↓ invitee clicks the emailed link
/admin/auth/callback   token_hash + type=invite  →  verifyOtp
/admin/welcome         requireInvitedConsoleUser(); sets a password (12+ chars)
   ↓ ONE transaction   status invited → active, accepted_at, audit row
/admin                         Karma Console ← password-authenticated, active, permission-checked
```

Karma stores no invitation token, logs no invitation URL, and never echoes
Supabase's error text (it distinguishes "already registered" from other
failures, which is an enumeration signal).

### The invitation is NOT a PKCE flow

`inviteUserByEmail()` does not support PKCE. The installed `@supabase/auth-js`
says so in its own documentation: *"PKCE is not supported when using
inviteUserByEmail. This is because the browser initiating the invite is often
different from the browser accepting the invite."*

So `/admin/auth/callback` implements the **token-hash** flow and nothing else.
There is no `code` to exchange and no `exchangeCodeForSession` call. `type`
arrives from the URL, so it is attacker controlled: it is compared for equality
with `"invite"` and never cast into `EmailOtpType`, which also covers
`recovery`, `signup`, `magiclink` and `email_change`. A `type=recovery` link
cannot enter admin onboarding through this endpoint.

### Invite user email template — REQUIRED manual step

**Supabase Dashboard → Authentication → Emails → Templates → "Invite user".**

Without this change, invitations reach a dead end. The stock template links to
`{{ .ConfirmationURL }}`, which routes through Supabase's own
`/auth/v1/verify` endpoint and returns the session in the **URL fragment**
(`#access_token=…`). A fragment is never sent to the server, so a server-side
cookie application cannot establish a session from it. The token-hash form
below reaches our callback with parameters the server can actually verify.

Replace the template body with exactly this:

```html
<h2>You have been invited to Karma Console</h2>

<p>Karma Design Studio &amp; Classes has invited you to a staff account.
Follow this link to accept the invitation and set your password:</p>

<p>
  <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">
    Accept the invitation
  </a>
</p>

<p>If you were not expecting this, you can ignore this email.</p>
```

Why it is shaped that way:

- `{{ .RedirectTo }}` is the `redirectTo` Karma passes to
  `inviteUserByEmail()`. `src/lib/supabase/invite-redirect.ts` keeps it
  **free of any query string** — `https://…/admin/auth/callback` — precisely so
  the template can append `?` unambiguously. If `redirectTo` ever regained a
  `?next=…`, this template would produce two `?` and break every invitation.
- `{{ .TokenHash }}` and `{{ .RedirectTo }}` are Supabase's documented template
  variables. Nothing here is invented.
- `type=invite` is fixed, not templated: this callback accepts no other flow.
- The `next` parameter is omitted; the callback defaults it to
  `/admin/welcome` and re-validates it with `safeNextPath` regardless.

`{{ .RedirectTo }}` is only populated when the URL is allow-listed under
**Authentication → URL Configuration → Redirect URLs**. Add
`https://karma-design-studio.essanciaonline.workers.dev/admin/auth/callback`
there before sending a real invitation, and send one test invitation to
yourself to confirm the link lands on `/admin/welcome` rather than the
"invitation is no longer valid" screen.

### Acceptance is a transaction

Setting the password is only half of acceptance. The Karma side —
`status: invited → active`, `accepted_at`, and the `admin.accepted` audit row —
runs in **one transaction** (`src/lib/admin/onboarding.ts`), guarded by a WHERE
clause that matches only a row linked to this Supabase user that is still
`invited`, still `active`, and holds a console role.

If that transaction fails, the flow **stops** with a generic, retryable error.
It does not continue into the console, because the staff row is the authority: until the
transition commits the person is still in onboarding-only state, and saying
otherwise would be a lie. The password is not rolled back — there is nothing
safe to roll it back to — and a retry simply re-runs both halves, which are
both idempotent. A second run finds no `invited` row, sees the account is
already `active`, and reports success without writing a duplicate audit entry.

### Orphaned invitations, and how they are compensated

An invitation spans two systems and only one of them has our transaction.
Supabase creates the auth user first (the staff row has to store its id), then
Karma commits. A failure in between would leave a Supabase auth user with no
Karma identity.

The seat race makes this concrete: four seats taken, two invitations sent at the
same moment, both passing the friendly pre-check, both Supabase users created —
and then the database trigger admits one staff row and rejects the other.

So `src/lib/admin/invite-persistence.ts` compensates: if persistence fails, the
auth user created moments ago for **this** invitation is deleted. That is safe
precisely because it never became a Karma identity — no staff row, no committed
audit history. `hasStaffForAuthUser` is checked first, so a partially committed
row can never be orphaned from its auth user by the cleanup itself.

**Ordinary admin deactivation never deletes an auth user.** This is the single
exception, and it is narrow by construction.

#### Recovery procedure (when cleanup also fails)

If both the persistence and the cleanup fail, the server logs, without any
secret, user id or email:

```
[team] RECOVERY REQUIRED: a Supabase auth user was created for an invitation
whose Karma record did not commit, and could not be removed automatically.
```

The owner-facing message is a generic failure. To recover:

1. Supabase Dashboard → Authentication → Users, find the address that was
   invited but does not appear on `/admin/team`.
2. Confirm it has no Karma staff row:
   `select id from staff where auth_user_id = '<uuid>';` — it must return none.
3. Delete that user in the dashboard.
4. Send the invitation again from `/admin/team`.

Never delete a user that step 2 finds a staff row for: deactivate the account in
Karma Console instead.

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
- otherwise → invites, inserts `role = owner` + `status = invited`, and writes
  one audit row, the two in a single transaction

**It never adopts a pre-existing Supabase auth user as Owner.** Owner is the
highest-privilege identity in the system, so if `inviteUserByEmail()` fails —
most often because an auth user with that address already exists — the script
fails closed and tells the operator to go and look:

> A Supabase Auth user already exists for `ow****@example.com`, or the
> invitation could not be created. Karma will NOT automatically grant Owner
> access to an existing Auth identity. Open Supabase → Authentication → Users,
> inspect that account, remove or resolve it if it is unexpected, then run this
> script again.

It does **not** search the user list for a matching address and link whatever
it finds. A stale test account, or one an attacker registered with the owner's
address before bootstrap ran, would otherwise become Owner.

If the Karma transaction fails after Supabase created the user, the same
compensation as the admin invite path applies: the just-created auth user is
deleted, but only after confirming no staff row references it. If that cleanup
also fails, the script prints the recovery procedure and exits non-zero — see
"orphaned invitation recovery" in §9.

It never sets a password, never prints a secret, never prints the invitation
link, and never guesses an address. The owner's own address appears masked, so
the operator can recognise what they typed. Run it yourself; nothing runs it
for you.

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
| Login + invite acceptance (password-only) | shipped |
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
6. Authentication → Multi-Factor: **nothing to do.** Karma Console is
   password-only (§8). Do not enable TOTP as an access requirement, and do not
   treat Supabase's MFA capability as part of the sign-in flow.
7. Authentication → URL Configuration → **Site URL**:
   `https://karma-design-studio.essanciaonline.workers.dev`
8. Same screen → **Redirect URLs**, add:
   - `https://karma-design-studio.essanciaonline.workers.dev/admin/auth/callback`
   - `http://localhost:3000/admin/auth/callback`
   - Cloudflare preview builds get their own hostname. The pattern is now known
     from the first preview deploy of this branch:

     ```
     https://<branch-or-commit>-karma-design-studio.essanciaonline.workers.dev
     ```

     so the narrowest allow-list entry that covers previews is

     ```
     https://*-karma-design-studio.essanciaonline.workers.dev/admin/auth/callback
     ```

     That wildcard is bounded to this worker on this account subdomain — it is
     not `https://*/…`. Add it only if you actually need to accept invitations
     on a preview build; production and localhost above are enough for the
     normal flow. Do **not** add `karmadesignstudio.in` yet.
8b. **Authentication → Emails → Templates → "Invite user"**: replace the body
   with the token-hash template in §9. This step is REQUIRED — the stock
   template returns the session in a URL fragment, which a server-side
   application can never read, so invitations would dead-end. Send one test
   invitation to yourself afterwards and confirm it lands on `/admin/welcome`.

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
    `npm run db:migrate` — applies `0000`, `0001`, `0002` and `0003`.
16. Optional: `npm run db:seed` for the verified course catalog.

**First owner**

17. Set `INITIAL_OWNER_EMAIL` (and `INITIAL_OWNER_NAME`) in `.env`.
18. `npm run admin:bootstrap -- --dry-run`, then `npm run admin:bootstrap`.
19. Open the invitation email and set a password. That is the whole of
    onboarding — there is no authenticator to enrol (§8).
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
src/lib/supabase/invite-redirect.ts  query-free redirectTo, shared by both callers
src/lib/auth/permissions.ts    keys, groups, templates
src/lib/auth/access.ts         the seven-step decision + onboarding, pure
src/lib/auth/seats.ts          one owner + five admin seats, pure
src/lib/auth/redirect.ts       safe `next=`, redirect targets, pure
src/lib/auth/invite-callback.ts  callback parameter validation, pure
src/lib/auth/staff.ts          staff lookup + grants
src/lib/auth/guard.ts          requireAdmin / requireOwner / requirePermission /
                               requireInvitedConsoleUser
src/lib/admin/audit.ts         audit actions and row shape
src/lib/admin/invite.ts        invitation validation, pure
src/lib/admin/invite-persistence.ts  orphan compensation, pure (injected deps)
src/lib/admin/onboarding.ts    invited → active, one transaction
src/lib/admin/lifecycle.ts     reactivation status from accepted_at, pure
src/lib/admin/dashboard.ts     Today's counts, one round trip
src/lib/admin/i18n.ts          console translations (EN/GU)
src/app/admin/(auth)/…         login, welcome, no-access
src/app/admin/(console)/…      shell, Today, Team, account
src/app/admin/auth/callback    invite / recovery callback
src/components/admin/…         ConsoleShell, Metric, SignOutLink, LocaleToggle
scripts/bootstrap-owner.ts     the only way to create an Owner
drizzle/0002_admin_foundation.sql   roles, permissions, invariants, RLS lockdown
```
