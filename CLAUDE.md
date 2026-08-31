# CLAUDE.md — Karma Design Studio

Read this before touching anything. It is the contract for every coding session on this repo.

## Start here, in this order

1. **This file.** All of it. It is short on purpose.
2. **[`docs/project-context.md`](docs/project-context.md)** — the durable project memory: what exists, why each architectural decision was made, what is deliberately deferred, which facts are verified and which are not. **Read it before any significant work.** It is the replacement for years of conversation you do not have. For a one-line copy fix, skim the two "do not undo" sections; for anything else, read it properly.
3. **The domain doc for what you are about to change** (table below).
4. **The actual code.**

| Working on | Read first |
| --- | --- |
| Visual work, tokens, spacing, motion | `docs/design-system.md` |
| Why the public site looks the way it does | `docs/screen-to-stitch-progress.md` |
| Any public claim, number, name, testimonial, photo | `docs/content-checklist.md` |
| Karma Console, auth, roles, permissions, schema | `docs/admin-architecture.md` |
| Cloudflare, Workers, OpenNext, Hyperdrive, env vars | `docs/deployment.md` |
| Auth internals, CSP, rate limits, DPDP, RLS | `docs/security.md` |
| Anything to do with going live | `docs/launch-checklist.md` |
| Course facts, fees, batch timings, the free demo, admission norms | `src/content/course-operations.ts`, `src/content/admission-terms.ts` |
| Day-to-day running, free-tier limits, backups | `docs/operations.md` |
| Open owner questions | `docs/owner-decisions.md`, `docs/content-checklist.md` |
| The installed `.claude/skills/` library | `docs/claude-skills.md` |

**When a document and the code disagree, the code is right.** Documents go stale; `main` does not. Verify against the code before you act on a doc, and when you find the drift, fix the doc in the same PR — do not leave a known-false line behind for the next session to trip over.

## What this is
Bilingual (EN + Gujarati) website and student-management platform for Karma Design Studio & Classes, an embroidery training institute + B2B design lab in Mota Varachha, Surat. Public brand thesis: **"From Screen to Stitch — design on screen, prove it on the machine."** The full strategy lives in `docs/karma-master-plan-final.md`; later owner decisions, `docs/admin-architecture.md` and `docs/project-context.md` override older auth/hosting assumptions in that plan.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4; design system v3 "Screen to Stitch / The Machine Floor" (`src/app/globals.css`, `src/app/premium.css`, `docs/design-system.md`).
- next-intl v4: `en` + `gu` on the public site and in the Console, always-prefixed public URLs, no browser-language auto-redirect.
- **Supabase Postgres** via Drizzle + `drizzle-orm/node-postgres` (`pg`). The Worker reaches it through Cloudflare **HYPERDRIVE**; migrations/seeds/backups/bootstrap use direct `DATABASE_URL`. NOT Neon.
- **Supabase Auth** (`@supabase/supabase-js` + `@supabase/ssr`) for invite-only staff email/password sign-in. **Karma Console is password-only; MFA/TOTP is not an access requirement.** NOT Better Auth.
- Cloudflare Workers via `@opennextjs/cloudflare`. Private R2 bindings are added only when the file/PDF phase is activated; do not assume R2 exists today.
- Supabase custom SMTP for auth/invitation mail; Resend for application/brief/digest notification mail. Turnstile/R2/public-media work follows the deployment roadmap; do not invent dependencies that are not configured.

## Commands
| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Typecheck / lint / test | `npm run typecheck` / `npm run lint` / `npm test` |
| Prod build | `npm run build` |
| DB migrate / seed / backup | `npm run db:migrate` / `npm run db:seed` / `npm run db:backup` |
| New migration after schema edits | `npm run db:generate` |
| Create the single Owner account | `npm run admin:bootstrap` (`-- --dry-run` first) |
| Re-sync the skill library | `./scripts/sync-claude-skills.sh` |

Cloudflare production deployment currently uses the dashboard command `OPEN_NEXT_DEPLOY=true npx wrangler deploy --keep-vars`; do not replace it with OpenNext's delegated deploy path while Hyperdrive is bound. Preview/version uploads use `npx wrangler versions upload --keep-vars`.

