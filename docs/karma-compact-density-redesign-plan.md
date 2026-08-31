# KARMA — Compact Density Redesign
## Light-first public site + native-app-density Karma Console

**Status:** AUTHORITATIVE OWNER-DIRECTED REDESIGN PLAN — pending implementation  
**Created:** 2026-08-31  
**Repository:** `optimisticjp/Karma`  
**Baseline:** `main` after PR #41 (`3640fafbf76b974b13e6ccf996fdb53b8d6f7855`)  
**Previous full redesign:** `docs/karma-machine-lab-redesign-master-plan.md` — phases 1–14 complete  

This document is the authoritative visual/UX direction for the next redesign pass.

It **supersedes the previous plan wherever there is a conflict about public background colour, layout density, typography scale, card size, section spacing, mobile information density, navigation density, admin composition or viewport economics**.

It does **not** supersede architecture, auth, permissions, database, factual-data, security, RLS, deployment, migration, audit, privacy, course-operation, print, archive/delete or infrastructure decisions in `CLAUDE.md` and `docs/project-context.md`.

The owner’s two new decisions are simple and non-negotiable:

1. **The public website must no longer rely on large black / near-black background sections.** The public experience becomes light-first, warm, technical and textile-led.
2. **Karma Console must become dramatically more compact and information-dense on mobile**, using the screen-efficiency principles of excellent native apps such as Swiggy as a reference for spacing, hierarchy, grouping and task access — never as a branding or layout copy.

The redesign goal is not “make everything smaller.”

The goal is:

> **Maximum useful information and functionality per viewport, with minimum visual waste.**

---

# 0. Read before implementation

Every implementation session must read, in order:

1. `CLAUDE.md`
2. `docs/project-context.md`
3. this file completely
4. `docs/design-system.md`
5. `docs/karma-machine-lab-redesign-master-plan.md`
6. `docs/content-checklist.md`
7. `docs/admin-architecture.md`
8. `docs/security.md`
9. `docs/operations.md`
10. the current code for the phase being changed

Current code wins over stale documentation. This plan wins over older **visual/density** rules when they conflict.

Use the vendored `.claude/skills/` library selectively. Particularly relevant areas are:

- frontend design
- UI/UX
- mobile product design
- accessibility
- responsive design
- design systems
- copy/humanization
- forms
- SEO
- testing/TDD
- code review
- performance
- context engineering

Do not initialize shadcn/ui, install a generic admin kit, add a chart library, add a design-system dependency, or replace Karma’s hand-built primitives just to achieve density.

---

# 1. Product understanding comes first

Before changing any UI, audit the current product and answer from the code, docs and routes:

- What is Karma Design Studio & Classes?
- Who is the primary public visitor?
- What are the top public conversion actions?
- What are the most frequent staff tasks?
- Which facts matter immediately?
- Which actions are frequent versus occasional?
- Which information should be visible immediately?
- Which information can be progressively disclosed?
- Which controls should remain reachable while scrolling?
- Which existing components consume disproportionate vertical space?
- Which screens currently make a user scroll before they can act?

Do not blindly shrink everything.

Compactness must come from better hierarchy, grouping, layout, prioritisation and progressive disclosure.

---

# 2. Core design philosophy: viewport economics

Treat every pixel of vertical space as valuable, especially at 320–430px widths.

For every component ask:

> **Does this deserve this much screen space?**

If not, compress, combine, shorten, collapse, reposition or remove it.

A mobile user should not spend two or three screens reaching basic functionality.

On important screens, the first viewport should expose as many of these as genuinely useful:

- page/context identity
- primary action
- essential navigation
- important status/facts
- some real content
- frequent shortcuts
- current filters/context

Decorative content must never push essential functionality far below the fold.

---

# 3. Public visual direction: LIGHT-FIRST MACHINE LAB

The owner does not like the black-background public treatment.

## New rule

**No large black or near-black full-width public sections.**

This includes:

- hero
- large course bands
- machine-proof bands
- final CTA bands
- footer
- large story sections

`carbon` / Machine Black remains valuable for:

- text
- icons
- hairlines
- very small badges
- tiny high-contrast technical details

It is no longer a dominant page surface.

## Public surface palette

The dominant page should be built from light material surfaces:

### Cotton
Existing warm ivory family.

Primary page canvas.

### Raw Silk
Existing `ivory-2` family.

