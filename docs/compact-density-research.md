# Compact density research

**For:** `docs/karma-compact-density-redesign-plan.md` §32
**Written:** 2026-08-31
**Status:** the reference note the compact-density phases are built from

The plan asks for research into "current high-quality mobile products and
operations apps for **principles**, not imitation," and for every borrowed
principle to be written down with **how it is adapted to Karma**. This is that
note.

## Method, stated honestly

This is a **principles review**, not a competitive teardown. Nothing here was
obtained by inspecting another company's code, and no screenshot, asset,
colour, typeface or composition was copied. What is recorded is the *reasoning*
behind patterns that are, by now, common property of mobile product design —
plus the one thing that actually matters here, which is what each principle
costs or buys **in this repository**, against this audience, with these
constraints.

Where a principle would be right in general and wrong for Karma, that is
recorded too. Those entries are the useful half of the document.

## The two audiences the density has to serve

Everything below resolves to one of these two people, and they want opposite
things from a screen.

| | Public visitor | Karma staff |
| --- | --- | --- |
| Device | A phone, arriving from an Instagram or Facebook link | A phone, standing between a machine and the counter |
| Session | 30–90 seconds, once | Many times a day, for months |
| Wants | To decide whether this place is real and worth a call | To finish one task without losing their place |
| Cost of a wasted viewport | They leave | They scroll again, twenty times a day |
| Reads | Gujarati first, mostly | Gujarati and English, mixed |

The public site is a **decision surface**. The console is a **work surface**.
Density means different things to them: for the visitor it means *the facts
arrive sooner*; for staff it means *more records per screen*.

---

# Part 1 — Principles borrowed, and how each is adapted

## 1. The first viewport is a budget, not a canvas

**The principle.** Good mobile products treat the first screen as a fixed
allowance of roughly 844 CSS pixels minus browser chrome, and spend it on
things the user came for. A hero that spends the whole allowance on a headline
and one button has spent the budget on the product's own self-image.

**Adapted to Karma.** The public homepage's first viewport must carry the
studio's identity *and* its verified facts *and* a way to act. The plan names
the exact contents: the `EMCAD DAHAO · REAL MACHINE · SURAT` notation, `FROM
SCREEN TO STITCH.`, one supporting line, `3 Months · 2-Day Free Demo · Live
Machine`, the demo CTA, and the start of the Screen → Machine → Result story.

The adaptation that is specific to us: **the facts in that budget belong to one
course.** `3 Months` and the free demo are EMCAD DAHAO's, confirmed in writing;
the other ten courses have no confirmed duration and no published fee. So the
compact fact rail must name its course, or the compression will have published
ten unverified claims by proximity. Density is not permission to drop a
qualifier.

## 2. Rows beat cards when the list is the point

**The principle.** A card is a container that says "these things belong
together and are separate from those things." When every item on a screen is a
card, the container stops carrying information and starts carrying padding. A
hairline-separated row communicates the same grouping for the cost of one
pixel, and three or four times as many rows fit.

**Adapted to Karma.** This is already half-done and was already right: `.ledger`
/ `.ledger-row` on the public site and `.data-list` / `.data-row` in the console
exist precisely because "the site kept answering every new question with another
grid of identical cards." The compact pass extends the same instinct into the
places that still card: public proof items, course-detail sub-sections, the
admin metric tiles and the module edit surfaces.

The Karma-specific limit: **a card still earns its place where media leads.**
The material wall's six frames carry six different aspect ratios on purpose,
because flattening a bridal panel and a dupatta into a uniform tile throws away
the one thing worth showing about textile work. Rows replace cards that hold
*text*; they do not replace frames that hold *cloth*.

## 3. A record row should answer, not merely name

**The principle.** In an operations app, a list row that shows only a name
forces a tap to learn anything. The rows that work carry the identity, the
state, the number that decides what happens next, and the one or two actions
that are actually taken from a list.

**Adapted to Karma.** The plan's own example shape is the target:

```
EMCAD DAHAO                 RUNNING ●
12:00–04:00 · 18 students
₹40,000 due · 2 absent today
Attendance   Fees   More
```

Three Karma-specific constraints shape it:

- **The data must be real.** Any field added to a row has to come from a query
  that already runs or from a bounded addition to it. Two unbounded console
  reads were found and fixed during the previous redesign; a denser row is
  exactly the change that reintroduces them.
