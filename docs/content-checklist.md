# Content checklist — what only the owner can unblock

> **Read this first.** Everything on the public site falls into exactly one of
> three buckets. The rule that matters: **anything not VERIFIED is kept out of
> structured data**, so no search engine ever repeats a claim the studio has
> not made. `tests/structured-data.test.ts` and
> `tests/proof-sample-policy.test.ts` enforce that mechanically.

## The three buckets, at a glance

### 🔴 SAMPLE — replace before the domain launch
Visible on the site, carrying a visible `⚠ Sample` tag, and marked
`sample: true` in source. Shown deliberately: the owner asked to review the
complete visual system rather than a set of empty frames. **None of it reaches
schema, and none of it may be quoted as fact.**

| What | Count | Where | Replace with |
| --- | --- | --- | --- |
| Reviews | 7 | `sampleReviews` in `src/content/collections.ts` | Real Google reviews, with the reviewer's consent |
| Student stories | 6 | `stories` in the same file | Real, consented outcomes — the six archetypes are the shapes to fill |
| Trainer profiles | 3 | `trainers` in the same file | Owner-confirmed names, roles and specialities, with consent |
| Gallery entries | 6 | `galleryItems` in the same file | Real student and studio work, with consent |
| Studio project types | 3 | `studioProjects` in the same file | Real commissions, only with the client's written permission |

### 🟡 OWNER CONFIRMATION NEEDED — a sentence unblocks each one
Not shown as fact anywhere. The site currently works around each of these by
saying something true instead of guessing.

| Question | What the site does today | What one answer would change |
| --- | --- | --- |
| **Which mobile is answered by a person, and which is WhatsApp-only?** | Publishes both, each labelled by channel; never calls the call number "WhatsApp" | Collapse to one number and simplify every contact surface |
| Course durations — **for the remaining ten** | `durationWeeks: null` / `durationMonths: null`; the page says "confirm with the studio". EMCAD DAHAO is **answered**: 3 months | Print a real duration per course, and let `timeRequired` into schema for it |
| Fees — **for the remaining ten** | No price list; "shared in person at your demo". EMCAD DAHAO is **answered**: ₹35,000 / ₹25,000 / ₹10,000, published in full | Print a fee plan, or keep the deferral deliberately |
| Studio turnaround (B2B) | "Depends on technique, quantity and floor load — tell us your deadline" | Publish a realistic range on the services page |
| Supported machine file formats | "Tell us what your machine takes" | Name the formats the studio actually delivers |
| Exact opening hours | "Open daily · evening batches till 10:30 pm" | A precise `openingHoursSpecification` per day |
| Module topics per course | The shared `draftModules` template, labelled a draft | Real syllabus per technique |
| Google rating as *verified* | Shown as owner-provided, attributed to Google, linked to the listing | Flip `verifiedFacts.googleRating48` and state it as verified |
| Trainer identities | Three sample profiles, tagged | Real people, with consent |
| Terms page | `noIndex: true`, marked "draft: remove after owner review" | Owner approves the wording; remove the flag |

### 🟢 VERIFIED — safe to state, and safe in schema
Corroborated by at least two of: the studio's Google Business pin, its own
social profiles, its JustDial listing, or the owner directly.

- Legal name **Karma Design Studio & Classes**
- Address: 302, Middle Point, Maruti Nandan Society, Mahadev Chowk, Mota
  Varachha, Surat, Gujarat 394101
- Landmark: near Dhara Arcade, opposite Krishna Township Road
- Three phone numbers (roles unconfirmed — see above, but the numbers are real)
- Email, Maps URL, Instagram, Facebook, YouTube, Threads
- The eleven-course catalogue and its slugs
- Evening batches running until 10:30 pm
- Teaching in Gujarati and Hindi
- That every course is taught on live machines

**Also verified, and not sample:** the four machine case notes and the eight
Machine Notes. Every claim in them is ordinary trade knowledge — the same
thing a supervisor tells a new operator — and none names a person, a client or
an outcome. There is nothing in them for the owner to confirm.

---

## Answered by the owner on 2026-08-30 — the EMCAD DAHAO admission material

The owner supplied the institute's own printed admission sheet. Everything
below is now 🟢 VERIFIED **for EMCAD DAHAO Embroidery Designing only**. Do not
apply any of it to another course: the other ten still have no confirmed
duration and no published fee.

