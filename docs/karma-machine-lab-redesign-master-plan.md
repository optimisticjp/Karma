# KARMA — Screen-to-Stitch Machine Lab
## Full product redesign master plan

**Status:** AUTHORITATIVE OWNER-DIRECTED PLAN — planned, not yet implemented  
**Created:** 2026-08-30  
**Repository:** `optimisticjp/Karma`  
**Current baseline:** `main` after PRs #24–#27 (`1ab9e12609c46b706ffe5cc4ee0678c0ed17f398`)  
**Database baseline:** Drizzle migration `0004_course_operations` has been applied to the connected Supabase project and the Drizzle migration ledger was synchronized on 2026-08-30. Verify before any future migration work.  

This document is the implementation source of truth for the next full redesign round. It supersedes earlier **visual/polish direction** where there is a conflict, but it does **not** supersede the architectural, security, factual-data, deployment, auth, RLS, migration, privacy or infrastructure rules in `CLAUDE.md` and `docs/project-context.md`.

The goal is not to make Karma look “more designed.” The goal is to make the entire public site and Karma Console feel like the digital expression of a real commercial embroidery training studio in Surat.

---

# 0. Read this before touching code

Every implementation session must read, in this order:

1. `CLAUDE.md`
2. `docs/project-context.md`
3. this file, completely
4. `docs/design-system.md`
5. `docs/content-checklist.md`
6. `docs/admin-architecture.md`
7. `docs/security.md`
8. `docs/deployment.md`
9. `docs/operations.md`
10. `src/content/course-operations.ts`
11. `src/content/admission-terms.ts`
12. the actual current code for the phase being implemented

Current code wins over stale documentation. New owner decisions in this plan win over older aesthetic direction. If implementation reveals a stale doc, correct it in the same PR.

Use the vendored `.claude/skills/` library **selectively**, not ceremonially. Particularly useful categories for this project include frontend design, UI/UX, accessibility, humanized copy, SEO, testing/TDD, code review, context engineering, security and Spec Kit for genuinely complex subsystems. Karma-specific rules always outrank generic skill advice.

Do **not** initialize shadcn/ui, install a generic admin kit, add a chart library, or import the design system from the skills template.

---

# 1. Permanent brand position

## Core positioning

**Karma is Surat’s machine-led commercial embroidery learning studio.**

Not a generic creative-course provider.  
Not a fashion school.  
Not a craft blog.  
Not a bridal catalogue.  
Not a machine manufacturer.  
Not a software reseller.  
Not a stock-photo college.  
Not a loud local coaching ad.

## Permanent brand promise

# FROM SCREEN TO STITCH.

**Design on screen. Prove it on the machine.**

## Creative thesis

**Digital precision, stitched with Surat richness.**

## Final product idea

**KARMA: SCREEN-TO-STITCH MACHINE LAB**

The site should feel like:

> EMCAD DAHAO precision + industrial embroidery machinery + real fabric + real production + Surat textile richness.

## Personality

- Expert, not academic
- Ambitious, not flashy
- Technical, not cold
- Local, not provincial
- Premium, not luxury-for-luxury’s-sake
- Direct, not corporate
- Commercially aware, not hobby-led
- Human, not sterile

---

# 2. The governing creative rule

> **Don’t decorate the interface with embroidery. Make the interface behave like embroidery.**

Every visual decision belongs to one of three layers.

## Layer 1 — real content, dominant

Real machines.  
Real trainers.  
Real students.  
Real stitched output.  
Real course schedules.  
Real fees.  
Real studio.  
Real production problems.

This is always the strongest layer.

## Layer 2 — niche interface language

Stitch paths.  
Needle points.  
Thread tension.  
Vector nodes.  
Hoop/register marks.  
Sequence disks.  
Beads.  
Machine heads.  
Fabric edges.  
Thread cones.  
Production notation.

## Layer 3 — selective motion

The interface occasionally:

- stitches
- traces
- threads
- registers
- corrects
- reveals a material transition

It must never become an animation showcase.

---

# 3. What success feels like

A visitor arrives from an Instagram Reel.

### Within 3 seconds

**EMCAD DAHAO. REAL MACHINE. SURAT.**

### Within 10 seconds

“I understand that they do not only teach software.”

### Within 20 seconds

“I can see what they teach and what students physically produce.”

### Within 30 seconds

“I know it is 3 months, ₹35,000, has a 2-day free demo, and I can call or visit.”

### After browsing

“These people actually understand machine embroidery production.”

### The visual memory

A thread begins on a computer screen, passes through a real embroidery machine, and ends as finished fabric.

**Screen → path → machine → stitch → proof.**

---

# 4. Audience and buying questions

## Primary

Aspiring commercial embroidery designers, roughly 18–30, Surat/Gujarat, mobile-first, Gujarati/Hindi comfortable, looking for a practical job skill or route into paid design work/small business.

They need fast answers to:

- Can a complete beginner learn?
- Will I use a real machine?
- What exactly is EMCAD DAHAO?
- What effects/design types will I learn?
- What can I physically make after training?
- What does the course cost?
- How long is it?
- What batch timings exist?
- Can I try before admission?
- Can I call or visit now?

## Secondary

Working designers, machine operators and factory owners.

Their question is:

> **Will this solve the production problem I face?**

## Third

Boutiques, textile businesses and manufacturers needing the Studio/B2B side: digitising, machine-ready design, sample reconstruction, correction and specialised embroidery work.

Training remains the primary funnel.

---

# 5. Final visual identity

Evolve the existing Screen-to-Stitch v3 system. Do **not** discard it and do not rename existing shared token names casually because `globals.css` is shared with Karma Console.

## Core surfaces

### Machine Black
Existing `carbon` range around `#111716`.

Use for:
- hero authority
- footer
- machine-proof moments
- final CTA
- selected technical sections

### Steel Indigo
Existing `steel` range around `#172B35`.

Use for:
- EMCAD/software context
- technical overlays
- secondary dark surfaces

### Cotton / Raw Linen
Existing warm `ivory` / `ivory-2` family.

Use for:
- reading surfaces
- human sections
- material-led sections

### Worktable White
Existing `card` family.

Use for:
- clean information
- paper-like operational moments
- finished embroidery presentation

## Brand/action colours

### Thread Vermilion
The primary interface accent.

Use for:
- primary CTA
- active stitch
- current production stage
- key path/progress

Never turn every heading red.

### Needle Blue
Use for:
- EMCAD/software
- technical cues
- links where appropriate
- CAD/registration notation

### Zari Copper
Use as a restrained material accent.

It is not a second CTA colour.

### Sequence Silver / Pearl
Add only if it can be implemented as an extremely restrained material token or CSS treatment with adequate contrast. It should never become a general UI accent.

## Principle

**The photographs provide most of the colour. The UI stays disciplined.**

---

# 6. Typography

Keep the current core stack.

## Main display

**Manrope 700/800**

Industrial clarity, strong mobile readability.

## Body / UI

**Manrope 400–700**

## Editorial interruption

**Playfair Display Italic**, very sparingly.

Potential words only:

- *prove it*
- *finished*
- *precision*

Never use it as a generic heading face.

## Gujarati

**Noto Sans Gujarati 500–700**

Never uppercase Gujarati.  
Never letterspace Gujarati.  
Never render Gujarati as an image.  
Preserve comfortable Gujarati line height.

## New selective machine notation

A small monospace utility treatment may be introduced **without adding a large new font dependency** if the existing system/native monospace stack is sufficient.

Use only for notation such as:

- `01 DESIGN`
- `02 MACHINE`
- `03 OUTPUT`
- `EMCAD / PATH`
- Machine Note indexes
- course indexes

Do not use monospace for body copy, navigation, buttons or giant spec-sheet layouts.

---

# 7. The Karma Stitch Icon system

Build a coherent reusable SVG icon family, roughly 15–20 branded icons, using the existing custom icon architecture where possible.

## Production

- needle
- needle-down
- thread cone
- bobbin
- hoop/frame
- machine head
- multi-head bed

## Technique

- bead
- sequence
- cording
- chain
- laser
- tuft
- zardosi/satin
- appliqué edge
- cross stitch

## Digitising

- vector node
- Bezier handles
- stitch density
- path direction
- registration mark

## Troubleshooting

- thread break
- misregistration
- density problem
- correction/pass

### Usability rule

**Branded concepts get niche icons. Universal actions keep universal icons.**

Keep:

- edit = pencil
- delete = trash
- print = printer
- search = magnifier
- back = arrow
- call = phone
- directions = map/navigation

Never make a visitor decode a clever embroidery symbol just to find Edit.

---

# 8. Eleven technique signatures

Every course gets a restrained, reusable visual/motion grammar. These signatures solve missing photography gracefully and make the catalogue coherent.

