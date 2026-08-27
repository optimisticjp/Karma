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
- Neon Postgres via Drizzle (`src/lib/db/schema.ts`), `@neondatabase/serverless` HTTP driver
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
   certificate issue/revoke, fee records: each write also inserts into
   `audit_logs` (actor, action, entity, old/new values, reason).
8. **Authorization is app-layer.** Neon has no RLS here. Every admin server
   action / route (Phase 2+) verifies the Better Auth session AND role before
   touching the DB. Client-side checks are decoration, not security.
9. **R2 stays private.** No public buckets, no unauthenticated file URLs.
   Brief files download only through authed admin routes.
10. **Watch the worker size.** Free plan limit is 3 MB gzipped; the scaffold
    ships at ~1.2 MB. After adding dependencies run
    `npx wrangler deploy --dry-run` and check the gzip number.
11. **⚠ CONFIRM-WITH-OWNER markers** (in `src/lib/site.ts`, content files and
    docs) are resolved only by real owner answers via
    `docs/content-checklist.md`. Never resolve them by guessing.
12. **Locale routing stays.** `/en/...` and `/gu/...` always; hreflang
    alternates via `pageMeta()` in `src/lib/seo.ts` on every new page.

13. **Tests guard the contracts.** `npm test` (vitest) must pass before any
    commit; the i18n parity test enforces rule #1 mechanically. New
    validation logic, security helpers, and message keys need tests.

14. **Vertical rhythm is a system, not a judgment call.** Use `.u-lede`,
    `.u-eyebrow-gap`, `.u-actions`, `.u-section-body` for text relationships.
    Do NOT reintroduce ad-hoc `mt-3`/`mt-5`/`mt-6` for heading→paragraph gaps.
    Use all three section tiers: `section-major` for the page's few real
    moments, `section` as default, `section-compact` only for minor blocks.
    Cards are `p-6 md:p-8`; grids are `gap-6 lg:gap-8`. Spec:
    `docs/design-system.md`.

## Where things live
- Pages: `src/app/[locale]/…` (catch-all 404 at `[...rest]`)
- API: `src/app/api/{admission,brief,cron/digest,health}/route.ts`
- Copy: `messages/{en,gu}.json` · Structured content: `src/content/*.ts`
- DB: `src/lib/db/{schema,index,queries}.ts` · migrations in `drizzle/`
- Components: `src/components/{ui,site,home,course,forms,work}/`
- Ops docs: `docs/` (deployment, operations, security, content checklist, phase prompts)

## Roadmap
Phase 1 (this scaffold) is the public site + forms. Phases 2-5 (admin + Better
Auth, attendance, certificates + brief pipeline, polish) have paste-ready
prompts in `docs/phase-prompts.md`. Work them in order; each builds on the
schema already shipped here.
