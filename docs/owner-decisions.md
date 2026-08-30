# Owner decisions that gate the platform build

> **PARTLY HISTORICAL.** This list was written before the platform was built,
> so its framing ("Phase 2+ starts after they're answered") no longer holds —
> the console shipped, and the code works around each unanswered question by
> saying something true instead of guessing. Several items here are now
> settled: the launch scope (Q1), the eleven-course catalogue and its display
> order, and Karma Console being password-only.
>
> The **live** register of what is still open — and what the site does in the
> meantime — is `docs/content-checklist.md`, summarised in
> `docs/project-context.md` §39. Read that first; keep this for the
> recommendations, which still stand.

The audit is right: these are product decisions, not code decisions.
Recommendations included so the conversation is fast.

1. **Launch scope.** Public site now, admin next, portals later? *Recommend:
   ship public site; build admin (Phase 2) immediately after; student portal
   only when attendance data exists (Phase 3+).*
2. **Batch truth.** Who maintains real batch data, how often? *Recommend: one
   owner/manager updates the database weekly until the Courses & Batches
   module ships; then Karma Console only.*
3. **Claims.** Confirm 500+ students and the Google rating with evidence, or
   leave them off. `verifiedFacts` in `src/lib/site.ts` flips them on.
4. **Fees.** ~~Stay conversation-only, or publish ranges?~~ **ANSWERED
   (2026-08-30), for one course.** The owner supplied the EMCAD DAHAO
   Embroidery Designing fee plan in writing — **₹35,000 total, ₹25,000 at
   admission, ₹10,000 within one month of joining** — and asked for it to be
   shown transparently on the public site. It is, on that course's page, and
   nowhere else. Every other course's fee remains conversation-only, because
   no other fee has been supplied. **There is still no payment gateway**, and
   this decision does not open the door to one: the site displays the fee, the
   studio collects it in person, and Karma Console records it.
5. **Roles.** Who gets an admin account, and which permission template?
   Karma Console allows the Owner plus **five** admins, so this is now a real
   allocation decision, not a preference: names, emails and a template each
   (Admissions / Academy / Design Lab / Operations / Content). Trainer records
   exist without console access until a trainer module ships.
6. **Attendance policy.** Confirm 75%, the correction window (24h drafted),
   and who approves corrections.
7. **Certificates.** Issuing name, signatory, numbering format, migration of
   past certificates into /verify.
8. **Data migration.** Do existing student/fee records enter the system, or
   does it start fresh? Fresh start recommended for data quality.
9. **Fee ledger.** In scope at all? It's opt-in in the schema; needs a clear
   yes plus who enters payments.
10. **Retention.** Application data kept how long after closure? (12 months
    drafted in /privacy; confirm for DPDP.)

---

## Decisions the owner made on 2026-08-30

These arrived with the institute's own printed admission material and
supersede the older assumptions above where they conflict. Each is recorded in
`docs/project-context.md` and enforced by tests.

11. **EMCAD DAHAO is the only software taught.** Not Wilcom, not any other
    digitising package. It is the institute's own admission norm #1, and norm
    #3 asks students not to spend the trainer's time asking about others. The
    repository no longer targets "Wilcom embroidery training in Surat"
    anywhere, and `tests/machine-notes.test.ts` fails if the word reappears in
    the notes. The single legitimate mention is the institute's own rule,
    quoted verbatim in `src/content/admission-terms.ts`.

12. **EMCAD DAHAO Embroidery Designing runs for three MONTHS.** Recorded as
    months, never restated as twelve weeks. It is the first course with a
    confirmed duration and therefore the first to emit `timeRequired` (`P3M`)
    in `Course` structured data. The other ten remain unconfirmed (Q1).

13. **Batch timings and the free demo are structured, editable configuration**
    — not presentation strings, and not fake dated batch rows. Four timetable
    slots (08:00–12:00, 12:00–16:00, 16:00–20:00 at four hours; 20:00–23:00 at
    three) and a two-day, two-hour free demo with four preferred slots. A
    schedule option is "when this course is taught"; a `batches` row is still
    "this group, these dates, these seats". They are deliberately different
    things.

14. **A parent/guardian mobile number is required on every admission**, not
    only for under-18 applicants. *(Enforced in the admission flow — see
    `docs/admin-architecture.md`.)*

15. **Admission norms are versioned, and an admission records which version it
    accepted.** Fifteen clauses, Gujarati original plus a working English
    translation, in `src/content/admission-terms.ts`. A published version is
    immutable: a rule change is a new version, because editing one in place
    would rewrite what past students agreed to.

16. **Operational records may be permanently deleted — carefully.** This
    reverses the older blanket "archive, never hard-delete" rule. Deletion is
    Owner-only, preceded by a dependency preflight, confirmed by typing, and
    audited *before* the row disappears. Audit history itself and the single
    Owner identity remain undeletable. *(Implemented with the record-action
    model; see `docs/admin-architecture.md`.)*
