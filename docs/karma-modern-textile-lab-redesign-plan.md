# KARMA — Full Public Visual Rebuild
## THREAD / MACHINE / PROOF — a niche embroidery-training experience, rebuilt from composition upward

**Status:** AUTHORITATIVE OWNER-DIRECTED RESTART — implementation must restart from Phase 0  
**Rewritten:** 2026-08-31  
**Repository:** `optimisticjp/Karma`  
**Current baseline when this was written:** `main` at `d910c871293737ee508b159e10ff834d0148d14d`  
**Owner correction:** the partially implemented “Modern Textile Lab” direction from PRs #55–#58 is **not approved as the visual solution**.  

This file replaces the previous contents of `docs/karma-modern-textile-lab-redesign-plan.md` completely.

It is the authoritative owner direction for the next public-site implementation.

---

# 0. STOP — understand what changed before touching code

The owner stopped the previous Claude session after Phase 4 because the implementation was moving in the wrong direction.

The problem was not that the code was technically careless. The problem was product/design interpretation:

- it was **reskinning and repairing the existing visual system**;
- it reused the existing structure too heavily;
- it treated a token bridge and stylesheet override as if that constituted a new visual identity;
- it spent substantial effort expanding the public locale system to Hindi, which the owner does **not** want;
- it was preserving too much of the existing component composition instead of rebuilding the public experience from first principles.

The owner now wants:

> **A COMPLETE NEW PUBLIC LOOK.**
>
> Not another polish pass.  
> Not another token retune.  
> Not another wrapper around the current sections.  
> Not an AI/template website.  
> Not a generic design-school website.

The finished public site must be recognisably built for **Karma Design Studio & Classes — machine embroidery, EMCAD DAHAO, live production machines, fabric, stitch, thread, samples and Surat textile work.**

The permanent business idea remains:

# FROM SCREEN TO STITCH.

**Design on screen. Prove it on the machine.**

The new visual system must make that idea feel physical, useful and memorable.

---

# 1. Owner corrections — these override PRs #55–#58 and older public-design plans

## 1.1 Website languages are English + Gujarati ONLY

Public website locales are exactly:

- `en`
- `gu`

No Hindi website locale.

This is a direct owner correction and supersedes PR #58.

Important distinction:

- **Website UI:** English + Gujarati only.
- **Teaching/support reality:** Karma may still teach/support students in Hindi where that is a verified business fact.

Do not delete a truthful “Gujarati + Hindi teaching/support” business fact merely because there is no Hindi website translation.

Do remove Hindi as a routed/public UI language.

## 1.2 Light mode only

The public website is a **light-mode product**.

No large dark hero.
No large charcoal Services hero.
No dark footer.
No black interstitial bands.
No “dark mode” visual identity.

Dark ink remains text/icon colour.
Small dark technical marks may exist when functionally justified.
The public experience must read as light, tactile, fresh and contemporary.

## 1.3 This is a visual rebuild, not a reskin

The new implementation must replace public page composition and visual primitives.

A route is not considered redesigned because:

- its background token changed;
- its existing cards got smaller;
- its old sections got new borders;
- the old `className`s still define the visual hierarchy under a new token scope;
- old components are wrapped in a new shell;
- a new stylesheet overrides old CSS while the underlying visual composition remains unchanged.

The route must be rebuilt when its current markup/composition belongs to the old visual system.

## 1.4 Future logo colour must not break the site

The visual system must be **logo-neutral and accent-adaptable**.

A future Karma logo may be:

- black;
- red;
- blue;
- green;
- metallic/gold;
- multicolour;
- another owner-selected palette.

The site must still look intentional.

Therefore:

- logo sits on a neutral light surface;
- do not place the logo permanently on a strong brand-colour block;
- do not make the whole website visually dependent on matching one red logo;
- chromatic UI is controlled through a replaceable brand accent layer;
- photographs, textile work and material provide most colour;
- the system must still work beautifully in near-monochrome.

## 1.5 Karma Console is NOT part of this visual restart

Preserve the compact post-PR-#53 Karma Console.

Public CSS and public components must not leak into `/admin`.

No admin redesign in this plan.

---

# 2. What the stopped Claude run actually changed — and the disposition

The owner stopped after PR #58.

Merged work from the rejected direction:

- PR #55 — rendered audit
- PR #56 — IA + public `/batches` route
- PR #57 — `src/app/textile-lab.css` token-bridge design system
- PR #58 — Hindi public locale + navigation/language rebuild

## 2.1 Keep what is factual/useful

The following may survive if still correct:

### Rendered audit data

`docs/modern-textile-lab-audit.md` contains useful measurements.

Treat it as historical/current-state evidence, not as visual direction.

### Public `/batches` route

The route is conceptually useful.

It reads real database rows rather than fabricated demo rows.

Keep the route/data contract unless a better implementation preserves the same function.

**Rebuild its visuals from scratch.**

### “Real rows or nothing” batch policy

Keep it.

Never invent seats, dates, trainer assignments or weekend availability.

## 2.2 Undo Hindi public-locale work

PR #58 introduced Hindi public routing and content.

The connected Supabase project was checked on 2026-08-31 after the owner correction.

The database enum `public.locale` is still:

`{en,gu}`

Therefore `drizzle/0005_trilingual_locale.sql` was **never applied**.

Phase 0 must remove the unapplied Hindi migration cleanly before any future `db:migrate` can pick it up:

- remove `drizzle/0005_trilingual_locale.sql`;
- remove its unapplied Drizzle snapshot;
- remove its journal entry;
- restore the repo migration state to the already-applied `0004` baseline;
- remove `messages/hi.json`;
- remove Hindi from routing/sitemap/hreflang/public locale types;
- remove the Devanagari web-font dependency introduced only for the Hindi site;
- remove Hindi-only tests;
- revert public-locale DB/schema TypeScript changes whose only purpose was a `hi` website submission;
- restore `CLAUDE.md`, `docs/project-context.md` and other durable docs to **bilingual EN/GU website** language.

Do **not** create a database “rollback migration” for `hi` because `0005` never reached the database.

Do **not** remove truthful support for Hindi as a teaching/student preference if a field semantically represents teaching language rather than website locale.

## 2.3 Replace, do not extend, the rejected public design-system implementation

`src/app/textile-lab.css` from PR #57 is not the approved final visual system.

Do not continue layering more overrides onto it.

The next implementation should either:

1. replace it with the new public visual layer; or
2. delete it after the new system has migrated every caller.

The public site must not finish with four generations of CSS fighting through source order.

Old design-system code may remain only where another product such as Karma Console still genuinely needs it.

---

# 3. Required reading before implementation

Every implementation session must read in this order:

1. `CLAUDE.md`
2. `docs/project-context.md`
3. **this file — completely**
4. `docs/design-system.md`
5. `docs/content-checklist.md`
6. `docs/admin-architecture.md`
7. `docs/security.md`
8. `docs/operations.md`
9. `docs/karma-compact-density-redesign-plan.md` — history/lessons, not current visual authority
10. `docs/karma-machine-lab-redesign-master-plan.md` — history/brand reasoning, not current visual authority
11. `src/content/course-operations.ts`
12. `src/content/admission-terms.ts`
13. `src/content/photo-manifest.ts`
14. actual current code for every route/component being replaced

Where an older document conflicts with this file on public visual design, public locales, public navigation or public composition, **this file wins**.

Where this file conflicts with security/data/auth/factual rules in `CLAUDE.md`, those non-visual safety rules still win unless this file explicitly records a new owner decision.

---

# 4. Use Claude’s skill library properly

The repository contains the vendored `.claude/skills/` library.

Use skills selectively for:

- frontend design
- UI/UX
- visual design systems
- responsive/mobile design
- accessibility
- copy/humanization
- i18n
- forms
- SEO
- performance
- testing/TDD
- code review
- context engineering

Do not invoke dozens of skills for ceremony.

Do not let a generic skill introduce:

- shadcn/ui;
- a generic dashboard kit;
- a generic landing-page template;
- a giant animation framework;
- a chart library;
- a new state-management framework;
- a page-builder dependency.

Karma’s own rules win.

---

# 5. Reference-site research — borrow principles, never appearance

The owner supplied a reference pool across the US, UK and India.

The research goal is **not** “make Karma look like one of these schools.”

The goal is to understand why good education/design sites make decisions easy and creative work believable.

## 5.1 Reference pool supplied by owner

United States:

- Noble Desktop — https://www.nobledesktop.com/
- Miami Ad School — https://miamiadschool.com/
- BrainStation — https://brainstation.io/
- General Assembly — https://generalassemb.ly/
- School of Visual Arts — https://sva.edu/

United Kingdom:

- University of the Arts London — https://www.arts.ac.uk/study-at-ual/short-courses
- Media Training Ltd — https://mediatraining.ltd.uk/
- Escape Studios — https://www.escapestudios.ac.uk/
- Academy Class — https://academyclass.com/
- City Lit — https://www.citylit.ac.uk/

India:

- Frameboxx — https://frameboxx.in/
- Pearl Academy — https://www.pearlacademy.com/
- DesignBoat School — owner-provided reference
- Srishti Manipal Institute — https://srishtimanipalinstitute.in/
- MAAC — https://www.maacindia.com/

## 5.2 Research findings to borrow

### Noble Desktop — decision density

Useful pattern:

- schedule-first browsing;
- course/date/time/duration visible together;
- strong filtering;
- clear “what is available next” mental model;
- practical copy over poetic marketing.

Karma application:

- real batch information becomes easy to scan;
- course decision facts appear early;
- no visitor hunts through five sections for a timetable.

Do not copy Noble’s visual branding.

### UAL — strong hierarchy without card clutter

Useful pattern:

- disciplined typographic hierarchy;
- clear course sub-navigation;
- course description + booking action visible early;
- creative institution feels confident without explaining itself in twenty decorative modules.

Karma application:

- stronger page hierarchy;
- fewer generic cards;
- decisive course information close to title/CTA.

Do not copy UAL’s black visual identity; Karma is light-mode.

### City Lit — starting-date and course-detail clarity

Useful pattern:

- “choose a starting date” is a real product task;
- date/time/location/duration sit together;
- jump navigation reduces blind scrolling;
- rich detail lives lower on the page rather than blocking the decision.

Karma application:

- `/batches` and course pages make real schedule rows/timings obvious;
- sticky/scrollable local navigation on long course pages.

### Media Training — operational confidence

Useful pattern:

- course level/duration/mode facts are concrete;
- calls to choose dates/course level are straightforward;
- real reviews and operational facts build trust better than decorative “why us” cards.

Karma application:

- show verified practical facts;
- build trust from real machine/course information;
- never invent proof just to fill the layout.

### Miami Ad School — editorial personality

Useful pattern:

- bolder art-direction voice;
- program identity feels creative and aspirational;
- student/portfolio culture is visible;
- typography creates attitude rather than endless decoration.

Karma application:

- student work and textile output carry emotional energy;
- course family pages can have distinct rhythm;
- copy can be confident and short.

Do not copy their career claims or exact visual language.

### Escape Studios — production proof

Useful pattern:

- real work/showreel/industry production is central;
- course details and outcomes are supported by media;
- “studio environment” is shown through evidence.

Karma application:

- real machine floor and finished stitch are proof, not decoration;
- Screen → Machine → Proof becomes the signature demonstration.

### Academy Class — taxonomy and level discovery

Useful pattern:

- strong grouping by tool/topic/level;
- user can find an appropriate course path quickly;
- navigation supports a large catalogue without forcing giant cards.

Karma application:

- use the existing real families: `machine`, `modern`, `software`;
- make all 11 courses easy to browse.

### BrainStation / General Assembly — polished conversion system

Useful pattern:

- clear primary next step;
- modular program discovery;
- consistent polished interactions;
- schedule/instructor/event information appears in predictable structures.

Karma application:

- one primary action per context;
- consistent interaction grammar;
- no CTA soup.

### Pearl Academy / Srishti — editorial education credibility

Useful pattern:

- program families and creative disciplines have editorial presence;
- work/curriculum/program identity can coexist without looking like ecommerce cards;
- design education can feel serious without becoming corporate software UI.

Karma application:

- course catalogue can feel like a textile sample book / studio index rather than product cards.

### MAAC / Frameboxx — local decision convenience

Useful pattern:

- easy course-family discovery;
- direct enquiry;
- clear local centre/location actions.

Karma application:

- Surat/Mota Varachha/location/visit are practical conversion assets;
- local visitor should never wonder where the studio is or how to contact it.

## 5.3 Explicit anti-copy rule

