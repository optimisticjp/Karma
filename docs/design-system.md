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