Alternating bands and grouped information.

### Worktable White
Existing `card` family.

Forms, detail panels, paper-like moments, proof presentation.

### Steel Mist — NEW LIGHT TECHNICAL SURFACE

Introduce a restrained pale blue/steel surface derived from Steel Indigo, approximately in the visual family of very light desaturated blue-grey.

Purpose:

- EMCAD/software context
- technical notes
- CAD/register overlays
- selected admin informational areas

It must remain clearly light, not dark navy.

### Thread Vermilion
Primary action/active stitch.

### Needle Blue
Technical cue, links, EMCAD context.

### Zari Copper
Small material detail only.

## Footer

Footer should also be light or medium-light.

Use strong border/hairline structure and typography rather than a giant dark slab.

## Dark usage exception

A very small isolated image overlay, tiny tooltip or technical preview may use a dark surface if the content itself requires contrast, but **a user should never perceive the public website as a black-background site**.

---

# 4. Preserve the creative idea, remove the visual heaviness

The successful creative ideas from Machine Lab remain:

- FROM SCREEN TO STITCH
- Screen → path → machine → stitch → proof
- technique signatures
- stitch-path semantics
- registration marks
- real-machine proof
- Machine Notes technical archive
- 11-course Machine Index
- no fake specifications
- no fake CAD coordinates
- no stock/generative studio photography
- real photography placeholders until the 32 real images arrive

The redesign does **not** become generic minimal beige.

Technical identity now comes from:

- linework
- stitch grammar
- crosshairs
- technique signatures
- typography
- compact metadata
- hairlines
- real facts
- photography

—not black panels.

---

# 5. Public compactness principles

The public site is still a conversion website, but it must stop behaving like a spacious startup landing page.

## Mobile typography targets

These are starting ranges, not hardcoded law:

- Homepage hero statement: roughly 30–36px max on common phones unless a very short phrase earns more
- Normal page title: 24–30px
- Section heading: 18–22px
- Card/list title: 15–18px
- Body: 14–16px
- Secondary metadata: 12–14px
- Eyebrow/notation: 11–13px
- Buttons: 13–16px

Do not use 50–70px mobile headings as a default expression of “premium.”

## Public spacing targets

Prefer a compact scale:

- 4
- 6
- 8
- 12
- 16
- 20
- 24
- 32

40px+ vertical spacing must be justified.

Typical mobile section gaps should usually land around 20–32px, not 64–120px.

Typical public card padding should usually be 12–18px, not 24–40px.

## Above the fold: homepage

At approximately 390×844, the first viewport should ideally contain:

- compact header
- `EMCAD DAHAO · REAL MACHINE · SURAT`
- `FROM SCREEN TO STITCH.`
- one concise supporting line
- key verified facts such as `3 Months · 2-Day Free Demo · Live Machine`
- primary demo CTA
- secondary call/directions access
- at least a meaningful portion of the Screen → Machine → Result story or next decision module

The hero should not consume an entire phone screen just to show a headline and one button.

## Public cards

Stop over-carding.

Prefer:

- ledger rows
- split rows
- compact lists
- hairline-separated groups
- horizontal scrollers where useful
- inline metadata
- small technique tiles
- grouped facts
- accordions for secondary detail

Keep a full card only when the grouping or media genuinely benefits from it.

## Images

When real images arrive, use controlled aspect ratios and meaningful crops.

Do not let one image automatically consume half a phone viewport unless it is the signature proof moment.

---

# 6. Public page-specific density goals

## Homepage

Reduce vertical dead space between all major sections.

The page should read as a fast production story rather than a sequence of landing-page “moments.”

Target rhythm:

- compact hero
- immediate EMCAD decision facts
- Screen-to-Stitch rail
- 11-course Machine Index
- machine proof / problems
- student work/proof
- trainers/studio
- stories
- conversion/contact

Use light surface changes and separators instead of large dark inversions.

## Courses index

The 11-course Machine Index stays.

Make it even more scan-efficient:

- index number
- course name
- technique/family
- short fact
- optional thumbnail/signature
- one obvious action

Avoid large vertically stacked cards.

## Course detail

Within the first mobile viewport show:

- course name
- technique/software identity
- verified duration/fee/demo if available
- primary CTA
- one proof/visual element

Do not put a giant introduction before practical facts.

