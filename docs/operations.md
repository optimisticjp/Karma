# Operations - free-tier watchpoints & routine care

## The numbers that matter
Provider limits change: treat this table as a prompt to check, not as fact.
**Re-verify every free-tier limit before launch.**

| Service | Free limit | Our usage | Watch when |
| --- | --- | --- | --- |
| Workers requests | 100k/day | Small local site: tiny | Viral reel moment: fine; sustained bot floods: add a WAF rule |
| Worker size | 3 MB gzip | ~2.06 MB at the Phase 11 audit | After adding npm deps -> `npx wrangler deploy --dry-run` |
| Workers CPU | 10 ms/request | SSR is a few ms; DB wait doesn't count | Heavy server work (PDF gen in Phase 4) -> measure, consider queues |
| Supabase database | free-tier storage cap | Text rows: years of headroom | Only if file-like data creeps into Postgres (don't: use R2) |
| Supabase project | pauses when idle on free | Health pings keep it warm | A paused project fails closed, not silently; `/api/health` goes 503 |
| Cloudflare Hyperdrive | free tier | One connection per request | Only if the Worker starts holding connections open (it must not) |
| R2 | 10 GB, zero egress | Deferred | Activate only if private B2B file delivery is requested |
| Resend | 100/day, 3k/mo | Deferred during workers.dev testing | Activate after the custom sending domain is verified |
| GitHub Actions | 2,000 min/mo | CI + 2 crons: minutes | Nothing realistic |

## Routine
- **Daily during workers.dev testing:** review new applications and briefs in
  Karma Console. The 21:00 IST digest endpoint may run, but Resend notification
  email is intentionally deferred until the custom domain is connected and
  verified. After Resend is activated, the digest email becomes the daily
  notification path; if it stops arriving, check the digest workflow run,
  `CRON_SECRET`, Resend configuration and `checks.email` on `/api/health`.
- **Weekly:** the backup workflow exports every current **public application
  table**, encrypts the archive with `BACKUP_ENCRYPTION_PASSPHRASE`, and keeps
  only the encrypted GitHub artifact for 90 days. A missing encryption secret
  makes the workflow fail rather than upload plaintext PII. Download an
  encrypted copy occasionally and keep one offline together with the
  passphrase in the institution's password manager.
- **Monthly:** open `/en` and `/gu` on a phone, submit a test application,
  check Search Console for coverage errors. Also open `/admin/team` and
  confirm the admin list matches who should actually have access. A
  deactivated admin frees a seat, so this is also how you find a wasted one.

## Applying a schema change
`npm run db:migrate` runs the SQL in `drizzle/` against the direct
`DATABASE_URL`, never through Hyperdrive, which is a Worker-only path. Review
the generated SQL before running it; migrations here are additive by rule.

**Production migration state after the 2026-09-01 audit: `0000` through `0005`
are applied.** `0004_course_operations` is live. The previous note saying it
was unapplied was stale and contradicted the production Drizzle ledger.

`0005_security_hardening` records two production-security corrections found by
the Supabase advisor audit:

- pin `public.karma_staff_invariants()` to `search_path = pg_catalog, public`;
- if Supabase's `public.rls_auto_enable()` helper exists, remove EXECUTE from
  `PUBLIC`, `anon` and `authenticated` (privileged roles keep access).

The production locale enum remains exactly `en, gu`. The abandoned Hindi
website migration was never applied and is not part of migration history.

All public application tables have RLS enabled and deliberately expose **no
client RLS policies**. Their table ACLs grant the application data path to the
server-side service role, not `anon` or `authenticated`. Supabase therefore
reports `rls_enabled_no_policy` at INFO level for these tables; in Karma this is
the intended deny-by-default design, not a missing-policy bug.

## Seeding is non-destructive about operator data
`npm run db:seed` inserts missing courses and, on a course that already exists,
updates **only** `nameEn`, `nameGu`, `family` and `modules`. It does **not**
touch `sort_order`, `active`, `public_visible`, the fee plan, the timetable or
the archive state; those belong to whoever has been managing the catalogue in
Karma Console.

This is a behaviour change. The seed used to write a zero-based `sort_order` and
upsert it, while the console import wrote a one-based one, so a re-seed silently
renumbered the whole catalogue and undid the owner's arrangement. Both paths now
share one projection (`VERIFIED_CATALOG_ROWS`), and
`tests/course-operations.test.ts` fails if they drift apart again.

## Debugging in production
```bash
npx wrangler tail            # live logs from the deployed worker
```
Form issues: the routes log clearly (`[admission] ...`, `[brief] ...`,
`[turnstile] ...`, `[email] ...`). "Demo mode" warnings mean the worker could reach
no database: check the `HYPERDRIVE` binding in `wrangler.jsonc`, or the
temporary `DATABASE_URL` secret if Hyperdrive is not bound yet.

Console issues log as `[auth] ...`, `[team] ...`, `[login] ...`, `[dashboard] ...`.
None of them ever print a password, token, key or invitation link. If you need
more detail, add it to the log message, never the payload.

## Known trade-offs
- Home page renders per request (live batches + YouTube). If traffic ever
  makes that wasteful, enable the R2 incremental cache in
  `open-next.config.ts` and switch to ISR.
- YouTube section fetches the RSS feed per request with a 4 s timeout and a
  graceful channel-card fallback. Cache it alongside the ISR work.
- Images: real photos aren't in yet, so `next/image` optimization is not
  configured. When the shoot lands, decide between pre-sized static assets and
  a Cloudflare image pipeline; do not activate R2 just for public photography.
- The Worker opens one Postgres connection per request (`max: 1`,
  `maxUses: 1`) rather than pooling across requests. That is deliberate because
  an isolate is shared between people, and Hyperdrive does the pooling on its
  side. Do not "optimise" it into a module-scope pool.
- No per-IP rate limiting beyond Turnstile + honeypot + min-time. If abuse
  appears, add a Cloudflare WAF rate-limiting rule on `/api/*`.

## Post-audit operational changes
- `/api/health` returns **503 in production** when any required request-path
  dependency is unavailable: database, Supabase Auth or Turnstile. Deferred
  Resend does **not** make the site unhealthy during workers.dev testing.
  `checks.email` remains visible as notification-readiness telemetry, and
  `dbViaHyperdrive` remains visible as database-route telemetry.
- Upcoming batches come from the real batch query and are cached at the edge;
  `DEMO_MODE=false` on the production Worker means sample inventory cannot be
  substituted for production batch rows.
- The weekly backup workflow **fails loudly** if table discovery/export or
  encryption fails. It reads Supabase over the direct `DATABASE_URL`, discovers
  public base tables at runtime so newly-added Console tables are not silently
  omitted, and uploads only an encrypted `.gpg` artifact. Managed Supabase
  schemas (`auth`, `storage`) and the Drizzle ledger are outside this interim
  CSV backup.
- Sample proof used by the public preview follows the centralized provenance
  registry and stays out of factual JSON-LD/SEO claims. Sample form responses
  and sample batch inventory are not production fallbacks.

## Security dashboard follow-up
The 2026-09-01 Supabase advisor pass is clear of the function-execution and
mutable-search-path warnings fixed by `0005`. Supabase still reports **Leaked
Password Protection disabled**, but the current free plan does not expose that
control. This is an accepted plan limitation, not an unfinished database or
application change. Revisit it only if the project moves to a plan that exposes
Leaked Password Protection.
