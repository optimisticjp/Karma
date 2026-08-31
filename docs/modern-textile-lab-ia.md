# Modern Textile Lab — information architecture

> ## ⚠ SUPERSEDED — 2026-08-31
>
> The owner stopped and rejected the Modern Textile Lab direction after PR #58.
> This file was written for it and is **no longer authoritative for anything**.
>
> Authoritative instead:
> [`docs/karma-modern-textile-lab-redesign-plan.md`](karma-modern-textile-lab-redesign-plan.md)
> (THREAD / MACHINE / PROOF) and
> [`docs/karma-creative-freedom-trust-proof-addendum.md`](karma-creative-freedom-trust-proof-addendum.md),
> which beats the plan on visual creativity, trust/proof modules and sample
> placeholders.
>
> **Where this file is now wrong, specifically:**
>
> - **§5 language selector.** It describes a three-locale chooser. The public
>   website is **English + Gujarati only**; there is no Hindi website.
> - **§2 homepage.** Its 20 → 8 section map and its removal table belong to the
>   rejected composition. The rebuild starts from a blank homepage, and the
>   addendum lifts the 7–8 section cap outright — trust and proof modules the
>   removal table deleted are now **required**.
> - **§4 navigation** and **§6 conversion chrome.** Superseded by the plan's
>   §14 and §15, which the shell rebuild implements directly.
> - **§1 route map.** Still broadly accurate, and `/batches` in particular is
>   kept — the route and its "real rows or nothing" data contract survive the
>   restart. Read it as a record of which routes exist, not as direction.
>
> Kept rather than deleted because its route inventory and the reasoning behind
> `/batches` are genuinely useful, and because deleting the record of a rejected
> direction is how a project rediscovers it a year later.

**Original status (2026-08-31, now superseded):** authoritative for public
routes, navigation and conversion chrome.
**Does not touch:** Karma Console, `/admin/*`, or anything behind auth.

Every decision below is traceable to a measurement in
`docs/modern-textile-lab-audit.md` or to an owner decision in the
Modern Textile Lab plan as it stood before the restart.

---

## 1. The public route map

| Route | Status | Purpose |
| --- | --- | --- |
| `/[locale]` | rebuilt | Router / decision / proof — 8 sections |
| `/[locale]/courses` | rebuilt | Product catalogue, all 11 courses, real-taxonomy filters |
| `/[locale]/courses/[slug]` | rebuilt | Decision-first course detail with a section rail |
| **`/[locale]/batches`** | **new** | Real live batches, decision-first, honest empty state |
| `/[locale]/admission` | restyled | The multi-step form. Every security contract unchanged |
| `/[locale]/admissions` | kept | Admission norms, fees policy, the demo, the FAQ |
| `/[locale]/student-work` | rebuilt | Editorial gallery |
| `/[locale]/notes` | rebuilt | Machine Notes knowledge hub with search + filters |
| `/[locale]/notes/[slug]` | restyled | One note |
| `/[locale]/services` | rebuilt | B2B, the one charcoal hero |
| `/[locale]/about` | rebuilt | Studio — nav label becomes "Studio", URL stays `/about` |
| `/[locale]/contact` | rebuilt | Visit-first |
| `/[locale]/success-stories` | kept | Student stories |
| `/[locale]/verify` · `/verify/[id]` | kept | Certificate verification |
| `/[locale]/privacy` · `/terms` | kept | Legal, `noIndex` policy unchanged |
| `/[locale]/[...rest]` | kept | 404 |

**No URL is renamed or removed.** `/about` keeps its slug while the navigation
label becomes "Studio" (plan §12) — a display change, not a route change, so
every existing link, sitemap entry and hreflang alternate stays valid.

`/admissions` is kept as §4.2 directs. `/batches` answers "when can I come",
`/admissions` answers "what are the rules" — different questions, and merging
them would delete a working URL to save a nav slot.

### Why `/batches` is a route and not a homepage section