| Course | Signature |
| --- | --- |
| Zardosi Machine Embroidery | tight parallel metallic satin field with one restrained zari highlight |
| Flat Embroidery | precise running/satin field, clean direction changes |
| 4-Beads Machine Work | bead nodes attaching sequentially to a path |
| Sequence Work | overlapping perforated discs with one subtle reflective movement |
| Coding / Cording | thicker cord following a curved Bezier path |
| Chain & Multi | linked loop construction / multi-line rhythm |
| Appliqué & 3D | raised border + cut/edge construction |
| Cross Stitch | restrained crossing stitch lattice |
| Laser Work | precise trace followed by a clean cut edge; no sparks/fireworks |
| Tufting | loops rising from a baseline |
| EMCAD Embroidery Design | vector nodes → handles → stitch path |

Technique motion happens once on first meaningful reveal or interaction. No endless loops.

---

# 9. One canonical stitch language

Define shared primitives with consistent meaning.

## Running stitch

A fine dashed construction/progress rule with visible needle-penetration points.

**Meaning:** progress / connection.

## Thread path

A curved path connecting production stages.

**Meaning:** process / transformation.

## Knot point

A stronger node.

**Meaning:** decision / completion.

## Registration point

A crosshair or target mark.

**Meaning:** precision / reference.

## Broken path

A visually interrupted stitch path.

**Meaning:** failure / production problem.

## Thread tail

A short loose terminal line.

**Meaning:** editorial finish, used sparingly.

Do not scatter crosshairs, dots and stitch borders everywhere without semantic purpose.

---

# 10. Motion hierarchy

Animation must have a strict hierarchy.

## Level 0 — none

Use no animation for:

- long copy
- terms
- legal pages
- dense forms
- tables
- most admin surfaces

## Level 1 — functional feedback

- hover/press
- accordions
- validation
- filters
- action sheets
- active rows

## Level 2 — niche microinteraction

- bead attaches
- sequence disc shifts/reflects
- thread advances
- stitch underline completes

## Level 3 — section storytelling

- stitch path progress
- problem → correction
- design → machine

## Level 4 — signature moment

Hero / main Screen-to-Stitch interaction.

**Maximum one Level-4 experience per page.**

### Hard bans

- cursor-following coordinates
- scroll hijacking
- parallax for its own sake
- full-page viewport needle following the user
- autoplay sound
- confetti
- perpetual decorative loops
- fake machine dashboards

`prefers-reduced-motion` must show the final state immediately without loss of content.

---

# 11. Glass, aurora and surface texture

## Good glass

A translucent EMCAD/software panel layered over real machine imagery.

A small digital overlay such as:

- DESIGN
- MACHINE
- OUTPUT
- EMCAD
- CORRECTION
- FINAL

## Bad glass

Every card frosted. Every section floating. Generic glassmorphism.

## Aurora/glow

A restrained steel-blue/vermilion machine-light reflection may appear behind one technical hero or CAD panel.

No purple-blue SaaS blobs.

## Texture

At approximately 2–5% visual strength:

- cotton grain
- fine woven grid
- satin stitch field
- cross-stitch field
- thread density pattern
- laser grid

Texture should be felt before it is consciously noticed.

---

# 12. Explicitly rejected visual ideas

Do not implement any of the following unless the institute later supplies the real underlying fact:

- fake RPM
- fake stitch density
- fake GSM
- fake machine ratios
- fake CAD coordinates
- cursor-following coordinate readouts
- invented machine model/specification
- invented production capacity
- invented student earnings
- invented years of experience
- invented placement rates
- unsupported “premier”, “#1”, “best” or “world-class” claims

Also reject:

- an 8-course architecture
- WhatsApp as the only conversion path
- photo-upload instructions in the public footer
- heavy monospace everywhere
- Bodoni/Cinzel/Syne replacement identity
- constant viewport needle animation
- crosshairs on every card
- giant rigid technical grid on every page
- random dark inversion on hover
- machine-manufacturer-style visual identity
- stock photos
- generated fake studio photography

Karma must **show actual technical expertise**, not simulate technicality.

---

# 13. Photography placeholder architecture — FINAL 32-photo spec

Real photographs are expected after this redesign starts. Build the redesign around named photo slots now, but **do not use stock or generated substitutes**.

All media slots must support:

- known aspect ratio
- explicit width/height or aspect-ratio reservation
- crop-safe center framing
- responsive art direction
- descriptive placeholder label
- eventual `alt` content field
- eventual focal-point/object-position override if required
- no layout shift when real media replaces the placeholder

## Shoot rules

- subject/machine centered
- breathing/crop-safe space around subject
- natural light where appropriate
- sharp, not blurry
- originals transferred without WhatsApp image compression

## Hero — 3 × 1600×1200 horizontal

- `H1_EMCAD_SCREEN` — EMCAD screen with stitch design visible
- `H2_MACHINE_STITCHING` — needle working on fabric, hands may be visible
- `H3_FINISHED_PIECE` — clean final embroidery, ideally the same project as H1/H2

## Course media — 8 × 1600×1200 horizontal

The final photo brief explicitly covers these eight courses/stations:

1. Zardosi
2. 4-Beads
3. Sequence
4. Coding/Cording
5. Chain & Multi
6. Laser
7. Tufting
8. EMCAD station

Therefore the three catalogue courses with **no dedicated course photograph in this shoot** are:

- Flat Embroidery
- Appliqué & 3D
- Cross Stitch

Do **not** reuse another course’s image. Do **not** drop those courses. Their technique signature is their primary visual until a real photograph is supplied later.

## Student work — 6

- `G1` Bridal Zardosi panel — 900×1125 vertical
- `G2` Sequence dupatta — 1000×1000 square
- `G3` EMCAD design + final result — 1200×800 horizontal
- `G4` 4-Beads border close-up — 900×1125 vertical
- `G5` colourful tufted piece — 1000×1000 square
- `G6` laser-cut appliqué — 900×1125 vertical

Do not normalize these into identical card crops. The mixed aspect ratios are an asset.

## Trainers — 3 × 800×1000 vertical

- `T1_MAIN_TRAINER`
- `T2_EMCAD_TRAINER`
- `T3_FOUNDER`

All require consent.

## Studio / machines — 6

- `A1_MACHINE_FLOOR` — 1200×1500 vertical
- `A2_ENTRANCE_SIGNBOARD` — 1200×675 horizontal
- `A3_ZARDOSI_MACHINE` — 800×800 square
- `A4_BEADS_MACHINE` — 800×800 square
- `A5_LASER_MACHINE` — 800×800 square
- `A6_TUFTING_MACHINE` — 800×800 square

## Student stories — 2 × 800×1000 vertical

- `S1_STUDENT_STORY`
- `S2_STUDENT_STORY`

Capture “BEFORE → NOW” copy with consent when the real stories arrive.

## Screen-to-Stitch — 3 × 1200×675 horizontal

The exact same project across all three:

- `P1_DESIGN` — EMCAD
- `P2_MACHINE` — stitching
- `P3_RESULT` — finished embroidery

## Studio floor wide — 1 × 1280×720

- `F1_STUDIO_FLOOR_WIDE`

**Total = 32 real photographs.**

R2 is not activated for this. Public-media asset strategy is decided only after the actual files arrive.

---

# 14. Signature hero

The hero is the strongest visual moment on the site.

## Desktop

### Left

**FROM SCREEN TO STITCH.**

Design on screen.  
*Prove it* on the machine.

Compact verified facts:

- EMCAD DAHAO
- 3 Months
- Live Machine Practical
- Mota Varachha, Surat

Primary CTA:

**Book 2-Day Free Demo**

Secondary:

**Call for current batch**

Directions remains immediately accessible.

### Right

Use H1/H2/H3 as a connected production composition.

One continuous thread:

1. begins on the EMCAD screen
2. follows the digitised path
3. passes into the machine photo
4. reaches the needle
5. exits into the finished textile

Until photographs arrive, use named PhotoSlots in the exact composition.

## Mobile

Do not miniaturize the desktop collage.

Use a vertical story:

`01 SCREEN`  
H1

stitched connector

`02 MACHINE`  
H2

stitched connector

`03 RESULT`  
H3

The mobile experience must be simpler and clearer than desktop.

---

# 15. Screen-to-Stitch signature interaction

Create one reusable production rail.

## Desktop

`01 DESIGN → 02 MACHINE → 03 RESULT`

User may click or drag between stages.

No autoplay required.

The interaction should work with placeholders now and real P1/P2/P3 media later.

## Mobile

Vertical sequence. No horizontal drag requirement. Every stage reachable naturally through scrolling.

## Future reuse

The same component pattern may support:

`SCREEN → SAMPLE → PROBLEM → CORRECTION → OUTPUT`

This is stronger than a generic before/after slider because it expresses Karma’s actual production workflow.

---

# 16. Page rhythm: HUMAN / MACHINE / MATERIAL

Use this alternation to prevent long pages feeling monotonous.

- Hero — MACHINE + SCREEN — dark/technical
- Course decision — INFORMATION — warm/light
- Machine proof — MACHINE — technical
- Student work — MATERIAL — bright/editorial
- Production problems — TECHNICAL — structured
- Trainers — HUMAN — warm
- Studio — MACHINE — photography-led
- Stories — HUMAN/OUTCOME
- Final CTA — dark/authoritative

Dark surfaces are punctuation, not wallpaper.

---

# 17. Homepage architecture

Rebuild the homepage around a 30-second decision.

