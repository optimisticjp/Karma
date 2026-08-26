# Owner decisions that gate the platform build

The audit is right: these are product decisions, not code decisions. Phase 2+
starts after they're answered. Recommendations included so the conversation
is fast.

1. **Launch scope.** Public site now, admin next, portals later? *Recommend:
   ship public site; build admin (Phase 2) immediately after; student portal
   only when attendance data exists (Phase 3+).*
2. **Batch truth.** Who maintains real batch data, how often? *Recommend: one
   owner/manager updates Neon weekly until the admin ships; then admin-only.*
3. **Claims.** Confirm 500+ students and the Google rating with evidence, or
   leave them off. `verifiedFacts` in `src/lib/site.ts` flips them on.
4. **Fees.** Stay conversation-only, or publish ranges? *Recommend: keep
   conversation-only (current copy), publish ranges only if walk-ins ask
   constantly.*
5. **Roles.** Who gets admin vs trainer? Names + numbers before auth exists.
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
