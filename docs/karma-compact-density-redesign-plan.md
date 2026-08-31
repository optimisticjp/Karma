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
**Status:** ✅ Complete — PR #43, merged as `628a1e8`

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
**Status:** ✅ Complete — PR #44, merged as `9ae1438`

Delivered:

- **Every dark public surface is gone.** The five that existed — the homepage
  hero, the production rail, the EMCAD decision block, the homepage close and
  the B2B chain — plus two `surface-machine` panels and the `/admissions`
  closer are now Steel Mist. `tests/machine-lab-final.test.tsx` fails if one
  returns.
- **Steel Mist** `#e6ebee` with hairline `#c9d4da`, and it needs no re-pointed
  token block: carbon 15.10:1, stone 5.41, needle 5.67, vermilion-deep 5.26,
  zari-deep 5.45. Bright vermilion stays large-text-only, the same rule as on
  Cotton.
- `.band-machine` re-specified as the **technical** band rather than the
  **dark** band, keeping the four-band vocabulary. Texture inverted to ink on
  light; the steel edge strengthened, because on a pale ground the edge is what
  says "technical". `.machine-light` alphas halved; its two colours unchanged.
- Section rhythm **48.5 / 40.5 / 28.2 → 32 / 24 / 16** at 390px, all three
  tiers preserved, desktop ends unchanged.
- Rhythm utilities onto the compact scale: 12/16/24 → **8/12/16**.
- Mobile type scale retuned into the plan's bands — hero 44 → **36**, h1 36 →
  **29**, h2 30 → **22**, h4 20 → **17** — with every desktop endpoint intact.
  Body stays 16/1.625 and Gujarati stays at 1.8: density is bought from
  headings, padding and rhythm, never from the reading size.
- `.btn` floor 48 → **44px** (the real WCAG minimum, not below it); Gujarati
  keeps 48. `.ledger-row` padding 12 → **8px** on a phone. Public card padding
  `p-6 md:p-8` → `p-3.5 md:p-5` across ten files.
- `SectionHeading`'s `onDark` prop and `MonoNote`'s `"ivory"` tone **removed**,
  so a future dark band is a TypeScript error rather than invisible white text.
- `.on-carbon` **kept defined** and used by no public section — §3 still
  permits it for a small isolated overlay, and deleting the one correct
  dark-surface implementation would guarantee the next one is hand-rolled.
- Technique signatures, stitch semantics and the 32-photo manifest untouched.
- `docs/design-system.md` gains a **v5 "Light-first Machine Lab"** section.

Two findings recorded rather than acted on:

- **The footer was never dark.** It is `#e9decd` Raw Silk. Its real defect is
  1,031px of height on every page, which is Phase 3's work, not a tone change.
- Four assertions were re-pointed at the new, stricter policy. The one that
  mattered was `machine-lab-final.test.tsx:52` — `homeSections.length <= 4`
  would have gone **silently vacuous** at zero rather than failing.

New policy tests: `tests/compact-density-system.test.ts` — Steel Mist's
contrast read out of its own token, the three rhythm tiers evaluated at 390px,
every type token measured against the plan's band, the 44px tap floor, and the
**reverse** Gujarati sweep (every uppercased or letterspaced class must have a
`:lang(gu)` neutraliser — the existing sweep structurally cannot catch a class
with no `:lang(gu)` rule at all).

## Phase 3 — Public shell + homepage compactness
**Status:** ✅ Complete — PR #45, merged as `a8c1204`

Delivered:

- **Chrome heights became tokens.** `--header-h`, `--tabbar-h` and
  `--tabbar-item-h` replace four hand-matched literals that had already
  drifted — `.site-body` reserved 4rem under a 3.5rem bar, which rendered as an
  8px strip of Cotton under the footer of **every** public page. Header 64 →
  **56px**; bar 56 → **48px** with its item at the real 44px WCAG floor. 24px
  of every public viewport recovered before any page content.