## 1. Hero

See §14.

## 2. Trust rail

Compact, source-attributed, no fake schema claims.

Potential owner-provided trust markers already in project context:

- Google rating owner-provided
- ~39K+ Instagram
- ~10K+ Facebook
- Mota Varachha, Surat
- Live machine training

Respect current verified/owner-provided distinctions.

## 3. How Karma teaches

A production rail:

`DESIGN → DIGITISE → SET → TEST → CORRECT → STITCH`

## 4. Machine index / course decision

All 11 courses. No repetitive 11-card wall.

Use a dense scalable index/ledger. Photography leads where available; technique signature leads where not.

## 5. The problems we teach you to solve

Examples based on real production knowledge:

- thread breaking
- design good on screen, bad on fabric
- sequence registration
- bad digitising forcing operator compensation
- density/pathing
- machine setup

## 6. EMCAD DAHAO decision block

Verified facts in one clear area:

- 3 months
- 4 batch-time options
- 2-day free demo
- 2-hour demo sessions
- ₹35,000 total
- ₹25,000 at admission
- ₹10,000 within one month
- 100% live practical machine training

No payment CTA.

## 7. Proof from the machine

Build the structure for:

`SCREEN → SAMPLE → CORRECTION → FINAL`

Use technical cases that are already factual; never invent a student/client claim.

## 8. Student work

Editorial mixed-ratio textile wall using G1–G6 placeholders now.

## 9. People on the machine floor

Not “Master Faculty.”

Use a phrase such as:

**Meet the people on the machine floor**

or simply:

**Your trainers**

Use T1–T3 placeholders until real people/content arrive.

## 10. Where you actually learn

Studio/machine evidence using A1–A6/F1 placeholders.

No invented machine specs.

## 11. Student stories

Use the `BEFORE → LEARNED → NOW` structure.

## 12. B2B studio bridge

“Already know what you need? We can produce it too.”

Keep Studio credible without diluting training conversion.

## 13. Visit / Maps / contact

Call, Directions, address, landmark, real studio context.

## 14. FAQ

Questions should sound like real prospects, especially Gujarati/Gujlish.

## 15. Final CTA

**Your design should not stop at the screen. Come prove it on the machine.**

---

# 18. Course catalogue — the Machine Index

The catalogue has **11 courses** and must remain scalable.

Do not build around the eight photographed courses.

Use a dense Machine Index / ledger with:

- index number
- course name
- family
- concise production outcome
- real verified duration/fee only where known
- live-practical cue
- technique signature
- photo if supplied for that course
- clear “View course” action

Example structure:

```
01
ZARDOSI
Metallic machine embroidery
[photo or stitch signature]
LIVE PRACTICAL
View course →
```

The result should scan like a workshop catalogue, not a university prospectus.

---

# 19. Course detail pages

Every course page should feel specific even before all facts/photos exist.

## Required hierarchy

1. What this technique produces
2. Who it is for
3. Technique signature
4. What production problems it solves
5. Machine/software relationship
6. Real live-practical explanation
7. Curriculum / skills
8. Samples / proof slots
9. Trainer slot where applicable
10. Current schedule/batch data
11. Fee data only when verified
12. Demo CTA
13. FAQ
14. Related Machine Notes
15. Related courses

## EMCAD page

This is the most complete factual page and should become the reference quality bar.

Show prominently:

- EMCAD DAHAO only
- 3 months
- batch options
- demo options
- curriculum
- practical training list
- ₹35,000 / ₹25,000 / ₹10,000 within one month
- no online payment
- admission norms access

## Other 10 courses

Do not copy EMCAD facts onto them. Use honest “confirm with studio” where needed.

---

# 20. Student work — material archive

The gallery should not be six identical cards.

Use the supplied mixed aspect ratios as an editorial textile wall.

For each real item later show only verified fields:

- technique
- course
- student name only with consent
- short production note
- optional “Designed in EMCAD · stitched on machine” only where true

Registration marks/crosshairs may frame selected media, but never every image.

---

# 21. Student stories — BEFORE → NOW

Use a factual case-study grammar:

### BEFORE
What the student did before.

### LEARNED
What was actually learned at Karma.

### NOW
What they do now.

Connected by a stitch path.

No generic “great institute” quotes as the main proof. No invented income or placement claims.

Until real consented stories arrive, preserve the current sample/placeholder truth policy from the actual code.

---

# 22. Trainers — people who run the floor

Avoid academic titles such as “Master Faculty.”

Use real operational credibility:

- role
- production specialty
- machine focus
- EMCAD focus if applicable
- teaching focus
- selected real work later

Do not invent years of experience.

T1/T2/T3 placeholders remain until real photography and owner-approved profiles arrive.

---

# 23. Studio / machines — evidence, not inventory marketing

Use A1–A6 and F1 as proof of a real place.

Message:

**WHERE YOU ACTUALLY LEARN**

- REAL MACHINE FLOOR
- LIVE PRACTICE
- MOTA VARACHHA, SURAT

Do not emulate machine-dealer pages.

If the institute later supplies real machine models, counts, head counts or production specs, add them as verified data then — not before.

---

# 24. Machine Notes — technical archive

This is where the “technical archive” aesthetic belongs most strongly.

A note may look like:

```
MACHINE NOTE / 018
SEQUENCE
WHY THIS SAMPLE SHIFTED
────────────────────
ISSUE
Registration

CHECK
Design path
Machine setup
Material
```

Use:

- small mono notation
- registration marks
- CAD nodes
- stitch diagrams
- technical hierarchy

Keep the body readable in Manrope/Noto Sans Gujarati.

Do not make the entire website look like this section.

All content must reinforce the current truth: Karma teaches **EMCAD DAHAO only**.

---

# 25. Admission experience

The admission form is functional already; redesign the experience without weakening its security or data model.

## Stitch progress

Use a meaningful progress line, for example:

`01 COURSE ━━━ 02 DETAILS ┅┅┅ 03 TERMS ┅┅┅ 04 DONE`

Completed = stitched.  
Current = needle penetration point.  
Future = faint construction line.

## Preserve current requirements

- course
- preferred timetable / demo slot
- student details
- required parent/guardian mobile
- age/context
- optional reference
- admission norms acceptance/version
- privacy/comms consent
- honeypot
- min-fill time
- idempotency
- rate limiting
- Turnstile-ready but not activated
- no PII analytics

Do not turn the public form into the entire paper admission sheet.

No animation on terms text or validation-heavy sections.

---

# 26. Buttons and conversion

## Primary CTA

**Book 2-Day Free Demo**

Vermilion.

Hover/focus may draw three tiny stitches under the label.

No glow halo.

## Secondary course CTA

**See EMCAD course** / relevant course action.

A thread/path may move subtly toward the arrow.

## Call

Standard phone icon.

## Directions

Standard map/navigation icon.

Utility stays obvious.

## Mobile fixed actions

Preserve the deliberate two-action model:

**CALL FOR DEMO** | **DIRECTIONS**

Do not reintroduce a five-tab app nav.

---

# 27. About page

The About page should feel like a real production studio story, not institutional boilerplate.

Structure around:

- why Karma exists
- what “Screen to Stitch” means here
- real studio environment
- founder/trainer placeholders now
- machine-floor operating philosophy
- EMCAD DAHAO specialization
- practical/live-machine teaching
- Surat context

Do not invent founding-year history until supplied.

---

# 28. B2B Studio / services

Keep the Studio side problem-led.

Use:

`REFERENCE → DIGITISING → SAMPLE → CORRECTION → MACHINE-READY`

Potential confirmed service vocabulary may include current B2B operations, but verify against current code/content before publishing.

No R2 activation. No fake uploads. No invented turnaround time or file formats.

The B2B visual system may use darker technical surfaces than course pages, but it must remain part of the same brand.

---

# 29. Contact / visit

Design around an actual visit decision.

Include:

- address
- landmark
- Call for demo
- WhatsApp as its separately configured channel
- landline
- Directions
- Maps listing
- social channels
- entrance/signboard placeholder A2
- studio context

Do not resolve the two-mobile role discrepancy by guessing.

---

# 30. Verify / certificates

Public verification should feel trustworthy and restrained.

Use:

- clear certificate status
- verification ID
- name/course facts already stored
- print/verification language
- no decorative animation beyond a restrained seal/stitch completion if useful

Do not make security/verification look like marketing.

---

# 31. Legal / terms / privacy

Keep these highly readable and low-motion.

The privacy page must reflect the current admission reality, including parent/guardian mobile collection, subject to owner/legal review already recorded in project context.

No visual gimmicks that interfere with legal comprehension.

---

# 32. Loading, empty, error and 404 states

Build niche-specific but restrained states.

## Loading

Small running-stitch motif.

Possible copy:

**Preparing stitch path…**

Do not block page render waiting for decorative animation.

## 404

Broken thread.

Headline:

**The thread ends here.**

Supporting:

**This page isn’t part of the current design path.**

CTA:

**Back to Karma**

## Empty states

Use truthful operational language, not cute illustrations.

---

# 33. Public footer

Keep it customer-facing.

Include:

- Karma identity
- EMCAD DAHAO training
- From Screen to Stitch
- address
- phone channels
- directions
- courses
- demo
- social channels
- language
- legal

Never include internal asset instructions such as “Send photos as Document.”

---

# 34. Karma Console — Machine Console direction

The admin should not copy the public site visually.

It should use the niche through **operational logic**, not decoration.

Think:

- compact merchant/operations app efficiency
- dense rows
- status lights
- numbered queues
- quick actions
- concise machine-floor language
- thumb-friendly mobile controls

Do not copy Swiggy branding or visual IP. Borrow the UX principle: useful density and action proximity.

## Example information density

```
BATCH 02                         RUNNING ●
EMCAD DAHAO
12:00–04:00
18 students · ₹40,000 due · 2 absent today
Attendance     Fees     More
```

## Admin visual restrictions

- no hero animation
- no giant textile backgrounds
- no frosted-glass dashboard
- no public-site aurora decoration
- no technique animations competing with work
- no generic SaaS admin template

---

# 35. Console shell redesign

Audit and redesign the shell for desktop + 360/390/430 mobile.

## Desktop

- dense but readable sidebar/navigation
- clear current location
- sticky operational context where useful
- compact page headers
- search/filter/action proximity
- high information density without visual noise

## Mobile

- first-class layout, not collapsed desktop
- no squeezed desktop tables
- record cards/rows designed for narrow screens
- action sheets for secondary actions
- safe-area support
- ≥44–48px functional tap targets inside visually compact rows
- no horizontal overflow

Preserve permission-aware navigation and server-side guards.

---

# 36. Today at Karma

Turn Today at Karma into the best operational screen in the product.

Prioritize actual work:

- new enquiries
- demos/follow-ups due
- today’s batches
- attendance status
- fee balances/due items
- design jobs needing attention
- certificates/tasks

Use queues and compact ledgers, not a wall of metric cards.

Do not add charts merely because dashboards “usually have charts.”

---

# 37. Admissions console

Redesign around quick lead handling:

- compact enquiry rows
- status
- course
- demo slot
- student + guardian contact
- next follow-up
- assigned person
- notes/activity
- archive/restore/delete policy from current record-actions architecture

Direct admission must remain available for walk-ins/phone/WhatsApp.

---

# 38. Students / Student 360

Design one compact operational identity for a student:

- identity/contact
- guardian
- enrolments
- fee agreement + balance
- attendance
- certificates
- notes/history
- print actions

Important information should be visible without five separate giant cards.

---

# 39. Courses & batches console

Make the operational model introduced by PR #24 visually excellent.

Course editor must clearly separate:

- public identity/content
- operational facts
- duration
- software
- fee agreement defaults
- timetable options
- demo rules
- curriculum/practical
- terms version
- visibility
- archive state

Batches remain actual dated running batches, distinct from standing course schedule options.

Preserve Add/Edit/Archive/Restore/Permanent Delete rules.

---

# 40. Fees console

This is manual money tracking, not payments.

Make each enrolment easy to read:

- agreed total
- discount
- received
- balance
- next due
- unpaid/partial/paid derived status
- receipt history
- overdue/short-admission indicators

Do not add online payment.

Prioritize receipt and statement printing.

---

# 41. Attendance console

Optimize for speed during a real class.

- batch context obvious
- student rows compact
- mark attendance quickly
- locked state unmistakable
- correction workflow clear
- mobile usable
- print register easy to reach

Do not add decorative animation.

---

# 42. Certificates console

Focus on:

- eligibility context
- issue action
- status
- verification
- A4 print
- revoke/history

No PDF/R2 workflow until R2 is explicitly activated.

---

# 43. Design Desk

Use production-job language:

- new
- review
- info needed
- quote prepared/sent
- approved
- in progress
- sample shared
- revision
- finalised
- delivered
- closed

Compact job rows, status timeline, client contact, production notes and print brief.

No fake file workflow while R2 is deferred.

---

# 44. Content Desk

Keep Content Desk a typed CMS, not a page builder.

Improve usability for:

- FAQs
- student work
- testimonials/stories
- homepage proof

Make consent and owner-verification states extremely clear.

When real photos/content arrive, Content Desk should make replacing placeholders straightforward without letting staff dismantle the design system.

---

# 45. Reports / exports / audit

Design for scanning and operational accountability.

- compact filters
- export actions
- audit events
- clear actor/action/time/entity
- no PII exposed beyond permissioned need

Permanent deletion tombstones remain durable.

Do not turn reports into a BI dashboard.

---

# 46. Team / permissions / account

Preserve:

- exactly one Owner
- at most five Admin seats
- explicit admin grants
- Owner bypass
- password-only access
- no MFA/TOTP gate
- Owner-only team administration

Improve clarity and mobile ergonomics only.

Do not alter auth architecture for design reasons.

---

# 47. A4 print system

Nine print surfaces already exist. Redesign/polish them only where needed, preserving the independent permission checks.

- filled admission form
- blank admission form
- fee receipt
- fee statement
- student record
- batch roster
- attendance register
- design brief
- certificate

Requirements:

- A4 portrait/landscape intentional
- black/white-friendly
- Gujarati typography correct
- repeating table headings
- no clipped columns
- signature blocks unsplittable
- no console navigation/actions
- practical office-printer margins

Do not prioritize decorative brand devices over legibility on paper.

---

# 48. Backend/data redesign principles

“Full redesign” does **not** mean replacing a working architecture.

Preserve:

- Supabase Postgres
- Drizzle
- Hyperdrive runtime path
- Supabase Auth
- current RLS lockdown
- current permission guards
- OpenNext/Cloudflare Worker deployment

## Audit opportunities during redesign

- N+1 queries
- over-fetching
- unbounded lists
- repeated queries per admin page
- missing pagination
- missing relevant indexes proven by query patterns
- duplicated derived state
- unnecessary client-side fetching
- expensive always-on animation JS
- server/client boundary mistakes

## Free-tier discipline

Prefer:

- server rendering where appropriate
- compact query shapes
- pagination
- indexed operational filters
- derived status instead of duplicated truth
- current JSONB only for bounded structured configuration
- Postgres for structured operational history, not blobs

Do not store photos/media in Supabase Postgres.

Do not create migrations merely to make UI code easier.

Migration `0004_course_operations` is already applied; inspect before adding anything.

---

# 49. Copy system

Rewrite the whole public and admin product where copy is generic, but preserve facts.

## Public tone

Direct.  
Technical.  
Practical.  
Commercial.  
Warm.  
Surat-local.  
Confident.

Avoid:

- unlock your creativity
- embark on your journey
- world-class
- best-in-class
- transform your passion
- generic college language

Prefer language like:

- Set it. Test it. Correct it. Stitch it.
- Learn the design. Run the machine. Read the result.
- See why a sample fails — and how to correct it.
- Bring the design off the screen.

## Gujarati

Natural Gujarati/Gujlish as the audience actually speaks. Keep common trade words in English where that is the floor language:

- EMCAD
- machine
- batch
- demo
- WhatsApp
- design
- sample

Do not produce formal textbook Gujarati just to achieve literal translation parity.

## Admin tone

Institute language:

- enquiry
- walk-in
- follow-up
- batch
- fees
- receipt
- હાજરી
- certificate
- design job

Never turn Karma Console into ERP jargon.

---

# 50. SEO and factual discipline

Redesign must not loosen the current structured-data policy.

Continue to exclude unverified:

- reviews/aggregate rating schema
- sample trainer Person data
- fees for unverified courses
- durations for unverified courses
- opening hours
- placement/outcome stats

EMCAD may use its verified `P3M` duration as current code allows.

SEO should emphasize real topics such as:

- EMCAD DAHAO embroidery training Surat
- embroidery design classes Surat
- machine embroidery training Surat
- practical embroidery machine training
- sequence / beads / zardosi / cording training where factually supported

Do not SEO-target Wilcom training as a Karma offering.

---

# 51. Accessibility

Every phase must preserve/improve:

- WCAG AA contrast
- visible focus
- semantic headings
- semantic links/buttons
- keyboard navigation
- reduced-motion
- 200% zoom usability
- no hover-only critical information
- meaningful alt text once real photos arrive
- Gujarati text as actual selectable text
- form error summary/focus behavior
- 44–48px important touch targets

Motion must never be required to understand the page.

---

# 52. Performance

Target a sub-2.5s LCP on a realistic mid-range mobile connection once real media is integrated.

Before photos:

- no layout shift from placeholders
- no large animation dependency
- CSS/SVG first
- IntersectionObserver only when necessary
- observers cleaned up
- no continuous expensive paint loops

After photos arrive:

- responsive sizes
- AVIF/WebP strategy
- explicit dimensions
- priority only for true LCP media
- lazy load below fold
- object-position/focal point where needed

Worker free-plan gzip limit remains 3 MB. Check with Wrangler dry-run after dependency changes.

---

# 53. Public/admin coherence formula

The public site is **story + proof + conversion**.

Karma Console is **density + status + action**.

They share:

- tokens
- typography DNA
- factual vocabulary
- stitch semantics in restrained ways

