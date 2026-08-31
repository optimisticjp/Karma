# Design system: THREAD / MACHINE / PROOF (public) · "Machine Lab" (Console)

> **Read this first.** There are **two** systems, and which one applies depends
> on which side of the product you are on.
>
> - **The public site** runs **THREAD / MACHINE / PROOF**, defined in
>   `src/app/thread-machine-proof.css` and described in the section below.
>   Live reference: **`/design`** — a rendered page of every primitive, not
>   indexed and not linked from the site.
> - **Karma Console** runs the "Machine Lab" system the rest of this document
>   describes, unchanged. It was tuned across PRs #43–#53 and is explicitly
>   **out of scope** for the public rebuild.
>
> The two do not share a root layout — `src/app/[locale]/layout.tsx` and
> `src/app/admin/layout.tsx` are independent roots — so the public sheet is
> imported by the public one only. Every rule in it is additionally scoped to
> `.kds`, so even a stray import could not restyle a staff screen.
>
> **Superseded:** "Modern Textile Lab" (`src/app/textile-lab.css`, PR #57) was
> rejected by the owner as a reskin and the file is deleted. It re-pointed the
> v3 `--color-*` tokens to warmer values inside `.site-body` and added a
> handful of classes, of which almost none were ever used by a component. That
> is the distinction worth carrying forward: **re-pointing a colour token is
> not a redesign.**

---

## THREAD / MACHINE / PROOF — the public system

Authoritative plan: `docs/karma-modern-textile-lab-redesign-plan.md`, with
`docs/karma-creative-freedom-trust-proof-addendum.md` taking precedence on
visual creativity, trust modules, sample placeholders and photography.

> **FROM SCREEN TO STITCH.**
> Design on screen. Prove it on the machine.

### The one idea

A thread leaves a screen, passes through a machine, and becomes proof on
fabric. That is why the system has **two material registers** rather than one
palette:

- a **WARM CLOTH** register — work, samples, studio, people;
- a **COOL MACHINE** register — EMCAD, files, digitising, process, diagnostics.

The previous public palette was warm everywhere, which is how a site about
digital design files reads as a craft blog. Anything to do with the screen now
sits on the cool ground, and the visitor learns the distinction without being
told it.

### The brand accent adapter — four variables, logo-neutral

The owner may supply a logo in any colour. Exactly four variables carry every
chromatic decision in the interface, and **nothing else in the stylesheet
hardcodes a hue** — a test enumerates every hex in the file and fails on a
stray one.

| Token | Default | Role | Measured |
| --- | --- | --- | --- |
| `--brand-accent` | `#D4462E` | thread, marks, fills, large type | 3.57–4.45 across the five grounds — **fills and large text only** |
| `--brand-accent-strong` | `#B8321C` | actions, accent body text, focus | 4.80–5.98 across all five · white on it **5.98** |
| `--brand-accent-soft` | `#FBEAE6` | selected state, wash | ink 15.43 · muted ink 5.38 |
| `--brand-on-accent` | `#FFFFFF` | text on an accent fill | 5.98 on strong |

**Why two reds.** A primary button label is normal-size text by WCAG, so 4.5:1
is the floor and the bright thread red does not clear it. The split is also
true to the subject: the brighter red is the **thread**, the deeper red is the
**decision**.

**To re-brand:** change those four. Verified alternates, recomputed by
`tests/kds-foundation.test.ts` on every run — blue `#1F5FA8` (6.08 on canvas,
6.44 with white), green `#1F6B43` (6.11 / 6.48), gold `#8A6A12` (4.77 / 5.06),
black `#14171A` (16.97 / 17.99).

### Surfaces and ink, measured

| Token | Hex | Register | Role |
| --- | --- | --- | --- |
| `--s-paper` | `#FFFFFF` | — | forms, sheets, media mats |
| `--s-canvas` | `#FAF8F5` | warm | the main ground |
| `--s-cloth` | `#F0EBE3` | warm | work, samples, people |
| `--s-mist` | `#EEF1F3` | **cool** | EMCAD, files, process |
| `--s-mist-deep` | `#E2E7EA` | **cool** | an inset machine panel |
| `--ink` | `#14171A` | — | headings, body, linework — **14.44–17.99** on all five |
| `--ink-muted` | `#5A6169` | — | secondary copy — **5.03–6.27** on all five |

**One muted ink, no per-surface variant.** It clears the 4.5 body floor on the
deepest ground, which is precisely so there is nothing for a caller to
remember. The previous system needed a "deep step" on its sand surface; this
one does not.

**Status stays independent of brand** (`--ok` `#1C6B45`, `--warn` `#8A5A08`,
`--bad` `#B3261E`, all ≥4.99:1 everywhere). "This batch is full" must not
change colour because a logo arrived. Status is never the only signal — it
always carries an icon or a word.

**No full-width dark surface anywhere**, including `/services`. Absolute for
this redesign.

### Type — clamps computed, not chosen

Every value interpolates between the plan's mobile target at 390px and its
desktop target at 1440px, so these are the plan's numbers rather than numbers
that resemble them. A test asserts the targets AND that no level ever crosses
the one below it at any of ten widths.

| Token | 390px | 1440px | plan asks |
| --- | --- | --- | --- |
| `--t-display` | 44 | 88 | — |
| `--t-h1-hero` | **36** | **62** | 34–40 / 54–68 |
| `--t-h1` | **31** | **50** | 28–34 / 44–56 |
| `--t-h2` | **25** | **37** | 23–28 / 32–42 |
| `--t-h3` | **19.5** | **25** | 18–21 / 22–27 |
| `--t-h4` | 17 | 20 | — |
| `--t-lede` | 17 | 21 | — |
| `--t-body` | **16** | **17** | 15.5–17 |
| `--t-meta` | **13.5** | **14.5** | 12–14 |
| `--t-micro` | 12 | 12.5 | technical labels only |
| `--t-btn` | **15** | **15.5** | 14–15 |

Large Latin type tightens (`--track-display: -0.03em`); small type does not.
**Gujarati never does** — `:lang(gu)` zeroes the tracking tokens, removes
uppercase from every label class and raises the line height to 1.75, so the
protection is in the system rather than at each call site.

### Rhythm, containers, radius

`--sp-hero` 56→112 · `--sp-section` 40→80 · `--sp-tight` 28→52. Not every
section gets the same gap.

`.wrap` 1220px · `.wrap-wide` 1440px · `.prose` 68ch · `.bleed` breaks the
gutter deliberately. Gutter 20 → 32 → 48.

**A photograph is a physical print, so media frames are square**
(`--r-media: 0`). Interactive surfaces get 6px (`--r-ui`) — squarer than a
pill, so controls read as machine controls rather than app chrome. Cards, where
one is genuinely needed, get 10px. Structure comes from hairlines; there is
exactly **one** shadow token and it is for things that genuinely float.

### The niche grammar

| Primitive | Where | What it is |
| --- | --- | --- |
| **Thread Line** | `.thread` / `.thread-v`, `<ThreadLine>` | a running stitch, 9 on / 6 off — the one repeated mark, and the same geometry as the progress bar and the link underline |
| **Needle Point** | `.needle`, `<NeedlePoint>` | the penetration mark: done / current / to come |
| **Hoop Window** | `.hoop`, `<HoopWindow>` | a round crop with the frame's two rings. Once per page at most |
| **Machine Frame** | `.mframe`, `<MachineFrame>` | square media frame, hairline, two registration ticks at one corner |
| **Stitch Swatch** | `<StitchSwatch>` | eleven techniques as **filled fabric samples**, edge to edge, with a pinked bottom edge |
| **Sample Strip** | `.strip` | the scroll-snap rail those swatches live on — a sample book, not a carousel library |
| **Work Tile** | `.tile` | image-first, caption secondary, own aspect ratio |
| **Batch Board** | `.board` | the schedule as a production board; every field optional |
| **Thread Progress** | `.progress`, `<ThreadProgress>` | form steps: stitched, needle, construction line |

**Stitch Swatches are not the old technique signatures.** The geometry is
inherited — beads attach to a path, sequins overlap and are perforated, chain
is interlocking loops, cording is couched at intervals, EMCAD is nodes and
handles — because that is domain knowledge and it was correct. What changed is
that it is filled rather than stroked, tiled rather than centred, and sized to
be flicked through rather than studied. EMCAD is the one swatch on the cool
register, because it is the one technique that happens on a screen.

### Proof modules — five shapes, deliberately

`FeaturedReview` · `ReviewRail` · `RatingBlock` · `StoryJourney` ·
`TrustedByRail` · `SocialProof` · `MicroProof`. **There is no shared
`ProofCard`.** A large editorial quote, a swipeable snippet, a garment label
and a follower figure have nothing in common except the word "proof", and
giving them one class is how a site ends up with the same card six times.

All of them read `src/content/proof.ts`, which carries a
`sample | owner_provided | verified` status on every item. Every module renders
its own `<SampleMark>` — a disclosure a caller can forget is a disclosure that
will be forgotten. Nothing unverified can reach structured data;
`tests/kds-proof-firewall.test.ts` asserts the schema builders cannot even
import the registry.

### Light effects, allowed and scoped

`.glass` for a caption ON a photograph (blur is progressive; the fallback is an
opaque mat). `.glow-screen` for the light coming off a monitor — a cool bloom
behind EMCAD and process content, named for its job so it cannot become a
generic gradient. `.bento` for genuinely heterogeneous content only.

### Motion — four grammars, one job each

`thread-draw` (Level 3, once per page), `needle-in`, `media-in`, `rise-in`.
Nothing loops, nothing follows the cursor, nothing hijacks the scroll.
**Reduced motion renders the COMPLETE final state**, not a shorter animation —
a thread that has not drawn is an invisible rule, so it is given its full size
back explicitly.

### The shell

`SiteHeader` · `SiteFooter` · `LocaleSwitch` · `BrandMark` · `ActionDock`, in
`src/components/kds/shell/`.

**The header** is 56px on a phone and 64px from `lg`, carrying brand · language
· menu on a phone and brand · six links · language · Book Free Demo on a
laptop. The active link is marked with a running stitch rather than an
underline, because the site already has one repeated mark.

**The logo slot** is a reserved HEIGHT, not a box: `src/lib/brand.ts` is the
single place a future asset is configured, the width follows the asset's own
ratio so a horizontal lockup and a square mark both fit, the container stays
neutral, and nothing recolours the asset. Until one arrives the fallback is a
designed wordmark carrying the site's own needle mark.

**The language switch** is a segmented `EN | ગુ` pair of LINKS — each option is
the same page in the other language, so it works with no JavaScript, opens in
a new tab on a middle click and is announced as a link. It replaced a
three-locale focus-trapping bottom sheet, which is a dialog too many for a
choice between two visible things.

**The mobile menu is a sibling of the header, not a child** — and that is
load-bearing. `.site-head` carries a `backdrop-filter`, and a filtered element
becomes the containing block for its `position: fixed` descendants: nested
inside, the scrim's `inset: 0` resolved against the 56px header, so it measured
390×56 and the contextual dock stayed tappable under an open modal dialog.

**No floating chrome.** No site-wide bottom bar, no floating action button, no
language interstitial. Conversion is contextual — see §Mobile conversion in
`docs/project-context.md` §6.

### Grounds, and the adjacency rule

A section declares exactly ONE ground — `.on-paper`, `.on-canvas`, `.on-cloth`
or `.on-mist` — and **two adjacent sections never share one**. That is what
stops a long scroll reading as a single slab, and on the homepage it is
asserted rather than trusted.

`.on-mist` is not "the grey one": it is the **cool register**, and it carries
the cool hairline with it. It belongs to the screen, the file and the process.
A fee panel is paperwork and sits on cloth, however technical the numbers look.

### A span-rendered primitive MUST declare a display

`.thread`, `.thread-v`, `.needle` and `.hoop` all render on a `<span>`. An
inline box silently ignores `width`, `height`, `aspect-ratio` and `overflow`,
so the failure is invisible: the vertical thread rendered as nothing, and the
hoop rendered as a rounded rectangle the size of whatever it wrapped. Neither
was catchable by typecheck, lint or a source-reading test — only by measuring
the rendered box. `tests/kds-foundation.test.ts` asserts it for the family.

### The homepage composition

Ten blocks in `src/components/kds/home/`, each with its own layout class and no
shared card between them:

| Block | Classes | Shape |
| --- | --- | --- |
| `HomeHero` | `.band-hero`, `.split`, `.hero-facts`, `.hero-swatches`, `.hero-scene` | editorial split, photo scene on one thread |
| `EntryPaths` | `.paths`, `.path-row` | stitched index of three |
| `SampleBook` | `.strip`, family tabs | horizontal sample rail |
| `ScreenMachineProof` | `.smp-tabs`, `.smp-panel`, `.smp-figure` | five-state tablist, one motif |
| `EmcadPanel` | `.emcad`, `.emcad-fee`, `.emcad-schedule` | a document sheet |
| `ProofWall` | `.wall-lead`, `.wall-masonry` | wide lead + masonry |
| `HomeVoices` | the proof modules | four different formats |
| `TrustSignals` | `.trust-stats` + `TrustedByRail` | typographic counters |
| `BatchesVisit` | `.when`, `.board` | schedule board + address |
| `HomeClose` | `.close-grid`, `.close-band` | accordion + close |

**`.wall-masonry` rather than `.bento` for the work wall.** The six work
photographs are at three ratios on purpose, and a fixed-cell grid either crops
them or leaves holes the size of the tiles. CSS columns (two on a phone, three
from 48rem, `break-inside: avoid`) pack mixed ratios with no cropping and no
JavaScript. `.bento` remains the right tool where the children can be told what
size to be; it is the wrong one where each child brings its own aspect ratio.

### The catalogue and the course template

`/courses` is five blocks and a course page is nine, all in
`src/components/kds/courses/`:

| Piece | Classes | Note |
| --- | --- | --- |
| `CoursesIntro` | `.courses-split`, `.courses-aside`, `.courses-facts`, `.courses-swatches` | the 8 / 2 / 1 split, read from the catalogue |
| `CourseCatalogue` | `.cat-grid`, `.cat-item`, `.cat-media`, `.cat-cue`, `.cat-meta` | two columns on a phone, three from 48rem |
| `FamilyMap` | `.fam-grid`, `.fam-list`, `.fam-notes` | every course named again as a link |
| `CoursePathway` | `.pathway`, `.pathway-mark`, `.pathway-thread` | four stages on one seam |
| `CourseHero` | `.course-media`, `.course-swatch`, `.hero-facts` | produces line as the lede |
| `CourseNav` | `.course-nav` | sticky anchors, `lg` and up only |
| `CourseMake` | `.make-list`, `.make-foot`, `.make-skills` | outputs as objects, not adjectives |
| `CourseFaults` | `.faults`, `.fault-row` | on the cool register — diagnostic work |
| `CourseFloor` | `.floor-plate`, `.floor-swatch` | the machine described, never specified |
| `CourseFacts` | `.fee-sheet` or the honest panel | the money, second on the page |
| `CourseSyllabus` | `.syllabus`, `.module`, `.module-points` | native `<details>`, nothing open |
| `CourseBatches` | `.board`, `.course-notes` | real rows or an honest empty state |

**`.cat-media` puts the swatch in the photograph's 4:3 box.** The eight
photographed courses and the three that are not occupy exactly the same space,
so nothing moves when the files land and no course reads as a leftover.

**`.fee-sheet` (was `.emcad-fee`) is shared.** The homepage decision panel and
the one course page with a confirmed plan render the same `<FeeSheet>`, so the
two can never state the same fee differently. There is no pay button in it and
there never will be.

**`.course-nav` is `display: none` below 64rem.** A second sticky bar on a
phone competes with the header and the action dock for the same thumb. Every
anchored section carries `scroll-margin-top: calc(var(--header-h) + 3.5rem)`.

**A family filter is a group of toggle buttons, not a tablist.** Tab semantics
promise a tabpanel the control owns and moves focus into; a filter narrows a
list already on the page. `role="group"` + `aria-pressed`.

### Forms, and why they keep their old class names

The public forms keep the classes they already had — `.label`, `.input`,
`.choice-chip`, `.field-error` — and **this sheet restyles them inside
`.kds`**. That is deliberate. The admission form is 900 lines of markup
carrying a honeypot, a minimum-fill window, an idempotency key, consent
handling and the norms version; re-typing all of it to change a colour is how a
defence gets dropped by accident. Every rule is scoped, so the Console's
identical class names are untouched.

`.form-shell` is the card, `.form-column` holds the reading measure, and both
`.input` and `.choice-chip` carry a 44px floor in either language.
`<ThreadProgress>` is the step control: a named `<nav>` whose current step
carries `aria-current="step"`, with the inactive LABELS hidden below 30rem
because four step names do not fit on a phone.

### Where it lives

- `src/app/thread-machine-proof.css` — the system
- `src/components/kds/` — `StitchSwatch`, `marks` (thread/needle/hoop/progress),
  `Frame` (machine frame + photo placeholder), `proof` (the seven modules)
- `src/components/kds/shell/` — header, footer, locale switch, brand, dock
- `src/components/kds/home/` — the ten homepage blocks and the five-state motif
- `src/components/kds/courses/` — the catalogue's five blocks and the course
  template's nine
- `src/components/kds/batches/` · `src/components/kds/admissions/` — the
  conversion routes
- `src/components/kds/FeeSheet.tsx` · `CtaBand.tsx` — the two shared blocks
- `src/lib/brand.ts` — the logo slot contract
- `src/content/proof.ts` — the proof registry
- `/design` — the rendered reference, on the new system alone

---

# Design system v3: "Screen to Stitch / The Machine Floor"

This supersedes the visual sections (§4-§7) of karma-master-plan-final.md and
replaces v2 "The Digital Thread". The v2 *principles* survive intact —
restraint, one accent, borders over shadows, photography carries the colour.
What changed is the voice.

**Why v3 exists.** v2 was an editorial serif system. Karma is a commercial
embroidery business: production machines, digitising software, delivery
deadlines. The reference set a prospective student or a B2B buyer already
knows — Wilcom, Ricoma, Melco, and the machine dealers on the Surat market —
is uniformly sans-serif, numerically specific, and shows machines mid-run
rather than lifestyle. A warm serif read as craft blog. The system now reads
as machine floor: heavy tight sans, tabular numerals, hairlines, one
vermilion thread.

The permanent spine, and the sentence every visual decision has to serve:

> **FROM SCREEN TO STITCH.**
> Design on screen. Prove it on the machine.

## Palette
| Token | Hex | Name | Use |
| --- | --- | --- | --- |
| `ivory` | #F5F0E6 | Cotton | Page background |
| `ivory-2` | #E9DECD | Raw Silk | Alternating section bands |
| `sand` | #DED0B8 | — | Deeper warm surface, punctuation |
| `card` | #FFFDF8 | Worktable | Reading surfaces |
| `line` | #D5CAB6 | — | Thread-grey borders, dividers |
| `carbon` | #111716 | Machine Black | Primary text, dark bands |
| `steel` | #172B35 | Steel Indigo | Secondary dark, `.surface-machine` |
| `stone` | #605E56 | — | Secondary text |
| `needle` | #29617A | Needle Blue | Technical/link cue |
| `needle-light` | #7FB3C9 | — | The same cue on dark |
| `zari` | #AA6239 | Zari Copper | Material detail, large text only |
| `zari-deep` | #8A4E2C | — | When copper must be small text |
| `vermilion` | #C54832 | — | THE accent: fills, stitch lines, large text |
| `vermilion-deep` | #A93A27 | — | Small-text links, hovers |
| `success` / `warn` / `error` | #2F7D46 / #B7791F / #B3261E | — | System status ONLY |

Every ratio below was measured against this palette, not estimated:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| carbon on ivory | 15.97:1 | AAA, all sizes |
| stone on ivory | 5.72:1 | AA, all sizes |
| needle on ivory | 5.99:1 | AA — safe for small links |
| vermilion-deep on ivory | 5.77:1 | AA — small-text accent |
| vermilion on ivory | 4.40:1 | Large text / UI only |
| zari on ivory | 4.09:1 | **Large or editorial only, never body** |
| zari-deep on ivory | 5.77:1 | AA — use when copper must be text |
| needle-light on carbon | 7.94:1 | AA, all sizes |

**The rule that shaped this:** bright vermilion fails on small text. Any link
or label below ~24px uses `vermilion-deep`, `needle` or `zari-deep`. Do not
"fix" a contrast problem by making the accent brighter.

Vermilion stays the single interface accent. Needle blue and zari copper are
*material* colours — technical cue and thread detail — not second and third
accents; they never compete for an action. Green/amber/red are statuses only.

## Typography
| Role | Family | Weights |
| --- | --- | --- |
| Display + UI, Latin | **Manrope Variable** | 700 / 800 headings, 400–700 body |
| Display + UI, Gujarati | **Noto Sans Gujarati Variable** | 500–700 |
| Editorial accent | **Playfair Display Variable, italic axis only** | 500, sparing |

Self-hosted from npm (`@fontsource-variable`). Fraunces and Noto Serif
Gujarati are gone with v2; Playfair loads `wght-italic.css` alone, so the net
font payload is *smaller* than v2 despite gaining an accent face.

Playfair appears in exactly one place: `.pull-quote` / `<PullQuote>`. It has
no Gujarati coverage, so `:lang(gu)` falls back to Noto Sans Gujarati and
drops the italic — Gujarati does not use italic typographically.

Headings are heavy and tight because that is what reads as industrial:
h1/h2 weight 800, h3/h4 weight 700, tracking from -0.035em at display-xl to
-0.02em at h3. **Gujarati is never uppercased, never letterspaced**; Gujarati
headings run weight 700 at line-height 1.45, body at 1.8, and buttons are
slightly taller to fit the vowel marks.

Type scale tokens (fluid clamps to these desktop targets): display-xl 76,
display 64, h1 56, h2 46, h3 32, h4 24, lead 20, bodylg 18, body 16/26,
smallmeta 15, eyebrow 12, btn 15. **No sizes outside the scale.**

Numbers are the trade's language, so `table`, `.tabular`, `time` and
`.numeral` all run tabular figures — a column of durations or seat counts
must not jitter row to row.

## Layout & rhythm
Content 1280px (`container-site`), wide media 1440px (`container-wide`),
64px outer margins ≥1280px. Section classes: `section-major` 144/104/80,
`section` 112/88/64, `section-compact` 80/64/48. Prefer asymmetry: 7/5
splits, one large feature + two supporting, alternating compositions. Avoid
three identical cards in a row.

## Surfaces & imagery
Borders over shadows. Cards: card surface, thread border, 14px radius,
32-40px padding desktop; hover = vermilion border + image scale 1.03 +
arrow shifts 4px (200ms). Editorial images are square-cornered
(`rounded-none` on the PhotoSlot); only cards keep radius. PhotoSlot is the
honest placeholder: grid texture + camera icon + shoot-list label. Never
stock imagery.

## Motifs & icons
The vermilion stitch line (dashed) is the signature: dividers, link
underlines, the hero's connecting thread, form progress. `bg-grid` adds a
faint embroidery grid to hero/process sections only. Icons: the custom
line set in `components/ui/Icon.tsx` (needle, spool, hoop, nodes, machine,
scissors…), stroke 1.5 everywhere. No graduation caps, rockets, trophies.

## Motion
Purposeful and short: reveals fade up ≤12px in 300ms (once); the thread
draws in 450ms; card/button transitions 200ms; the verification seal
scales in 320ms. `prefers-reduced-motion` renders final states instantly.
Banned: parallax, scroll hijacking, confetti, cursor followers, loops.

## Where it lives
Tokens and base/component primitives: `src/app/globals.css` (@theme +
@layer base + @layer components). Product-layer primitives:
`src/app/premium.css`. Change tokens only with a comment explaining why, and
update this file.

`globals.css` is shared with Karma Console. Token **names** therefore stay
stable across versions — v3 retuned values and added tokens, it renamed
nothing — because a rename would silently restyle the admin.

---

## Vertical rhythm (added in the polish pass)

**The single habit that makes good content look amateur: choosing the gap
between a heading and its supporting text by eye, per component.** Before
this pass the same relationship used `mt-1`, `mt-2`, `mt-3`, `mt-4`, `mt-5`,
`mt-6` and `mt-10` in different files. No single value was wrong; the
inconsistency was. A reader cannot name it, but they feel the page was
assembled rather than designed.

Spacing between related text is now a system value, never a judgment call:

| Relationship | Token | Value | Class |
| --- | --- | --- | --- |
| Eyebrow → heading | `--space-eyebrow-to-h` | 16px | `.u-eyebrow-gap` |
| Heading → supporting paragraph | `--space-h-to-lede` | 20px | `.u-lede` |
| Paragraph → action row | `--space-lede-to-action` | 32px | `.u-actions` |
| Section heading block → its content | `--space-heading-to-content` | 48px / 64px lg | `.u-section-body` |

`.u-lede` also caps the measure at 60ch. Lead paragraphs read worse at the
68ch used for body copy.

**Do not** write `mt-3`/`mt-5`/`mt-6` for these relationships again. If a new
relationship needs a gap, add a token here first.

## Section rhythm: use all three tiers

`section-major` (144/104/80), `section` (112/88/64) and `section-compact`
(80/64/48) exist so the page has dynamics. Before this pass `section-major`
appeared **zero** times and half the homepage sat at `section-compact`: the
tightest setting, played on repeat. That is the whole reason the page felt
cramped despite correct tokens.

Current allocation on the homepage:
- `section-major`: Hero, ScreenToStitch, VisitStudio, CtaBand (the four moments)
- `section`: the working sections
- `section-compact`: minor/tail blocks only (LatestVideos)

Roughly one major moment per three standard sections. More than that and
nothing feels major.

## Card and grid metrics
- Card padding: `p-6 md:p-8` (24px mobile → 32px desktop). Never `p-4`/`p-5`.
- Grid gaps: `gap-6 lg:gap-8` (24px → 32px).
- Borders over shadows, always.

## Interactions (three, all reduced-motion safe)
1. **`.rule-stitch`** — the brand thread draws under every section heading on
   scroll. Lives in `SectionHeading`, reuses the shared observer. ~22 per page.
2. **`.card-title`** — dashed vermilion underline grows across a card title on
   hover. Pure CSS, no JS.
3. **`.media-unveil`** — photography wipes in via `clip-path` instead of
   popping. Registered by `<UnveilWatcher />` (mounted once in the locale
   layout), which observes elements directly, re-scans on DOM changes, and
   force-reveals after 1.2s. **A failed animation must never cost a photo:**
   never rely on an ancestor to trigger this class.

---

# The Machine Floor Ledger (2026 product pass)

The system above stands. This pass answers one problem it could not: **the
studio has no photography yet**, and the site was leading with empty photo
frames — three in the hero, one per course on the courses index, one per
trainer card, one per story. Rival institutes in Surat fill that gap with stock images of
smiling women at sewing machines. We do the opposite: make the *substance* the
visual. The eleven real techniques, the real batch schedule, the real syllabus,
the real machine wall — set like a workshop's own wall chart.

Everything here lives in `src/app/premium.css` and degrades *upward*: when the
studio shoot lands, photography replaces swatches without touching the layout.

## New primitives

### `.ledger` / `.ledger-row` — the signature composition
Hairline-separated rows carrying an index, a title, and the fact a visitor
needs to decide. Use it for catalogues, sequences and syllabi.

```
<Ledger><LedgerLink index="01" title="Zardosi" meta="Machine Embroidery" /></Ledger>
```

It exists because the site kept answering every new question with another grid
of identical cards. A row list is denser, scans faster, works at 320px with no
cropping, and is honest about what we do and do not know. Variants:
`a.ledger-row` (whole row is the target, thread marks it), `.is-labelled`
(label/value, so the markup can stay a valid `<dl>`).

**Keep cards** only where an image genuinely leads.

### `.spec-grid` — hairline cells for equivalent facts
The machine wall, what a fee covers, how teaching works. One shared border
instead of N floating boxes: quieter, denser, never reads as a dashboard.
Columns step 2 → 3 → 4; the trailing-rule `:nth-child` blocks must be kept in
step with the column count (custom properties do not work in `:nth-child`).

### `.on-carbon` — dark bands as a real surface
Re-points the palette tokens, so cards, rules, chips, eyebrows and secondary
buttons nested inside invert correctly. Dark is *punctuation*: exactly two per
page (the audience switch, and the close). A third turns punctuation into
decoration.

### `<TechniquePlate>` — drawn material swatches
Satin rows for machine work, loops and cut edges for the modern techniques,
path nodes for emCAD. **Deliberately no `viewBox`**: with one, the tile scales
with the container and a 9px satin pitch renders as 60px candy stripes.
Without one, user units are CSS pixels and the tile stays at thread scale.
This is texture, never illustration — it must never compete with adjacent type.

### `.pending-block` — content the owner still owes
Owner-supplied copy (the founding story, trainer names) must look *deliberately
reserved*, not accidentally broken. One consistent treatment beats an emoji in
a dashed box.

## Rules this pass added

1. **Font size and leading travel together.** Setting only `font-size` from a
   `--text-*` token drops the paired `--text-*--line-height`, and the heading
   silently falls back to the body's 1.625. Every class here that sets a
   display size also sets its line-height and letter-spacing.
2. **Unlayered CSS outranks `@layer base`.** Any heading styled in
   `premium.css` must restate the Gujarati overrides (`line-height: 1.3`,
   `letter-spacing: 0`) or it inherits Latin tracking. Never letterspace
   Gujarati.
3. **`--container-pad` is the one gutter value.** Anything that breaks the
   gutter (scrollers, tables) derives from it via `.bleed-row`. A hardcoded
   `-mx-5` against an 18px gutter leaked 2px of horizontal overflow.
4. **Sample content does not ship to visitors.** Source fallbacks carry
   `sample: true`; their quote fields are editorial instructions. Public
   components filter on `!sample` and render an honest "not published yet"
   state instead. Content Desk publishing one real row switches the section on.
5. **Section rhythm is fluid**, not three breakpoint steps. Endpoints still
   land on the spec values; every width between is composed rather than
   jumping. Tablet stopped being "desktop, early".
6. **24px minimum tap target**, with the WCAG inline-link exception. Footer
   links get `padding-block`, not a bigger font.

## Homepage composition

Five chapters, each a pair of sections sharing a surface, with the schedule
directly under the catalogue where the decision happens:

| Chapter | Sections | Surface |
| --- | --- | --- |
| The offer | Hero (index + fact rail) | ivory + grid |
| What, and when | Course families · Batches | ivory-2 |
| How the work works | Screen→stitch · Method | ivory, signature tier |
| Proof | Work · Stories · Teaching · Channel | mixed |
| Decide | Fees · FAQ | ivory-2 |
| Close | Business door · Visit · CTA | carbon / ivory / carbon |

Chapters that continue a surface carry a hairline (`border-t border-line`)
instead of a colour change.

---

# v3 primitives (Phase 1, Screen to Stitch)

Everything below lives in `src/app/premium.css` plus a handful of components
under `src/components/ui/`. The rule for adding to this list: a primitive
earns a name only when the same cluster has already been rebuilt by hand on
three or more screens.

## Stitch paths — `<StitchPath>` / `<StitchRule>`

The one drawn device on the site. `src/components/ui/StitchPath.tsx` owns the
geometry so every stitched mark is identical:

```
stitch length 9 · gap 6 · needle penetration at the head of each stitch
```

Two paths produce that. The first strokes with a `9 6` dash — thread on the
surface. The second strokes the *same* path with a zero-length dash, a round
cap and the same 15-unit period — a dot exactly where the needle went through.
That second path is the whole difference between this and a dashed border, and
it is why the mark reads as embroidery at any size.

Presets: `run` (straight rule), `seam` (horizontal wave), `drop` (vertical,
stacked steps), `hook` (step-to-step, desktop rows), `elbow` (corner turn).
Custom geometry via `d` + `viewBox`. Tones map to palette tokens.

**Reveal is a `clip-path` wipe, never `stroke-dashoffset`.** Animating the
offset slides the stitches *along* the seam; the wipe lays them down. The wipe
is opt-in (`draw`), `.js`-gated, self-registering through `<UnveilWatcher>` —
which now watches `.stitch-wipe` as well as `.media-unveil` — and disabled
under `prefers-reduced-motion`. A stitch never needs JS to exist, only to
arrive gracefully.

`.stitch-line` (the CSS gradient rule) survives for full-bleed band edges
where an SVG would be wasteful. Anything shaped uses `<StitchPath>`.

## Surfaces — `<Surface>` / `<SeamNote>`

Four tones and no more. A fifth tone is almost always a page inventing its own
system.

| Tone | Class | Use |
| --- | --- | --- |
| `paper` | `.surface` | The default reading surface |
| `quiet` | `.surface-quiet` | Bordered, keeps the page background |
| `raw` | `.surface-raw` | Warm band that groups without framing |
| `machine` | `.surface-machine` | Steel Indigo panel for specs and machine detail |

`feature` swaps in the larger radius and padding — **one moment per page**, not
one per card. `<SeamNote>` holds an aside with a thread down its left edge
instead of boxing it, so a caveat cannot out-rank the thing it qualifies.

## Actions — `.action-row` + `.cta-tertiary`

`.action-row` was already the decision row; v3 gave it a third rank. Primary
button, secondary button, and a tertiary *link* that is still an action
(Directions, Call, See the syllabus). Naming the third rank is what stops a
page from promoting it to a third solid button and flattening the hierarchy.

Every child clears 44px, and below 480px the buttons go full width rather than
sitting at two ragged widths.

## Editorial — `<PullQuote>`

The only place the accent face is used, which is what earns its download.
`sample` is not cosmetic: workers.dev is publicly reachable, so an unverified
quote must be unmistakable wherever it renders, and the same flag keeps it out
of `Review`/`AggregateRating` structured data. A quote with no attribution
renders no cite line rather than an invented one.

## Layout — `.split` / `.stack-lines`

`.split` is copy + rail (1.25fr / 0.75fr from 900px), `.split-even` is two
equal columns, `.split-rail-first` reverses the visual order without reversing
the DOM order. `.stack-lines` is the ledger's simpler cousin: a
hairline-separated vertical list with no index column.

## The public shell — `.site-body`

The locale layout's `<body>` is a flex column with `min-height: 100dvh`, so
the footer sits at the bottom of short pages (404, verify results) instead of
floating mid-viewport.

`.site-body` is also the scope for the mobile tab bar's bottom padding. That
rule used to target bare `body`, which reserved 64px at the bottom of every
Karma Console screen for a bar the console does not have. **Anything the
public shell needs from `body` is scoped to `.site-body`** — `globals.css` and
`premium.css` are both shared with the admin.

## Brand mark and spine

Karma has no logo file. The header wordmark carries the brand on its own:
a three-stitch vermilion tick, then "Karma" at 800 beside "Design Studio" at
500 in stone. One line at every width; the tail drops below 380px. Nothing
here invents a mark the owner never approved.

The spine — *From screen to stitch. / Design on screen. Prove it on the
machine.* — closes **every** page from the footer, not just the home hero. It
is the promise the whole site is built to keep, so it is chrome, not content.


---

# v3 additions from the hardening and polish passes

## Surfaces carry their own text colours

There are four page surfaces, and **the palette was measured against only one
of them**. Cotton (#F5F0E6) and Raw Silk (#E9DECD) are close enough that the
same secondary tokens clear AA on both. Sand (#DED0B8) is not:

| Token | Cotton | Raw Silk | Sand (base) | Sand (override) |
| --- | --- | --- | --- | --- |
| `stone` | 5.72 | 4.89 | **4.28** ✗ | `#5b5951` → 4.62 |
| `vermilion-deep` | 5.57 | 4.76 | **4.16** ✗ | `#9e3624` → 4.60 |
| `needle` | 5.99 | 5.12 | **4.48** ✗ | `#286078` → 4.55 |
| `zari-deep` | 5.77 | 4.93 | **4.31** ✗ | `#854b2a` → 4.55 |

`.bg-sand` re-points those four tokens, the same mechanism `.on-carbon` uses.
**A surface owns the text colours that work on it** — no component and no call
site has to know which band it is sitting in.

The rule this establishes: *adding a surface means measuring every secondary
token against it before using it behind body copy.* `tests/hardening.test.ts`
holds the numbers, including the deliberate assertion that the base values
fail on sand, so the reason stays legible.

## Container queries for "is there room", media queries for "what device"

The header brand tail drops on a container query, not a viewport one, and the
difference is not academic: **at 200% zoom on a 1280 screen the viewport is
still 640 CSS px**, so a `max-width: 379px` rule never fires — while every
`rem` in the row has doubled and the row is genuinely out of space. That was a
60px horizontal overflow on every page and a WCAG 1.4.10 failure.

If the question is "does this fit", ask the container. Use `rem` thresholds so
the answer scales with the reader's text size.

## `.u-break` for text the studio did not write

Any string from a feed, an API or a person — a YouTube title, a pasted URL, a
social handle — can contain a token longer than its box. Inside
`overflow: hidden` that is silently clipped, and it only shows at large text
sizes. Third-party text gets `.u-break`.

## Fonts: import the subset, not the family

The full `@fontsource-variable/noto-sans-gujarati` import shipped a `symbols`
and a `math` subset — 36.8KB — on **English** pages, because their
`unicode-range` claims `→` (U+2192) and `★` (U+2605) and Manrope does not
cover them. The browser fell through the stack and fetched both to draw an
arrow.

Noto is now declared by hand, restricted to the Gujarati block. Five font
files became three; 208KB became 172KB on `/en` and 134KB on `/gu`.

The rule: **when a font stack has a fallback face for another script, that
face will be asked for punctuation too.** Restrict its range, or the browser
downloads a whole subset to render a dash.

## Compositions are left-aligned, including the ones nobody plans to see

The 404 and error pages were the only centred slabs on the site, which made
the page a visitor reaches by accident look like it came from a different
site. Both now use the same `PageIntro` and `reading-shell` as every other
interior page — and the 404 spends its space on what the visitor was probably
looking for rather than on an apology.

## Measurement is part of the system

`src/lib/analytics.ts` names eight events and admits six context keys, all
slugs or enums from our own data. **No `string` escape hatch**, and `track()`
strips anything unrecognised even if a cast gets past the compiler. Nothing a
visitor types can reach it, and there is no third-party script on any page.

## Structured data has exactly one door

`src/lib/schema.ts` builds every piece of JSON-LD on the site, and a test
asserts no other file under `src/app` or `src/components` contains
`"@context"`. Schema is where a labelled placeholder would silently become a
fact a search engine repeats, so it is the one thing that is not allowed to be
written twice.

---

## Karma Console — the dense pass (2026-08-30)

The console is used **standing up, on a phone, between a machine and a
counter**. It was built as a page of generous cards, which reads well on a
laptop and shows about three facts per screen at 390px.

The operating model it now borrows is the merchant app a shop owner actually
uses: compact rows, many facts visible at once, one status per row, and a
record's actions sitting next to that record instead of on another screen. **That
is the UX principle. None of the visual language is borrowed** — this is still
Screen to Stitch: the same tokens, the same one vermilion accent, borders
instead of shadows, status colours used only as statuses, and no component kit
added to the Worker budget.

### The primitives (`premium.css`)

| Class | What it is |
| --- | --- |
| `.data-list` / `.data-row` | A list of records, one hairline between rows. A row is a title, a `__meta` line of dot-separated facts, and a `__actions` slot. `.is-archived` mutes one without hiding it. |
| `summary.data-row` | The same row used as a `<summary>`. `.data-row` is `display: grid`, which silently drops the marker a `<summary>` draws for itself, so this restores the affordance: a caret in its own third column, rotating on open, plus the pointer cursor. Use it wherever a record's body is behind a disclosure — never a bare `.data-row` on a `<summary>`. |
| `.chip` | A compact status pill. Colour still comes from `.status-*`, so it stays status-only. |
| `.kv-grid` · `.kv-label` · `.kv-value` | Key/value pairs at a density that fits a phone: label above value, tabular figures. |
| `.toolbar` | Sticky search and filters, clearing the mobile console header at `top: 4rem` and sitting at `top: 0` on desktop where there is none. |
| `.tap` | A control inside a dense row. |
| `.rec-menu` | Record actions: a dropdown on a laptop and a bottom sheet on a phone, from one `<details>`. |
| `.danger-zone` | Deliberately unlovely. It should not look like the rest of the console, because it does not behave like it. |
| `.data-num` | Tabular figures, so a column of money does not jitter. |

### Density and touch size are not in tension

This is the part to keep. Rows are visually tight — a two-line row is ~64px —
while **every interactive control inside one keeps a ≥44px hit area** (WCAG
2.5.5), using padding that overflows the row rather than a taller row. Bottom
sheets and the last row of a list respect `env(safe-area-inset-bottom)`, so an
action never ends up under the home indicator.

### Gujarati, again

`.kv-label` is an uppercase, letterspaced label — exactly the kind of style that
breaks Gujarati. It self-neutralises under `:lang(gu)`, as `.chip` does, as
`.microlabel` and `.eyebrow` already did. **Any new label style needs the same
override**, and `tests/console-density.test.ts` fails without it.

---

# v4 — "Machine Lab" (2026-08-30)

The owner's full-product redesign brief
(`docs/karma-machine-lab-redesign-master-plan.md`) keeps the Screen to Stitch
promise and sharpens the position: **a machine-led commercial embroidery
learning studio**, not a coaching centre, not a fashion school, not a software
reseller. The governing creative rule for everything below is:

> **Don't decorate the interface with embroidery. Make the interface behave
> like embroidery.**

v4 is an **extension of v3, not a replacement.** Not one v3 token was renamed
or retuned. That restraint is not politeness: `globals.css` is shared with
Karma Console, so renaming a token silently restyles the admin.

## Where a v4 rule goes, and why

```
globals.css (@layer base, components)  →  premium.css  →  machine-lab.css
```

`premium.css` is deliberately unlayered, so it beats every `@layer` in
`globals.css`. That means a new v4 primitive added to `globals.css` would lose
to any v3 rule in `premium.css` that touched the same property — silently, and
only on some screens. So:

- **Tokens** go in the `globals.css` `@theme` block (they are just values, and
  Tailwind needs them there to mint utilities).
- **Primitives** go in `src/app/machine-lab.css`, which is unlayered and
  imported *after* `premium.css` in both root layouts.

`tests/machine-lab-system.test.tsx` fails if that import order is ever reversed.

## Machine notation

`.mono-note` / `<MonoNote>` / `<StepIndex>`, on `--font-mono`.

Two hard limits. **No new font** — this is the platform monospace stack, because
`01 DESIGN` is not worth 30KB on a Surat mobile connection, and a test asserts
the project still imports exactly two `@fontsource` families. And **not for
prose**: monospace here means "this is a machine label". Used for body copy,
navigation or buttons it stops meaning that and starts meaning "someone wanted
to look technical".

Legitimate uses: `01 DESIGN` · `02 MACHINE` · `03 OUTPUT` · `EMCAD / PATH` ·
Machine Note indexes · course indexes.

Gujarati falls back to the body stack with no uppercase and no letterspacing,
in the stylesheet rather than at the call site.

## The Karma Stitch icon family

`src/components/ui/Icon.tsx`, one stroke width (1.5), `currentColor`, 24×24.

| Group | Icons |
| --- | --- |
| Production | `needle` `needle-down` `cone` `bobbin` `hoop` `machine` `machine-head` `multi-head` |
| Technique | `bead` `sequence` `cording` `chain` `laser` `tuft` `satin` `applique` `cross-stitch` |
| Digitising | `node` `handles` `density` `direction` `registration` |
| Troubleshooting | `thread-break` `misregistration` `density-problem` `correction` |
| **Universal — deliberately ordinary** | `pencil` `trash` `printer` `search` `arrow` `phone` `map` `check` `plus` |

**The rule that decides which list an icon joins:** branded concepts get niche
icons; universal actions keep universal icons. A visitor must never decode a
clever embroidery symbol to find "Edit". `ICON_GROUPS` is exported and tested,
including an assertion that no branded icon is used for a universal action.

No icon names a manufacturer or a model. An icon is a symbol for a technique,
not a claim about a machine Karma owns.

## Eleven technique signatures

`<TechniqueSignature slug="…" />`, one per course, keyed by course slug. The key
set is asserted equal to the catalogue, so a new course cannot ship without one.

They exist because the catalogue has eleven courses and, today, zero
photographs. The honest options were an empty grid, stock photography (banned),
or a drawn mark that describes the *structure* of the technique without
pretending to be a photograph of Karma's work. For the eight photographed
courses the signature becomes the secondary mark; for the three the shoot does
not cover, it stays the primary one.

| Course | Signature |
| --- | --- |
| Zardosi | tight parallel metallic satin field, one restrained zari highlight |
| Flat Embroidery | precise running field, clean direction changes |
| 4-Beads | bead nodes attaching sequentially to a path |
| Sequence Work | overlapping perforated discs, one reflective shift |
| Coding / Cording | a thicker cord following one curved Bezier path |
| Chain & Multi | linked loop construction over a second line of rhythm |
| Appliqué & 3D | raised border over a cut edge |
| Cross Stitch | a restrained crossing-stitch lattice |
| Laser Work | a precise trace, then one clean cut edge — no sparks |
| Tufting | loops rising from a baseline |
| EMCAD | vector nodes → handles → the stitch path they produce |

**A signature may never carry a number.** No RPM, density, GSM, coordinate or
machine model. A drawing that invents a specification is the same lie as a
stock photograph, only harder to spot — and there is a test for it.

## One canonical stitch language

Six marks, six meanings, and no seventh. Before this, the site improvised: a
dot here, a crosshair there, a dashed border somewhere else. Scattered
technical marks read as decoration.

| Mark | Meaning | Component |
| --- | --- | --- |
| Running stitch | progress / connection | `<StitchRule>` `<StitchPath>` |
| Thread path | process / transformation | `<StitchPath preset="hook">` |
| Knot point | decision / completion | `<KnotPoint>` |
| Registration point | precision / reference | `<RegistrationPoint>` |
| Broken path | failure / production problem | `<BrokenPath>` |
| Thread tail | editorial finish, sparing | `<ThreadTail>` |

Use a mark because it *means* that thing. A registration mark beside a phone
number is noise; beside "the design lands where the design said it would" it is
the brand speaking. `STITCH_SEMANTICS` is exported so the meanings are testable
rather than merely documented. The 9-on / 6-off running stitch geometry is
identical everywhere and asserted.

## Material texture

2–5% strength — felt before it is consciously noticed. All derive from
`--texture-ink` and `--texture-strength`, so the whole system dials in one
place, and the cap is enforced by test.

`.tx-cotton` `.tx-weave` `.tx-satin` `.tx-cross` `.tx-density` `.tx-laser`.
Add `.on-dark` alongside any of them on a dark surface: the texture has to
become light, not darker still.

## Glass and machine light — the restrictions ARE the feature

**Good glass** is ONE translucent software panel layered over real machine
imagery: an EMCAD overlay reading DESIGN / MACHINE / OUTPUT. **Bad glass** is
every card frosted and every section floating.

There is deliberately no `.lab-glass--card`. If a second frosted panel is ever
wanted on a screen, that is the signal the first one has stopped meaning
anything. Where `backdrop-filter` is unavailable the panel becomes an opaque
steel plate rather than a washed-out translucent one.

`.machine-light` is the reflection off steel under a work lamp: steel-blue with
one vermilion edge, low alpha, behind **one** technical composition per page,
never behind body copy. It is not a purple-blue SaaS aurora, and a test checks
the colours.

## Motion levels

| Level | For | Token |
| --- | --- | --- |
| 0 | long copy, terms, dense forms, tables, most admin surfaces | — |
| 1 | hover/press, accordions, validation, filters, active rows | `--dur-l1` |
| 2 | a bead attaches, a disc shifts, a stitch underline completes | `--dur-l2` |
| 3 | section storytelling: stitch progress, problem → correction | `--dur-l3` |
| 4 | the hero Screen-to-Stitch moment — **max one per page** | `--dur-l4` |

`.m-l1`–`.m-l4` set duration and easing only. *What* moves is the component's
business; *how long it may take* is the system's. Level 2+ uses
`--ease-machine`: a fast, weighted start that settles — a needle bar, not a
bouncing ball.

**Hard bans:** cursor-following coordinates, scroll hijacking, parallax for its
own sake, a viewport needle following the user, autoplay sound, confetti,
perpetual decorative loops, fake machine dashboards.

Every hidden starting state is `.js`-gated, so with JavaScript off the finished
state is simply present — and under `prefers-reduced-motion` the final state
shows immediately, with the dash offsets and clip wipes unwound rather than
merely un-animated. Both are tested.

## The 32-photograph manifest

`src/content/photo-manifest.ts` types every shot on the owner's final brief with
its intrinsic dimensions; `<ManifestPhoto id="…">` reserves that exact aspect
ratio. When the real files arrive they drop in with **zero layout shift**, and
no layout has to be restructured.

A slot with no photograph renders as an honest, named, obviously unfinished
frame. It is **never** filled with stock photography, a generated image,
another institute's work, or another course's photograph. A labelled empty
frame is a visible work-in-progress; a borrowed photo is a false claim about
this business that would outlive the fix. See `docs/content-checklist.md` §B.

## The calibration target

55% real photography · 20% typography and editorial layout · 12% niche visual
language · 8% motion · 5% material finish.

Until the photographs arrive, the 55% is represented by honest named frames and
technique signatures — not fake imagery. **If the finished interface is 40%
animation and vector decoration, it has failed.**

## v4 shell: page rhythm, hero and the production rail (Phase 2)

### Bands — HUMAN / MACHINE / MATERIAL

| Class | Register | Use |
| --- | --- | --- |
| `.band-machine` | technical, dark — **requires `.on-carbon`** | hero, machine proof, the production rail |
| `.band-material` | bright, editorial | student work, the material archive |
| `.band-human` | warm | trainers, stories, visiting, the footer |
| `.band-info` | light, neutral | facts, decisions, the trust rail |

A band class adds **surface and texture only**. It never re-points a palette
token: `.on-carbon` in `premium.css` already inverts every token so nested
cards, rules, chips and buttons follow, and a second dark-surface
implementation would drift from it within two phases. A test asserts no
`.band-*` rule declares a colour token.

Dark surfaces are punctuation. Each one is followed by a light band, because
two dark bands in a row stop being punctuation.

### The hero

One markup tree at every width. On a phone the three frames are the vertical
story `01 SCREEN / 02 MACHINE / 03 RESULT`; on a laptop the same list staggers
beside the copy. There is no desktop collage plus a mobile copy — and a test
fails if breakpoint-gated visibility classes ever wrap a whole composition
there.

The right side is **one continuous thread**: `<StitchRail>` spans the full
track and the frames hang off it. Three connectors that happened to line up
would not be the same claim. Laying that rail down is the **single Level-4
moment** the homepage is allowed.

`<StitchRail>` is the vertical sibling of `<StitchRule>`: same 9-on / 6-off
stitch, same penetration dot at every stitch head, drawn in CSS so it holds
exact pixel scale at any height. A rotated `<StitchRule>` would work
geometrically and break the moment anything inside it had to stay upright.

`.hero-lab .hero-title` is uppercase — the machine plate. **Gujarati keeps
sentence case and zero tracking**, in the stylesheet, not at the call site.

### The production rail

`<ProductionRail>` takes its stages as a prop, so the longer B2B chain
(SCREEN → SAMPLE → PROBLEM → CORRECTION → OUTPUT) reuses it rather than forking
it.

The interaction rule worth keeping: **every stage's media is visible at every
width, and the tabs drive one detail panel and nothing else.** That removes the
usual tab/accordion problem — on a phone the rail is a vertical story with
nothing hidden behind a gesture a thumb has to discover, on a laptop the same
markup is a row with one stage explained underneath. No autoplay, no drag
requirement, no duplicated DOM. All three are tested.

### Button microinteractions

`.btn-stitch` draws exactly three 9/6 stitches under the primary label on hover
and focus — 39px, the brand's own gesture at the size of a gesture. **No glow
halo**; a glow would be the only decorative light on the page. The secondary
action advances its arrow rather than growing a background. Reduced motion
shows the finished state.

## v4 homepage compositions (Phase 3)

### The Machine Index — `.machine-index`

The catalogue as a workshop list. A row is index · media · name · what the
technique produces · cues · arrow, and it scans in one pass at 320px — which
eleven cards never did, and which keeps working past eleven courses without a
redesign.

**Photography leads where there is one; the technique signature leads where
there is not — same slot, same size.** That is what stops the three
signature-led courses reading as second-class rows, and it means nothing about
the layout changes when the eight course photographs land.

A row shows a duration **only** where the owner confirmed one, and never shows
a fee. A duration standing beside ten other rows reads as true of all of them.

### The decision block — `.emcad-*`

Two panels: what the course is, and what it costs. Every figure renders from
`src/content/course-operations.ts` — the message catalogue holds labels and
sentences and **no numbers**, so a correction happens in one file. The fee panel
takes a vermilion border; the payment schedule uses `<KnotPoint>` for each
instalment, which is the canonical mark for "decision / completion" and is
therefore the right one here rather than a bullet.

### The material wall — `.work-wall`

Six pieces, six shapes. Each frame takes its ratio from the manifest instead of
being forced into a uniform tile: a bridal panel is tall, a dupatta is square, a
screen-and-result pair is wide, and flattening them throws away the one thing
worth showing about textile work.

### Dark bands never run together

`tests/machine-lab-homepage.test.tsx` walks the page's rendered section order
and fails if two `.on-carbon` sections are adjacent. This caught a pre-existing
bug: the business band and the close were both dark and next to each other,
while a comment claimed the page had "exactly two dark bands". A dark surface
stops being punctuation the moment it repeats.

---

# v5 — "Light-first Machine Lab" (2026-08-31)

The owner's compact-density brief
(`docs/karma-compact-density-redesign-plan.md`) made two decisions. This
section covers the first: **the public site no longer uses a large black or
near-black full-width surface.** The second — viewport economics — is a layout
matter and is recorded per phase in that plan.

v5 is an **extension of v4, not a replacement**, on the same terms: not one
token was renamed, because `globals.css` is shared with Karma Console. What
changed is a set of *values* and one band's *meaning*.

## What was actually dark, and what was not

The measured answer (`docs/compact-density-audit.md`) is narrower than the
impression. `.band-material`, `.band-human` and `.band-info` were already
Cotton, Raw Silk and Worktable White; `/student-work`, `/success-stories`,
`/about` and `/contact` had no dark surface at all; and **the footer was never
dark** — it is `#e9decd` Raw Silk and always has been.

Five surfaces were dark, and they were the five loudest moments on the site:

| Was | Now |
| --- | --- |
| Homepage hero | Steel Mist `.band-machine` |
| The production rail | Steel Mist `.band-machine` |
| The EMCAD decision block | Steel Mist `.band-machine` |
| The homepage close | Steel Mist `.band-machine` |
| The B2B production chain | Steel Mist `.band-machine` |

Plus two panels on `surface-machine` (a course page's machine/software spec,
the `/services` exchange panel), and one inline closer on `/admissions`.

## Steel Mist

```
--color-mist:      #e6ebee   /* the light technical surface */
--color-mist-line: #c9d4da   /* its hairline               */
```

Derived from Steel Indigo `#172b35` by lifting lightness and dropping
saturation, kept marginally warm so it reads as a *material* surface beside
Cotton rather than as a cold web-app grey. Measured, not estimated:

| Text role | On Steel Mist | On Cotton | Verdict |
| --- | ---: | ---: | --- |
| `carbon` | 15.10 | 15.97 | AAA all sizes |
| `stone` | 5.41 | 5.72 | AA all sizes |
| `needle` | 5.67 | 5.99 | AA — safe for small links |
| `vermilion-deep` | 5.26 | 5.57 | AA — small-text accent |
| `zari-deep` | 5.45 | 5.77 | AA |
| `steel` | 12.20 | 12.90 | AAA |
| `vermilion` | 4.02 | 4.25 | **Large text / UI only — the same rule as everywhere** |

**Steel Mist therefore needs no re-pointed token block**, unlike `.bg-sand`.
Every secondary token already clears AA on it, and it is in fact a slightly
better ground than Raw Silk, where `stone` sits at 4.89. That is asserted in
`tests/compact-density-system.test.ts`, which reads the hex out of the token
rather than carrying its own copy — a test with a hardcoded colour keeps
passing after a retune while the real surface has moved.

## `.band-machine` is now the technical band, not the dark band

The four-band vocabulary survives intact, because it is the site's rhythm
language and three of the four were already right:

| Class | Register |
| --- | --- |
| `.band-machine` | **technical — Steel Mist**, the software/EMCAD context and the machine proof |
| `.band-material` | bright, editorial — the work itself |
| `.band-human` | warm — people, stories, visiting, the footer |
| `.band-info` | light, neutral — facts and decisions |

Two details carried the change:

- **The texture inverts with the ground.** The same 3px pitch at the same
  2–5% strength, drawn in `--texture-ink` rather than in cream.
- **The steel edge is now the band's main signal**, so its steel stop went
  from a 55% wash to 85% and its tail resolves to `--color-mist-line` instead
  of transparent. On near-black the edge was a highlight; on Steel Mist it is
  the thing that says *technical*.

`.machine-light`'s two radial stops halved in alpha (0.22 → 0.11, 0.13 →
0.07). The **colours did not change**, and must not: a pale ground is exactly
where a lavender gradient becomes tempting, and steel-blue plus one vermilion
edge is the entire idea. The purple/violet/magenta ban in
`tests/machine-lab-system.test.tsx` gets *more* load-bearing here, not less.

## What the identity was actually made of

Worth writing down, because it is the reason the swap cost one class per
section rather than a redesign. Nothing in the left column needed the black:

| Carried the identity | Depended on the black |
| --- | --- |
| The 9-on / 6-off running stitch, penetration dot at each stitch head | — |
| Six canonical stitch marks with fixed meanings | — |
| Eleven technique signatures | — |
| Machine notation on the platform monospace stack | — |
| Tabular figures on every number | — |
| Hairlines over shadows; one vermilion accent | — |
| Material textures at 2–5% | the `.on-dark` inversion |
| | `.on-carbon` token re-pointing, `needle-light`, the hero plate |

## `.on-carbon` stays defined, and is used by no public section

The plan's §3 still permits a dark surface for **a small isolated overlay
whose own content needs the contrast** — an EMCAD panel over a machine
photograph is the reserved case, and those photographs have not arrived.
Deleting the one correct dark-surface implementation would mean the next one
is hand-rolled, which is the drift the class exists to prevent. Keeping ~40
lines of currently-unused CSS is the cheaper mistake.

Three small dark elements are deliberately unchanged, and each is explicitly
inside the plan's exception:

- the mobile-menu **scrim** — a modal scrim is not a page band;
- the **active locale pill** — a 29px badge, and the only unambiguous
  `aria-pressed` signal in the control;
- the **skip link** — zero-size until focused, and carbon-on-ivory is the
  highest-contrast pairing in the palette.

**`SectionHeading`'s `onDark` prop is gone.** It existed so a dark band could
be added anywhere for free, and it was the thing that broke silently when one
was lightened — `text-ivory` on a pale ground is invisible and nothing catches
it. With no callers left, removing it makes a future dark band a TypeScript
error rather than white text on Steel Mist. `MonoNote`'s `"ivory"` tone went
the same way and for the same reason.

## The compact scale

Every value below is the **phone** value at 390px. Desktop endpoints moved by
at most a pixel or two: this is a mobile compaction, not a shorter website.

### Section rhythm

All three tiers survive — a page needs dynamics, and flattening them is what
made the pre-v3 homepage read as one scroll — but each is now a pure `vw` ramp
between a phone floor and a desktop cap, so the phone end is flat below about
700px where the compact scale actually matters.

| Tier | Was (390 → 1440) | Now |
| --- | --- | --- |
| `.section-major` | 48.5 → 88 | **32 → 80** |
| `.section` | 40.5 → 72 | **24 → 64** |
| `.section-compact` | 28.2 → 48 | **16 → 40** |

### Rhythm utilities

The tokens were never about the numbers — they exist so nobody picks a gap by
eye, per component. That is unchanged; the numbers moved onto the compact
scale of 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32.

| Relationship | Token | Was | Now |
| --- | --- | ---: | ---: |
| Eyebrow → heading | `--space-eyebrow-to-h` | 12 | **8** |
| Heading → supporting paragraph | `--space-h-to-lede` | 16 | **12** |
| Paragraph → action row | `--space-lede-to-action` | 24 | **16** |
| Section heading → its content | `--space-heading-to-content` | 24 → 40 | **16 → 32** |

### Type scale

Only the **mobile end** of each clamp moved. The old scale opened a phone at
44px for `display-xl` and 30px for `h2`, which is where the site was spending
its first viewport.

| Token | Phone (was → now) | Desktop | Plan's band |
| --- | --- | ---: | --- |
| `--text-display-xl` | 44 → **36** | 76 | hero 30–36 |
| `--text-display` | 40 → **33** | 64 | — |
| `--text-h1` | 36 → **29** | 56 | page title 24–30 |
| `--text-h2` | 30 → **22** | 46 | section heading 18–22 |
| `--text-h3` | 24 → **20** | 32 | — |
| `--text-h4` | 20 → **17** | 24 | card title 15–18 |
| `--text-lead` | 18 → **16** | 20 | body 14–16 |
| `--text-bodylg` | 18 → **16** | 18 | body 14–16 |
| `--text-smallmeta` | 15 → **14** | 14 | metadata 12–14 |
| `--text-eyebrow` | 12 | 12 | eyebrow 11–13 |
| `--text-btn` | 15 → **14** | 14 | buttons 13–16 |

Body copy stays **16px at line-height 1.625**, and Gujarati stays at 1.8.
Density is bought from headings, padding and rhythm — never from the reading
size or the leading, and never from Gujarati's leading, which is taller
because its vowel marks sit above and below the baseline.

`tests/compact-density-system.test.ts` asserts each token against the plan's
band by **evaluating the clamp at 390px**, not by matching its text, so a
later session may re-express any of these freely as long as the phone value
holds.

### Buttons and tap targets

`.btn` drops from a 48px floor to **44px** — the real WCAG 2.5.5 minimum, not
below it — with padding `0.625rem 1.125rem`. Gujarati keeps a taller box
(48px) for its vowel marks. **A dense screen may not buy its density from the
tap target**, and there is a test for both floors.

### Cards and ledger rows

`.ledger-row` — the site's densest primitive — goes from 12px to 8px of block
padding on a phone (17px → 12px from 640px), with the title at 15px and the
note at 13px, promoting to 16/15 from 640px. Public card padding swept from
`p-6 md:p-8` (24/32) to `p-3.5 md:p-5` (14/20), inside the plan's 12–18px
band.

`.card` itself still carries no padding: the call site owns it, which is what
lets a dense list row and a feature panel share one surface primitive.

## The rule this pass establishes

**A surface owns the text colours that work on it, and adding a surface means
measuring every secondary token against it before putting body copy there.**
That was already the rule `.bg-sand` established. Steel Mist is the first
surface to pass it without needing an override block — which is a fact worth
knowing, not a licence to skip the measurement next time.

---

## Measured floors, and the one clause that decides them (2026-08-31)

Two touch-target floors apply, and the difference is a WCAG clause rather than
a preference. Get this wrong in either direction and the site is either
inaccessible or 250px taller than it needs to be.

- **A control that stands on its own gets 44px.** `.btn`, `.tap`,
  `.console-tab`, `.site-brand-mark`, `.cta-tertiary`, `.link-more`,
  `summary.data-row`, `.hero-thread-foot a`.
- **A link inside a sentence is judged at 24px**, because WCAG 2.5.8 exempts it
  by name. The consent sentence in the brief form is the canonical example; do
  not "fix" it.

`.link-more` is the section-level "see all X" link. It exists because six call
sites spelled the same affordance five different ways and measured 26px, 32px
and 32px. Pair it with `.stitch-link`, which supplies the underline.

**Set a floor, not padding alone.** `.cta-tertiary` took its height from the
line box plus `padding-block`, so it measured 44px in English and 41.2px in
Gujarati on the same hero at the same width. A height that comes from font
metrics is a height that changes when the language does.

**`scroll-padding` on `html`, not `scroll-margin-top` on `[id]`.** The latter
covers an anchor jump and nothing else; the browser also scrolls for
`scrollIntoView()` and for keyboard focus, and there it had nothing — tabbing
to the last card on `/contact` at 390px put it half behind the fixed tab bar.
The public site and the Console get separate blocks, because their chrome
heights are different and one constant would be wrong on one of them.

**A media query adds no specificity.** If a phone override is declared above
the base rule it overrides, the base rule wins on source order and the override
is dead — silently, with valid CSS and passing tests. This happened to the
whole hero thread block and was only found by measuring a rendered box. Keep
override blocks below what they override; `tests/compact-density-responsive.test.ts`
asserts the order for the hero.

---

## The verdict and the document (Phase 7, 2026-08-31)

Two blocks joined the public sheet with the secondary routes. Both exist
because the page they serve is read once, under pressure, for one answer.

### `.verdict` — the certificate result

An employer with a photocopy in their hand and a binary question. The block is
a left-ruled panel with a squared icon box and the verdict as a **word**:

```
.verdict          the panel; 4px left rule, hairline elsewhere
.verdict-ok       --ok      .verdict-bad  --bad     .verdict-wait  --warn
.verdict-mark     2.5rem square, bordered, holding the icon
.cert-fields      the record itself; two columns from 34rem
.cert-no          mono, tabular, letter-spaced, breakable
```

**Four signals, and colour is the fourth.** Word, icon, rule, then hue — the
page gets printed, forwarded and read on a cracked phone in daylight, and
`--ok` / `--bad` are the status family that is never the only signal
(CLAUDE.md non-negotiable #8).

**The mark is a square, not a circle.** A round badge with a tick in it is the
gesture every certificate mill uses, and the previous version animated it in
with `seal-in`. Nothing in this flow moves.

### `.legal-doc` — Privacy and Terms

```
.legal-doc        the reading column; 2rem between clauses
.legal-section    2.25rem notation column + the clause
.legal-index      the number, `.t-micro .numeric`, aria-hidden
.legal-updated    the hairline foot
```

The number is navigation, not decoration: "clause 4" has to be something
somebody can point at over the phone. It is `aria-hidden` because an ordered
list already numbers itself for a screen reader, and reading "04, four" is
worse than reading neither.

### The desktop header band splits twice

`.site-nav` appears at **64rem** with a `0.875rem` gap and no header CTA;
`.site-head-cta` and the comfortable `1.5rem` gap arrive at **75rem**.

Measured at 1024 in both languages before the split: brand 197px + six links
545px + language switch and CTA 250px = 992px against 928px of usable row. It
neither wrapped nor scrolled — every box is `nowrap` inside a shrinkable flex
child — so the header **overlapped itself** on every page. A row that cannot
wrap must be given a width it fits in; shrinking the type would only have moved
the failure a few pixels away.

---

## The 32 photographs: alt text, and the pipeline for the day they arrive (Phase 9, 2026-08-31)

None of the 32 exists yet. `src/content/photo-manifest.ts` is the shoot list as
a typed record, and `<PhotoFrame>` reserves each slot's **exact** aspect ratio
from its intrinsic width and height — so the day a file lands is a content
change, not a layout change, and CLS stays 0 through the swap.

Coverage today: hero 3 · course 8 · work 6 · trainer 3 · studio 6 · story 2 ·
process 3 · floor 1. Every one is placed in a real composition, and
`tests/kds-photo.test.ts` fails if a slot is added, dropped, or left unplaced.

### Alt text

Three different strings, and confusing any two of them is the failure mode:

| Field | Who it is for | Where it appears |
| --- | --- | --- |
| `label` | the photographer | on the placeholder, as the shot brief |
| `altGuidance` | whoever writes the alt when the file lands | in the manifest, never on the page |
| `alt` | the reader who cannot see the photograph | **does not exist yet** |

**`altGuidance` is an instruction, not a description.** "Name the technique
being stitched and the material" is not alt text; it is what the alt text has
to accomplish once somebody has looked at the actual photograph. Pasting it
into an `alt` would describe a picture nobody has seen.

**While a slot is empty it announces itself as pending.** The placeholder used
to be `role="img"` labelled with the shoot brief, which told a screen-reader
user that there IS a photograph of an EMCAD DAHAO screen. It now carries a
visually-hidden `PHOTO_PENDING: <label>` line at every scale — including
`thumb`, which previously announced a label while showing nothing.

`PHOTO_PENDING` is one bilingual string rather than a catalogue key because
`<PhotoFrame>` also renders on `/design`, which is its own root layout with no
intl provider. It is the same exception the WhatsApp prefills take.

When a file arrives: replace the placeholder body with the `<picture>`, write
the `alt` from what is in the frame, and keep the `width`/`height` from the
manifest so the reserved box is unchanged. A decorative crop of a photograph
already described nearby takes `alt=""` — never a repeat of the caption.

### Image pipeline — no R2, and none needed

**Public photography is same-origin deployed assets, not R2.** R2 is for
confidential B2B brief files and is deferred on purpose (CLAUDE.md #20); a
public photograph has no reason to be behind an authenticated route. Files go
in `public/photos/<SLOT_ID>.<ext>`, and `wrangler.jsonc` serves them from the
**Workers Assets** binding (`.open-next/assets`) — which is a different budget
from the 3 MB Worker script, so 32 photographs cannot push the script over its
limit.

Recommended, when the shoot is delivered:

- **AVIF first, WebP second, JPEG last**, in one `<picture>`. AVIF at quality
  ~50 is roughly a third of the equivalent JPEG on embroidery detail, which is
  exactly the high-frequency texture that punishes JPEG.
- **Two widths per slot**: the manifest's own width (already sized for a 2×
  screen at the largest box it appears in) and half of it, offered through
  `srcset` with a `sizes` that matches the composition. Nothing needs a third.
- **A budget of ~150 KB per AVIF at 1600px**, so the whole shoot is 4–6 MB
  across the entire site and no single page carries more than about six.
- `loading="lazy"` and `decoding="async"` on everything except the hero's first
  frame, which takes the `priority` flag `<PhotoFrame>` already reserves.
- **Strip EXIF on export.** A phone photograph of the studio floor carries GPS
  coordinates, and the studio's address is a decision the owner publishes
  deliberately rather than one a camera makes.
- Do **not** reach for `next/image` optimization here. On Workers it needs a
  loader this project does not run, and a manifest that already knows every
  intrinsic size gets the same result from plain `<picture>` with no runtime.
