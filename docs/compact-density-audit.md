# Compact density audit

**Phase 1 of `docs/karma-compact-density-redesign-plan.md`.**
**Measured against:** `main` at `891120f` (after PR #42).
**Method:** every public route and every console module read at source, with
each spacing, type and layout value resolved through the stylesheet cascade and
evaluated at **390 × 844** — the plan's reference phone. A `clamp(a, b + c·vw,
d)` is evaluated at 390px as `b + c × 3.9`. Nothing here is estimated from a
screenshot.

> **Read this with `docs/compact-density-research.md`**, which records the
> principles the proposals are drawn from and, more usefully, the ones Karma
> deliberately does not borrow.

---

## 0. The four headline findings

**1. The public site is not actually a black site — but it does have five
black surfaces, and they are the five loudest moments on it.**

The brief's premise is that the public experience reads as black-background.
Measured, the picture is more specific and more fixable. `.band-human`,
`.band-material` and `.band-info` all already resolve to Cotton or Raw Silk,
and `/student-work`, `/success-stories`, `/about` and `/contact` contain no
dark surface at all. What produces the impression is that **the five surfaces
that do go dark are the hero, the production rail, the EMCAD decision block,
the homepage close and the B2B chain** — i.e. the first thing a visitor sees,
the last thing they see, and the commercially most important block in between.
The footer, widely assumed to be the sixth, is `#e9decd` Raw Silk and always
has been. Its problem is height, not tone.

**2. The single worst density defect on the public site is the footer, and it
is on every page.** It measures **1,031px on a 390px phone** (~1,100–1,150px in
Gujarati) and buries the studio's phone number 686px inside itself — below a
full phone viewport of slogan and prose. It also shows *fewer* links than
desktop, because two of its four columns are `hidden md:block`.

**3. Karma Console has no bottom navigation, so every module switch costs a
full-viewport drawer.** The owner's drawer is **795px** tall — 12 rows,
three group headings, a footer — and it is the dominant mobile navigation state
on every console route. Meanwhile the console's own list primitives
(`.data-list` / `.data-row` / `.kv-grid` / `.chip` / `.tap` / `.rec-menu`) are
already correct and already dense; **six modules simply do not use them**, and
render a `<article class="panel">` per record instead: 443px per admin, 362px
per certificate candidate, ~900px per design job.

**4. Almost nothing needs a new query.** Across every admin row shape proposed
below, the fields are — with four named exceptions — already selected and in
some cases already fetched and thrown away. `demoSlot`, `createdAt`,
`enrollmentStatus`, `joinedOn`, `agreedCourseName` and `latest` are all
selected today and rendered nowhere.

---

## 1. Public first-viewport measurements at 390 × 844

The usable band is **844 − 64 (header) − 56 (tab bar) = 724px**, and in real
mobile Safari nearer 600px. "px to first action" is measured from the top of
the document.

| Route | px to the first useful fact or action | Verdict |
| --- | ---: | --- |
| `/en` (home) | 756 | Demo CTA is 16px behind the tab bar; no part of the Screen → Machine → Result story reaches the fold |
| `/gu` (home) | 845 | **The primary CTA falls entirely below the fold.** The first-class locale pays the larger penalty |
| `/en/courses` | 1,190 | Zero of eleven courses visible; course 01 is ~1.4 screens down |
| `/gu/courses` | 1,323 | 11% worse than English on the site's most important page |
| `/courses/[slug]` (ten unverified) | 1,185 | Fold is defensible; the next 900px is a placeholder frame + a decorative signature + a caption |
| `/courses/emcad-embroidery-design` | 3,900 | **The one course with a confirmed fee makes the reader travel ~4.6 screens to reach it**, and states its duration twice and its software three times |
| `/en/admission` | 719 | 719px of chrome before the first choice; the 11 course chips are a further 659px; Next on step 3 sits ~1,630px down with no sticky action |
| `/en/admissions` | 439 | Both CTAs reachable, but the viewport is 100% introduction — zero steps, zero demo facts, zero batches |
| `/en/contact` | 398 | Of the plan's six required items only *hours* and *map trigger* are visible; the first channel row opens at ~906px |
| `/en/student-work` | 468 | One title, one paragraph, two buttons, a six-line disclaimer. First frame at ~1,168px |
| `/en/success-stories` | 369 | 470 characters of caveat before a single story; first `StoryCase` at ~1,347px |
| `/en/about` | 497 | Two real facts reach the screen only because the aside is last |
| `/en/notes` | 969 | 1.34 viewports of introduction before one of eight notes |
| `/en/notes/[slug]` | 1,144 | The answer does land in the lede, but "What to check" — the list an operator at a machine needs — is a screen down behind a 233px drawn plate |
| `/en/services` | 790 | First substantive panel at 790px; then ~1,677px of a single near-black band |
| `/en/verify` | 563 | **Passes** — and only because `PageIntro` has no `actions` here, worth 132px |
| `/en/verify/[id]` | 150 | **The densest public page on the site, because it declines `PageIntro`** |
| `/en/privacy` | 392 | Acceptable |
| `/en/terms` | 333 | Acceptable density, wrong emphasis — six body paragraphs styled as six headlines |
| 404 | 571 | Two of four rescue links visible; the six-course catalogue is entirely below the fold |
| error boundary | 298 | **Passes** — and it is the only inner page that hand-rolls its heading instead of using `PageIntro` |

**`PageIntro` is the public site's cost centre.** The two pages that pass this
table are the two that do not use it. It costs 132px for an `actions` row and
197px for an aside that, below 900px, stacks *between* the page title and the
page's real content.

---

## 2. Public dark-surface inventory

Every dark public surface, and what it becomes. `.on-carbon` (`premium.css:61`)
is not a background: it **re-points seven palette tokens** — `--color-ivory`,
`--color-ivory-2`, `--color-card`, `--color-line`, `--color-carbon`,
`--color-stone` and `--color-vermilion-deep` — so everything nested inside
inherits an inverted palette. That is why lightening a band is never a
one-property change.

| Surface | File | Becomes | The thing that breaks if you only change the colour |
| --- | --- | --- | --- |
| Homepage hero | `home/Hero.tsx:71` | Steel Mist band | `.hero-frame-knot` hardcodes a dark fill; `SectionHeading onDark` paints `text-ivory`; `tests/machine-lab-shell.test.tsx:224` **requires** `on-carbon` here |
| Production rail | `home/ProductionRailSection.tsx:45` | Fold into the hero, or Steel Mist | `.on-carbon .rail-detail-text` hardcodes `#c9c4b9`; `onDark` on its `SectionHeading` |
| EMCAD decision block | `home/EmcadDecision.tsx:78` | Steel Mist, panels carry the emphasis | Six `<MonoNote tone="ivory">` calls become invisible; `onDark` |
| Homepage close | `home/CtaBand.tsx:16` | Steel Mist, both stitch rules kept | `text-vermilion` on the signoff is large-text-only contrast on a light ground |
| B2B chain | `studio/StudioRail.tsx:81` | Steel Mist band (~1,677px surface) | `tests/machine-lab-studio.test.tsx:136` **requires** `on-carbon band-machine` |
| `/admissions` closer | `[locale]/admissions/page.tsx:173` | `band-info` or Steel Mist | `text-stone` on line 177 currently resolves through the re-pointed token |
| Machine/software spec panel | `courses/[slug]/page.tsx:304`, `services/page.tsx:122` | New light `.surface-spec`, or drop `surface-machine` | `premium.css:1287-1289, 1316, 2274` hardcode `#f4efe4`, `#a9b6bd` and `needle-light` — all six rules move as one unit |

**Deliberately staying dark**, and each is explicitly permitted by the plan's
§3 exception for text, icons, hairlines and very small badges:

- the mobile-menu **scrim** (`Header.tsx:166`) — a modal scrim is not a page band;
- the **active locale pill** (`LanguageToggle.tsx:42`) — a 29px badge, and the only unambiguous `aria-pressed` signal in the control;
- the **skip link** (`layout.tsx:64`) — zero-size until focused, and carbon-on-ivory is the highest contrast pairing available;
- `--color-carbon` itself, which is frozen and shared with the Console.

**Do not touch** `.band-material`, `.band-human` or `.band-info`: they are the
only correctly-behaving public bands in the codebase and they are the model for
what the others become. A sweep that "lightens every band" would flatten the
Cotton/Raw Silk alternation that currently separates seven sections on
`/admissions` and leave the page as one undifferentiated scroll.

### Two real bugs found while measuring, both z-index

Neither is a density problem; both were found by measuring the fixed chrome and
both should be fixed in Phase 3.

1. **`.tabbar` (`z-index: 45`) paints over the mobile-menu scrim (`z-40`)** — so
   the Call/Directions bar sits on top of an `aria-modal="true"` dialog and stays
   pointer-tappable outside its focus trap.
2. **`LangBanner` (`z-40`) is covered by the same bar.** Its two buttons sit
   between 12px and 60px from the bottom and are almost entirely hidden. The
   `bottom-[4.25rem]` branch that would have avoided this is dead: it tests
   `hasStickyBar` for a per-page sticky action bar that no longer exists as a
   component (the same dead branch is in `WhatsAppFab.tsx:24-26`).

---

## 3. Admin first-viewport measurements at 390 × 844

Usable band is **844 − 72.4 (sticky header) = 771.6px**, less the 16px main
padding.

| Route | Useful records visible | Cost before the first record | Verdict |
| --- | ---: | ---: | --- |
| `/admin` (full permissions) | 7–8 | 210px | Passes the letter of the test; a quarter of the viewport is spent before the first record and 63px of the first card is an "Open the full list" band |
| `/admin` (Gujarati) | 6–7 | 210px | One record worse than English, entirely from inherited line-height on three classes that never declare one — a one-line-per-class fix |
| `/admin` (fees-only admin) | **0** | — | **Exactly the "one title and half a record" screen the plan names.** They still pay for `getDashboardCounts` over applications, batches and briefs they cannot open |
| `/admin` (attendance-only admin) | 5 | — | The one module they work in all day has no queue and appears only as a button ~1,100px below the fold |
| `/admin/admissions` | **0** | 467px | Three stacked metric tiles (306px) + a filter toolbar (292px) before any enquiry |
| `/admin/students` | **0** | 590px | Two always-visible front-desk accordions plus a print button before the directory |
| `/admin/courses` | **0** (28px of one row) | 694px | A sliver of a title, no meta line, no status chip |
| `/admin/fees` | **0** (54px of an ~87px row) | ~700px | The page's own comment says a row "answers the only question the front desk asks all day" — and not one row is legible |
| `/admin/attendance` (marking) | **0** | ~1,069px | An operator must scroll ~225px past the fold before a single name is markable; each student card is 212px |
| `/admin/certificates` | **0** | ~530px | 300px metric trio + a 48px R2 note |
| `/admin/design` | **0** | ~695px | Worst in scope: metric trio + R2 note + an always-open "Add job" head |
| `/admin/content` | **0** (manage) | 633px | The create form is always expanded for a manage holder |
| `/admin/reports` | 5 | 806px | **Seven metric panels stack to 806.5px — 42px taller than the whole content budget** |
| `/admin/team` | 0 | 252px | Best behaved, because the invite form is collapsed by default |
| `/admin/account/security` | 4 | 416px | Passes, but 416px for four label/value pairs `.kv-grid` would show in 95px |
| `/admin/records/…/delete` | 0 | 250.7px | **The only console page that does not use `PageHead`** — its legacy title renders 27px, above the plan's 22–26px band |