## Non-negotiables
1. **Bilingual parity, everywhere.** The public site and Karma Console are both **EN + GU**: every user-facing catalog string exists in `messages/en.json` and `messages/gu.json` with mirrored keys. Gujarati is first-class — natural Surti Gujarati/Gujlish — while trade terms such as EMCAD, machine, batch and WhatsApp stay familiar. Never uppercase or letterspace Gujarati, and never squeeze it into Latin line-height. Never resolve a locale with `locale === "gu" ? … : …` — use `pick()` / `tr()` from `src/lib/i18n/localized.ts`, because the else-branch of that ternary renders a MISSING Gujarati field as English and looks exactly like a translated one. **There is no Hindi website.** A Hindi public locale was implemented and reversed by the owner on 2026-08-31; `tests/public-locales.test.ts` is what stops it returning by accident. That is a decision about the WEBSITE only — Karma teaches and supports students in Gujarati **and Hindi**, which stays published as `availableLanguage` / `inLanguage`.

2. **EMCAD DAHAO is the only software Karma teaches.** Not Wilcom, not any other digitising package — the institute's own admission norm #1, confirmed 2026-08-30. Nothing on the site may state, imply or SEO-target Wilcom training. The one legitimate mention of the word is the institute's own rule, quoted verbatim in `src/content/admission-terms.ts`; `tests/machine-notes.test.ts` fails if it reappears in the notes.

3. **The EMCAD DAHAO facts are verified; every other course's are not.** EMCAD DAHAO Embroidery Designing is **3 months** (recorded in months, never restated as 12 weeks), **₹35,000** total with **₹25,000** at admission and **₹10,000** within one month of joining, four batch timings, and a free **2-day / 2-hour** demo. They live in `src/content/course-operations.ts` and apply to that course alone. Do not copy a duration or a fee onto another course; the other ten are still `durationMonths: null` with no published fee (⚠ CONFIRM-WITH-OWNER Q1/Q12).

4. **No ghost content, no unverified numbers.** Never invent trainer names, testimonials, stories, ratings or stats. Source placeholders remain visibly `sample: true` + `<SampleTag />`. Content Desk may publish proof only through its consent/owner-verification gates. Photography is real, consented studio work; never stock masquerading as Karma.

5. **No payment gateway.** Fees are discussed/recorded offline. Do not add checkout links, online payment flows, UPI payment requests or public price lists.

6. **Public form defence stays layered and fail-closed.** Honeypot before validation, minimum-time check, Turnstile server verification when activated, per-IP + per-phone throttles. In production a missing required dependency returns a typed failure, never demo data.

7. **Never `export const runtime = "edge"`.** OpenNext handles runtime selection.

8. **Design tokens are law, and there are two sets.** The PUBLIC site runs **THREAD / MACHINE / PROOF** (`src/app/thread-machine-proof.css`, every rule scoped to `.kds`, live reference at `/design`); **Karma Console** runs the Machine Lab system in `globals.css` / `premium.css` / `machine-lab.css` and is out of scope for the public rebuild. Never let public CSS reach `/admin`, and never add a public token to `globals.css` — the Console shares that file. On the public side, all colour flows through four replaceable brand variables (`--brand-accent`, `--brand-accent-strong`, `--brand-accent-soft`, `--brand-on-accent`) because the owner's logo may arrive in any colour; hardcoding a hue there fails a test. Status colours (`--ok`/`--warn`/`--bad`) stay independent of the brand and are never the only signal. Borders over decorative shadows; media frames are square. Read `docs/design-system.md` before adding a primitive.

9. **Audit sensitive mutations.** Status changes, admissions, enrollment, attendance edits/locks, certificates, fee records, design-job transitions, website publishing and every team/account mutation write `audit_logs` with actor/action/entity/old/new/reason where relevant. NEVER audit a password, access/refresh token, Supabase secret, database credential, SMTP credential, or raw invitation link.

10. **Authorization is application-layer and centralized.** Supabase Auth proves identity; the Karma `staff` row decides authorization. Every protected page/action goes through `src/lib/auth/guard.ts` (`requireAdmin`, `requireOwner`, `requirePermission`, `authorizeAction`), which delegates to the pure decision in `src/lib/auth/access.ts`. Ordinary console access requires: verified Supabase user → linked staff row → `active` → owner/admin role → lifecycle `status === "active"` → required permission. **No AAL2/MFA step is part of this chain.** An `invited` row consumes a seat but reaches only `/admin/welcome` until password setup/acceptance completes. Never inline a role check, trust `user_metadata`, or treat hidden navigation as security.

   App tables also have RLS enabled with no browser policies and no grants for `anon`/`authenticated`. The publishable key is for Supabase Auth, not application data. Do not add permissive policies or start using Supabase `.from()` for app tables: Drizzle over the trusted server connection is the one data layer.