- **Two real bugs fixed, both z-index.** `.tabbar` was z-45 against the
  mobile-menu scrim's z-40, so the Call/Directions bar painted *on top of* an
  `aria-modal` dialog's scrim and stayed pointer-tappable outside its focus
  trap — and it covered both of `LangBanner`'s buttons. The bar is z-30 now and
  the banner docks above it. `hasStickyBar`, which tested for a component that
  has not existed for two redesigns, is gone from both files; in `WhatsAppFab`
  it had been suppressing the WhatsApp action on the three highest-intent
  routes on the site for nothing.
- **The footer: 1,031px → ~600px, with the phone number first.** The visit
  block leads on a phone via `order-first` (on screen, not in the DOM, so the
  desktop composition and the reading order both survive); the spine's headline
  drops from 60px to ~20px; and the two link columns stop being
  `hidden md:block`, so the mobile footer is now shorter **and** carries eight
  more crawlable links than before.
- **Header menu**: 56px rows → 48px, 605px panel → ~430px.
- **The hero's first viewport.** At 390×844 the demo CTA used to sit 16px
  behind the tab bar in English and **entirely below the fold in Gujarati**.
  The three thread frames now run *across* a phone rather than down it — one
  column made each 4:3 frame 235px tall, so `01 SCREEN / 02 MACHINE /
  03 RESULT` cost 933px. Still one markup tree; the rail is redrawn horizontal
  with the identical 9-on/6-off geometry and penetration dot, and wipes along
  its own axis.
- **The homepage reordered** to the plan's §6 rhythm. `<EmcadDecision>` was the
  **eighth** section: the one course with a confirmed duration and a published
  fee sat behind five others, so "how long, how much" was four screens away. It
  is third now, with `<Investment>` — the institute-wide half of the same
  question — directly after it.
- The six grids whose multi-column breakpoint was 560–640px now break at
  380px: the production workflow (1,224px → ~600), the proof strip (1,389 →
  ~700), the work grid (2,065 → ~1,000), the review wall (1,400 → ~700), the
  production rail (1,178 → ~400) and the studio grid (957 → ~480). Every
  manifest aspect ratio is untouched — the column narrows, not the frame.
- The Machine Index row: 16px → 10px block padding, the name at 15px, the
  produces line clamped to two lines and the media a thumbnail in the index
  column. Photography and signature still share one slot at one size.
- EMCAD decision block compacted throughout; the fee keeps display weight at
  36px rather than 43.

New policy tests in `tests/compact-density-shell.test.ts`: each chrome height
is declared exactly once and read by every consumer, no literal survives at the
call site, the bar ranks below the modal chrome, the banner clears it, the
footer leads with the phone and shows a phone the links a laptop shows, and the
hero's thread keeps one continuous stitch when it turns.

## Phase 4 — Public inner pages
**Status:** ✅ Complete — PR #46, merged as `3ebac61`

The audit's finding drove this phase: **`PageIntro` is the public site's cost
centre**, and the two interior pages that already passed the first-viewport
test — `/verify/[id]` and the error boundary — are precisely the two that
decline it. So the phase starts there and works outwards.

Delivered:

- **`PageIntro` compacted**: 56 → 20px above the eyebrow, 48 → 16px below,
  lede gap 20 → 8, actions gap 32 → 14, and the aside — which stacks *between*
  the page title and the page's own content at every width under 900px — drops
  to a 13px note on a phone and stays a 15px rail from 900px. Every desktop
  endpoint is intact.
- **The course page leads with what the institute has confirmed.**
  `<CourseOperations>` moved ahead of the who-is-it-for essay: on EMCAD DAHAO,
  the only course with a confirmed duration and a published fee, those figures
  sat behind the intro, the drawn signature and a two-column essay — about
  **3,900px, roughly 4.6 phone screens**, to reach the number a visitor came
  for.