| Fact | Value | Where it lives |
| --- | --- | --- |
| The institute's training-centre line | KARMA DESIGN STUDIO · EMCAD DAHAO Embroidery Training Centre | `src/content/course-operations.ts` |
| Course name | EMCAD DAHAO Embroidery Designing | `src/content/courses.ts` |
| Duration | **3 months** — months, never restated as 12 weeks | `courses.durationMonths` |
| Software | **EMCAD DAHAO only** | `courses.software` |
| Batch timings | 08:00–12:00 · 12:00–16:00 · 16:00–20:00 (4 h) · 20:00–23:00 (3 h) | `courses.operations.scheduleOptions` |
| Free demo | 2 days, 2 hours a session; preferred slots 10:00 · 14:00 · 18:00 · 21:00 | `courses.operations.demo` |
| Fees | ₹35,000 total · ₹25,000 at admission · ₹10,000 within one month of joining | `courses.fee_*` |
| What is taught | Multi · Sequence (2–12) · Coding · Beads (2–8) · Laser · Looping · Chain Stitch · Towel Work · Boring · Zardoshi · Ribbon Work | `courses.operations.curriculum` |
| Practical training | 100% live practical machine training · live machine practical · sample making · device connection & setting · machine troubleshooting · production knowledge · practical machine output | `courses.operations.practical` |
| Admission norms | 15 clauses, Gujarati original + English translation, version 1 | `src/content/admission-terms.ts` |
| Student declaration | Gujarati original + English translation | same file |

### The Wilcom claims, and what happened to them

The institute states plainly: **માત્ર EMCAD DAHAO Software ની જ તાલીમ આપવામાં
આવે છે** — only EMCAD DAHAO is taught — and norm #3 asks students not to spend
the trainer's time asking about other packages. Before 2026-08-30 the site did
the opposite in four places, all now corrected:

| Where | Was | Now |
| --- | --- | --- |
| `src/content/notes.ts` | A note `emcad-or-wilcom` tagged "Wilcom embroidery training Surat" | Rewritten as `why-one-software`, about learning one package properly. The old URL 301s. |
| `src/content/collections.ts` | FAQ "Which software do you teach — emCAD or Wilcom?" | "Which software do you teach?" → EMCAD DAHAO, and no other |
| `src/content/courses.ts` | `production.softwareEn/Gu` explained what transfers to Wilcom | Names EMCAD DAHAO and nothing else |
| `messages/{en,gu}.json` | The notes-index description ended "emCAD and Wilcom" | "…and designing on EMCAD DAHAO" |

`tests/machine-notes.test.ts` now fails if the word reappears in the notes. The
one place it may legitimately appear is the institute's own rule, quoted
verbatim in `src/content/admission-terms.ts`.

## Contact audit (Phase 10)

Checked for consistency across every surface that shows contact details —
header, footer, hero, course pages, services, contact page, visit block,
verify page, and `LocalBusiness` schema.

| Detail | Value | Consistent everywhere? |
| --- | --- | --- |
| Call for a demo | +91 81605 17429 | Yes — every explicit call action, never labelled WhatsApp |
| WhatsApp | +91 99043 76340 | Yes — every WhatsApp action, and offered as a call alternative |
| Landline | +91 261 4521383 | Yes |
| Address | 302, Middle Point… 394101 | Yes, from `site.addressEn` / `addressGu` |
| Landmark | Near Dhara Arcade, opposite Krishna Township Road | Yes — and inside `streetAddress` in schema |
| Maps URL | The owner's own pin (`ftid` from their shared link) | Yes, single source in `site.mapsUrl` |
| Email | karmadesignclasses@gmail.com | Yes |
| Socials | Instagram, YouTube, Facebook, Threads | Yes, single source in `site.socials` |

**The one unresolved item stays documented rather than guessed**: which of the
two mobiles a person answers. Both are published, each labelled by channel, so
nothing on the site contradicts anything else — and
`tests/mobile-conversion.test.ts` blocks any `wa.me` link from ever using the
call number.

---

