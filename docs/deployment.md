# Deployment guide — Codespaces → Neon → Cloudflare

Follow top to bottom. Every step is free-tier. Commands run in the repo root.

## 0. GitHub + Codespaces
1. Create a GitHub repo, push this project, open a Codespace.
   `.devcontainer/` gives you Node 22 and auto-runs `npm install`.
2. `cp .env.example .env`

## 1. Neon (database)
1. https://neon.tech → New project (region: closest to India, e.g. Singapore).
2. Copy the **pooled** connection string into `.env` as `DATABASE_URL`.
3. `npm run db:migrate` → creates all tables from `drizzle/`.
4. `npm run db:seed` → verified courses + starter batches.
5. `npm run dev` → batch tables now show live data (no sample tag).

Free-tier note: Neon autosuspends after inactivity; the first request after a
quiet period takes a moment. The weekly backup workflow and UptimeRobot (step
7) keep it reasonably warm.

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

## 5. Secrets on Cloudflare (runtime)
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CRON_SECRET        # any long random string
```
Non-secret vars (`NEXT_PUBLIC_SITE_URL`, `STUDIO_EMAIL`, `STUDIO_WHATSAPP`)
already live in `wrangler.jsonc` → `vars`. Note: `NEXT_PUBLIC_*` values are
ALSO read from `.env` at build time, so keep `.env` filled when deploying.

## 6. Deploy
```bash
npm run deploy
```
This runs the OpenNext build and uploads (~1.2 MB gzipped, limit is 3 MB on
free). You get a `*.workers.dev` URL immediately.

**Custom domain:** Cloudflare dashboard → Workers & Pages →
karma-design-studio → Settings → Domains & Routes → add
`karmadesignstudio.in` (the domain's DNS must be on Cloudflare). Then update
`NEXT_PUBLIC_SITE_URL` in both `.env` and `wrangler.jsonc`, and redeploy.

## 6.5 Production behavior checks (new)
- Do NOT set `ALLOW_DEMO_MODE` on production; it exists for staging only.
- Open `https://<your-domain>/api/health`: it must return 200 with all
  checks true. A 503 means a secret is missing and forms will refuse
  submissions rather than silently dropping them.
- Cloudflare dashboard → Security → WAF → Rate limiting rules: add one rule
  on path starts-with `/api/` (e.g. 20 requests / 1 minute per IP, block).
  This is the real per-IP wall; the in-app limiter is best-effort only.

## 7. After first deploy
- GitHub repo → Settings → Secrets and variables → Actions:
  - Secrets: `DATABASE_URL`, `CRON_SECRET`
  - Variable: `SITE_URL` = https://karmadesignstudio.in
  This powers the weekly backup and the 21:00 IST daily digest workflows.
- UptimeRobot (free): monitor `https://karmadesignstudio.in/api/health`
  every 5 min. Alerts if the site is down; also nudges Neon awake.
- Google Search Console: add the domain, submit `/sitemap.xml`.
- Test on a real phone: `/gu` end to end, admission form incl. the WhatsApp
  handoff, and one brief with a file (check it lands in R2).

## Redeploying later
Any change → `npm run build` locally to verify → `npm run deploy`. CI runs
typecheck/lint/build on every push as a safety net.
