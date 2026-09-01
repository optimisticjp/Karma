# Content checklist - what only the owner can unblock

This file is the current handoff list for facts, media and approvals that code
cannot manufacture. Historical questions are preserved in Git history; resolved
questions are not kept open here because that causes future work to undo owner
decisions.

## Rules

- Public website locales are **English and Gujarati only**.
- Hindi may be stated as a teaching/support language, not as a website locale.
- Anything marked `sample` is preview content. It must stay visibly disclosed
  and out of factual SEO/JSON-LD.
- Sample proof is allowed on the Workers.dev preview, but before custom-domain
  launch it must be **replaced with real approved proof or hidden**.
- No online payment capability is planned.
- Public course fee amounts are intentionally not shown. Internal Console fee
  records remain the operational source of truth.
- Never fill missing facts, photographs, reviews, people or outcomes with stock,
  generated or borrowed content.

## Immediate account dependency: make the weekly backup runnable

The 2026-09-01 main-branch backup preflight proved that
`BACKUP_ENCRYPTION_PASSPHRASE` is present in GitHub Actions, but the
`DATABASE_URL` GitHub Actions secret is still missing. Code cannot create or
copy repository secrets on the owner's behalf.

Owner action:

1. copy the **direct Postgres connection string** for the production Supabase
   project from the Supabase dashboard;
2. add it to this repository as the GitHub Actions secret named exactly
   `DATABASE_URL`;
3. run **Actions -> Weekly DB backup -> Run workflow** once;
4. confirm the run uploads only `db-backup-<run-id>` containing
   `db-backup.tar.gz.gpg`;
5. download one artifact and decrypt it offline with the existing backup
   passphrase to prove recovery, not just backup creation.

The workflow remains fail-closed: without that secret it produces no plaintext
or partial backup artifact.

## Required before custom-domain launch

### 1. The 32 real photographs

The layout and manifest are complete. The remaining input is the actual studio
photography.

Allocation is fixed in `src/content/photo-manifest.ts`:

| Group | Count |
| --- | ---: |
| Hero | 3 |
| Course | 8 |
| Student work | 6 |
| Trainers | 3 |
| Studio / machines | 6 |
| Student stories | 2 |
| Screen to Stitch process | 3 |
| Studio floor wide | 1 |
| **Total** | **32** |

The eight course photographs are already assigned to Zardosi, 4-Beads,
Sequence, Coding/Cording, Chain & Multi, Laser, Tufting and EMCAD DAHAO.
Flat Embroidery, Appliqué & 3D and Cross Stitch deliberately use their stitch
swatches until real photographs for those techniques exist.

When the files arrive:

1. use the real originals, not WhatsApp-compressed copies;
2. strip EXIF/location metadata before deployment;
3. export responsive AVIF/WebP/JPEG assets as documented in
   `docs/design-system.md`;
4. write alt text from what is actually visible in each photograph;
5. record consent before naming any student, trainer or other person;
6. run the complete EN/GU mobile and Worker acceptance sweep again.

### 2. Replace or hide sample proof

The centralized proof registry intentionally contains preview material for the
Workers.dev design stage. Before the custom domain is connected, every remaining
sample review, testimonial, student story, trainer profile and partner/customer
mark must either:

- be replaced by a real, owner-approved item with the required consent; or
- be hidden from the launch site.

`remainingSampleProof()` and the proof-firewall tests are the launch gate. A
sample item may never be promoted to `verified` merely to remove its label.

Owner-provided follower/rating figures are a separate state. They may remain
attributed as owner-provided, but they do not become `AggregateRating`, `Review`
or other verified structured proof without independent evidence.

### 3. Approve the public Terms page

`/terms` remains a draft and intentionally uses `noIndex: true`. The owner must
approve the wording before that flag is removed and the route is added back to
the sitemap/indexable launch surface.

This approval is separate from the immutable versioned admission norms used by
Karma Console and the admission flow.

