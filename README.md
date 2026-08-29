# Karma Design Studio — website & platform

Bilingual (English + ગુજરાતી) site for an embroidery academy and design lab in
Surat: live-machine courses, a 4-step admission flow with WhatsApp handoff, a
B2B design-brief pipeline with private file storage — plus **Karma Console**,
the staff operations desk at `/admin` (invitation-only accounts, mandatory
TOTP, one Owner and up to five Admins with explicit permissions).

Built with Next.js 15, Tailwind v4, next-intl, and Drizzle over **Supabase
Postgres** (through Cloudflare Hyperdrive in production), with **Supabase Auth**
for staff sign-in, deployed to Cloudflare Workers via OpenNext. Everything runs
on free tiers.

## Quickstart (Codespaces or local, Node 22)
```bash
npm install
cp .env.example .env        # fill in as you go; everything degrades gracefully
npm run dev                 # http://localhost:3000 -> /en or /gu
```
Without a database the site runs in sample-data mode (batch lists are tagged
as samples, form submissions return demo references). To go live:

```bash
# 1. Create a project at https://supabase.com, copy the DIRECT connection
#    string into .env as DATABASE_URL (see docs/admin-architecture.md §17)
npm run db:migrate          # creates all 18 tables + account invariants
npm run db:seed             # verified course catalog + starter batches
npm run dev                 # batches now come from Supabase
```

### Karma Console (`/admin`)
Staff sign-in is invitation-only and there is no public sign-up. Create the
single Owner account once, then invite admins from the console:

```bash
npm run admin:bootstrap -- --dry-run   # checks; changes nothing
npm run admin:bootstrap                # invites and links the Owner
```
Every console session requires a TOTP code. Full setup — Supabase Auth
settings, Cloudflare build variables, the Hyperdrive binding — is in
**docs/admin-architecture.md**.

## Deploy
Full walkthrough in **docs/deployment.md** (Supabase → Hyperdrive → Resend →
R2 bucket → Cloudflare build). CI, weekly DB backups and the daily digest email
run from `.github/workflows/`. The custom domain is a launch step and is not
connected yet; the live URL is
`https://karma-design-studio.essanciaonline.workers.dev`.

## Production readiness, in one glance
In production the site **fails closed**: without a database, Supabase Auth,
`TURNSTILE_SECRET_KEY` or (for file uploads) the R2 binding, the APIs return
503 and the UI routes people to WhatsApp instead of pretending. `/api/health`
returns 503 until everything is configured: point your uptime monitor at it.
Sample data and demo form responses exist only in dev (`ALLOW_DEMO_MODE=true`
enables them on a staging deploy, never production). The console shows an
honest "not configured" state rather than a plausible zero. Run `npm test`
(86 tests: EN/GU catalog parity, permissions, account invariants, the auth
guard's six states, invitation validation and audit) before committing: CI
enforces it.

## Read next
- `CLAUDE.md` — rules for every Claude Code session (start here)
- `docs/admin-architecture.md` — the canonical Karma Console reference:
  architecture, roles, permissions, MFA, invariants, and the manual setup
  checklist the owner still has to work through
- `docs/karma-master-plan-final.md` — the full strategy this implements
- `docs/phase-prompts.md` — paste-ready prompts for phases 2-5
- `docs/content-checklist.md` — the 16 owner questions + photo shoot list
  that block launch (code is not the bottleneck; answers and photos are)

## Scripts
| `npm run …` | Does |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev / production build / serve |
| `typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `db:generate` / `db:migrate` / `db:seed` / `db:backup` / `db:studio` | Drizzle + Supabase Postgres |
| `admin:bootstrap` | Create the single Owner account (invitation-only) |
| `preview` / `deploy` | OpenNext build + Cloudflare preview / deploy |
| `cf-typegen` | Generate Cloudflare env types |
