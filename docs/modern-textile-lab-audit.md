# Modern Textile Lab — Phase 1 audit

**Date:** 2026-08-31
**Baseline:** `main` at `9670bc5` (after PR #54 added the plan)
**Method:** production `next start` driven through Chromium — the container's own
binary, via `playwright-core` installed *outside* the repository so
`package.json` and the CI install stay untouched, exactly as the compact-density
pass did. 100 screenshots captured at 390 / 768 / 1024 / 1440 across 25 routes
in both current locales, plus per-section geometry for every route.

Nothing in this document is estimated. Every number is a rendered box.

---

## 1. What the public site is today

Sixteen public route templates, two locales, and one homepage carrying twenty
sections.

| Route | 390 | 768 | 1024 | 1440 | sections @390 |
| --- | --- | --- | --- | --- | --- |
| `/en` | **18381** | 16642 | 16625 | 17009 | **20** |
| `/en/services` | 11653 | 9133 | 7382 | 7734 | 10 |
| `/en/courses/emcad-embroidery-design` | 9207 | 7637 | 6791 | 6968 | 14 |
| `/en/about` | 8477 | 8503 | 5025 | 5461 | 6 |
| `/en/student-work` | 7311 | 7110 | 6992 | 6489 | 5 |
| `/en/success-stories` | 6821 | 5941 | 4557 | 4391 | 5 |
| `/en/courses/zardosi-machine-embroidery` | 6418 | 5573 | 5173 | 5405 | 13 |
| `/en/admissions` | 6352 | 5547 | 4958 | 5087 | 9 |
| `/en/courses` | 4940 | 4621 | 4172 | 4345 | 7 |
| `/en/notes/why-one-software` | 3571 | 3117 | 2341 | 2397 | 5 |
| `/en/notes` | 3109 | 2815 | 2100 | 2205 | 2 |
| `/en/contact` | 2826 | 2717 | 2015 | 2130 | 2 |
| `/en/privacy` | 2193 | 1931 | 1808 | 1918 | 2 |
| `/en/admission` | 2126 | 2053 | 1856 | 1923 | 3 |
| `/en/terms` | 1604 | 1485 | 1318 | 1398 | 2 |
| `/en/verify` | 1465 | 1363 | 1133 | 1215 | 2 |

Gujarati runs 3–6% shorter on prose-heavy routes and marginally longer on
label-dense ones, as the compact-density pass measured and corrected.

**No horizontal overflow at any width on any route.** The compact-density work
left the responsive foundation sound; this redesign is not a rescue.

---

## 2. The homepage, section by section, measured

Twenty `<section>` elements totalling **17,386px inside `<main>`** at 390px.
This is the object the plan's §39 editorial decision acts on.

| # | Component | h @390 | h @1440 | Heading |
| --- | --- | --- | --- | --- |
| 1 | `Hero` | 928 | 1343 | Commercial embroidery training · Mota Varachha |
| 2 | `TrustRail` | 310 | 189 | What people already see |
| 3 | `EmcadDecision` | 1075 | 760 | The one course with confirmed numbers |
| 4 | `Investment` | 1032 | 631 | Fees |
| 5 | `ProductionRailSection` | 575 | 742 | Screen to stitch |
| 6 | `CourseCatalogue` | 1476 | 1397 | The catalogue |
| 7 | `BatchesTeaser` | 400 | 271 | Find a batch that fits your schedule |
| 8 | `ProblemsSolved` | 842 | 825 | Why people come here |
| 9 | `MachineProof` | 932 | 770 | Proof from the machine |
| 10 | `ProductionWorkflow` | 967 | 682 | The production workflow |
| 11 | `StudentWorkWall` | 995 | 1841 | Off the machine |
| 12 | `Proof` | 1842 | 1237 | Made in class. Built with real skills. |
| 13 | `Trainers` | 886 | 1047 | The people on the machine floor |
| 14 | `WhereYouLearn` | 762 | 1527 | Where you actually learn |
| 15 | `LatestVideos` | 629 | 492 | Latest from the studio |
| 16 | `Reviews` | 1041 | 564 | What people say |
| 17 | `VisitStudio` | 1124 | 728 | The studio |
| 18 | `HomeFaq` | 837 | 585 | The questions people ask before they come |
| 19 | `BusinessBand` | 375 | 330 | For garment businesses |
| 20 | `CtaBand` | 358 | 345 | Your design should not stop at the screen |

### What the measurement says that reading the file does not

**Section padding is not the problem, and was already proved not to be.** At
390px the three section tiers are 32/24/16px; twenty sections × ~40px is ~800px
of a 18,381px page — **4%**. The remaining 96% is content. The only lever left
is the one the plan pulls: *fewer sections*.

**Four sections are the same argument told four times.** `EmcadDecision` (1075),
`ProblemsSolved` (842), `MachineProof` (932) and `ProductionWorkflow` (967) all
answer "why should I trust the machine claim" — 3,816px, 4.5 viewports, for one
idea. `Proof` (1842) and `StudentWorkWall` (995) both show student output;
`Trainers` (886) and `VisitStudio` (1124) both show the studio.

**Three sections carry only sample content.** `Reviews` (1041), `Trainers` (886)
and part of `Proof` render `sample: true` records behind a visible `⚠ Sample`
tag. That is 1,900px+ of the homepage waiting on the owner. The plan's §22 says
to omit rather than fake — which for the homepage means these do not survive as
standalone sections.

---

## 3. Locale system — the single biggest implementation fact

`src/i18n/routing.ts` declares `locales: ["en", "gu"]` and derives
`export type Locale = (typeof routing.locales)[number]`. That is the clean part.

The unclean part is measured: **135 occurrences across 46 files** of the
hardcoded two-locale assumption, in the shape

```ts
locale === "gu" ? course.nameGu : course.nameEn
```

Files affected include every public page template, most `src/components/home/*`,
`src/components/site/*`, `src/components/course/*` and `src/components/work/*` —
and, separately, six Karma Console files that must **not** be swept into a
public-locale change (`SheetParts`, `PrintSheet`, `LocaleToggle`, and three
console pages). The Console's `AdminLocale` is its own two-value type and stays
that way: staff choose EN or GU, and Hindi is a *public* decision.

**Consequence for Phase 4.** Turning 135 two-way ternaries into 135 three-way
ternaries is the failure mode the plan's §36 names. The work is a typed
localized-content accessor — one helper that resolves `{en, gu, hi}` (and the
legacy `*En`/`*Gu` field-pair convention) against a `PublicLocale` — applied
across the content layer, so adding a fourth locale later is a data change
rather than another 135-site edit.

**Other locale-coupled surfaces found:**

- `src/lib/seo.ts` `pageMeta()` hardcodes exactly two `languages` alternates
  plus `x-default`, and `openGraph.locale` is a binary `locale === "gu" ?
  "gu_IN" : "en_IN"`.
- `src/app/[locale]/layout.tsx` builds `studioSchema(locale === "gu" ? "gu" : "en")`.
- `src/app/sitemap.ts` enumerates `routing.locales` (correct — it follows).
- `middleware.ts` splits `/admin` from the intl handler correctly and needs no
  change beyond inheriting the new locale list.
- Fonts: `@fontsource-variable/manrope` and a hand-written `@font-face` for
  `Noto Sans Gujarati Variable` with an explicit `unicode-range`. Hindi needs
  `@fontsource-variable/noto-sans-devanagari` and a matching narrow range —
  note the existing Gujarati range already claims `U+0951-0952` and
  `U+0964-0965`, which are **Devanagari-shared marks**, so the two ranges must
  be reconciled rather than stacked.

---

## 4. Batches — the fact that shapes Phase 6

The public site has **no batches route**. `BatchesTeaser` (400px) on the
homepage and a 369px block on `/admissions` are the only public batch surfaces.

`src/lib/db/queries.ts` `getUpcomingBatches()` is already correct in the way
that matters: it filters `status = 'open'`, future `startDate`, non-archived
batch and non-archived course in SQL before `LIMIT`, and in production returns
`{ rows: [], unavailable: true }` rather than fiction.

But `src/content/courses.ts` exports `sampleBatches()`, which **fabricates**:

```
["tufting", "Sat-Sun", "11:00", "14:00", 21, 6]
```

— a weekend batch, a seat count, a taken count, a start date and
`language: "ગુજરાતી + Hindi"`, per row. It is gated behind `demoModeAllowed`
(non-production only), so nothing false reaches production today. The plan's
§4.2 and §5.5 forbid exactly this shape of data on the new public route, and
§25 forbids a Weekend filter with no real weekend rows — `sampleBatches`
contains the only "Sat-Sun" string in the repository.

**Decision recorded for Phase 6:** the public `/[locale]/batches` route reads
`getUpcomingBatches()` and renders **only** real rows. Filters are derived from
the rows actually returned, so a Weekend chip cannot exist without a weekend
row. `sampleBatches` stays available to non-production preview only, and the
new route will not call it.

The `batches` table supplies `label`, `days`, `startTime`, `endTime`,
`startDate`, `seats`, `seatsTaken`, `language`, joined to `courses` for
`slug`/`nameEn`/`nameGu` — every field the plan's §25 lists is real when
present, and each renders conditionally.

---

## 5. Course taxonomy — real, and it already matches the plan

`src/content/courses.ts` types `family: "machine" | "modern" | "software"` with
`FAMILY_ORDER = ["machine", "modern", "software"]` and an owner-decided
`COURSE_DISPLAY_ORDER` (Zardosi leads, by explicit decision on 2026-08-29).

Counts: **machine 8 · modern 2 · software 1 = 11.**

The plan's §17 asks for homepage categories "Machine / Special Techniques /
Software". That is this taxonomy, already in source, already ordered, already
tested by `tests/catalog-import.test.ts`. **No new classification is needed and
none will be invented** — the homepage explorer will read `coursesInFamily()`
and `COURSE_DISPLAY_ORDER`, which is also what stops "popular" from appearing.

---

## 6. Mobile conversion — what the owner's decision actually displaces

`src/components/site/MobileTabBar.tsx` renders a fixed two-action bar on **every
public page** below `xl`: Call (`tel:+${site.callPhone}`) and Directions
(`site.mapsUrl`). It emits `call_demo_click` and `directions_click` with
`{ surface, locale }` and no PII.

It is guarded by:

- `tests/mobile-conversion.test.ts` — asserts the bar contains exactly
  `call_demo_click` and `directions_click`, that it has no route links, and
  that `.tabbar` / `.tabbar-item` clear WCAG 2.5.5.
- `tests/machine-lab-shell.test.tsx:278–281` — asserts exactly two
  `tabbar-item`s and that the `tabbar` message namespace has exactly the keys
  `["call", "directions", "label"]`.
- `tests/hardening.test.ts:131` and three compact-density suites — assert
  `.site-body` reserves `--tabbar-h` so the bar never covers content.

**These are the tests the brief means when it says a test should guard intent,
not fossilize an obsolete decision.** The owner has replaced the site-wide
Call + Directions policy with a contextual **Book free demo | WhatsApp** bar on
high-intent routes. The *intent* worth keeping from every assertion above is:

1. the two published numbers keep their separate roles (`callPhone` ≠
   `whatsapp`, and WhatsApp is never opened on the call number) — **unchanged,
   and the phone-role protection is strengthened, not relaxed**;
2. analytics carries no PII — **unchanged**;
3. the bar's height and the space reserved for it are one token — **unchanged**;
4. the bar's targets clear 44px — **unchanged**;
5. the bar is actions, not navigation — **unchanged**.

What changes is *which* actions and *which* routes. Phase 2 records the route
policy; Phase 4/6 implement it and rewrite the assertions to the new rule.

---

## 7. Dark surfaces — where the one allowed exception lands

The compact-density pass measured the public site at zero large dark surfaces:
across twelve routes at 390px, nothing with luminance ≤ 0.45 over ≥ 15,000px²
except five vermilion buttons. `.on-carbon` remains *defined* and unused,
deliberately, for precisely the case the new plan now authorises.

`/services` today opens with a 555px `page-intro` on the normal light ground.
The plan's §4.4 and §29 make its hero the **one** Deep Charcoal (`#202321`)
business-mode surface. `.on-carbon` is the existing correct light-on-dark
implementation and will carry it, which is why deleting it two phases ago would
have been the wrong call.

The existing test that asserts no large dark public band must be updated to
assert *exactly one*, on `/services`, rather than *none* — and to keep failing
if a dark band reappears on the homepage, the footer or a course page.

---

## 8. Photography — confirmed intact

`src/content/photo-manifest.ts`: **32 slots defined, `PHOTO_COUNT = 32`, 0
filled.** Groups: hero 3, course 8, work 6, trainer 3, studio 6, story 2,
process 3, floor 1.

Three courses (Flat Embroidery, Appliqué & 3D, Cross Stitch) deliberately have
no photograph and are carried by their technique signature — they are not
dropped and they do not borrow another course's image.

The process triptych `P1_DESIGN` / `P2_MACHINE` / `P3_RESULT` is specified as
**the same project** in all three states. That is the media the plan's §18
Screen → Machine → Stitch interaction is built on, and it already exists as a
contract.

No slot will be added, removed or re-ratioed by this redesign.

---

## 9. Stylesheet cascade and the Console boundary

Three unlayered-after-layered stylesheets, imported in order by
`src/app/[locale]/layout.tsx`:

```
globals.css   (@layer, @theme tokens)   ← ALSO imported by src/app/admin/layout.tsx
premium.css   (unlayered)               ← ALSO imported by the Console
machine-lab.css (unlayered)             ← public only
```

`globals.css` and `premium.css` are **shared with Karma Console**. Every
`--color-*`, `--text-*`, `--section-*`, `--header-h`, `--console-*` token, and
every `.panel` / `.data-row` / `.console-*` / `.btn` / `.input` primitive lives
in one of those two files.

**This is the constraint that decides Phase 3's architecture.** The plan's §7
and §44 both say to prefer a public-scoped layer over retuning shared tokens,
and the measurement agrees: retuning `--color-ivory` or the `--text-*` scale
would restyle 18 Console screens that were deliberately tuned four PRs ago.

**Decision recorded for Phase 3:** a fourth stylesheet,
`src/app/textile-lab.css`, imported **only** by the public locale layout, after
`machine-lab.css`. It declares the Modern Textile Lab palette and type scale as
its own tokens scoped to a public root class, and overrides public primitives
within that scope. `globals.css` and `premium.css` are edited only where a
change is provably public-only. A test will assert the Console's computed
tokens are unchanged.

---

## 10. What Phase 1 found that changes the plan's assumptions

1. **The course taxonomy the plan asks for already exists** (`machine` /
   `modern` / `software`). No new classification, and the homepage explorer can
   be built on tested source order rather than an invented "popular" set.
2. **`sampleBatches()` is the only fake-weekend data in the repository** and is
   already production-gated. The new public route simply must not call it — no
   deletion, no migration, no new query needed beyond `getUpcomingBatches`.
3. **The bilingual assumption is 135 sites across 46 files**, not a config
   change. Phase 4's real work is a typed content accessor, and six of those
   files are Console files that must be excluded.
4. **The Gujarati `@font-face` `unicode-range` already claims two Devanagari
   blocks** (`U+0951-0952`, `U+0964-0965`). Adding a Devanagari face without
   reconciling that range would give Hindi text its danda and stress marks from
   the Gujarati font.
5. **Section padding is 4% of the homepage.** The plan is right that only an
   editorial cut moves the number, and the measured duplication (four sections
   arguing one point, two showing student work, two showing the studio) says
   exactly where the cut is.
6. **`.on-carbon` survives from the last redesign unused**, which is what makes
   the Services charcoal hero a re-use rather than a re-implementation.

---

## 11. Baseline artefacts

- 100 screenshots at 390/768/1024/1440 across 25 routes, both locales — captured
  to the session scratchpad, not committed (the plan's §38 asks for browser
  tooling to stay outside the package, and binary screenshots are not repository
  content).
- Per-route, per-width geometry: height, section count, per-section height,
  heading text, `<html lang>`, overflow flag.
- The tables in §1 and §2 above are that data.

The same harness re-runs after each route phase and in full at nine widths ×
three locales for Phase 11.
