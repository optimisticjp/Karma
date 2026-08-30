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
> **Three sections below are DEFERRED, not pending.** Steps 2 (Turnstile) and 4
> (R2) describe how to activate infrastructure the owner has deliberately not
> activated yet, and the custom domain in step 6 is the same. Do not work
> through them as part of an unrelated task: `/api/health` reporting Turnstile
> or R2 absent is the expected state today. See `docs/project-context.md` §40.

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

## 2. Turnstile (spam protection) — DEFERRED

**Do not do this as part of another task.** Turnstile is deliberately not
configured; both keys are empty and the verification path already fails closed
in production. Activate it only when the owner asks, or when form abuse actually
appears. The steps, for that day:

1. Cloudflare dashboard → Turnstile → Add site (domain: your site, plus
   `localhost` for dev if you want).
2. Put the **site key** in `.env` as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   (build-time: it gets inlined into the client bundle).
3. Keep the **secret key** handy for step 5.

## 3. Resend (email notifications)

Karma has **two independent email paths**, and they are easy to confuse:
*notification* mail (a new application, a new brief, the daily digest) goes
through **Resend**, configured here; *auth and invitation* mail goes through
**Supabase Auth with custom SMTP**, configured in the Supabase dashboard
(step 1). `/api/health`'s `email` check reads `RESEND_API_KEY` — it reports on
the notification path only and says nothing about Supabase SMTP.

1. https://resend.com → API key → `.env` `RESEND_API_KEY`.
2. Until you verify a domain, keep `EMAIL_FROM` as
   `Karma Design Studio <onboarding@resend.dev>`. After DNS verification of
   karmadesignstudio.in, switch to e.g. `studio@karmadesignstudio.in`.
3. Free tier: 100 emails/day. The site sends one per application/brief plus
   one daily digest, so this is comfortable.

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
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY  # later; owner is configuring it
npx wrangler secret put CRON_SECRET           # any long random string
npx wrangler secret put DATABASE_URL          # ONLY until Hyperdrive is bound
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
variables, add the new callback URL to Supabase Auth, and redeploy.

## 6.5 Production behavior checks (new)
- Do NOT set `ALLOW_DEMO_MODE` on production; it exists for staging only.
- Open `/api/health`: it must return 200 with all checks true. A 503 means a
  dependency is missing and forms will refuse submissions rather than silently
  dropping them. `dbViaHyperdrive` is reported truthfully but does not gate
  `ok`, so you can see a deploy still running on the direct-URL fallback.
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