They do not share:

- hero treatment
- decorative motion
- photo-heavy composition
- public marketing surfaces

---

# 54. Final design balance

Use this as a creative calibration target:

- **55%** real production photography / future real media
- **20%** typography and editorial layout
- **12%** niche visual language
- **8%** motion
- **5%** material finish

Until the 32 photos arrive, the 55% media layer is represented by honest named PhotoSlots and technique signatures — **not fake imagery**.

If the final interface becomes 40% animation/vector decoration, it has failed.

---

# 55. Implementation phases

Claude must execute phases in order, one clean PR at a time unless a smaller split is clearly safer. Do not wait for visual approval between phases; the owner will review the completed system afterward.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Audit + Design System v4 “Machine Lab” foundation | ✅ Complete + merged |
| 2 | Global shell + hero + signature Screen-to-Stitch interaction | ✅ Complete + merged |
| 3 | Homepage full rebuild | ✅ Complete + merged |
| 4 | 11-course Machine Index + all course pages | ✅ Complete + merged |
| 5 | Proof ecosystem: student work, stories, trainers, studio/machines | ✅ Complete + merged |
| 6 | Admission + conversion + contact experience | ✅ Complete + merged |
| 7 | Machine Notes technical archive | ✅ Complete + merged |
| 8 | B2B Studio/services | ✅ Complete + merged |
| 9 | About, verify, legal, errors/loading/404, footer + secondary public pages | ⏳ Pending |
| 10 | Karma Console shell + Today at Karma + mobile operational system | ⏳ Pending |
| 11 | Admissions, Students, Courses/Batches, Fees admin redesign | ⏳ Pending |
| 12 | Attendance, Certificates, Design Desk, Content, Reports, Team admin redesign | ⏳ Pending |
| 13 | Backend/query/free-tier audit + copy/i18n/SEO consistency | ⏳ Pending |
| 14 | Accessibility/performance/responsive hardening + final whole-product creative audit | ⏳ Pending |

---

# 56. Phase 1 — Design System v4 “Machine Lab” foundation

## Deliver

- audit current public + admin primitives
- preserve existing token names where shared
- formalize Machine Lab additions
- branded icon set
- 11 technique signatures
- canonical stitch semantics
- mono utility notation
- material textures
- glass/aurora restrictions
- motion levels
- photo-slot manifest for all 32 slots
- no-stock/no-generated-photo enforcement/documentation

## Skill use

Use relevant frontend-design, UI/UX, accessibility, design-system and code-review skills.

## Acceptance

- no public page is required to be visually complete yet
- primitives render at 320/390/768/1440
- Gujarati overrides correct
- reduced motion correct
- no new heavy dependency

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-1-machine-lab-foundation` · **PR:** #28

### Audit findings that shaped the work

- `globals.css` is **shared with Karma Console**, so no v3 token could be
  renamed or retuned. Every v4 token is additive.
- `premium.css` is deliberately **unlayered** and therefore outranks every
  `@layer` in `globals.css`. A v4 primitive placed in `globals.css` would have
  lost silently to a v3 rule touching the same property. So v4 primitives live
  in a third stylesheet, `src/app/machine-lab.css`, also unlayered and imported
  **after** `premium.css` in both root layouts. A test asserts that order.
- `<PhotoSlot>` took a free-text label per call site. Two pages could describe
  the same shot differently, and a frame built for 3:2 would jump when a 4:5
  photograph arrived. Replaced by a typed manifest.
- `UnveilWatcher` already owned self-registering reveal for `.media-unveil` and
  `.stitch-wipe`; technique signatures joined it rather than growing a second
  observer.

### Components changed or added

| File | What |
| --- | --- |
| `src/content/photo-manifest.ts` | **New.** All 32 slots: id, group, intrinsic dimensions, shoot brief, alt guidance, course slug for the eight photographed courses. |
| `src/components/ui/Icon.tsx` | Extended from 15 to 43 icons: production, technique, digitising and troubleshooting groups, plus the deliberately ordinary universal actions. `ICON_NAMES` and `ICON_GROUPS` exported for tests. |
| `src/components/ui/TechniqueSignature.tsx` | **New.** Eleven signatures keyed by course slug. |
| `src/components/ui/StitchMark.tsx` | **New.** `<KnotPoint>`, `<RegistrationPoint>`, `<BrokenPath>`, `<ThreadTail>` + `STITCH_SEMANTICS`. |
| `src/components/ui/MonoNote.tsx` | **New.** `<MonoNote>` and `<StepIndex>`. |
| `src/components/ui/PhotoSlot.tsx` | Added `<ManifestPhoto>`; the free-text `<PhotoSlot>` stays so no existing page broke. |
| `src/app/machine-lab.css` | **New.** Notation, textures, glass, machine light, motion levels, signature motion, stitch marks, photo frames, reduced motion. |
| `src/app/globals.css` | `@theme` additions only: `--font-mono`, `--text-mono*`, `--dur-l1`…`--dur-l4`, `--ease-machine`, `--texture-ink`, `--texture-strength`. |
| `src/components/ui/Reveal.tsx` | Watcher now also observes `.sig-play`. |
| `vitest.config.ts` | `oxc.jsx.runtime = "automatic"` and a `.test.tsx` include, so a test may import and render a component. |

### Design decisions worth keeping

- **Branded concepts get niche icons; universal actions keep universal ones.**
  `pencil`, `trash`, `printer`, `search`, `arrow`, `phone`, `map` are ordinary
  on purpose, and a test forbids a branded icon standing in for one of them.
- **A stitched path cannot draw with `stroke-dashoffset`** — the dash pattern
  *is* the stitch, so animating the offset slides stitches along the seam
  instead of laying them down. Stitched signature elements wipe with
  `clip-path`; unstitched ones use `pathLength="100"` and a dash offset.
- **One glass treatment, no card variant.** Wanting a second frosted panel on a
  screen is the signal the first has stopped meaning anything.
- **No new font.** Machine notation uses the platform monospace stack; the
  project still imports exactly two `@fontsource` families, and that is tested.
- **Signatures build once and stop.** A catalogue page carries eleven of them,
  which would otherwise be eleven perpetual loops nobody asked for.
- **Nothing drawn carries a number.** No RPM, density, GSM, ratio, coordinate,
  model or head count in any icon or signature geometry.

### Tests added

`tests/machine-lab-system.test.tsx` — 36 assertions covering: the 32-slot
manifest (count, per-group counts, unique ids, real dimensions, briefs, the
eight course stations resolving to real courses, no photograph shared by two
courses, unknown ids throwing); photography honesty (no remote/stock host
anywhere, the no-stock rule stated where the next session reads it); the icon
family (all four groups present, 15–30 branded icons, universal actions kept
universal and never branded, no manufacturer named); the eleven signatures
(exactly the catalogue's slugs, each described and rendering, no invented
specification, no infinite animation, every hidden start state `.js`-gated);
stitch semantics (six distinct meanings, 9/6 geometry identical); and the v4
foundation (no v3 token renamed, no new font, Gujarati overrides that actually
undo uppercase and letterspacing, four motion levels and no fifth,
reduced-motion showing the finished state, glass restricted to one treatment,
texture strength inside 2–5%, machine light steel-and-vermilion with no SaaS
purple, stylesheet import order, and no new runtime dependency).

Policy assertions strip comments before matching, so a comment explaining
"no RPM, ever" cannot fail the test that bans RPM — otherwise the next session
would be taught to delete the explanation rather than keep the rule.

Because Phase 1 ships no finished page, nothing else would catch a primitive
that throws, so the file also renders every icon, every signature, every stitch
mark, every manifest frame and the notation components to static markup — and
checks each signature is fluid (a `viewBox` and no fixed `width`), so it holds
at 320, 390, 768 and 1440 alike.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (33 files, 430 tests) and
`npm run build` all green. No dependency added, so the Worker bundle is
unchanged.

---

# 57. Phase 2 — Global shell + hero + signature interaction

## Deliver

- public header
- mobile menu
- fixed two-action mobile conversion bar
- footer
- global dark/light rhythm
- hero desktop and mobile variants
- H1/H2/H3 PhotoSlots
- connected-thread hero path
- Screen-to-Stitch rail using P1/P2/P3 placeholders
- button microinteraction rules

## Acceptance

A visitor can understand EMCAD + machine + Surat + demo from the first screen without photography.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-2-shell-and-hero` · **PR:** #29

### The hero

The right side is the promise drawn literally: **one continuous thread** that
starts on the EMCAD screen (H1), passes into the machine (H2) and exits into
the finished textile (H3). It is one rail spanning the whole track with the
frames hanging off it — not three connectors that happen to line up — which is
why `<StitchRail>` was added to `StitchPath.tsx`: the same 9-on / 6-off stitch
with a penetration dot at every head, turned through 90°, at exact CSS-pixel
scale and any height. Laying it down is the page's **single Level-4 moment**,
and a test asserts nothing else on the homepage claims one.