- **A status is never colour alone.** A dot *and* a word, always. Staff read
  these at a counter in daylight, and one of them may be colour-blind.
- **No phone number in a scannable queue row.** A queue is read in public, next
  to the person it is about. The action can dial; the row does not print.

## 4. Persistent bottom navigation is for products, not for websites

**The principle.** A bottom bar is worth its ~56px when the destinations behind
it are visited many times per session. It is dead weight when they are visited
once. The test is frequency, not importance.

**Adapted to Karma — and this is where the two halves of the repo diverge.**

- **Karma Console gets one.** Staff hit Today, then a module, then back to
  Today, dozens of times a shift. Opening a hamburger for each of those is the
  single largest motion cost in the product.
- **The public site does not, and this is deliberate.** The existing mobile bar
  carries exactly **two actions — Call for demo and Directions** — and it is
  not navigation. A visitor navigates the public site roughly twice; they
  convert once. Turning that bar into a five-tab app bar would trade the two
  things that convert for five things that do not. The plan says the same
  thing in §23. The two-action bar stays.

The console bottom nav must be **permission-aware**, and the rule is stricter
than "hide what you cannot use": a destination the caller cannot reach must not
occupy one of four or five slots at all, because a dead tab in a bar of five is
20% of the product's navigation. Hidden navigation remains UX only — every page
and every server action still re-checks.

## 5. Horizontal scroll for peers, vertical scroll for the list

**The principle.** A set of sibling filters — statuses, date windows, course
names — wraps into three tall rows on a phone if it is allowed to wrap. A
single horizontally scrollable strip costs one row and scales to any number of
options.

**Adapted to Karma.** Status filters, batch/course filters and the admissions
pipeline are the right candidates. Two adaptations:

- **Gujarati chips are wider than English chips.** A strip that fits five
  English statuses fits three Gujarati ones. Horizontal scroll is what makes
  that a non-event instead of a layout bug — which is a reason to prefer it
  here beyond the general case.
- **A horizontal scroller must be keyboard-reachable and must not eat the
  gutter.** `.bleed-row` already derives its negative margin from
  `--container-pad`; a hardcoded value previously leaked 2px of horizontal
  overflow at 320px.

## 6. Bottom sheets instead of navigating away

**The principle.** Opening a full page to reveal three secondary fields loses
the user's scroll position and their place in the list. A sheet keeps the
context underneath.

**Adapted to Karma.** `.rec-menu` already does exactly this — one `<details>`
element that renders as a dropdown on a laptop and a bottom sheet on a phone,
with no dependency and no focus-trap library. The compact pass extends the same
element to filters and secondary record operations rather than introducing a
second mechanism.

**What must not move into a sheet:** permanent deletion. It keeps its own page,
because the operator has to see the dependency counts before confirming, and a
dependency count is a query that must not run for every row of a list. The
typed confirmation and the written reason stay exactly as they are.

## 7. Compact visuals, comfortable targets

**The principle.** Density and tappability are usually presented as a
trade-off. They are not: the *visible* element and the *hit* area are separate
boxes. A 20px icon in a 44px target is dense and comfortable at once.

**Adapted to Karma.** Already the established resolution, and it is the part to
keep: rows are visually tight — a two-line row is ~64px — while every
interactive control inside one keeps a ≥44px hit area, using padding that
overflows the row rather than a taller row. `tests/console-density.test.ts`
pins it. Every new compact primitive in this redesign inherits the same rule,
and the test sweep must be extended to cover it rather than narrowed.

## 8. Progressive disclosure, with a floor

**The principle.** Secondary detail should not permanently occupy prime space.
Accordions, tabs, "view all" and expandable rows buy back the viewport.

**Adapted to Karma — the floor matters more than the technique.** Some things
may never be collapsed behind a tap, because collapsing them changes what the
user is agreeing to or deciding:

- the sample tag on sample content;
- the "these figures are EMCAD DAHAO's only" qualifier;
- the consent checkboxes and the admission-norms version on the form;
- the "no payment gateway, no UPI request" statement, which is where somebody
  hunting for a pay button looks;
- the dependency counts on the deletion page.

The fifteen admission clauses themselves *are* legitimately collapsible, and
already are: they render as a server component inside a native `<details>`,
because two languages of legal text is several kilobytes for a checkbox to
reference and the Worker has a size budget.