- **Related courses became Machine Index rows** (1,476px → ~250), and
  `CourseCard` was **deleted**: it was superseded, not reserved, and leaving a
  working card-grid implementation of a decision the project deliberately made
  the other way is one import away from undoing it. Its two policy assertions
  moved to the surfaces that still carry the rule.
- The course aside pairs its photograph and signature side by side on a phone
  (514px → ~230), with the manifest ratio untouched. Nine stitched rules on one
  page became two — a mark that repeats under every heading is a separator, not
  a signature. `ModuleAccordion` stops opening a panel for the reader.
  `.problem-fault` 20px → 15px: six faults were reading as six sections.
- **The notes archive clamps its answer to two lines.** Rows printed the
  complete answer — 196 to 355 characters each — so eight notes filled ~1,150px
  and the archive stopped being scannable. The full answer is still on the
  note. The note aside's drawn plate goes from a 233px 3:2 box to 80px on a
  phone, so "what to check" is reachable.
- **Success stories put a story before the frames reserved for its
  photographs.** The page opened with 470 characters of caveat and two empty
  frames, and the first story began ~1,350px down. The frames stay — labelled,
  honest, never filled with stock — they just stop standing in front of the
  content they illustrate.
- **The loading skeleton reserves the shape a page actually lands as**: rows on
  a phone, three cards from `md:`. It held 616px of card grid for `/notes`,
  `/terms`, `/services` and `/privacy`, which all land as hairline row lists —
  so it guaranteed the layout jump it exists to prevent.
- Contact channel rows 108px → ~64 (rows, not cards). `/terms` sets its six
  body terms as body via a new `.ledger.is-prose`, instead of six headlines.
  `.stack-lines` 16 → 8px on a phone. `.split` and the two-column page gaps
  40 → 16px. Privacy section gaps 48 → 24px.
- `GalleryGrid` **deleted** — a client-side masonry `/student-work` never used
  (`WorkLedger` is the gallery), carrying the last `bg-carbon` filter pill on
  the public side.

New policy tests in `tests/compact-density-public.test.ts`, including the
**compact-scale sweep**: no unprefixed vertical spacing utility above step 8
anywhere in the public tree, scanned inside `className` literals after
stripping comments, with breakpoint-prefixed variants exempt because §21
explicitly allows more room on a larger screen.

## Phase 5 — Admission/conversion compactness
**Status:** ✅ Complete — PR #47, merged as `50d1ca3`

Delivered:

- **The action row is sticky on a phone.** On step 3 the Next control sat
  roughly **1,630px** from the top of the document — about two screens — so a
  visitor who had filled everything in still had to scroll to say so. Sticky,
  not fixed: it stays in flow, so it can never cover the field above it, and it
  clears the Call/Directions bar through the same `--tabbar-h` that bar
  reserves with rather than a second hand-matched number. Above 1280px the bar
  is gone and so is the stickiness.
- **The eleven course chips go two-up at every width** — step 1 was a 659px
  scroll of chips before a visitor could see the options they were choosing
  between. Every chip grid, the schedule, the demo slots and the language
  choice follow.
- Form primitives: `.input` 50 → **44px** with 8/12px padding, `.choice-chip`
  the same, `.label` 15 → 13px. **The input keeps `font-size: 1rem`
  deliberately** — below 16px iOS Safari zooms the page on focus, which is a
  worse experience than a slightly wider field.
- Form chrome: step gap 32 → 16, field spacing 24 → 12, card padding 16/28 →
  12/20, progress head 7 → 4px, the context and restored-draft chips to 13px.
- The success card 470 → ~230px: a 44px seal instead of 64, the heading at h3,
  the reference at h4. **Both closing notes stay** — what happens next, and
  what the free demo is.
- `/admission`'s "before you start" aside was 208px between the page title and
  the first field; the same three lines are now one wrapped row at the aside's
  13px, and a stacked list again from `md:`.
- The fifteen admission clauses: 44px summary, 8px clause gaps, everything at
  13–14px.