**One markup tree at every width.** On a phone the three frames are the
vertical story the brief asks for (`01 SCREEN` / `02 MACHINE` / `03 RESULT`);
on a laptop the same list staggers beside the copy. There is no desktop collage
plus a mobile copy, and a test fails if breakpoint-gated visibility classes ever
wrap a whole composition in this file.

**The hero is now the page's MACHINE band** — dark, technical, textured — via
`.on-carbon`, which already re-points every palette token, so the frames,
rules, eyebrow and secondary button invert without a single dark-mode override
at a call site. A warm ivory hero read as a coaching centre.

### Facts, and the line that separates two kinds of claim

The hero carries four verified machine facts: EMCAD DAHAO · 3 months · live
machine practical · Mota Varachha, Surat. **"3 months" is labelled as the EMCAD
DAHAO course's own duration**, not floated as a site fact, because the other ten
courses have no confirmed duration and would inherit one just by standing next
to it. A test asserts the label carries that scope in both languages, and that
the hero quotes no fee and never restates three months as twelve weeks.

The Google rating and the Instagram/Facebook follower counts **moved out of the
hero** into `<TrustRail>`, one band below. Social proof and verified operational
facts are different kinds of claim, and mixing them in one row made the machine
facts read as marketing. The trust band attributes the numbers to the studio's
own pages and says in copy that they are not a verified review score.

### The Screen-to-Stitch rail

`<ProductionRail>` (`src/components/ui/ProductionRail.tsx`) is generic — the
stages are a prop, so the longer B2B chain (SCREEN → SAMPLE → PROBLEM →
CORRECTION → OUTPUT) reuses it rather than forking it. `01 DESIGN → 02 MACHINE
→ 03 RESULT` on the homepage supplies the copy and the P1/P2/P3 manifest slots.

The interaction decision worth keeping: **every stage's media is always visible
at every width, and the tabs drive one detail panel and nothing else.** That
single choice removes the usual tab/accordion problem — on a phone the rail is
just a vertical story with nothing hidden behind a gesture a thumb has to
discover, and on a laptop the same markup is a row with one stage explained
underneath. No autoplay, no drag requirement, no duplicated DOM, and tests
enforce all three.

### Page rhythm

`.band-machine` / `.band-material` / `.band-human` / `.band-info` in
`machine-lab.css`. The dark bands deliberately do **not** re-point the palette
themselves — `.on-carbon` owns that inversion, and a second dark-surface
implementation would drift from it within two phases. A test asserts no band
class declares a palette token.

### Buttons

`.btn-stitch` draws exactly three 9/6 stitches under the primary label on hover
and focus — 39px, the brand's own gesture at the size of a gesture. No glow
halo: a glow would be the only decorative light on the page. Reduced motion
shows the finished state.

### Files

| File | What |
| --- | --- |
| `src/components/home/Hero.tsx` | Rebuilt: machine facts, one thread, three manifest frames, dark band. |
| `src/components/home/TrustRail.tsx` | **New.** Social proof, attributed, on its own light band. |
| `src/components/ui/ProductionRail.tsx` | **New.** The reusable rail. |
| `src/components/home/ProductionRailSection.tsx` | **New.** Its homepage copy and slots. |
| `src/components/ui/StitchPath.tsx` | Added `<StitchRail>`. |
| `src/components/site/Header.tsx` | Mobile menu index is machine notation (`<StepIndex>`). |
| `src/components/site/Footer.tsx` | HUMAN band, machine notation on the column labels. |
| `src/app/machine-lab.css` | Sections 9–14: bands, hero, rail, buttons, trust band, vertical stitch. |
| `messages/{en,gu}.json` | `home.hero` rewritten, `home.trust` and `home.rail` added, both languages. |

The mobile conversion bar is untouched and still exactly two actions; a test
now fails if a third appears.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (34 files, 456 tests) and
`npm run build` all green. No dependency added.

---

# 58. Phase 3 — Homepage

Implement the full architecture in §17.

Do not use endless card grids. Use ledger/spec-grid/editorial/full-bleed compositions deliberately.

Acceptance is the 3/10/20/30-second decision model in §3.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-3-homepage` · **PR:** #30

### The order, and why

The page answers questions in the order people actually ask them, not in
brochure order: what is this → does anyone rate it → show me the claim → what
does the work involve → what can I learn → will it fix my problem → prove it →
what does it cost → what does a fee cover → when does it run → show me the work
→ who teaches and where → visit/FAQ → not a student → close.

### The EMCAD DAHAO decision block — the most valuable thing on the page

The studio confirmed one course's duration, timetable and fee in writing, so
the page states them instead of asking people to enquire about a number:
3 months · four batch timings · a free 2-day demo at 2 hours a session ·
₹35,000 total, ₹25,000 at admission, ₹10,000 within 30 days · live machine
practical throughout.

**Every figure renders from `src/content/course-operations.ts`.** Nothing is
typed into a message catalogue — the catalogues hold labels and sentences and
no numbers at all, and a test asserts that. A correction is therefore made in
exactly one file and the page cannot drift from the record.

**It names the one course they belong to** and says in its own copy that they
are not true of the other ten, because a fee block sitting above an
eleven-course index is exactly where a duration leaks sideways.

**No payment CTA.** Publishing a fee is not collecting it. The block states in
copy that there is no gateway, no payment link and no UPI request on this site
— which is where somebody hunting for a pay button will be looking. `<Investment>`
was rescoped to the institute-wide half of the money question (what a fee
covers) and its duplicate no-gateway box removed.

### The Machine Index

`src/components/courses/MachineIndex.tsx`, reusable by Phase 4's `/courses`
page. A row carries its index, media, name, what the technique physically
produces, its family, a verified duration where one exists, and a live-practical
cue. **Photography leads where the shoot covers a course; the technique
signature leads where it does not — same slot, same size**, so the three
signature-led courses are not visibly second-class and nothing about the layout
changes when the eight photographs land. No fee appears on a row, and a
duration appears only where the owner confirmed one.

### Proof surfaces

- **`<StudentWorkWall>`** — the six G-slots as a mixed-ratio editorial wall.
  Each frame asks the manifest for its own ratio: a bridal panel is tall, a
  dupatta is square, a screen-and-result pair is wide, and a uniform tile grid
  throws away the one thing worth showing about textile work. No student name,
  outcome or earning is attached to any frame.
- **`<WhereYouLearn>`** — A1/A2/F1 plus the four machine stations. Each station
  is named by the technique it runs **and nothing else**: no head count, no
  model, no RPM, no capacity. A test bans any number standing next to a machine
  word, and the copy says why the stations carry none.
- **`<Trainers>`** — T1–T3 reserved as frames that name the photograph they are
  waiting for. The distinction that makes that safe: a labelled empty frame is
  a visible work-in-progress; a card headed "Sample: lead trainer name" is a
  person who does not exist. No invented name, role or speciality.

### A rhythm bug the tests caught

`<BusinessBand>` and `<CtaBand>` were **both dark and adjacent** — and had been
since before this phase, while a comment claimed the page had "exactly two dark
bands". Two dark surfaces running together stop being punctuation. The audience
switch is now a steel edge on a light ground and the dark is saved for the
close. A test walks the rendered section order and fails if two dark bands ever
become adjacent again.

### Also

A sixth production fault (machine setup) joins the five already named. The
close uses the studio's own line. `home.workflow.s2d` now names EMCAD DAHAO in
full. Band rhythm across the page alternates MACHINE / MATERIAL / HUMAN / INFO,
every dark band followed by a light one.

⚠ **Carried to Phase 13:** `emCAD` still appears in `src/content/notes.ts`,
`src/content/collections.ts` and `src/lib/admin/courses-copy.ts`. The
site-wide rename to `EMCAD DAHAO` belongs with the copy/i18n/SEO consistency
pass, not with a homepage rebuild.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (35 files, 480 tests) and
`npm run build` all green. No dependency added.

---

# 59. Phase 4 — Courses

Rebuild:

- course index
- all 11 course pages
- technique signatures
- eight known course photo slots
- three intentional signature-led courses without photos
- factual duration/fees policy
- related Machine Notes/internal linking

No course should read as a generic duplicated template.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-4-courses` · **PR:** #31

### One index, two surfaces

`/courses` now renders `<MachineIndex>` — the same component the homepage
uses — grouped by family with continuous numbering across all eleven. The two
surfaces therefore cannot drift apart in what a course row is allowed to
claim: what the technique produces, its family, a duration only where the
owner confirmed one, and no fee at all.

A family heads with a **branded icon**, never with a technique signature. A
signature belongs to exactly one technique; borrowing one to head nine courses
would make the mark mean less than it does. A test enforces that.

### Photograph where there is one, signature always

The studio shoot covers eight of the eleven. Those eight lead their page, card
and index row with their own frame. The other three get **no substitute** —
never another course's photograph, never stock — and are not demoted for it:
the technique signature is on all eleven, at the same size in the same slot,
because it describes the structure of the stitch and is true of the technique
whether or not anyone has photographed it yet.

The signature caption is bilingual and lives in the message catalogues
(`courseDetail.signatures.<slug>`). `TECHNIQUE_SIGNATURES[].description` stays
as the English spec note the design system is written against — the two are
deliberately separate, and a test checks the page renders the catalogue one.

