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
| 2 | Homepage / 30-second decision | ⏳ Pending | |
| 3 | Courses / production-led detail pages | ⏳ Pending | |
| 4 | Proof ecosystem: work, stories, reviews, trainers | ⏳ Pending | |
| 5 | Mobile conversion / call / directions / demo | ⏳ Pending | |
| 6 | Studio / B2B commercial embroidery | ⏳ Pending | |
| 7 | Machine Notes / social-to-search content | ⏳ Pending | |
| 8 | Local SEO / structured data / measurement | ⏳ Pending | |
| 9 | Accessibility / performance / responsive hardening | ⏳ Pending | |
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
