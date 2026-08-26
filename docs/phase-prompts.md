# Phase prompts for Claude Code (2 → 5)

Paste each block into Claude Code when starting that phase. Do them in order.
Every prompt assumes CLAUDE.md has been read; its rules override convenience.

---
## Phase 2 — Admin panel + authentication

Read CLAUDE.md and docs/karma-master-plan-final.md §10 first.

Build the staff admin under /admin (locale-free is fine):
1. Auth: Better Auth with the Drizzle adapter on our existing Neon db
   (src/lib/db). Email+password, invite-only (no public signup): an
   INITIAL_ADMIN_EMAIL env bootstraps the first admin. Roles: admin, trainer
   (staff table already has role + auth_user_id). Middleware protects
   /admin/*; every server action ALSO re-checks session + role.
2. Applications inbox: list with status filter (application_status enum),
   search by name/phone, detail view with timeline, notes
   (application_notes), status changes, next_follow_up date, assigned_to.
   Duplicate-phone rows show a badge. Every status change writes audit_logs.
3. Batches CRUD (label, course, days, times, start date, seats, trainer,
   status). Public BatchTable keeps working unchanged.
4. Courses editor: edit DB course names/durations/modules; then switch
   PUBLIC course pages to read from DB with src/content/courses.ts as
   fallback only when the DB is empty.
5. Keep the worker under 3 MB gzip (wrangler deploy --dry-run to check).
Acceptance: a trainer can log in on a phone and move an application from
new → demo_scheduled with a note in under 30 seconds.

---
## Phase 3 — Attendance

Read CLAUDE.md §7 (audit) and plan §10.3.

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
## Phase 4 — Certificates + brief pipeline

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
## Phase 5 — Polish & scale

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

**Auth security prerequisites (Phase 2 gate: ALL before any /admin route ships)**
Argon2id (or Better Auth default scrypt) hashing; strict rate limiting on
login; generic error messages; httpOnly+Secure+SameSite session cookies with
absolute + idle timeouts; server-side session invalidation on password
change; audit log entries for login success/failure and privilege changes;
every server action re-checks session AND role; no admin bundle references
leak into public pages; confirm Better Auth runs within the OpenNext worker
budget (`npx wrangler deploy --dry-run` before merging).

**Phase 2 additions**
- `consent_versions` table + store the consent text version on each
  application (DPDP: prove what was agreed).
- `notification_outbox` table: routes write intents; a cron drains it, so a
  Resend outage can never lose a notification. Retro-fit the existing
  admission/brief emails onto it.
- Soft-delete policy decision (deleted_at) for students/applications before
  any destructive admin action exists.
- Supervised destructive migration: drop deprecated `students.pin` and
  `applications.message` once the admin is live.
- Course archival: `courses.active=false` flow + public pages must filter.

**Phase 3 additions**
- Sessions restricted to the batch's date window (start_date..end_date; the
  `end_date` column now exists); trainers can mark only their own batches;
  timezone-pin all date logic to Asia/Kolkata.

**Phase 4 additions**
- Certificate PDFs render server-side: measure worker CPU; if pdf-lib + QR
  push past limits, move generation to a GitHub Action worker path.
- Brief downloads: authed, streamed, audit-logged; never a public URL.
