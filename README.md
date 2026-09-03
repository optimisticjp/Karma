# Karma Design Studio — website & platform

Bilingual (English + ગુજરાતી) site for an embroidery academy and design lab in
Surat: live-machine courses, a 4-step admission flow with WhatsApp handoff, a
B2B design-brief pipeline — plus **Karma Console**, the staff operations desk
at `/admin` (invitation-only accounts, **password-only** sign-in, one Owner and
up to five Admins with explicit permissions).

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
npm run db:migrate          # creates all 19 tables + account invariants
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
Sign-in is **password-only**: there is no MFA/TOTP step, by explicit owner
decision. Full setup — Supabase Auth settings, Cloudflare build variables, the
Hyperdrive binding — is in **docs/admin-architecture.md**.

## Deploy
Full walkthrough in **docs/deployment.md** (Supabase → Hyperdrive → Turnstile →
Resend → Cloudflare build). CI, weekly DB backups and the digest email workflow
live in `.github/workflows/`. Turnstile is active on the current Workers.dev
review hostname. Resend scheduling and private R2 storage are deliberately
deferred, and the custom domain is a launch step that is **not** connected yet;
the live review URL is
`https://karma-design-studio.essanciaonline.workers.dev`.

## Production readiness, in one glance
In production the site **fails closed**: if the database, Supabase Auth or
Turnstile request path is unavailable, `/api/health` returns 503 and public form
APIs do not fall back to demo data. Deferred Resend does not make the current
Workers.dev deployment unhealthy; email readiness stays visible separately in
the health payload. Sample data and demo form responses exist only in dev
(`ALLOW_DEMO_MODE=true` enables them on a staging deploy, never production).
The console shows an honest "not configured" state rather than a plausible
zero.

Run the full local gate before committing:

```bash
npm run typecheck && npm run lint && npm test && npm run audit:prod && npm run build
```

The test suite is intentionally broad and grows with the product, so this file
does not pin a test-count number that will immediately go stale. CI enforces the
same core checks and separately boots the actual OpenNext/Cloudflare Worker
against migrated PostgreSQL.

## Read next
- `CLAUDE.md` — rules for every Claude Code session (start here)
- `docs/project-context.md` — **the durable project memory**: architecture,
  every major decision and its reasoning, what is deliberately deferred, which
  facts are verified and which are not. Read it before significant work.
- `docs/admin-architecture.md` — the canonical Karma Console reference:
  architecture, roles, permissions, invariants, and the manual setup
  checklist the owner still has to work through
- `docs/karma-master-plan-final.md` — the full strategy this implements
- `docs/phase-prompts.md` — paste-ready prompts for phases 2-5
- `docs/content-checklist.md` — the owner-only facts/media/approval handoff that
  blocks launch where code cannot manufacture the answer

## Scripts
| `npm run …` | Does |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev / production build / serve |
| `typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `test` / `audit:prod` | Vitest suite / high-severity production dependency audit |
| `db:generate` / `db:migrate` / `db:seed` / `db:backup` / `db:studio` | Drizzle + Supabase Postgres |
| `admin:bootstrap` | Create the single Owner account (invitation-only) |
| `preview` / `deploy` / `upload` | OpenNext's delegated path — **local experimentation only.** Production deploys from Git with `OPEN_NEXT_DEPLOY=true npx wrangler deploy --keep-vars`; see docs/deployment.md §6 |
| `cf-typegen` | Generate Cloudflare env types |
