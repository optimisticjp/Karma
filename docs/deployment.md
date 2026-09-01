# Deployment guide — Codespaces → Supabase → Cloudflare

Follow top to bottom. Every step is free-tier. Commands run in the repo root.

The Karma Console half of this (Supabase Auth settings, the Hyperdrive binding,
the Owner bootstrap) has its own numbered checklist in
**`docs/admin-architecture.md` §17**. This document covers the deployment; that
one covers the accounts.

> **Current live URL:** `https://karma-design-studio.essanciaonline.workers.dev`
> The custom domain `karmadesignstudio.in` is a LAUNCH step and is deliberately
> not connected. Do not point Supabase Auth or `NEXT_PUBLIC_SITE_URL` at it
> until the owner says the website is complete.
>
> **Current infrastructure state:** Turnstile is ACTIVE on the workers.dev
> production hostname. Resend notification email is deliberately deferred until
> the custom domain is connected and verified. R2 file storage and the custom
> domain are also deferred. `/api/health` reports email readiness separately,
> but deferred Resend does not make the site unhealthy during testing.

## 0. GitHub + Codespaces
1. Create a GitHub repo, push this project, open a Codespace.
   `.devcontainer/` gives you Node 22 and auto-runs `npm install`.
2. `cp .env.example .env`

## 1. Supabase (database + staff auth)
1. https://supabase.com → New project (region closest to India). Save the
   database password: it is shown once.
2. Project Settings → Database → copy the **direct** connection string into
   `.env` as `DATABASE_URL`.
3. Project Settings → API keys → copy the Project URL, the publishable key
   (`sb_publishable_…`) and the secret key (`sb_secret_…`) into `.env`.
4. `npm run db:migrate` → creates all tables from `drizzle/`, plus the account
   invariants and the Data API lockdown in migration 0002. **Review the SQL
   before running this against a live database.**
5. `npm run db:seed` → verified courses + starter batches.
6. `npm run dev` → batch tables now show live data (no sample tag).
7. Configure Supabase Auth (email+password on, public sign-ups OFF, Site URL
   and redirect URLs) — the exact settings are in
   `docs/admin-architecture.md` §17. **Do not enable TOTP as an access
   requirement**: Karma Console is password-only by explicit owner decision.
8. **Authentication → Emails → Templates → "Invite user": replace the body with
   the token-hash template in `docs/admin-architecture.md` §9.** This is not
   optional. The stock template returns the session in a URL fragment, which a
   server-side application can never read, so every invitation would dead-end
   on "this invitation link is no longer valid". Send one test invitation to
   yourself after changing it.

Free-tier note: a Supabase free project pauses after a period of inactivity.
The weekly backup workflow and the uptime monitor (step 7) keep it warm.
Re-check the current pause policy before launch — provider limits change.

## 2. Turnstile (spam protection) — ACTIVE

Turnstile protects the public admission and B2B brief forms.

Current production setup:
- Managed Turnstile widget.
- Allowed hostname: `karma-design-studio.essanciaonline.workers.dev`.
- Public site key is stored in `wrangler.jsonc` as `TURNSTILE_SITE_KEY`.
- Secret key is stored only in Cloudflare as the Worker secret
  `TURNSTILE_SECRET_KEY`; never commit or paste that value into source control.
- Server verification checks Cloudflare success, the expected hostname, and the
  stable `public_form` action.

When the custom domain is connected later, add it to the Turnstile widget's
allowed hostnames, update `TURNSTILE_HOSTNAMES`, and redeploy before removing
the workers.dev hostname.

## 3. Resend (email notifications) — DEFERRED UNTIL CUSTOM DOMAIN

Karma has **two independent email paths**, and they are easy to confuse:
*notification* mail (a new application, a new brief, the daily digest) goes
through **Resend**; *auth and invitation* mail goes through **Supabase Auth with
custom SMTP**. `/api/health`'s `email` check reads `RESEND_API_KEY` and reports
only on the Resend notification path.

The owner has explicitly deferred Resend until `karmadesignstudio.in` is linked
and verified. During testing, application/brief records are still stored in the
database; notification email is skipped when `RESEND_API_KEY` is absent.

After the custom domain is connected:
1. Verify the sending domain in Resend.
2. Create a Resend API key and store it in Cloudflare as the Worker secret
   `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to a verified sender, for example
   `Karma Design Studio <studio@karmadesignstudio.in>`.
4. Submit one test admission and one test design brief and confirm both the
   database record and notification email.
5. Confirm `/api/health` reports `checks.email: true`.

## 4. Cloudflare account (+ R2, DEFERRED)

```bash
npx wrangler login
```

**R2 is deliberately not activated.** The `r2_buckets` block in `wrangler.jsonc`
is commented out, and the B2B brief form's file-upload field has been removed
until a binding exists — with no binding an attached file would fail in
production and be dropped in demo mode. Do not create the bucket as part of
another task. When the owner asks for private file delivery:

```bash
npx wrangler r2 bucket create karma-brief-files
```

then uncomment the `r2_buckets` block and restore the upload field. The bucket
stays private; files are only written by the brief API and read through authed
admin routes.

## 5. Cloudflare configuration

### 5a. Build variables (Workers & Pages → karma-design-studio → Settings →
Variables → **Build**)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_SITE_URL`. These are inlined into the bundle at BUILD time, so a
runtime secret is not a substitute. `NEXT_PUBLIC_SITE_URL`, `STUDIO_EMAIL` and
`STUDIO_WHATSAPP` also live in `wrangler.jsonc` → `vars`.