Do not reproduce:

- reference-site colour systems;
- exact headers;
- exact card shapes;
- exact animations;
- copyrighted artwork;
- proprietary layouts;
- slogans;
- review/proof numbers;
- program claims.

The references teach **product clarity and creative confidence**.

Karma’s visuals come from embroidery.

---

# 6. New creative thesis: THREAD / MACHINE / PROOF

Internal design-system name:

# THREAD / MACHINE / PROOF

It is not necessarily a public headline.

It is the rule for composing the site.

Every important public page should express some combination of:

### THREAD

Material, stitch, beads, sequence, cord, loops, fabric, texture, human craft.

### MACHINE

EMCAD path, machine head, needle, frame, production station, setup, troubleshooting.

### PROOF

Finished sample, student work, real batch information, fee facts, studio, machine output.

This is more specific than “Modern Textile Lab” and less generic than “creative institute.”

The site should feel like a **working embroidery studio made digital**.

---

# 7. Anti-template / anti-AI visual rules

The following patterns are banned unless a specific page genuinely needs them:

- centered hero + paragraph + two buttons + three identical cards;
- giant 70px+ mobile headline;
- gradient blobs;
- purple/blue SaaS aurora;
- glassmorphism cards;
- generic icon-in-circle benefit grids;
- repeated 3-column feature cards;
- pill chips everywhere;
- fake dashboard metrics;
- fake “trusted by” logos;
- fake counters;
- abstract stock 3D objects;
- generic student-with-laptop stock photos;
- random floating shapes;
- every section fading upward;
- bento layout merely because it is fashionable;
- enormous rounded 24–32px cards as the universal primitive;
- alternating left/right marketing sections repeated six times;
- “unlock your creativity” copy;
- “transform your passion” copy;
- “world-class” claims;
- “industry-leading” claims without evidence;
- fake career outcomes;
- invented batch scarcity;
- invented trainer credentials;
- invented technical machine metrics.

A screenshot should not be identifiable as “AI landing page 2026.”

---

# 8. Logo-neutral brand architecture

This is a core owner requirement.

## 8.1 Neutral shell

Header, footer and primary page surfaces use neutral materials:

- warm white;
- paper white;
- ink;
- soft warm grey/sand;
- fine neutral borders.

The logo should never require a matching background colour to look correct.

## 8.2 Replaceable accent system

Create a public-scoped accent layer such as:

- `--brand-accent`
- `--brand-accent-strong`
- `--brand-accent-soft`
- `--brand-on-accent`

Default can remain a restrained thread vermilion/red family because it suits embroidery and current Karma history.

But the layout must remain attractive if those variables become:

- blue;
- green;
- purple;
- copper;
- gold;
- black;
- another accessible owner colour.

Do not use accent as a large background blanket.

Use accent for:

- primary CTA;
- active stitch path;
- current state;
- small key markers;
- selected tab/filter;
- micro-interaction.

## 8.3 Status colours remain separate

Success/warning/error must not derive from brand colour.

Operational meaning stays stable.

## 8.4 Logo component contract

Build the public header so a future logo asset can drop in without redesign:

- reserved mark/wordmark slot;
- supports horizontal or compact mark;
- sensible max height;
- no forced recolour unless asset explicitly supports it;
- current text/mark fallback remains usable until logo arrives;
- logo container stays neutral.

---

# 9. Surface and colour system — light mode

The new site is not “beige everywhere.”

It uses a restrained material palette with contrast and structure.

Suggested starting families — final values must be contrast-tested:

### Worktable Canvas

Warm near-white.

Purpose:

- main page canvas;
- quiet background.

### Paper

Pure or nearly pure white.

Purpose:

- forms;
- course decision surfaces;
- media mats;
- schedule rows.

### Fabric Wash

Very pale warm textile tone.

Purpose:

- alternate sections;
- sample/work context.

### Machine Mist

Very pale cool neutral.

Purpose:

- EMCAD/software/process areas;
- gives digital contrast without a dark panel.

### Ink

Near-black neutral.

Purpose:

- headings;
- body emphasis;
- icons;
- technical linework.

### Muted Ink

Accessible medium-dark grey.

Purpose:

- secondary copy;
- metadata.

### Brand Accent

Replaceable.

Default thread vermilion family.

Purpose:

- action;
- stitch/progress;
- selected state.

### Metallic/technique colours

Do not make them permanent UI accents.

Copper/silver/pearl may appear inside technique illustrations only.

## 9.1 No full-width dark surfaces

This rule is absolute for this redesign.

Services must also remain light.

Commercial mode is expressed through:

- denser grid;
- sharper rules;
- different composition;
- technical copy;
- machine/process visuals;

—not a black hero.

---

# 10. Typography

Typography should feel contemporary, confident and easy to scan.

Keep the strong multilingual foundation rather than chasing novelty fonts.

## English

Manrope remains the default unless a real side-by-side design exploration proves another font materially improves the work.

## Gujarati

Noto Sans Gujarati remains first-class.

Never uppercase Gujarati.
Never letterspace Gujarati.
Never squeeze Gujarati into Latin line-height assumptions.

## Editorial accent

Use Playfair italic only if it adds a human/material interruption.

Maximum sparing use.

Do not build the identity around serif headlines.

## Scale targets

Mobile starting range:

- Hero H1: 34–40px
- Page H1: 28–34px
- H2: 23–28px
- H3: 18–21px
- Body: 15.5–17px
- Metadata: 12–14px
- Buttons: 14–15px

Tablet:

- deliberately compose, do not just interpolate mobile.

Desktop starting range:

- Hero H1: 54–68px depending on line length
- Page H1: 44–56px
- H2: 32–42px
- H3: 22–27px

Use `clamp()` where appropriate.

Avoid tiny machine-manual typography as the dominant voice.

Small mono notation may remain for genuinely technical labels only.

---

# 11. Layout system

## 11.1 390px-first

Design every public component from ~390px outward.

Then deliberately compose:

- 320
- 360
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1440

## 11.2 Tablet is its own design state

768–1024 must not be:

- mobile stretched wider;
- desktop squeezed smaller.

Use:

- 2-column editorial splits;
- horizontal sample strips;
- 60/40 decision layouts;
- 2–3-column visual proof where appropriate;
- navigation that expands only when it truly fits.

## 11.3 Desktop width

Target readable content around 1180–1240px.

Use wider media selectively.

Do not increase padding and heading sizes merely because space exists.

## 11.4 Rhythm

Aim for a confident but compact editorial rhythm.

Typical mobile section separation:

32–56px depending on importance.

Not every section gets the same gap.

Hero/signature proof may breathe more.

Course lists, schedules and notes should be denser.

---

# 12. New niche visual grammar

The visual identity must come from embroidery mechanics, but remain usable.

Create a small, coherent set of primitives.

## 12.1 Thread Line

A thread/stitch rule connecting related states.

Use for:

- section transitions;
- process;
- selected tab underline;
- form progress.

Not on every heading.

## 12.2 Needle Point

A small penetration/knot point indicating:

- current step;
- exact selected point;
- completion junction.

## 12.3 Hoop Window

A controlled circular/elliptical crop inspired by the embroidery frame.

Use occasionally for:

- stitch macro;
- trainer/machine detail;
- transition between screen and fabric.

Do not make every photo circular.

## 12.4 Stitch Swatch

Technique-specific compact visual texture.

One per course.

Examples:

- Zardosi: tight metallic/satin lines;
- Beads: sequential nodes;
- Sequence: overlapping perforated discs;
- Cording: thick guided curve;
- Chain: linked loops;
- Laser: cut-trace edge;
- Tufting: raised loop field;
- EMCAD: path nodes and control handles;
- Flat: dense clean field;
- Appliqué/3D: layered edge/raised panel;
- Cross Stitch: structured X grid.

These are identity assets, not substitute photographs pretending to be work.

## 12.5 Sample Strip

A horizontal textile-sample rail useful for:

- homepage course explorer;
- course families;
- technique browsing.

This should feel like a physical sample book rather than ecommerce cards.

## 12.6 Machine Frame

A clean square/rectangular media frame with very restrained registration marks.

Do not cover every image in CAD crosshairs.

## 12.7 Batch Board

Schedule information should feel like a studio wall/production board:

- course;
- real date if known;
- real time;
- real status;
- direct action.

No fake scarcity.

## 12.8 Work Tile

Student work is image-first.

Caption is secondary.

No generic testimonial-card treatment.

## 12.9 Thread Progress

Admission form progress can use stitch logic:

`COURSE ━ DETAILS ┅ TERMS ┅ DONE`

Completed = stitched.
Current = needle point.
Future = construction line.

## 12.10 Universal UI stays universal

Search = search.
Menu = menu.
Phone = phone.
Location = location.
Edit = pencil.
Delete = trash.
Print = printer.

Do not force users to decode embroidery metaphors for common actions.

---

# 13. Motion system

The site should not animate like a generic Framer template.

## Level 0 — static

Long copy, forms, legal, schedules, tables.

## Level 1 — functional

- menu open;
- accordion;
- tabs;
- validation;
- hover/press feedback.

## Level 2 — niche microinteraction

- stitch line advances;
- bead node appears;
- sequence disc shifts subtly;
- arrow moves 2–3px;
- path node activates.

## Level 3 — storytelling

Screen → Machine → Proof transition.

Maximum one signature storytelling interaction per page.

## Rules

- no cursor followers;
- no scroll hijack;
- no infinite decorative loops;
- no constant parallax;
- no glowing cards;
- no marquee wallpaper;
- no animation merely because a section enters viewport;
- `prefers-reduced-motion` must render a complete usable final state.

---

# 14. Navigation — rebuild for the new site

Public navigation should be simple enough to understand in one glance.

## Desktop

Recommended primary destinations:

- Courses
- Batches
- Student Work
- Machine Notes
- Services
- Studio

Then:

- EN / ગુજરાતી language control
- Book Free Demo

Home is the logo/brand link.

Contact can remain in menu/footer/Studio pathways rather than competing in the primary row if width demands it.

## Mobile header

Around 56px.

Structure:

`Brand/Logo | EN/ગુ | Menu`

No Hindi option.

## Mobile menu

Dedicated mobile navigation, not the desktop row wrapped into multiple lines.

Rows:

- Courses
- Batches
- Student Work
- Machine Notes
- Services
- Studio
- Contact

Primary demo action remains obvious.

## Language control

With only two locales, do not over-engineer a giant language bottom sheet.

Use a polished two-language switch/action that:

- clearly shows `EN` and `ગુ`/ગુજરાતી;
- preserves current route;
- remains keyboard accessible;
- has 44px touch target;
- uses no flag;
- does not dominate the header.

---

# 15. Mobile conversion strategy

Do not turn the entire marketing site into an app tab bar.

Use contextual conversion.

High-intent routes such as:

- EMCAD/course detail;
- `/admission`;
- `/admissions`;
- `/batches`;

may use a compact sticky action dock:

**Book Free Demo | WhatsApp**

General pages can rely on inline CTA + menu/footer.

Contact first viewport must expose:

- Call
- WhatsApp
- Directions

Keep existing distinct phone-role facts.

Never collapse mobile numbers into one role without owner confirmation.

---

# 16. Homepage — rebuild from a blank composition

The current homepage must not be visually edited section by section.

Recompose it.

The target is approximately **7–8 purposeful blocks**, not 19–20.

## 16.1 Hero — 30-second decision

### Desktop

Asymmetric composition.

Left/content side:

**FROM SCREEN TO STITCH.**

Short explanation, for example in meaning:

Karma teaches embroidery design where the file meets the production machine.

Do not use that exact sentence if stronger EN/GU copy emerges, but preserve the meaning.

Verified quick facts:

- EMCAD DAHAO
- Live machine practical
- Mota Varachha, Surat
- 2-day free demo — clearly tied to EMCAD if necessary to avoid scope confusion

Primary CTA:

**Book Free Demo**

Secondary:

**Explore Courses**

Visual side:

one composed Screen → Machine → Proof scene using the existing photo slots / stitch swatches.

Not three enormous empty rectangles.

The real photos later replace the reserved slots without structural changes.

### Mobile

First viewport should contain:

- compact header;
- headline;
- 2–3 lines support;
- small 2×2 fact cluster or concise fact strip;
- primary CTA;
- meaningful beginning of the signature visual.

The user should understand Karma before the first full scroll.

## 16.2 Entry paths — integrated, not generic cards

Use a compact stitched index such as:

### Learn embroidery
Courses · demo · batches

### Improve production
Techniques · Machine Notes · troubleshooting