**The pattern is one pattern.** Ten of the sixteen screens open with a three- or
seven-up grid of `Metric` cards that stacks to a single column at 390px, because
its breakpoint is `sm:` (640px). That one decision costs 300–806px on nine
different screens.

---

## 4. Oversized components and spacing patterns

216 measured findings; **~25,300px of mobile height recoverable in total**. The
largest are ranked below by area.


### Public shell — 18 findings, ~370px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 92px | `src/components/site/Footer.tsx:31` | The `footer.line` prose paragraph — 105 chars wrapping to 3 lines at 15px/1.6 — preceded by a 20px mt-5. It restates footer.spine + footer.spineSub, w | 92px → drop the paragraph on mobile (`hidden md:block`) or remove it entirely — see copyBloat |
| 72px | `src/components/site/Header.tsx:186` | Mobile menu row: `text-lg` brings Tailwind's paired 1.75rem line-height, so py-3.5 produces a 56px row; 8 rows = 456px. | 57px → border-b border-line/70 py-3 text-base font-semibold (48px row — still clears the 44-48px touch floor) |
| 37px | `src/app/premium.css:1435` | .site-spine-title — the closing slogan repeated on EVERY page, rendered at page-title scale. At 390px = 28.93px/1.04, and 'From screen to stitch.' at  | 60px → font-size: clamp(1.375rem, 0.55rem + 3.4vw, 3.25rem) — 22.1px at 390 (fits on one line), unchanged 52px at >=1440 |
| 30px | `src/app/premium.css:1443` | .site-spine-sub at --text-lead = 18.13px/1.45, wrapping to 2 lines inside max-width:34ch. Owner target for secondary copy is 12-14px, body 14-16. | 53px → font-size: clamp(0.9375rem, 0.85rem + 0.35vw, 1.25rem); line-height: 1.5 (15px at 390, one line) |
| 24px | `src/app/premium.css:1429` | .site-spine padding-bottom + margin-bottom, each clamp(1.75rem, 1.4rem + 1.5vw, 2.75rem) = 28.25px at 390 — 56px of separation between a two-line slog | 56px → padding-bottom: clamp(1rem, 0.7rem + 1.3vw, 2.75rem); margin-bottom: same (16px at 390) |
| 20px | `src/components/site/Footer.tsx:101` | Legal strip separation: 32px margin plus 24px padding above a two-line copyright. | 56px → mt-5 flex flex-col md:mt-8 gap-x-4 gap-y-1.5 border-t border-line pt-4 |
| 16px | `src/components/site/LangBanner.tsx:52` | First-visit banner buttons. `!px-4 !py-2` is inert for height because `.btn{min-height:3rem}` (globals.css:327) is not overridden, and `:lang(gu) .btn | 104px → add `!min-h-11` to both (44px — the touch floor, honestly reached) and drop the banner to p-2.5; banner becomes ~88px |
| 14px | `src/components/site/Header.tsx:196` | Mobile menu CTA block padding, plus the panel's own py-4. | 56px → grid gap-2.5 py-4 inside nav py-3 |
| 12px | `src/app/premium.css:1428` | .site-spine internal gap, applied twice (title->rule, rule->sub). | 28px → gap: 0.5rem |
| 12px | `src/components/site/Footer.tsx:27` | Footer column grid row gap. At 390px only two of the four children render (lines 41 and 56 are `hidden md:block`), so this is a single 32px gap. | 32px → grid gap-x-8 gap-y-5 md:grid-cols-2 md:gap-y-8 lg:grid-cols-12 |
| 12px | `src/app/premium.css:1157` | .site-body bottom reservation for the tabbar. Reserves 64px for a 56px bar, and the 8px overshoot renders as --color-ivory (#f5f0e6) under the #e9decd | 64px → padding-bottom: calc(3.25rem + env(safe-area-inset-bottom)) once .tabbar-item is 52px — ideally both derived from one --tabbar-h token so they cannot  |
| 9px | `src/components/site/Footer.tsx:29` | 'Karma Design Studio' block heading at --text-h3 = 24.44px. Owner target for a section heading is 18-22px. | 31px → font-display text-[1.0625rem] md:text-h4 font-bold leading-snug |
| 8px | `src/components/site/Header.tsx:90` | Sticky public header height. At 390px it carries a 26px brand tick, an 18px wordmark and a 44px hamburger — LanguageToggle (line 138, `hidden sm:flex` | 64px → condensed ? "is-condensed h-14" : "h-14 md:h-16 xl:h-[4.5rem]" |
| 8px | `src/components/site/Footer.tsx:32` | Gap above the social row. | 24px → mt-4 flex flex-wrap gap-x-4 gap-y-1.5 |

<sub>+4 further findings in the same scope, all recorded in the phase notes.</sub>

### Public homepage — 18 findings, ~6215px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 1100px | `src/app/premium.css:1993` | .work-grid stays 1-column until 620px, so Proof renders three WorkLedger cards each with a full-width ManagedPhoto (source ratios 4/5, 1/1 and 3/2 fro | 2065px → move the 2-column breakpoint to min-width: 380px and reduce .work-body padding (premium.css:2018) to clamp(0.625rem, 0.55rem + 0.3vw, 1.25rem) = 11.7p |
| 940px | `src/app/premium.css:1663` | .proof-strip goes 2-column only at 560px, so the four MachineProof panels each render a full-width 8/5 figure (premium.css:1690-1697) | 1389px → move the 2-column breakpoint to min-width: 380px. Each figure becomes 169px wide by 105.6px tall and the strip drops to two rows of about 205px. |
| 766px | `src/app/machine-lab.css:750` | .rail-track — the ProductionRail stays 1-column until 768px, so on a phone each of three stages renders a full-width 16:9 placeholder (44px rail-tab + | 1178px → if the section survives the hero merge: below 768px use grid-template-columns: repeat(3, minmax(0,1fr)) with gap 8px, .rail-caption at 0.8125rem and . |
| 690px | `src/components/home/Hero.tsx:138` | The hero Screen to Machine to Result thread: three ManifestPhoto frames at 4:3 stacked vertically, each 314px wide inside .hero-thread-list (padding-l | 933px → below 640px only: .hero-thread-list { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; padding-left: 0 } with .hero-thread-rail and .hero-fr |
| 680px | `src/app/premium.css:1583` | .workflow-steps stays 1-column until 640px, so ProductionWorkflow renders six full-width stages plus five 36px drop connectors (.workflow-drop, premiu | 1224px → move the 2-column breakpoint to min-width: 380px, which also switches .workflow-drop off since that connector rule is already scoped to the one-column |
| 600px | `src/app/machine-lab.css:1218` | .studio-grid stays 1-column until 900px, so WhereYouLearn renders A1_MACHINE_FLOOR (1200x1500) at 350px wide and therefore 437.5px tall, plus two more | 957px → below 900px use grid-template-columns: repeat(2, minmax(0,1fr)) for all three frames at 169px wide, giving 211 + 95 + 95. Aspect ratios stay manifest- |
| 473px | `src/app/machine-lab.css:975` | .mi-link padding-block on the Machine Index row, times eleven courses (CourseCatalogue.tsx:38) | 1738px → padding-block: 0.625rem; .mi-name font-size 0.9375rem (15px, inside the plan's 15-18 card-title band, at which most course names fit one line); .mi-pr |
| 302px | `src/app/machine-lab.css:1244` | .studio-station-list — four 1:1 machine placeholders at 169px each, in two columns, to label four one-word techniques (Zardosi, Beads, Laser, Tufting) | 414px → repeat(4, minmax(0,1fr)) below 720px with gap 6px: each station 81px plus its name, one row of about 112px |
| 199px | `src/app/premium.css:358` | .fact-rail goes 2-column only at min-width 420px, so a 390px phone gets five single-column rows for the trust band (TrustRail.tsx:34) | 370px → move the 2-column breakpoint to min-width: 360px and reduce .fact-rail > * padding-block to 0.5rem, so five items become three rows of about 57px = 17 |
| 152px | `src/components/home/Investment.tsx:40` | the six-item 'included in every course fee' list renders at the inherited body size of 16px with line-height 1.625 and space-y-2.5 between items, each | 518px → add text-smallmeta to the item <span> (15px, line-height 1.6) and space-y-1.5; card padding p-5 md:p-6 becomes p-3.5 md:p-4 |
| 80px | `src/components/site/FaqList.tsx:28` | FAQ summary padding — className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold md:p-6" | 40px → px-4 py-3 md:p-5 — min-h-14 keeps the 56px touch target, so the vertical padding is redundant height repeated five times on this page alone |
| 72px | `src/components/home/BatchesTeaser.tsx:85` | batch card padding — className="card card-lift flex flex-col p-6 md:p-8" | 48px → p-3.5 md:p-4 (14px and 16px) |
| 69px | `src/app/premium.css:432` | .hero padding-block — top and bottom pad on the one section that must fit in the first screen | 111px → clamp(1.25rem, 1rem + 0.7vw, 5rem) clamp(1.5rem, 1.2rem + 1.1vw, 7rem) = 18.7px top and 23.5px bottom at 390px, desktop endpoints unchanged |
| 36px | `src/components/home/VisitStudio.tsx:26` | container grid gap on the visit block — className="container-site grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16" | 48px → gap-6 lg:gap-16 (24px on mobile, desktop unchanged); and separately VisitStudio.tsx:99 feature-surface p-5 md:p-6 becomes p-3.5 md:p-5 |

<sub>+4 further findings in the same scope, all recorded in the phase notes.</sub>

### Public courses — 18 findings, ~3245px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 1224px | `src/app/[locale]/courses/[slug]/page.tsx:486` | Related courses — three <CourseCard> in a mobile-single-column grid at the very bottom of the page. Each card is a 3:2 media box at full 350px width = | 1476px → Render <MachineIndex courses={related} locale={l} /> instead below 900px (or entirely). Three rows at the compacted ~84px = 252px, and the two surface |
| 594px | `src/app/machine-lab.css:1024` | .mi-produces — the Machine Index row's second line. font-size resolves to --text-smallmeta (globals.css:109) = 15px with line-height 1.55 = 23.25px/li | 93px → font-size: 0.8125rem /* 13px */; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden  (13px  |
| 256px | `src/components/course/CourseOperations.tsx:92` | The four verified batch-timing slots. Below the `sm:` breakpoint the grid is a single column, so four cards stack: each is border + p-4 (16px) + a .te | 380px → grid-cols-2 from 0px, p-2.5 (10px), and the time at 0.9375rem/15px semibold instead of .text-h4 — four times become two rows of two, ~58px each. A bat |
| 190px | `src/components/course/ModuleAccordion.tsx:11` | The syllabus accordion forces its first panel open (`open={i === 0}`) and pads each summary at p-5. On a phone that renders an expanded module list no | 190px → Drop `open={i === 0}`; summary p-3.5 (14px, inside the 12-18 public card target) with min-height 44px preserved via the flex row; body px-3.5 pb-3.5 p |
| 147px | `src/app/[locale]/courses/[slug]/page.tsx:230` | <StitchRule draw className="mt-4 max-w-[4.5rem]" /> — repeated at :235, :316, :346, :386 on this page, and again at CourseOperations.tsx:66, :127, :14 | 189px → Keep at most two per page — the strongest candidates are the fee block (CourseOperations.tsx:165) and 'Why this course exists'. Delete the other seven |
| 132px | `src/app/machine-lab.css:975` | .mi-link padding-block — the row's own vertical padding, applied 11 times on /courses and again on the homepage teaser (CourseCatalogue.tsx also rende | 32px → padding-block: 0.625rem /* 20px */ — with the clamped produces line the row still measures ~84px, comfortably above the 44-48px touch minimum |
| 120px | `src/app/premium.css:1640` | .problem-fault — the title of each production-problem row on the detail page ([slug]/page.tsx:293-295). It renders at --text-h4, which is a heading to | 54px → font-size: 1rem /* 16px */; line-height: 1.35; .problem-row padding-block: 0.625rem /* 10px */. Keep the existing :lang(gu) .problem-fault reset at pr |
| 118px | `src/app/[locale]/courses/[slug]/page.tsx:200` | The hero-rail ManifestPhoto. `editorial` + full container width means a 4:3 frame (photo-manifest.ts:111-112, 1600x1200) renders 350x262 on a phone —  | 262px → Add `.course-mark-photo { max-inline-size: 12rem }` below 900px in machine-lab.css:1326. The frame becomes 192x144 and the aspect-ratio is untouched,  |
| 88px | `src/app/machine-lab.css:969` | .mi-link grid-template-areas — .mi-meta is given its own full-width third row on mobile (`"meta meta meta"`), so the family chip, the optional duratio | 21px → Keep the third row but drop .mi-meta margin-top to 0 and set the chips to 0.6875rem/11px in this context (matching .course-cue at premium.css:1851, wh |
| 65px | `src/app/machine-lab.css:1335` | .course-signature .tech-sig — the technique signature in the detail-page rail. The SVG is viewBox 0 0 160 96 (TechniqueSignature.tsx:321) at width:100 | 198px → `.course-signature .tech-sig { max-inline-size: 13rem }` below 900px => 208 x 125px. The signature is the primary mark for the three unphotographed co |
| 64px | `src/components/course/CourseOperations.tsx:89` | `mt-12` block separator, repeated four times inside ONE section — also at CourseOperations.tsx:108, :124 and :163. 4 x 48px = 192px of gap inside a si | 192px → className="mt-8" /* 32px */ x 4, or a single `.u-block-gap` utility in globals.css @layer components set to clamp(1.5rem, 1.2rem+0.9vw, 3rem) = 24.7px |
| 60px | `src/app/premium.css:1893` | .output-item padding-block — 'What this work sells as' ([slug]/page.tsx:327-336). Single column below 760px, 4-6 items per course. | 28px → padding-block: 0.5rem /* 16px per row */ — the hairline border-bottom (premium.css:1894) already separates them |
| 52px | `src/app/machine-lab.css:1012` | .mi-name — the row title. 18px sits exactly at the ceiling of the 15-18 card/list-title target, and it is the reason the two cued rows (zardosi + flat | 47px → font-size: 1rem /* 16px */; line-height: 1.3 = 20.8px/line — 'Zardosi Machine Embroidery' + 'Most asked for' then fits one line at 270px, removing the |
| 52px | `src/app/premium.css:263` | .page-intro padding-block — resolved from --space-page-top (premium.css:21) and --space-page-bottom (premium.css:22). 104px of pure padding on every p | 104px → --space-page-top: clamp(1.75rem, 1.3rem+1.2vw, 6rem) /* 28 at 390, unchanged at >=1280 */; --space-page-bottom: clamp(1.5rem, 1.1rem+1vw, 5rem) /* 24  |

<sub>+4 further findings in the same scope, all recorded in the phase notes.</sub>

### Public admission & contact — 16 findings, ~1189px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 236px | `src/app/[locale]/contact/page.tsx:143` | channel rows: 16px padding + a 16px/26px card-title + a 'value + note' line that wraps to 2-3 lines at 15px | 648px → p-3 gap-3; put the number on its own line at 14px tabular and the note at 13px clamped to one line (or dropped where the label already says it) -> ~76 |
| 170px | `src/components/forms/AdmissionForm.tsx:530` | the 11-course radio grid stays one column until 640px, so step 1 is a 659px scroll of chips | 659px → "grid grid-cols-2 gap-2" from the base width; chips wrap to 2 lines in a 171px column but the list becomes 6 rows |
| 160px | `src/app/[locale]/admission/page.tsx:74` | the PageIntro aside ('Before you start' + 3 reassurance lines) sits between the page title and the form on mobile - pure pre-field chrome | 208px → below 900px render the reassurance as one 2-line note inside the form card under the step header, or move the aside after the form; keep it as the rig |
| 120px | `src/components/forms/AdmissionForm.tsx:344` | the success card - 32px padding, a 64px seal, a 31px h2 and then THREE consecutive reassurance lines (:355 body, :364 responseNote, :365 demoNote) | 470px → p-5 md:p-10, seal h-12 w-12, title at --text-h3, and collapse :364-365 into one line - the reference number and the WhatsApp button are the whole scre |
| 76px | `src/components/forms/AdmissionForm.tsx:522` | step body wrapper: 32px above the first field plus 24px between EVERY field (8 gaps on step 2, 8 on step 3) | 224px → "mt-5 space-y-4" -> 20px + 16px; keep the step<3 step-in guard exactly as is (motion level 0 on the consent step is asserted by tests/machine-lab-admi |
| 64px | `src/app/[locale]/admissions/page.tsx:85` | heading-to-content gap on the two-column sections - 40px ON TOP OF the section's own 40.5px padding | 160px → gap-6 lg:gap-16 at all four sites -> 24px on mobile, desktop unchanged |
| 63px | `src/app/premium.css:289` | .page-intro-title font-size: var(--text-h1) - the plan's mobile page-title target is 24-30px | 123px → clamp(1.625rem, 1.15rem + 2.4vw, 3.5rem) -> 26px at 390; the /admissions 3-line title becomes 2 lines |
| 60px | `src/app/premium.css:263` | .page-intro padding-block: var(--space-page-top) var(--space-page-bottom) - the biggest fixed cost on all three convert routes | 104px → clamp(1.5rem, 1.1rem + 1vw, 4rem) / clamp(1.25rem, 0.95rem + 0.8vw, 3.5rem) - 24px top / 20px bottom at 390, desktop endpoints barely moved |
| 60px | `src/components/site/AdmissionNorms.tsx:38` | the whole norms section, collapsed, for one 58px disclosure plus a 4-line intro | 343px → className="section-compact", details mt-4, summary px-4 py-3 (still a 50px target); the <details> element itself is correct and must stay - it is why  |
| 56px | `src/components/admission/DemoFacts.tsx:54` | the three demo facts stack vertically, each label+value pair ~40px with a 16px gap | 170px → grid-template-columns: repeat(2, minmax(0,1fr)) below 860px with gap 0.75rem - 'Free' and 'Nothing...' pair naturally |
| 54px | `src/app/globals.css:263` | .section padding-block, applied 6 times on /admissions and twice on /admission - two adjacent sections cost 81px of empty band | 81px → clamp(1.25rem, 0.8rem + 1.9vw, 4.5rem) - 27px at 390, unchanged from ~1000px up |
| 24px | `src/app/[locale]/contact/page.tsx:135` | gap between the section heading and the channel list, plus the list's own row gap | 72px → a 16px heading gap and space-y-2 (8px) - divided rows rather than five separate floating cards |
| 16px | `src/components/forms/AdmissionForm.tsx:456` | the form card wrapper - the plan says 'no giant card around every step', public card padding 12-18px | 48px → className="card p-4 md:p-10" -> 16px, and drop the border+radius below 640px so the form is the page rather than a box on it |
| 16px | `src/components/forms/AdmissionForm.tsx:871` | the Next/Submit row - 40px of air above it, and it is never sticky, so on step 3 its top lands ~1630px from document top | 90px → "mt-6 ..." plus a sticky variant below 1280px pinned at bottom: calc(3.5rem + env(safe-area-inset-bottom)) so it clears the fixed .tabbar (premium.css |

<sub>+2 further findings in the same scope, all recorded in the phase notes.</sub>

### Public proof — 19 findings, ~3170px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 1700px | `src/app/premium.css:1993` | .work-grid is one column below 620px, so every <ManagedPhoto> in <WorkLedger> is 350px wide. The six source items (collections.ts:563-568) are 4/5, 1/ | 437px → @media (min-width: 360px) { .work-grid { grid-template-columns: repeat(2, minmax(0,1fr)) } } — media halves to ~169px wide, and the mixed ratios still |
| 700px | `src/app/premium.css:2193` | .review-wall is one column below 640px. Seven sample reviews (collections.ts:434) x (16px card padding top + 4-line body at 15/1.65 + 0.875rem flex ga | 1400px → 2 columns from 360px; these are 4-line quotes, not records that need full width |
| 327px | `src/components/site/TrainerProfile.tsx:57` | <ManifestPhoto id={PORTRAIT_SLOT[...]} editorial /> inside .trainer-media. .trainer-grid (premium.css:2129-2135) is a single column below 900px, so th | 437px → Do NOT touch the aspect-ratio (it is the zero-CLS contract). Instead narrow the column: either .trainer-grid { grid-template-columns: repeat(2, minmax |
| 66px | `src/app/globals.css:263` | .section padding-block. /student-work has 3 of these, /about has 5, /success-stories has 2 plus ReviewWall's. Plan asks for 20-32px mobile section gap | 81px → clamp(1.5rem, 1.2rem + 0.8vw, 4.5rem) -> 24px per edge, desktop endpoint untouched |
| 57px | `src/app/premium.css:293` | .page-intro-lede — margin-top 1.25rem plus --text-lead 18.13px/1.6. Plan body target is 14-16px. Measured on the /student-work 174-char lede. | 165px → margin-top: 0.75rem; font-size: 1rem; line-height: 1.5 below 768 (4 lines x 24) |
| 37px | `src/app/premium.css:288` | .page-intro-title font-size. At 390 this renders 37.4px against the plan's 24-30px page-title target; on a 38-47 char title (student-work, about) the  | 123px → public-only mobile override in machine-lab.css: @media (max-width: 767px) { .site-body { --text-h1: clamp(1.625rem, 1.4rem + 1.1vw, 3.5rem) } } -> 26p |
| 34px | `src/app/premium.css:1951` | .case-problem in <MachineCases> — the fault sentence is set at --text-h4 (20.2px at 390) against a card-title target of 15-18. The four problems are 1 | 106px → font-size: 1.0625rem; line-height: 1.4 below 768 -> 3 lines x 23.8 |
| 34px | `src/app/premium.css:2104` | .story-quote — 20px margin-top + 20px padding-top + a 20px Playfair italic, per story card, x6 cards on /success-stories. | 40px → margin-top: 0.75rem; padding-top: 0.75rem; font-size: clamp(1.0625rem, 1rem + 0.4vw, 1.5rem) |
| 32px | `src/app/premium.css:1964` | .case-fields > * padding-block — four schema rows per note, four notes on /student-work. 12px top + 12px bottom per row = 96px of padding per note. | 96px → padding-block: 0.5rem |
| 28px | `src/app/premium.css:21` | --space-page-top, the top padding of every public interior page's <PageIntro>. Applies to all three proof routes. | 56px → clamp(1.75rem, 1.4rem + 0.9vw, 6rem) |
| 28px | `src/app/premium.css:22` | --space-page-bottom, the bottom padding of the same block. | 48px → clamp(1.25rem, 1rem + 0.9vw, 5rem) |
| 26px | `src/app/premium.css:322` | .page-intro-aside padding-top, on top of the 2rem .page-intro-grid gap at premium.css:280 — 56px of pure separation above a disclaimer that is inside  | 56px → gap: 1rem; padding-top: 0.875rem |
| 24px | `src/app/[locale]/student-work/page.tsx:114` | Closing CTA panel: .surface-feature padding is clamp(1.25rem, 0.95rem + 1.2vw, 2.25rem) = 20px (premium.css:1277-1280) plus a Tailwind gap-6 (24px) be | 64px → gap-4 (16px) and surface-feature padding clamp(0.875rem, 0.7rem + 1.2vw, 2.25rem) -> 14px |
| 16px | `src/app/premium.css:311` | .page-intro-actions margin-top — the gap between the lede and the first tappable CTA on every proof route. | 32px → margin-top: 1rem |

<sub>+5 further findings in the same scope, all recorded in the phase notes.</sub>

### Public secondary — 24 findings, ~2290px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 466px | `src/app/[locale]/loading.tsx:31` | The loading skeleton reserves three stacked 192px card blocks on mobile (`md:grid-cols-3` never applies at 390px) for routes that are hairline row lis | 616px → Five `skeleton h-14` rows at `gap-2` on mobile, promoting to the 3-up h-48 grid only at md — matches the real .ledger / .note-archive shape so the swa |
| 407px | `src/components/studio/StudioRail.tsx:84` | ProductionRail on /services: five stages, each carrying an 88px drawn-mark plate, stacked vertically on mobile with 20px gaps — 5 x (44px tab + 88px m | 1005px → `@media (max-width: 767px) { .rail-mark { min-height: 3rem; } .rail-track { gap: 0.75rem; } .rail-caption { margin-top: 0.375rem; font-size: 0.875rem; |
| 197px | `src/app/premium.css:318` | `.page-intro-aside` stacks BELOW the actions and ABOVE the page's real content on every viewport under 900px — 125px on /services and /verify, 197px o | 197px → Move it out of the intro on mobile. CSS `order` cannot cross the section boundary, so add an `asidePlacement="after-content"` option to PageIntro (src |
| 160px | `src/app/premium.css:1370` | `.stack-lines > *` padding-block on the two /services exchange panels (services/page.tsx:113 and :125) — 5 items each, both panels, at 16px top + 16px | 320px → `@media (max-width: 767px) { .stack-lines > * { padding-block: 0.5rem; } }` → 8+8 per item |
| 137px | `src/app/premium.css:2282` | `.note-course-plate` — the drawn TechniqueSignature in the note-page aside is forced to a 3:2 box, which on a 350px mobile column is 233px tall. Techn | 233px → `@media (max-width: 899px) { .note-course-plate { aspect-ratio: auto; height: 6rem; } }` → 96px, matching the SVG's own 160x96 geometry |
| 108px | `src/app/[locale]/notes/[slug]/page.tsx:161` | Three prose blocks hand-spaced with ad-hoc Tailwind margins instead of the rhythm utilities CLAUDE.md rule 17 mandates — mt-8/mt-10 heading gap + mt-4 | 228px → `.u-section-body` (24px) for the heading gap, drop the three StitchRules to one, `mt-3` (12px) for the body → ~120px total for the three blocks |
| 103px | `src/app/machine-lab.css:1741` | `.note-archive-answer` prints the COMPLETE answer in every index row — src/content/notes.ts answers run 196-356 chars (mean 261). At 15px/1.6 in a 314 | 144px → `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.875rem; line-height: 1.45` → 2 lines = 41px |
| 92px | `src/components/ui/SectionHeading.tsx:39` | The section sub is `.u-lede` — 18.1px lead type for what is secondary copy; servicesPage.chain.sub (220 chars) becomes 6 lines = 174px | 190px → `@media (max-width: 767px) { .site-shell .u-lede { font-size: 0.9375rem; line-height: 1.5; margin-top: 0.5rem; } }` → 15px/22.5px, 4 lines + 8px = 98p |
| 80px | `src/app/[locale]/privacy/page.tsx:119` | 48px gap between each of the five legal sections, on a page whose own clauses are 2-3 lines each | 192px → "mt-7" (28px), inside the owner's 20-32px mobile section-gap band → 112px across the four gaps |
| 72px | `src/app/premium.css:314` | Below 480px both PageIntro actions go `flex: 1 1 100%`, so two CTAs cost 100px of stacked height instead of 44px side by side | 132px → Drop the breakpoint to `max-width: 359px` so 390px phones get `flex: 1 1 auto; min-width: 0` two-up, and set margin-top: 1rem. Keep min-height: 2.75re |
| 70px | `src/app/machine-lab.css:1721` | `.note-archive-spec` puts the whole four-part NoteSpec block (MACHINE NOTE / 06, technique line, 5px stitched rule with 10px margins, ISSUE row) on it | 87px → Below 860px collapse NoteSpec to one 12px mono meta line — `06 · <technique> · <issue>` — by hiding `.note-archive-spec .note-spec-rule` and inlining  |
| 63px | `src/app/premium.css:287` | `.page-intro-title` font size — 37.4px at 390px against the owner's 24-30px page-title target, inside a 17ch measure that forces long titles to 4 line | 164px → `@media (max-width: 767px) { .page-intro-title { font-size: 1.75rem; line-height: 1.2; max-width: 24ch; } }` → 28px, 33.6px/line, ~3 lines for the lon |
| 63px | `src/app/premium.css:293` | `.page-intro-lede` — 18.1px lead type at 1.6 makes a 199-char lede 5 lines (/notes) and the note-page answer up to 9 lines | 165px → `@media (max-width: 767px) { .page-intro-lede { margin-top: 0.75rem; font-size: 0.9375rem; line-height: 1.5; } }` → 15px/22.5px, 4 lines + 12px |
| 60px | `src/app/premium.css:263` | `.page-intro` padding-block — the single most-repeated block of dead space on the public site (every inner page in this scope except error.tsx and ver | 104px → Add a public mobile floor: `@media (max-width: 767px) { .page-intro { padding-block: 1.5rem 1.25rem; } }` (24/20). Leave the desktop clamps untouched  |

<sub>+10 further findings in the same scope, all recorded in the phase notes.</sub>

### Admin shell — 15 findings, ~235px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 58px | `src/components/admin/ConsoleShell.tsx:94` | Drawer section titles use `.microlabel` (globals.css:558-564): 12px/700/uppercase/letter-spacing 0.08em, line-height inherited 1.625 | 82.5px → In a bottom-nav world the three titles disappear entirely; in a More sheet use 11px/1.2 = 13.2px with mt-1. ALSO A CORRECTNESS BUG — see the Gujarati  |
| 26px | `src/components/admin/ConsoleShell.tsx:151` | Header second line `personName · roleLabel` using `.form-note mt-0.5` | 26.4px → Delete from the header (it is already in the drawer footer at ConsoleShell.tsx:136-137 and on /admin/account/security). If it must stay, 11px/1.25 = 1 |
| 26px | `src/components/admin/ConsoleShell.tsx:182` | Drawer footer `mt-6 ... border-t px-3 pt-5` for two 15px links (Account, Sign out) | 69.4px → mt-3 pt-3 and 13px links: 12 + 1 + 12 + 18.2 = 43.2px |
| 24px | `src/components/admin/ConsoleShell.tsx:91` | Nav section spacing `grid gap-7` between the three nav groups | 56px → gap-4 (16px x2 = 32px) — inside the plan's 12-24px admin section-gap band |
| 20px | `src/components/admin/ConsoleShell.tsx:148` | Mobile console header. `min-h-16 ... px-4 py-2.5` — the 64px floor never binds because the two stacked text lines are 51.4px tall. | 72.4px → Single line: keep `brand` only, `py-2` (8px x2), min-h-[3.25rem]. Move `personName · roleLabel` into the More sheet where the account link already liv |
| 18px | `src/app/machine-lab.css:1981` | `.queue-empty, .queue-more` — a 'View all' line costing as much as a record | 49.4px → padding: 0.375rem 0.875rem; font-size 0.8125rem (13px)/1.4 = 18.2px -> 6 + 18.2 + 6 + 1 = 31.2px |
| 16px | `src/app/admin/(console)/page.tsx:100` | `className="queue-grid mt-8"` — the gap between PageHead and the first queue | 32px → mt-4 = 16px, inside the plan's 12-24px admin section-gap band |
| 13px | `src/app/globals.css:629` | `.metric` (rendered by src/components/admin/Metric.tsx:19) has no mobile override anywhere in the three stylesheets | 64px → Add to the existing `@media (max-width: 767px)` block in premium.css:1032-1039: `.metric { font-size: 1.75rem; }` -> 30.8 + label 19.5px (with the lab |
| 12px | `src/app/machine-lab.css:1912` | `.queue-head` padding + `.queue-title` at 15px with inherited line-height 1.625 | 49.4px → padding: 0.5rem 0.75rem and `.queue-title { line-height: 1.3 }` -> 8 + 19.5 + 8 + 1 = 36.5px. Keeps the 15px title inside the 14-17px admin record-tit |
| 8px | `src/app/machine-lab.css:1877` | `.console-head-context` — the PageHead operational line, on every console route | 45px → font-size: 0.8125rem (13px); line-height 1.4 -> 18.2px per line. The plan's admin metadata target is 11-13px; 15px is above the band. |
| 5px | `src/components/admin/ConsoleShell.tsx:150` | Header brand wordmark `text-xl font-semibold leading-tight` | 25px → text-[0.9375rem] (15px) font-bold leading-[1.3] -> 19.5px; inside the plan's 15-18px card/list-title band and enough for a persistent wordmark |
| 4px | `src/app/machine-lab.css:1962` | `.queue-row-title` sets font-size but NOT line-height, so it inherits body 1.625. The row's own comment (machine-lab.css:1946-1947) claims '44px comes | 58.2px → `.queue-row-title { line-height: 1.3 }` -> 19.5px; row becomes 53.3px, still >= the 44px hit area. Across a 5-row queue that is 24.5px; across the two |
| 0px | `src/components/admin/ConsoleShell.tsx:170` | Drawer scrim offset `fixed inset-0 top-16` — assumes the header is exactly 64px when it measures 72.4px | 64px → top-[var(--console-header-h)] with `--console-header-h` set on `.console-root`. Today the scrim dims the header's bottom 8.4px (the scrim is z-30, sam |
| 0px | `src/components/admin/ConsoleShell.tsx:179` | Drawer panel `top-16` + `max-h-[calc(100dvh-4rem)]` — the same 64px assumption, twice | 780px → top/max-h from `--console-header-h`. The panel currently starts 8.4px UNDER the header and may extend 8.4px past the viewport bottom. |

<sub>+1 further findings in the same scope, all recorded in the phase notes.</sub>

### Admin Today — 18 findings, ~571px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 339px | `src/app/admin/(console)/page.tsx:217` | Quick actions section — a heading plus up to ten full-size buttons that duplicate the nav drawer already built in ConsoleShell.tsx:90-124 | 438.9px → Drop the section on phones (media-hidden) or render it as a single wrapped row of the EXISTING .chip primitive (premium.css:881-893, which already has |
| 64px | `src/app/admin/(console)/page.tsx:194` | static explanatory prose under the queue grid: t("today.queueNote") = 'Each queue shows the first few. The count is the whole list.' | 64.8px → Delete. Once .queue-more only appears when count > QUEUE_LIMIT, the note explains a rule the UI no longer needs stated; the count itself is the whole  |
| 63px | `src/app/machine-lab.css:1981` | .queue-more — a full-width band at the foot of EVERY queue card carrying one link, rendered by Queue.tsx:54 whenever `count > 0` rather than when ther | 63px → Queue.tsx:54 — change the guard to `count > QUEUE_LIMIT`; import QUEUE_LIMIT or pass `shown={children count}`. On a studio whose queues are usually un |
| 25px | `src/app/admin/(console)/page.tsx:205` | Recent-activity row: three baseline-aligned spans (action 15px, entity 15px, time 15px) in flex-wrap inside 326px of usable width, so almost every row | 76.8px → px-3 py-2 (12/8) and a fixed 2-line shape: line 1 = action at 14px/1.3, line 2 = `entity #id` + time at 12px/1.4 in one .form-note row with the time p |
| 22px | `src/app/admin/(console)/page.tsx:96` | PageHead `context` concatenates the operational greeting with the static slogan t("today.workDesk") = 'Your work, in the order it needs doing.', pushi | 45px → Operational facts only, one line: `${c.newApplications} new · ${c.followUpsDue} due · ${c.runningBatches} running` (all three already in `c`, page.tsx |
| 16px | `src/app/admin/(console)/page.tsx:100` | gap between the page head hairline and the first queue card | 32px → className="queue-grid mt-4" (16px — inside the plan's 12-24px admin section-gap band) |
| 16px | `src/app/admin/(console)/page.tsx:198` | Recent activity section top margin | 40px → mt-6 (24px) — top of the plan's 12-24px admin section-gap band |
| 8px | `src/app/machine-lab.css:1918` | .queue-head padding — the band carrying the queue name and its count | 12px → padding: 0.5rem 0.75rem (8/12) — matches the plan's 10-14px admin card padding and the existing .console-main 12px gutter |
| 6px | `src/app/machine-lab.css:1860` | .console-head padding-bottom before the hairline | 14px → padding-bottom: 0.5rem (add inside @media (max-width: 767px) so desktop is untouched) |
| 5px | `src/app/machine-lab.css:1920` | .queue-title declares font-size and weight but NO line-height, so a 15px title inherits body 1.625 (globals.css:174) — 1.8 in Gujarati (globals.css:20 | 24.4px → add `line-height: 1.25` => 18.75px. 15px title is already inside the plan's 17-20 section-title / 14-17 record-title bands; only the leading is wrong. |
| 4px | `src/app/machine-lab.css:1962` | .queue-row-title — same missing line-height, but multiplied by every row on the screen (up to 20 rows across 4 queues) | 24.4px → add `line-height: 1.3` => 19.5px. Row height falls 58.2 -> 53.3px and still clears .queue-link's min-height: 2.75rem (machine-lab.css:1950), so the 44 |
| 0px | `src/app/globals.css:632` | .metric font-size — the only styling path for src/components/admin/Metric.tsx, which has ZERO importers (grep for 'components/admin/Metric' across src | 36px → Do not resurrect it for the compact strip: 36px is 10px above the plan's 22-26px admin page-title ceiling. Delete src/components/admin/Metric.tsx (dea |
| 0px | `src/app/premium.css:749` | .console-metrics — 22 lines of grid/border CSS with zero usages anywhere in src/ (grep 'console-metrics' hits only premium.css itself) | 0px → Delete, or reuse the selector name for the new compact strip so the mobile 12/14px padding override at premium.css:1035 comes along for free. |
| 0px | `src/app/machine-lab.css:1900` | Dead media query: the >=1200px .queue-grid rule sets exactly the same value as the >=700px rule at machine-lab.css:1895-1899 | 0px → Delete, or make it repeat(3, ...) if a wide desk should show three queues — but only after the strip lands, so the change is deliberate rather than ac |

<sub>+4 further findings in the same scope, all recorded in the phase notes.</sub>

### Admin admissions & students — 20 findings, ~1669px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 240px | `src/app/admin/(console)/students/page.tsx:294` | Detail metric trio — the same stacked-tile pattern as Admissions | 306px → <div className="grid grid-cols-3 gap-2"> + the same compact Metric (panel px-3 py-2, text-h4 mt-0.5) |
| 231px | `src/app/admin/(console)/admissions/page.tsx:163` | Metric trio wrapper. Stacks full-width on mobile because the 3-up only starts at sm: | 338px → className="mt-4 grid grid-cols-3 gap-2" (3-up from 390 up; three counts are three short numbers, they do not need 366px each) |
| 208px | `src/app/admin/(console)/students/page.tsx:205` | Front-desk accordion pair. Two closed disclosures, each carrying an 86-90 char hint that renders 2 lines at 15px while closed | 358px → mt-4 gap-2; move both hints into their panel-body (page.tsx:208, 212). With the summary.panel-head row fix this becomes 16 + 63 + 8 + 63 |
| 139px | `src/app/admin/(console)/admissions/page.tsx:191` | Filter toolbar. Four stacked full-width rows before the list, all sticky-pinned at top:4rem | 292px → Add a mobile grid: "toolbar mt-4 grid-cols-2 md:grid-cols-[1fr_14rem_auto_auto]" so the two labelled fields sit side by side (one 75.6px row), and put |
| 136px | `src/app/admin/(console)/admissions/page.tsx:170` | Closed 'Add enquiry' disclosure. Its 101-char hint (admissions-copy.ts:76) renders 3 lines at 15px even when nothing is open | 215px → <details className="panel mt-4">; move {copy.addEnquiryHint} out of <summary> and into the <div className="panel-body"> at page.tsx:178 where it is re |
| 136px | `src/app/admin/(console)/students/page.tsx:283` | Detail fact grid stacks 1-up on mobile and uses a taller local Fact primitive than the .kv-grid one already in premium.css | 238px → <dl className="kv-grid"> with Fact switched to the existing .kv-label/.kv-value pair (premium.css:903-918, 2-up at 390, gap 0.625rem/1rem) — the same  |
| 129px | `src/app/premium.css:793` | .console-root .panel-head is forced to flex-direction:column below 768px, which drops the '+' affordance of every disclosure summary onto its own line | 43px → Keep the column stack for real panel headers but exempt summaries: add `.console-root summary.panel-head { flex-direction: row; align-items: center; j |
| 111px | `src/app/admin/(console)/students/page.tsx:221` | Directory search form: four stacked full-width controls above the list | 191px → Put input and submit on one row (`grid grid-cols-[1fr_auto] gap-2`) and the archived chip on the label's row: 24.4 + 8 + 48. Every control keeps >=44p |
| 90px | `src/app/admin/(console)/students/page.tsx:313` | Fees and Certificates each get a full .panel with its own .panel-head to show two numbers and a short list | 152px → One .panel, gap-4, with each group introduced by a .microlabel line instead of a panel-head; put Received/Balance in a .kv-grid alongside the certific |
| 48px | `src/app/admin/(console)/admissions/page.tsx:255` | Opened-record body gap. Five to six blocks separated by 24px | 144px → className="grid gap-4 border-t border-line bg-ivory-2/40 px-3 py-3 md:px-4" — 16px is on the plan's compact scale; py-4 -> py-3 |
| 48px | `src/app/admin/(console)/admissions/page.tsx:328` | Footer note under the list. Also a bilingual-parity breach: the string is hardcoded English and is not in admissionsCopy (same for 'Database unavailab | 48px → Delete the block; add a `listCap` key to AdmissionsCopy (admissions-copy.ts) in EN + GU and fold the cap and the visible count into PageHead's `contex |
| 36px | `src/app/admin/(console)/students/page.tsx:219` | A whole panel header whose only content is the word 'Student list' | 64px → Drop the panel-head on mobile and put the label + live count on one .microlabel line inside panel-body: `<p className="microlabel">{copy.directory} ·  |
| 32px | `src/app/globals.css:684` | .empty-state padding — an 80px+ dashed box to say one sentence; both pages render it (admissions page.tsx:222, students page.tsx:234 and 255, 303) | 80px → Add a console-scoped override next to the other .console-root rules (premium.css:773-777): `.console-root .empty-state { padding: 0.875rem 1rem; }`. L |
| 26px | `src/app/admin/(console)/admissions/page.tsx:335` | Metric tile internals: full .panel-body padding and a display-tier number for a count | 91px → <div className="panel px-3 py-2"><p className="microlabel">…</p><p className="text-h4 mt-0.5">…</p></div> — 8 + 19.5 + 2 + 26.9 + 8 + 2. text-h4 = 20. |

<sub>+6 further findings in the same scope, all recorded in the phase notes.</sub>

### Admin courses/fees/attendance — 18 findings, ~1918px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 259px | `src/app/admin/(console)/attendance/AttendanceForm.tsx:58` | Three MiniMetric cards (students / marked / present-or-late) in 'grid gap-3 sm:grid-cols-3'. sm: is 640px, so at 390px they stack: each is 1px border  | 277px → Delete MiniMetric entirely; render the three live counts as one 13px .data-row__meta-style line inside the sticky session bar: '18 students · 12 marke |
| 246px | `src/app/admin/(console)/courses/page.tsx:154` | Three Metric panels (courses / active courses / batches) that stack at 390px because the breakpoint is sm:(640px). Each = 1px border + .console-root . | 308px → One hairline-joined 3-up strip that never stacks: 'grid grid-cols-3' on a .data-list-style bordered box, cell padding 8px, label at 11px microlabel, v |
| 246px | `src/app/admin/(console)/fees/page.tsx:139` | Identical three stacked metric panels, here carrying money strings at --text-h3 (24.4px) - the same size band as the page title itself (console-head-t | 308px → Same 3-up hairline strip at 18px tabular-nums. money() at fees/page.tsx:288 already sets maximumFractionDigits:0, so the widest realistic string is ab |
| 208px | `src/app/admin/(console)/courses/CatalogForms.tsx:230` | The schedule fieldset always renders SLOT_ROWS = 6 rows (course-operations.ts:286) of two time inputs each, via slotRows() at CatalogForms.tsx:303-307 | 316px → Render filled slots plus one blank (minimum two rows) and reveal the rest with a small count-bump button - CatalogForms is already a 'use client' comp |
| 208px | `src/app/admin/(console)/courses/CatalogForms.tsx:255` | The free-demo fieldset renders the same 6 always-blank time-slot rows a second time in the same form. | 316px → Same filled+1 treatment. Note the verified EMCAD DAHAO demo is 2-day / 2-hour (CLAUDE.md non-negotiable #3) - two slot rows is the real shape, not six |
| 117px | `src/app/admin/(console)/attendance/page.tsx:104` | The session context header: a .panel-head that premium.css:793-796 forces to flex-direction:column below 768px, stacking a 12px microlabel date, an h2 | 183px → A two-line sticky bar (position:sticky; top:4rem, matching the existing .toolbar anchor at premium.css:921-934): line 1 = course name 15px semibold +  |
| 101px | `src/app/admin/(console)/attendance/page.tsx:90` | The batch/date picker rendered as a full panel with three stacked full-width Fields. Each Field is a 15px label (24.4) + .console-root .label margin-b | 269px → grid-cols-2 for batch+date at 390 with the submit full-width beneath, panel padding p-3: 77.6 + 16 + 48 + 24 + 2 = 168px. Better still, fold it into t |
| 96px | `src/app/admin/(console)/courses/CatalogForms.tsx:269` | Two curriculum textareas at min-h-32 (128px each), stacked at 390px because the grid is sm:grid-cols-2, plus their labels. The bilingual side-by-side  | 256px → min-h-20 (80px) at mobile, keeping min-h-32 from sm: upward where the parity-while-typing argument actually holds. Same for the practical fieldset's m |
| 88px | `src/app/admin/(console)/fees/page.tsx:189` | A five-Fact .kv-grid inside every opened ledger row. .kv-grid is 2 columns at 390 (premium.css:903-907) so 5 facts = 3 rows; each cell is an 11px uppe | 152px → Two Facts only - agreed course fee and discount, the two numbers the closed row cannot show. The other three stay on the row where they belong. |
| 67px | `src/app/admin/(console)/courses/page.tsx:152` | PageHead context is a static 158-character page description (courses-copy.ts:80), wrapping to 4 lines of 15px/1.5 in a 366px column. PageHead.tsx:11-1 | 90px → context={`${courses.length} courses · ${activeCourses} active · ${batches.length} batches`} - all three values already exist at courses/page.tsx:130,  |
| 60px | `src/app/admin/(console)/courses/page.tsx:311` | An opened batch renders TWO separate right-aligned action rows: a flex row for the roster + register PrintLinks (line 311-314), then a second flex row | 120px → One action row: PrintLinks left, RecordMenu right, single mb-2.5. The same doubling exists on the course level at courses/page.tsx:244. |
| 58px | `src/app/admin/(console)/attendance/AttendanceForm.tsx:102` | A per-student note <input className='input mt-3'> rendered unconditionally for every roster row, whether or not that student has ever had a note. .con | 58px → Keep the input in the DOM but wrap it in a [hidden] container toggled by a small per-row 'note' button, pre-opened when row.note is non-null. A displa |
| 45px | `src/app/admin/(console)/fees/page.tsx:138` | Same violation: a 117-character static lede (fees-copy.ts:8) at 3 lines. | 67px → context = pending money + how many students owe it, from totalDue (fees/page.tsx:134) and cards.filter(c => c.summary.balance > 0).length - both alrea |
| 40px | `src/app/admin/(console)/fees/page.tsx:177` | The opened ledger body uses gap-6 (24px) between five-to-seven children (contact/print row, kv-grid, optional alerts, history details, payment details | 120px → gap-4 (16px), inside the plan's 12-24px admin section-gap band. px-2.5 py-2.5 for the padding. |

<sub>+4 further findings in the same scope, all recorded in the phase notes.</sub>

### Admin remaining modules — 32 findings, ~4428px of mobile height recoverable

| Saving | Where | What | Now → proposed |
| ---: | --- | --- | --- |
| 466px | `src/app/admin/(console)/reports/page.tsx:135` | `<table className="w-full min-w-[52rem] text-left text-smallmeta">` inside `overflow-x-auto` (L134). 52rem = 832px inside a 366px column, so a phone s | 832px → Keep the table at md+ (it is the right shape on a laptop); below 768px render the same 60 rows as `.data-list`/`.data-row`: title = humanAction(action |
| 450px | `src/app/admin/(console)/reports/page.tsx:95` | Seven Metric panels stacked 1-col on a phone: `<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">` wrapping L96-102. Four cards are 89.5p | 806.5px → Reuse the existing `.console-metrics` ledger strip (premium.css:751-770, mobile rows padded 0.75rem/0.875rem at premium.css:1036). One row per figure, |
| 323px | `src/app/admin/(console)/team/page.tsx:149` | Each admin is a full `<article className="panel">`: head 124.6 (18 + 26.6 text-h4 name + 24 email + 16 col-gap + 22 status + 18) + body 318.5 (16 + 16 | 443px → `.data-row`: title = admin.name, meta = email · invited · last seen · N permissions, actions = StatusPill + a `.tap` opening a single <details> that h |
| 286px | `src/app/admin/(console)/certificates/page.tsx:94` | Each candidate is a full `<article className="panel">` with a bordered panel-head (18/20px pad, column-stacked on mobile) and a panel-body `grid gap-5 | 362px → `.data-list` + `.data-row` (premium.css:820-834), the primitive written for exactly this and already used correctly on the delete page (L76-89): paddi |
| 210px | `src/app/admin/(console)/certificates/page.tsx:102` | `{canManage && item.eligible && !activeCert ? <div className="border-t border-rule pt-5"><IssueCertificateForm …/></div> : null}` — a date field + gra | 254px → <details> with a `Issue certificate` summary (44px tap target), body unchanged. Nothing about the form changes; it stops being 254px of every row. SAF |
| 190px | `src/app/admin/(console)/design/page.tsx:104` | `{canManage ? <DesignStatusForm enquiryId={job.id} status={status} copy={copy} /> : null}` renders a THREE-control form (12-option select + note input | 234px → Wrap in the same <details> the file already uses twice on the next two lines (L105 Edit job details, L106 history): <details className="border-t borde |
| 186px | `src/app/admin/(console)/reports/page.tsx:115` | Five ExportLink cards: `<div className="panel-body grid gap-3 sm:grid-cols-2 lg:grid-cols-3">` with ExportLink (L179-186) = `p-4` + a 26px semibold la | 478px → p-3 (12px), single line: label left, the download affordance as a `.tap`-scale chevron right. 5 x 52 + 4 x 8 = 292px. SAFETY: the whole block stays in |
| 180px | `src/app/admin/(console)/team/page.tsx:125` | The Owner block is a whole `<section className="panel mt-10">` with a bordered panel-head (column-stacked on mobile: h2 26.6 + 16 gap + 22 status + 36 | 280px → One `.data-row` inside the same `.data-list` as the admins, or above it: title = owner.name, meta = owner.email, actions = the `status status-active`  |
| 174px | `src/app/admin/(console)/content/page.tsx:191` | View-only branch renders `<dl className="grid gap-4 sm:grid-cols-3">` with three Facts (kind / status / sortOrder) — three 47.5px stacks restating two | 174.5px → Delete the dl entirely for the view-only branch — kind and status are already in the head (L171-172) and sortOrder belongs in `.data-row__meta`. Zero  |
| 170px | `src/app/admin/(console)/certificates/page.tsx:101` | The issued-certificate sub-card: `<div className="rounded-[var(--radius-card)] border border-rule p-4">` plus a `mt-3 flex flex-wrap gap-2` action row | 295px → p-3 (12px, inside the 10-14px target); keep the two links but as `.tap` (44x44 hit area with negative margin, premium.css:939-953) in a `.data-row__ac |
| 161px | `src/app/admin/(console)/records/[entity]/[id]/delete/page.tsx:60` | The only console page that does NOT use PageHead. `<div className="console-page-head">` with `console-page-title` (L63) and `console-page-sub` (L65).  | 250.7px → <PageHead title={copy.deleteTitle} context={`${entityName} · ${report.identifier}`} /> (22px title, 15px context, 14px pad), and move copy.deleteLede  |
| 160px | `src/app/admin/(console)/certificates/page.tsx:85` | Metric trio: `<div className="mt-8 grid gap-4 sm:grid-cols-3">` with three `Metric` panels (L112) stacking 1-col on mobile. | 332px → `.console-metrics mt-5` label-left/value-right rows as in the reports proposal: 3 x 50 + 2 hairlines = 152px, plus mt-5 (20) = 172px. |
| 160px | `src/app/admin/(console)/design/page.tsx:73` | Identical Metric trio (jobsShown / needsAction / dueSoon), `mt-8 grid gap-4 sm:grid-cols-3` with Metric at L118. | 332px → Same `.console-metrics mt-5` strip = 172px. These are the two figures that make Design Desk a queue (needsAction over 5 of 12 statuses at L67, dueSoon |
| 160px | `src/app/admin/(console)/content/page.tsx:124` | Identical Metric trio (existing / published / drafts), `mt-8 grid gap-4 sm:grid-cols-3` with Metric at L212-214. | 332px → Same `.console-metrics mt-5` strip = 172px. |

<sub>+18 further findings in the same scope, all recorded in the phase notes.</sub>

### The one shape behind most of it

Nine of the ten largest public findings and every one of the nine "metric trio"
findings are the same mistake in two forms:

1. **A grid whose multi-column breakpoint is `sm:` (640px) or higher**, so at
   390px it is a single column of full-width items. `.work-grid` (620px),
   `.proof-strip` (560px), `.workflow-steps` (640px), `.review-wall` (640px),
   `.studio-grid` (900px), `.rail-track` (768px), `.fact-rail` (420px) and every
   `sm:grid-cols-3` metric row. Moving these to 360–380px is the single
   highest-yield change in the audit and touches no component logic.
2. **A media frame taking 100% of the container**, so a 4:3 photo slot is 262px
   tall and a 4:5 portrait is 437px. The aspect ratios are the zero-CLS contract
   with the 32 real photographs and **must not change**; the column width is what
   changes.

---

## 5. Admin row shapes

The plan's target row (§11) is a title-plus-status line, a meta line, a
money-or-time line and an inline action row. Six console modules render an
`<article class="panel">` per record instead, while `.data-list` / `.data-row`
— written for exactly this and already used correctly on Admissions, Students,
Courses, Fees and the delete page — sits unused.

| Module | Today | Target | Data gap |
| --- | --- | --- | --- |
| Today queues | 2 lines, 58.2px, no action | 3 lines + one `.tap`, ~72px | `courseSlug` on the follow-ups query (one column on a `LIMIT 5` select); optionally an "attendance marked" flag as a correlated subquery over the 5–6 rows already limited. **Never a phone number** |
| Admissions | 2 lines, no actions; status chip occupies the actions slot | 3 lines + call / WhatsApp / follow-up | **None.** `demoSlot` is already selected and rendered nowhere; `preferredSchedule` and `demoSlot` store keys, and the page currently prints the raw key |
| Students | 2 lines; an active student's row carries no status at all | 3 lines + status light + one action | Course, batch, enrolment status, fee balance and attendance are detail-only today. Three bounded set-based reads over the visible ids — **not** N+1 |
| Courses | 2 lines, status chip in the actions slot | 3 lines + `RecordMenu`, ~66px closed | Enrolled-student count per course: one grouped query, and it must stay one |
| Batches | Nested two `<details>` deep inside a course row | **Promote to a top-level `/admin/batches`** | Course name via one `innerJoin`, exactly as `attendance/page.tsx:36` already does |
| Fees | 2 lines, money inline in the meta | 3 lines, amounts in fixed tabular columns | **None.** `latest` is already computed at `fees/page.tsx:125` and never read — that is the last-receipt the action row wants, free |
| Attendance | A 212px bordered card per student | A row: name + admission no., then a full-width 4-up P/A/L/E control at 44px | **None.** `saveAttendanceAction` reads `status:<id>`/`note:<id>` for the whole roster, so the field names must survive any reshape |
| Certificates | 362px `<article class="panel">` | 3-line `.data-row` | **None** — and the existing `attendanceMap` must keep being read; the file carries an explicit warning against per-row attendance fetching |
| Design Desk | ~900px `<article>` with an always-expanded status form | 3-line `.data-row`, status form behind `<details>` | **None** for the row. Two unbounded selects (`serviceStatusHistory`, `serviceFiles`) are worth fixing in the same pass — the row needs only a count |
| Content Desk | 224px `<article>` whose whole body is one `<details>` | 3-line `.data-row` | **None.** The 500-row student select runs for view-only admins who never see the create form |
| Team | 443px `<article>` per admin | 3-line `.data-row`, Owner as the first row | **None**, and no query changes at all |
| Reports audit | An 832px table scrolling inside a 366px box | Table at `md:`+, `.data-list` below | **None.** Keep `limit 60` and the `audit.view` gate |
| Delete page | **Already correct** | No change | This is the reference the other five copy |

**Fetched and never rendered today**, all free for the compact rows:
`applications.demoSlot`, `EnquiryRow.createdAt`, `fees.enrollmentStatus`,
`fees.joinedOn`, `fees.agreedCourseName`, and `fees.latest`.

**Never add to a queue row:** a phone number. `Queue.tsx:71-73` states the rule
— a queue is scanned in public, at a counter — and
`tests/machine-lab-console.test.tsx:130-135` fails on the literal.

---

## 6. Proposed density tokens

All additive. **No existing token is renamed or retuned**: `globals.css` is
shared with Karma Console, and a rename silently restyles the admin.

### Steel Mist — the new light technical surface

```
--color-mist:      #e6ebee   /* Steel Mist — pale desaturated blue-grey        */
--color-mist-line: #c9d4da   /* its hairline, 12.02:1 against carbon           */
```

Derived from Steel Indigo `#172b35` by lifting lightness and dropping
saturation, kept marginally warm so it sits beside Cotton rather than reading
as a cold web-app grey. **Computed** contrast ratios (not estimated — the
figures come from the same WCAG formula `tests/hardening.test.ts` already uses):

| Text role | On Steel Mist `#e6ebee` | On Cotton `#f5f0e6` | Verdict |
| --- | ---: | ---: | --- |
| `carbon` `#111716` | **15.10** | 15.97 | AAA all sizes |
| `stone` `#605e56` | **5.41** | 5.72 | AA all sizes |
| `needle` `#29617a` | **5.67** | 5.99 | AA — safe for small links |
| `vermilion-deep` `#a93a27` | **5.26** | 5.57 | AA — small-text accent |
| `zari-deep` `#8a4e2c` | **5.45** | 5.77 | AA |
| `vermilion` `#c54832` | 4.02 | 4.25 | Large text / UI only — **the same rule as everywhere else** |
| `steel` `#172b35` | **12.20** | 12.90 | AAA |

Steel Mist therefore needs **no re-pointed override block** of the kind
`.bg-sand` requires: every secondary token already clears AA on it, and it is
in fact a slightly *better* surface than Raw Silk (`#e9decd`), where `stone`
sits at 4.89. Bright vermilion stays large-text-only, exactly as on Cotton — no
new rule to remember.

### Compact rhythm

The three section tiers currently compute to **48.5 / 40.5 / 28.2px** at 390px.
The plan's mobile band is 20–32px, so only `section-compact` is inside it. The
proposal keeps all three tiers (the page needs dynamics) and re-anchors their
phone ends, leaving the desktop ends nearly untouched — the compaction is a
*mobile* one:

```
--section-major:   clamp(2rem,   1.5rem  + 2.2vw, 5rem)     /* 32 -> 80  */
--section:         clamp(1.5rem, 1.15rem + 1.5vw, 4rem)     /* 24 -> 64  */
--section-compact: clamp(1rem,   0.8rem  + 0.9vw, 2.5rem)   /* 16 -> 40  */
```

### Compact rhythm utilities

`.u-lede`, `.u-eyebrow-gap`, `.u-actions` and `.u-section-body` are the system
that stops per-component spacing guesswork, and they stay. Their phone values
move onto the compact scale:

| Token | Now | Proposed (390px) |
| --- | ---: | ---: |
| `--space-eyebrow-to-h` | 12 | 8 |
| `--space-h-to-lede` | 16 | 12 |
| `--space-lede-to-action` | 24 | 16 |
| `--space-heading-to-content` | 24 → 40 | 16 → 32 |

### Chrome heights as tokens, not as hand-matched literals

Four places currently hardcode a bar height that belongs to something else, and
each has already drifted once:

```
--tabbar-h:        3.25rem   /* public Call/Directions bar                  */
--header-h:        3.5rem    /* public sticky header                        */
--console-head-h:  3.5rem    /* console app bar                             */
--console-bar-h:   3.5rem    /* console bottom navigation (new in Phase 6)  */
```

`.site-body`'s bottom reservation is `calc(4rem + env(safe-area-inset-bottom))`
against a 56px bar — an 8px cream strip under the footer on every page. The
console's `.toolbar` sticks at `top: 4rem` hand-matched to `min-h-16` in
`ConsoleShell.tsx:148`, and the drawer duplicates the same number twice more.
Every one of these becomes `var(--…)`, and the safe-area inset stays.

### Admin density

```
--row-pad-y:   0.625rem   /* 10px mobile row padding      */
--row-pad-x:   0.75rem    /* 12px                          */
--meta-size:   0.8125rem  /* 13px meta / money line        */
--label-size:  0.6875rem  /* 11px kv-label                 */
```

`.tap`'s `min-width/min-height: 2.75rem` with `margin: -0.5rem -0.375rem` is
**not** a token and must not become one: the negative margin is what lets a
44px hit area live inside a 64px row, and `tests/console-density.test.ts:20-26`
pins all three values together.

---

## 7. Admin navigation IA

### The decision

**Today · Admissions · Students · Batches · More** — the plan's recommended
model, which the evidence supports — rendered from a **priority-ordered
candidate list filtered by what the caller can actually reach**, filling up to
four slots plus a permanent `More`.

```
Today (always)  →  Admissions  →  Students  →  Batches  →  Fees
                →  Attendance  →  Design    →  Certificates
                →  Content     →  Reports
```

Take the first four the caller may reach; `More` holds the rest. That gives:

| Caller | Bar |
| --- | --- |
| Owner / full admin | Today · Admissions · Students · Batches · More |
| `operations` template | Today · Admissions · Students · Batches · More |
| `academy` template | Today · Students · Batches · Attendance · More |
| `designLab` template | Today · Design · Reports · More |
| fees-only admin | Today · Fees · More |
| attendance-only admin | Today · Attendance · More |

A destination the caller cannot reach is **omitted, never greyed** — a dead tab
in a bar of five is 20% of the product's navigation. And an operator whose one
daily module is not in the default four gets it promoted into a free slot,
which is what stops the fees-only and attendance-only admins from having the
empty Today screen this audit measured.

### The evidence behind each slot

| Slot | Permission | Why |
| --- | --- | --- |
| **Today** | none (`requireAdmin` only) | The one ungated destination and the console's landing route |
| **Admissions** | `applications.view\|manage` | **Two** of the four Today queues, five of the nine `/admin` hrefs on Today, and the only module with a due-*today* count |
| **Students** | `students.view\|manage` | Granted by 4 of 5 templates; the record-of-record; both walk-in intake paths; three of the nine A4 sheets |
| **Batches** | `batches.view\|manage` | `batches.view` also granted by 4 of 5 templates; one Today queue; already deep-linked as an addressable record; two A4 sheets |
| **More** | — | Courses, Fees, Attendance, Design, Certificates, Content, Reports, Team *(Owner-only)*, Account & security, Sign out |

**Fees and Attendance are the two the plan explicitly asks to expose
contextually rather than as tabs**, and the audit found the links simply do not
exist yet:

- **Attendance from Batches and Today** is a pure `href` addition. `attendance/page.tsx:13,46-50` already accepts `?batch=` and `?date=`, and the Today batches queue already selects the batch `id`. No new query.
- **Fees from Students and Today** is the gap to close deliberately: there is currently **no link from Students to Fees anywhere**. Demoting Fees out of the top-level nav without adding that link would make it harder to reach, not easier.

### `/admin/batches` has to exist

The plan names Batches as a bottom-nav destination and **there is no such
route**. Batches live as nested `<details id="batch-N">` *inside* a course row
on `/admin/courses`, which is why Today deep-links `/admin/courses#batch-N`.
Five independent signals say the batch, not the course, is the daily object:
it owns a Today queue, it is already addressed as a record, `batches.*` is
already a distinct permission key grouped under *teaching*, two A4 sheets hang
off a batch, and the owner had the Courses page's import entry point removed on
2026-08-30 on the grounds that "the catalogue is settled."

So Phase 6 creates `/admin/batches` — gated on `batches.view || batches.manage`,
the same key the layout already computes — and moves the batch list out of the
course row. `/admin/courses` keeps the catalogue. Today's queue re-points to
`/admin/batches#batch-N`, which keeps
`tests/machine-lab-console.test.tsx`'s href-resolves-to-a-real-route assertion
green.

### Two things the bar must not do

- **Never gate on a permission key for Team.** Team administration deliberately
  has *no* key (`permissions.ts:9-12`); it is gated on `session.role === "owner"`.
  It also must not be a tab: a bar that differs between the Owner and every
  Admin teaches the wrong muscle memory.
- **Never compute its own permissions.** `(console)/layout.tsx:13-28` already
  derives every `canUse*` boolean with zero extra queries. The bar renders from
  those. Hidden navigation has never been the security boundary — every page and
  every server action re-checks.

### Two dead permission keys, recorded not removed

`dashboard.view` and `settings.view` exist in `PERMISSIONS`, carry EN and GU
labels, and are granted by every template — and are **checked nowhere** outside
tests. `settings.view` has no route at all. They are not removable: deleting
them breaks the permission editor and the message catalogues, and adding a real
gate would silently lock out admins whose grants omit them. Recorded here so the
next session does not rediscover it.

---

## 8. What the existing tests say about all this

The suite is deliberately brittle — many assertions `readFileSync` the source
and check its text — and that is working as intended here: it caught the
redesign before the redesign started.

**Assertions that must be re-pointed at the new, stricter policy** (never
loosened — each of these becomes a *tighter* rule, not a weaker one):

| Assertion | Today | Becomes |
| --- | --- | --- |
| `machine-lab-shell:224` | hero **must contain** `on-carbon` | hero must **not**; the one dark-surface implementation rule survives |
| `machine-lab-studio:136` | StudioRail **must contain** `on-carbon band-machine` | must not — and line 135's "zero on the services page" stays verbatim |
| `machine-lab-final:52,56` | `homeSections.length <= 4`, `inline <= 2` | `toBe(0)`. **This one is the dangerous case: it would go silently vacuous, not fail** |
| `machine-lab-homepage:88-92` | no two dark bands adjacent | no home section is dark at all — which strictly implies it |
| `machine-lab-shell:214` | `.band-machine {` must exist | keep the four-band vocabulary; re-specify `.band-machine` as the Steel Mist light technical surface |
| `machine-lab-homepage:38` | the exact homepage section order | the new order — the rule ("the order is a decision, not an accident") is untouched |
| `machine-lab-shell:231` | `TrustRail` renders after the hero | the surviving rule is "the section after the hero uses a different surface", which stays true light-on-light |
| `console-density:45` | `.toolbar` sticks at literal `top: 4rem` | assert the token is declared once and referenced by all four consumers |
| `console-density:32`, `mobile-conversion:72`, `hardening` | literal bottom reservations | the reservation reads the same token as the bar it reserves for, and still adds `env(safe-area-inset-bottom)` — **stricter**: today's literal cannot catch a bar with no inset at all |
| `machine-lab-system:322` | `.machine-light` glow alphas | re-tune for a light ground; **keep lines 325-327 verbatim** — the purple/violet/magenta ban gets *more* load-bearing on a pale ground |

**Assertions that are still right and the redesign must obey** — recorded so no
one mistakes them for obstacles:

- `machine-lab-console:84` — Today shows queues, **not** `<Metric>` cards. The plan's "useful metrics" is satisfied by the count already heading each queue, not by adding card boxes.
- `machine-lab-homepage:145` — every Machine Index row renders its media at the same width, photographed or not. This is what stops the three signature-led courses reading as second-class and stops the layout jumping when the eight photographs land.
- `machine-lab-admission:155` — the demo times are preferences, never bookable. Re-point the *mechanism* from a substring ban to the real affordances (`<input`, `<select`, `type="date"`, `<form`), keep the policy.
- `machine-lab-admission:131` — the consent step does not animate. Re-point from a hardcoded step index to the step's identity.
- `machine-lab-final:128` — reduced motion covers every listed class. A one-for-one rename is the only legitimate edit; an entry disappearing is exactly the regression it exists to catch.
- `machine-lab-operations:39` — the console title floor of 22px, which happens to encode the new plan's number exactly.
- `mobile-conversion:80` — the analytics `ALLOWED` array. A new dense surface is described with the existing `surface` key; no key is added.
- `console-density:20-26` — `.tap`'s 44px box **and** its negative margin. The single most important assertion for the whole compaction.
- All four no-new-dependency bans, the 32-slot photo manifest, the no-invented-specification sweep, and the `:lang(gu)` neutraliser sweeps.

**New policy tests the later phases will add**, each with its false-positive
guard stated (the repository has been bitten four times by a blunt substring ban
firing on the code's own honest disclaimer):

1. **No public surface is dark** — replaces the at-most-four cap, on a class-token match after `stripComments`, with a non-vacuity floor.
2. **Public mobile type ceilings at 390px** — an allow-list of selectors, parsed clamps evaluated numerically, so a legitimate re-expression still passes.
3. **Public section rhythm computes to the compact scale on a phone** — the three tiers only, never a whole-file `padding-block` sweep, which would drag in the A4 print sheets.
4. **Public vertical spacing stays on the compact scale** — unprefixed utilities only, inside `className` literals only.
5. **Chrome height and its reservation come from one token** — asserted on sliced rule bodies, not whole-file substrings.
6. **Every uppercase or letterspaced class has a Gujarati neutraliser** — the *reverse* sweep, which the existing one structurally cannot do. The highest-value new test, because the compact pass multiplies exactly the class of primitive this rule governs.
7. **Steel Mist clears AA for every text role on it** — reading the hex out of its token declaration, never hardcoded, so a retune cannot leave the test measuring a stale colour.
8. **Every console page uses the compact `PageHead`** — closing the `records/…/delete` gap.
9. **Today is productive in its first viewport** — asserted on source order, never on copy.
10. **Progressive disclosure adds no dependency** — exact key equality against `package.json`, adding `vaul`, `@radix-ui/*`, `@headlessui/react`, `cmdk`, `react-window` and friends to the manifest-level bans.
11. **The dense console keeps its 44px targets and its safe areas** — parsing blocks that are *both* `position: fixed` and bottom-anchored, which the current whole-file `toContain("env(safe-area-inset-bottom)")` cannot do.

The measurement helpers those tests need land with this phase, in
`tests/helpers/measure.ts`, with their own suite.

---

## 9. Phase order, revised by what was measured

The plan's ten phases stand. What the audit changes is the *emphasis* inside
them:

| Phase | The finding that should drive it |
| --- | --- |
| 2 — Light-first system | Steel Mist needs no override block. `.on-carbon` stays defined; only its call sites retire. The section tiers and rhythm utilities are the single largest systemic saving. |
| 3 — Shell + homepage | The **footer** is the biggest win on the public site (1,031px, on every page) and the two z-index bugs live here. `/gu` must be measured, not `/en`. |
| 4 — Inner pages | `PageIntro` is the cost centre. The `sm:`-breakpoint grids are the highest-yield mechanical change. The EMCAD course page states its duration twice and its software three times. |
| 5 — Admission | 719px of chrome before the first choice; the 11 course chips are 659px in one column; step 3's Next is ~1,630px down. Every listed defence stays. |
| 6 — Admin shell | The 795px drawer. `/admin/batches` has to exist. The `.rec-menu` sheet is `position: fixed; inset: auto 0 0` and would render *under* a new bottom bar. |
| 7 — Core admin | Six modules stop using `<article class="panel">`. The `sm:grid-cols-3` metric trio is nine screens' worth of one fix. |
| 8 — Remaining admin | Reports' seven stacked metrics are taller than the viewport. Two unbounded selects in Design Desk are worth fixing while the row is rebuilt. |
| 9 — Hardening | Gujarati is 6–11% taller everywhere and is the first-class locale; measure it first. |
| 10 — Final pass | The two pages that already pass are the two that decline `PageIntro` — that is the finding to generalise. |