The homepage section shows the next few real batches. A visitor deciding
between a morning and an evening batch needs all of them, filterable, with the
joining sequence underneath. That is a page. The audit found the current site
answers it with a 400px teaser and a 369px block inside `/admissions` —
neither of which can be linked to, filtered, or found from navigation.

---

## 2. The homepage: 20 sections → 8

The audit measured 20 sections, 17,386px inside `<main>`, and found that
padding is 4% of it. The cut is editorial, as §39 directs.

| New section | Replaces | Measured before |
| --- | --- | --- |
| **1. Hero** | `Hero` | 928 |
| **2. Audience routing** | *new* — §3 | — |
| **3. Course explorer** | `CourseCatalogue` | 1476 |
| **4. Screen → Machine → Stitch** | `ProductionRailSection` + `ProductionWorkflow` + `MachineProof` | 2474 |
| **5. Student work** | `StudentWorkWall` + the gallery half of `Proof` | ~1900 |
| **6. Why Karma** | `ProblemsSolved` + `EmcadDecision` + `TrustRail` | 2227 |
| **7. Live batches + free demo** | `BatchesTeaser` + `Investment` | 1432 |
| **8. Studio proof + FAQ + close** | `VisitStudio` + `HomeFaq` + `CtaBand` + `BusinessBand` | 2694 |

### What is deleted from the homepage, and where it goes

| Removed | Why | Where the content lives |
| --- | --- | --- |
| `TrustRail` | Owner-provided social counts are not a homepage argument; the plan's §22 says omit rather than pad | `/about`, where the studio describes itself |
| `EmcadDecision` (1075) | The EMCAD verified facts belong on the course that owns them; on the homepage they read as applying to all eleven | `/courses/emcad-embroidery-design`, condensed into "Why Karma" as one fact |
| `Investment` (1032) | A full fees chapter is a decision page, not a router | `/admissions` + the course detail's Fees section |
| `ProblemsSolved` (842) | One of four sections arguing the machine claim | folded into "Why Karma" |
| `MachineProof` (932) | ditto | folded into Screen → Machine → Stitch |
| `ProductionWorkflow` (967) | ditto | folded into Screen → Machine → Stitch |
| `HomepageStats` | Renders only when the owner publishes verified numbers; currently `null` | stays a `/about` capability |
| `Trainers` (886) | Three `sample: true` profiles. §22: omit rather than fake | `/about`, where the pending state is honest and expected |
| `LatestVideos` (629) | A video shelf is not a decision | `/about` |
| `Reviews` (1041) | Seven `sample: true` reviews. §5.4 forbids fake social proof | omitted from the homepage until real reviews exist |
| `WhereYouLearn` (762) | Duplicates `VisitStudio` | merged into section 8 |
| `BusinessBand` (375) | B2B belongs to the audience router now | section 2, "I need design / production work" |

**Nothing verified is lost.** Every fact removed from the homepage is on the
page that owns it, reachable in one tap from the audience router or the nav.

**Three sample-only sections leave the homepage entirely.** That is the §22
instruction applied literally: a homepage carrying 1,900px of `⚠ Sample` is not
proof, and the honest alternative to fake social proof is no social proof.

---

## 3. Audience routing (homepage section 2)

Three destinations, from §3 of the plan:

| Label | Sub | Goes to |
| --- | --- | --- |
| I want to learn | Courses · demo · batches | `/courses` |
| I already work in embroidery | Advanced techniques · Machine Notes · troubleshooting | `/notes` |
| I need design or production work | Services · digitising · commercial enquiry | `/services` |

**Desktop:** a three-column asymmetric chooser, no giant cards.
**Mobile:** three compact horizontal rows — one line of label, one of sub, an
arrow. Not three full-width cards; the audit's whole finding is that
full-viewport cards are how a homepage reaches 20 sections.

---

## 4. Navigation

### Desktop (≥ `xl`)

```
Karma Design Studio    Courses  Batches  Student Work  Machine Notes  Services  Studio    ◎ EN ▾   Book free demo
```

Six links. The current header carries **eight** (Home, Courses, Admissions,
Student Work, Machine Notes, Services, About, Contact) and the audit found the
row already tight at exactly 1280 with a comment in the source saying so.