### Need commercial design work
Karma Studio · brief · WhatsApp

This may be part of the hero tail rather than a giant separate section.

## 16.3 Course Sample Book

Do not show all 11 giant cards on the homepage.

Use the real taxonomy:

- machine
- modern
- software

Show a compact curated subset based on canonical display order — never “popular” unless proven.

Interaction should feel like browsing textile technique samples.

CTA:

**Explore all 11 courses**

## 16.4 Signature Screen → Machine → Proof

One project, three states:

01 SCREEN
EMCAD path

02 MACHINE
needle / production

03 PROOF
finished textile

Desktop:

- interactive rail/tabs/scrub that does not require precision dragging.

Mobile:

- swipe/scroll-snap or compact stacked stages.

No autoplay required.

This is the page’s strongest interaction.

## 16.5 EMCAD decision panel

Make the verified course easy to decide on.

Only EMCAD DAHAO gets these verified facts:

- 3 months
- ₹35,000 total
- ₹25,000 admission amount
- ₹10,000 balance within one month
- 2-day free demo
- four normal timetable options
- EMCAD DAHAO only

No payment gateway.

The panel should feel practical, not like SaaS pricing.

## 16.6 Proof Wall

Combine proof rather than create separate “why us / studio / gallery / machine” marketing sections.

Use:

- student-work photo slots;
- machine-floor photo slots;
- technique swatches;
- real machine-practical facts.

No fake review section if no approved real reviews are available.

## 16.7 Current batches / visit

Use real rows from the database.

If none exist:

honest empty state + demo/contact.

Pair with:

- location;
- directions;
- visit cue.

## 16.8 FAQ + conversion close

Compact FAQ.

Final CTA.

Light footer.

That is enough.

---

# 17. Courses index — textile sample catalogue

The full 11-course catalogue belongs here.

Do not use a generic responsive card grid as the primary layout.

Preferred visual model:

**sample-book index + technique preview**.

Each course entry can contain:

- index number;
- course name;
- family;
- technique swatch/photo slot;
- one short factual/outcome line;
- duration only when verified;
- clear action.

Filters:

- All
- Machine
- Modern / Special Techniques
- Software

Use real taxonomy labels from source.

Mobile:

- dense list/sample hybrid;
- no giant 16:9 card per course.

Desktop:

- selected-preview split is allowed if accessible and useful;
- still make every course directly reachable without hover dependency.

All 11 remain.

---

# 18. Course detail — decision first, detail second

Rebuild the template.

## Above the fold

Show:

- course name;
- family/technique;
- real software/machine context;
- verified duration only when known;
- fee only when known;
- free demo only where applicable;
- location;
- primary action;
- visual technique/photo proof.

For the ten courses without confirmed duration/fee:

render nothing or truthful “ask us” copy where appropriate.

Do not fill blank cells with guesses.

## Page navigation

Use sticky/scrollable section navigation for long pages:

- Overview
- What you learn
- Machine practice
- Syllabus/topics when verified
- Student work when real
- Batches when real
- Fees when verified
- FAQ

Only render sections that have real content.

## Desktop

A sticky decision rail is allowed:

- CTA;
- verified facts;
- current batch if real.

## Mobile

Contextual action dock:

Book Free Demo / WhatsApp where relevant.

---

# 19. Public Batches — schedule board, not marketing page

Keep `/[locale]/batches`.

Rebuild visually.

Use a compact studio schedule board.

Real fields only.

A row may expose:

- course;
- start date if real;
- timing;
- days if real;
- language if stored/real;
- status;
- seat information only when meaningful real capacity exists.

Filters are data-driven.

Do not render empty filters.

Example:

If there is no weekend batch in current data, there is no Weekend filter.

Empty state:

**No current batch has been published yet. Book a demo or WhatsApp the studio for the next opening.**

Translate naturally into Gujarati.

---

# 20. Admissions information + admission form

## `/admissions`

Decision page, not a wall of marketing copy.

Explain:

1. Book demo
2. Visit/use machine
3. Choose course/batch
4. Admission

Surface real EMCAD fees/timings in the correct course context.

Terms/admission norms can live in expandable/detail treatment.

## `/admission`

Keep backend/security behaviour.

Rebuild the UI like a good registration desk:

- clean paper surface;
- strong field labels;
- compact step progress;
- groups that fit phone screen;
- no giant card around every field;
- Next/Submit reachable;
- terms readable without a giant scroll block;
- guardian number remains required by current business rule.

Preserve:

- honeypot;
- minimum time;
- rate limiting;
- idempotency;
- consent;
- terms version;
- validation;
- Turnstile-ready flow without activating Turnstile.

---

# 21. Student Work — strongest visual proof page

When real photos arrive this should become one of Karma’s most convincing pages.

Until then, preserve exact 32-shot placeholders and technique visuals.

Use an editorial wall / masonry-like layout that respects real aspect ratios.

Do not force every work into one card size.

Filters only for categories with real published work.

On detail/open state, show available real context such as:

- technique;
- course;
- screen/path;
- machine stage;
- finished result;
- student only when consented/verified;
- learning note only when real.

No invented project metadata.

---

# 22. Machine Notes — useful workshop knowledge, not “technical archive theatre”

The previous site leaned too hard into technical-manual aesthetics.

Keep Machine Notes as a credibility asset but make it approachable.

Visual direction:

**workshop notebook + diagnostic sketch**, light mode.

Index:

- search;
- category chips only where useful;
- issue-first headlines;
- concise excerpt;
- technique/software label;
- computed reading time if correctly derived.

Article:

Use problem-solving structure where the real note supports it:

- What you see
- What to check
- Why it happens
- How to correct

Small technical diagrams are welcome.

No fake machine numbers.
No fake case IDs.
No “engineering terminal” aesthetic.
No giant monospace blocks.

---

# 23. Services — commercial studio, still light

Services must look different through composition, not dark mode.

Use:

- crisp worktable white;
- slightly cooler technical wash;
- tighter grid/rules;
- Screen → Brief → Design → Proof workflow;
- commercial examples when real.

Headline direction:

**Need embroidery design, digitising or production correction?**

Explain:

- what client sends;
- what Karma does;
- what client receives;
- workflow.

Do not invent:

- file formats;
- turnaround;
- price;
- machine capacity.

CTA:

**Send a design brief**

Secondary:

**WhatsApp**

No public upload while R2 remains deferred.

---

# 24. Studio / About

The page should make a visitor feel they understand the place.

Use:

- studio floor photo placeholder;
- machine stations;
- real teaching approach;
- EMCAD DAHAO;
- real languages/support;
- location;
- trainer portraits only when real/approved;
- founder story only when supplied.

No generic “faculty” cards.
No fake biographies.
No fake years of experience.

Desktop may use one controlled sticky image/story moment.

Mobile must be normal flow.

---

# 25. Contact / Visit

First phone viewport must expose practical actions.

Heading:

**Visit Karma Design Studio**

Show:

- address;
- landmark;
- Call;
- WhatsApp;
- Directions.

Do not publish a clean “today’s hours” claim until the 10:30/11:00 conflict is resolved.

Then:

- map/wayfinding;
- what happens on a first visit;
- short enquiry/demo action.

No giant contact form if a call/demo action is more useful.

---

# 26. Footer

Light.

Compact.

Useful.

Contains:

- Karma identity;
- From Screen to Stitch;
- Courses;
- Batches;
- Student Work;
- Machine Notes;
- Services;
- Studio;
- Contact;
- address;
- phones with correct roles;
- Directions;
- WhatsApp;
- Instagram/Facebook;
- EN / Gujarati;
- Privacy / Terms.

No asset-shoot instructions.
No internal operations language.
No giant footer slab.

---

# 27. Copy rebuild — entire public site

This is not just a visual task.

Rewrite the public copy where the current text is:

- verbose;
- repetitive;
- generic;
- written to explain the design concept rather than help the visitor;
- “technical” for appearance rather than usefulness;
- obviously AI-like;
- formal in Gujarati when a natural studio voice is better.

## 27.1 English voice

Direct.
Practical.
Confident.
Specific.
Warm.
Commercial.

Examples of the *type* of sentence wanted:

- Learn the design on screen. Test it on the machine.
- See the stitch before you decide.
- Choose the batch that fits your day.
- Bring a production problem. Learn what to check.

These are tone examples, not mandatory copy.

Avoid:

- unlock your creativity;
- transform your passion;
- embark on your journey;
- world-class;
- premier;
- best-in-class;
- become a master;
- guaranteed career;
- limitless possibilities.

## 27.2 Gujarati voice

Natural Surti Gujarati/Gujlish.

Trade words remain familiar when that is how the institute speaks:

- EMCAD
- machine
- batch
- demo
- design
- sample
- WhatsApp

Do not produce literal bureaucratic Gujarati when natural spoken wording is clearer.

## 27.3 Copy hierarchy

A normal section should need:

- one strong heading;
- one short explanation;
- facts/actions.

Not:

heading + eyebrow + mono label + long paragraph + subheading + another paragraph.

---

# 28. English + Gujarati i18n contract

Return the public app to bilingual parity.

Requirements:

- `routing.locales` = `['en','gu']`;
- `messages/en.json` and `messages/gu.json` mirror all public keys;
- no `messages/hi.json`;
- sitemap/hreflang only EN/GU;
- no `/hi` route generation;
- route-preserving EN/GU switch;
- correct `<html lang>`;
- Gujarati script safeguards remain tested.

A helper that improves bilingual content access may remain if it is actually useful after Hindi is removed.

Do not preserve complexity solely because it was recently written.

---

# 29. Photography architecture — 32 exact slots remain

The studio’s final photo list remains authoritative.

Expected:

**32 photographs**

Current:

**0 real files added**

Do not add stock.
Do not generate fake Karma images.
Do not borrow other institutes’ work.
Do not activate R2 for public photos.

The 32 slots include:

- 3 Hero
- 8 Course
- 6 Student Work
- 3 Trainers
- 6 Studio/Machines
- 2 Student Stories
- 3 Screen-to-Stitch
- 1 Studio Floor

Known eight course-photo subjects:

- Zardosi
- 4-Beads
- Sequence
- Coding/Cording
- Chain & Multi
- Laser
- Tufting
- EMCAD station

No dedicated shot in this shoot for:

- Flat Embroidery
- Appliqué & 3D
- Cross Stitch

Those three must look intentional using Stitch Swatches until real media is acquired.

## Placeholder presentation

Placeholders should feel like **reserved art-direction frames**, not broken images.

They may show:

- photo slot name;
- aspect ratio;
- restrained technique swatch;
- a subtle “studio photo reserved” cue.

Do not show giant dashed empty boxes everywhere.

When real photos arrive, replacing the file must not require a page redesign.

---

# 30. Factual policy — unchanged and strict

## Verified EMCAD facts

Only EMCAD DAHAO Embroidery Designing currently has owner-confirmed:

- 3 months;
- ₹35,000 total;
- ₹25,000 at admission;
- ₹10,000 balance within one month;
- four standard batch timings;
- 2-day free demo;
- 2-hour demo session;
- EMCAD DAHAO only;
- practical curriculum already recorded.

Do not copy these to the other ten courses.

## Reviews

No fake review.
No fake count.
No AggregateRating until properly verified.

## Trainers

No fake name.
No fake profile.
No fake years.

## Student work/stories

No fake student identity or outcome.

## Opening time conflict

Still unresolved:

- general “evening batches till 10:30 pm”
- EMCAD fourth slot `8:00–11:00 PM`

Do not reconcile by guessing.

## Payment

No online payments.

No UPI checkout.
No payment link.
No Razorpay/Stripe.

---

# 31. Backend and architecture — preserve the working system

A full visual rebuild does not mean rebuilding the backend.

Preserve:

- Next.js 15;
- React 19;
- TypeScript strict;
- Tailwind 4;
- next-intl;
- Supabase Auth;
- Supabase Postgres;
- Drizzle;
- Hyperdrive;
- OpenNext;
- Cloudflare Workers;
- RLS strategy;
- existing forms/security;
- Content Desk;
- course operations;
- admission terms;
- audit;
- archive/delete system;
- A4 print system;
- Karma Console.

Use existing central operational facts rather than duplicating them.

The redesign may refactor public content helpers/components when that produces a cleaner source of truth.

Avoid schema migrations unless genuinely necessary.

The Hindi cleanup in Phase 0 should not require a new DB migration because the connected database never received `0005`.

---

# 32. New public component architecture

Do not keep a giant pile of old components and override their CSS indefinitely.

Build a coherent new public component family.