**Nothing that protects a submission moved.** `tests/compact-density-admission.test.ts`
names each defence rather than trusting a diff: honeypot, the minimum fill-time
window, the client idempotency key, the versioned norms, the guardian mobile
and its not-the-same-number rule, the Turnstile widget, the three separate
consents and their server-side refusals, the announced error summary with
focus-to-field, the still consent step, and the demo times staying a preference
with nothing on the surface that could reserve a seat.

## Phase 6 — Admin shell + mobile navigation
**Status:** ✅ Complete — PR #48, merged as `218363c`

Delivered:

- **A permission-aware bottom navigation**, at most four destinations plus
  More. The IA is the plan's recommended **Today · Admissions · Students ·
  Batches**, but built as a *priority-ordered candidate list filtered by what
  the caller can reach*, because a fixed four was wrong for the operators the
  audit found: a fees-only admin's Today screen is empty, and an
  attendance-only admin's one daily module was a button 1,100px below the fold.
  They now get Today · Fees and Today · Attendance respectively. A destination
  the caller cannot reach is **omitted, never greyed**.
- **Team is never a tab**, at any permission level: it is Owner-only with no
  permission key, and a bar that differs between the Owner and every Admin
  teaches the wrong muscle memory for a destination used a few times a year.
- The mobile drawer — **795px**, twelve rows, three group headings, opened and
  closed dozens of times a shift — becomes the **More sheet**, opening above
  the bar.
- **The app bar: 72 → 52px.** It carried `personName · roleLabel` under the
  brand on every console route — identity the operator already knows. That
  moved into the More sheet beside the account link.
- **`/admin/batches` created.** It did not exist: a batch lived as a nested
  `<details>` two levels inside a course row, which is why Today deep-linked
  `/admin/courses#batch-N`. Five signals said the batch is the daily object —
  it owns a Today queue, it is already addressed as a record, `batches.*` is
  already a distinct permission key, two A4 sheets hang off it, and the owner
  had the catalogue's import entry point removed because "the catalogue is
  settled." The row leads with **Attendance**, because that is the task a batch
  exists for, and the deep link is an href: the attendance page already accepts
  `?batch=` and `?date=`.
- `/admin/courses` becomes the catalogue. It used to select **every column of
  every batch with a trainer join** purely to nest them and then render a count
  — now one grouped query.
- **`kolkataDate` extracted to `src/lib/admin/dates.ts`.** It was an identical
  one-liner in three files and a fourth was about to be written. The window it
  would eventually disagree in is 00:00–05:30 IST, where an attendance register
  belongs to yesterday.
- **Chrome heights are tokens**: `--console-header-h` and `--console-bar-h`,
  read by the app bar, the sticky `.toolbar` (previously hand-matched to a
  `min-h-16` two files away), the More sheet, the record-action sheet and the
  work surface's bottom reservation.
- New dense primitives: `.console-bar` / `.console-tab` (a 20px icon and an
  11px label in a 44px box, current marked by a running stitch rather than a
  filled pill), `.console-sheet`, and `.chip-scroller` / `.chip-filter` —
  horizontally scrollable filters, because eleven course names wrap to four
  rows in Gujarati.
- `.console-metrics` becomes a label/value **row** on a phone. The
  `sm:grid-cols-3` metric trio cost 300px on nine console screens.
- Five ordinary navigation icons added to the **universal** group — a house, a
  tray, two people, a calendar, three lines. Navigating to Students is a
  universal action, not a branded concept; a bobbin meaning "batches" would be
  clever exactly once.
- The **last legacy page header** removed: the delete page rendered a 27px
  title against `PageHead`'s 22px. `.console-page-head`, `.console-page-title`
  and `.console-page-sub` are gone from the stylesheet, because a second header
  implementation with no callers is how a ninth copy creeps back.

Five assertions re-pointed at their new homes (the toolbar anchor, the nav
gate, the batch anchors, the schedule/batch separation, the shell's own
authorization note). New suite: `tests/compact-density-console.test.ts`.