### Why no two of the eleven pages read the same

Everything above the fold is per-course: the technique's own signature, its own
photograph where one exists, what it physically produces, the faults its
training exists to fix, what it runs on, what the finished work sells as.
Tests assert that the produces line, the fault list, the output list, the
practice description and the machine description are **all distinct across all
eleven** — so a template with the nouns swapped would fail.

### The duration and fee policy, tested

Exactly one course has confirmed operational facts. The other ten carry
`durationMonths: null` and `durationWeeks: null` and say "ask the studio",
and a test fails the moment a second course gains a duration without the
owner's confirmation reaching `src/content/course-operations.ts`. No course
page offers a way to pay online.

### ⚠ A factual conflict found and recorded, not resolved

The site states "evening batches till 10:30 pm" — listed as verified — while
the EMCAD DAHAO timetable on the owner's printed admission material ends its
fourth slot at **23:00**. Both numbers came from the owner. Neither was
changed to match the other; the conflict is now an open question at the top of
`docs/content-checklist.md`, because which class ends when is the studio's
fact to state, not an engineer's to average.

### Naming

`emCAD` → `EMCAD DAHAO` on the surfaces this phase rebuilt: the course index
copy, its pathway and relate blocks, and the home and courses meta
descriptions. The remaining occurrences (`src/content/notes.ts`,
`src/content/collections.ts`, `src/lib/admin/courses-copy.ts`, and the
work/services/about/admissions copy) stay with Phase 13's consistency pass —
each phase renames the surfaces it rebuilds, and Phase 13 sweeps the rest.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (36 files, 500 tests) and
`npm run build` all green. No dependency added.

---

# 60. Phase 5 — Proof ecosystem

Rebuild:

- `/student-work`
- `/success-stories`
- trainer surfaces
- studio/machine proof
- machine-case proof
- homepage proof integrations

Use G/T/A/S/F placeholders exactly.

Do not invent factual identities/outcomes.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-5-proof` · **PR:** #32

### The material archive

`<MaterialWall>` (`src/components/work/MaterialWall.tsx`) is now shared by the
homepage teaser and `/student-work`, so the two cannot drift into two different
ideas of what a piece frame is. Six pieces, six shapes, each frame taking its
ratio from the manifest.

**Exactly one registration mark on the wall.** A registration mark means
"precision / reference" in this system; on every image it means nothing, and
that is how a technical language turns into wallpaper. The mark is a prop on
the wall rather than a decoration inside `<ManifestPhoto>` precisely so it
cannot spread, and a test counts it.

**The two galleries stay two things.** `<MaterialWall>` is the six photographs
the shoot is for: fixed slots, fixed ratios, no attribution.
`<WorkLedger>` is whatever staff published through Content Desk, with its
technique, course, production note and sample tags intact. Merging them would
mean either the shoot slots become deletable from an admin screen, or published
items lose their consent metadata.

### BEFORE → LEARNED → NOW

`<StoryCase>` now leads with the three-step arc on **one** stitch path — the
same 9-on / 6-off geometry as everywhere else, drawn once down the column
rather than as three connectors. The shape is the argument: something specific
was learned between one state and the other. The final step carries a
`<KnotPoint>`, because in this system a knot means "decision / completion",
which is exactly what NOW is. It is not a bullet.

A story whose LEARNED field is empty drops the step rather than rendering a
blank one; the extra `why` / `changed` detail moved below the arc and stays out
of teaser mode.

### Frames, never people

S1/S2 are reserved on `/success-stories` and T1/T2 map to trainer profiles **by
slug** — re-ordering the trainer list must never reassign a photograph to a
different person, and a profile with no mapping keeps its own shoot label
rather than borrowing a frame briefed for someone else. Every frame names the
photograph it is waiting for and nothing about who is in it; the manifest's own
alt guidance for both groups says the name goes on only with written consent.
Still no `Person` structured data anywhere.

### /about

The machine wall now gives each of the eleven techniques **its own signature**
instead of three shared family swatches: a swatch told a visitor which of three
buckets a course sat in, a signature tells them what the stitch does. The page
also gains the studio evidence — the floor wide and the entrance signboard —
with machines named by technique only and a line saying why there are no head
counts, speeds or model numbers.

### Two tests that were wrong, and the fix worth keeping

A blunt ban on the word "placement" failed on `learnedEn: "Placement,
tack-down and cover stitching…"` — appliqué vocabulary — and a ban on
"earning"/"placed" failed on the page's own honest disclaimer ("none of them
claims an income, a job or a placement") and on the word "replaced". Both were
narrowed to ban **the claim, not the word**: `job placement`, `placement
guarantee/assistance/record/rate/support`, `100% placement`, `job guarantee`,
plus salary/earnings/lakh/₹ — and scoped to the story DATA rather than the
page's framing copy, with a separate test asserting the disclaimer is present.
A test that fails on an honest disclaimer teaches the next session to delete
the disclaimer.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (37 files, 519 tests) and
`npm run build` all green. No dependency added.

---

# 61. Phase 6 — Admission + conversion + contact

Redesign:

- admission form experience
- admissions info page
- contact/visit
- demo decision surfaces
- call/directions/WhatsApp channel hierarchy
- terms presentation

Preserve all backend/security behavior.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-6-admission` · **PR:** #33

### The progress seam

`<StitchProgress>` replaces the filling bar. Three states, each meaning what it
means everywhere else in this system rather than being invented for this
screen: **done** is a finished running stitch (9 on, 6 off), **current** is a
needle penetration point, **future** is a faint construction line.

A filling bar says "you are 50% through a chore". A seam says two of four are
sewn and the needle is on the third — the same information, told in the
language of the trade the visitor is signing up to learn.

**Accessibility was not traded for this.** The container keeps
`role="progressbar"` with min/max/now and its label; the step list is
`aria-hidden` because it repeats what the label says; the form's own live
region and focus-move on step change are untouched. All asserted.

At 320px four labels do not fit, so only the current step keeps its text. The
numbers stay and the seam still shows how far along it is.

### Motion level 0 where it matters

The review step carries the consents, the admission-norms acceptance and every
validation error. Its enter animation is now off: nothing a visitor has to read
carefully and get right should be moving while they read it.

### Nothing in the defence was weakened

Honeypot, minimum-fill window, idempotency key, Turnstile-ready widget,
required parent/guardian mobile, the versioned norms acceptance, and the three
separate consents are all still there and now have tests that fail if one is
removed. A test also walks every `track()` call and fails if a typed value —
name, phone, guardian phone, area, reference — ever reaches analytics. The
minimum-fill check is asserted where it is actually enforced: on the server,
where a bot cannot skip it.

### The demo, stated as it runs

`<DemoFacts>` says what the free demo actually is: two days, two hours a
session, free, bring nothing, four times you can ask for. Every figure renders
from `src/content/course-operations.ts`; the catalogue holds labels and
sentences and no numbers, so the demo cannot be described one way here and
another way on the course page.

**The times are preferences, not inventory.** The studio keeps no per-date demo
capacity, so there is no date picker and no button that reserves anything, and
the copy says so plainly. A test fails if an input or a button appears in that
section.

### Fees, now that one is published

`/admissions` said fees "depend on the course and batch". That is now only half
true, so it says the EMCAD DAHAO fee is published in full and the other ten are
still shared in person, with a receipt, at the studio.

### Channel hierarchy

The email row carried a **thread spool**. Branded concepts get niche icons;
universal actions keep universal ones, and nobody standing on a footpath should
decode an embroidery symbol to find "email" — so an ordinary `mail` icon was
added to the universal group and directions now use `map`. Both mobiles are
still named by channel and never merged. The contact page gains the reserved
entrance/signboard frame: the address gets someone to the road, the signboard
gets them through the door.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (38 files, 537 tests) and
`npm run build` all green. No dependency added.

---

# 62. Phase 7 — Machine Notes

Make this the strongest technical-archive expression in the site.

Rebuild index and article templates without changing factual trade knowledge unnecessarily.

Use real semantic notation; no fake measurements.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-7-machine-notes` · **PR:** #34

### The notation, and its limit

`<NoteSpec>` renders the archive header:

```
MACHINE NOTE / 06
SEQUENCE WORK
──────────────────────
ISSUE   Registration
```

Full strength here and on the index, and **deliberately nowhere else**. A test
fails if `<NoteSpec>` appears on the homepage, the course index, a course page,
`/about` or `/contact`. If the whole site looked like this the notation would
stop meaning "this is a technical record" and start meaning "this is how the
brand decorates" — and the master plan says so in as many words.

The body stays in Manrope / Noto Sans Gujarati and stays readable. Mono is for
the notation around a note, never for the prose inside it.

### One new field, and why it is a label rather than a claim

`issueEn` / `issueGu` — the fault a note is about, in two or three words, drawn
strictly from that note's own body. It exists so an operator scanning eight
notes for the problem they are hitting today finds it without reading eight
answers. A test caps it at three words: a sentence there would be a second
answer competing with the real one.