Exact filenames may differ, but conceptually the system needs:

- `PublicHeader`
- `PublicMobileMenu`
- `LocaleSwitch`
- `HeroProof`
- `FactCluster`
- `EntryPathIndex`
- `SampleStrip`
- `StitchSwatch`
- `ThreadLine`
- `NeedlePoint`
- `HoopWindow`
- `ScreenMachineProof`
- `CourseIndexRow`
- `CourseDecisionRail`
- `BatchBoard`
- `BatchRow`
- `WorkTile`
- `WorkWall`
- `NoteCard`
- `StickyActionDock`
- `ThreadProgress`
- `FAQDisclosure`
- `VisitPanel`
- `PublicFooter`

Use composition, not a universal Card component, as the visual system.

## Migration strategy

A route may temporarily use old and new components during its own PR.

At the end of the full redesign:

- delete unused old public components;
- delete dead public CSS;
- no stale visual generation should remain loaded “just in case.”

---

# 33. Accessibility

The new look must remain genuinely accessible.

Required:

- semantic headings;
- keyboard navigation;
- visible focus;
- 44px-ish important touch targets;
- proper labels;
- status not colour-only;
- reduced motion;
- no horizontal overflow;
- no focus trapped behind sticky dock;
- scroll padding for sticky chrome;
- adequate contrast;
- Gujarati glyphs never clipped;
- menus/dialogs restore focus correctly;
- tabs/accordions use correct semantics.

Do not sacrifice legibility for compactness.

---

# 34. Performance / free-tier discipline

No new dependency unless it clearly earns its cost.

Prefer:

- CSS;
- SVG;
- native `<details>` where appropriate;
- small React interactions;
- server components;
- existing helpers.

Avoid:

- GSAP unless absolutely necessary — currently it is not;
- animation libraries;
- carousel libraries for simple scroll snap;
- icon packages when current icon system covers needs;
- component kits.

Run Worker size after bundle-affecting phases.

Remain comfortably under the 3 MB gzip free-plan limit.

---

# 35. Implementation workflow — RESTART from Phase 0

The prior phase statuses in the rejected plan are obsolete.

Do not resume at old “Phase 5.”

Start at **Phase 0** below.

Each phase should be one focused PR unless two tiny adjacent phases are clearly safer together.

Every phase:

1. start from latest `main`;
2. read current code;
3. select only useful skills;
4. implement the whole phase;
5. update this file’s phase record;
6. update durable docs when rules change;
7. run:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

8. use rendered-browser checks for visual phases;
9. run Wrangler dry-run after bundle-affecting work;
10. open PR;
11. wait for GitHub CI and Cloudflare preview;
12. merge only when both are green;
13. continue without waiting for owner review unless a real owner fact blocks implementation.

---

# Phase 0 — Recovery from the stopped implementation

**Status:** ✅ Complete — PR #61, merged as `5709308`

Product rules are back on the corrected owner direction. No visual work was
done, deliberately.

## The Hindi website is gone

Removed: `messages/hi.json` (860 leaves), `hi` from `routing.locales`,
`LOCALE_NAMES` and `OG_LOCALE`, the `@fontsource-variable/noto-sans-devanagari`
dependency and its lockfile entry, the Devanagari `@font-face` and every
`:lang(hi)` rule in `textile-lab.css`, and `tests/mtl-trilingual.test.ts`.

hreflang and the sitemap needed no edit: PR #58 had already made both derive
from `routing.locales`, so removing the locale removed the alternates. That is
the one piece of PR #58 worth keeping on its merits — a hreflang set that
disagrees with the sitemap is worse than none, and deriving both from one
source is what stops them disagreeing.

## The unapplied migration

`drizzle/0005_trilingual_locale.sql`, `drizzle/meta/0005_snapshot.json` and the
journal entry are deleted; the journal ends at `0004_course_operations` again.

**It was never applied.** The plan's §2.2 records that the connected Supabase
project was checked after the owner correction and `public.locale` is still
`{en,gu}`, so there is nothing to roll back — and no rollback migration was
written, because `ALTER TYPE … ADD VALUE` has no `DROP VALUE` and a migration
attempting one would fail on a database that never gained the value.

`tests/public-locales.test.ts` now asserts the journal has no unapplied entry,
that every journal entry has both a SQL file and a snapshot on disk, and that
every SQL file on disk has a journal entry — a file without an entry never
runs, and an entry without a file crashes `db:migrate`.

## One live defect fixed on the way

PR #58 widened the TypeScript `localeEnum` to three values **ahead of** the
migration that would have widened Postgres. Because that migration never ran,
`main` shipped a Console student form offering a "Hindi" preferred-language
option that would have thrown on save, against a column whose database enum
does not contain the value. The option, its two copy labels and the widened
enum are gone, and the test suite now asserts the enum matches what Postgres
actually has. **Widen a `pgEnum` only in the same change as an applied
`ALTER TYPE`, never ahead of one.**

Also reverted for the same reason: the `hi` option on the design-brief locale
select, and `z.enum(["en","gu","hi"])` in the two public form schemas. The
`toAdminLocale()` narrowing helper in `src/lib/auth/staff.ts` existed only to
defend against a value the enum can no longer hold, and went with it.

## What was deliberately NOT removed

**Karma teaches in Gujarati and Hindi.** That is a confirmed business fact and
has nothing to do with the website's locale set. `TEACHING_LANGUAGES` in
`src/lib/schema.ts` still publishes `availableLanguage` / `inLanguage` as
`["gu","hi","en"]`, the FAQ still answers "Gujarati and Hindi" to "which
language is training in?", and the catalogue still records
`ગુજરાતી + Hindi` as the class language. A test asserts all of it survived,
and asserts the constant is **not** derived from `routing.locales` — deriving
it would silently tell a crawler the studio cannot teach a Hindi speaker.

`src/lib/i18n/localized.ts` is kept and narrowed to EN/GU. Its reason for
existing is not the third locale: the ternary it replaces renders a *missing*
Gujarati field as English, indistinguishable from a translated one. It now
warns instead. `scriptLang()` is kept for the same reason it was written —
YouTube feed titles from the studio's Gujarati channel rendering unmarked
inside an English document.

The `/batches` route and its "real rows or nothing" data contract are
untouched, per §2.1. Its **visuals** are rebuilt in Phase 5.

## Disposition of the rejected design system

`src/app/textile-lab.css` is **kept for now and replaced in Phase 1**, not
deleted here. Deleting it in this PR would break every public route
immediately, since roughly ninety files still resolve their colours through
its token bridge — and a recovery PR that leaves `main` visually broken helps
nobody. Phase 1 builds the replacement and migrates the callers; Phase 11
deletes what is then dead. Only its Hindi-specific parts were removed here.

`docs/modern-textile-lab-ia.md` carries a superseded header naming exactly
which of its sections are now wrong and why, and `docs/modern-textile-lab-audit.md`
is annotated as evidence rather than direction. Both are kept: deleting the
record of a rejected direction is how a project rediscovers it a year later.

## Docs and tests

`CLAUDE.md` non-negotiables #1 and #15 and its roadmap section, and
`docs/project-context.md` §7, §8, §38 and §46, are back on a bilingual public
website and now point at this plan and its addendum. §38 records the owner's
widened sample-content authorisation.

New suite `tests/public-locales.test.ts` (24 assertions) is the regression
guard: the routed set is exactly `["en","gu"]`, no `messages/hi.json`, no `/hi`
segment in the app tree, no Devanagari face on any of the four stylesheets, no
Devanagari string in either catalogue, one catalogue per routed locale and no
orphans, the migration journal is clean, the enum matches the database, and the
teaching languages survived. `tests/machine-lab-secondary.test.tsx`'s route
parity assertion is a hard `toEqual(["en","gu"])` again — a locale is a product
decision, and that is where it should be made rather than discovered.

**861 tests pass** across 57 files. Typecheck, lint and build clean.

---

# Phase 1 — New THREAD / MACHINE / PROOF foundation

**Status:** ✅ Complete — PR #62, merged as `79b28d8`

A real public design system, in one file, that declares its own values instead
of re-pointing somebody else's.

## `src/app/textile-lab.css` is deleted, not layered under

The rejected system's only live effect was its token bridge. A class-usage
sweep found the truth of it: of everything it defined — `.surface-*`, `.tex-*`,
`.lab-row`, `.lab-tabs`, `.thread-divider`, `.action-bar` — **exactly one
class was used by any component** (`.lab-sheet`, by the language chooser).
Everything else was dead on arrival. That is the clearest possible evidence for
the owner's judgement that it was a reskin.

`src/app/thread-machine-proof.css` replaces it. The public root imports three
sheets instead of four, and a test asserts the file is gone and the import with
it.

## The one idea, made structural

**Two material registers rather than one palette.** A WARM CLOTH register —
canvas, cloth — for work, samples, studio and people; a **COOL MACHINE**
register — mist, mist-deep — for EMCAD, files, digitising and process. The old
public palette was warm everywhere, which is how a site about digital design
files reads as a craft blog. Anything about the screen now sits on the cool
ground, and a visitor learns the distinction without being told it.

## Logo-neutral, and arithmetic rather than aspiration

Four variables carry every chromatic decision. A test enumerates **every hex in
the stylesheet** and fails on one that is not a declared token, so "nothing
else hardcodes a hue" is enforced rather than intended.

Two reds, because the measurement demanded it: `--brand-accent` `#D4462E`
measures 3.57–4.45 on the five grounds — fine for a stitch line or a 40px
number, not fine for a button label — and `--brand-accent-strong` `#B8321C`
measures 4.80–5.98 everywhere and carries white at 5.98. The split is also true
to the subject: the brighter red is the thread, the deeper red is the decision.

Four alternates were checked before the palette was written and are recomputed
on every test run: blue `#1F5FA8` (6.08 on canvas / 6.44 with white), green
`#1F6B43` (6.11 / 6.48), gold `#8A6A12` (4.77 / 5.06), black `#14171A`
(16.97 / 17.99).

**One muted ink, no per-surface variant** — `#5A6169` clears the 4.5 body floor
on the deepest of the five grounds, precisely so there is nothing to forget.
The previous system needed a "deep step" swapped in on its sand surface.

Status colours stay independent of the brand and clear 4.99:1 everywhere.

## Type computed from the plan's own numbers

Every clamp interpolates between §10's mobile target at 390 and its desktop
target at 1440. Rendered: hero h1 **36 → 62**, page h1 **31 → 50**, h2
**25 → 37**, h3 **19.5 → 25**, body **16 → 17**, meta **13.5 → 14.5**, buttons
**15 → 15.5**. A test asserts both target ranges and that **no level crosses
the one below it at any of ten widths** — a real bug from the previous system,
where two clamps with different slopes made a heading render smaller than its
own lede at exactly 390px.

Gujarati protection is in the system: `:lang(gu)` zeroes the tracking tokens,
strips uppercase from every label class and raises the line height, so no call
site has to remember.

## The grammar

Thread Line (9 on / 6 off, the one repeated mark, and the same geometry as the
progress bar and the link underline), Needle Point, Hoop Window, Machine Frame,
Stitch Swatch, Sample Strip, Work Tile, Batch Board, Thread Progress.

**The eleven Stitch Swatches are the piece of work that carries the identity.**
The old technique signatures were line DIAGRAMS on a wide frame — an
explanation of a stitch, in outline, which read as a manual. A swatch is a
different object: a square of cloth cut from a sample book, filled, edge to
edge, texture running off all four sides. The geometry is inherited because it
is domain knowledge and it was right — beads attach to a path, sequins overlap
and are perforated, chain is interlocking loops, cording is couched at
intervals, EMCAD is nodes and handles. EMCAD is the one swatch on the cool
register, because it is the one technique that happens on a screen; that single
difference is the whole thesis in one tile.

## Trust and proof architecture, built now

`src/content/proof.ts` is one typed registry with
`sample | owner_provided | verified` on every item — reviews, testimonials,
student stories, trainers, partners, social counts, the Google rating,
statistics. Nothing is scattered through JSX, because a sample name typed into
a component is invisible to the replacement audit and will survive to launch.

`owner_provided` exists as its own state because "the studio told us this" and
"we made this up for the preview" are different claims: the follower counts and
the rating are real figures nobody has audited, and they are published
attributed and outside rating schema.

**Seven proof formats, and deliberately no shared card** — `FeaturedReview`,
`ReviewRail`, `RatingBlock`, `StoryJourney`, `TrustedByRail`, `SocialProof`,
`MicroProof`. Trusted-by is drawn as stitched garment labels rather than grey
wordmarks, because a woven label is what actually gets sewn into the things
Karma's clients make. Follower counts are typography, not a third-party widget.