11. **Private files stay private.** When R2 is activated, design briefs/certificates/backups use private buckets and authenticated routes. Never Supabase Storage for these files and never public confidential-file URLs. Public Content Desk images are a separate future public-media workflow; until configured they use same-origin deployed asset paths only.

12. **One Owner, five Admins.** Exactly one active owner plus at most five enabled/pending admins. Pending invite holds a seat; deactivation frees it. Team administration is Owner-only and has no permission key. Keep the `karma_staff_invariants` DB trigger. Accounts are deactivated, never deleted. A Supabase ban is best-effort sign-in blocking, not session revocation.

13. **Watch Worker size.** Free plan limit matters. After dependencies, run a Wrangler dry-run and check gzip size. Avoid duplicate DB drivers, charting libraries and admin UI suites. (`.claude/skills/` is not bundled and does not count.)

14. **⚠ CONFIRM-WITH-OWNER markers stay unresolved until the owner supplies the fact.** Never infer an address, phone, trainer, duration, testimonial or public statistic from convenience.

15. **Locale routing stays.** Public URLs are `/en/...` and `/gu/...`, always prefixed, with English the default and **no browser-language auto-redirect**; `/admin` deliberately stays outside the locale segment. Every new public page gets hreflang metadata through `pageMeta()`, which derives its alternates from `routing.locales` — never list locales by hand there or in the sitemap, because a hreflang set that disagrees with the sitemap is worse than none.

16. **Tests guard contracts.** `npm test` must pass. New validation/security/permission/content-publishing behavior gets pure tests where possible. i18n parity remains mechanical for message catalogs.

17. **Vertical rhythm is a system.** Use `.u-lede`, `.u-eyebrow-gap`, `.u-actions`, `.u-section-body`; section tiers and spacing from `docs/design-system.md`. Do not rebuild spacing ad hoc screen by screen.

18. **Never commit or print a secret.** No key, password, token, connection string, SMTP credential or invitation link belongs in code, a comment, a doc, a test fixture, a log line, an audit row or a commit message. `.env` is gitignored; keep it that way. Configuration identifiers that are *not* credentials — the Hyperdrive id, the Supabase project ref, the Worker name — are already in git on purpose. If you ever find a real secret in the repository or its history, tell the owner so it can be rotated; do not repeat the value anywhere, including in your explanation of finding it.