**Worker: 2011.09 KiB gzip** against the 3 MB free plan — unchanged.

## Phase 7 — Core admin workflows
**Status:** ✅ Complete — PR #49, merged as `0b27036`

Eleven of sixteen console screens showed **zero complete records** at 390×844,
and it was one pattern: a `sm:grid-cols-3` metric trio that stacks to a single
column on a phone, then a filter toolbar of full-width rows, then the list.

Delivered:

- **The metric trio is a hairline strip** on Today, Admissions, Fees, Courses
  and Batches — a label/value row on a phone, cells from 640px. That single
  change is worth ~300px on five screens.
- **Today** gains a compact figure strip under the head: the counts were only
  ever visible one at a time at the head of their own queue, so three of the
  seven fetched were never shown and seeing four numbers meant scrolling three
  viewports. Quick actions became chips (439px → ~76). Recent activity became
  two-line rows.
- **A fees queue on Today.** The audit found a fees-only admin looking at an
  *empty* Today — every queue was gated on a permission they do not hold, and
  they still paid for the counts. It is one capped query with the sums as
  correlated subqueries, so it stays one round trip, and the balance is
  **derived** exactly as `summariseFees` derives it.
- **Admissions**: the add-enquiry hint moves out of the summary (a 101-character
  sentence took three lines whether or not the form was open); the toolbar goes
  two-up (292px → ~150); and the row gains a second meta line with the
  follow-up date toned for overdue.
- **`demoSlot` and `preferredSchedule` finally render.** `demoSlot` was
  selected on every load and shown nowhere — the one field that says when an
  applicant wants their free demo — and `preferredSchedule` printed its raw
  storage key. Both resolve through the course's own timetable, from one more
  column on a SELECT that already runs.
- **Students**: the directory row carried a name, an admission number and a
  phone, and an *active* student's row carried no status at all. It now shows
  the enrolment status (a dot **and** a word), the course, the batch and the
  balance — from **two set-based reads over the ids already on screen**, which
  shrink with the list rather than multiplying by it. The two front-desk
  accordions and the four-row search form come down from 590px to ~180.
- **Fees**: identity on one meta line, money on its own with every figure
  tabular — a column of balances did not line up, which is the one thing a
  ledger has to do. `latest`, computed and never read, becomes the last-receipt
  print link.

New assertions in `tests/compact-density-console.test.ts` covering the metric
strip, the fees-only operator, derived-never-stored fee figures, set-based
reads, the fields that were fetched and discarded, dot-and-word status, and
tabular money.

## Phase 8 — Remaining admin workflows
**Status:** ✅ Complete — PR #50, merged as `7c76216`

The seven screens Phase 7 did not reach. Two shapes the core workflows did not
have turned up here: a five-column table with `min-w-[52rem]` scrolling inside a
366px panel, and pages whose entire body was one **open** form per record.

Delivered:

- **Attendance.** Three counts became one meta line **inside** the register
  rather than a strip above it — the operator reads "34 students, 12 marked"
  while marking, not before. Each student was a 212px bordered card; it is a
  ~100px row where the four-up P/A/L/E control is *both* the display and the
  input, with the note behind a `<details>` that opens itself when a note
  exists. The field names `status:<id>` and `note:<id>` are unchanged and now
  carry a comment saying why: `saveAttendanceAction` reads them for the whole
  roster, and a rename would silently stop saving.
- **Certificates.** 362px per candidate became a disclosure whose summary is a
  four-slot row. The issue form was rendered open for every eligible student —
  254px each, on a screen that is scanned far more often than it is acted on —
  and moved behind its own disclosure. The R2 note stays, with a comment: it is
  what stops the next session assuming a private file pipeline exists.
- **Design Desk.** ~900px per job became a row with status, edit, history and
  files each behind a disclosure. Two **unbounded** selects — every
  `serviceStatusHistory` and every `serviceFile` in the database — are scoped
  with `inArray(…, jobIds)` to the jobs actually on screen.