## 9. Tablet is a third composition, not a wide phone

**The principle.** The common failure is two layouts and a stretch: the phone
layout runs to 1024px and then the desktop layout appears. The 768–1024 band
gets a phone layout with 400px of empty margin.

**Adapted to Karma.** At 768–1024 the console should show a compact rail *and* a
list, and the public site should run two-column fact layouts. The specific trap
here is already documented: **the header's desktop navigation appears at
1280px and the mobile bar hides at exactly 1280px.** Those breakpoints are
paired on purpose; changing one leaves a range with neither navigation nor
actions. Any tablet work has to move both or neither.

## 10. Desktop should spend width on information

**The principle.** More screen is an invitation to show more, not to grow the
type and the padding.

**Adapted to Karma.** Fees, admissions and students become genuinely tabular at
≥1024px; Today gains a second column. The constraint that shapes it: **no chart
library, no admin UI suite, no component kit.** The Worker is 2011 KiB gzip
against a 3 MB free-plan limit, and the previous fourteen-phase redesign cost
~80 KiB and no new dependency. A denser desktop is a CSS grid change, not a
data-grid package.

---

# Part 2 — Principles deliberately NOT borrowed

These are things good mobile products do that Karma should not do, and the
reason is written down so a later session does not "improve" the site back
into them.

| Not borrowed | Why not, here |
| --- | --- |
| **Five-tab public app navigation** | The public site converts on two actions. Navigation is not the job of a visitor's thumb; calling is. |
| **Skeleton shimmer everywhere** | The loading state deliberately animates nothing, and `/verify` deliberately has no reveal at all. Restraint is the credibility on a verification page. |
| **A dashboard of KPI tiles** | Today at Karma is a work desk. Four capped queues with the count heading each queue replaced seven metric cards for a reason: the screen should say what needs attention today, not admire itself. |
| **Dark mode / dark chrome as "premium"** | This whole redesign exists because the owner rejected the dark treatment. A dark admin theme would reintroduce it through the back door. |
| **Frosted glass on every card** | There is exactly one glass treatment and deliberately no card variant. A second frosted panel on a screen is the signal that the first one stopped meaning anything. |
| **Infinite scroll on operational lists** | Staff need "how many are there" more than they need seamless scrolling, and an unbounded list is an unbounded query. Capped lists with a count stay. |
| **Swipe-to-action on rows** | Undiscoverable, unreachable by keyboard, and destructive actions here are Owner-only with a typed confirmation. The `More` sheet is the honest control. |
| **Toast-only confirmation of a mutation** | Fees, attendance locks and deletions write audit rows; the interface should show the resulting state, not a message that disappears. |
| **Numeric "engagement" chrome** — badge counts on everything | A badge is a claim. Karma publishes no unverified number, and an invented count is the same class of mistake as an invented statistic. Counts appear where a real query produced them. |

---

# Part 3 — What "light-first" borrows, and from where

The owner's first decision — no large black public sections — is a colour
decision, but the useful research question is *what carries technical
credibility once the black is gone*, because black panels were doing that work.

**The principle.** Technical seriousness in print and in interface design is
carried far more by **structure** than by darkness: hairlines, tabular figures,
notation, registration marks, consistent grids, restrained accent use, and
labels that name real quantities. Engineering drawings, machine manuals,
specification sheets and lab notation are almost all dark-ink-on-light-paper.
The dark-slab convention in web design is a fashion, not a signal.

**Adapted to Karma.** The identity survives the lightening because it never
lived in the black:

| Carried the identity | Depended on black |
| --- | --- |
| The 9-on / 6-off running stitch with a penetration dot at every stitch head | — |
| Six canonical stitch marks with fixed meanings | — |
| Eleven technique signatures, one per course | — |
| Machine notation (`01 DESIGN`, `EMCAD / PATH`) on the platform monospace stack | — |
| Tabular figures on every number | — |
| Hairlines over shadows; one vermilion accent | — |
| Material textures at 2–5% | The `.on-dark` texture inversion |
| | `.on-carbon` token re-pointing, `needle-light`, the hero plate |

Only the right-hand column has to be rebuilt. That is the whole scope of the
light-first change, and it is why the plan can call it a **visual** decision and
still insist the creative idea is preserved.

