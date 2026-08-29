# Phase prompts for Claude Code

Paste each block into Claude Code when starting that phase. Do them in order.
Every prompt assumes CLAUDE.md has been read; its rules override convenience.

> **Phase 2 has shipped.** The platform foundation — Supabase Postgres via
> Cloudflare Hyperdrive, invite-only Supabase email/password Auth, the
> Owner/Admin permission model, and the Karma Console shell with Today, Team
> and Account & security — is in the repository. The canonical reference is
> **`docs/admin-architecture.md`**. The Neon + Better Auth prompt that used to
> stand here is superseded and has been removed so no future session rebuilds
> the wrong architecture.
>
> Every prompt below now assumes: guards come from `src/lib/auth/guard.ts`,
> permissions come from `src/lib/auth/permissions.ts`, sensitive mutations
> write `audit_logs`, and console copy lives under the `admin` namespace in
> both message catalogs.

---
## Phase 3 — Admissions CRM

Read CLAUDE.md, docs/admin-architecture.md and plan §10.1-10.3 first.

Build /admin/admissions, gated on `applications.view` /
`applications.manage` via `requirePermission` — never an inline role check:
1. Inbox: list with status filter (the `application_status` enum), search by
   name/phone, sort by next follow-up. Duplicate-phone rows show a badge
   (`duplicate_of_phone` is already stored).
2. Applicant detail: timeline, notes (`application_notes`), status changes,
   `next_follow_up`, `assigned_to`, and a one-tap WhatsApp link built from
   the existing `waLink` prefills.
3. Overdue rule: a new application with no staff action within one working
   day is flagged, and the flag drives the Today dashboard's "needs
   attention" count (which already reads live).
4. Convert an accepted application into a student + enrollment
   (`admission_no` KDS-YYYY-NNNN), in one transaction.
5. Every status change and assignment writes `audit_logs`.
Acceptance: an admin can move an application from new → demo_scheduled with a
note, on a phone, in under 30 seconds — and a second admin without
`applications.manage` cannot, even by POSTing the server action directly.

---
## Phase 4 — Students, courses, batches

Read plan §10 and docs/admin-architecture.md §6.

1. Student 360 gated on `students.view` / `students.manage`: admission number,
   personal details, guardian, course, batch, enrollment history, notes.
2. Courses editor gated on `courses.manage`: bilingual name, modules,
   duration, active/archive. Then switch PUBLIC course pages to read from the
   database, with `src/content/courses.ts` as the fallback only when the
   database is empty. Archived courses must disappear from the public site.
3. Batches manager gated on `batches.manage`: label, course, days, times,
   start/end date, seats, assigned trainer, language, status. The public
   BatchTable keeps working unchanged throughout.
4. Keep the worker under 3 MB gzip (`npx wrangler deploy --dry-run`).
Acceptance: the owner can correct a batch time on a phone and see it on
`/gu/admissions` within the cache window, with no invented rows anywhere.

---
## Phase 5 — Attendance

Read CLAUDE.md §7 (audit) and plan §10.3. Gate on `attendance.view` /
`attendance.manage`.

1. /admin/attendance: pick batch → today's session auto-creates
   (attendance_sessions unique batch+date) → roster from active enrollments
   → tap Present/Absent/Late/Excused per student (attendance_records,
   unique session+student) → Save. Big touch targets; works one-handed.
2. Sessions lock 24 h after creation (locked_at). Edits after lock require
   the corrections flow: reason mandatory → attendance_corrections row +
   audit_logs; admins approve.
3. Student month view: per-batch percentage vs the 75% certificate line.
4. Enrollment management: convert an accepted application into a student
   (admission_no KDS-YYYY-NNNN) + enrollment in a batch.
5. CSV export per batch per month.
Acceptance: marking a 10-student batch takes under 60 seconds; a locked
session cannot be silently edited.

---
## Phase 6 — Certificates + Design Desk

Read plan §10.2 and §10.4. R2 stays private (CLAUDE.md §9).

1. Certificate issue flow: from a completed enrollment, check eligibility
   (attendance ≥ threshold), generate cert_no KDS-C-NNNN, render PDF
   (pdf-lib) with name, course, dates, and a QR (qrcode) pointing to
   /verify/{certNo}; store PDF in R2 (certificates.pdf_key); statuses
   issued/revoked with audit_logs. /verify/[id] already renders results.
2. Brief pipeline: /admin/briefs list + detail with the 12-state
   brief_status enum as a visual timeline; every transition writes
   service_status_history + audit_logs; file downloads stream from R2
   through an authed route only.
3. Email the studio on brief status changes that matter (quote_sent,
   approved, delivered).
Acceptance: issuing a certificate end-to-end (check → PDF → QR verifies on
the public page) takes under 2 minutes.

---
## Phase 7 — Content, fees, reports, polish

1. Analytics: GA4 events from plan §17 (demo_click, admission_submit,
   wa_click with source, brief_submit, lang_switch, batch_view).
2. Enable the R2 incremental cache in open-next.config.ts; move home to ISR
   (revalidate ~300 s) and cache the YouTube fetch.
3. Real photos: swap PhotoSlots for next/image with proper sizes; decide
   Cloudflare Images vs pre-sized statics; add OG images per page.
4. Rate limiting: one Cloudflare WAF rule on /api/*.
5. Optional experiments from the plan: QR self-check-in kiosk pilot for one
   batch (attendance_records.method="qr"), fee ledger UI (fee_records) if
   the owner opts in, WhatsApp Business API evaluation.
Acceptance: Lighthouse ≥ 90 on mobile for home + course page in BOTH
languages, with real images in place.

---
## Audit deltas: fold these into Phases 2-4

**Auth security prerequisites — DONE in the Phase 2 foundation**
Supabase Auth owns credential hashing; login runs as a Server Action with per-IP and per-email rate limiting and one generic error; session cookies are managed by `@supabase/ssr`; Karma Console is password-only; every server action re-checks session, staff lifecycle, role and permission; admin bundles never load from public pages; team mutations write `audit_logs`. Still open: audit entries for login success/failure.

**Carry into the next phases**
- `consent_versions` table + store the consent text version on each
  application (DPDP: prove what was agreed).
- `notification_outbox` table: routes write intents; a cron drains it, so a
  Resend outage can never lose a notification. Retro-fit the existing
  admission/brief emails onto it.
- Soft-delete policy decision (deleted_at) for students/applications before
  any destructive admin action exists.
- Supervised destructive migration: drop deprecated `students.pin` and
  `applications.message` once the console is in daily use.
- Ownership transfer as a reviewed procedure (disable the
  `karma_staff_invariants` trigger inside one transaction, swap, re-enable,
  audit by hand). Never a UI control.
- Encrypted `pg_dump` → private R2 backups with 30-daily / 12-monthly
  retention, replacing the CSV artifacts.
- Course archival: `courses.active=false` flow + public pages must filter.

**Attendance-phase additions**
- Sessions restricted to the batch's date window (start_date..end_date; the
  `end_date` column now exists); trainers can mark only their own batches;
  timezone-pin all date logic to Asia/Kolkata.

**Certificates/Design-Desk additions**
- Certificate PDFs render server-side: measure worker CPU; if pdf-lib + QR
  push past limits, move generation to a GitHub Action worker path.
- Brief downloads: authed, streamed, audit-logged; never a public URL.