Dropped from the desktop row, per §12:

- **Home** — the wordmark is the home link. A "Home" item next to a clickable
  wordmark is one of two things doing one job.
- **Admissions** — reachable from `/batches` (the joining sequence), from every
  course page (Fees) and from the footer. `/batches` is the question people
  actually navigate for.
- **Contact** — §12 permits this explicitly when contact is prominent in the
  mobile menu, footer and Studio/Visit pathways. It is in all three, plus the
  contextual WhatsApp bar.

`Studio` routes to `/about`.

### Mobile header — 56px

```
Karma Design Studio        ◎ EN     ☰
```

Three slots. Icons may be small; hit areas stay ≥44px.

### Mobile menu — seven rows + anchored CTA

```
Courses
Batches
Student Work
Machine Notes
Services
Studio
Contact
─────────────
[ Book free demo ]
```

Rows ~48–52px. `Book free demo` anchored at the bottom of the sheet, not
floating in the middle of the list where it competes with navigation.

---

## 5. Language selector

Never a flag. Three choices in every surface: **English · ગુજરાતી · हिन्दी**.

**Desktop:** a compact control reading `◎ EN ▾` that opens a popover.
**Mobile:** the same control sits in the 56px header and opens a **bottom
sheet** with large rows, each carrying a native-script preview line.

Behaviour, from §13:

- switching preserves the current route
- the explicit choice is persisted (the existing `kds-lang-choice` key)
- no browser-language auto-redirect — `localeDetection: false` stays
- `<html lang>` follows the locale
- hreflang carries all three plus `x-default`
- the navigation labels themselves are translated

The current `LanguageToggle` is an EN | ગુ segmented pill hardcoded to two
values. It is replaced, not extended: three items do not fit a pill, and a
pill cannot carry the native-script preview §13 asks for.

---

## 6. Contextual conversion chrome

§4.3 supersedes the site-wide `Call + Directions` bar.

### The policy

| Route | Sticky bar | Actions |
| --- | --- | --- |
| `/courses/[slug]` | yes | **Book free demo** · WhatsApp |
| `/admission` | yes | the form's own Next/Submit (`.form-nav`) — no second bar |
| `/batches` | yes | **Book free demo** · WhatsApp |
| `/admissions` | yes | **Book free demo** · WhatsApp |
| `/contact` | no | Call, WhatsApp and Directions are the page's own first-viewport content |
| everything else | no | — |

A general information page does not get a fixed bar merely because the
component exists (§32). `/contact` explicitly does not: a fixed bar duplicating
the three buttons already in its first viewport is chrome covering content.

### What survives from the old contract, unchanged

1. `site.callPhone` and `site.whatsapp` stay different numbers with different
   roles. **WhatsApp is never opened on the call number**, and the call number
   is never labelled WhatsApp — the roles are still unconfirmed
   (`docs/content-checklist.md`).
2. Call and Directions stay prominent on `/contact`, in the mobile menu and in
   the footer. They are not removed from the site; they stop being the *only*
   two actions on every page.
3. Analytics carries no PII. The allowed context keys are unchanged.
4. The bar's height and the space reserved for it read the same token.
5. Every target clears 44px.
6. The bar is actions, not navigation.

### What changes

The bar is **contextual, not site-wide**, and its actions are **demo and
WhatsApp, not call and directions**, on the four decision routes above.

`tests/mobile-conversion.test.ts` and `tests/machine-lab-shell.test.tsx` are
rewritten to guard the new rule — including a new assertion that the bar does
**not** appear on general information routes, which the old site-wide policy
could not express.

---

## 7. Route integrity rules

Enforced mechanically:

- every route in §1 resolves in all three locales
- no `href` in a public component points at a route that does not exist
- the locale switcher preserves the path
- the sitemap enumerates `routing.locales` (it already derives, so it follows)
- `pageMeta()` emits `en` / `gu` / `hi` / `x-default` for every indexable page
- `/about` keeps its URL while displaying as "Studio"
- `/admissions` and `/batches` both exist and neither redirects to the other
