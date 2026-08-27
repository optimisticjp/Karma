# Design system v2: "The Digital Thread"

This supersedes the visual sections (§4-§7) of karma-master-plan-final.md.
The concept: digital embroidery design moving from screen to stitch, machine
and finished textile. Editorial, crafted, precise, warm, technical. One
accent colour. Photography carries the colour; the interface stays quiet.

## Palette (restrained neutrals + one accent)
| Token | Hex | Use |
| --- | --- | --- |
| `ivory` | #F7F3EA | Page background |
| `ivory-2` | #F1ECE0 | Alternating section bands |
| `card` | #FFFDF8 | Soft-white surfaces |
| `line` | #DAD5CB | Thread-grey borders, dividers |
| `carbon` | #20211E | Primary text |
| `stone` | #6D6B64 | Secondary text |
| `vermilion` | #C54832 | THE accent: button fills, stitch lines, large text, icons, focus |
| `vermilion-deep` | #A93A27 | Small-text links, hovers |
| `success` / `warn` / `error` | #2F7D46 / #B7791F / #B3261E | System status ONLY |

**Accessibility rule that shaped this:** vermilion on ivory is ~4.4:1, which
passes AA for large text, icons and UI components but FAILS for small text.
That is why `vermilion-deep` (~5.7:1) exists: any link or label below ~24px
uses the deep tone. White-on-vermilion buttons pass at ~4.8:1. Do not "fix"
a design by putting bright vermilion on small text.

Never reintroduce the old zari gold / maroon system. Never add a second
accent. Green/amber/red appear only as statuses (verified, warning, error).

## Typography
- English display: **Fraunces Variable** (SOFT 60, optical sizing auto)
- English body/UI: **Manrope Variable**
- Gujarati display: **Noto Serif Gujarati Variable**
- Gujarati body/UI: **Noto Sans Gujarati Variable**
All self-hosted from npm (@fontsource). Stacks cross-fallback so Gujlish
lines render correctly in either locale. Never uppercase or letterspace
Gujarati; Gujarati body line-height is 1.8 and buttons are slightly taller.

Type scale tokens (fluid clamps to these desktop targets): display-xl 76,
display 64, h1 56, h2 46, h3 32, h4 24, lead 20, bodylg 18, body 16/26,
smallmeta 14, eyebrow 12, btn 15. **No sizes outside the scale.**

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
Tokens and primitives: `src/app/globals.css` (@theme + @layer components).
Change tokens only with a comment explaining why, and update this file.

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
