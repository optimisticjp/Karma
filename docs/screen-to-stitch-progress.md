# Screen to Stitch — Master Implementation Plan

> Persistent implementation brief for Claude Code Web and any future coding agent.
> 
> **Repository:** `optimisticjp/Karma`
> 
> **Working rule:** always start by reading the latest `main`, this file, `docs/design-system.md`, `docs/content-checklist.md`, and the current architecture/config before changing code. Do not rely on older conversation context.

---

## Mission

Rebuild the public-facing Karma website around one permanent positioning:

**Karma Design Studio is Surat’s machine-led commercial embroidery learning studio, not a generic creative-course provider.**

Core promise:

# FROM SCREEN TO STITCH.

**Design on screen. Prove it on the machine.**

Brand thesis:

**Digital precision, stitched with Surat richness.**

The website must communicate that Karma teaches the complete commercial embroidery workflow: design judgement, digitising, machine setup, test stitching, correction, production quality, troubleshooting and commercially useful output.

The site should feel like a **modern textile lab with the richness of finished embroidery** — precise typography, real machines, tactile stitch detail, technical confidence, local Surat character and prominent stitching motion throughout the experience.

This work is primarily a **public website / content / UX / visual-system evolution**. Preserve the strong backend and Karma Console architecture unless a phase explicitly requires a safe additive integration.

---

# 0. Global source-of-truth rules

## Owner-provided / brand context

Use these links for content, reviews and understanding what Karma does:

- Google Maps listing supplied by owner: `https://maps.app.goo.gl/znKu6vU6A3TEokPe9?g_st=ic`
- Existing website to be discarded after the new site is finished: `https://karmadesignstudio.in`
- Facebook: `https://www.facebook.com/people/Karma-Design-Studio-and-Classes/61573902494333/`
- Instagram: `https://www.instagram.com/karma_designstudio`

Important: `karmadesignstudio.in` contains template filler and is **not** a trustworthy source for proof, trainer identities, testimonials or statistics. Use it only when corroborated or when it describes an actual known service/technique.

The social presence is the real brand: practical, local, technical, direct, Gujarati-led and commercially aware.

Owner-supplied current social/business context for visual and trust use:

- Instagram: about **39.3K followers**, embroidery design + machine training in Surat.
- Facebook: about **10K followers**, active Gujarati content.
- Google Maps listing: **Karma Design Studio & Classes**, embroidery-service context, **4.8 rating**, actual studio / machine-work / embroidered-garment media.
- Social/Reel content frequently covers machine setup, thread matching, design judgement, emCAD/Wilcom, sequence work, production problems, careers and small-business building.
- Owner supplied Facebook phone: **+91 81605 17429**.
- Existing repo currently also carries **+91 99043 76340** as mobile/WhatsApp. Treat call-vs-WhatsApp ownership as a known discrepancy until confirmed. Do not silently merge the two roles.

These follower counts and rating may be used as owner-provided trust content during this pre-domain visual-development stage. Do **not** claim they were independently verified if they were not.

## Current repo truths that must be preserved

At the time this master plan was created, the repo already had:

- Next.js 15 App Router
- TypeScript
- Tailwind 4
- next-intl EN/GU
- Cloudflare Workers via OpenNext
- Supabase Postgres
- Cloudflare Hyperdrive runtime DB access
- Drizzle ORM
- Supabase Auth
- Password-only Karma Console
- Role/permission-aware admin
- Admissions CRM
- manual walk-in / direct admission
- Student 360
- Courses & Batches
- Attendance
- Offline Fees
- Certificates
- Design Desk
- Content Desk
- Reports / audit / CSV exports
- Team management
- Content Desk DB table and migration already applied
- 11-course catalogue
- current public-site “Digital Thread / Machine Floor Ledger” system

Do not casually rebuild working backend subsystems.

## Auth/security invariants

Karma Console is **password-only**.

Do not reintroduce MFA/TOTP/AAL2 as an access requirement.

Preserve:

- verified Supabase identity
- linked staff row
- active lifecycle
- Owner/Admin console roles
- explicit permissions for Admins
- Owner bypass of permission rows
- invite-only onboarding
- max 5 Admin seats + 1 Owner
- audit logging
- deactivation controls
- no public admin signup

Old compatibility references to AAL fields may remain only where code intentionally carries them without gating access.

## Infrastructure explicitly deferred

Do **not** perform these until the owner explicitly asks later:

- connect or route `karmadesignstudio.in`
- custom-domain cutover
- Cloudflare R2 activation
- private B2B file storage activation
- Turnstile configuration
- payment gateway / online payment processing

Workers.dev remains the development/production review surface for now.

## Cloudflare deployment rule

Do not casually change the known-good production deploy behaviour.

The Cloudflare dashboard production deploy command was deliberately fixed to avoid Wrangler/OpenNext Hyperdrive local-proxy delegation problems:

```bash
OPEN_NEXT_DEPLOY=true npx wrangler deploy --keep-vars
```

Preview/version uploads may use the existing repo/dashboard flow.

Do not “simplify” this to plain `npx wrangler deploy --keep-vars` without first understanding the historical Wrangler OpenNext delegation failure.

---

# 1. Audience and conversion model

## Primary audience

Aspiring commercial embroidery designers.

Likely profile:

- 18–30
- Surat or nearby Gujarat
- mobile-first
- Gujarati/Hindi comfortable
- wants a practical job skill or a low-capital route into design/freelance/small business

They need answers quickly:

1. Can a complete beginner learn this?
2. Will I work on a real machine or only watch software?
3. Which software and effects will I learn?
4. What can I make or earn after the course?
5. How long is it, what does it cost and when are batches?
6. Can I visit or try a practical demo first?

## Secondary audience

Working designers, machine operators and factory owners.

They already understand embroidery. Their buying question is:

**“Will this solve the production problems I face?”**

They care about:

- better digitising
- machine settings
- updated emCAD/Wilcom knowledge
- modern effects
- troubleshooting
- registration
- density / underlay / stitch direction
- productivity
- production quality

## Third audience

Boutiques, textile businesses and manufacturers.

They may need:

- custom embroidery design
- sample reconstruction
- machine-ready files
- production correction
- embellishment concepts
- digitising / technical studio support

The “Studio” side must remain visible without weakening the training funnel.

## Shared decision drivers

- visible machine practice
- real teacher credibility
- real student/business outcomes
- specific software and production techniques
- easy local-language contact
- transparent batch/fee/schedule information
- a real studio they can visit

---

# 2. Brand system direction

## Personality

- Expert, not academic
- Ambitious, not flashy
- Technical, not cold
- Local, not provincial
- Premium, not luxury-for-luxury’s-sake
- Direct, not corporate

## Must never feel like

- generic coaching-centre template
- pastel craft blog
- bridal catalogue
- software reseller
- stock-photo college
- loud red/yellow local ad

## Design concept

Evolve the current system into:

**SCREEN TO STITCH / THE MACHINE FLOOR**

Think:

- commercial embroidery machine
- unbleached textile
- software precision
- path nodes
- needle / thread
- satin stitch
- bead / sequin rhythm
- zari catching light
- real workbench / machine-floor density

Not cyberpunk. Not wedding luxury. Not generic “craft”.

## Palette direction

Claude may refine exact values after contrast testing, but use this direction:

| Role | Token direction | Suggested value |
| --- | --- | --- |
| Hero/footer/authority | Machine Black | `#111716` |
| Secondary dark precision | Steel Indigo | `#172B35` |
| Main background | Cotton | `#F5F0E6` |
| Alternate warm surface | Raw Silk | `#E9DECD` |
| Reading/card surface | Worktable | `#FFFDF8` |
| Primary CTA / stitch accent | Vermilion | `#C54832` |
| Technical link / active cue | Needle Blue | `#29617A` |
| Editorial zari detail | Zari Copper | `#AA6239` |

Rules:

- Vermilion remains the main action/stitch colour.
- Zari copper is restrained editorial/material detail only.
- System green/amber/red stay status-only in admin.
- Aurora/glow may appear very subtly on dark technical surfaces.
- Glass may appear only when it reads like digital machine/software instrumentation, not generic glassmorphism.
- Fine 1px rules and dashed stitch lines repeat across the public system.
- Mostly square or roughly 18px corners.
- Avoid bubble-card UI everywhere.

## Typography

Public site:

- Display / strong heading: **Manrope 700/800**
- Body/UI: **Manrope 400–700**
- Editorial accent: **Playfair Display Italic**, sparingly
- Gujarati: **Noto Sans Gujarati 500–700**

Rules:

- never uppercase Gujarati
- never letterspace Gujarati
- Gujarati must remain selectable/accessibility-friendly text
- use correct Gujarati line-height
- short, large headings
- body line measure ~55–72 characters
- no script font
- no condensed college font
- no decorative all-caps paragraphs

## Layout

- max public content width ~1200px
- 12-column desktop logic
- asymmetric hero/editorial layouts
- ~96–120px major section spacing desktop
- ~72–88px mobile
- fine rules and stitch lines for structure
- one strong image / material / technique visual per major story beat
- no horizontal overflow at 320px

