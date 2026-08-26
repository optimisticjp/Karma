# Operations — free-tier watchpoints & routine care

## The numbers that matter
| Service | Free limit | Our usage | Watch when |
| --- | --- | --- | --- |
| Workers requests | 100k/day | Small local site: tiny | Viral reel moment: fine; sustained bot floods: add a WAF rule |
| Worker size | 3 MB gzip | ~1.2 MB now | After adding npm deps → `npx wrangler deploy --dry-run` |
| Workers CPU | 10 ms/request | SSR is a few ms; DB wait doesn't count | Heavy server work (PDF gen in Phase 4) → measure, consider queues |
| Neon storage | 0.5 GB | Text rows: years of headroom | Only if file-like data creeps into Postgres (don't: use R2) |
| Neon compute | 100 CU-hrs/mo, autosuspend | Scale-to-zero covers it | Cold start after idle: first request slow; health pings soften it |
| R2 | 10 GB, zero egress | Brief files @ ≤8 MB × 3 | ~400+ briefs with max files → review/archive old briefs |
| Resend | 100/day, 3k/mo | ~1 per lead + daily digest | A 50-lead day is still fine |
| GitHub Actions | 2,000 min/mo | CI + 2 crons: minutes | Nothing realistic |

## Routine
- **Daily:** the 21:00 IST digest email lists new applications/briefs. If it
  stops arriving, check the digest workflow run and `CRON_SECRET`.
- **Weekly:** backup workflow stores CSVs of every table as an artifact
  (90-day retention). Download occasionally and keep one offline copy.
- **Monthly:** open `/en` and `/gu` on a phone, submit a test application,
  check Search Console for coverage errors.

## Debugging in production
```bash
npx wrangler tail            # live logs from the deployed worker
```
Form issues: the routes log clearly (`[admission] …`, `[brief] …`,
`[turnstile] …`, `[email] …`). "Demo mode" warnings mean `DATABASE_URL`
never reached the worker: re-run `npx wrangler secret put DATABASE_URL`.

## Known trade-offs (deliberate, revisit in Phase 5)
- Home page renders per request (live batches + YouTube). If traffic ever
  makes that wasteful, enable the R2 incremental cache in
  `open-next.config.ts` and switch to ISR.
- YouTube section fetches the RSS feed per request with a 4 s timeout and a
  graceful channel-card fallback. Cache it alongside the ISR work.
- Images: real photos aren't in yet, so `next/image` optimization is not
  configured. When the shoot lands, decide: Cloudflare Images vs. pre-sized
  static files (see plan §16 for target sizes).
- No per-IP rate limiting beyond Turnstile + honeypot + min-time. If abuse
  appears: Cloudflare WAF rate-limiting rule (free tier includes one) on
  `/api/*`.

## Post-audit operational changes
- `/api/health` now returns **503 in production** when DB, Turnstile or
  email keys are missing: point UptimeRobot at it and treat non-200 as an
  incident (that state can lose leads).
- The homepage is static; upcoming batches come from `/api/batches`
  (cached 5 min at the edge). YouTube is cached 6 hours. A batch edited in
  Neon appears on the site within ~5 minutes.
- The weekly backup workflow **fails loudly** if any table export fails:
  a red run means the backup is incomplete, act on it.
- Sample data and demo form responses now exist only in dev/preview builds.
  If production ever shows a "sample" tag, the deploy is misconfigured.