**Steel Mist** is the piece that has to be invented rather than adapted: a pale,
desaturated blue-grey derived from Steel Indigo, warm enough to sit beside
Cotton and Raw Silk without reading as a cold web-app grey, and light enough
that carbon body text clears AAA on it. It replaces `.on-carbon` wherever the
old dark band meant "this is the technical/software register" — the EMCAD
context, CAD and register overlays, technical notes — and it is a **surface that
owns its own text colours**, the same mechanism `.bg-sand` already uses, so no
component or call site has to know which band it is sitting in.

---

# Part 4 — The Swiggy question, answered precisely

The plan names Swiggy as a reference for "spacing, hierarchy, grouping and task
access — never as a branding or layout copy," and bans copying its branding,
colours, graphics, navigation, cards, illustrations or layout details.

What is genuinely worth learning from that class of app — high-frequency,
transactional, Indian-market, used one-handed on a mid-range phone — is not any
particular screen. It is four habits:

1. **The screen tells you where you are in one short line, not a masthead.**
2. **The next action is always within thumb reach**, and it is the same action
   the screen is about.
3. **Status is a small, high-contrast marker attached to the record**, not a
   separate column or a legend.
4. **Filters are peers on one scrollable line**, so the list starts high on the
   screen.

All four are structural. None of them requires a colour, an icon, a typeface,
a radius or a composition from anyone else, and Karma expresses all four in its
own language: the stitch marks, the one vermilion accent, hairlines instead of
shadows, machine notation instead of app chrome, and institute vocabulary
(enquiry, follow-up, batch, હાજરી, receipt) instead of ERP vocabulary.

The bar for every borrowed habit in this document is the same: **if removing
Karma's own visual language left the screen still recognisable as somebody
else's product, the borrowing went too far.**

---

# Part 5 — Education and training sites: what to avoid

The plan also asks for a look at current education/training sites, specifically
to understand what Karma should *avoid*. The pattern set is consistent and
mostly cautionary:

| Common pattern | Why Karma avoids it |
| --- | --- |
| Hero with a stock photograph of smiling students | No stock photography, ever. The 32 reserved frames stay honest, labelled and empty until the real files arrive. |
| "500+ students · 98% satisfaction · 15+ instructors" stat band | Every one of those numbers on the old template site was filler, some of it from the wrong city. Unverified numbers stay out of the site and out of structured data. |
| Star ratings and testimonial carousels in the hero | The owner-provided Google rating is attributed to Google and never enters `AggregateRating`; sample testimonials carry a visible tag. |
| Course cards with "lessons · hours · rating" | Ten of eleven courses have no confirmed duration. A card template with a duration slot is a template that invents one. |
| A prominent "Enroll now — ₹X" price/checkout | There is no payment gateway and there will not be one. Fees are discussed offline. |
| "Placement assistance" / salary outcomes | No placement, salary or earnings claim appears in any story. |
| Endless FAQ accordions as page filler | FAQs are real content from the Content Desk with source fallbacks, not rhythm. |

The one thing worth taking from the category: **practical facts belong high on
the page.** Prospective students want the duration, the fee, the timings and
whether there is a trial before they want the philosophy. Karma can do that
better than the category because, for EMCAD DAHAO, it actually has the facts —
and it can be honest that for the other ten it does not yet.

---

# Part 6 — The measurements this note is calibrated against

The plan's targets, restated as the numbers the implementation phases are held
to. Anything outside these ranges needs a reason written next to it.

| | Public mobile | Admin mobile |
| --- | --- | --- |
| Largest heading | 30–36px (hero only) | 22–26px (page title) |
| Section heading | 18–22px | 17–20px |
| Record/card title | 15–18px | 14–17px |
| Body | 14–16px | 13–15px |
| Metadata | 12–14px | 11–13px |
| Eyebrow / notation | 11–13px | 11–13px |
| Buttons | 13–16px | 13–15px |
| Card / row padding | 12–18px | 10–14px |
| Section gap | 20–32px | 12–24px |
| Spacing scale | 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 | same |
| Touch target | ≥44px | ≥44px |

Two numbers are floors, not targets, and may never be traded for density:
**≥44px hit areas** and **Gujarati line-height**. Gujarati sets taller than
Latin because its vowel marks sit above and below the baseline; compressing its
leading to gain a row is the one compaction that makes the product worse for
most of its actual audience.