---

# 3. Signature stitch-path system

Stitch animation is a **brand asset** and should be prominent throughout the site.

Build/reuse a lightweight reusable SVG/CSS system for:

- dashed thread paths
- knot dots
- emCAD-style vector/path nodes
- stitch drawing on section entry
- stitch underline / heading rule
- numbered production steps
- technique-specific pattern textures
- screen → machine → output transitions

Possible behaviours:

- Hero path begins in a software/vector visual and reaches the machine needle.
- Section path appears to sew itself as content enters viewport.
- Course rows show their own stitch language.
- Production-problem examples can show broken path → corrected path.
- Final CTA path terminates in a knot / needle detail.

Technique cues:

- Zardosi → metallic satin rhythm
- Flat → precise running/satin rhythm
- 4-Beads → bead-node rhythm
- Sequence → disc/sequin repetition
- Coding/Cording → curved cord path
- Chain/Multi → linked loop path
- Appliqué/3D → cut edge / raised border
- Cross stitch → cross pattern
- Laser → cut path
- Tufting → loop field
- emCAD → vector nodes / path handles

Performance rules:

- CSS/SVG first
- no heavy WebGL by default
- no endless decorative animation loops
- IntersectionObserver where appropriate
- `prefers-reduced-motion` shows completed final state immediately
- animation failure must never hide essential content

---

# 4. Fictional/sample-content policy

The owner explicitly wants the entire visual system populated before real content arrives.

Therefore **fictional/sample data is allowed for visual prototyping** for:

- testimonials
- student stories
- student work
- trainer profiles
- production proofs
- review-card layouts
- example business outcomes
- example portfolio work
- sample batch/fee presentation states when necessary

However:

1. every fictional identity/claim must be traceable as `sample: true` or an equivalent explicit internal marker;
2. sample reviews/testimonials must never enter Review/AggregateRating structured data;
3. sample trainer credentials must never become verified schema facts;
4. sample content must be easy to replace from Content Desk/source data later;
5. do not reuse the old template’s fake trainer/testimonial names;
6. never promise guaranteed earnings/salary/placement;
7. do not use real third-party company logos as fictional clients;
8. `docs/content-checklist.md` must maintain a launch-time replacement inventory.

Because Workers.dev is publicly reachable, source/code semantics must make sample state unmistakable even if the visual prototype itself looks polished.

The owner will replace/verify these during the final content-polishing round before custom-domain cutover.

---

# 5. Master execution protocol for Claude Code Web

## One-prompt orchestration

When Claude Code Web receives the instruction to implement this file, it should:

1. fetch/pull latest `main`;
2. read this entire file;
3. inspect current repo before each phase because earlier phases may have changed architecture;
4. execute phases in order;
5. use **one feature branch + PR per phase** unless a phase genuinely needs a small continuation PR;
6. run full verification before merging each phase;
7. merge a phase only when GitHub CI and Cloudflare preview/build checks are green;
8. update the progress table in this file before/with the phase merge;
9. immediately continue to the next pending phase without waiting for owner visual review;
10. if a Claude session/time window ends, the next session resumes from the first non-complete phase in this file.

Do **not** implement all ten phases as one enormous unreviewable commit.

The goal of “one prompt” is one persistent instruction source, **not one monolithic PR**.

## Required checks per phase

Run the repo’s current equivalents of:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Fix every introduced regression.

Do not use `npm audit fix --force` just to silence dependency warnings.

## Merge behaviour

- PR must be mergeable.
- GitHub CI green.
- Cloudflare preview/check green where configured.
- Then merge without waiting for manual owner review.
- Confirm production build after merge when practical.
- Do not touch custom-domain routing.

---

# 6. Progress tracker

Update this table after every completed/merged phase.

| Phase | Scope | Status | PR / merge notes |
| --- | --- | --- | --- |
| 1 | Brand system + design foundations | ✅ Complete + merged | PR #12 — `build` + Cloudflare Workers Builds green |
| 2 | Homepage / 30-second decision | ✅ Complete + merged | PR #13 — `build` + Cloudflare Workers Builds green |
| 3 | Courses / production-led detail pages | ✅ Complete + merged | PR #14 — `build` + Cloudflare Workers Builds green |
| 4 | Proof ecosystem: work, stories, reviews, trainers | ✅ Complete + merged | PR #15 — `build` + Cloudflare Workers Builds green |
| 5 | Mobile conversion / call / directions / demo | ✅ Complete + merged | PR #16 — `build` + Cloudflare Workers Builds green |
| 6 | Studio / B2B commercial embroidery | ✅ Complete + merged | PR #17 — `build` + Cloudflare Workers Builds green |
| 7 | Machine Notes / social-to-search content | ✅ Complete + merged | PR #18 — `build` + Cloudflare Workers Builds green |
| 8 | Local SEO / structured data / measurement | ✅ Complete + merged | PR #19 — `build` + Cloudflare Workers Builds green |
| 9 | Accessibility / performance / responsive hardening | ✅ Complete + merged | PR #20 — `build` + Cloudflare Workers Builds green |
| 10 | Final whole-site creative polish | ⏳ Pending | |

Status values:

- ⏳ Pending
- 🚧 In progress
- ✅ Complete + merged
- ⚠️ Blocked — explain why

---

# PHASE 1 OF 10 — Brand System + Design Foundations

## Goal

Rebuild the public-facing design system around **Screen to Stitch / The Machine Floor**.

First inspect:

- `src/app/globals.css`
- `src/app/premium.css`
- `docs/design-system.md`
- public root/layout
- Header/Footer
- language components
- current UI primitives such as Ledger, TechniquePlate, Reveal, SectionHeading, Icon
- current EN/GU font loading

Research current premium commercial embroidery / digitising / machine-training brands and strong textile/design education systems before implementation. Useful reference categories include Wilcom, Ricoma, Melco, Hand & Lock and high-quality textile/design-school editorial sites. Extract patterns; do not copy identities.

## Deliverables

1. new/updated public design tokens;
2. Manrope-led public type system + sparing Playfair italic + Noto Sans Gujarati;
3. reusable stitch-path primitives;
4. refined Header/Footer/public base layout;
5. reusable surfaces, CTA, layout and editorial primitives;
6. strong mobile responsive baseline;
7. keyboard/reduced-motion baseline;
8. update `docs/design-system.md` to Design System v3 / Screen to Stitch;
9. preserve admin styles/functionality unless shared CSS needs carefully scoped protection.

## Do not

- heavily redesign admin in this phase;
- reintroduce MFA/TOTP;
- add stock imagery;
- connect custom domain;
- configure R2/Turnstile/payments.

## Completion

Run all checks, open PR, get GitHub + Cloudflare green, merge, then mark Phase 1 complete here.

## Implementation record

### Research inputs
Ricoma, Wilcom and Melco product/marketing sites plus Hand & Lock. The pattern
that decided the direction: the entire commercial-embroidery reference set is
sans-serif, leads with numerical specificity, positions problem→solution, and
shows machines mid-operation rather than lifestyle. Colour restraint is what
signals "industrial" in this category. Patterns extracted; no identity copied.

### Decisions

1. **Manrope carries display and UI; Fraunces and Noto Serif Gujarati are
   removed.** v2's editorial serif read as craft blog, not machine floor.
   Playfair Display is added but loads its **italic axis only**
   (`wght-italic.css`), so the net font payload is *smaller* than v2 despite
   gaining an accent face. Playfair is used in exactly one primitive
   (`.pull-quote`) and falls back for Gujarati, which does not use italic.
2. **Token names are unchanged; only values were retuned and new tokens
   added.** `globals.css` is shared with Karma Console, so a rename would have
   silently restyled the admin. Palette moved to Cotton / Raw Silk / Machine
   Black / Steel Indigo per the palette-direction table, and `needle`,
   `needle-light`, `zari-deep` and `steel` were added.
3. **Every contrast ratio in the palette was measured, not estimated**, and
   the results are recorded as comments in the CSS and as a table in
   `docs/design-system.md`. Zari copper (4.09:1) is restricted to large and
   editorial use; `zari-deep` (5.77:1) exists for when copper must be text.
4. **The straight stitch rule is drawn in CSS, not SVG.** A stretched SVG maps
   a fixed viewBox onto an arbitrary width, which squashes the 9/6 stitch and
   slides the needle dots off the stitch heads — at 144px wide the spec
   geometry came out as 4.3px stitches with dots every 7.2px. `<StitchPath>`
   keeps the SVG for shaped connectors, where the aspect is fixed.
5. **The reveal for a stitch is a `clip-path` wipe, never
   `stroke-dashoffset`.** Animating the offset slides the stitches along the
   seam instead of laying them down. The wipe is opt-in, `.js`-gated, and
   self-registers through `<UnveilWatcher>` (now watching `.stitch-wipe` as
   well as `.media-unveil`) so it never depends on a `<Reveal>` ancestor.
6. **The spine closes every page.** "From screen to stitch. / Design on
   screen. Prove it on the machine." now lives in the footer in both locales,
   because it is the promise the whole site is built to keep — chrome, not
   homepage content.
