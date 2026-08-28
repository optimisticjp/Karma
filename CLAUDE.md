# CLAUDE.md — Karma Design Studio

Read this before touching anything. It is the contract for every Claude Code
session on this repo.

## What this is
Bilingual (EN + Gujarati) website and student-management platform for Karma
Design Studio & Classes, an embroidery training institute + B2B design lab in
Mota Varachha, Surat. The full strategy lives in
`docs/karma-master-plan-final.md`; the decision log at its top is binding.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind v4; design system v2 "The Digital Thread" (tokens in `src/app/globals.css`, spec in `docs/design-system.md`)
- next-intl v4: locales `en` + `gu`, always-prefixed URLs, NO browser-language auto-redirect
- **Supabase Postgres** via Drizzle + `drizzle-orm/node-postgres` (`pg`). The
  deployed Worker reaches it through the Cloudflare **HYPERDRIVE** binding;
  migrations, seeds, backups and the owner bootstrap use a direct
  `DATABASE_URL`. NOT Neon — the dependency is gone, do not reintroduce it.
- **Supabase Auth** (`@supabase/supabase-js` + `@supabase/ssr`) for staff
  sign-in, with mandatory TOTP MFA. NOT Better Auth — do not introduce it.
- Cloudflare Workers via `@opennextjs/cloudflare`; R2 bucket `BRIEF_FILES` for confidential B2B files
- Resend (email), Cloudflare Turnstile (spam), GitHub Actions (CI, weekly backup, daily digest)

## Commands
| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Typecheck / lint / test | `npm run typecheck` / `npm run lint` / `npm test` |
| Prod build (verify before commit) | `npm run build` |
| DB migrate / seed / backup | `npm run db:migrate` / `db:seed` / `db:backup` |
| New migration after schema edits | `npm run db:generate` |
| Create the single Owner account | `npm run admin:bootstrap` (`-- --dry-run` first) |
| Deploy to Cloudflare | `npm run deploy` (see `docs/deployment.md`) |

## Non-negotiables
1. **Bilingual parity.** Every user-facing string exists in BOTH
   `messages/en.json` and `messages/gu.json` with mirrored keys. Gujarati is a
   first-class language, not a translation chore: natural Surti Gujlish tone,
   English trade terms (emCAD, machine names) stay in English. Never
   uppercase or letterspace Gujarati text.
2. **No ghost content, no unverified numbers.** Never invent trainer names,
   testimonials, stories, ratings or stats. Unverified content carries
   `sample: true` + `<SampleTag />`; numeric public claims live behind
   `verifiedFacts` in src/lib/site.ts and stay OFF until the owner confirms
   in writing (content-checklist Q9). Photography uses `<PhotoSlot />` with
   a shoot-list label, never stock.
3. **No payment gateway.** Ever. Fees are discussed in person or on WhatsApp.
   Do not add payment links, UPI codes or price lists.
4. **Form defence stays layered AND fail-closed.** Every public POST keeps:
   honeypot checked BEFORE validation (quiet fake success), minimum-time
   check, Turnstile server verification, per-IP + per-phone throttles. In
   production, missing dependencies return typed 503s (never silent demo
   behavior): see src/lib/env.ts. ALLOW_DEMO_MODE is staging-only.
5. **Never `export const runtime = "edge"`.** OpenNext handles the runtime;
   edge runtime breaks the Cloudflare adapter.
6. **Design tokens are law.** Colors, fonts and the type scale live in
   `globals.css` `@theme`; the spec is `docs/design-system.md`. ONE accent:
   vermilion for fills, stitch lines and large text; vermilion-deep for any
   small-text link (AA). Green/amber/red are status-only. No second accent,
   no sizes outside the scale, borders over shadows.
7. **Audit sensitive mutations.** Status changes, attendance edits/locks,
   certificate issue/revoke, fee records, and every team/account change: each
   write also inserts into `audit_logs` (actor, action, entity, old/new
   values, reason). NEVER audit a password, TOTP secret, access/refresh token,
   the Supabase secret key, a database credential, or a raw invitation link.
8. **Authorization is app-layer, and centralized.** Supabase Auth proves
   IDENTITY; the Karma `staff` row decides AUTHORIZATION. Every admin page and
   server action goes through `src/lib/auth/guard.ts`
   (`requireAdmin` / `requireOwner` / `requirePermission` / `authorizeAction`),
   which checks all seven of: verified user → linked staff record → `active` →
   console role → lifecycle `status === "active"` → **AAL2** → permission.
   `staff.status` is load-bearing, not informational: an `invited` row is
   `active: true` because it holds a seat, and must reach ONLY `/admin/welcome`
   (guard: `requireInvitedConsoleUser`), never console data, even at AAL2.
   Never re-implement a role check inline, never trust `user_metadata`, never
   treat middleware or a hidden nav link as a control. App tables additionally
   have RLS on with no policies and
   no grants for `anon`/`authenticated`, so the publishable key cannot read
   data through the Supabase Data API — do NOT add a permissive policy to
   "make something work", and do NOT start using Supabase `.from()`: Drizzle
   over the trusted server connection is the one data access layer.