The **firewall**: `tests/kds-proof-firewall.test.ts` asserts the schema builders
cannot even import the registry, that no `Review` / `AggregateRating` /
`Person` type is emitted, that the rating carries **no review count** (an
AggregateRating needs one, and the figure circulating online is an unverifiable
aggregate), that every module renders its own `SampleMark`, and that sample copy
promises no earnings, no placement, no machine specification and no "small
batches". `remainingSampleProof()` is what the launch checklist now walks.

## Two real defects found by building the reference

1. **`.thread-v` never declared `display: block`.** It renders on a `<span>`,
   and an inline box ignores width and height — so the vertical thread was
   invisible everywhere it was used. Caught by looking at a screenshot, not by
   a test; a test now covers both orientations.
2. **`/design` was being rewritten to `/en/design` by the intl middleware** and
   rendering the localized 404 with a 200. Like `/admin`, it now bypasses
   next-intl.

Plus a third worth recording because it will recur: **the scroll rails were
inflating `documentElement.scrollWidth` to 1379px at a 390px viewport** while
the page could not actually be scrolled sideways. `overflow-x: auto` clipped
the columns visually but they kept contributing to ancestor scroll overflow —
a phantom that reads as a horizontal-overflow failure in every responsive audit
and cannot be traced to a visible element. `contain: paint` on `.strip` fixes
it (measured: 1379 → 390). The capture harness now records `canScrollX` as well
as `scrollWidth`, because only one of those two is what a finger can do.

## The quality gate

`/design` renders every primitive in composition — not a swatch dump, because a
grid of isolated components always looks fine and tells you nothing. It has its
own root layout loading `globals.css` and the new system and **neither of the
two older public stylesheets**, so anything that only looks right on a public
page is borrowing, and it shows up here. Not indexed, not in the sitemap, not
linked.

Rendered at 390 / 768 / 1440 in Chromium, plus 820:

| Width | Height | Horizontal overflow | Page scrolls sideways |
| ---: | ---: | --- | --- |
| 390 | 13,222 | no | no |
| 768 | 9,217 | no | no |
| 820 | 9,400 | no | no |
| 1440 | 10,424 | no | no |

Two changes came out of looking at the renders rather than the code:

- **The hero was a clean training company that could have taught anything.**
  Four stitch swatches now sit in the first viewport, above the actions. They
  say "eleven techniques, physically different from each other" faster than a
  sentence can.
- **Tablet was a stretched phone.** Between 768 and 1024 the text runs full
  width — at that measure a 55/45 split gives the headline a phone-width column
  at desktop type sizes — so the width goes to the media instead: the three
  hero stages lay out across the page in the order they happen, and the thread
  turns ninety degrees to run through them horizontally. Same mark, same job,
  other direction.

## Console isolation, measured in a browser rather than asserted

One build, three routes, reading the computed style of `<body>`:

| | `/admin/login` | `/en` | `/design` |
| --- | --- | --- | --- |
| body class | `console-root` | `site-body kds` | `kds` |
| background | `#f5f0e6` Cotton | `#faf8f5` Canvas | `#faf8f5` Canvas |
| `--brand-accent` | **unset** | `#d4462e` | `#d4462e` |
| `--s-canvas` | **unset** | `#faf8f5` | `#faf8f5` |
| `--t-h2` | **unset** | the clamp | the clamp |
| `--color-ivory` | `#f5f0e6` | **`#f5f0e6`** | **`#f5f0e6`** |

The Console sees none of the new system. The last row is the one that matters
most: `--color-ivory` reads the same on both sides, because this system
**declares its own values and re-points nothing**. `textile-lab.css` made that
same token report `#f7f4ee` on a public page and `#f5f0e6` in the Console from
one build — a token name meaning two things depending on where you stood,
which is what a bridge costs and what this replaces.

## Verified

**891 tests** across 58 files, of which 62 are new (`kds-foundation` 41,
`kds-proof-firewall` 21). Typecheck, lint and build clean.
**Worker 2056.26 KiB gzip**, +25.66 on Phase 0, against the 3 MB limit.

`docs/design-system.md` is rewritten for the new public system;
`CLAUDE.md` non-negotiable #8 and "Where things live" name it; the launch
checklist carries the proof-replacement gate.

---

# Phase 2 — Header, menu, locale switch, footer

**Status:** ✅ Complete — PR #63, merged as `02c6620`

The shell is the one thing on every page, so this is the phase where the site
starts to feel like a different product before a single page is rebuilt.

## The header

Six destinations — Courses, Batches, Student Work, Machine Notes, Services,
Studio — 56px on a phone and 64px from `lg`. Home is not among them because the
brand mark is the home link, and Admissions and Contact moved to the footer and
the mobile menu, which §14 permits when contact is prominent elsewhere. It is.

"Studio" is a **label**, not a route: it points at `/about`, which keeps its
URL. A display name is a decision; a URL is a promise to everyone who has
already shared it.

The active link is marked with a **running stitch** rather than an underline,
because the site already has one repeated mark and a second signal would be a
second vocabulary.

## The logo slot

`src/lib/brand.ts` is the one place a future asset is configured, and the
contract is written so that any colour works:

- a reserved **height**, not a box — the width follows the asset's own ratio,
  so a wide horizontal lockup and a compact square mark both drop in;
- the container stays **neutral** — a red block is wrong for a red logo and
  wrong again for a green one;
- **nothing recolours it** — no filter, no mask, no forced monochrome, so an
  owner who supplies a multicolour mark gets the multicolour mark;
- the alt text is the studio's name, not "logo".

All four are asserted. Until an asset arrives the fallback is a designed
wordmark carrying the site's own needle mark — good enough to ship, because a
visibly temporary logo teaches visitors that the business is provisional.

## The language switch

A segmented `EN | ગુ` pair, and each option is a **link** rather than a button:
it is the same page in the other language, which is a destination. That means
it works with no JavaScript, opens in a new tab on a middle click, is announced
as a link, and gives a crawler the same alternate `hreflang` already declares.
Remembering the choice is layered on top; nothing auto-redirects.

It replaces a popover-on-desktop, bottom-sheet-on-mobile dialog with focus
trapping, scroll locking and a native-script preview per option — built for
three locales. With two, a focus-trapping dialog to choose between two things
you can already see is a dialog too many (§14).

## Conversion is contextual now

**The permanent Call/Directions bar is gone.** It sat at the bottom of every
public page including the privacy policy, the terms page and the Machine Notes
archive, where neither action is anybody's next step.

`<ActionDock>` — *Book Free Demo | WhatsApp* — is rendered by the four
high-intent routes and by nothing else. `/contact` is deliberately excluded: a
bar would cover the three channels that page exists to offer. There is no route
list inside the component, because a component that decides where it belongs
from a hardcoded array of paths goes stale the moment a route is renamed; a
route opts in.

The **one-time language banner went too**. It existed because the language
control used to be a small pill in a crowded header, so a Gujarati speaker
landing on `/en` might never find it. The header now carries a visible switch
in the first viewport of every page — and the banner was colliding with the
dock, which is how the redundancy was noticed. The decision it implemented is
unchanged: offer the other language, never auto-redirect, remember an explicit
choice.

The WhatsApp floating button went with them. **The shell now floats nothing.**

The phone-role protections survived intact and are still asserted: the call
action dials `callPhone`, the WhatsApp action opens `whatsapp`, and neither is
ever labelled as the other. So did the no-PII analytics rules.

## The footer

Reordered by what somebody at the bottom of a page actually wants: **where you
are and how to reach you first**, then where else to go, then the legal line.
The previous one opened with a full-viewport restatement of the brand promise
and put the phone number 686px down a 1,031px slab — it had to be dragged up
with `order-first` to be reachable at all. Here the visit block is simply
first.

Measured at 390: **984px**, with the first phone number at roughly 350px. Two
fixes came from looking at the render rather than the markup — the three
numbers were wrapping *between the digits* in a three-column row (a phone
number broken across two lines is unreadable and is no longer one tap target),
and the two link columns were stacking into 500px of short lists when pairing
them saves about 250px.

## The bug a browser found and the source could not

`.site-head` carries a `backdrop-filter`, and **a filtered element becomes the
containing block for its `position: fixed` descendants.** With the menu
rendered inside the header, the scrim's `inset: 0` resolved against the 56px
header instead of the viewport: measured at a 390×844 viewport it was
**390×56**, and `document.elementFromPoint` in the middle of the contextual
dock returned the dock's own button. `aria-modal` hid the page from assistive
technology; nothing hid it from a thumb.

The menu is now a sibling of the header. After the fix the scrim measures
390×844 and the same probe returns `sheet-scrim`. Two regression tests hold it,
one of which also catches the related mistake in the same area — a
`.site-menu ~ .sheet-scrim` selector that could never match, because the scrim
precedes the panel in the DOM.

## Verified

**928 tests** across 59 files, including a new `tests/kds-shell.test.ts` (43).
`tests/compact-density-shell.test.ts` was deleted — it measured chrome that no
longer exists — and the mobile-conversion suite's bar contract was rewritten
for the dock, deliberately, while its phone-role and analytics blocks were left
untouched.

Browser sweep across **25 width × route combinations** (320/390/768/1024/1440 ×
`/en`, `/gu`, `/en/batches`, `/en/contact`, `/en/courses`): no horizontal
overflow anywhere, and the page cannot be dragged sideways at any of them. The
mobile menu was driven end to end: opens as a modal dialog, focus lands on the
first link, the page locks, Escape closes it, focus returns to the trigger and
the page unlocks.

---

# Phase 3 — Homepage rebuilt from zero

**Status:** ✅ Complete — PR #64, merged as 305743e

Goal:

Replace old 19–20-section composition with the new 7–8 block decision experience.

Required blocks:

1. Hero
2. Entry-path index
3. Course Sample Book
4. Screen → Machine → Proof
5. EMCAD decision panel
6. Proof Wall
7. Batches / Visit
8. FAQ / close

Do not “hide” old sections and leave them in the render tree.

Delete/move obsolete homepage components once no longer needed.

Acceptance:

At 390px the page must feel substantially shorter, more visual and easier to decide from than the current baseline.

## What shipped

Ten blocks in `src/components/kds/home/`, composed by a `page.tsx` that is now
a list of ten tags and a comment explaining the order. All twenty-two files in
`src/components/home/` are **deleted**, not hidden: the directory does not
exist, and a test asserts it.

| # | Block | What it answers | Shape |
| --- | --- | --- | --- |
| 1 | `HomeHero` | What is this, what do I do? | Editorial split + threaded photo scene |
| 2 | `EntryPaths` | Which of these three people am I? | Stitched index, three rows |
| 3 | `SampleBook` | What can I actually learn? | Family tabs + horizontal swatch rail |
| 4 | `ScreenMachineProof` | Prove the claim | Five-state tablist, one motif |
| 5 | `EmcadPanel` | How long, how much, when, how do I pay? | Document sheet on cloth |
| 6 | `ProofWall` | Show me the work and the floor | Wide lead + masonry |
| 7 | `HomeVoices` | Does anyone else rate it? | Four different proof formats |
| 8 | `TrustSignals` | How big is this, who sends work? | Typographic counters + label rail |
| 9 | `BatchesVisit` | When can I come, and where to? | Schedule board + address panel |
| 10 | `HomeClose` | Anything else? Then what? | Accordion + close |

**No block shares a shape with another, and no two adjacent blocks share a
ground.** The grounds run canvas → paper → canvas → mist → cloth → canvas →
paper → cloth → paper → canvas; all four are in play and the adjacency rule is
asserted rather than described. `on-mist` is the cool register — screen, file,
process — so it belongs to the Screen → Proof rail and NOT to the fee panel,
which is paperwork and sits on cloth.

## The order is the argument

The old page put the one course with a confirmed duration and a published fee
**eighth**, behind five screens of preamble, while four separate sections
argued the same machine claim and three carried 1,900px of sample cards. The
new order is the order the questions arrive in, and a test asserts the money
question lands in the first half.

Nothing verified was lost. What did not come back: the four overlapping
"why us" sections, the video shelf, the follower-count rail floated beside
machine facts, and the second fees chapter.

## Trust and proof, designed rather than deferred

Four formats, not four copies of one card: a featured quote at heading scale, a
swipeable review rail, a before → learned → now journey, and the rating as a
figure. Plus the counters, the social blocks and the stitched garment-label
partner rail. Every sample item carries its own marker, the rating is
`owner_provided` and says so, and **no review count is published anywhere** —
an `AggregateRating` needs one and the figure circulating online could not be
confirmed. `src/lib/schema.ts` still cannot import the proof registry.