19. **Do not reintroduce obsolete decisions.** Three were made deliberately and each was expensive to unwind:
    - **MFA/TOTP/AAL2 is not an access requirement** (removed in PR #5, `fix/password-only-admin`). `aal` fields still exist on the access subject and `mfa-setup`/`mfa-challenge` still exist as legacy redirect reasons — carried for compatibility, gating nothing. Do not restore a gate.
    - **Neon → Supabase Postgres.** Do not reintroduce Neon.
    - **Better Auth → Supabase Auth.** Do not reintroduce Better Auth.

20. **Do not touch the custom domain.** `karmadesignstudio.in` is **not** connected, and connecting or rerouting it is not part of any other task. The live review surface is `https://karma-design-studio.essanciaonline.workers.dev`. The cutover is a deliberate owner-gated launch step with its own procedure in `docs/launch-checklist.md`. The same applies to activating **Cloudflare R2** and **Turnstile**: both are deferred on purpose, and `/api/health` reporting them absent is the expected state, not a bug to fix.

## Karma Console product rules
- Staff language is institute language, not ERP language: enquiry, walk-in, follow-up, batch, fees, receipt, હાજરી, certificate, design job, WhatsApp.
- Website forms are never a prerequisite. Authorized staff can manually add enquiries, direct admissions/students, fee entries and design jobs for walk-ins, calls or WhatsApp.
- **A parent/guardian mobile is required on the public admission form and on a console direct admission**, and deliberately optional on the student edit form and the manual enquiry. The asymmetry is tested; read `docs/project-context.md` §22 before changing it.
- **An enrolment snapshots the fee agreement** it was created under. Editing a course never reprices an existing student. Fee status is derived from the ledger — never store a paid/unpaid flag.
- Navigation and Today at Karma are role/permission-aware. A hidden link is UX only; server guards remain authoritative.
- **Archive is the ordinary path; permanent deletion is the deliberate exception.** The whole policy is one table — `src/lib/admin/record-actions.ts` — and every module reads it rather than inventing its own. Deletion is **Owner-only** even for an admin holding the module's manage permission, is preceded by a dependency preflight on its own page, needs a typed confirmation and a written reason, and writes its audit tombstone **before** the row disappears. Audit history, attendance evidence, enrolments and staff accounts are never deletable at all. Do not add `onDelete: cascade` to reach past a dependency block.
- Dates that mean "today" to staff are pinned to `Asia/Kolkata`.
- **Karma runs on paper too.** Nine A4 sheets (admission form filled and blank, receipt, statement, student record, roster, register, design brief, certificate). Black and white, headings repeat across pages, signature blocks never split, Gujarati never uppercased. See `docs/project-context.md` §29a.

## Using the installed skills
`.claude/skills/` holds 322 vendored skills from a shared library. Use them **selectively**: understand the task, decide whether a skill materially helps, invoke only those. Do not activate skills to look thorough, and do not edit an imported skill definition — the next sync overwrites it. Where a skill's generic advice collides with anything above, **the rules above win**. Full guidance, caveats and the sync procedure: `docs/claude-skills.md`.

## Before you call work done
Run the same gates CI runs, and read the output rather than assuming:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Then: **feature branch → PR → CI + Cloudflare preview green → merge.** Do not push to `main`, and do not deploy by hand — Cloudflare builds from Git. If a check fails, fix it; a red build merged is a red production deploy.

## Keep the memory current
`docs/project-context.md` is only useful while it is true. Update it in the **same PR** whenever you change architecture, infrastructure, deployment, security, database schema, integrations, environment variables, or a major product decision — and whenever an owner answers one of the open questions. Correct the specialist doc too (`docs/admin-architecture.md`, `docs/deployment.md`, `docs/content-checklist.md`, …) rather than only the summary. A decision recorded in one place and contradicted in another is how this project would lose its memory a second time.

## Where things live
- Public pages: `src/app/[locale]/…`
- Karma Console: `src/app/admin/…` (outside `[locale]`; authenticated pages are dynamic)
- A4 print sheets: `src/app/admin/(print)/…` — their own route group and stylesheet, no console shell. Every sheet re-checks the permission its data needs; never print an operational screen instead.
- API: `src/app/api/...`
- Public design system: `src/app/thread-machine-proof.css` · primitives in `src/components/kds/` · rendered reference at `/design`
- Proof, testimonials, reviews, partners, social counts: `src/content/proof.ts` — one registry, every item carrying `sample | owner_provided | verified`
- Message copy: `messages/{en,gu}.json`
- Structured/source fallback content: `src/content/*.ts`
- Verified course operations (duration, fees, timetable, demo, curriculum): `src/content/course-operations.ts`; validators in `src/lib/admin/course-operations.ts`
- Versioned admission norms: `src/content/admission-terms.ts` — a published version is immutable; a rule change is a NEW version
- Staff-managed public content: `content_items` via `/admin/content`, with source fallbacks in `src/lib/content/public.ts`
- DB: `src/lib/db/{schema,content-schema,index,queries}.ts`; migrations in `drizzle/`
- Auth/admin: `src/lib/{auth,admin,supabase}/…`
- Structured data: `src/lib/schema.ts` — the one door; nothing else emits JSON-LD
- Canonical admin reference: `docs/admin-architecture.md`
- Durable project memory: `docs/project-context.md`

## Current roadmap state
**A full public visual rebuild is in progress.** The authoritative direction is
[`docs/karma-modern-textile-lab-redesign-plan.md`](docs/karma-modern-textile-lab-redesign-plan.md)
(THREAD / MACHINE / PROOF), with
[`docs/karma-creative-freedom-trust-proof-addendum.md`](docs/karma-creative-freedom-trust-proof-addendum.md)
taking precedence over it on visual creativity, trust/proof modules, sample
placeholders and photography presentation. Read both before touching a public
route, and start from the phase record at the end of the plan.

The owner **stopped and rejected** the "Modern Textile Lab" implementation from
PRs #55–#58: it reskinned the existing composition instead of rebuilding it,
and it added a Hindi public locale the owner does not want. PR #55's rendered
audit and PR #56's `/batches` data contract survive as evidence and function;
the visual direction does not. `src/app/textile-lab.css` is superseded and is
to be replaced, not extended.

Karma Console is explicitly **out of scope**: the compact post-PR-#53 Console
is the baseline, and public CSS must not reach `/admin`.

What still depends on the owner: real content (including the 32 studio
photographs, which have typed, reserved frames in
`src/content/photo-manifest.ts`) and the open confirmations in
`docs/content-checklist.md`, including the **10:30 pm vs 23:00 last-class
conflict**. Turnstile, R2/private file delivery, public-media upload tooling
and custom-domain migration are separate infrastructure steps and must not be
silently activated by feature work.