7. **`body`-scoped public CSS was moved to `.site-body`.** The mobile tab
   bar's `padding-bottom: calc(4rem + safe-area)` targeted bare `body`, so it
   was also reserving 64px at the bottom of every Karma Console screen for a
   bar the console does not have. Verified fixed: admin `padding-bottom` is
   now `0px`.

### Admin impact (checked, deliberate)
`/admin/login` renders correctly, has no `.site-body` styles, no horizontal
overflow, and `padding-bottom: 0px`. Console headings now render in Manrope
rather than Fraunces — a shared-token consequence of the retune, and the right
one: Manrope was already the console's body face, so a staff tool is now set
in a single family. No admin layout, component or route was touched.

### New files
- `src/components/ui/StitchPath.tsx` — `<StitchPath>` (5 presets + custom
  geometry) and `<StitchRule>`.
- `src/components/ui/Surface.tsx` — `<Surface>` (4 tones) and `<SeamNote>`.
- `src/components/ui/PullQuote.tsx` — the editorial accent, with the
  `sample` flag that keeps unverified quotes out of structured data.

### Verification
`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (196 passing) and
`npm run build` all clean. Responsive audit run in Chromium at 320, 360, 375,
390, 430, 768, 820, 1024, 1280, 1440 and 1728 across `/en`, `/gu`,
`/en/courses`, `/en/about`, `/en/student-work` and `/en/contact`: **zero
horizontal overflow, zero sub-24px non-inline targets** (the only flag is the
`sr-only` skip link, which is full size on focus).

---

# PHASE 2 OF 10 — Homepage: The 30-Second Decision

## Goal

A mobile visitor arriving from Instagram/search should understand Karma and know what to do in roughly 30 seconds.

## Homepage structure

### 1. Hero

Core copy:

**FROM SCREEN TO STITCH.**

**Design on screen. Prove it on the machine.**

Communicate immediately:

- commercial embroidery
- real machine practice
- software + production
- Surat / Mota Varachha
- beginner-friendly
- practical demo

Primary CTA: **Book a practical demo**

Secondary CTA: **Call for current batch**

Third action: **Directions**

Use one strong machine/material/software composition. If real photography is missing, use technique/material/software abstractions and deliberate media placeholders — no stock-photo college imagery.

Trust rail may use owner-provided rounded facts:

- 4.8 Maps
- 39K+ Instagram
- 10K+ Facebook
- Mota Varachha, Surat
- practical machine training

### 2. Signature workflow

Create a major visual story:

**01 Design → 02 Digitise → 03 Set → 04 Test → 05 Correct → 06 Stitch**

Connect it with the stitch path.

### 3. Course/skill chooser

Use the real current **11-course catalogue**.

Do not show 11 identical generic cards.

Use a production ledger / scannable list / technique plates.

Current catalogue includes:

1. Zardosi Machine Embroidery
2. Flat Embroidery
3. 4-Beads Machine Work
4. Sequence Work
5. Coding / Cording Machine
6. Chain & Multi Machine
7. Appliqué & 3D Embroidery
8. Cross Stitch
9. Laser Work
10. Tufting
11. emCAD Embroidery Design

Preserve canonical slugs/storage ordering rules documented in the repo.

### 4. Production problems

Create a section titled around:

**The problems we teach you to solve.**

Examples:

- thread keeps breaking → needle/thread/material matching
- looks good on screen, fails on fabric → density/underlay/path direction
- sequence registration problems → setup/correction
- operator compensates for bad file → fix digitising upstream
- production too slow → improve design + machine decisions

### 5. Proof from the machine

Visual proof pattern:

**SCREEN FILE → FAILED SAMPLE → CORRECTION → FINAL STITCH**

Use sample/demo content where real proof is unavailable, following sample policy.

### 6. People/outcome proof teaser

Show concise entry points to:

- student work
- student story
- trainer credibility
- social/channel authority

### 7. Current batch / fee / demo

Use live DB batches when available.

Do not invent verified public fees/durations.

If unknown, say naturally:

- “Call for current fee”
- “Ask for current course duration”
- “Current batch details on call/demo”

### 8. Studio/business switch

Dark technical band:

**Already know what you need? We can produce it too.**

Link to B2B Studio services.

### 9. Reviews/location

Use Maps rating, address, landmark, directions and review-card visual system.

Sample review text is allowed only under sample policy.

Avoid loading a giant embedded Maps iframe as the default proof element if a lighter direct-link/static treatment performs better.

### 10. FAQ

Use real audience language, EN + GU.

Questions should include beginner suitability, real machine practice, emCAD/Wilcom, duration, current batch, fee, demo, job/freelance/business path.

### 11. Final CTA

Direction:

**Your first design should not stop at the screen. Come prove it on the machine.**

## Mobile/responsive

Audit at 320, 360, 390, 430, 768, 1024, 1440.

No carousel may be the only way to access essential content.

No autoplay sound.

Merge when green; update progress.

## Implementation record

### What was built
- **Hero** rebuilt around the spine. `FROM SCREEN TO STITCH` as the H1, the
  promise line under it, and three ranked actions: *Book a practical demo*
  (primary), *Call for current batch* (secondary), *Directions* (tertiary
  link). The right side is a **material wall** — six drawn technique plates,
  labelled — because the studio has no photography, stock is off the table and
  empty frames are worse than nothing.
- **Trust rail**: 4.8 Google · 39K+ Instagram · 10K+ Facebook · Mota Varachha,
  Surat · On live machines. Five facts, five columns.
- **`<ProductionWorkflow>`**: 01 Design → 02 Digitise → 03 Set → 04 Test →
  05 Correct → 06 Stitch, with a running stitch threading through the six
  numbers on wide screens and dropping between them on one column.
- **`<CourseCatalogue>`**: all eleven courses as one numbered ledger.
- **`<ProblemsSolved>`**: "The problems we teach you to solve" — five
  fault → cause pairs.
- **`<MachineProof>`**: screen file → failed sample → correction → final
  stitch, all four states drawn.
- **`<Reviews>`**: the Google rating linked to the live listing, plus three
  sample review cards.
- **FAQ** gained the four missing topics: emCAD vs Wilcom, course duration,
  when the next batch starts, and the job/freelance/own-unit question.
- **Final CTA**: "Your first design should not stop at the screen."

### Decisions

1. **The failed-sample panel is the point of the proof section.** Every
   institute in Surat publishes finished work; none publishes a stitch-out
   that went wrong. Showing four faults on a bad sample and naming the file
   change that fixes each one is the single most persuasive thing on the page,
   and only someone who runs production every day can do it. The panels are
   *diagrams of ordinary trade faults*, not a record of any student's work, so
   there is no identity, outcome or statistic to verify.
2. **Owner-provided facts are a third category** — `ownerProvidedFacts` in
   `src/lib/site.ts`, between `verifiedFacts` and sample content. They are
   rounded, attributed to their source, and **the 4.8 never enters
   `AggregateRating`**: we have no verified review count, and a fabricated
   rich result is a different order of problem from a labelled card.
   `verifiedFacts.googleRating48` stays `false`, because that flag governs
   whether the number may be called independently verified.
3. **Three columns of families was wrong for eleven courses.** The split is
   9 / 2 / 1, so machine work ran nine rows deep beside two columns of white
   space and the section cost 2,200px to say what a list says in 700. One
   numbered ledger with the family in the right-hand column groups without
   fragmenting.
4. **`<ScreenToStitch>` was removed from the homepage.** It showed the same
   motif as file → path → finished, which the machine-proof strip now does
   with two more states and a failure, in less height. Keeping both cost 800px
   of desktop to say the same thing twice. The component is kept for a course
   detail page in Phase 3, where the interaction has room to earn its place.
5. **The proof strip is on `bg-sand`, not a third dark band.** Two dark bands
   already punctuate this page (the audience switch and the close) and a third
   turns punctuation into decoration. Each panel carries its own ground — CAD
   grid, puckered weave, clean weave — so the contrast is inside the strip.
6. **The technique plates are zari copper, not vermilion.** Six vermilion
   plates beside a vermilion primary button made the texture louder than the
   action. `TechniquePlate` now takes its thread colour from a
   `--plate-accent` custom property so the accent stays reserved for actions.
7. **Nothing was invented.** No duration, fee, student count, pass rate,
   placement or earnings claim appears anywhere. Four of the new FAQ answers
   deliberately say "ask at the demo", and the job/business answer explicitly
   refuses to promise a job or an income.

### Bugs found and fixed during the phase
- The four proof panels rendered **blank**: `.stage-layer` is absolutely
  positioned (it was written to stack states inside the slider), so the new
  frame had to establish the containing block.
- The correction panel's underlay lattice ran past the motif outline and read
  as stray construction lines. Now clipped to the shape it supports.
- `.rule-stitch` was still drawing the old v2 dash with no needle
  penetrations, so two marks that both mean "stitch" were drawn two different
  ways. It now uses the Phase 1 geometry.
- The workflow's closing rule inherited the note's `68ch` measure, so it
  stopped half way across the section.

### Verification
`npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (196 passing) and
`npm run build` all clean. Responsive audit in Chromium at 320, 360, 375, 390,
430, 768, 820, 1024, 1280, 1440 and 1728, in both locales: **zero horizontal
overflow, zero sub-24px non-inline targets** at every width. All eleven
ledger rows, six workflow stages, five problem rows and four proof panels
confirmed rendering at 390 and 1280. Every public route returns 200.

