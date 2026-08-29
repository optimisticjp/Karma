# CLAUDE.md — Karma Design Studio

Read this before touching anything. It is the contract for every coding session on this repo.

## What this is
Bilingual (EN + Gujarati) website and student-management platform for Karma Design Studio & Classes, an embroidery training institute + B2B design lab in Mota Varachha, Surat. The full strategy lives in `docs/karma-master-plan-final.md`; later owner decisions and `docs/admin-architecture.md` override older auth/hosting assumptions in that plan.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind v4; design system v2 "The Digital Thread" (`src/app/globals.css`, `docs/design-system.md`).
- next-intl v4: `en` + `gu`, always-prefixed public URLs, no browser-language auto-redirect.
- **Supabase Postgres** via Drizzle + `drizzle-orm/node-postgres` (`pg`). The Worker reaches it through Cloudflare **HYPERDRIVE**; migrations/seeds/backups/bootstrap use direct `DATABASE_URL`. NOT Neon.
- **Supabase Auth** (`@supabase/supabase-js` + `@supabase/ssr`) for invite-only staff email/password sign-in. **Karma Console is password-only; MFA/TOTP is not an access requirement.** NOT Better Auth.
- Cloudflare Workers via `@opennextjs/cloudflare`. Private R2 bindings are added only when the file/PDF phase is activated; do not assume R2 exists today.
- Supabase custom SMTP for auth/invitation mail. Turnstile/R2/public-media work follows the deployment roadmap; do not invent dependencies that are not configured.

## Commands
| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Typecheck / lint / test | `npm run typecheck` / `npm run lint` / `npm test` |
| Prod build | `npm run build` |
| DB migrate / seed / backup | `npm run db:migrate` / `npm run db:seed` / `npm run db:backup` |
| New migration after schema edits | `npm run db:generate` |
| Create the single Owner account | `npm run admin:bootstrap` (`-- --dry-run` first) |

Cloudflare production deployment currently uses the dashboard command `OPEN_NEXT_DEPLOY=true npx wrangler deploy --keep-vars`; do not replace it with OpenNext's delegated deploy path while Hyperdrive is bound.

## Non-negotiables
1. **Bilingual parity.** Every user-facing catalog string exists in BOTH `messages/en.json` and `messages/gu.json` with mirrored keys. Gujarati is first-class: natural Surti Gujarati/Gujlish, while trade terms such as emCAD, machine, batch and WhatsApp stay familiar. Never uppercase or letterspace Gujarati.

2. **No ghost content, no unverified numbers.** Never invent trainer names, testimonials, stories, ratings or stats. Source placeholders remain visibly `sample: true` + `<SampleTag />`. Content Desk may publish proof only through its consent/owner-verification gates. Photography is real, consented studio work; never stock masquerading as Karma.

3. **No payment gateway.** Fees are discussed/recorded offline. Do not add checkout links, online payment flows, UPI payment requests or public price lists.

4. **Public form defence stays layered and fail-closed.** Honeypot before validation, minimum-time check, Turnstile server verification when activated, per-IP + per-phone throttles. In production a missing required dependency returns a typed failure, never demo data.

5. **Never `export const runtime = "edge"`.** OpenNext handles runtime selection.

6. **Design tokens are law.** Use the Digital Thread tokens/scale. Vermilion is the one interface accent; green/amber/red are status-only. Borders over decorative shadows. No admin component kit or chart library just for convenience.

7. **Audit sensitive mutations.** Status changes, admissions, enrollment, attendance edits/locks, certificates, fee records, design-job transitions, website publishing and every team/account mutation write `audit_logs` with actor/action/entity/old/new/reason where relevant. NEVER audit a password, access/refresh token, Supabase secret, database credential, SMTP credential, or raw invitation link.