## Measured

| Width | `/en` | `/gu` | Sideways drag |
| --- | --- | --- | --- |
| 390 | 12,248px | 11,857px | no |
| 768 | 10,547px | 10,785px | no |
| 820 | 10,667px | 10,924px | no |
| 1024 | 9,552px | 9,572px | no |
| 1440 | 10,190px | 10,367px | no |

**Baseline at 390 was 18,665px across 20 sections.** The new page is 12,248px
across 10 — 34% shorter, with more photography reserved, not less.

## Three bugs the browser found and the source could not

1. **`.hoop` was `display: inline`.** It renders on a `<span>`, so
   `aspect-ratio`, `width`, `height` and `overflow` were all ignored and the
   embroidery hoop was a rounded rectangle the size of whatever it wrapped —
   everywhere it appears, including `/design`. This is the same failure that
   made `.thread-v` invisible in Phase 1, so the regression test was widened
   from the two threads to **every span-rendered primitive**.
2. **The bento could not pack the wall.** The six work photographs are at three
   ratios on purpose; a fixed-cell grid left holes the size of the tiles. The
   wall is masonry now (CSS columns, two on a phone, three from 48rem), each
   frame captioned with the shot it is holding.
3. **Two message keys did not exist.** `home.emcad.months` and
   `home.emcad.demoValue` were rendered by a component and absent from both
   catalogues. next-intl does not fail a build for that — it logs
   `MISSING_MESSAGE` and prints the key path into the page. A new test resolves
   **every literal `t("…")` in `src/components/kds/**` against both
   catalogues**, so the class of defect cannot ship again.

## Verified

**913 tests** across 57 files. `tests/machine-lab-homepage.test.tsx` and
`tests/machine-lab-shell.test.tsx` were replaced by
`tests/kds-homepage.test.ts` (35): they asserted the composition of a page that
no longer exists, and every factual rule underneath them — EMCAD figures
rendered from the record, no online payment, no invented machine specification,
no student name or earning on a frame, no other digitising package, the
signature interaction never autoplaying or needing a drag — was carried
forward against the new components.

## Carried forward

`messages.home` still holds **sixteen namespaces** written for the twenty-
section page that no component reads (`rail`, `workflow`, `catalogue`,
`studio`, `machineProof`, `sts`, `work`, `proof`, `trainers`, `videos`,
`reviews`, `investment`, `visit`, `faq`, `stories`, `cta`). They are
translated assets and several belong to subjects whose own pages are rebuilt in
Phases 4–7, so they are kept and **resolved in the Phase 8 copy pass** — reused
where a rebuilt page wants them, removed where nothing does.

The **10:30 pm vs 23:00 last-class conflict** is visible on this page for the
first time in one screen: the footer/visit panel says "evening batches till
10:30 pm" while the EMCAD timings render `20:00–23:00` from
`course-operations.ts`. Both come from existing verified-or-declared sources
and the discrepancy is the owner's to resolve (`docs/content-checklist.md`).

---

# Phase 4 — Courses + course-detail rebuild

**Status:** ✅ Complete — PR #65, merged as 7f724a4

Required:

- new 11-course sample catalogue;
- real family filtering;
- Stitch Swatch per course;
- photo-slot integration where the shoot covers the course;
- new course-detail template;
- decision facts above fold;
- sticky local page navigation where useful;
- mobile action dock;
- no unverified duration/fee.

Acceptance:

A course should feel like a specialist textile-training product, not a generic landing page.

## The catalogue

Five blocks in `src/components/kds/courses/`: an intro carrying the 8 / 2 / 1
family split **read from the catalogue rather than typed into copy**, the
eleven as a filterable grid, the three families with every course named again
as a link, the pathway as a seam, and the close.

The page it replaces opened with a full-height intro and then repeated a family
heading, an icon plate and a section rule three times before any course
appeared. **The eleven courses ARE the page**; everything else is context, and
context goes after the thing it contextualises.

**Two columns on a phone.** Eleven full-width rows is about 4,000px to see a
list that fits in six screens, and two columns keep the media large enough to
tell zardosi from sequence work — which is the basis this choice is actually
made on. Three columns from 48rem.

**The media box is 4:3 whether a course is photographed or not.** Eight courses
have a reserved photograph; the other three lead with their stitch swatch in
the same box at the same size, so they never read as the leftovers and nothing
moves when the eight files land.

**The family filter is a group of toggle buttons, not a tablist.** Tab
semantics promise a tabpanel the control owns and moves focus into; this
narrows a list already on the page. The homepage sample book ran the same
mistake and was corrected with it.

## The course template

Nine blocks, and **the money is second**. The compact-density pass had measured
the old template: on EMCAD DAHAO — the one course with a confirmed duration and
a published fee — those figures sat about 3,900px down, roughly 4.6 phone
screens past the intro, the drawn signature and a two-column essay. The
template changed; the finding did not.

| # | Block | Ground |
| --- | --- | --- |
| 1 | `CourseHero` — what it produces, and the confirmed facts | canvas |
| 2 | `CourseFacts` — the money, the timings, the certificate | cloth |
| 3 | `CourseMake` — what you make, who it is for, what you can do | paper |
| 4 | `CourseFaults` — the problems it teaches you to solve | mist |
| 5 | `CourseFloor` — the machine, the software, the practice | canvas |
| 6 | `CourseSyllabus` — the modules, closed by default | mist |
| 7 | `CourseBatches` — when it runs, and the notes about it | paper |
| 8 | `RelatedCourses` — three in the same family, in the catalogue's tile | cloth |
| 9 | `CtaBand` — the one action | canvas |

`CourseFaults` sits on the **cool register** because it is diagnostic work. It
is also the most convincing block on the page: half the people reading a course
page in Surat already run a machine, and naming their fault is something no
institute that has not run production can do.

`CourseNav` is a sticky anchor bar from `lg` up — plain anchors, no
scroll-spy, and `scroll-margin-top` so a jumped-to heading never lands under
the two sticky bars. Below `lg` it is not rendered: a second bar there would
compete with the header and the action dock for the same thumb.

## Two things were deduplicated rather than copied

**`FeeSheet`** is now one component, used by the homepage decision panel and by
the one course page that has a confirmed plan, so the two can never state the
same fee differently. `CtaBand` is the same for the page close — the copy is a
prop, the shape and the phone roles are not.

**`pickList()`** joins `pick()` / `pickOptional()` / `tr()` in
`src/lib/i18n/localized.ts`. The ternary it replaces is worse on an array than
on a string: `gu ? p.outputsGu : p.outputsEn` renders an English list under a
Gujarati heading, and five English lines are far less obviously wrong than one
English sentence.

## A factual defect the rebuild surfaced

The shared draft syllabus titled its modules **"Weeks 1-2", "Weeks 3-4", "Weeks
5-6" and "Final week"** — publishing a seven-week duration for ten courses
whose duration the owner has NOT confirmed, and contradicting the one course
that has (three months). The week prefixes are gone; the order is carried by
the module index, which is what the order actually is. A test now fails on any
week or month inside a module title.

## Deleted, not orphaned

`MachineIndex`, `CourseOperations` and `ModuleAccordion` were the old
catalogue row, fee block and syllabus accordion. All three were unreferenced
after the rebuild and are deleted; the tests that read them were repointed at
the blocks that carry the same rules.

## Measured

| Width | `/courses` EN | `/courses` GU | EMCAD page | Sideways drag |
| --- | --- | --- | --- | --- |
| 390 | 7,491px | 7,425px | 7,690px | no |
| 768 | 5,944px | 6,034px | 6,847px | no |
| 820 | 5,889px | 5,988px | 6,847px | no |
| 1024 | 5,547px | 5,655px | 5,346px | no |
| 1440 | 6,047px | 6,032px | 5,608px | no |

The EMCAD page was 9,393px at 390 and is 7,690px — 18% shorter with more on
it. The ten courses with no confirmed fee gained a block that says so plainly,
which is why a shorter page was not the target on those.

## Verified

**936 tests** across 58 files, including a new `tests/kds-courses.test.ts`
(23). `tests/machine-lab-courses.test.tsx` kept every data rule and was
repointed at the blocks that render them.

---

# Phase 5 — Batches + admissions + admission form

**Status:** ✅ Complete — PR #66, merged as ea11ab8

Required:

- visually rebuild `/batches` while preserving real DB data;
- data-driven filters;
- honest empty state;
- rebuild `/admissions` as decision page;
- rebuild `/admission` UI while keeping backend/security;
- Thread Progress;
- contextual Demo + WhatsApp dock.

Acceptance:

A visitor should understand “when, how, and what next” quickly on a phone.

## `/batches`

Four blocks: an intro whose two counts are computed from the rows the query
returned (so the page cannot say "batches running" while showing none), the
board, the joining seam, and the close.