9. **R2 stays private.** No public buckets, no unauthenticated file URLs.
   Brief files, certificates and encrypted backups all live in R2 and download
   only through authed admin routes. Never Supabase Storage.
10. **One Owner, five Admins.** Exactly one active `owner` (the only superuser,
   holds every permission implicitly) plus at most five enabled `admin`
   accounts; a pending invitation holds a seat, deactivating frees it. Team
   administration is Owner-only and has NO permission key — never add one. The
   invariants are enforced by the `karma_staff_invariants` trigger (INSERT,
   UPDATE *and* DELETE — the owner row cannot even be deleted) as well as the
   app; keep both. Accounts are deactivated, never deleted. Deactivation means
   `active=false` + `status='deactivated'` in Karma, plus a best-effort Supabase
   `ban_duration`; it is NOT a session revocation, so never describe it as one
   (`auth.admin.signOut()` needs a JWT, not a user id — do not call it with an
   id). Reactivation restores lifecycle from `accepted_at`, never from
   `status`.
11. **Watch the worker size.** Free plan limit is 3 MB gzipped. After adding
    dependencies run `npx wrangler deploy --dry-run` and check the gzip
    number. No charting libraries, no admin component kits, no duplicate
    database drivers.
12. **⚠ CONFIRM-WITH-OWNER markers** (in `src/lib/site.ts`, content files and
    docs) are resolved only by real owner answers via
    `docs/content-checklist.md`. Never resolve them by guessing.
13. **Locale routing stays.** `/en/...` and `/gu/...` always; hreflang
    alternates via `pageMeta()` in `src/lib/seo.ts` on every new page. The
    console at `/admin` is exempt and must stay exempt in middleware.

14. **Tests guard the contracts.** `npm test` (vitest) must pass before any
    commit; the i18n parity test enforces rule #1 mechanically, for console
    copy as well as public copy. New validation logic, security helpers,
    permission keys and message keys need tests. Keep the security-critical
    decisions PURE (`auth/access.ts`, `auth/seats.ts`, `auth/redirect.ts`,
    `admin/invite.ts`) so they can be tested without a live Supabase project.

15. **Vertical rhythm is a system, not a judgment call.** Use `.u-lede`,
    `.u-eyebrow-gap`, `.u-actions`, `.u-section-body` for text relationships.
    Do NOT reintroduce ad-hoc `mt-3`/`mt-5`/`mt-6` for heading→paragraph gaps.
    Use all three section tiers: `section-major` for the page's few real
    moments, `section` as default, `section-compact` only for minor blocks.
    Cards are `p-6 md:p-8`; grids are `gap-6 lg:gap-8`. Spec:
    `docs/design-system.md`.

## Where things live
- Public pages: `src/app/[locale]/…` (catch-all 404 at `[...rest]`)
- Karma Console: `src/app/admin/…` — deliberately OUTSIDE `[locale]`; staff
  type `/admin`, never `/en/admin`. Console copy lives under the `admin`
  namespace in `messages/{en,gu}.json`. Admin pages are `force-dynamic`: never
  let an authenticated page be statically generated.
- API: `src/app/api/{admission,brief,cron/digest,health}/route.ts`
- Copy: `messages/{en,gu}.json` · Structured content: `src/content/*.ts`
- DB: `src/lib/db/{schema,index,queries}.ts` · migrations in `drizzle/`
- Components: `src/components/{ui,site,home,course,forms,work}/`
- Auth + admin: `src/lib/{auth,supabase,admin}/…`
- Ops docs: `docs/` — **`docs/admin-architecture.md` is the canonical admin
  reference**; also deployment, operations, security, content checklist,
  phase prompts

## Roadmap
Phase 1 is the public site + forms. Phase 2 (this change) is the platform
foundation: Supabase Postgres via Hyperdrive, Supabase Auth with mandatory MFA,
the Owner/Admin permission model, and the Karma Console shell with Today, Team
and Account. Phases 3-6 (Admissions CRM, Student 360 + attendance, certificates
+ Design Desk, content/fees/reports + polish) have prompts in
`docs/phase-prompts.md`. Work them in order; each builds on the schema and the
guard already shipped here.
