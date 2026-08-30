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
4. **Fees.** Stay conversation-only, or publish ranges? *Recommend: keep
   conversation-only (current copy), publish ranges only if walk-ins ask
   constantly.*
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
