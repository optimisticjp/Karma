# Karma Design Studio — website & platform

Bilingual (English + ગુજરાતી) site for an embroidery academy and design lab in
Surat: live-machine courses, a 4-step admission flow with WhatsApp handoff, a
B2B design-brief pipeline with private file storage, and the foundations
(schema, docs, prompts) for attendance, certificates and an admin panel.

Built with Next.js 15, Tailwind v4, next-intl, Drizzle + Neon Postgres, and
deployed to Cloudflare Workers via OpenNext. Everything runs on free tiers.

## Quickstart (Codespaces or local, Node 22)
```bash
npm install
cp .env.example .env        # fill in as you go; everything degrades gracefully
npm run dev                 # http://localhost:3000 -> /en or /gu
```
Without a database the site runs in sample-data mode (batch lists are tagged
as samples, form submissions return demo references). To go live:

```bash
# 1. Create a free project at https://neon.tech, copy the connection string
#    into .env as DATABASE_URL
npm run db:migrate          # creates all 17 tables
npm run db:seed             # verified course catalog + starter batches
npm run dev                 # batches now come from Neon
```

## Deploy
Full walkthrough in **docs/deployment.md** (Neon → Turnstile → Resend →
R2 bucket → `npm run deploy` → custom domain). CI, weekly DB backups and the
daily digest email run from `.github/workflows/`.

## Production readiness, in one glance
In production the site **fails closed**: without `DATABASE_URL`,
`TURNSTILE_SECRET_KEY` or (for file uploads) the R2 binding, the APIs return
503 and the UI routes people to WhatsApp instead of pretending. `/api/health`
returns 503 until everything is configured: point your uptime monitor at it.
Sample data and demo form responses exist only in dev (`ALLOW_DEMO_MODE=true`
enables them on a staging deploy, never production). Run `npm test` (16
tests, includes full EN/GU catalog parity) before committing: CI enforces it.

## Read next
- `CLAUDE.md` — rules for every Claude Code session (start here)
- `docs/karma-master-plan-final.md` — the full strategy this implements
- `docs/phase-prompts.md` — paste-ready prompts for phases 2-5
- `docs/content-checklist.md` — the 16 owner questions + photo shoot list
  that block launch (code is not the bottleneck; answers and photos are)

## Scripts
| `npm run …` | Does |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev / production build / serve |
| `typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `db:generate` / `db:migrate` / `db:seed` / `db:backup` / `db:studio` | Drizzle + Neon |
| `preview` / `deploy` | OpenNext build + Cloudflare preview / deploy |
| `cf-typegen` | Generate Cloudflare env types |