**The filters are built from the rows, not from the catalogue.** A filter
offering eleven courses when two have an open batch teaches a visitor that the
page is a brochure — so the course chips are derived from the board's own rows
with their counts, and the morning/evening pair appears only when the board
genuinely holds both. Morning and evening are read from `startTime` (16:00 is
the boundary the studio's own four timings fall either side of); it is a
reading of the data and is never presented as a stored field.

**Three empty states, because they are three different facts**: nothing is open
(the normal state between intakes), the list could not be loaded (a failure —
showing the first for this would tell a visitor there are no batches when there
may be several), and the filter matched nothing (with the control that caused
it one tap away). Every batch-data rule from `tests/mtl-routes.test.ts`
survives, repointed at the board that now renders them.

## `/admissions`

Six blocks: intro, the five joining steps as a seam, the free demo stated
exactly as the studio runs it, the four things people check plus the handbook,
the FAQ, and the close.

**The batch list left this page.** It was twelve rows deep, two thirds of the
way down — a second copy of a page that now exists, that could not be linked to
from here, and that went stale in a different way. `/batches` owns it; this
page links to it.

The intro's aside states the three things somebody about to fill in a form
wants confirmed before they start: the demo is free and its length is a
verified figure, **nothing is paid on this website**, and a person replies. The
no-payment line is architectural rather than a promise — there is no gateway in
this repository to enable.

## The admission form

**Every defence is untouched.** Honeypot, the minimum-fill window enforced on
the server, the idempotency key, Turnstile, the required parent/guardian
mobile, the recorded admission-norms version, the two separate consents and the
no-PII analytics rule are all exactly as they were;
`tests/machine-lab-admission.test.tsx` still asserts each one.

What changed is presentation, and the way it changed is the point: the form
keeps the class NAMES it had — `.label`, `.input`, `.choice-chip`,
`.field-error` — and **the public sheet restyles them inside `.kds`**. Nine
hundred lines of security-critical markup were not worth re-typing to change a
colour, and every rule is scoped, so the Console's identical class names are
untouched. The progress bar became the design system's own `<ThreadProgress>`,
and `StitchProgress` was deleted.

Its accessibility contract changed shape rather than weakening:
`role="progressbar"` with `aria-value*` became a named `<nav>` whose current
step carries `aria-current="step"`, with the form's own live region still
announcing "Step 2 of 4 · Details". On a phone the three inactive step LABELS
are hidden — four do not fit, and in Gujarati they would be worse — while their
marks and thread stay.

## Deleted, not orphaned

`DemoFacts`, `BatchTable` and `StitchProgress`. `FaqList` was rebuilt on the
system's accordion instead: its 24px padding made eleven collapsed questions
taller than the page carrying them, and `/admissions` lost 483px at 390 to that
one change.

## Measured

With the board populated (six sample rows, demo mode) and no sideways drag at
any width:

| Width | `/batches` | `/admissions` | `/admission` |
| --- | --- | --- | --- |
| 390 | 4,171px | 6,897px | 2,586px |
| 768 | 3,401px | 5,787px | 2,292px |
| 820 | 3,337px | 5,657px | 2,292px |
| 1024 | 3,107px | 5,559px | 2,127px |
| 1440 | 3,358px | 5,537px | 2,152px |

Gujarati within 3% of English on all three.

## Verified

**955 tests** across 60 files, including a new `tests/kds-admissions.test.ts`
(19). It deliberately does NOT restate the form's defences — those stay in the
suite that has always held them — and asserts the composition instead: the
filters built from the rows, the three empty states, the reading measure, the
44px controls, the scoped restyle, and that none of the three routes offers a
way to pay online.

---

# Phase 6 — Student Work + Machine Notes

**Status:** ✅ Complete — PR #67, merged as 412696f

Required:

- editorial work wall;
- filter only real published categories;
- photo placeholders remain art-directed;
- Machine Notes becomes approachable workshop knowledge;
- search/filter where useful;
- remove over-technical archive theatre;
- preserve real note content.

## Student work

Four blocks: the intro (which states how anything gets published before it
shows anything), the six reserved shoot frames as masonry, whatever staff have
published through Content Desk, and the machine case notes.

The page this replaces filtered every sample out — which, with nothing
published, left an intro above a "come and look instead" card and made the
absence of photography the loudest thing on the site.

**The archive and the published feed stay two different things.** The archive
is the six photographs the owner's shoot is for: fixed slots, fixed ratios, no
attribution. The feed is editable, with technique, course, note and consent
metadata intact. Merging them would either make the shoot slots deletable from
an admin screen or strip published items of what makes them publishable.

The **machine case notes** are the proof the studio genuinely has today, and
they carry no sample marker — deliberately. Each is an ordinary production
fault with its ordinary cause, trade knowledge that would be equally true in
any unit in Surat, so there is nothing in them for the owner to verify. To a
working operator they are more persuasive than a photograph.

## Machine Notes

The archive is **searchable and filterable**, because nobody browses machine
notes: they arrive with a fault. The filter is by course — the taxonomy the
notes actually carry — and the search matches the question, the fault label and
the note's own tags rather than the whole answer, so a common word does not
return everything. Both are an enhancement rather than a gate: every note is
rendered on the server, and the controls narrow what is already there.

A note page answers in the first screen and explains after it: question, then
the answer in two sentences, then why it happens, then the machine detail and
an example, with **what to check drawn as a seam** because the order is the
method. It still emits `TechArticle` and no `Person` — no trainer has been
confirmed, and a fabricated byline is exactly what structured data must never
carry.

Still not a blog: no dates, no bylines, no "read more". The fault notation runs
at full strength on these two surfaces and nowhere else on the site.

## Deleted, not orphaned

`MaterialWall`, `WorkLedger`, `MachineCases` and `NoteSpec`. The registration
mark `<NoteSpec>` carried is settled in the system instead: `.mframe` draws its
two hairline ticks once, in CSS, so no caller can sprinkle them.

Every locale ternary on the note page — fifteen of them — became `pick()` /
`pickList()`.

## Measured

| Width | `/student-work` | `/notes` | a note |
| --- | --- | --- | --- |
| 390 | 8,524px | 4,044px | 1,860px |
| 768 | 6,910px | 3,436px | 1,687px |
| 1024 | 6,281px | 3,189px | 1,434px |
| 1440 | 6,825px | 3,369px | 1,510px |

No sideways drag at any width; Gujarati within 5% of English.

## Verified

**977 tests** across 61 files, including a new `tests/kds-work-notes.test.ts`
(20). `machine-lab-proof` and `machine-lab-notes` kept every rule and were
repointed; the four-band assertion in `machine-lab-final` became the four
GROUNDS, which is the same rule in the new vocabulary.


---

# Phase 7 — Services + Studio + Contact + secondary public pages

**Status:** ✅ Complete — PR #68, merged as 5e45660

Required:

- light commercial Services visual system;
- brief/WhatsApp flow;
- no file uploader;
- Studio/About storytelling;
- real/pending people treatment;
- Visit/Contact first-viewport actions;
- `/verify` styling;
- Privacy/Terms styling without changing approval/noIndex policy;
- 404/loading/error niche treatment;
- no dark hero.

## One shared opening, eight different pages

`<PageHead>` is the only thing these eight routes have in common, and that is
deliberate. A page opening genuinely IS the same object every time — it names
the page, says what it is for, offers the next step — and giving each secondary
route a bespoke first screen would make the site feel unrelated to itself
rather than varied. The variety lives underneath: a commercial workflow on
`/services`, full-width photography on `/about`, ranked tap targets on
`/contact`, disclosed case studies on `/success-stories`, a single field on
`/verify`, numbered clauses on the two legal pages.

The routes that earn a bespoke opening — the homepage, the catalogue, a course,
the notes archive — already have one, and none of them uses `<PageHead>`.

## Services — the commercial side, promising nothing unconfirmed

Eight blocks: the offer, what you bring against what comes back, the chain, the
problems the studio actually solves, the capability wall, past projects, how it
works, and the brief form.

**No turnaround, no file format, no price.** The studio has confirmed none of
the three, and a B2B page that invents a delivery window is writing a cheque
the floor has to cash. The copy asks for the buyer's deadline and their
machine's format instead of announcing ours; `tests/kds-secondary.test.ts`
fails on a turnaround figure, a rupee sign or the word "guarantee".

`<StudioChain>` draws REFERENCE → DIGITISING → SAMPLE → CORRECTION →
MACHINE-READY as a seam rather than as five photographs, because the owner's
32-shot list covers the school and not the commercial pipeline: borrowing a
classroom frame would caption commercial work with a photograph of a class.

The brief form keeps every defence it had — honeypot, minimum-time,
Turnstile-when-activated, per-IP throttle — and no file uploader was added.

## About — is this a real place?

That is the only question this page gets asked, so it answers with the floor:
`F1_STUDIO_FLOOR_WIDE` at full width, then the rest of the studio group as
masonry, then the two sides of the business, then the eleven techniques by the
machine each runs, then the trainers.

The stats row is built FROM the verified facts rather than as fixed cells, so
an unverified one cannot leave an empty box. The founding story and the meaning
of the name are the owner's to tell (checklist Q6/Q7) and stay absent rather
than becoming an "awaiting the owner" panel on a live page.

## Contact — five channels, ranked

This audience reaches for WhatsApp first and a form last, so the channels are
ranked rather than presented as five equal options, and each row is a whole tap
target. **Two mobile numbers, two roles, kept apart**: the owner has not
confirmed which answers which, so each row names its own channel and nothing on
the site labels the call number as WhatsApp. Every number comes from
`src/lib/site.ts`; the test fails on a ten-digit literal in the page.

## Verify — the surface that must not perform

Somebody here is an employer with a photocopy in their hand and a binary
question. The result answers in a WORD, with an icon and a rule down its left
edge — colour is the fourth signal and never the only one, because this page
gets printed, forwarded and read on a cracked phone in daylight.

`seal-in` is gone: the result used to arrive inside a stamping animation on a
dashed circle, which is precisely the gesture a fake certificate would make.
The whole flow — page, form, result — is banned from motion by test.

Three states, not two. A number that does not resolve while the records system
is unreachable says **unavailable**, never "not found": answering "not found"
because the database is unconfigured would call a real certificate fake. And
"not found" itself is not an accusation — the studio's phone is on the page
whatever the verdict, because a number that does not resolve can be a typo, an
old paper certificate, or a record not yet entered.

A per-certificate result stays `index: false`. It carries a named person's
completion record; that is a privacy decision, not an SEO one.

## Privacy and Terms — documents, not cards

Both pages held their English and Gujarati copy inline, chosen with
`locale === "gu" ? … : …` — four of them. CLAUDE.md non-negotiable #1 rules
that shape out everywhere, because the else-branch renders a MISSING Gujarati
string as English and looks exactly like a translated one. The copy moved to
**`src/content/legal.ts`** and is read through `pick()` / `pickList()`.

It is a content module rather than a catalogue namespace because these are
documents: ordered clauses whose numbering is part of the reading, and whose
next revision is an edit to a document rather than to a UI string. The clause
number is how somebody points at an answer over the phone.

**`/terms` stays `noIndex`.** It is a draft pending the owner's review, that is
recorded in `docs/content-checklist.md`, and a styling phase does not publish
it. Neither document states a fee, a refund window or a course duration — those
are the owner's to state, and a terms page is the worst possible place to guess
one. The email address appears as a `{email}` token so `src/lib/site.ts` stays
the only place it is written.

## The header overlapped itself at 1024, and nobody had measured it

Found by measuring the rendered header during this phase's audit, at 1024 in
both languages: brand 197px + six nav links 545px + language switch and CTA
250px = 992px, plus gaps, against 928px of usable row.

It did not wrap and it did not scroll. Every one of those boxes is `nowrap`
inside a shrinkable flex child, so the row **overlapped** — "Courses" printed
on top of "Design Studio" and the language switch covered the last nav link, on
every page, at a width a great many laptops use.

The desktop band is now split rather than shrunk: from 64rem the six links
appear at a tighter gap with no header CTA; from 75rem there is room for both.
Losing the CTA from the bar between those widths costs nothing — booking a demo
is the first action in every page head and in the closing band.

## Deleted, not orphaned

`StoryCase`, `TrainerProfile`, `ReviewWall`, `SocialAuthority` and `PullQuote`.
Every rule those files carried was repointed at whatever renders it today: the
story arc is composed on the stories page out of the system's `.pathway` and
`<ThreadLine vertical>`, the trainer previews read the one proof registry on
`/about` and map by record rather than by list position, and the sample-marker
rule became `<SampleMark status={…}>` — the same guarantee expressed as a
status, since the marker hides for `verified` alone and an unverified item
therefore cannot render unmarked.

## Measured

| Width | `/services` | `/about` | `/contact` | `/success-stories` | `/verify` | a result | `/privacy` | `/terms` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 390 | 12,964px | 7,799px | 3,468px | 5,533px | 1,845px | 1,491px | 2,577px | 2,396px |
| 768 | 10,002px | 5,906px | 3,275px | 5,083px | 1,612px | 1,259px | 2,130px | 1,993px |
| 1024 | 8,959px | 5,833px | 2,970px | 4,117px | 1,479px | 1,209px | 2,004px | 1,888px |
| 1440 | 8,977px | 6,440px | 3,045px | 4,399px | 1,540px | 1,253px | 2,078px | 1,954px |

No sideways drag at any of 390 / 768 / 820 / 1024 / 1440 in either language,
across all sixteen route-locale pairs plus the homepage, catalogue and
admission form. Gujarati is within 2.6% of English everywhere.

`/about` grows 607px between 1024 and 1440. That is the photography: the lead
studio frame and the masonry are aspect-ratio boxes inside a wrap that widens
by 23%, so the page gets taller because the pictures get bigger. It is not the
stacking defect the density pass fixed.

## Verified

**1,001 tests** across 61 files, including a new `tests/kds-secondary.test.ts`
(22). The new suite resolves every literal `t("…")` on every public ROUTE
against both catalogues — scope-aware, because `generateMetadata` binds the
same `t` to a `meta.*` namespace that the component below binds to the page's.
next-intl does not fail a build on a missing key; it renders the key path into
the page, and that shipped twice during this rebuild before a running page was
read.

---

# Phase 8 — Complete EN/GU copy rebuild + SEO consistency

**Status:** ✅ Complete

Required:

- audit every public message;
- shorten/rewrite generic copy;
- natural Gujarati;
- mirrored keys;
- factual-source discipline;
- metadata/title/description uniqueness;
- breadcrumbs;
- schema consistency;
- EN/GU hreflang only;
- no Hindi URL/schema locale;
- no Wilcom training claim;
- no sample proof leakage;
- no invented numbers.

## 249 dead leaves, or 22% of the catalogue

The audit's first finding was not a wording problem. **249 of 1,152 message
leaves were reachable from no page at all** — 182 of them under `home.*`, the
copy of a homepage that was rebuilt from zero in Phase 3, plus the leftovers of
every component deleted since.

That is a defect and not untidiness. Dead copy still has to be translated,
still has to be reviewed against the factual rules, and still passes the EN/GU
parity check — so the parity check looks like coverage while covering nothing.
And it drifts: `proof.stories.before` and `home.voices.before` said different
things, and only one of them was on screen.

They are gone, and `tests/kds-copy-seo.test.ts` runs the scan in reverse from
now on: every public message must be reachable from a page. One key survives
by name — `servicesPage.form.filesHelp`, held for the day R2 is activated,
with a test that already explains why deleting it would lose limits the API
still enforces.

**719 public leaves, 198 Console.** Both catalogues, same shape, no empty
Gujarati string anywhere.

## What the copy audit did NOT find

Worth recording, because a phase that reports only what it changed reads as if
nothing else was checked:

- **Gujarati coverage is complete.** Three strings are identical in both
  catalogues and all three are deliberately bilingual WhatsApp prefills.
- **No marketing cliché survives anywhere in the public copy.** A scan for
  twenty-five of them — world-class, unleash, empower, seamless, transform
  your, unlock, guarantee, placement, salary, 100% — returned exactly one hit,
  and it is the stories page's own disclaimer saying none of those things are
  claimed.

The earlier phases did that work. The remaining copy defects were all in
metadata, which no page renders and nobody had read end to end.

## Metadata

Four titles and three descriptions were past the length a search result
actually shows, the worst by 70 characters — and what gets truncated is the
END, which on this site is the studio's name.

The two highest-intent local titles now drop the brand suffix rather than the
locality: **"Embroidery Classes in Mota Varachha, Surat"** keeps every word
somebody types, and the brand is already in the `LocalBusiness` schema on every
page. The rest keep `| Karma Design Studio`.

One description was a **factual leak**. `/success-stories` was advertised as
"businesses started, jobs landed, skills that pay" — for a page whose every
story is a sample and whose own copy says none of them claims an income, a job
or a placement. A description is a claim; it may not say what the page will
not. It now describes the arc and the consent gate.

The Gujarati `meta.notes` title was also the only one transliterating the
studio's name into Gujarati script while eleven others kept it in Latin.

## Breadcrumbs, in the language of the page

Twelve second-level routes gained a `BreadcrumbList` through one server
component, `<PageCrumbs>`. The labels live in their own `crumbs` namespace
rather than in `nav`: a breadcrumb names a PLACE and a nav link invites a
CLICK, and `crumbs` also has to name the four pages the header does not link at
all — the admission form, the stories, the certificate check, the privacy
policy.

The two deep trails that already existed were **describing their pages in the
wrong language**. The home crumb was the literal English word "Home" on every
Gujarati page, and a note's trail carried the English section name and the
English question. Both are localized now, and `breadcrumbSchema()` takes the
home label rather than hardcoding it.

## A sitemap that contradicted itself

`/terms` was submitted in the sitemap while its own metadata sets `noIndex` —
a contradiction a crawler reports back as an error. It is out until the owner
approves the draft, and the rule is no longer a list: a route is in the sitemap
exactly when its own page does not opt out of the index, which is what
`tests/mtl-routes.test.ts` now derives.

hreflang and the sitemap both iterate `routing.locales`; neither lists a locale
by hand, and neither can name a third. `availableLanguage` / `inLanguage` still
publish Hindi, because Karma genuinely teaches in Hindi — that is a fact about
the classroom, not a website locale.

## Verified

**1,019 tests** across 62 files, including a new `tests/kds-copy-seo.test.ts`
(18). Its orphan scan was confirmed to fail on a planted key before it was
trusted. The rendered pages were re-read on a production server: every
second-level and deep route emits its `BreadcrumbList`, the Gujarati ones in
Gujarati, and the server logged zero `MISSING_MESSAGE`.

---

# Phase 9 — 32-photo-ready art direction

**Status:** ✅ Complete

Goal:

Make every reserved real-photo slot look intentional now and be drop-in ready later.

Required:

- verify all 32 manifest slots;
- map each to the correct composition;
- no fake fill;
- responsive crops/aspect boxes;
- no layout shift;
- technique swatches for photo-less three courses;
- alt-text strategy documented for when files arrive;
- image size/format pipeline recommendation without activating R2.

## All 32, verified and placed

hero 3 · course 8 · work 6 · trainer 3 · studio 6 · story 2 · process 3 ·
floor 1. Every one renders in a real composition — fourteen by id, eight
through `coursePhotoFor(slug)`, and the work, studio and story groups through
`photosInGroup()`. `tests/kds-photo.test.ts` fails if a slot is added, dropped,
or left unplaced, because a slot nobody renders is a shot the owner is being
asked to take for a page that will not show it.

The counts are asserted against the owner's brief rather than against
whatever the file happens to contain: changing them is a change to what the
photographer was asked for, and that is the owner's call.

## The three courses with no station

**flat-embroidery, applique-3d-embroidery, cross-stitch.** They are not in the
shoot, so they are not given another course's photograph and they are not left
with an empty box either: the technique's own **stitch swatch** stands in — a
drawing of that stitch, not a picture of somebody else's. Every course carries
its swatch on its own page whether photographed or not, so the eleven read as
one catalogue rather than as eight real ones and three placeholders.

## The placeholder was lying to screen readers

`<PhotoFrame>` announced itself as `role="img"` labelled with the shoot brief.
To somebody who cannot see the page that says there IS a photograph of an
EMCAD DAHAO screen with a stitch design visible. There is not.

It now carries a visually-hidden **`Photograph pending · ફોટો બાકી: <brief>`**
at every scale — including `thumb`, which previously announced a label while
showing nothing, the same inconsistency in the other direction.

`PHOTO_PENDING` is one bilingual string rather than a catalogue key because
`<PhotoFrame>` also renders on `/design`, which is its own root layout with no
intl provider. It is the exception the WhatsApp prefills already take.

## One empty frame, not three

Three placeholder vocabularies were in the tree at once: `<PhotoFrame>` (the
rebuilt one), `<PhotoSlot>` (a dashed camera box in the superseded palette),
and `<ManifestPhoto>` (the same job as `<PhotoFrame>`, done twice). `<SampleTag>`
was a fourth, orphaned since the proof registry moved to `<SampleMark>`.

`PhotoSlot.tsx` and `SampleTag.tsx` are deleted. Content Desk's `<ManagedPhoto>`
— which publishes images the shoot list knows nothing about, so it cannot ask
the manifest for a ratio — now falls back to a new **`<EmptyFrame>`** in the
same file as `<PhotoFrame>`: same cloth ground, same weave, same pending line,
caller-stated ratio. A wall mixing published work with waiting slots reads as
one system instead of two half-finished ones.

Deleting `<SampleTag>` orphaned `common.sampleTag`, and Phase 8's orphan scan
caught it on the next run — which is the first time that test earned its keep.

## Alt text, as three different strings

| Field | Who it is for | Where it appears |
| --- | --- | --- |
| `label` | the photographer | on the placeholder, as the shot brief |
| `altGuidance` | whoever writes the alt when the file lands | in the manifest, never on the page |
| `alt` | the reader who cannot see the photograph | **does not exist yet** |

`altGuidance` is an INSTRUCTION, not a description: "Name the technique being
stitched and the material" is what the alt has to accomplish once somebody has
looked at the actual photograph. Pasting it into an `alt` would describe a
picture nobody has seen, and the test bans exactly that.

## The pipeline, with R2 still switched off

Public photography is **same-origin deployed assets, not R2** — R2 is for
confidential B2B brief files and stays deferred (CLAUDE.md #20); a public
photograph has no reason to sit behind an authenticated route. Files go in
`public/photos/<SLOT_ID>.<ext>` and are served from the Workers Assets binding
(`.open-next/assets` in `wrangler.jsonc`), which is a **different budget from
the 3 MB Worker script** — 32 photographs cannot push the script over its
limit.

The full recommendation — AVIF/WebP/JPEG in one `<picture>`, two widths per
slot from the manifest's own dimensions, ~150 KB per AVIF at 1600px, lazy
everywhere but the hero, EXIF stripped on export because a phone photograph of
the floor carries GPS, and no `next/image` optimization on Workers — is in
`docs/design-system.md`.

## Measured

No sideways drag and no status other than 200 across `/`, `/courses`, a
photographed course, a photograph-less course, `/student-work` and `/about` at
390 / 768 / 1024 / 1440 in both languages. The rendered pages carry the pending
line in both scripts and **zero `role="img"`** on any placeholder.

## Verified

**1,032 tests** across 63 files, including a new `tests/kds-photo.test.ts`
(13).

---

# Phase 10 — Responsive, accessibility, performance hardening

**Status:** ⏳ Pending

Use real Chromium.

Matrix:

- 320
- 360
- 390
- 430
- 768
- 820
- 1024
- 1280
- 1440

Both EN + GU.

Measure:

- overflow;
- clipping;
- fixed/sticky overlap;
- focus;
- touch targets;
- menu behaviour;
- Gujarati height/glyph clipping;
- first-viewport usefulness;
- page heights;
- photo-slot geometry;
- reduced motion;
- performance.

Worker gzip must remain safely under 3 MB.

**Carried forward from Phase 0** — found while verifying the locale removal,
out of scope for a recovery PR, do not lose:

- **Unknown localized paths answer `200`, not `404`.** `/en/anything-unknown`
  reaches `src/app/[locale]/[...rest]/page.tsx`, which calls `notFound()` and
  renders the branded 404 correctly — with `noindex`, so nothing gets indexed —
  but the HTTP status is `200` under `next start`. Confirm the status on the
  deployed Worker and make it a real `404`; a soft 404 costs crawl budget and
  is the kind of thing Search Console reports months later. Pre-existing, not
  introduced by the rebuild.

---

# Phase 11 — Final creative-director audit + old visual cleanup

**Status:** ⏳ Pending

This is not a bug-fix-only pass.

Review every public route as a designer.

Ask:

- Does this look like an AI/template website?
- Does it look like a generic design institute?
- Does it feel specifically related to embroidery?
- Is the site light but still distinctive?
- Is the visual language coming from thread/machine/material rather than decoration?
- Does the logo area work with an arbitrary future logo colour?
- Is the first phone viewport useful?
- Is tablet intentionally composed?
- Does desktop feel editorial without wasting space?
- Are there old cards/components/styles still visually leaking through?
- Is any copy longer than it needs to be?
- Is there fake technicality?
- Is there fake proof?

Delete unused legacy public components/styles created by old redesign generations when no longer needed.

Do not delete shared code Karma Console still uses.

---

# 36. Tests the redesign must protect

At minimum add/update tests for:

- routing locales exactly EN/GU;
- no `/hi` sitemap/hreflang;
- no Hindi catalogue dependency;
- no unapplied `0005` migration left in journal;
- public stylesheet isolation from admin;
- all 11 courses present;
- photo manifest 32/32;
- EMCAD facts scoped correctly;
- no online payment CTA;
- no Wilcom training claim;
- mobile conversion route policy;
- route integrity;
- EN/GU i18n parity;
- Gujarati no uppercase/letterspacing;
- no fake sample content rendered as real proof;
- reduced-motion fallback;
- no major dark public surface;
- public header logo slot remains neutral;
- no horizontal overflow in browser matrix where testable;
- Worker bundle budget.

Do not weaken unrelated security/auth/data tests.

---

# 37. Things this redesign must NOT touch

Do not:

- connect `karmadesignstudio.in`;
- change DNS;
- activate R2;
- activate Turnstile;
- add payment gateway;
- add UPI checkout;
- add Stripe;
- add Razorpay;
- replace Supabase;
- replace Drizzle;
- replace Hyperdrive;
- replace Supabase Auth;
- introduce Neon;
- introduce Better Auth;
- reintroduce MFA/TOTP/AAL2;
- loosen RLS;
- redesign Karma Console;
- manually deploy production;
- invent studio photos;
- invent student/trainer/review proof.

---

# 38. Final acceptance standard

The finished site should pass this emotional test:

A visitor lands from Instagram on a phone.

Within 3 seconds:

> **Embroidery design. Real machines. Surat.**

Within 10 seconds:

> **They teach the file and then make you prove it on the machine.**

Within 20 seconds:

> **I can see the kinds of techniques they teach and the physical output.**

Within 30 seconds:

> **I understand the EMCAD course, demo, practical setup and how to contact/visit.**

After browsing:

> **This looks like a real embroidery studio with a serious training floor — not a generic institute website.**

Visually, the memory should be:

> **a thread leaving the screen, passing through the machine, and becoming proof on fabric.**

Not:

> beige cards + labels + generic CTA buttons.

---

# 39. Final report required from Claude

After all phases are complete and merged, report:

1. recovery/rollback PR and exactly what PR #58 work was removed;
2. confirmation that Supabase stayed EN/GU and `0005` was never applied;
3. every implementation PR;
4. every merge commit;
5. final main SHA;
6. design-system architecture;
7. logo-neutral accent system;
8. header/navigation/language system;
9. homepage before/after section count and mobile height;
10. homepage screenshots at 390 / 768 / 1440;
11. all 11 course catalogue changes;
12. course-detail template changes;
13. Batches changes;
14. Admissions/form changes;
15. Student Work changes;
16. Machine Notes changes;
17. Services changes;
18. Studio/About/Contact changes;
19. EN/GU copy rewrite summary;
20. SEO/hreflang/schema changes;
21. accessibility matrix;
22. responsive matrix;
23. test count;
24. Worker gzip;
25. GitHub CI status;
26. Cloudflare status;
27. 32 photo-slot status;
28. remaining owner facts;
29. list of old public CSS/components deleted after the rebuild.

Then stop.