Use tabs/accordions/compact subsections for syllabus, production problems, schedule, fees, demo and norms where appropriate.

## Admission

Keep the multi-step structure, but compress the chrome.

- concise step header
- stitch progress
- fields grouped tightly
- no giant card around every step
- sticky or immediately reachable Next/Submit control where helpful
- full terms available without turning the form into one enormous scroll

## Machine Notes

This is allowed to be editorial/technical, but index pages should be dense archive lists, not oversized article cards.

## Student work / stories

Use compact mixed-shape media and concise captions.

Avoid repeating large heading + long intro + large card on every item.

## Contact

Within one viewport on a phone, expose:

- call
- directions
- WhatsApp
- address/landmark
- opening-hours statement as currently verified
- map/wayfinding trigger

## B2B Studio

Keep service/project flow compact and professional.

Avoid giant dark industrial blocks.

---

# 7. Karma Console: premium native-app density

Karma Console should feel like a purpose-built operations app, not a responsive website dashboard.

Reference principle:

> **Swiggy-style screen efficiency, not Swiggy visual identity.**

Do not copy:

- Swiggy branding
- colours
- graphics
- exact navigation
- exact cards
- illustrations
- proprietary layout details

Learn from:

- compact headers
- concise context rows
- visible shortcuts
- small but clear status indicators
- horizontal filters/categories
- short cards/rows
- persistent navigation
- information grouped tightly
- progressive disclosure
- actions near records
- useful content visible immediately

---

# 8. Admin mobile information target

At 390×844, a normal operational screen should display **multiple useful elements before scrolling**.

Bad result:

- one title
- one large summary card
- one button
- half of one record

Good result:

- compact top bar
- page title/context
- one or more status metrics
- filters/search or shortcuts
- 2–4 real records or meaningful first content
- persistent primary navigation

The exact number depends on the screen, but the user must feel that one viewport is productive.

---

# 9. Admin typography and spacing

## Mobile typography direction

- Page title: 22–26px
- Section title: 17–20px
- Record title: 14–17px
- Body/value: 13–15px
- Metadata: 11–13px
- Buttons/actions: 13–15px

Do not solve density by using illegible 10px text.

## Spacing

Use the compact scale:

`4 / 6 / 8 / 12 / 16 / 20 / 24 / 32`

Typical admin row/card padding:

- 10–14px mobile
- 12–16px tablet/desktop depending on density

Typical section gaps:

- 12–24px

Large 40px+ gaps should be exceptional.

## Touch targets

Visible elements can be small, but important tap areas should remain approximately 44–48px.

A 20px icon may sit in a 44px touch target.

---

# 10. Admin shell redesign

## Mobile header

Target roughly 48–56px high.

It should communicate:

- current context/page
- institute/admin identity where necessary
- one or two high-frequency utilities only

Avoid a tall branded masthead.

## Mobile bottom navigation

Karma Console should use a compact role/permission-aware bottom navigation for the most frequent destinations.

Aim for 4–5 items maximum.

Recommended default information architecture to validate against actual usage:

1. Today
2. Admissions
3. Students
4. Batches
5. More

Rules:

- only show destinations the current user may access
- if permissions remove one, do not show a dead destination
- Fees can be strongly exposed within Students and Today
- Attendance can be strongly exposed from Batches/Today
- Content, Design, Reports, Certificates, Team and lower-frequency modules can sit in More or context shortcuts
- Owner-only Team controls remain Owner-only

If actual task-frequency research demonstrates a better 4–5 destination model, document the evidence and use it.

## Desktop

Desktop may keep a compact sidebar/header arrangement, but it should also be denser:

- narrower navigation
- shorter rows
- reduced card padding
- more useful columns visible
- sticky filters where useful

---

# 11. Admin composition patterns

## Prefer compact rows over cards

A record row should often combine:

- primary name/title
- status
- key amount/time
- one or two metadata points
- primary quick action
- More menu

Example shape:

```
EMCAD DAHAO                 RUNNING ●
12:00–04:00 · 18 students
₹40,000 due · 2 absent today
Attendance   Fees   More
```

The exact data must be real.

## Two-column compact groups

Use where it improves scanability:

- Today metrics
- fee summary
- student facts
- admission status
- course operational facts

## Horizontal chips/segments

Good for:

- status filters
- course/batch filters
- time windows
- content type
- admissions pipeline