Homepage height: 10,377px desktop / 16,742px mobile, for fifteen sections —
against 12,220px before the catalogue and slider decisions above.

---

# PHASE 3 OF 10 — Course Experience

## Goal

Redesign:

- `/[locale]/courses`
- all `/[locale]/courses/[slug]`

around **commercial embroidery outcomes**, not generic course marketing.

## Courses index

Create a “machine floor catalogue”.

Avoid identical-card grids.

Use:

- ledger rows
- technique plates
- production outputs
- beginner/advanced cues
- machine/software relationships

Group sensibly by current families:

- Machine Embroidery
- Modern Techniques
- Design Software

Zardosi should remain prominent because owner has confirmed it leads enquiries.

Flat Embroidery should read clearly as a foundation option.

## Course-page order

Every course should answer:

1. What this technique produces
2. Who it is for
3. What production problems it solves
4. Machine/software involved
5. Real machine practice
6. Commercial outputs
7. Skills learned
8. Sample proof / student work
9. Trainer
10. Current batch
11. Fee / call for current fee
12. Practical demo CTA
13. FAQ

Do **not** lead with syllabus/modules.

Optional detailed modules may live in semantic `<details>` or a secondary section.

## Tone

Avoid:

> “Explore the creative possibilities of…”

Prefer:

> “Set the job, run the machine, correct the sample and finish production-ready work.”

For advanced audiences include relevant technical concepts such as:

- density
- underlay
- stitch direction
- registration
- thread/needle
- trims
- pathing
- sequence/bead setup
- production speed
- quality control

## emCAD / Wilcom

The website should reflect both emCAD and Wilcom in the brand/content ecosystem where appropriate.

Do not falsely claim every course teaches both.

Where exact software coverage is not verified, use careful language and mark owner-confirmation needs.

## Durations

Current canonical durations are intentionally `null` until owner confirmation.

Do not invent real public durations as facts.

Merge when green; update progress.

## Implementation record

### The data change that made this possible
`Course` gained a required `production` field (`CourseProduction` in
`src/content/courses.ts`), filled for all eleven courses in both languages:

| Field | What it holds |
| --- | --- |
| `produces` | One sentence: what the technique physically makes |
| `problems` | Three named production faults its training exists to prevent |
| `machine` | What it is run on |
| `software` | **Optional** — set only on the design course |
| `practice` | What the hands actually do on the floor |
| `outputs` | What the finished work sells as |

All of it is trade knowledge about the *technique* — the facts a supervisor
gives a new operator — not a claim about Karma. Nothing in it asserts a
duration, a fee, a student outcome or a placement, so none of it needs owner
confirmation.

### Courses index
Eleven cards became a ledger that leads with what each technique produces,
because that is the axis someone is actually choosing between: bridal zardosi
panels, sequin dupattas by the metre, tufted rugs, machine-ready files. A
family plate heads each group, and a new section explains how the three
families relate — the one thing a list of eleven cannot say.

Two cues are marked, and **both are facts rather than difficulty ratings**:
*Start here* on Flat Embroidery (underlay, density and stitch direction are
the vocabulary every other machine technique is written in) and *Most asked
for* on Zardosi (owner-confirmed, 2026-08-29, which is also why it heads
`COURSE_DISPLAY_ORDER`). No course carries an invented "beginner" or
"advanced" label.

### Course detail, reordered
The old page went who-it's-for → modules, which is how a brochure is written
and not how anyone decides. The new order follows the brief exactly: what it
produces (the lede) → who it is for → skills → the production problems it
fixes → machine and software → real machine practice → what the work sells as
→ student work and trainer → batches → fees and the demo → FAQ. **Modules moved
to the bottom**, in the existing native `<details>` accordion.

### Decisions
1. **emCAD is named as what is taught; Wilcom is described as what transfers.**
   The `software` field is optional and set on one course, because claiming
   every course teaches a digitising package would be false. The wording says
   the *decisions* — underlay, density, stitch types, pull compensation,
   travel order — are the same in any package including Wilcom, which is true,
   rather than implying both are taught.