## A. The 16 owner questions (plan §18, condensed)
| # | Question | Where the answer goes |
| --- | --- | --- |
| Q1 | **PARTLY RESOLVED** — course list confirmed at 11 (owner, 2026-08-29). Still open: duration per course, and whether the draft module topics are right. | `src/content/courses.ts` (`durationWeeks`, modules) |
| ~~Q2~~ | **RESOLVED** — Middle Point confirmed; landmarks captured. See "Verified from the owner's own channels" below. | `src/lib/site.ts`, contact page |
| Q3 | **PARTLY RESOLVED** — landline +91 261 4521383 confirmed active and now shipped. Still open: is 99043 76340 the right mobile for both calls and WhatsApp? | `src/lib/site.ts` |
| Q4 | Exact opening hours, day by day | `site.hoursEn/Gu`, LocalBusiness JSON-LD |
| Q5 | Default language of the site: English (current) or Gujarati? | one line in `src/i18n/routing.ts` |
| Q6 | Founding story: 5-question voice-note interview (why started, the crown, first student memory, what "screen to stitch" means here, what "Karma" means) | About page (`aboutPage.storyBody`, `karmaBody`) |
| Q7 | Trainer names, photos, specialties + consent to appear | About page trainers section |
| Q8 | Six real student outcomes with names, consent, before/after and a quote | `src/content/collections.ts` `stories` (remove `sample: true`) |
| Q9 | Verify public claims: 500+ students? Google rating 4.8 or 4.9? Years running? | hero proof row, About numbers |
| Q10 | Batch reality: current live batches, seats per batch, morning/evening times | seed data / Supabase `batches` |
| Q11 | Certificate: exact issuing name, signatory, past numbering to migrate? | Phase 4 certificate template |
| Q12 | Fee policy language: is "fees shared at demo/WhatsApp" the right promise? Any registration fee? | admissions copy |
| Q13 | B2B: confirm service list, typical minimums, file formats accepted | services page, `services` content |
| Q14 | Facebook page URL (and any other socials) | `src/lib/site.ts` socials |
| Q15 | Attendance rule for certificates: 75% shipped as draft. Correct? | admissions copy + Phase 3 logic |
| Q16 | Who receives notifications: confirm karmadesignclasses@gmail.com, add more? | `STUDIO_EMAIL`, digest |

## B. The photo/video shoot list (plan §16)
One phone, one evening batch, window light. Every `PhotoSlot` label matches
this list, so a shot drops straight into place.
1. **Hero loop (video, 10-15 s):** emCAD screen → machine stitching close →
   finished piece. Landscape + a vertical crop for reels.
2. **Screen-to-stitch trio (one project):** emCAD screen / stitching mid-way
   / finished fabric. Same framing, tripod if possible.
3. Machine floor wide shot during a live evening batch.
4. Each machine, straight-on: zardosi, 4-beads, sequence, coding, chain,
   multi-head, laser, tufting frame, emCAD station.
5. Hands + fabric macros: zardosi gold, beads catching light, sequence
   shimmer, cording curve, tufting stroke.
6. 8-12 finished student pieces on plain ivory background (gallery).
7. Students at work (faces only with signed consent) + 2 trainer portraits.
8. Building entrance + signboard (contact page wayfinding).
9. Owner portrait at a machine (About).

## C. Replace-the-samples map
| Sample now | File | Done when |
| --- | --- | --- |
| 2 sample stories | `src/content/collections.ts` | 6 real stories, `sample: false` |
| 6 gallery placeholders | same file | real photos + real captions |
| Batch fallback rows | disappear automatically once the database has real batches | — |
| About story/trainers callouts | `messages/*` aboutPage | interview + profiles in |
| Privacy/terms drafts | `[locale]/privacy`, `terms` | owner + legal review |


---

## Verified from the owner's own channels (2026-08-29)

Cross-checked against the owner's Google Business pin, `karmadesignstudio.in`,
the Facebook page, Threads and the JustDial listing. A fact was only accepted
when at least two independent sources agreed.

| Fact | Value | Where it came from |
| --- | --- | --- |
| Legal name | Karma Design Studio & Classes | Google pin + Facebook page name |
| Address | 302, Middle Point, Maruti Nandan Society, Mahadev Chowk, Mota Varachha, Surat 394101 | Google pin + own site + JustDial |
| Landmarks | Near Dhara Arcade; opposite Krishna Township Road | Google pin; JustDial |
| Landline | +91 261 4521383 | `tel:+912614521383` on the studio's own site |
| Facebook | page id `61573902494333` | both owner share links resolve here |
| Threads | `@karma_designstudio` (440 followers) | own site footer + Threads metadata |
| Instagram / YouTube | unchanged, both confirmed | own site footer |
| Brand mark | the studio writes its own name as 👑 Karma Design Studio 👑 | Threads display name |