Keep them horizontally scrollable when needed instead of wrapping into a tall stack.

## Bottom sheets

On mobile, use action sheets for:

- More actions
- destructive actions
- secondary record operations
- filter controls

Preserve typed confirmation/reason requirements for permanent deletion.

## Drawers / progressive detail

Use when full navigation is unnecessary.

Do not open a new giant page merely to reveal three secondary fields if an accessible drawer/sheet is more efficient.

---

# 12. Today at Karma

This screen should become the clearest demonstration of viewport economics.

At 390×844, aim to show:

- compact date/context header
- 2–4 genuinely useful metrics/alerts
- high-frequency shortcuts
- first actionable queue items
- bottom navigation

Avoid four giant KPI cards.

Use:

- compact metric strip/grid
- small status markers
- concise labels
- list rows
- “View all” where appropriate

The screen should tell staff what needs attention **today**, not admire itself as a dashboard.

---

# 13. Admissions admin

Priorities:

- enquiry name
- course
- phone/contact
- status
- demo/batch preference
- next follow-up
- assigned admin
- quick call/WhatsApp/status action

On mobile, show multiple enquiries per viewport.

Use sticky/horizontal status filters.

Long notes/history are progressively disclosed.

Do not bury “Call”, “Follow up”, “Accept”, or “Not proceeding” behind several screens where permissions allow those actions.

---

# 14. Students

Student list rows should expose immediately:

- name
- admission number
- course/batch
- fee state
- attendance signal where available
- one primary action

Student detail should prioritise a compact operational summary before long history:

- course/batch
- fee balance
- attendance
- guardian contact
- certificate status

Then tabs/sections for history.

---

# 15. Courses & Batches

Course rows:

- course name
- visibility/archive state
- duration if verified
- fee if verified
- schedule summary
- quick edit/more

Batch rows:

- course
- time
- status
- student count/seats
- next/current state
- attendance shortcut

Do not use oversized edit cards in list views.

Forms may open in dedicated pages/sheets where needed, but group fields tightly and use compact sectioning.

---

# 16. Fees

Fees should read like a useful ledger, not a card gallery.

Expose:

- student
- agreed fee
- received
- balance
- due date
- paid/partial/unpaid
- receipt/action

Use tabular numbers.

On mobile, each record can be a compact ledger row with amounts aligned cleanly.

Keep manual-only payment architecture unchanged.

---

# 17. Attendance

Optimize for speed of marking and scanning.

- compact student rows
- status taps with large hit targets
- sticky session/date context
- avoid giant per-student cards
- preserve lock/correction semantics and audit trail

At common phone sizes, staff should see several students at once.

---

# 18. Remaining admin modules

Apply the same density logic to:

- Certificates
- B2B Design Desk
- Content Desk
- Reports/exports
- Team/permissions
- audit views
- account/security

But do not force a single template onto all modules.

Each screen should be organized around its real high-frequency tasks.

---

# 19. Forms

Compact does not mean crowded.

Rules:

- field controls 44–48px high where possible
- labels close to fields
- helper text only when useful
- related fields can share rows on wide mobile/tablet when safe
- mobile two-column only for short, predictable values
- action bar should remain reachable
- errors must remain accessible and obvious
- long terms or secondary explanation should collapse/expand

Avoid one field surrounded by 30–40px of empty card padding.

---

# 20. Copy reduction

Audit all public and admin copy.

Remove:

- redundant explanations
- repeated labels
- generic marketing filler
- obvious instructions
- verbose headings
- duplicated descriptions

Prefer concise functional language.

Public copy remains human and persuasive, but no paragraph should exist merely to create visual rhythm.

Admin copy should be operational:

- `Follow up`
- `Record fee`
- `Mark attendance`
- `Print receipt`
- `Archive`

—not full-sentence instructions when a clear label suffices.

Gujarati remains natural and first-class. Never uppercase or letterspace Gujarati.

---

# 21. Responsive behavior must change, not merely scale

Design intentionally at:

- 320×568
- 360×800
- 375×812
- 390×844
- 430×932
- 768×1024
- 820×1180
- 1024×1366
- 1280×800
- 1440×900

## Mobile

Use:

- compact headers
- bottom navigation in admin
- horizontal scrollers/chips
- stacked ledger rows
- bottom sheets
- condensed image ratios

## Tablet