2. **The fee section says there is no price list, and why.** An evasive blank
   reads worse than the honest answer, and the honest answer ("what a course
   costs depends on the technique and the batch") is also the true one.
3. **`Course` structured data carries no `offers`, `timeRequired` or
   `aggregateRating`.** Fees are offline, durations are unconfirmed, and no
   reviews have been collected. An invented value in any of those is worse
   than its absence. `teaches` was added, because the outcomes are real.
4. **Related courses capped at three.** The machine family has eight, so an
   uncapped list added ~2,500px of cards to the bottom of a phone page. A link
   to the full catalogue carries the rest.
5. **No trailing chevron on catalogue rows.** The whole row is the link and
   `a.ledger-row` already marks itself with the brand thread; the glyph
   wrapped onto its own line whenever the description ran to two lines.
6. **Durations remain `null`** for all eleven, and the page prints the
   "confirm with the studio" value rather than a guess.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (196 passing) and
`npm run build` all clean. Responsive audit at 320, 360, 375, 390, 430, 768,
820, 1024, 1280, 1440 and 1728 across the index and two detail pages in both
locales: **zero horizontal overflow, zero sub-24px non-inline targets**. All
eleven ledger rows and both cues confirmed at every width. All 22 course
detail routes (11 × 2 locales) and every other public route return 200. The
homepage is unchanged at every width — no regression from the shared changes.

Course detail height fell from 11,233px to 9,229px mobile and 7,244px to
6,180px desktop after the related-courses cap.

---

# PHASE 4 OF 10 — Proof Ecosystem

## Goal

Build premium proof for:

- machine results
- student work
- student stories
- trainers
- reviews
- social authority

Research excellent vocational, technical training and commercial-education proof patterns before implementing.

## 1. Machine proof

Create a technical case-study format:

**Screen design → failed sample → diagnosis → correction → finished output**

Useful fields:

- Problem
- What changed
- Machine/software setting
- Result

This is more valuable than generic praise.

## 2. Student Work

Redesign `/student-work`.

Use editorial grid/masonry/ledger as appropriate.

Each item can show:

- technique
- course
- technical note
- outcome
- media
- optional before/after

No carousel dependency.

## 3. Success Stories

Redesign `/success-stories` as mini case studies:

- Before
- Why they joined
- What they learned
- What changed
- Where they are now

Sample archetypes may include:

- beginner → machine operator
- tailor → added embroidery service
- homemaker → paid work
- operator → digitiser
- student → freelance designer
- boutique owner → brought skill in-house

No guaranteed earnings.

## 4. Trainer profiles

Build a strong trainer system with fields for:

- portrait/media
- name
- role
- production speciality
- machines taught
- software
- years/experience
- teaching style
- selected work

If real details are missing, use new sample identities — never the old template’s trainer names.

## 5. Reviews

Build a review wall, not a generic slider.

Fictional reviews allowed only as sample content.

Do not emit fake review structured data.

## 6. Social authority

Use rounded owner-provided counts:

- ~39K Instagram
- ~10K Facebook

Prefer local optimized presentation and outbound links over heavy embedded social widgets.

## Content Desk

Extend the typed CMS only if needed to support richer structured proof.

Do not turn it into a generic page builder.

Preserve consent architecture for real published student material.

Add tests for sample-vs-verified behaviour.

Merge when green; update progress.

## Implementation record

### The decision that shaped this phase
`/student-work` and `/success-stories` both **filtered every sample out**,
which — with nothing published — meant they rendered an intro above nothing.
The absence of photography was the loudest thing on the site.

CLAUDE.md's rule is that source placeholders stay visible *carrying their
`sample: true` marker*, not that they are hidden, and the owner asked for the
whole visual system populated. So samples now render, each with a visible tag,
and Content Desk still replaces them wholesale the moment one real row is
published. The old filtering was a workaround for placeholder text that read
as editorial instructions ("Replace with the student's own sentence…"); the
real fix was to write sample content worth showing.

### 1. Machine proof — the strongest thing on the site
`machineCases`: four notes running problem → diagnosis → what changed →
setting → result. **These carry no sample flag**, because they make no claim
about a person, a student or a client. Each is an ordinary production fault
with its ordinary cause — the same note would be written in any embroidery
unit in Surat — so there is nothing in them for the owner to verify.

That is precisely why they are the best proof available: generic praise from
an anonymous reviewer proves nothing, while naming the fault, the diagnosis
and the setting that moved proves the studio runs production.

### 2. Student work
`/student-work` is an editorial grid, no carousel anywhere. Each piece carries
the technique, the course it came from (linked), the technical note and what
it demonstrates. Sample entries render their planned shot in a `<PhotoSlot>`
with a visible tag, so a visitor sees "this shot is planned" rather than a
fabricated piece. The machine case notes sit below.

### 3. Success stories
Six archetypes as mini case studies — before → why they joined → what they
learned → what changed → where they are now — covering the routes people
actually take into this trade: beginner → operator, tailor → added a service,
homemaker → paid work, operator → digitiser, student → freelance designer,
boutique owner → skill in-house. **No earnings, salary, job or placement is
claimed anywhere**, and a test enforces it.

The case-study fields are optional on `Story`, so a story published through
Content Desk renders as before → after without needing five new fields on that
form. Extending the CMS to solve a presentation problem would have been the
wrong trade.

### 4. Trainers
Three sample profiles with the fields a student actually weighs: speciality,
machines taught, software (only where true), experience, teaching style and
selected work. Experience is **a range, never a year count**, and a test
enforces that. Names are new — none is reused from the old ValidTheme
template, and a test enforces that too.

### 5. Reviews
A wall, not a slider: a carousel hides seven of eight reviews behind an
interaction and costs JS to do it. Seven cards, all on the page. Three appear
on the homepage; the full wall is on `/success-stories`.

### 6. Social authority
Rounded owner-provided counts and four outbound links. No embedded feed: a few
hundred kilobytes of third-party JavaScript to prove a follower count is a bad
trade for an audience arriving on mobile data.

### Tests (`tests/proof-sample-policy.test.ts`, 12 new)
The sample contract is now held mechanically, because a reviewer reading a
diff cannot see what a rendered page claims:

- every unverified identity carries `sample: true`;
- no ValidTheme template name reappears;
- no earnings, salary, job-placement or ₹ figure appears in any sample;
- trainer experience is a range, not a year count;
- machine cases carry no sample flag and a full diagnosis chain in both
  languages;
- **no `Review`, `AggregateRating` or `Person` schema anywhere**;
- no `offers:` or `timeRequired:` in `Course` schema;
- `verifiedFacts.googleRating48` stays `false`;
- every surface rendering a sample also renders `<SampleTag />`;
- Content Desk replaces samples rather than sitting beside them.

Two of those tests caught my own over-broad assertions rather than real bugs:
"placement" is a legitimate embroidery term (where a patch sits before it is
tacked down), and `timeRequired` appears in the comment that explains its own
absence. Both are now matched in their intended sense.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (**208 passing**, up from 196)
and `npm run build` all clean. Responsive audit at 320, 360, 375, 390, 430,
768, 820, 1024, 1280, 1440 and 1728 across `/student-work`, `/success-stories`
and `/about` in both locales: **zero horizontal overflow, zero sub-24px
non-inline targets** at every width. Every public route returns 200.

The homepage grew from 10,377px to 11,366px desktop, which is the cost of
replacing a "we have nothing to show" block with three real work cards and a
story teaser. The story teaser is a compact variant for exactly this reason —
a full case study is ~800px, which is right on the stories page and wrong on a
homepage already running fifteen sections — and the homepage review teaser
stays at three of seven.

---

# PHASE 5 OF 10 — Mobile Conversion Architecture

## Goal

Optimize the public site for:

**Instagram / Facebook / Search → mobile phone → 30-second decision → call, directions or demo.**

## Persistent mobile actions

Audit current mobile tab/sticky/FAB systems.

Desired permanent mobile bottom bar:

**CALL FOR DEMO** | **DIRECTIONS**

Two actions only.

Header menu handles navigation.

Do not let a five-tab nav + floating WhatsApp + sticky CTA all fight for the same viewport.

## Phone discrepancy

Owner supplied Facebook phone:

**+91 81605 17429**

Repo also contains:

**+91 99043 76340** as mobile/WhatsApp.

Until owner confirms roles:

- use `+91 81605 17429` for explicit “Call for demo” only if current evidence/owner direction still supports it;
- do not automatically label it WhatsApp;
- preserve existing WhatsApp config separately;
- document discrepancy in `docs/content-checklist.md`;
- do not publish contradictory labels.

## Demo/admission funnel

Audit current `/admission` flow without breaking backend validation or CRM ingestion.

Visitor should see course facts before a long form.

Prefer a short lead flow such as:

1. Course interest
2. Name
3. Phone
4. Preferred timing
5. Optional context
6. Consent
7. Submit / call alternative

Improve:

- input types
- autofill
- mobile keyboard
- labels
- errors
- loading/success
- focus handling
- Gujarati readability

## Touch/accessibility

Primary touch controls ~48px minimum.

Handle safe-area insets and bottom padding so fixed actions never cover content.

## Measurement abstraction

Add privacy-conscious event hooks for later analytics:

- `call_demo_click`
- `directions_click`
- `whatsapp_click`
- `demo_start`
- `demo_complete`
- `course_view`

Do not send PII.

No paid analytics dependency required.

Merge when green; update progress.

## Implementation record

### The bottom bar is now two actions
The five-tab navigation bar is gone. It was an improvement on the three
competing systems it replaced — hamburger, sticky CTA and floating WhatsApp
all fighting for one corner — but still the wrong answer: a visitor arriving
from a reel is not browsing a site map, they are deciding whether to phone.

**CALL FOR DEMO | DIRECTIONS.** Both are the actual conversion, both are one
thumb-reach away, and neither needs a page load to pay off. Navigation moved
entirely to the header menu, which already covers every width below 1280.
Measured at 56px tall — past the 48px floor the brief asks for — full width
at 320-639px and capped at 34rem from 640px so a tablet does not get a
500px-wide button.

### The phone discrepancy, handled rather than resolved
Two numbers are published and the owner has not said which answers what, so
the roles are kept apart:

| Number | Source | Used for |
| --- | --- | --- |
| +91 81605 17429 | The owner's Facebook listing, supplied in this file | Every explicit "Call for a demo" action |
| +91 99043 76340 | In the repo from the start | WhatsApp, and a call alternative to it |
| +91 261 4521383 | The studio's own site | The landline |

The call number is **never** labelled WhatsApp. The WhatsApp configuration is
untouched. Pages listing contact details show all three, each named by its
channel, so nothing contradicts anything else — and all three appear in the
`LocalBusiness` `telephone` array rather than one being promoted.

### The demo funnel now asks the cheapest question first
Steps were: you → course → details → review. They are now **course → you →
details → review**. A visitor will tell you what they want to learn before
they will hand over a phone number, and asking in that order is what turns a
form into a conversation. The preselected-course banner moved to step 2, where
it confirms the choice instead of describing one the visitor cannot see.

The payload shape is unchanged, so backend validation and CRM ingestion are
untouched — only the order of the questions moved.

Mobile input polish: `type="tel"` on both phone fields (`inputMode` alone
leaves a text keyboard on some Android browsers), `inputMode="email"` on
email, `autoComplete="tel"` on the guardian field, and `enterKeyHint` so the
phone's Enter key says "next" or "done" rather than "go".

### Measurement without a dependency
`src/lib/analytics.ts` is not an analytics library. It is the six named
moments plus a function that emits them as a DOM CustomEvent and a small
in-page queue. **No network request, no cookie, no third-party script, no
consent banner** — and nothing to remove later if the owner picks a different
tool. Attaching one is a single listener:

```js
window.addEventListener("karma:event", (e) => provider.track(e.detail));
```

**The PII rule is enforced by construction, not by discipline.** `EventProps`
admits four keys — `course`, `surface`, `locale`, `step` — all slugs, enums or
counts, with no `string` escape hatch, and `track()` strips anything else even
if a cast gets past the type system. Nothing a visitor types can reach it.

Wired through `<TrackedLink>` and `<TrackView>`, two client leaves, so no page
had to become a client component to report a click.

### Tests (`tests/mobile-conversion.test.ts`, 11 new — 219 total)
- the two mobile numbers are different and both published;
- no `wa.me` link uses the call number, anywhere;
- every call-for-demo action dials it;
- both appear in structured data;
- the bar contains no route links and no `usePathname`;
- safe-area inset and body padding are present;
- analytics allows only the four enumerable keys and names no PII field;
- analytics makes no network request and injects no script;
- no `track()` call in the admission form mentions a typed field;
- step one validates course and timing, step two identity;
- phone fields carry tel type, inputmode and autofill.

One of those tests caught my own over-broad assertion again: "script" appears
in the module's comment explaining that it loads none, so the check is now for
script *injection* rather than for the word.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (**219 passing**) and
`npm run build` all clean. Audited at 320, 360, 375, 390, 430, 768, 820, 1024,
1280 and 1440 in both locales across `/`, `/admission` and `/contact`: bar
present and 56px through 1024, hidden from 1280, body padding correct at every
width, **zero horizontal overflow and zero sub-24px non-inline targets**.
Gujarati labels fit without truncation at 320px.

---

# PHASE 6 OF 10 — Karma Studio / B2B

## Goal

Make the Studio side credible for:

- boutiques
- textile businesses
- garment manufacturers
- embroidery units
- people needing machine-ready files
- businesses needing sample reconstruction / design correction

Without diluting student conversion.

## Positioning

Student:

**Learn the complete screen-to-stitch workflow.**

Business:

**Bring the requirement. Karma can take it from reference/design to machine-ready execution.**

## Services

Use only supported/current studio vocabulary, such as:

- embroidery digitising / machine-ready design
- custom embroidery design
- sample reconstruction
- zardosi
- beads / sequence
- coding / cording
- chain / multi
- appliqué / 3D
- production correction
- garment embellishment concepts

Do not invent unsupported services merely to fill space.

## Services-page structure

1. B2B positioning hero
2. What you can bring
3. What Karma returns
4. Techniques / machine capabilities
5. Reference → production-ready workflow
6. Production-problem examples
7. Sample B2B work
8. Process / turnaround framing
9. File/formats where verified
10. Brief form
11. Call/directions/studio visit

Problem-led examples:

- Physical sample but no source file? → reconstruction
- File stitches badly at production speed? → correction
- Need bead/sequence placement? → specialised digitising/setup
- Boutique needs a specific embellished look? → concept/sample-ready design

## Brief form/backend

Preserve:

- current DB
- Design Desk CRM
- audit logging
- service enquiry/status model
- file metadata model

R2 is not active yet.

Do not fake a working upload flow if private file storage is unavailable.

Use honest deferred upload states.

Sample B2B projects may be fictional but generic (e.g. “Bridal blouse panel”), not fake endorsements from real companies.

Merge when green; update progress.

## Implementation record

### The positioning problem, and how it was solved
A student is buying a skill; a boutique or a production unit is buying a
result, and arrives with a problem rather than a browsing intent. The old page
led with a list of service nouns, which is what every embroidery unit's page
looks like.

So the page now leads with **the four situations businesses actually arrive
with** — a sample with no source file, a design that fails at production
speed, bead or sequence placement that will not hold across a length, a look
with no design yet — and names the service second. A buyer recognises
themselves in a situation; they do not recognise themselves in "digitising".

### Sections built
1. **B2B positioning hero** — unchanged framing, kept.
2 + 3. **What you bring / what comes back** — the exchange stated plainly as a
   pair, the second panel on `.surface-machine` so the two read as a trade.
4. **Machine capability** — generated from `coursesByFamily`, so the studio
   page **cannot claim a technique the school does not teach**. That is the
   whole reason it is generated rather than written.
5. **Reference → production-ready workflow** — the existing five-step ledger.
6. **Production problems** — the four above, on the Phase 4 case-note
   primitive. A business reading "what you get back" is reading the same shape
   as a machine note, deliberately.
7. **Sample B2B work** — three generic project types, each tagged.
8. **Turnaround** — see below.
9. **File formats** — see below.
10. **Brief form** — preserved, with one change (below).
11. **Call / WhatsApp / directions**, all three tracked.

### Decisions

1. **No turnaround is promised, and the page says why.** None has been
   confirmed by the owner, and a wrong delivery date costs a customer rather
   than credibility. The copy says it depends on technique, quantity and
   what is on the floor, and asks for the buyer's deadline instead — which is
   also the truthful answer for job work of this kind.
2. **No machine file format is claimed as supported.** Naming `.dst`, `.emb`
   or `.pes` is a compatibility promise nobody has verified. The page asks
   what the buyer's machine takes and offers to work it out from a photograph
   of the machine plate. A test blocks those extensions from the copy.
3. **The file upload field is gone until R2 is bound.** This is not
   cosmetic: with the binding missing, an attached file *fails the request in
   production and is silently dropped in demo mode*. Offering the input was
   promising something that could not happen, and losing a business's artwork
   is the most expensive way to discover that. The brief now says files go via
   WhatsApp against the reference number. `MAX_FILES` and `MAX_FILE_BYTES`
   stay imported and the API route is untouched, so restoring the field is a
   few lines the day the bucket exists.
4. **Sample projects are work types, never clients.** "Bridal blouse panel" is
   a description of ordinary trade work and is safe as an illustration; a
   named company, a logo or an implied endorsement is not. A test blocks
   `ltd`, `pvt`, `®` and `™` from that content.

### Backend preserved
The brief API, Design Desk CRM, audit logging, service enquiry/status model
and file metadata model are all untouched. Only the form's file input and the
page's composition changed.

### Tests (`tests/studio-b2b.test.ts`, 9 new — 228 total)
No turnaround claim; no file-format claim; no file input while storage is off;
the API's file guards still imported; capability generated from the catalogue;
every problem maps to a service the studio already offers; sample projects
carry no company markers; every studio row has both languages.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (**228 passing**) and
`npm run build` all clean. Audited at 320, 360, 375, 390, 430, 768, 820, 1024,
1280, 1440 and 1728 in both locales: nine sections, four problems, three
tagged projects, **no file input**, zero horizontal overflow and zero
sub-24px non-inline targets at every width.

---

# PHASE 7 OF 10 — Machine Notes / Social-to-Search Content

## Goal

Turn Karma’s existing social strength into searchable website authority.

Build a content system called **Machine Notes** unless research produces a clearly stronger brand-compatible name.

It should feel like concise notes from the studio floor — not a generic blog.

## Content themes

- Why this sample failed on the machine
- emCAD vs Wilcom for this production task
- Needle and thread matching in one minute
- From physical sample to machine-ready file
- What a new embroidery designer should learn first
- Why sequence goes out of registration
- Why more density is not always better
- How to choose stitch direction
- What operators wish digitizers understood
- Beginner mistakes before production

## Architecture

Create a clean index and individual note pages.

Allow notes to be:

- English
- Gujarati
- intentionally bilingual

Do not force low-quality automatic duplication.

## Article structure

Each note should generally answer:

- Problem/question
- Short answer
- Why it happens
- What to check
- Machine/software detail
- Example
- Related course
- Demo CTA

## Social integration

Do not load lots of Instagram/Facebook embeds.

Support structured fields for:

- Reel URL
- YouTube URL
- thumbnail
- transcript/summary

Use optimized local/approved thumbnails and outbound links.

## Content Desk

If Machine Notes belongs in the CMS, extend it with structured fields.

Do not add a generic rich-text page builder unless clearly justified.

## Sample notes

Create 6–10 polished sample notes for visual review.

They may be technically plausible educational examples but should not fabricate real customer/student claims.

## SEO cluster

Natural topic coverage:

- embroidery design classes Surat
- machine embroidery training Surat
- emCAD classes Surat
- Wilcom embroidery training Surat
- computerised embroidery design course
- beads and sequence training
- practical embroidery machine training

Internal linking:

note → course → demo

course → relevant note

Merge when green; update progress.

## Implementation record

### The name stayed **Machine Notes**
Research produced nothing stronger. It is accurate (they are notes, and they
are about machines), it is not "blog", and it inherits the brand's existing
vocabulary — the Phase 4 machine case notes already use the phrase, so the
site now has one idea appearing in two places rather than two competing ones.

### Architecture: a typed source file, not a CMS section
Content Desk exists for content the **owner** publishes — student work,
stories, verified numbers — each with a consent and verification workflow
behind it. Machine notes are technical writing that ships with the code, is
reviewed in a diff like code, and links to courses by slug.

A generic rich-text page builder would have added an editing surface nobody
asked for and lost the structure: "what to check" is a numbered list where the
order *is* the advice, not a paragraph someone might bold. So notes live in
`src/content/notes.ts`, exactly like `courses.ts`.

### Eight notes, fully bilingual
`read-a-failed-stitch-out`, `emcad-or-wilcom`, `needle-and-thread-matching`,
`sample-to-machine-ready-file`, `what-to-learn-first`,
`sequence-out-of-registration`, `density-is-not-always-better`,
`choosing-stitch-direction`.

Every field is written in both languages. Nothing is machine-duplicated — the
brief's "do not force low-quality automatic duplication" is met by writing the
Gujarati rather than by shipping English-only pages.

### Structure per note
Question → answer in two sentences → why it happens → the machine detail → an
example → **what to check, numbered** → related course → demo CTA. Someone
standing at a machine with a bad sample gets their answer in the first screen;
someone deciding whether to learn properly reads on and finds the course.

### Decisions
1. **Not a blog: no dates, no bylines, no "read more".** A note is either
   still true or it gets corrected, and neither is a function of when it was
   written. The index is a ledger of questions, because the question is what
   someone types.
2. **`TechArticle`, not `BlogPosting`**, and **no author `Person` and no
   `datePublished`**. No trainer has been confirmed, so a byline would be a
   fabricated person in structured data — the exact thing Phase 4's rules
   forbid. The studio is the publisher.
3. **Media fields exist and are empty.** `reelUrl`, `youtubeUrl` and
   `thumbnail` are in the type so a note can point at the studio's own video
   the moment the owner supplies a verified link. All three are unset on all
   eight notes, because inventing a URL that points at the wrong reel is worse
   than having no video. The UI renders the block only when a link exists, and
   **links outward rather than embedding a player** — no Instagram or Facebook
   embed anywhere.
4. **Every claim is trade knowledge**, so no note carries a sample flag and
   none needs owner verification. Examples describe a fault and its fix, never
   a person: "a filled motif came off with the ground rippled around it", not
   "a student's piece".
5. **Internal linking runs both ways.** A note sends a reader to its course;
   a course page now lists the notes that cover its technique. Someone
   weighing a course wants evidence the teaching goes deeper than a syllabus.

### SEO cluster
Each note carries the themes it genuinely covers as `tags`, and a test asserts
all seven of the brief's themes are covered across the set — emCAD classes
Surat, Wilcom embroidery training Surat, machine embroidery training Surat,
embroidery design classes Surat, computerised embroidery design course, beads
and sequence training, practical embroidery machine training. The index and
all eight notes are in the sitemap with hreflang alternates.

### One layout fix this caused
The header nav went from seven items to eight. At 1280 the brand started
crowding the nav, so the desktop gap dropped from 20px to 16px between 1280
and 1535. Measured after: brand 206px, no collision, no overflow.

### Tests (`tests/machine-notes.test.ts`, 11 new — 239 total)
Six to ten notes; every field filled in both languages; unique slugs pointing
at real courses; linking works both ways; no company or student named; no
guarantee, salary or currency figure; **media URLs unset**; `TechArticle` with
no author or date; sitemap coverage; all seven search themes present; reachable
from header and footer.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (**239 passing**) and
`npm run build` all clean. Audited at 320, 360, 375, 390, 430, 768, 820, 1024,
1280, 1440 and 1728 in both locales across the index, a note and a linked
course page: **zero horizontal overflow, zero sub-24px non-inline targets**,
eight ledger rows, four checks rendering, nav at eight items without crushing
the brand. All note routes return 200 in both locales.

---

# PHASE 8 OF 10 — Local SEO + Structured Data + Measurement

## Goal

Make the Workers.dev site technically ready for strong local search once the custom domain is later connected.

Do not perform domain cutover.

## Fact discipline

Structured data may contain only verified/owner-provided facts.

Do not put sample:

- testimonials
- reviews
- trainer credentials
- student outcomes
- fees
- durations
- invented statistics

into structured data.

## Business identity

Use a consistent identity based on current confirmed repo/owner facts:

**Karma Design Studio & Classes**

Public descriptor may position it as an embroidery academy / machine-led commercial embroidery learning studio.

Current repo address:

302, Middle Point,
Maruti Nandan Society,
Mahadev Chowk,
Mota Varachha,
Surat, Gujarat 394101

Keep landmark visible in text.

Use exact Maps link already maintained in the repo when still valid.

## Structured data audit

Audit/improve where factually valid:

- LocalBusiness
- EducationalOrganization
- Course
- BreadcrumbList
- Article/BlogPosting for Machine Notes

Do not add fake `aggregateRating` or `Review` data.

## Course SEO

Every course should have:

- unique title
- unique description
- unique body
- appropriate Surat/local relevance
- strong internal links
- valid Course data where possible

## Sitemap/indexing

Audit inclusion for:

- homepage
- course index
- all course pages
- services
- admissions/admission where appropriate
- student work
- stories
- Machine Notes
- contact
- verify where appropriate

Exclude admin.

Sample content must not become false schema truth.

## Measurement

Expand privacy-conscious first-party event hooks to include:

- call clicks
- directions clicks
- WhatsApp clicks
- course views
- demo starts/completions
- Instagram/Facebook/YouTube outbound
- Machine Note → course clicks

Never send names, phone, email or form-field content.

## Future launch docs

Document, but do not execute:

- custom-domain canonical switch
- Search Console verification
- sitemap submission
- Google Business Profile website URL update

Merge when green; update progress.

## Implementation record

### One module for all structured data
Schema was being built inline on four pages. It is now built in
`src/lib/schema.ts`, and **a test asserts no other file in `src/app` or
`src/components` contains `"@context"` at all**.

That is the point of the phase. Schema is the one place where an unverified
claim stops being a labelled placeholder and becomes a fact a search engine
repeats. A visitor can see that a review card says "sample"; a rich result
cannot say that, and by the time anyone notices it has been cached,
syndicated and quoted back at the business. So the discipline is not "be
careful when adding schema" — it is that schema has one door, and the door is
guarded.

### What may never appear, now enforced
`aggregateRating` · `ratingValue` · `reviewCount` · `Review` · `Person` ·
`author` · `offers` · `price` · `timeRequired` · any sample identity · and the
string `4.8` itself. Verified against the **rendered HTML** of five routes in
both locales, not only against source.

The owner-provided 4.8 is still shown in the interface, attributed to Google
and linked to the live listing — the distinction the whole phase rests on is
between *showing an attributed number* and *asserting it as an audited fact*.

### What was improved, factually
- `LocalBusiness` + `EducationalOrganization` on one `@id`, so courses,
  articles and breadcrumbs all point at one studio node rather than repeating
  it.
- All three published numbers, none promoted.
- The **landmark inside `streetAddress`** — "near Dhara Arcade, opposite
  Krishna Township Road" is what actually gets a first-timer to the door in
  Mota Varachha, and a PIN code never has.
- `Course` gained `courseMode: "onsite"` and a `CourseInstance` with the
  studio's locality. Both are true and both matter for local course results.
- `TechArticle` for machine notes, with `publisher` and no `author`.
- `knowsLanguage` alongside `availableLanguage`.

### Course SEO
Every course already had a unique name and a unique `produces` line. The
metadata description now appends the locality — *"Taught on live machines in
Mota Varachha, Surat."* — because people search for the work and the city
together. A test asserts all eleven descriptions are distinct.

### Sitemap and robots
64 URLs: 32 paths × 2 locales, covering the homepage, course index, all eleven
courses, admissions, the demo form, student work, stories, services, about,
Machine Notes index, all eight notes, contact, verify and the legal pages.

`robots.txt` now disallows `/admin` as well as `/api/`. The console already
sets `noindex` in its metadata, but a crawler has to fetch a page to read
that — the two together mean a missed header on one route cannot leak a staff
screen into an index.

### Measurement, expanded to eight events
Added `social_click` (with a `channel`) and `note_course_click` (with a `note`
and a `course`). The note→course hop is the conversion the whole Machine Notes
system exists to produce, so it is the one that is counted.

`EventProps` grew from four keys to six — `channel` and `note`, both slugs
from our own data. Still no `string` escape hatch, still nothing a visitor
types.

### Launch documentation — written, not executed
`docs/launch-checklist.md`. The cutover is **one environment variable**:
`NEXT_PUBLIC_SITE_URL`, from which `pageMeta()`, the sitemap, `robots.txt` and
every `@id` derive. A test asserts `site.url` still reads from the environment
rather than being hardcoded, so the switch stays a deployment change and never
becomes a code change.

Documented and deliberately not done: the domain add in Cloudflare, Search
Console domain-property verification, sitemap submission, and the Google
Business Profile URL update.

### Three existing tests were updated, not deleted
Moving schema into one module broke three assertions that read page source for
strings now living in `schema.ts`. The behaviour did not change; the
assertions follow the code. That is the correct response to a test failing
because of a refactor — updating what it reads, not what it checks.

### Verification
`npm run typecheck`, `npm run lint`, `npm test` (**255 passing**, 16 new) and
`npm run build` all clean. Rendered JSON-LD inspected on `/en`, `/gu`,
a course page, a note page and `/en/admissions`: correct types, correct
`@id` graph, **no forbidden term on any of them**. Sitemap 64 URLs, robots
correct, all thirteen sampled routes 200, responsive audit unchanged.

---

# PHASE 9 OF 10 — Accessibility / Performance / Responsive Hardening

## Goal

Audit the entire public website after Phases 1–8 and make it production-grade.

## Accessibility

Target WCAG AA where practical.

Requirements:

- normal text ≥4.5:1 contrast
- visible keyboard focus
- semantic landmarks
- correct heading hierarchy
- real button/link semantics
- field labels
- `<details>`/`<summary>` for suitable FAQs
- usable at 200% zoom
- no critical hover-only information
- Gujarati selectable text
- meaningful alt text for real images
- no text baked into imagery

## Motion

- fully respect `prefers-reduced-motion`
- no scroll hijacking
- no autoplay sound
- no flashing
- no essential content hidden behind animation

## Responsive audit widths

At minimum:

- 320
- 360
- 375
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1440
- 1920

Fix:

- horizontal overflow
- clipped Gujarati
- sticky-bar collisions
- footer collisions
- tables
- giant mobile headings
- tiny targets
- awkward white space
- orphan headings

## Performance

Target LCP ≤2.5s where realistically achievable on mid-range mobile conditions.

Audit:

- hero LCP
- font loading
- JS bundle
- stitch engine
- images
- third-party requests
- dynamic rendering
- Content Desk queries

## Images

Prepare architecture for real photography:

- responsive `next/image`
- width/height
- `sizes`
- lazy below hero
- priority only for true LCP
- AVIF/WebP through current pipeline where available

No stock-photo payloads.

## Forms

Audit Admission and Brief forms for:

- mobile keyboard
- autofill
- accessible errors
- loading
- focus
- no layout jumps

## Security

Do not weaken CSP casually.

Do not add broad source wildcards just to make design assets work.

## Admin regression

Smoke-check Karma Console so public CSS/design changes do not leak into admin.

Do not redesign admin functionality in this phase.

## Tests

Add useful regressions for:

- i18n parity
- no sample review schema
- critical accessibility markup
- reduced-motion CSS
- route/build integrity

Merge when green; update progress.

## Implementation record

This phase was an audit, so the record is what it **found**. Everything below
was a real defect on the site before this branch.

### 1. Secondary text failed AA on the sand surface
Every ratio in the palette was measured against Cotton (#F5F0E6). Raw Silk is
close enough that the same values still pass on it. **Sand (#DED0B8) is not**,
and three sections set body copy on it. Measured on the rendered page:

| Token | On sand | Needed |
| --- | --- | --- |
| stone | 4.28 | 4.5 |
| vermilion-deep | 4.16 | 4.5 |
| needle | 4.48 | 4.5 |
| zari-deep | 4.31 | 4.5 |

Fixed the way `.on-carbon` already works: the surface re-points the secondary
tokens, so every utility and component inside it inherits a passing value and
**not one call site changed**. The `--color-line` hairline was also invisible
on sand at 1.07:1 and now takes a deeper thread grey.

A test asserts both halves — that the base values fail on sand, and that the
overrides pass — so the reason stays visible to whoever reads it next.

### 2. Heading hierarchy jumped H1 → H3 on `/student-work`
The gallery sat directly under the page title, so the first piece's `<h3>` was
the next heading on the page. Given a real section heading, which the page
wanted anyway.

### 3. Sixty pixels of horizontal overflow at 200% zoom
On every page. The header's brand refused to shrink (`shrink-0`), so at 200%
the language toggle and the menu button were pushed past the edge — a WCAG
1.4.10 failure, and one a viewport media query cannot catch, because at 200%
on a 1280 screen the viewport is still 640 CSS px and a `max-width: 379px`
rule never fires.

Fixed with a **container query** on the header row, which asks the right
question — is this row short of space? — and, with the threshold in `rem`,
scales with the user's text size. Verified: tail shown at 390 and 1280, hidden
at 320 and at 200%, zero overflow in all four.

That fix then squeezed the wordmark against the first nav item at exactly
1280, where eight nav items leave nothing spare. The nav now yields space
before the brand does, with a gap the flex row cannot collapse.

### 4. YouTube titles were being silently clipped
Titles come from the feed and contain handles like `@karma_designstudio` —
unbreakable tokens that overflowed the card and were cut off by
`overflow: hidden` at large text sizes. Added `.u-break` for any string the
studio did not write.

### 5. 36.8KB of font on every page, to draw an arrow and five stars
The full `@fontsource-variable/noto-sans-gujarati` import ships a `symbols`
(14.5KB) and a `math` (22.3KB) subset whose `unicode-range` claims
U+2190–2199 and U+25A0–27BF. Manrope does not cover those codepoints, so the
browser fell through the stack to Noto and downloaded both files — on English
pages as well as Gujarati ones — to render `→` and `★★★★★`.

Replaced with a hand-written `@font-face` restricted to the Gujarati block.
Font requests fell **5 files → 3**; payload **208KB → 172KB** on `/en` and
**201KB → 134KB** on `/gu`. Gujarati rendering verified against a metric probe
and by eye. Arrows and stars now fall through to the system font, which has
had them for thirty years.

### 6. The brief form announced errors by appearing
`role="alert"` on a node inserted into the DOM is announced by most screen
readers most of the time; a region already present and then filled is
announced reliably by all of them. Now a persistent live region, plus
`aria-busy` and a polite status while submitting.

### Prepared, not yet needed
`<ManagedPhoto>` gained `priority` and `sizes` so the one true LCP image can
be marked when the studio shoot lands — with a note that marking several
defeats the purpose. The file now also records **why it is a bare `<img>` and
not `next/image`**: Content Desk paths are runtime data, `next/image` needs
its hosts at build time, and what it would buy is already covered by hand
(aspect-ratio reserved boxes, lazy below the fold, format chosen at upload).

### Verified clean
- **Structure:** 15 routes — one `<h1>` each, no heading jumps, one `<main>`,
  no unlabelled control, no missing `alt`, no empty `href`, no stray `<li>`
  or `<dt>`.
- **Contrast:** every rendered text node on six routes in both locales.
- **Keyboard:** 25 tab stops on the homepage, every one with a visible ring.
- **Reduced motion:** zero hidden elements, zero running animations.
- **Responsive:** **209 page/width combinations** — 19 routes × 320, 360, 375,
  390, 430, 768, 820, 1024, 1280, 1440, 1920 — zero horizontal overflow, zero
  sub-24px non-inline targets, zero clipped text, no bar covering the footer.
- **Performance:** LCP 116–928ms against a 2500ms target; CLS 0–0.035;
  **zero third-party requests** on any page.
- **Forms:** every field labelled, phone fields on `tel`, live regions present.
- **Admin:** no public chrome, no tab bar, no bottom padding, no overflow at
  390 or 1280. Nothing was redesigned.

### Tests (`tests/hardening.test.ts`, 15 new — 270 total)
Contrast on all three surfaces including the deliberate failure; reduced-motion
coverage of every animated primitive; no scroll-snap, autoplay, video or audio
anywhere; `.u-break` present and used; the container query rather than a
viewport query; the Gujarati font restricted by unicode-range; `font-display:
swap`; shell CSS scoped away from the console; live regions and `aria-invalid`
on both forms; and no iframe, GTM, Facebook or Instagram script in the tree.

---

# PHASE 10 OF 10 — Final Whole-Site Creative Polish

## Goal

Perform a senior creative-director + product-design + front-end audit of the completed public product.

Do not start by blindly coding. First inspect every public route and both locales.

## Audit routes

At minimum:

- `/`
- `/courses`
- all 11 course detail pages
- `/admissions`
- `/admission`
- `/student-work`
- `/success-stories`
- `/services`
- `/about`
- `/contact`
- Machine Notes index
- Machine Note details
- `/privacy`
- `/terms`
- `/verify`
- 404/error/loading states

Also smoke-test `/admin` for regressions.

## Remove anything that still feels

- generic
- repeated
- template-like
- over-carded
- over-written
- visually inconsistent
- awkward in Gujarati
- gratuitously animated
- disconnected from commercial embroidery

## Final creative pass

Improve where useful:

- section pacing
- asymmetry
- typography
- dark/light rhythm
- stitch-path continuity
- machine-floor visual language
- textile/material detail
- proof hierarchy
- CTA placement
- course scanning
- local voice
- mobile confidence

Do not add decoration just because a page has empty space.

Use technical substance as the visual.

## Copy pass

Tone:

- direct
- technical
- practical
- commercial
- warm
- Surat-local
- confident

Avoid generic phrases such as:

- unlock your creativity
- embark on your journey
- world-class
- best-in-class
- transform your passion

Prefer concrete language such as:

**Set it. Test it. Correct it. Stitch it.**

Review Gujarati for meaning/naturalness, not literal word-for-word parity.

## Sample-content audit

Create a complete inventory in `docs/content-checklist.md` grouped as:

- SAMPLE — replace before domain launch
- OWNER CONFIRMATION NEEDED
- VERIFIED

Do not delete useful prototype content merely because it is sample; owner wants to review the complete visual system first.

But sample data must still be isolated from factual schema/SEO.

## Contact audit

Ensure consistency around:

- call number
- WhatsApp number
- address
- landmark
- Maps URL
- social links

If call/WhatsApp discrepancy remains unresolved, document it rather than guessing.

## Final documentation

Update:

- `docs/design-system.md`
- `docs/content-checklist.md`
- this file
- README if architecture materially changed

## Before custom-domain launch checklist

At Phase 10 completion, add a final section to this file listing only genuine remaining blockers such as:

- replace sample testimonials/reviews/stories
- real trainer names/photos
- real student work/media
- confirm course durations
- confirm fees
- confirm current batches
- confirm phone vs WhatsApp roles
- confirm exact opening hours
- real studio/teacher photography
- R2/private file activation if required
- Turnstile
- final custom-domain cutover

## Final engineering

Run full clean verification.

Fix all regressions.

Cloudflare preview/check must be green.

Merge the final PR without waiting for owner visual review.

Confirm production Workers build.

Do not connect the custom domain.

Then mark all phases complete.

---

# 7. Final launch philosophy

The end state should not merely be “a prettier institute website.”

It should make Karma recognisable as a commercial embroidery brand whose **visual language itself demonstrates the difference between a digital design and production-ready embroidery**.

The permanent spine is:

# FROM SCREEN TO STITCH.

**Design on screen. Prove it on the machine.**

Every major public decision should reinforce that promise:

- typography
- motion
- course architecture
- proof
- machine detail
- student outcomes
- studio services
- local SEO
- mobile conversion
- content strategy

The custom domain is connected only after the owner has reviewed the completed system and the sample/owner-confirmation checklist has been resolved enough for launch.
