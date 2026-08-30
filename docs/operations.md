# Operations — free-tier watchpoints & routine care

## The numbers that matter
Provider limits change: treat this table as a prompt to check, not as fact.
**Re-verify every free-tier limit before launch.**

| Service | Free limit | Our usage | Watch when |
| --- | --- | --- | --- |
| Workers requests | 100k/day | Small local site: tiny | Viral reel moment: fine; sustained bot floods: add a WAF rule |
| Worker size | 3 MB gzip | ~1.7 MB (Supabase + pg included) | After adding npm deps → `npx wrangler deploy --dry-run` |
| Workers CPU | 10 ms/request | SSR is a few ms; DB wait doesn't count | Heavy server work (PDF gen in Phase 4) → measure, consider queues |
| Supabase database | free-tier storage cap | Text rows: years of headroom | Only if file-like data creeps into Postgres (don't: use R2) |
| Supabase project | pauses when idle on free | Health pings keep it warm | A paused project fails closed, not silently — `/api/health` goes 503 |
| Cloudflare Hyperdrive | free tier | One connection per request | Only if the Worker starts holding connections open (it must not) |
| R2 | 10 GB, zero egress | Brief files @ ≤8 MB × 3 | ~400+ briefs with max files → review/archive old briefs |
| Resend | 100/day, 3k/mo | ~1 per lead + daily digest | A 50-lead day is still fine |
| GitHub Actions | 2,000 min/mo | CI + 2 crons: minutes | Nothing realistic |

## Routine
- **Daily:** the 21:00 IST digest email lists new applications/briefs. If it
  stops arriving, check the digest workflow run and `CRON_SECRET`.
- **Weekly:** backup workflow stores CSVs of every table as an artifact
  (90-day retention). Download occasionally and keep one offline copy.
- **Monthly:** open `/en` and `/gu` on a phone, submit a test application,
  check Search Console for coverage errors. Also open `/admin/team` and
  confirm the admin list matches who should actually have access — a
  deactivated admin frees a seat, so this is also how you find a wasted one.

## Applying a schema change
`npm run db:migrate` runs the SQL in `drizzle/` against the direct
`DATABASE_URL` — never through Hyperdrive, which is a Worker-only path. Review
the generated SQL before running it; migrations here are additive by rule.

**`0004_course_operations` (2026-08-30) has not been applied by any automation.**
It adds the course operational model (duration in months, software, the fee
plan, the terms version, the validated `operations` payload, archive columns),
the enrolment agreement snapshot and the new admission fields. It is purely
additive and adds no new tables, so the RLS lockdown from `0002`/`0003` covers
every new column. Until it runs, the console reads the new columns as empty
rather than failing.

## Seeding is non-destructive about operator data
`npm run db:seed` inserts missing courses and, on a course that already exists,
updates **only** `nameEn`, `nameGu`, `family` and `modules`. It does **not**
touch `sort_order`, `active`, `public_visible`, the fee plan, the timetable or
the archive state — those belong to whoever has been managing the catalogue in
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
Form issues: the routes log clearly (`[admission] …`, `[brief] …`,
`[turnstile] …`, `[email] …`). "Demo mode" warnings mean the worker could reach
no database: check the `HYPERDRIVE` binding in `wrangler.jsonc`, or the
temporary `DATABASE_URL` secret if Hyperdrive is not bound yet.

Console issues log as `[auth] …`, `[team] …`, `[login] …`, `[dashboard] …`.
None of them ever print a password, token, key or invitation link — if you need
more detail, add it to the log message, never the payload.

## Known trade-offs (deliberate, revisit in Phase 5)
- Home page renders per request (live batches + YouTube). If traffic ever
  makes that wasteful, enable the R2 incremental cache in
  `open-next.config.ts` and switch to ISR.
- YouTube section fetches the RSS feed per request with a 4 s timeout and a
  graceful channel-card fallback. Cache it alongside the ISR work.
- Images: real photos aren't in yet, so `next/image` optimization is not
  configured. When the shoot lands, decide: Cloudflare Images vs. pre-sized
  static files (see plan §16 for target sizes).
- The Worker opens one Postgres connection per request (`max: 1`,
  `maxUses: 1`) rather than pooling across requests. That is deliberate — an
  isolate is shared between people — and Hyperdrive does the pooling on its
  side. Do not "optimise" it into a module-scope pool.
- No per-IP rate limiting beyond Turnstile + honeypot + min-time. If abuse
  appears: Cloudflare WAF rate-limiting rule (free tier includes one) on
  `/api/*`.

## Post-audit operational changes
- `/api/health` returns **503 in production** when the database, Supabase
  Auth, Turnstile or email is unconfigured: point UptimeRobot at it and treat
  non-200 as an incident (that state can lose leads). It also reports
  `dbViaHyperdrive` truthfully — `false` means the Worker is still on the
  temporary direct-URL fallback, which is degraded but working, and does not
  by itself make the check fail.
- The homepage is static; upcoming batches come from `/api/batches`
  (cached 5 min at the edge). YouTube is cached 6 hours. A batch edited in
  the database appears on the site within ~5 minutes.
- The weekly backup workflow **fails loudly** if any table export fails:
  a red run means the backup is incomplete, act on it. It reads Supabase over
  the direct `DATABASE_URL` (GitHub Actions cannot use Hyperdrive) and now
  includes `staff_permissions`. The artifacts contain PII.
- Sample data and demo form responses now exist only in dev/preview builds.
  If production ever shows a "sample" tag, the deploy is misconfigured.