- **Content Desk.** The create panel was open for anyone with manage rights,
  170px of head plus the whole form before a single item; it is a disclosure
  with its help text inside. Each item's manage body was already one
  `<details>` — the row **is** the summary now. The 500-row student picker is
  gated on `content.manage`: a view-only admin paid for it on every load to
  populate two forms they are never shown.
- **Reports.** Seven `panel panel-body` figures measured **806px** stacked at
  390px — 42px taller than the entire phone content budget — and are the
  hairline strip. Three of them repeated "Last 30 days" under the number while
  the section heading says it once on the same line; that caption is gone. The
  sixty-row audit table is a **list below `md`** and stays a table above it,
  and its five column headings are bilingual for the first time — they were
  hardcoded English inside the owner's own record of what changed. The five
  86px export cards, each restating "Download CSV", are rows.
- **Team.** The Owner was a 280px panel above a second list; each admin was a
  443px `panel` with three facts, the permission editor and the activate
  button all rendered open — five admins were 2,215px. It is **one list**:
  the Owner as a plain row (nothing on the page can act on it), every admin a
  disclosure whose row already answers "who has access to what". `requireOwner`,
  the seat invariants and the deliberate **absence of any delete affordance**
  are unchanged and asserted. Dates were formatted `en-IN` in both locales.
- **Account & security.** Four label/value pairs took 416px stacked; `.kv-grid`
  states them in two columns.

**One system change.** `.data-row` sets `display: grid`, which silently drops
the marker a `<summary>` draws for itself — so the disclosure rows Phase 8
introduced across four modules had no visible affordance at all. `summary.data-row`
now carries a caret in its own third column, rotating on open, with the pointer
cursor and a `prefers-reduced-motion` guard.

Preserved: `requireAdmin`/`requireOwner` on every page, every module permission
gate, the attendance field contract, the no-delete rule on Team, and the R2
deferral on Certificates.

New assertions in `tests/compact-density-console.test.ts` covering all of the
above. **770 tests pass.**

**Worker: 2022.89 KiB gzip** against the 3 MB free plan (+11.8 KiB — the
bilingual audit headings and the responsive audit list).

## Phase 9 — Responsive + compactness hardening
**Status:** ✅ Complete — PR #51, merged as `7b795b0`

The matrix was run in a **real browser** rather than computed: Chromium (the
container's own binary, driven by `playwright-core` installed outside the
repository so `package.json` is untouched) against a production `next start`,
at 320 / 360 / 375 / 390 / 430 / 768 / 820 / 1024 / 1280 / 1440 across twenty
routes in both locales. Full numbers: `docs/compact-density-audit.md` §10.

That decision paid for itself immediately — the largest finding of the phase
was invisible in the source.

- **A whole phone layout was silently half-applied.** `machine-lab.css`
  declared the hero's `@media (max-width: 639px)` overrides *above* the base
  rules they override. A media query adds no specificity, so source order
  decided and the base rules won: the knot rendered at left −18px — off the
  viewport entirely — the step never stacked, and the caption kept its rail
  indent. The CSS was valid and every test passed. The block moved below the
  base rules, and the test now asserts the **order**.
- **The 640–959px dead zone.** The three-across hero stopped at 639px and the
  staggered composition starts at 960, so the tablet range fell back to the
  vertical layout Phase 3 replaced *because* it cost 933px. Extending it to
  959, splitting `.about-place` at 768 rather than 800, taking `.work-wall` to
  three columns at 768 rather than 900, and splitting the About cards at `md`:
  `/en` 768 **18,556 → 16,836**, 820 **18,864 → 17,006**; `/gu` 768 **17,990 →
  16,253**; `/en/about` 768 **9,258 → 8,460**. Every public route now gets
  *shorter* as the screen widens through the tablet range, which it did not.
