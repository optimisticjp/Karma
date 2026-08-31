# KARMA — Modern Textile Lab Redesign
## Public experience, content architecture, navigation and multilingual rebuild

**Status:** AUTHORITATIVE OWNER-DIRECTED REDESIGN PLAN — pending implementation  
**Created:** 2026-08-31  
**Repository:** `optimisticjp/Karma`  
**Baseline:** `main` at `9cd82741d4c295db36dd6b8fae7d6798dd13d13e` after the compact-density redesign (PRs #43–#53)  
**Previous public systems:**  
- `docs/karma-machine-lab-redesign-master-plan.md` — Machine Lab, complete  
- `docs/karma-compact-density-redesign-plan.md` — light-first compact-density pass, complete  

This is the authoritative visual, information-architecture, public-navigation, multilingual and public-content direction for the next major redesign.

It **supersedes prior plans where they conflict about the public website’s aesthetic, homepage architecture, public navigation, public mobile conversion chrome, public locale set, visual hierarchy, public content grouping, public photography treatment and public page templates.**

It **does not supersede** architecture, authentication, authorization, database integrity, RLS, Hyperdrive, Supabase, audit, operational course facts, fee-agreement snapshots, archive/delete policy, print workflows, deployment, security, private-file rules or infrastructure decisions in `CLAUDE.md` and `docs/project-context.md`.

The Karma Console is **not** being redesigned again in this plan. Preserve the post-PR-#53 compact native-operations system. Public CSS changes must not regress it.

---

# 0. Read before touching code

Every implementation session must read, in order:

1. `CLAUDE.md`
2. `docs/project-context.md`
3. this file completely
4. `docs/design-system.md`
5. `docs/karma-compact-density-redesign-plan.md`
6. `docs/karma-machine-lab-redesign-master-plan.md`
7. `docs/content-checklist.md`
8. `docs/admin-architecture.md`
9. `docs/security.md`
10. `docs/operations.md`
11. `src/content/course-operations.ts`
12. `src/content/admission-terms.ts`
13. `src/content/photo-manifest.ts`
14. the actual current route/component/content code for the phase

Current code wins over stale documentation. If a doc is stale, fix it in the same PR.

Use the vendored `.claude/skills/` library selectively. Particularly relevant skill areas:

- frontend design
- UI/UX
- mobile product design
- responsive design
- design systems
- accessibility
- copy / humanization
- multilingual UX
- forms
- SEO
- structured data
- testing / TDD
- code review
- performance
- context engineering
- Spec Kit only when the subsystem genuinely benefits

Do not initialize shadcn/ui. Do not add a generic component system, chart library or animation framework simply because a skill mentions one.

---

# 1. Why this redesign exists

The current product is technically strong and carefully built, but the public site still behaves too much like a long technical/editorial case study.

The next public experience must shift from:

> **lots of explanation + lots of sections + technical background treatment**

to:

> **real work + clear decisions + compact hierarchy + creative niche-specific details**

The strongest existing idea remains:

# FROM SCREEN TO STITCH.

**Design on screen. Prove it on the machine.**

Keep the philosophy. Rebuild the visual execution.

The finished public site should feel like a modern creative production studio where:

**craft + machine precision**

meet naturally.

It must not feel like:

- a traditional handicraft site
- a generic coaching institute
- a futuristic SaaS product
- a fashion-school template
- a machine manufacturer
- a generic beige “premium” website
- an AI-generated agency concept

The immediate message must be:

> **Real embroidery. Real machines. Real commercial skills.**

---

# 2. Product/audience model

The site serves four visitor modes:

## 2.1 Beginner / student

Questions:

- Can I learn from zero?
- How long?
- Which batch?
- How much?
- Can I try before joining?

## 2.2 Existing operator / digitizer / embroidery designer

Questions:

- Can Karma help with the actual production problem I have?
- Does it teach the machine/software workflow I need?
- Can I improve troubleshooting and output?

## 2.3 Tailor / boutique owner / entrepreneur

Questions:

- Can this skill help me add embroidery capability?
- Can I improve production quality?
- Can I understand digital-to-machine workflow?

Do **not** turn this into an earnings promise.

## 2.4 Garment/business customer

Questions:

- Can Karma digitize/design/correct commercial embroidery work for me?
- What is the workflow?
- How do I send a brief?

The homepage must stop making all four audiences consume all content in sequence.

---

# 3. New audience routing

Near the top of the homepage add a compact routing module:

### I want to learn
Courses · demo · batches

### I already work in embroidery
Advanced techniques · Machine Notes · troubleshooting

### I need design / production work
Services · digitising · commercial enquiry

Desktop:
- compact three-column or asymmetric route chooser
- no giant cards

Mobile:
- compact horizontal cards or a three-item segmented route chooser
- one clear destination per item
- no long explanatory copy

This module exists to shorten the visitor’s path, not to add another section for decoration.

---

# 4. Owner decisions introduced by this plan

The following are new owner-directed product decisions and supersede older public-UX rules where necessary.

## 4.1 Public site becomes trilingual

Public locales become:

- English — `en`
- Gujarati — `gu`
- Hindi — `hi`

This supersedes the previous bilingual-only public routing rule.

Requirements:

- always-prefixed locale URLs remain
- default locale stays English unless separately changed by the owner
- browser-language auto-detection remains off
- explicit user choice may be remembered
- language switching preserves the current route when an equivalent route exists
- correct `<html lang="">`
- correct hreflang for all indexable public pages
- sitemap parity across all three locales
- no country flags
- navigation itself is translated
- Gujarati remains native-script first-class
- Hindi uses natural Devanagari Hindi with familiar trade terms left in English where appropriate

Karma teaches in Gujarati and Hindi; adding a Hindi website locale does not imply a new teaching claim.

## 4.2 New public Batches route

Create a top-level public `/[locale]/batches` decision page.

It must use real batch data only.

Do not fabricate:

- start dates
- seats
- trainer assignment
- weekend batches
- language-per-batch
- availability

If the database has no current batch rows, show an honest empty state and lead to demo/contact.

Keep `/admissions` for admissions information/norms unless current route architecture strongly supports a clearer redirect/relationship. Do not silently remove working URLs.

## 4.3 Contextual sticky conversion bar

The current site-wide fixed `Call + Directions` mobile conversion rule is superseded.

High-intent pages should use:

**Book free demo | WhatsApp**

on:
- course detail pages
- `/admission`
- `/batches`
- `/admissions` where appropriate

General information pages should not automatically carry a large fixed bottom bar if the actions are already obvious.

Call and Directions remain prominent on Contact/Visit and in the site shell/menu/footer.

## 4.4 One controlled business-mode dark surface

The site remains predominantly warm/light.

One deliberate exception is allowed:

- the top hero of `/services`

It may use Deep Charcoal (`#202321`) as a clear “commercial studio mode” switch.

Do not reintroduce dark bands across the rest of the site.

---

# 5. Factual guardrails — do not let design invent the business

This plan contains design recommendations. They are **not permission to invent facts**.

## 5.1 EMCAD DAHAO

Verified:

- EMCAD DAHAO is the only embroidery-design software Karma teaches
- 3 months
- ₹35,000 total
- ₹25,000 at admission
- ₹10,000 within one month of joining
- four timetable options
- 2-day free demo
- 2-hour demo session
- 100% live practical machine training
- verified curriculum/practical list already in source

Do not apply these figures to any other course.

## 5.2 Other ten courses

Still unknown unless current repo facts say otherwise:

- duration
- fees
- exact module list
- current live batch availability

Never invent them for a card layout.

## 5.3 “Small batches”

The supplied design recommendation mentioned “Small batches.”

This is **not currently a verified public fact**.

Do not publish it unless the owner confirms a real batch-size policy.

Use verified alternatives in “Why Karma”:

- Live machine practical
- EMCAD DAHAO specialist training
- Gujarati + Hindi teaching support
- Production troubleshooting / practical output knowledge

## 5.4 Reviews / rating

Do not fabricate reviews.

Do not invent a review count.

Do not emit `AggregateRating`.

Use:
- real owner-approved reviews when supplied
- existing sample policy until then
- an honest pending/proof state rather than fake social proof

The owner-provided Google figure remains governed by `docs/content-checklist.md`.

## 5.5 Current batches and seats

Every “current batch”, “date”, “seat”, “trainer” or availability statement must come from real operational data.

Filters should be generated from data that actually exists.

For example, do not show a Weekend chip if no current weekend data exists.

## 5.6 B2B files

R2 is still deferred.

Do not add a public file uploader.

Do not present a dead upload control.

The Services/brief flow should clearly use the existing brief + WhatsApp/manual handoff until private storage is separately activated.

## 5.7 Timing conflict

The unresolved `10:30 pm` versus EMCAD `23:00` last-slot conflict remains unresolved.

Do not “average” the two.

Do not silently rewrite one.

Contact/batch copy must stay factually cautious until the owner resolves it.

---

# 6. Modern Textile Lab visual direction

The visual concept is:

# MODERN TEXTILE LAB

It sits between:

**craft + machine precision**

The design should feel creative and tactile without becoming decorative craft styling.

The public site should instantly communicate:

- real textile material
- industrial machinery
- digital vector work
- practical learning
- commercial output
- Surat production reality

The visual system should be simpler than the current technical-manual treatment.

---

# 7. Public palette

Build a public-scoped palette.

Do not retune shared global tokens in a way that restyles Karma Console.

Prefer a public-only stylesheet/scope imported only by the locale layout.

## Canvas
`#F7F4EE`

Warm off-white.

Primary public canvas.

## Paper
`#FFFFFF`

Forms, cards, important content, image mats.

## Ink
`#171918`

Primary text and strong linework.

## Muted Ink
approximately `#666864`

Secondary copy.

## Thread Red
approximately `#D44B35`

Primary CTA / active stitch / key path.

It is the action accent.

## Warm Sand
approximately `#E9E1D5`

Secondary material surface.

## Deep Charcoal
approximately `#202321`

Only for controlled business-mode moments, principally the Services hero.

## 60 / 30 / 10 principle

Use neutrals for most of the experience.

Use secondary material surfaces for depth.

Keep the accent controlled enough that it retains meaning.

Do not make “embroidery” an excuse for a rainbow UI.

Photography supplies colour.

---

# 8. Texture

Texture remains, but only in controlled moments.

Good:

- faint fabric weave behind a finished embroidery proof
- subtle CAD dot-grid behind an EMCAD visual
- stitch perforations along a divider
- tiny paper/fabric grain on a hero object
- subtle technical annotation layer

Bad:

- graph-paper texture across whole pages
- repeating weave behind long body copy
- every section carrying its own visual texture
- decorative noise that competes with photography

Texture should be noticed after the content, not before it.

---

# 9. Visual identity from the business

Build/retain a small visual language directly from embroidery and digitising:

- stitch paths
- vector anchor points
- thread spool
- bobbin
- needle
- machine head
- hoop/frame
- fabric swatches
- stitch-density diagram motifs
- thread-tension graphics
- machine-frame outlines
- CAD node patterns
- screen-to-fabric transitions
- registration marks
- technique signatures

Existing Karma Stitch icons and technique signatures should be reused where they fit.

Do not redraw working niche primitives merely to rename the design system.

Universal actions stay universal:

- phone
- location
- search
- menu
- back
- print
- edit
- delete
- arrow

The site should remain recognizable as Karma without the logo.

---

# 10. Photography

Photography becomes the dominant emotional layer when the real files arrive.

Target final visual mix:

- ~70% real photography
- ~20% technical diagrams / annotations
- ~10% icons / decorative motion

## 10.1 Preserve the final 32-shot architecture

The existing manifest remains authoritative.

Expected:
- 32
- filled today: 0 until files arrive

Do not add stock or generated Karma photography.

Do not invent new mandatory photo slots during this redesign.

Do not activate R2 for these public images merely because they exist.

## 10.2 Art-direction priorities within the 32 real shots

When mapping and cropping the actual files, favour the brief’s real subjects that support:

- EMCAD screen / design path
- needle/machine stitching
- finished embroidery
- trainer at actual station
- student at workstation
- studio floor
- machine stations
- student work
- screen + result relationships
- technique macros
- exterior/wayfinding

The more ambitious suggested shot ideas (bobbin macro, failed-vs-corrected, extra hand close-ups, etc.) are **future optional art direction**, not a reason to create unbriefed placeholders now.

## 10.3 Placeholder rule

Until real files arrive:

- keep named, honest placeholders
- preserve aspect ratio
- no “Image Not Found”
- no stock
- no image from another studio
- no fake student/trainer face
- no duplicate course image standing in for another

---

# 11. Typography

Typography becomes simpler and more human.

Do not return to tiny technical-manual labels everywhere.

Do not swing to huge AI-landing-page type.

## English
Clean modern sans — continue Manrope unless a measured reason to change exists.

## Gujarati
Continue Noto Sans Gujarati.

Never uppercase or letterspace Gujarati.

## Hindi
Add a strong Devanagari font, preferably Noto Sans Devanagari or an equally appropriate native-script sans.

Do not force Hindi through a Latin-first display face.

## Starting mobile scale

- H1: 32–38px
- H2: 24–28px
- H3: 18–21px
- Body: 15–16px
- Metadata: 12–13px
- Buttons: 14–15px

## Starting desktop scale

- H1: roughly 52–64px
- H2: 34–42px
- H3: 22–26px

Use fluid `clamp()` carefully.

Preserve browser zoom/accessibility.

Do not choose independent random sizes page-by-page.

A coherent type scale is required.

---

# 12. Navigation redesign

Redesign the public navigation from scratch.

## Desktop primary navigation

Target:

- Courses
- Batches
- Student Work
- Machine Notes
- Services
- Studio

Then:
- language control
- Book Free Demo

“Studio” may route to `/about` if that remains the canonical studio/about route.

Contact does not need prime desktop navigation if it is prominent in:
- mobile menu
- footer
- Studio/Visit pathways
- persistent contact surfaces

If width cannot support this cleanly, use a controlled More menu rather than squeezing text.

## Mobile header

Target height around 56px.

Structure:

**Logo | language | menu**

The visible menu/language icons may be small, but interactive hit areas remain ~44–48px.

Do not shrink the desktop nav into a crowded mobile row.

## Mobile menu

Dedicated mobile navigation:

- Courses
- Batches
- Student Work
- Machine Notes
- Services
- Studio
- Contact

Each row approximately 48–52px.

Bottom of menu:

**Book Free Demo**

No text collision.
No nested micro-dropdowns.
No duplicate navigation systems fighting for the same space.

---

# 13. Language selector

The language selector becomes a designed feature.

Never use flags.

## Desktop

Compact globe/current-language control:

`◎ EN ▾`

Popover choices:

- English
- ગુજરાતી
- हिन्दी

## Mobile

Language control remains directly in the header.

Tap opens a bottom sheet with large choices.

Each choice should include a short native-script preview.

Example intent:

**English**
Screen to stitch

**ગુજરાતી**
localized preview

**हिन्दी**
localized preview

## Technical requirements

- preserve current route where possible
- explicit choice can be persisted
- no browser auto-detect redirect
- correct `lang`
- correct hreflang
- translated navigation
- locale-aware metadata
- route parity
- no page silently falling back to English text inside Gujarati/Hindi UI
- locale tests must mechanically enforce parity

---

# 14. Homepage — reduce to roughly eight purposeful sections

The current public homepage is too long for its job.

It should answer:

1. What is Karma?
2. What can I learn?
3. Why should I trust you?
4. What will I actually make?
5. How do I start?

The homepage should no longer carry every possible content module.

Move deep explanation into dedicated routes.

Target approximately **8 purposeful sections**, not 19.

---

# 15. Homepage A — compact hero

Desktop:

- asymmetric 55/45 or 60/40 composition
- no giant centered text block

Left:

# From screen to stitch.

One concise two-line explanation.

Compact verified facts:

- EMCAD DAHAO
- Live machines
- Mota Varachha
- 2-day free demo — clearly scoped to EMCAD if proximity could imply otherwise

Primary:
**Book free demo**

Secondary:
**Explore courses**

Right:

One strong Screen → Machine → Result visual composition.

Do not render three giant stacked boxes.

Use the existing three relevant photo slots/placeholders as one designed system.

## Mobile first viewport

At about 390×844, aim to show:

- compact header
- headline
- 2–3 lines support
- 2×2 quick facts
- CTA
- meaningful portion of the signature visual

A user should understand the offer before scrolling a second screen.

---

# 16. Homepage B — “What are you here for?”

Use the audience routing from §3.

This section should replace several generic explanatory sections.

Keep it concise.

---

# 17. Homepage C — course explorer

Do **not** list all eleven courses vertically on the homepage.

The full catalogue remains on `/courses`.

Homepage course explorer uses categories such as:

- Machine
- Special Techniques
- Software

Use actual current course-family data; do not invent a classification that conflicts with source.

Show 3–4 useful items per current category state, based on canonical display order — not an invented popularity claim.

CTA:

**Explore all 11 techniques**

Mobile:
- horizontal tabs/chips
- compact list-card hybrid or horizontal course cards
- no full-screen cards

All eleven courses remain in the product.

---

# 18. Homepage D — signature Screen → Machine → Stitch

This remains one of the memorable experiences.

One real project eventually drives three states:

### 01 Screen
EMCAD path / design

### 02 Machine
production

### 03 Stitch
finished textile

Desktop:
- controlled tab/scrubber/rail
- no autoplay required
- no scroll hijacking

Mobile:
- swipeable/scroll-snap frames or compact vertical sequence
- must work without precision dragging
- every state remains accessible with reduced motion and without JavaScript where practical

Until photos arrive, use the corresponding manifest placeholders.

This is proof, not explanation.

---

# 19. Homepage E — student work

Show a compact selection of up to six real/placeholder work examples.

Photography leads.

Minimal text.

Technique filter only if it remains useful at this small set.

CTA:

**See all student work**

Do not use fake student names or outcomes.

---

# 20. Homepage F — Why Karma

Use four short, concrete, verified points.

Preferred verified set:

- Train on real production machines
- EMCAD DAHAO specialist training
- Gujarati + Hindi teaching support
- Production troubleshooting and practical output

Do not publish “small batches” until confirmed.

No generic benefit cards.

---

# 21. Homepage G — current batches + free demo

This section is live-data driven.

Show upcoming/current batch rows only when real data exists.

Useful fields when present:

- course
- date/start
- time
- seats/availability
- language/trainer only if actually stored and verified

Do not fabricate missing fields.

If there are no live batches:

- honest empty state
- Book Free Demo
- Call / WhatsApp to ask

Do not show fake fallback batch inventory.

---

# 22. Homepage H — studio proof, FAQ, conversion close

Combine trust/visit/reviews efficiently instead of adding several long sections.

## Studio proof

Use real studio placeholders/photos.

## Reviews

Only real owner-approved reviews.

If real reviews are unavailable, omit the review carousel or show an honest pending state.

Do not create fake review cards.

## FAQ

Compact accordion.

## Final conversion

Short CTA:

- Book Free Demo
- Call / WhatsApp / Directions as appropriate

No long marketing essay.

---

# 23. Courses index

Treat `/courses` like a product catalogue.

Top:

**Find the skill you want to learn**

Filter chips based on real taxonomy:

- All
- Machine Embroidery
- Special Techniques
- Software

Use the actual current families/tags; naming may be adjusted to source truth.

Each item should show only useful decision information:

- image/signature
- course name
- family
- duration only if verified
- learning mode only if verified/general
- one concise outcome
- CTA

Do not repeat paragraphs.

Do not invent a fee/duration to make the card look complete.

Mobile:
- dense list-card hybrid
- compact image or technique signature
- no enormous 16:9 card stack

---

# 24. Course detail pages

Decision information belongs above the fold.

Within the first mobile viewport aim to expose:

- course title
- technique/software identity
- duration if verified
- software/machine fact if verified
- practice mode
- teaching-language context
- current batch if real
- demo availability if verified
- fee if verified, otherwise truthful existing deferral
- location
- primary CTA

Primary:
**Book free demo**

Secondary:
**WhatsApp about this course**

## Sticky/scrollable section navigation

Use:

- Overview
- What you'll learn
- Syllabus
- Machine practice
- Student work
- Batches
- Fees
- FAQ

Only render tabs for content that exists.

Mobile:
- horizontally scrollable sticky tab rail
- no blind long scroll
- sticky bar must not obscure anchor targets

Keep course pages production-led, not syllabus-first.

---

# 25. Public Batches page

Create `/[locale]/batches`.

Headline:

**Choose a batch that fits your day**

Filters may include, only when represented by real data:

- Morning
- Afternoon
- Evening
- Weekend
- Course

Each live row/card may display:

- course
- start date
- days
- timing
- available seats
- trainer
- language

Only fields with actual data are shown.

Then the simple admission sequence:

1. Book free demo
2. Visit and use the machine
3. Choose course and batch
4. Join

Admission/fee norms remain below in compact disclosure.

No giant marketing section.

---

# 26. Admission / admissions experience

Keep the working secure multi-step form.

Visually simplify it.

- short step header
- compact stitch progress
- grouped fields
- no giant card around every step
- sticky/reachable Next/Submit
- full terms accessible without turning the whole form into one page of legal copy

Do not weaken:
- guardian phone requirement
- honeypot
- minimum-time defense
- idempotency
- rate limits
- validation
- terms versioning
- audit/security rules
- Turnstile-ready path

Turnstile remains deferred unless separately activated.

---

# 27. Student Work

This should become one of the strongest visual routes.

Use an editorial masonry-like gallery that respects real image aspect ratios.

Filters may include actual techniques:

- All
- Zardosi
- Beads
- Sequence
- Appliqué
- Laser
- Tufting
- EMCAD

Only categories backed by real items should appear.

Mobile:
- two-column visual grid when image widths/legibility permit
- otherwise one-plus-small asymmetric layouts

Tap/open detail sheet or route:

**screen design → machine setup → finished result**

Metadata is conditional:

- student — only with consent/verified identity
- technique
- machine — only when known
- level — only when real
- what they learned — only when sourced

Do not invent missing metadata.

---

# 28. Machine Notes — knowledge hub

Keep Machine Notes as technical authority, not a generic blog.

Evolve the index into a compact searchable/filterable knowledge hub.

Useful card/index metadata:

- type/problem
- technique
- issue
- short cause/fix framing where supported by the actual note
- computed reading time
- machine/software category when real

Possible conceptual types include:
- Problem
- Cause
- Fix

Do **not** invent new technical notes just to populate categories.

Work with the existing verified note set unless new owner-approved/trade-knowledge content is deliberately added.

Useful filters:

- search
- technique/category chips

No dates/bylines unless they serve a real purpose.

No fake RPM/GSM/stitch-density values.

No SEO-targeted claim that Karma teaches Wilcom.

---

# 29. Services — business mode

`/services` gets a distinct commercial mode.

This is the one public page allowed a major Deep Charcoal hero.

Headline direction:

> **Need designs, digitising or production work?**

Show the commercial workflow clearly.

For each service:

- what the client sends
- what Karma does
- what the client receives
- workflow
- example output when real

Primary CTA:

**Send a design brief**

Secondary:

**Send on WhatsApp**

No public file uploader while R2/private storage is deferred.

Do not invent:
- turnaround
- file formats
- price
- capacity

The rest of the page returns to the normal light system.

---

# 30. Studio / About

Do not use generic “faculty” cards.

The page should eventually show:

- real founder/studio story
- actual trainers
- actual machine floor
- how classes run
- teaching languages
- practical approach
- software used
- why production machines matter

Until identities/photos/story are supplied:

- keep honest placeholders/pending blocks
- do not invent biographies
- do not invent years of experience

Desktop may use one sticky/pinned storytelling visual.

Mobile must stack normally; no scroll hijack/pinned trap.

---

# 31. Contact / Visit

First phone viewport should prioritize:

# Visit Karma Design Studio

Then:

- address
- current truthful hours statement
- Call
- WhatsApp
- Directions

Then map/wayfinding.

Do not show a computed “today’s hours” until the opening-hours conflict is resolved accurately.

Add a compact “What happens on your first visit” sequence:

1. Arrive / message first
2. See the machines
3. Try the demo
4. Choose later

Keep enquiry/contact form extremely short.

---

# 32. Contextual mobile sticky action bar

On course/admission/batch decision pages:

**Book free demo | WhatsApp**

Target height about 56–60px including safe area treatment.

Rules:

- clear hierarchy
- not on every page merely because component exists
- does not cover content
- anchors/focus states account for sticky chrome
- respects permission-free public routes
- uses the correct WhatsApp number from central site config
- analytics events contain no PII

---

# 33. Motion

Animation must come from embroidery, not generic landing-page motion.

## Hero
Thread traces one design path once.

## Screen-to-Stitch
CAD path transitions into stitched texture/state.

## Course items
Tiny stitch line along edge/title on hover/focus.

## Buttons
Arrow movement approximately 2–3px.

## Gallery
Very small image scale (~1.02) on hover-capable devices.

## Menu
Controlled 220–280ms slide/fade.

## Machine Notes
Annotations may reveal after primary content.

Never:

- cursor followers
- floating blobs
- constant parallax
- infinite marquees
- glowing cards
- scroll hijacking
- animation merely because a library exists
- loops that compete with the work

Respect `prefers-reduced-motion`.

No animation should hide content if it fails.

---

# 34. Responsive compactness

Develop from **390px outward**, then verify smaller and larger widths.

## Mobile

- approximately 16px gutters
- section spacing generally 32–48px
- card padding generally 12–16px
- avoid cards consuming an entire viewport
- use 2-column facts
- horizontal chips
- compact list cards
- accordions
- tabs
- bottom sheets
- 2-column visual galleries when appropriate
- minimum useful tap target ~44–48px for primary controls

## Tablet

Tablet gets a deliberate composition.

Use:
- 2-column cards
- 60/40 splits
- 3-column gallery where content supports it
- expanded nav only when it genuinely fits

Do not treat tablet as “mobile but wider.”

## Desktop

- content width around 1180–1240px unless a specific media composition earns wider
- more asymmetry
- more image/text pairings
- richer visible metadata
- no arbitrary enlargement merely because space exists

Required final widths:

- 320
- 360
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1440

All public locales must be measured.

---

# 35. Content and trust cleanup

Do a real crawl of the current Workers.dev build.

Do **not** use the old `karmadesignstudio.in` template site as a factual source.

Before calling the redesign complete:

- no accidental broken images
- no accidental `Image Not Found`
- no template leftovers
- no broken internal links
- no missing legal routes
- no duplicate contradictory course facts
- no old template email
- contact details from central config only
- no unsupported claims
- unique metadata
- course schema only with verified facts
- breadcrumbs on deep pages where appropriate
- LocalBusiness/EducationalOrganization schema through the one approved schema module
- hreflang EN/GU/HI
- correct canonical URLs for the review host environment
- Terms/Privacy retain existing legal-review/noIndex rules until approved

**Important:** deliberate named PhotoSlots are not “broken placeholders.” Preserve them until real images arrive.

---

# 36. Backend/content architecture

Do not rebuild working infrastructure for aesthetic reasons.

## Courses

Karma already has central course and operational sources.

Use those rather than creating a second truth.

Audit duplication across:
- homepage
- courses index
- course detail
- admission
- batches
- SEO/schema

Consolidate only where necessary.

## Batches

Use the actual database/queries for public live batch data.

No demo inventory system unless the institute actually manages inventory.

## Student work / notes / stories / trainers / services

Keep shared IDs and central sources.

Do not build three disconnected locale sites.

## Trilingual source model

Adding Hindi must be typed and coherent.

Avoid a wave of ad-hoc untranslated literals.

Prefer a reusable localized-content shape/helper where practical, while preserving stable IDs/slugs.

Do not rename public slugs merely because display copy changed.

Content Desk JSONB may be extended for Hindi where needed without forcing a relational migration solely for translation fields if typed validation can handle it safely.

If a schema migration becomes genuinely necessary, generate a new additive Drizzle migration; never edit 0000–0004.

## Free-tier discipline

Audit:
- N+1 queries
- unbounded lists
- duplicate requests
- client fetching that could be server-rendered
- unnecessary hydration
- image payload
- locale bundle growth

Do not optimize by guessing. Measure.

---

# 37. Visual component system

Before page-by-page work, establish/revise the public component set.

Target reusable components/roles:

- `Header`
- `MobileMenu`
- `LanguageSheet`
- `QuickFact`
- `PrimaryButton`
- `SecondaryButton`
- `CourseCard`
- `CourseListRow`
- `CategoryTabs`
- `BatchCard` / batch row
- `StudentWorkCard`
- `ScreenToStitch`
- `MachineNoteCard`
- `ReviewCard` only for real reviews
- `StudioPhoto`
- `FAQAccordion`
- `StickyActionBar`
- `Breadcrumbs`
- `SectionIntro`
- `ThreadDivider`
- `Footer`

Reuse existing primitives where they already satisfy the role.

Do not duplicate a working component merely to match a name in this plan.

New public styling should be scoped so Karma Console does not inherit it accidentally.

---

# 38. Screenshot/browser audit requirement

Before changing visual code:

Capture the current deployed/production-build version of every public route template at:

- 390
- 768
- 1024
- 1440

At minimum:
- EN
- GU
- HI once Hindi exists

After each major route phase, repeat the relevant screenshots.

For final hardening, run a full rendered-browser matrix at all required widths.

Prefer actual Chromium measurements over source-code assumptions.

Browser tooling must not be committed as a dependency merely for this audit if it can be run externally/outside the package, as the prior compact-density pass successfully did.

Measure:

- overflow
- clipping
- sticky overlap
- focus visibility
- tap target size
- heading heights
- first-viewport usefulness
- route height
- locale height differences
- image/placeholder aspect ratios

---

# 39. Homepage editorial budget

The previous compact-density pass correctly concluded that homepage length can no longer be meaningfully reduced by shaving padding.

This plan makes the editorial decision:

**Reduce the homepage from the current ~19 sections to roughly 8 purposeful sections.**

Do not preserve an old section merely because it exists.

Deep content should move to:
- Courses
- Batches
- Student Work
- Machine Notes
- Services
- Studio/About
- Contact

The homepage is a router/decision/proof surface, not the entire website concatenated.

---

# 40. SEO and discoverability

Keep the SEO architecture factual.

Required:

- EN/GU/HI hreflang
- locale-aware titles/descriptions
- breadcrumbs on deep pages
- Course schema only where verified
- `timeRequired` only for verified durations
- no prices/offers in schema unless policy permits and facts are verified
- no aggregate rating without verified count/data
- no review schema for sample content
- no trainer Person schema without real verified people
- LocalBusiness/EducationalOrganization through `src/lib/schema.ts`
- Machine Notes remain technical authority, not keyword-stuffed blog posts
- no Wilcom-training targeting
- page copy should use real search language naturally, not repetitive SEO blocks

---

# 41. Accessibility

Do not trade accessibility for visual cleanliness.

Required:

- WCAG-appropriate contrast
- visible focus
- logical heading order
- keyboard-operable menu, language sheet, tabs, accordions, galleries
- no information by colour alone
- tap targets appropriate to context
- `prefers-reduced-motion`
- locale/script-specific line heights
- Gujarati no uppercase/letterspacing
- Hindi Devanagari no Latin tracking assumptions
- sticky bars never cover focused/anchored content
- no hover-only essential action
- images have useful alt text once real
- placeholders describe the shot they await, not fake visual content

---

# 42. Performance

Do not solve the redesign by adding a stack of libraries.

Current Worker baseline is about 2026 KiB gzip against 3 MB.

Protect free-plan headroom.

Prefer:
- CSS
- existing primitives
- small targeted client components
- server rendering
- native `<details>`
- CSS scroll snap
- browser APIs where appropriate

Audit:
- bundle size
- font payload after Hindi font addition
- image strategy when real files arrive
- unnecessary hydration
- duplicated locale payload
- large serialized props

If a dependency is added, document why it is materially better than the native/current option and run Wrangler dry-run size measurement.

---

# 43. Infrastructure exclusions

Do not touch as a side effect:

- `karmadesignstudio.in`
- DNS
- Cloudflare custom-domain routing
- R2 activation
- Turnstile activation
- payment gateway
- UPI checkout
- Stripe
- Razorpay
- Supabase project
- Supabase Auth
- Hyperdrive architecture
- RLS policy model
- password-only console rule
- MFA/TOTP/AAL2
- deployment command
- private-file architecture

No manual production deploy.

Cloudflare remains Git-driven.

---

# 44. Karma Console preservation

The public redesign must not undo the compact Console.

Preserve:

- 52px compact app bar
- permission-aware bottom nav
- rows over giant panels
- current admin typography/density
- Today queues
- `/admin/batches`
- archive/restore/delete model
- Owner-only destructive deletion
- one Owner / five Admins
- print routes
- mobile bottom sheets/action menus
- current query optimizations

Public styling should not leak into `/admin`.

If shared global tokens need to change, either:
- prove the Console remains correct at all widths
- or scope the public visual system instead

Scoping is preferred.

---

# 45. Implementation phases

Execute one clean PR per phase unless two tiny adjacent phases are clearly safer together.

## Phase 1 — repository + rendered screenshot audit
**Status:** ✅ Complete — PR #55, merged as `b5edbf9`

Audit recorded in **`docs/modern-textile-lab-audit.md`**. Measured in Chromium
against a production build — 100 screenshots at 390/768/1024/1440 across 25
routes in both current locales, plus per-section geometry for every route.
Browser tooling stayed outside the package, as §38 requires.

Six findings change how later phases are implemented:

1. **The course taxonomy §17 asks for already exists.** `src/content/courses.ts`
   types `family: "machine" | "modern" | "software"` with `FAMILY_ORDER` and an
   owner-decided `COURSE_DISPLAY_ORDER` — 8 / 2 / 1 = 11. The homepage explorer
   reads that, so no classification is invented and "popular" never appears.
2. **`sampleBatches()` is the only fabricated batch data in the repository** —
   and the only `"Sat-Sun"` string, i.e. the fake weekend §5.5 forbids. It is
   already production-gated behind `demoModeAllowed`, so the new public route
   simply must not call it. `getUpcomingBatches()` already filters status, date
   and both archive flags in SQL before LIMIT.
3. **The bilingual assumption is 135 occurrences across 46 files**, in the shape
   `locale === "gu" ? x.nameGu : x.nameEn` — six of them Console files that must
   be excluded. Phase 4's real work is the typed localized-content accessor §36
   asks for, not a config change.
4. **The Gujarati `@font-face` `unicode-range` already claims `U+0951-0952` and
   `U+0964-0965`** — Devanagari-shared marks. Adding a Devanagari face without
   reconciling that range would give Hindi its danda from the Gujarati font.
5. **Homepage section padding is 4% of its 18,381px.** Twenty sections, and the
   measurement names the duplication precisely: four sections (3,816px) argue
   the machine claim, two show student work, two show the studio, and three
   render only `sample: true` content. §39's editorial cut is the only lever
   left, and this is where it falls.
6. **`.on-carbon` survives unused from the last redesign**, which makes the
   §4.4 Services charcoal hero a re-use rather than a re-implementation.

Also confirmed: **32 photo slots, 0 filled**; no horizontal overflow at any
width on any route; `globals.css` and `premium.css` are shared with Karma
Console, which is why Phase 3 scopes a fourth public-only stylesheet rather than
retuning shared tokens.

## Phase 2 — information architecture + public route/navigation model
**Status:** ✅ Complete — PR #56, merged as `PLACEHOLDER_MERGE`

The IA is recorded in **`docs/modern-textile-lab-ia.md`** — authoritative for
public routes, navigation and conversion chrome, and it supersedes the
public-navigation sections of the two previous plans.

**`/[locale]/batches` exists and is server-rendered.** It reads
`getUpcomingBatches()` directly — one query, no client fetch, no hydration, no
loading skeleton, because this page *is* about the batches where the homepage
teaser is a widget on an otherwise static page. `force-dynamic` verified: no
HTML is emitted for it at build, so every request queries live.

The rule the route is built on is *real rows or nothing*:

- it does not call `sampleBatches()` — the audit found that generator is the
  only `"Sat-Sun"` string in the repository, i.e. the fake weekend §5.5 forbids
  by name, along with fabricated seats, dates and per-batch language;
- every uncertain field renders conditionally — no `days`, no days line; no
  `language`, nothing said about language;
- **`seats` of 0 means "not tracked", not "full"**, so it renders no seat line
  rather than manufacturing "0 seats left" out of a null;
- the empty state offers demo, WhatsApp and a call instead of a fabricated
  batch, and the error state says the list could not be loaded rather than
  showing something possibly stale.

**The homepage map from 20 sections to 8** is in the IA doc §2, with each
removal named and its content's new home. Twelve sections leave: four that
argue the machine claim (3,816px between them), three that render only
`sample: true` content, and five that duplicate another section. Nothing
verified is lost — every fact moves to the page that owns it.

**Navigation** is defined in §4: six desktop links (Home drops — the wordmark
is the home link; Admissions and Contact move to the footer and mobile menu,
which §12 permits explicitly), a 56px mobile header of Logo | language | menu,
and a seven-row mobile menu with Book free demo anchored at the bottom.
Implementation lands in Phase 4; Phase 2 adds `/batches` to the existing header
and footer so the new route is reachable in every merged state.

**The contextual sticky CTA policy** is §6: Book free demo | WhatsApp on
`/courses/[slug]`, `/batches`, `/admissions`; the admission form keeps its own
`.form-nav` rather than stacking a second bar; `/contact` gets none, because a
fixed bar duplicating the three buttons already in its first viewport is chrome
covering content. The doc separates what the owner changed (which actions,
which routes) from the five contracts that survive verbatim — separate phone
roles, no PII, one token for height and reservation, 44px targets, and
actions-not-navigation.

**No URL is renamed or removed.** `/about` keeps its slug while displaying as
"Studio". `/admissions` and `/batches` both exist and neither redirects to the
other. The footer's `/admissions#batches` anchor — which pointed two thirds of
the way down another page — becomes a link to the route.

New suite: `tests/mtl-routes.test.ts` (15 assertions) covering the route map,
that nothing is renamed, sitemap parity, that **no public `href` points at a
route that does not exist**, the batches data contract, and the locale
routing contract. **809 tests pass.**

## Phase 3 — Modern Textile Lab design system
**Status:** ⏳ Pending

- public-scoped palette
- typography scale
- Hindi font
- texture rules
- buttons
- cards/rows
- tabs
- sheets
- section rhythm
- animation rules
- ensure no Console regression
- update `docs/design-system.md`

## Phase 4 — trilingual shell + navigation
**Status:** ⏳ Pending

- `hi` locale
- translated shell/navigation/footer
- language popover/sheet
- route-preserving locale switch
- persistence of explicit user choice
- hreflang/sitemap/meta parity
- dedicated mobile menu
- remove old shell patterns superseded by this plan

## Phase 5 — homepage rebuild
**Status:** ⏳ Pending

Implement the ~8-section homepage:

1. compact hero
2. audience routing
3. course explorer
4. Screen → Machine → Stitch
5. student work
6. Why Karma
7. live batches + demo
8. studio proof + FAQ + close

Do not preserve redundant sections merely to avoid deletion.

## Phase 6 — Courses + Course detail + Batches + Admission
**Status:** ⏳ Pending

- courses catalogue filters/list-card system
- all eleven courses
- decision-first course detail
- sticky content rail
- contextual sticky Demo + WhatsApp
- public Batches route
- data-driven filters
- compact admissions decision page/form
- no invented facts

## Phase 7 — Student Work + Machine Notes
**Status:** ⏳ Pending

- visual student-work gallery
- real/pending detail behavior
- filters from actual content
- Machine Notes search/filter knowledge hub
- computed reading time if useful
- preserve technical authority
- no invented articles/specs

## Phase 8 — Services + Studio/About + Contact + secondary pages
**Status:** ⏳ Pending

- controlled charcoal Services hero
- B2B workflow
- no upload
- Studio/About storytelling
- trainer/story placeholders remain honest
- Contact first-viewport redesign
- legal/verify/error/loading/404 harmonized with new public system
- footer final form

## Phase 9 — content architecture + copy + trust + SEO
**Status:** ⏳ Pending

- central-source audit
- remove user-facing duplication
- trilingual content parity
- rewrite generic copy
- preserve verified facts
- review/sample gates
- structured data
- breadcrumbs
- metadata
- live-batch query integrity
- no old-template facts

## Phase 10 — photography-ready art direction
**Status:** ⏳ Pending

Until files arrive:
- all 32 slots remain honest
- no stock/generated media
- no extra mandatory slots

Prepare:
- exact crop behavior
- aspect-ratio contracts
- responsive `sizes`
- alt-text workflow
- file naming
- future static-vs-R2 decision checklist
- OpenGraph plan for when real photography exists

Do not activate R2.

## Phase 11 — full responsive/accessibility/performance/creative hardening
**Status:** ⏳ Pending

Rendered-browser matrix:

- 320
- 360
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1440

All public locales.

Verify:
- no overflow/clipping
- useful first viewport
- keyboard/focus
- sticky chrome
- language parity
- reduced motion
- route height
- no accidental English fallback
- no Console regression
- Worker gzip
- no unexpected dependencies

Final creative-director question:

> Does this feel like someone spent time inside this specific studio, understood the machines, understood the students, understood EMCAD DAHAO, understood Gujarati/Hindi visitors, understood Surat garment businesses, and built the site around that reality?

Remove anything that still looks:
- template-like
- generic
- overdesigned
- repetitive
- unnecessarily large
- technically fake

---

# 46. Per-phase PR protocol

For every phase:

1. start from latest `main`
2. re-read the relevant current code
3. select only useful Claude skills
4. create feature branch
5. implement the complete phase
6. update this plan:
   - `⏳ Pending` → `✅ Complete`
   - PR number
   - merge commit
   - concise implementation record
7. update `docs/project-context.md` and specialist docs whenever product/architecture/design/locale facts change
8. run:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

9. run real browser checks relevant to the phase
10. if bundle-affecting, run Wrangler dry-run and record gzip
11. open PR
12. wait for GitHub CI + Cloudflare preview
13. merge only when both are green
14. continue immediately

Do not push directly to `main`.

Do not deploy by hand.

If the session stops, stop at a clean merged/PR boundary and leave this plan accurate.

---

# 47. Automated test expectations

Add/maintain tests for:

- all public locales EN/GU/HI
- route parity
- current route preserved by locale switch
- no flag language selector
- translated nav/footer
- no untranslated EN-only literal on GU/HI route where mechanical detection is possible
- all eleven courses retained
- only EMCAD duration/fee published as verified
- real-data-only batches
- no fake weekend/seat/trainer state
- no online payments
- no public file uploader
- no R2 use
- no Wilcom-training claim
- contextual sticky CTA route policy
- correct WhatsApp number
- no PII analytics
- review/sample policy
- 32 photo slots exactly
- no stock image host
- no generated-image substitution
- no dark public band except the Services business-mode hero/small allowed overlays
- public styles do not leak into Console
- Gujarati no uppercase/letterspacing
- Hindi Devanagari no inappropriate Latin tracking
- hreflang EN/GU/HI
- structured-data factual policy
- no broken public href
- reduced motion
- accessibility/focus contracts

Do not write brittle tests that ban honest words inside disclaimers. Test the claim/behavior.

---

# 48. What this plan deliberately does not decide

Still owner/content dependent:

- exact opening hours / 10:30 vs 23:00 conflict
- durations/fees for the other ten courses
- verified live batch inventory
- exact trainer identities
- student stories
- real reviews
- review count
- final legal Terms/Privacy approval
- B2B turnaround
- supported commercial file formats
- phone-role confirmation
- Google rating verification policy

Do not block visual implementation on these.

Design honest empty/pending states.

---

# 49. Success metrics

A mobile visitor from Instagram should understand within seconds:

- Karma teaches commercial embroidery
- EMCAD DAHAO is the software
- students work on real machines
- Karma is in Mota Varachha, Surat
- a free demo exists for EMCAD
- there are courses beyond software
- there is a real studio/business side

Within a short browse they should be able to:

- choose their audience path
- inspect courses
- see current real batches if any
- understand Screen → Machine → Stitch
- view real/pending student work
- reach demo/WhatsApp
- find the studio

The homepage should feel fast rather than encyclopedic.

The site should feel:

**specific**
**tactile**
**modern**
**credible**
**practical**
**commercial**
**mobile-first**

Premium must come from:

- photography
- precision
- typography
- interaction quality
- specificity

—not giant spacing or giant text.

---

# 50. Final report requirements

When all phases are merged, report:

1. every PR + merge commit
2. final `main` SHA
3. screenshot/browser audit findings before vs after
4. homepage section count and measured height
5. public navigation changes
6. Hindi locale implementation
7. language selector behavior
8. Courses/Batches architecture
9. course-detail changes
10. admission changes
11. Student Work changes
12. Machine Notes changes
13. Services business-mode changes
14. Studio/About/Contact changes
15. public component-system changes
16. backend/content consolidation
17. SEO/hreflang/schema changes
18. accessibility results
19. responsive matrix results
20. Worker gzip result
21. test count
22. Cloudflare/GitHub status
23. 32-photo placeholder status
24. exact remaining owner/content blockers
25. any measured reason a recommendation from this plan was adapted rather than implemented literally

Then stop.

---

# 51. Quality bar

The finished website must not feel like:

> “an AI redesigned an embroidery institute.”

It should feel like somebody spent time inside this specific studio, understood:

- the machines
- the students
- EMCAD DAHAO
- actual machine-output problems
- Gujarati/Hindi visitors
- Surat garment businesses
- the difference between learning software and proving output on a machine

and built the digital experience around that reality.

The final shift is:

**Current:** compact but still structurally descended from a long technical/editorial site.

**New:** real work + clear decisions + shorter architecture + Modern Textile Lab visual confidence + niche-specific interaction.

That is the redesign.
