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
frames — three in the hero, eight on the courses index, one per trainer card,
one per story. Rival institutes in Surat fill that gap with stock images of
smiling women at sewing machines. We do the opposite: make the *substance* the
visual. The eight real techniques, the real batch schedule, the real syllabus,
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