8. **Authorization is application-layer and centralized.** Supabase Auth proves identity; the Karma `staff` row decides authorization. Every protected page/action goes through `src/lib/auth/guard.ts` (`requireAdmin`, `requireOwner`, `requirePermission`, `authorizeAction`). Ordinary console access requires: verified Supabase user → linked staff row → `active` → owner/admin role → lifecycle `status === "active"` → required permission. **No AAL2/MFA step is part of this chain.** An `invited` row consumes a seat but reaches only `/admin/welcome` until password setup/acceptance completes. Never inline a role check, trust `user_metadata`, or treat hidden navigation as security.

   App tables also have RLS enabled with no browser policies and no grants for `anon`/`authenticated`. The publishable key is for Supabase Auth, not application data. Do not add permissive policies or start using Supabase `.from()` for app tables: Drizzle over the trusted server connection is the one data layer.

9. **Private files stay private.** When R2 is activated, design briefs/certificates/backups use private buckets and authenticated routes. Never Supabase Storage for these files and never public confidential-file URLs. Public Content Desk images are a separate future public-media workflow; until configured they use same-origin deployed asset paths only.

10. **One Owner, five Admins.** Exactly one active owner plus at most five enabled/pending admins. Pending invite holds a seat; deactivation frees it. Team administration is Owner-only and has no permission key. Keep the `karma_staff_invariants` DB trigger. Accounts are deactivated, never deleted. A Supabase ban is best-effort sign-in blocking, not session revocation.

11. **Watch Worker size.** Free plan limit matters. After dependencies, run a Wrangler dry-run and check gzip size. Avoid duplicate DB drivers, charting libraries and admin UI suites.

12. **⚠ CONFIRM-WITH-OWNER markers stay unresolved until the owner supplies the fact.** Never infer an address, phone, trainer, duration, testimonial or public statistic from convenience.

13. **Locale routing stays.** Public URLs are `/en/...` and `/gu/...`; `/admin` deliberately stays outside the locale segment. Every new public page gets hreflang metadata through `pageMeta()`.

14. **Tests guard contracts.** `npm test` must pass. New validation/security/permission/content-publishing behavior gets pure tests where possible. i18n parity remains mechanical for message catalogs.

15. **Vertical rhythm is a system.** Use `.u-lede`, `.u-eyebrow-gap`, `.u-actions`, `.u-section-body`; section tiers and spacing from `docs/design-system.md`. Do not rebuild spacing ad hoc screen by screen.

## Karma Console product rules
- Staff language is institute language, not ERP language: enquiry, walk-in, follow-up, batch, fees, receipt, હાજરી, certificate, design job, WhatsApp.
- Website forms are never a prerequisite. Authorized staff can manually add enquiries, direct admissions/students, fee entries and design jobs for walk-ins, calls or WhatsApp.
- Navigation and Today at Karma are role/permission-aware. A hidden link is UX only; server guards remain authoritative.
- No hard-delete UI for operational records. Archive/deactivate/lifecycle transitions preserve history.
- Dates that mean “today” to staff are pinned to `Asia/Kolkata`.

## Where things live
- Public pages: `src/app/[locale]/…`
- Karma Console: `src/app/admin/…` (outside `[locale]`; authenticated pages are dynamic)
- API: `src/app/api/...`
- Message copy: `messages/{en,gu}.json`
- Structured/source fallback content: `src/content/*.ts`
- Staff-managed public content: `content_items` via `/admin/content`, with source fallbacks in `src/lib/content/public.ts`
- DB: `src/lib/db/{schema,content-schema,index,queries}.ts`; migrations in `drizzle/`
- Auth/admin: `src/lib/{auth,admin,supabase}/…`
- Canonical admin reference: `docs/admin-architecture.md`

## Current roadmap state
The public site, platform foundation, Admissions CRM, Courses/Batches, Student 360, Attendance, offline Fees, Certificates, Design Jobs and core reporting are built. The current completion work is Content Desk, role-aware console polish, exports/audit UX and remaining operational hardening. Turnstile, R2/private file delivery, public-media upload tooling and custom-domain migration are separate infrastructure steps and must not be silently activated by feature work.