Tablet must not look like an enlarged phone or broken desktop.

Use:

- 2–3 column fact layouts
- split panes where useful
- compact rail/sidebar navigation where width permits
- denser data tables/cards

## Desktop

Use available horizontal space for information:

- more columns
- split views
- sticky filters/sidebar
- compact tables
- detail panes

Do not simply enlarge typography and whitespace because the screen is larger.

---

# 22. Progressive disclosure

Secondary information should not permanently occupy prime viewport space.

Use appropriately:

- accordion
- View all
- tabs
- drawers
- bottom sheets
- menus
- expandable rows
- horizontally scrollable filters/categories

Do not hide information that is required for safe decisions; hide only lower-priority detail.

---

# 23. Navigation rules

## Public

Keep the existing conversion principle:

- compact header/navigation
- mobile persistent Call + Directions bar remains unless testing proves a materially better conversion arrangement
- demo CTA appears early in content

Do not turn the public site into app-style 5-tab navigation.

## Admin

Admin is a product, so persistent bottom navigation is appropriate on mobile.

The user should not repeatedly open a hamburger menu for daily destinations.

Secondary modules live in More/contextual shortcuts.

---

# 24. Search/filter density

Search and filters should consume as little chrome as possible while staying discoverable.

Good:

- one compact search row
- filter trigger
- horizontally scrollable status chips
- current filter count

Bad:

- giant filter card
- multi-row toolbar before any records

---

# 25. Card-height audit

For every existing card ask:

> Could this communicate the same information using 30–50% less vertical space?

Potential changes:

- reduce padding
- shorten copy
- align metadata inline
- resize media
- put related actions horizontally
- remove redundant labels
- replace card with ledger row
- use borders instead of container-on-container styling

Cards must earn their space.

---

# 26. Sticky/persistent UI

Use only where it saves repeated motion.

Candidates:

- admin bottom navigation
- admin compact header
- list filters
- attendance session context
- mobile form action bar
- public Call/Directions conversion bar

Do not make every toolbar sticky.

Check for overlap with:

- safe areas
- browser chrome
- keyboard
- modals/sheets
- print routes

---

# 27. Motion under compactness

Motion hierarchy from Machine Lab remains, but dense screens should be calmer.

## Admin

Primarily Level 0–1:

- no decorative scroll choreography
- no public stitch animation running through operational lists
- only state/action feedback

## Public

Keep technique signatures and Screen-to-Stitch, but do not let animation force extra vertical space.

No constant loops beyond legitimate loading state.

---

# 28. Accessibility under density

Compactness must not break accessibility.

Verify:

- 44–48px important touch areas
- visible focus rings within clipping containers
- readable body text
- sufficient line height
- correct semantic headings even when visually small
- keyboard navigation
- screen-reader names
- bottom-sheet focus trapping/restoration where applicable
- reduced motion
- no horizontal overflow at 320px
- Gujarati line-height remains adequate

Never reduce accessibility to hit a density target.

---

# 29. Public first-viewport acceptance tests

At 390×844, manually/automatically inspect:

## Homepage

Should contain multiple meaningful elements, not only the hero title.

## Course page

Should show course identity + core facts + CTA + proof/visual start.

## Admission

Should show progress + first actionable choices immediately.

## Contact

Should expose main contact actions without scrolling through a large introduction.

If the first viewport shows only one large visual idea, redesign it.

---

# 30. Admin first-viewport acceptance tests

At 390×844:

## Today

Header + useful metrics/alerts + shortcuts + queue content.

## Admissions

Header/filter + several enquiry rows.

## Students

Header/search/filter + several student rows.

## Batches

Header/status filters + several batch rows.

## Fees

Header/summary + several ledger rows.

If only one giant card fits, density is not done.

---

# 31. Real-viewport test matrix

Every major screen must be tested at:

- 320×568
- 360×800
- 375×812
- 390×844
- 430×932
- 768×1024
- 820×1180
- 1024×1366
- 1280×800
- 1440×900

Inspect:

- useful information above fold
- overflow
- clipping
- typography
- line wrapping
- navigation
- sticky elements
- bottom navigation
- action sheets
- dialogs
- forms
- keyboard behaviour
- horizontal scrollers
- touch targets
- table transformations
- Gujarati
- landscape where relevant

---

# 32. Research requirement

Before implementation, research current high-quality mobile products and operations apps for **principles**, not imitation.