This closes Q2 and half of Q3, and replaced the placeholder directions block on
the contact page with real landmark wayfinding.

## ⚠ Do NOT source content from karmadesignstudio.in

The current live site is an **unedited ValidTheme template**. Proof, not
inference:

- its contact page still publishes `support@validtheme.com`;
- its About page states the studio is **"Located in Vadodara"** — the wrong city;
- its events are Lorem Ipsum, scheduled in New York, Paris and Australia;
- its own course cards contradict themselves (12 Modules vs 32 Lessons).

Everything below is therefore template filler and must never reach this site,
no matter how often it is asked for:

- **Statistics** — 500+ students trained, 98% satisfaction, 4.9 instructor
  rating, 15+ expert instructors, 25+ specialised courses, certificates issued
  (220+/180+/150+), and every per-course "lessons / students / rating" figure.
- **Trainers** — Rohan Kapoor, Ravi Desai, Vikram Patel, Aisha Khan,
  Sanjay Gupta. None are Karma staff; they are template names.
- **Testimonials** — Neha Patel, Ravi Sharma, Priya Desai, Farhan Sheikh.
- **"Bead Calc App"** — no such app exists on either store; template badge.

Q9 therefore stays open, and `verifiedFacts` stays `false`. A 4.8/147 rating
does appear on JustDial, but that is a JustDial aggregate, not a Google one,
and it could not be verified directly — the owner must confirm the number and
its source in writing before it is published.

## Owner-confirmed catalogue additions (2026-08-29)

The studio advertises three techniques that were **not** in the catalogue built
from its YouTube bio. Because they sat alongside proven template filler they
were held back and put to the owner directly, who confirmed all three are
taught. They are now shipped:

| Course | Slug | Family |
| --- | --- | --- |
| Flat Embroidery | `flat-embroidery` | machine |
| Appliqué & 3D Embroidery | `applique-3d-embroidery` | machine |
| Cross Stitch | `cross-stitch` | machine |

The catalogue is now **11 courses**: 8 machine, 2 modern, 1 software.

Two implementation notes for whoever touches this next:

1. **New courses are appended, never inserted.** `VERIFIED_CATALOG_ROWS`
   derives `sortOrder` from array position and the owner's import upserts with
   `onConflictDoNothing`, so reordering `src/content/courses.ts` would leave
   already-imported rows on stale sort positions that collide with new ones.
   Public surfaces use `coursesByFamily` for display order instead. A test
   asserts the exact slug order to keep this honest.
2. **Durations are still null** for all eleven. Q1 is only half answered — the
   module topics remain the shared `draftModules` template and are still marked
   as drafts on the course pages.

Re-running the owner's catalogue import in Karma Console will insert only the
three new rows; it is idempotent by slug.

## Still open, and worth asking next

- **Durations and module topics per course** (Q1, the open half).
- **Q9 numbers** — nothing publishable has been verified yet.
**RESOLVED (owner, 2026-08-29): Zardosi leads.** It is the work Surat is known
for and the reason most enquiries arrive. Flat Embroidery was moved to second
so the foundation course is not buried sixth of eight — that position was an
artefact of appending, not a decision. Both are presentation-only: the order
now lives in `COURSE_DISPLAY_ORDER`, storage order and the `sortOrder` written
by the catalogue import are untouched, and three tests hold the line. To
re-rank the catalogue in future, edit that one list — nothing else.

---

## Sample content inventory (Phase 2, 2026-08-30)

The owner asked for the whole visual system populated before real content
arrives. Sample content is therefore allowed for prototyping, but every piece
of it has to be replaceable in one place and unmistakable in three: in source,
on screen, and in structured data.

| What | Where | Marked how | Replace with |
| --- | --- | --- | --- |
| 7 reviews | `sampleReviews` in `src/content/collections.ts` | `sample: true` + visible `<SampleTag />` on every card | The studio's real Google reviews, with the reviewer's consent |
| 6 student stories | `stories` in `src/content/collections.ts` | `sample: true` + visible tag on every card | Six real, consented outcomes — the archetypes are the shapes to fill |
| 6 gallery items | `galleryItems` in `src/content/collections.ts` | `sample: true` + visible tag; each renders its planned shot in a `<PhotoSlot>` | Real student and studio work |
| 3 trainer profiles | `trainers` in `src/content/collections.ts` | `sample: true` + visible tag | Owner-confirmed names, with consent |

