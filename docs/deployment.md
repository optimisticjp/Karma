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
7. Configure Supabase Auth (email+password on, public sign-ups OFF, TOTP MFA
   on, Site URL and redirect URLs) — the exact settings are in
   `docs/admin-architecture.md` §17.
8. **Authentication → Emails → Templates → "Invite user": replace the body with
   the token-hash template in `docs/admin-architecture.md` §9.** This is not
   optional. The stock template returns the session in a URL fragment, which a
   server-side application can never read, so every invitation would dead-end
   on "this invitation link is no longer valid". Send one test invitation to
   yourself after changing it.

Free-tier note: a Supabase free project pauses after a period of inactivity.
The weekly backup workflow and the uptime monitor (step 7) keep it warm.
Re-check the current pause policy before launch — provider limits change.

## 2. Turnstile (spam protection)
1. Cloudflare dashboard → Turnstile → Add site (domain: your site, plus
   `localhost` for dev if you want).
2. Put the **site key** in `.env` as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   (build-time: it gets inlined into the client bundle).
3. Keep the **secret key** handy for step 5.

## 3. Resend (email notifications)
1. https://resend.com → API key → `.env` `RESEND_API_KEY`.
2. Until you verify a domain, keep `EMAIL_FROM` as
   `Karma Design Studio <onboarding@resend.dev>`. After DNS verification of
   karmadesignstudio.in, switch to e.g. `studio@karmadesignstudio.in`.
3. Free tier: 100 emails/day. The site sends one per application/brief plus
   one daily digest, so this is comfortable.

## 4. Cloudflare account + R2
```bash
npx wrangler login
npx wrangler r2 bucket create karma-brief-files
```
Then in `wrangler.jsonc`, uncomment the `r2_buckets` block. The bucket stays
private; files are only written by the brief API and read (Phase 2+) through
authed admin routes.

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
automatically; pull requests get a preview build. Cloudflare runs:

```
build:   npx @opennextjs/cloudflare build
deploy:  npx @opennextjs/cloudflare deploy     (production branch: main)
preview: npx @opennextjs/cloudflare upload     (non-production branches)
```

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
  handoff, and one brief with a file (check it lands in R2).

## 8. Karma Console accounts
Once the deploy is green, work through `docs/admin-architecture.md` §17 steps
17-20: set `INITIAL_OWNER_EMAIL`, run `npm run admin:bootstrap`, accept the
invitation, set a password, enrol an authenticator, sign in, invite the first
admin. There is no other way to create an Owner and no public sign-up.

## Redeploying later
Any change → `npm run build` and `npm test` locally to verify → push. Cloudflare
builds from Git; CI runs typecheck/lint/test/build on every push as a safety
net. Do not deploy by hand.