**No measurement anywhere in the notation.** A test scans the component and all
sixteen issue labels for RPM, SPM, GSM, mm, stitches-per and `%`. The archive
earns its authority by being right about causes, not by printing numbers nobody
supplied.

The ISSUE row carries a **registration point** — precision / reference, the
mark's one meaning — and exactly one per note header.

### The index

A technical archive rather than a reading list: every row carries its note
number, its technique and its fault. Still not a blog — no dates, no bylines,
no "read more", asserted by test — because a note is either still true or it
gets corrected, and neither is a function of when it was written.

A note's number is the same on the index and on its own page, derived from the
append-only array in both places.

### Unchanged

Every note's trade knowledge, both languages, all eight course links, and the
absence of any named person, client, statistic or promised result. The
`TechniquePlate` in the note aside became that course's own
`<TechniqueSignature>`.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (39 files, 550 tests) and
`npm run build` all green. No dependency added.

---

# 63. Phase 8 — B2B Studio

Rebuild services around production problems and deliverables.

No fake file upload, no R2 activation, no invented turnaround or formats.

## Implementation record — merged 2026-08-30

**Branch:** `redesign/phase-8-studio` · **PR:** #35

### The chain

`<StudioRail>` shows **REFERENCE → DIGITISING → SAMPLE → CORRECTION →
MACHINE-READY** on the same `<ProductionRail>` the homepage uses for
DESIGN → MACHINE → RESULT. That reuse is exactly what the component was built
for in Phase 2 — its stages have always been a prop rather than three
hard-coded panels — so the B2B chain is a different set of stages, not a fork.

A business arrives with a situation rather than a browsing intent, and the
order the work goes in answers "can this studio handle my mess" faster than any
adjective can.

### Why these stages carry drawn marks

The owner's 32-shot list covers the school, not the studio's commercial
pipeline. Inventing five B2B photo slots would put five frames on the page that
nobody has been briefed to shoot; borrowing the school's frames would caption
commercial work with a classroom photograph. So `RailStage.photoId` became
optional and each stage carries a canonical stitch mark instead — and every one
means what it means everywhere else:

| Stage | Mark | Meaning |
| --- | --- | --- |
| Reference | registration point | precision / reference |
| Digitising | vector nodes | the file being built |
| Sample | running stitch | progress |
| Correction | broken path | failure / production problem |
| Machine-ready | knot point | decision / completion |

Tests assert that correction is the broken path and machine-ready is the knot,
because those two are the ones a later edit would be tempted to prettify.

### Three things this page still will not say

**No turnaround time, no file format, no price.** The studio has confirmed none
of the three (`docs/content-checklist.md`), and a B2B page that invents a
delivery window writes a cheque the floor has to cash. The copy asks for the
buyer's deadline and their machine's format instead of announcing ours, and
tests scan both catalogues for delivery windows (`within N days`, `same day`,
`24 hours`), for file extensions (`.dst`, `.emb`, `.pes`, …) and for `₹`.

**Still no file upload.** The brief form says so plainly rather than showing a
dead control; private file delivery waits on R2, which stays deactivated.

### Capability

The capability list is still generated from the course catalogue, so the page
cannot claim a technique the studio does not teach — and each entry now shows
that technique's **own signature** instead of a shared family swatch. A buyer
sees what the stitch does, not which of three buckets it sits in.

### Gates

`npm run typecheck`, `npm run lint`, `npm test` (40 files, 563 tests) and
`npm run build` all green. No dependency added.

---

# 64. Phase 9 — Secondary public system

Rebuild/polish:

- About
- Verify
- Privacy
- Terms
- 404
- global error
- loading
- footer
- any remaining public route

Ensure every EN route has GU parity.

---

# 65. Phase 10 — Console foundation

Rebuild:

- Console shell
- mobile console navigation/action behavior
- page header primitives
- dense record row
- status chip/light system
- filter/search bars
- desktop dropdown/mobile action sheet
- Today at Karma

No functional auth/permission changes unless fixing a demonstrated bug.

---

# 66. Phase 11 — Core operations admin

Redesign:

- Admissions
- Students / Student 360
- Courses & Batches
- Fees

Keep current archive/restore/delete and agreement-snapshot behavior.

---

# 67. Phase 12 — Remaining operations admin

Redesign:

- Attendance
- Certificates
- Design Desk
- Content Desk
- Reports/exports/audit
- Team/permissions/account
- A4 action entry points

No generic admin kit.

---

# 68. Phase 13 — Backend / data / copy / SEO audit

Perform a deliberate audit after the UI settles.

Check:

- query count
- N+1
- pagination
- unbounded admin reads
- duplicated state
- cache correctness
- permission checks
- archive/deletion policy consistency
- audit behavior
- PII exposure
- EN/GU copy quality
- stale Wilcom language anywhere outside the quoted admission rule
- SEO titles/descriptions/internal linking
- JSON-LD factual discipline
- analytics event coverage without PII
- served artifacts such as `llms.txt`, sitemap and robots

Do not change architecture just to satisfy a generic best-practice skill.

---

# 69. Phase 14 — Hardening + final creative audit

Audit every public/admin route at least at:

- 320
- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920

Review:

- overflow
- Gujarati wrapping
- motion
- reduced motion
- keyboard
- focus
- contrast
- loading
- empty states
- errors
- A4 print
- bundle size
- page rhythm
- repeated visual patterns
- generic copy
- excess cards
- excess dark sections
- fake technicality
- course specificity
- mobile conversion
- admin density

Then do one final independent creative-director pass asking:

> Does this feel like a real Surat commercial embroidery studio, or an agency concept for one?

Remove anything that answers “agency concept.”

---

# 70. PR workflow

For every phase:

1. start from latest `main`
2. create a dedicated feature branch
3. read relevant skills before implementation
4. implement only the phase scope plus necessary regressions
5. update this file’s status and add a concise implementation record
6. update `docs/project-context.md` and specialist docs when facts/architecture/major decisions change
7. run:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

8. run Wrangler dry-run if bundle-affecting dependencies changed
9. open PR
10. wait for GitHub CI + Cloudflare preview
11. fix every regression
12. merge only when required checks are green
13. continue immediately to the next pending phase

If the session limit interrupts work, stop only at a clean PR/phase boundary and leave this progress table accurate.

---

# 71. Infrastructure guardrails

This redesign must **not** activate or change:

- `karmadesignstudio.in`
- DNS/custom-domain routing
- Cloudflare R2
- Cloudflare Turnstile
- payment gateway
- Supabase project
- Hyperdrive architecture/binding name
- Supabase Auth architecture
- password-only admin decision
- RLS lockdown
- production deploy command

Do not deploy manually.

The custom-domain move remains a separate owner-gated launch task after final review.

---

# 72. Database guardrails

Migration `0004_course_operations` is already applied as of this plan’s creation.

Do not re-run it manually.

Any future schema change must:

- be additive unless explicitly approved otherwise
- use Drizzle schema + generated/reviewed migration
- preserve RLS lockdown
- preserve staff invariants
- avoid cascading destructive shortcuts
- document whether the migration was actually applied

Do not store media in Postgres.

---

# 73. Photography arrival round — later, not part of these 14 phases unless files arrive during execution

When the actual 32 images arrive:

1. verify filenames/content against §13
2. confirm consent for trainers/student faces/work
3. inspect actual dimensions/file sizes
4. choose public-media pipeline based on evidence
5. likely prefer optimized deployed static assets for a small rarely-changing public set unless R2 offers a real operational advantage
6. generate responsive AVIF/WebP variants or use the approved Next/OpenNext-compatible image strategy
7. replace PhotoSlots without restructuring layouts
8. art-direct focal points per breakpoint
9. write useful alt text
10. build OpenGraph/social-share artwork from real media
11. test LCP on mobile
12. do a real-photo visual polish pass

Do not use another studio’s images while waiting.

---

# 74. Final completion criteria

This redesign is complete when:

- every public page follows the Machine Lab identity
- every public page is coherent in EN and GU
- the hero tells Screen → Machine → Result clearly
- all 11 courses feel distinct
- EMCAD’s verified facts are clear within 30 seconds
- no fake technical metric exists
- no misleading Wilcom-training claim exists
- 32 real-photo slots are ready without layout shift
- the three non-photographed courses remain visually deliberate
- Machine Notes own the technical-archive aesthetic
- admin is compact, fast and first-class on mobile
- no permission/security behavior was weakened
- print workflows remain useful
- backend/query behavior is free-tier-conscious
- accessibility and reduced-motion are correct
- Worker bundle stays within free-plan limits
- CI and Cloudflare are green
- the site still uses Workers.dev and the custom domain is untouched

---

# 75. Final design formula

If there is ever uncertainty, come back to this ratio:

**55% real production**  
Machines, people, work, fabric.

**20% typography/editorial layout**  
Hierarchy, confidence, clarity.

**12% niche visual language**  
Stitch paths, nodes, technique signatures, material structure.

**8% motion**  
Explanatory, not decorative.

**5% material finish**  
Zari, pearl, sequence, fabric texture.

And one final test:

> **Does the interface demonstrate Screen-to-Stitch, or merely mention it?**

The finished Karma experience should demonstrate it.