**Not sample content:** `machineCases` in the same file carries no sample flag,
because it makes no claim about a person, a student or a client. Each note is
an ordinary production fault with its ordinary cause — the same note would be
written in any embroidery unit in Surat — so there is nothing in it about
anyone for the owner to verify.

**Structured data is the hard line.** None of the above may enter
`Review`, `AggregateRating`, `Person` or any other schema type. Six tests in
`tests/proof-sample-policy.test.ts` hold this mechanically, along with the
no-earnings rule and the requirement that every surface rendering a sample
also renders its tag. A labelled placeholder
card is a visible work-in-progress; a fabricated rich result in Google is a
different order of problem, and it is the one that would follow the business
around after the content is fixed.

## Owner-provided trust facts (Phase 2, 2026-08-30)

`ownerProvidedFacts` in `src/lib/site.ts` — a third category, between
`verifiedFacts` (corroborated by two independent sources) and sample content
(invented). The owner supplied these directly in
`docs/screen-to-stitch-progress.md`, with the instruction: *"Do not claim they
were independently verified if they were not."*

| Fact | Value | Shown as |
| --- | --- | --- |
| Google rating | 4.8 | Hero trust rail and the reviews section, attributed to Google and linked to the live listing |
| Instagram followers | 39K+ | Hero trust rail, attributed |
| Facebook followers | 10K+ | Hero trust rail, attributed |

Rules that follow: rounded, never precise; always attributed to the source
rather than presented as Karma's own audited claim; and **the 4.8 never enters
`AggregateRating`**, because we have no verified review count to go with it.

`verifiedFacts.googleRating48` stays `false`. It governs whether the number
may be stated as *independently verified*, which is a different question from
whether the owner has told us it is the rating on their listing.

## Studio (B2B) — deferred and unconfirmed

- **Turnaround time.** Not stated anywhere on the site; the services page
  explains that it depends on technique, quantity and floor load and asks for
  the buyer's deadline. Confirm a realistic range and it can be published.
- **Supported machine file formats.** No extension is claimed. Confirm which
  formats the studio actually delivers and the page can name them.
- **In-form file upload.** Removed until R2 is bound: with no binding an
  attached file fails in production and is dropped in demo mode. Restoring it
  is a few lines — the API route and size guards are untouched.
- **Sample B2B projects** (`studioProjects`) are generic work types, tagged as
  samples. Replace with real commissions only with the client's written
  permission.

## Still open after Phase 2

- **Durations and module topics per course** (Q1, the open half). Four FAQ
  answers and the fees section now say "ask at the demo" rather than guessing,
  so nothing is blocked — but a real duration per course is better copy than
  an honest deferral.
- **Phone vs WhatsApp roles — still open, now handled explicitly.**
  Two numbers are published and the owner has not said which answers what:

  | Number | Source | Used on the site for |
  | --- | --- | --- |
  | +91 81605 17429 | The owner's own Facebook listing, supplied in `docs/screen-to-stitch-progress.md` | Every explicit "Call for a demo" action: the mobile bar, the hero, course pages |
  | +91 99043 76340 | In this repo from the start | WhatsApp, and a call alternative to WhatsApp |
  | +91 261 4521383 | The studio's own site | The studio landline |

  Rules being followed until the owner confirms:
  - the call number is **never** labelled WhatsApp anywhere;
  - the WhatsApp configuration is untouched and still uses its own number;
  - pages that list contact details show all three, each named by the channel
    it is for, so nothing on the site contradicts anything else;
  - all three appear in the `LocalBusiness` `telephone` array rather than one
    being promoted to "the" number.

  `tests/mobile-conversion.test.ts` holds this: the numbers must differ, no
  `wa.me` link may use the call number, and every call-for-demo action must
  dial it.

  **The one question to ask the owner:** which of the two mobiles is answered
  by a person during batch hours, and which is WhatsApp-only? One sentence
  collapses this to a single number.
- **Real photography.** Every visual on the site is drawn or a named
  placeholder — technique swatches, the workflow, the four production-proof
  panels, and the `<PhotoSlot>` entries that name the shot they are waiting
  for. They are designed to be replaced by photography without a layout
  change, not to hide its absence indefinitely.
- **Trainers.** Three sample profiles now exist as a shape to fill:
  speciality, machines taught, software, experience, teaching style and
  selected work. **No real trainer has been confirmed.** Experience is
  deliberately written as a range, never a year count, and a test enforces
  that.