- **Keyboard focus had no bottom reservation.** Sixty `Tab` stops per route
  found every focusable carrying a visible ring — and found the last card on
  `/contact` landing half behind the fixed tab bar, because `scroll-margin-top`
  on `[id]` covers an anchor jump and nothing else. `html` now carries
  `scroll-padding` at both ends from the chrome tokens, with its own block for
  the console, whose bars are not the public site's.
- **Four controls were below their floor**, each found by measurement:
  `.site-brand-mark` at 28px inside a 56px header, `.cta-tertiary` at 41.2px
  **in Gujarati only** (its height came from the line box, so it drifted with
  the font's metrics), the section-level "see all" link at 26–32px across five
  different ad-hoc spellings — now one `.link-more` class — and
  `.hero-thread-foot a` at 32px.
- **Gujarati is not systematically taller.** The Phase 1 audit told this phase
  it was 6–11% taller everywhere. Measured, it is *shorter* on seven of nine
  routes (up to −5.6%) and taller on exactly two: `/admission` (+5.4%) and
  `/contact` (+0.6%) — the two screens that are mostly labels rather than
  prose. Its line-height is taller; its copy is shorter; on a prose page the
  second wins. The rule to carry forward is the narrower one: **measure
  Gujarati first on label-dense screens.**

**Deliberately not changed:** the footer's own links measure 31.7px. They clear
WCAG 2.5.8's 24px with margin, a previous session padded them to do exactly
that, and raising twenty of them to 44px would add ~250px to the footer Phase 3
spent its budget shortening. The 17px `Privacy` link in the brief form's
consent sentence is an inline link inside a sentence and is exempt by 2.5.8's
own inline exception.

**Clean across 170 route×viewport combinations after the fixes:** no horizontal
overflow at any width, no element past the viewport edge, no text clipped by a
fixed height that was not a deliberate line clamp, no focusable without a
visible focus ring.

New suite: `tests/compact-density-responsive.test.ts` (12 assertions). The
browser measurement cannot run in CI, so each assertion pins the CSS fact the
measurement established.

Two Phase 3 assertions were re-pointed from `max-width: 639px` to
`max-width: 959px`. The claims they make — three frames across, and the same
9-on/6-off stitch geometry when the rail turns — are unchanged; only the
breakpoint the block lives at moved.

**Worker: 2021.78 KiB gzip** against the 3 MB free plan.

## Phase 10 — Final compactness pass
**Status:** ✅ Complete — PR #52, merged as `PLACEHOLDER_MERGE`

The twelve questions were asked of **measured section heights at 390px**
rather than of an impression — every route broken into its sections, each
section into its biggest child. Three of the twelve had real answers left; the
rest had already been answered in Phases 2–8, and saying so is more useful than
inventing work.

**Q9, can secondary information collapse — `/success-stories`.** Six full case
studies measured **5,004px**: six viewports to read six stories nobody can
compare, because only one fits on screen at a time. The identity, the
before → after and the quote stay open; the numbered arc and the case-study
detail moved behind one disclosure. Nothing is truncated and nothing is
removed — `<details>` keeps it in the DOM, findable by Ctrl-F, readable by a
screen reader, present with JavaScript off. **The section is 2,644px and the
page went 9,511 → 6,821px (11.3 → 8.1 viewports).**

**Q7, unnecessary whitespace — the footer, on all twenty-one public pages.**
Its two link columns are short lists of two to six items and they were stacked:
371px of a 1,047px footer. Paired on a phone they are 218px, and at `lg` the
wrapper becomes `display: contents` so each nav keeps its own span in the
twelve-column grid rather than nesting a grid inside one. **1,047 → 892px,
times twenty-one pages.**

**Q4 and the duplication behind it — the homepage story teaser.** The teaser's
head already draws `before → after` on one line, and the numbered arc directly
below it repeated BEFORE and NOW: **354px of restatement** on a page that runs
nineteen sections. Teaser mode renders the identity, the arrow and the quote;
the arc is on the stories page, one link away, where the reader went for it.

**One correctness bug the measurement surfaced.** The `/services` aside
rendered `form.filesHelp` — "Up to 3 files, 8 MB each: PNG, JPG, WebP, PDF, AI
or ZIP" — as guidance for an **in-form uploader that does not exist**, beside a
form that says in its own words that files go over WhatsApp until private
storage is switched on. It told a business owner they could attach files here
and they could not. R2 is deferred on purpose and the page has to say so
consistently. The copy key stays in both catalogues: it is what to restore when
R2 is activated, and it carries limits the API still enforces. The
`confidential` line went with it — the form states the same sentence forty
lines up the same screen.

**Two controls on the screens before sign-in.** Everything behind
`requireAdmin` needs a database and a session, so the console was measured by
computation in Phases 6–8; `/admin/login` and `/admin/no-access` are public,
and measuring them found the console language switch at **21.7 × 44.6px** — the
only control on that screen besides the form — and the way back to the public
site at **19px**. Both take `.tap` now. The language switch is still a
no-JavaScript form posting to a server action, and the login screen still says
nothing about *why* a sign-in failed.

### The twelve questions, answered against the final measurements

| # | Question | Answer |
| --- | --- | --- |
| 1 | What is taking too much vertical space? | Nothing structural left. The tallest remaining blocks are the 11-course catalogue (1,476px for eleven courses) and the services brief form (2,079px for a form with six fields, a deferred-upload note and a what-happens-next ledger). Both are content, not chrome. |
| 2 | Can related elements sit horizontally? | Done where it reads: the footer's two link columns, the hero's three frames, the work wall's three tiles, the console's metric strips. Not the review wall — its own lede argues against a carousel, and 208px of review text in a 170px column would be worse. |
| 3 | Can this card be shorter? | Every `<article className="panel">` per record in the console is gone; the story case is a disclosure; the export cards, the certificate candidates and the design jobs are rows. |
| 4 | Can the copy be shorter? | Only where it was **duplicated**: the teaser's arc, Reports' three "Last 30 days" captions, the services confidentiality line. No verified fact was cut and no sentence was rewritten for length alone. |
| 5 | Is the heading unnecessarily large? | Phase 2 retuned the whole mobile scale: display-xl 44 → 36, h1 36 → 29, h2 30 → 22, h4 20 → 17. Body copy stayed at 16/1.625. |
| 6 | Is section padding excessive? | Section tiers are 32/24/16 at 390px. Nineteen sections × ~40px is 760px of a 18,381px homepage — 4%. Padding is no longer where the length is. |
| 7 | Is there unnecessary whitespace? | The footer was the last of it. |
| 8 | Can secondary content scroll horizontally? | The console's filter chips do (`.chip-scroller`). No public content does, deliberately: a horizontal scroller that hides content behind a gesture is a carousel by another name, and the review wall's own copy rejects that. |
| 9 | Can secondary information collapse? | The stories, and eight console modules. |
| 10 | Are important actions below the fold unnecessarily? | Admission is 2,126px at 390 with its sticky `.form-nav`; contact is 2,826px; the hero's action row is above the thread. |
| 11 | Can the screen be understood without excessive scrolling? | Every route except the homepage and `/services` is under 9 viewports at 390px; most are under 5. The homepage is 21.8 viewports for **nineteen sections** — that is an editorial decision about how much a homepage should carry, and it belongs to the owner, not to a density pass. It is flagged in the report rather than resolved unilaterally. |
| 12 | Does mobile feel like a polished native product? | The console does — compact app bar, permission-aware bottom navigation, rows with 44px controls inside them, sheets, chips, disclosures. The public site reads as a light technical document, which is what it should be. |

**Worker: 2026.23 KiB gzip** against the 3 MB free plan.

New suite: `tests/compact-density-final.test.ts` (11 assertions).

---

### The original question list, for reference

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