### 5b. Runtime secrets
```bash
npx wrangler secret put SUPABASE_SECRET_KEY   # privileged; never a build var
npx wrangler secret put TURNSTILE_SECRET_KEY  # active production secret
npx wrangler secret put CRON_SECRET           # any long random string
# npx wrangler secret put RESEND_API_KEY      # after custom-domain verification
# npx wrangler secret put DATABASE_URL        # ONLY until Hyperdrive is bound
```

### 5c. Hyperdrive (the Worker's route to Postgres)
```bash
npx wrangler hyperdrive create karma-supabase \
  --connection-string="postgresql://USER:PASSWORD@HOST:5432/postgres"
```
Paste the returned id into `wrangler.jsonc` → `hyperdrive[0].id` and uncomment
the block. The id is a configuration identifier, not a credential: the database
password lives inside Hyperdrive, never in git. Redeploy, confirm
`/api/health` reports `dbViaHyperdrive: true`, then delete the temporary
`DATABASE_URL` secret.

**Connect Hyperdrive with the role that OWNS the tables** (the `postgres` role
in Supabase's connection string — the same one that ran the migrations).
Migration 0002 enables RLS with no policies on every app table so the
publishable key cannot read data through the Supabase Data API; a non-owning
role would be denied by that. Never work around it with a permissive policy.

## 6. Deploy
GitHub is connected to Cloudflare, so pushing to `main` builds and deploys
automatically; pull requests get a preview build at

```
https://<branch-or-commit>-karma-design-studio.essanciaonline.workers.dev
```

Cloudflare runs:

```
build:    npx @opennextjs/cloudflare build
deploy:   OPEN_NEXT_DEPLOY=true npx wrangler deploy --keep-vars   (production branch: main)
preview:  npx wrangler versions upload --keep-vars                (non-production branches)
```

**Do not "simplify" the deploy command back to
`npx @opennextjs/cloudflare deploy`.** OpenNext's delegated deploy path
attempted local Hyperdrive proxy delegation during the production deploy, which
fails in the Cloudflare build environment. Setting `OPEN_NEXT_DEPLOY=true` and
invoking `wrangler deploy` directly was the fix; `--keep-vars` preserves
dashboard-set variables that are not in `wrangler.jsonc`. The
`preview`/`deploy`/`upload` scripts still in `package.json` use OpenNext's
delegated path and are for local experimentation only.

To check the bundle locally without deploying:
```bash
npx wrangler deploy --dry-run    # ~1.7 MB gzip today; 3 MB free limit
```

**Custom domain: NOT YET.** `karmadesignstudio.in` is connected only when the
owner says the complete website is ready. When that day comes: Cloudflare
dashboard → Workers & Pages → karma-design-studio → Settings → Domains &
Routes → add the domain (its DNS must be on Cloudflare), then update
`NEXT_PUBLIC_SITE_URL` in `.env`, `wrangler.jsonc` and Cloudflare's build
variables, add the new callback URL to Supabase Auth, add the new hostname to
Turnstile, configure Resend, and redeploy.

## 6.5 Production behavior checks
- Do NOT set `ALLOW_DEMO_MODE` on production; it exists for staging only.
- Open `/api/health`: during the testing phase it should return 200 when the
  required request-path dependencies are ready: database, Supabase Auth and
  Turnstile. `dbViaHyperdrive` and `email` remain visible operational checks but
  do not gate `ok`. `checks.email: false` is expected until the custom domain
  is linked and Resend is intentionally activated.
- After Resend is activated at launch, `checks.email` should also be true even
  though the endpoint keeps reporting it separately.
- Cloudflare dashboard → Security → WAF → Rate limiting rules: add one rule
  on path starts-with `/api/` (e.g. 20 requests / 1 minute per IP, block).
  This is the real per-IP wall; the in-app limiter is best-effort only.
  Consider a second rule on `/admin/` once the console is in daily use.

## 7. After first deploy
- GitHub repo → Settings → Secrets and variables → Actions:
  - Secrets: `DATABASE_URL` (the DIRECT Supabase connection — Actions run
    outside Cloudflare and cannot use Hyperdrive), `CRON_SECRET`
  - Variable: `SITE_URL` =
    `https://karma-design-studio.essanciaonline.workers.dev`
  This powers the weekly backup and the 21:00 IST daily digest workflows.
  The backup artifacts contain PII: treat downloads accordingly.
- UptimeRobot (free): monitor `/api/health` every 5 min. Alerts if the site is
  down; also keeps the Supabase project warm.
- Google Search Console: add the domain, submit `/sitemap.xml`.
- Test on a real phone: `/gu` end to end, admission form incl. the WhatsApp
  handoff, and one B2B brief. (The brief's file-upload field is removed until
  R2 is activated — see step 4.)

## 8. Karma Console accounts
Once the deploy is green, work through `docs/admin-architecture.md` §17 steps
17-20: set `INITIAL_OWNER_EMAIL`, run `npm run admin:bootstrap`, accept the
invitation, set a password, sign in, invite the first admin. There is **no
authenticator to enrol** — Karma Console is password-only. There is no other
way to create an Owner and no public sign-up.

## Redeploying later
Any change → `npm run build` and `npm test` locally to verify → push. Cloudflare
builds from Git; CI runs typecheck/lint/test/build on every push as a safety
net. Do not deploy by hand.