## Owner inputs that improve the site but do not block Workers.dev testing

These are intentionally handled with truthful fallback copy today. They should
not be guessed just to make the checklist shorter.

| Input | Current safe behavior |
| --- | --- |
| Which mobile is answered by a person vs WhatsApp-only | `callPhone` and `whatsapp` remain separate and clearly labelled |
| Exact opening time / day-by-day schedule | Public copy states **Open daily · evening batches till 11:00 PM**; no invented day-by-day schema |
| Exact studio-door coordinates | The owner-supplied Maps pin is used; approximate coordinates are not treated as the exact door position |
| Duration for courses other than EMCAD DAHAO | Public course data says to confirm with the studio when no verified duration exists |
| Detailed syllabus/module confirmation for every technique | Draft/source modules remain clearly separated from verified operational facts |
| B2B turnaround range | Services asks for the customer's deadline instead of promising an invented range |
| Supported production file formats | Services asks what the customer's machine requires instead of inventing formats |
| Founding story / meaning of Karma | About does not invent a founder story |
| Trainer identities and specialties | Preview profiles remain sample until names, roles and consent are supplied |
| Real student outcomes and quotes | Preview stories remain sample; no salary, placement or income claims are made |
| Real client/partner relationships | Preview marks remain sample until a relationship and permission are confirmed |
| 500+ students / other numeric achievements | `verifiedFacts` stays false until written confirmation exists |
| Google rating as verified proof | Owner-provided rating remains outside AggregateRating schema until independently supported |
| Live batch availability | Comes only from real Console batch rows; no fake inventory is substituted |
| Private B2B file upload | R2 remains deferred; the public brief form says file upload is not active |

## Resolved owner decisions - do not reopen

As of 2026-09-01:

- latest closing/evening-batch time: **11:00 PM**;
- public locales: **EN + GU only**;
- course catalogue: **11 courses**, controlled by Active/Public/Archive state in
  Karma Console;
- EMCAD DAHAO: 3 months, EMCAD DAHAO software only, four timetable slots
  (08:00-12:00, 12:00-16:00, 16:00-20:00, 20:00-23:00), free two-day demo at
  two hours per session, live practical training;
- EMCAD internal fee record: ₹35,000 total, ₹25,000 admission, ₹10,000 balance
  within 30 days, while **public fee amounts remain intentionally private**;
- admission norms: 15 clauses, Gujarati original plus English translation,
  versioned and immutable once used;
- the eight photographed course stations and the three swatch-only techniques
  are fixed in the 32-shot manifest;
- production Turnstile is active on the Workers.dev hostname;
- Resend notification email is deferred until the custom domain is verified;
- R2 private brief storage is deferred until the owner asks to activate it;
- leaked-password protection is an accepted Supabase free-plan limitation for
  now, not unfinished application work;
- no Hindi website migration exists and none should be recreated.

## Launch-account work that follows owner approval/media

After the photos, proof decision and Terms approval are ready, the launch pass
moves from content to account configuration:

1. connect the custom domain in Cloudflare and DNS;
2. update `NEXT_PUBLIC_SITE_URL` in source/build configuration;
3. add the custom hostname to Turnstile and update `TURNSTILE_HOSTNAMES`;
4. update Supabase Auth Site URL / redirect URLs;
5. verify the sending domain, configure the same `CRON_SECRET` in GitHub and
   Cloudflare, activate Resend, then restore the 21:00 IST digest schedule;
6. add Cloudflare WAF/rate-limit rules for `/api/*` and, if desired, `/admin/*`;
7. redeploy and run final EN/GU browser, form, SEO, 404, certificate, batch,
   admission and mobile acceptance checks;
8. on institutional handover, make the repository private, review access,
   rotate credentials as appropriate and verify one backup can be restored.

Until that launch pass, the canonical testing URL remains the Workers.dev
production deployment documented in `docs/deployment.md`.