Focus on:

- information density
- mobile navigation
- compact headers
- search/filter patterns
- list rows
- task shortcuts
- status chips
- bottom navigation
- mobile forms
- responsive tables
- bottom sheets
- tablet transitions

Also inspect current education/training/course sites only to understand what Karma should avoid and where practical course facts can be surfaced more efficiently.

Record a concise research note in:

`docs/compact-density-research.md`

For every borrowed principle, explain how it is adapted to Karma.

Do not copy another company’s visual identity or proprietary composition.

---

# 33. Backend/product constraints

This redesign is primarily UI/UX/information architecture.

Do not rewrite working backend architecture to create the appearance of a “full redesign.”

Preserve:

- Next.js 15
- React 19
- Supabase Postgres
- Drizzle
- Hyperdrive
- Supabase Auth
- password-only console
- Owner/Admin permission model
- RLS lockdown
- audit model
- archive/restore/permanent-delete policy
- fee agreement snapshot
- A4 print system
- no payment gateway

Backend changes are allowed only when density exposes a real data-shape problem, such as:

- N+1 query
- unbounded query
- missing pagination
- needless client fetch
- duplicated request
- impractical response shape

Measure before adding indexes or migrations.

---

# 34. Infrastructure remains untouched

Do NOT:

- connect `karmadesignstudio.in`
- change DNS
- activate R2
- activate Turnstile
- add payment providers
- change Supabase project
- add Neon
- replace Supabase Auth
- add Better Auth
- reintroduce MFA/TOTP
- loosen RLS
- rename Hyperdrive
- alter production deployment architecture

The 32 real photographs remain placeholders until the files arrive.

---

# 35. Implementation phases

Execute as separate PRs. Do not wait for owner review between phases unless blocked by an actual owner fact.

## Phase 1 — Research + density audit
**Status:** ✅ Complete — PR #43, merged as `PLACEHOLDER_MERGE`

Delivered:

- `docs/compact-density-research.md` — the principles borrowed, the ones
  deliberately not borrowed, and how each is adapted to Karma
- `docs/compact-density-audit.md` — route-by-route public and module-by-module
  admin density audit, every value measured at 390×844 through the real
  stylesheet cascade
- 216 oversized components/spacing patterns, ~25,300px of recoverable mobile
  height, ranked by area
- the proposed density tokens, including **Steel Mist `#e6ebee`** with computed
  WCAG ratios for every text role placed on it
- the admin navigation IA: **Today · Admissions · Students · Batches · More**,
  permission-filtered from a priority-ordered candidate list
- `tests/helpers/measure.ts` + `tests/compact-density-tooling.test.ts` — the
  clamp-at-a-viewport and contrast helpers the later phases assert through, so
  a density test states the rule rather than pinning one expression

Findings that changed the plan's own assumptions:

- The footer is **not** dark (`#e9decd` Raw Silk). Its defect is 1,031px of
  height on every page, with the phone number 686px inside it.
- Five public surfaces are dark, and they are the hero, the production rail,
  the EMCAD decision block, the homepage close and the B2B chain.
- **`/admin/batches` does not exist** — batches are nested two `<details>` deep
  inside a course row — so the recommended bottom-nav IA requires creating it.
- Two real z-index bugs: `.tabbar` (z-45) paints over the mobile-menu scrim
  (z-40) and over `LangBanner`, whose avoidance branch is dead code.

No broad visual implementation. Audit tooling and its own tests only.

## Phase 2 — Light-first public design system
**Status:** ⏳ Pending

Deliver:

- remove large black/near-black public surfaces
- define Steel Mist/light technical surface
- retune public section spacing
- retune mobile typography scale
- compact card/ledger primitives
- light footer
- preserve technique signatures/stitch semantics
- update `docs/design-system.md`

## Phase 3 — Public shell + homepage compactness
**Status:** ⏳ Pending

Deliver:

- compact public header
- light-first hero
- improved first viewport
- compressed homepage rhythm
- compact EMCAD decision block
- Screen-to-Stitch without oversized vertical footprint
- sections reordered/combined if viewport economics improve
- preserve Call + Directions mobile conversion bar

## Phase 4 — Public inner pages
**Status:** ⏳ Pending

Deliver compact intentional redesign for:

- courses index
- all 11 course pages
- Machine Notes index/detail
- student work
- success stories
- about/trainers
- B2B services
- contact
- verify
- legal/secondary pages
- errors/loading/404

## Phase 5 — Admission/conversion compactness
**Status:** ⏳ Pending

Deliver:

- compact multi-step form
- tighter progress
- better field grouping
- progressive disclosure for norms/secondary detail
- mobile action reachability
- no regression to validation/security/idempotency

## Phase 6 — Admin shell + mobile navigation
**Status:** ⏳ Pending

Deliver:

- compact app header
- role/permission-aware 4–5 item bottom nav
- responsive tablet/desktop shell
- More destination
- safe-area handling
- bottom-sheet action pattern
- dense shared row/filter/metric primitives

## Phase 7 — Core admin workflows
**Status:** ⏳ Pending

Redesign:

- Today at Karma
- Admissions
- Students
- Courses
- Batches
- Fees

Target several useful records/elements per mobile viewport.

## Phase 8 — Remaining admin workflows
**Status:** ⏳ Pending

Redesign:

- Attendance
- Certificates
- Design Desk
- Content Desk
- Reports/exports
- Team/permissions
- audit/account/security screens

Preserve module-specific safety/permissions.

## Phase 9 — Responsive + compactness hardening
**Status:** ⏳ Pending

Run the full viewport matrix.

Fix:

- overflow
- clipping
- excessive vertical space
- bad line wrapping
- poor tablet transitions
- sticky overlap
- keyboard conflicts
- horizontal-scroller accessibility
- focus states
- Gujarati density issues

## Phase 10 — Final compactness pass
**Status:** ⏳ Pending

For every public/admin page ask:

1. What is taking too much vertical space?
2. Can related elements sit horizontally?
3. Can this card be shorter?
4. Can the copy be shorter?
5. Is the heading unnecessarily large?
6. Is section padding excessive?
7. Is there unnecessary whitespace?
8. Can secondary content scroll horizontally?
9. Can secondary information collapse?
10. Are important actions below the fold unnecessarily?
11. Can the screen be understood without excessive scrolling?
12. Does mobile feel like a polished native product rather than a compressed desktop site?

Then implement another pass rather than merely writing observations.

---

# 36. PR/quality process

For every phase:

1. start from latest `main`
2. create dedicated branch
3. read relevant code
4. use relevant skills selectively
5. implement complete phase
6. update this document from ⏳ Pending to ✅ Complete + merged with PR and merge commit
7. update project-context/specialist docs when appropriate
8. run:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

9. fix all regressions
10. run Wrangler dry-run when bundle-affecting code changes justify it
11. open PR
12. wait for GitHub CI and Cloudflare preview
13. merge only when green
14. continue immediately to next pending phase

No direct pushes to `main` for implementation.

---

# 37. Final acceptance criteria

The redesign is complete only when all are true:

## Public

- no large black/near-black public background sections remain
- page still unmistakably feels like Karma Machine Lab
- mobile first viewport exposes useful facts/actions/content
- headings and padding are materially more compact
- 11-course architecture remains
- no fake technicality
- no stock/generated Karma photography
- 32 real-photo placeholders remain correctly mapped
- conversion actions stay obvious

## Admin

- feels like a polished native operations app on mobile
- 4–5 primary destinations are persistently reachable based on permission
- multiple useful records/elements fit in a 390×844 viewport
- list rows replace unnecessary large cards
- search/filter controls are compact
- action sheets are usable
- important tap targets remain comfortable
- tablet has an intentional composition
- desktop uses horizontal space for information rather than whitespace

## Quality

- EN/GU parity
- no horizontal overflow at 320px
- keyboard/focus accessibility intact
- reduced motion intact
- no security/auth/permission regression
- no unwanted migration/infrastructure work
- no new generic UI dependency
- tests/typecheck/lint/build green
- Worker remains within free-plan bundle budget

---

# 38. Final design philosophy

Think:

**premium native-app density**

not:

**spacious startup landing page**

Think:

**maximum usefulness with minimum visual waste**

not:

**make everything large so it looks premium**

Think:

**Swiggy-style screen efficiency**

not:

**copy Swiggy**

The interface should feel:

- compact
- fast
- dense
- clear
- polished
- touch-friendly
- modern
- easy to scan
- efficient
- audience-specific

Premium does not mean large.

**Premium means intentional.**
