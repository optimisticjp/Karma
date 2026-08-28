> **Superseded in part (Phase 2).** Section 12's hosting/database choices and
> the auth assumptions in section 10.8 have moved on: the database is Supabase
> Postgres via Cloudflare Hyperdrive, and staff auth is Supabase Auth with
> mandatory TOTP MFA. The account model is now explicit — one Owner plus at
> most five Admins with per-key permissions. Everything else in this plan
> still stands. Current architecture: `docs/admin-architecture.md`.

> **Design revision v2 (July 2026).** The visual direction in sections 4-7
> of this plan (zari gold + maroon palette, Mukta Vaani/Rasa type) has been
> superseded by the "Digital Thread" system: single vermilion accent,
> Fraunces + Manrope / Noto Serif + Sans Gujarati, editorial scale. See
> `docs/design-system.md`. Everything else in this plan still stands.

# Karma Design Studio: Final Master Plan (v2)

This document supersedes both earlier plans (my v1 and the second-opinion plan). It merges the best of each, resolves every conflict with a stated reason, and is self-contained: nothing else needs to be open while building.

Constraints unchanged: GitHub + Claude Code + free-first online tools, no payment gateway, bilingual English/Gujarati, must feel intentionally designed for this business.

---

## 0. Decision log: how the two plans were merged

Read this first. Where the plans agreed, the idea is simply in the document. Where they differed, here is the call and why.

| # | Topic | Plan A (v1) | Plan B (second opinion) | FINAL CALL | Why |
|---|-------|-------------|------------------------|------------|-----|
| 1 | Course catalog | Zardosi, 4-Beads, Sequence, Coding, Chain/Multi, Laser, Tufting, emCAD (verified from the studio's own YouTube bio) | Flat, Beads & Sequins, Appliqué & 3D, Chain, Cross Stitch, Laser/Cutwork, emCAD, "Advanced Machine Design" | **Plan A's list, pending owner confirmation** | Plan B's list largely repeats the current template's course names, and the template's content is fiction (broken links, fake trainers). The YouTube bio is the studio describing itself. This is the single most important correction in the merge: build around the real catalog, and put the question to the owner in writing (section 18, Q1). |
| 2 | Primary CTA | "Book a Free Demo Class" everywhere | "Explore Courses" primary, "Request a Design Quote" secondary | **Free Demo Class stays primary sitewide** | With no payment gateway, the site's one conversion is getting people into the studio or onto WhatsApp. "Explore Courses" is navigation, not conversion. Plan B's "Request a Design Quote" is right for the B2B side and becomes the primary CTA on the Services path only. |
| 3 | Homepage length | 11 sections | 18 sections | **11 sections** | Eighteen sections on one page contradicts the whitespace-and-focus argument both plans make. Trainers, FAQ, resources and certificate lookup are pages, reachable from nav and footer, not homepage sections. The four best Plan B homepage ideas (path chooser, screen-to-stitch, batches, richer stories) are folded into the 11. |
| 4 | Fonts | Fraunces + Rasa (Gujarati serif) + Mukta Vaani for body in BOTH scripts | Fraunces + Manrope (Latin) + Noto Serif/Sans Gujarati, loaded only on /gu pages | **Plan A's stack, with Noto Serif Gujarati added as fallback** | The brand voice is Gujlish: English pages contain Gujarati (their own tagline) and Gujarati pages contain Latin trade terms (emCAD, WhatsApp). Splitting body text across Manrope and Noto Sans Gujarati puts two different sans faces inside one sentence, and loading Gujarati fonts only on /gu breaks the EN pages that show the tagline. One body family covering both scripts (Mukta Vaani) is the cleaner engineering AND the cleaner typography. |
| 5 | Color accent | Ivory/ink canvas + zari gold (decorative) + silk maroon (CTA) | Same neutrals + single Vermilion #C54832 for everything | **Plan A's system** | Three reasons. The signature stitch motif needs gold to read as thread. Maroon on ivory is ~9:1 contrast (AAA) for buttons; vermilion on ivory is ~4.4:1, which fails AA for normal-size text, so it can't be the do-everything accent Plan B wants it to be. And a red-family accent sits uncomfortably next to error states in the admin screens. Plan B's discipline rule ("thread colors live in photographs, not in the interface") is adopted verbatim. |
| 6 | Language detection | Auto-detect browser language on first visit | Never auto-redirect on browser language (Google's guidance) | **Plan B is right; corrected** | Auto-redirecting by browser language can hide content from crawlers and traps users. Final behavior: URL decides the language, an unobtrusive one-time banner offers the other language, and an explicit choice is remembered. |
| 7 | Admission form | 5 micro-steps, lead captured at step 1 | 3 denser steps with consent/guardian handling | **4 steps, merged** | Keep Plan A's mobile-first micro-steps and capture-the-lead-first logic; adopt Plan B's consent records, guardian details for minors, draft autosave and duplicate detection. |
| 8 | Attendance | Trainer roster primary; optional kiosk (device token + admission no + PIN) | Trainer roster primary; optional session QR that expires in 2-3 min, student must be logged in | **Trainer roster ships first (both agreed). QR deferred to Phase 5; session-QR model preferred if students reliably have logged-in phones, kiosk+PIN if not** | Both plans independently concluded the trainer roster is the workhorse. Plan B's locking, correction-with-reason and audit-log details are adopted. |
| 9 | Hosting | Netlify free (or Cloudflare Pages) | Cloudflare Workers via the OpenNext adapter | **Cloudflare first, Netlify as the zero-config fallback** | The project already uses Turnstile and can use Cloudflare Web Analytics, so one dashboard wins; Cloudflare's free tier is explicitly commercial-friendly and generous (100k requests/day). If the OpenNext adapter causes friction in week one, switch to Netlify without shame. Never Vercel's free Hobby tier: it prohibits commercial use. |
| 10 | Timeline | ~5 focused weeks | 8 to 12 weeks solo | **8 to 12 weeks part-time is the honest number** | Plan A's estimate assumed full-time. With Claude Code doing the heavy lifting and the owner answering promptly, faster is possible, but plan for 8 to 12. |
| 11 | Brand descriptor | None added | "Embroidery Academy & Design Lab" | **Adopted, pending owner approval** | It instantly communicates more than "Studio & Classes" and frames both audiences. It appears under the logo, in metadata and in the footer; the legal/registered name stays whatever it is. |
| 12 | "One cheap DIY mistake" | Shipping template ghost content (lorem ipsum, fake trainers, placeholder emails) | Generic stock/AI-looking imagery instead of real work | **Unified: borrowed proof** | Same principle, two symptoms. Final rule in section 2.5. |
| 13 | "One amateur typography habit" | Decorating words inside headings (their template does this everywhere) | Inventing a new size/weight whenever something needs attention | **Unified: breaking the scale** | Same principle. Final wording in section 5.5. |

Adopted from Plan B wholesale, because they're simply good: the screen-to-stitch three-stage showcase, the choose-your-path section, the offline fee ledger (records without a gateway), DPDP Act/Rules compliance items, guardian handling for minors, the granular admission pipeline statuses, the B2B brief workflow with private signed-URL files, attendance locking/corrections/audit logs, the equipment page, the bilingual glossary, the student handbook, the course comparison tool (Phase 5), rebuilding the dead Bead Calc as a small web app (Phase 5), CI checks per PR, and a strict CLAUDE.md.

Kept from Plan A because the research supports them: the verified course catalog, the free-demo conversion engine, the studio's own voice (crown, "Skill શીખો, Future બનાવો", energetic Gujlish), the stitch-line signature motif, the palette, the bilingual font architecture, the WhatsApp-first operational reality (open till 10:30 pm, wa.me prefills), and the NAP inconsistency findings that Plan B missed (two different addresses and phone numbers live online right now).

---

## 1. The business truth (condensed research)

**Karma Design Studio & Classes**, Mota Varachha, Surat: a training institute AND a commercial design studio in India's machine-embroidery capital.

- **Real offer (their own YouTube bio):** "100% live machine practical learning in Zardosi, 4Beads, Coding, Chain, Multi, Seq, Laser, and Tufting", plus emCAD design training, plus B2B design/digitizing/patches/job work (visible on Justdial, absent from their own site).
- **Real voice:** energetic Gujlish, crown emoji, "Skill શીખો, Future બનાવો", "We don't just teach, we build embroidery professionals."
- **Real proof:** 4.8★/147 ratings on Justdial, 500+ students claim, certificates, lifetime support, open until 10:30 pm (evening batches).
- **Audience:** mobile-first Gujarati/Gujlish speakers: students, homemakers, tailors and boutique owners, working operators, junior designers; plus garment businesses on the B2B side.
- **Current site:** a ValidTheme education template with lorem ipsum in the footer, the template author's emails on the contact page, fake instructors, 404ing course links (including the misspelled /flat-embrodary), a course list that doesn't match the real catalog, dead app buttons, template metadata leftovers, zero Gujarati, and no admissions, schedule, gallery or services.
- **Facts in conflict online (fix before launch):** address (Middle Point/Mahadev Chowk vs Sumeru City Mall 3rd floor), phone (+91 261 4521383 landline vs +91 99043 76340 mobile), rating (site says 4.9, Justdial 4.8), and the course list itself.

Verdict from both plans, unchanged: rebuild, not reskin. Only the domain, logo and map embed survive.

---

## 2. Positioning and brand

### 2.1 Positioning statement

> Karma Design Studio helps learners and embroidery businesses master the complete journey from design on screen to finished stitch, through live-machine training and professional design services in Surat.

### 2.2 Name treatment

**Karma Design Studio**
*Embroidery Academy & Design Lab* (EN)
*એમ્બ્રોઇડરી એકેડેમી અને ડિઝાઇન લેબ* (GU)

Descriptor appears under the logo, in title tags and the footer. Owner approves before use (section 18).

### 2.3 Brand promise and tagline

- Promise (new, adopted): **"From design screen to finished stitch."** / **"સ્ક્રીન પરની ડિઝાઇનથી તૈયાર સ્ટિચ સુધી."** This names their actual differentiator: software + machine + production in one place.
- Tagline (theirs, kept): **"Skill શીખો, Future બનાવો."** It's ownable, bilingual by nature, and already known to their audience. The promise explains; the tagline motivates. Both live on the site (promise in hero/meta, tagline as the hero eyebrow and in the CTA band).

### 2.4 Voice

Skilled, precise, energetic, encouraging, industry-connected. Not luxury, not childlike, not craft-hobby-only, not software-cold. Short sentences, concrete facts, natural Gujlish. Technical terms stay in English where the trade uses them (emCAD, machine, batch, laser, module, certificate); Gujarati explains rather than force-translates. Banned words: empower, unleash, world-class, seamless, elevate. Numbers appear only when the owner verifies them.

### 2.5 The ONE mistake that instantly makes a DIY site look cheap (final, unified)

**Borrowed proof.** Lorem ipsum, stock faces posing as trainers, template emails, AI-looking embroidery imagery, unverifiable counters. The current site has four kinds at once, and for a business whose product IS visual proof of skill, faked proof is fatal. The rule: **if it isn't true and theirs, it doesn't ship.** A section with no real asset waits; it never launches with a stand-in.

---

## 3. Strategy and information architecture

### 3.1 Two audiences, two pathways

Everything routes people into one of two journeys within the first screen-and-a-half:

- **Learners** → Courses → Free Demo Class → Admission form → WhatsApp confirm.
- **Businesses** → Services → Submit a design brief → quote conversation (no payments online).

### 3.2 Conversion model

Primary sitewide CTA: **Book a Free Demo Class**. Zero risk, no payment needed, and it gets people into the studio where the machines close the sale. Secondary CTAs by context: Explore courses (hero), WhatsApp, Call, Submit a design brief (Services path). Measurement is demo bookings per week, not traffic (section 17).

### 3.3 Sitemap

```
Public (every page in EN + GU)
├── Home
├── Courses
│   ├── Zardosi Machine Embroidery
│   ├── 4-Beads Machine Work
│   ├── Sequence (Sequins) Work
│   ├── Coding / Cording Machine
│   ├── Chain & Multi Machine
│   ├── Laser Work
│   ├── Tufting
│   └── emCAD Embroidery Design
├── Admissions        (process, upcoming batches, handbook, eligibility, FAQ, form)
├── Student Work      (gallery, filters, screen-to-stitch pairs, progressions)
├── Services          (B2B: design development, digitizing, patches, job work, brief form)
├── About             (story, studio, equipment & software, real trainers)
├── Success Stories   (named outcomes, video where available)
├── Contact           (WhatsApp-first, map, hours, directions)
├── Resources         (Phase 4+: guides, bilingual glossary, Bead Calc web app, curated YouTube)
└── /verify/[id]      (public certificate verification)

Systems (auth)
├── /admission        (public 4-step form)
├── /admin            (CRM, students, courses, batches, attendance, certificates, content, audit)
├── /trainer          (today's batches, roster attendance, corrections, materials)
└── /student          (Phase 4: dashboard, timetable, attendance %, materials, certificate)
```

Courses group visually into three families on the index: **Machine Embroidery** (Zardosi, 4-Beads, Sequence, Coding, Chain/Multi), **Modern Techniques** (Laser, Tufting), **Design Software** (emCAD).

### 3.4 Navigation (final spec)

Header, 80px desktop, condensing to 64px on scroll:
`Logo+descriptor · Courses · Admissions · Student Work · Services · About · Contact · [EN | ગુ] · [Book Free Demo]`

Six links, one toggle, one button. No address/phone/email strip in the header (the current site's cluttered top bar dies). Contact details live on the Contact page, the footer, and the sticky mobile action bar. "Student Login" joins the header utility area only when the portal ships (Phase 4). "Resources" enters the nav only when it has real content; until then it's a footer link.

### 3.5 Above the fold (final)

Answers four questions in one screen: what is this, what can I learn or order, why trust it, what do I do next.

- Media: 8 to 12-second muted loop (software screen → machine stitching → finished piece: the promise in video form), or the three-frame screen/machine/fabric composition as the static fallback. Never an auto-rotating slider.
- Eyebrow: `Skill શીખો, Future બનાવો`
- H1: `Learn embroidery on real machines. Build a career that's yours.` / `સાચા મશીન પર એમ્બ્રોઇડરી શીખો. પોતાનું કરિયર બનાવો.`
- Sub: `Surat's embroidery academy and design lab: from design on screen to finished stitch. Zardosi, beads, sequence, coding, laser, tufting and emCAD, taught hands-on with lifetime support.`
- Primary CTA: `Book a Free Demo Class`. Secondary link: `Explore courses`.
- Proof strip (verified facts only): `4.8★ on Google · 500+ students trained · Evening batches till 10:30 pm` (each number confirmed by the owner first; drop any that aren't).

### 3.6 Sections template sites skip (this site's unfair advantages)

Merged list, all of these ship across the site: screen-to-stitch case studies; equipment & software page; live batch calendar from the database (never a permanent "Admissions Open"); module-level syllabi with downloadable PDF; who-it's-for honesty per course; student work progression (first exercise → mid-course → final project); a 60-90s sample lesson video; certificate verification + eligibility rules in plain language; career pathway map (which course leads to which); student handbook; bilingual glossary; commercial file-prep guide and revision process for B2B; visit-us block with landmark, entrance photo and parking note; real FAQ in Gujarati.

---

## 4. Visual direction

### 4.1 Concept: "The Digital Thread"

One idea carried everywhere: **a design begins on screen, travels through the machine, and becomes something you can touch.** Expressed through the signature **stitch line** (a dashed gold SVG path that draws itself: section dividers, link underlines, form progress, the 4-step connector) and a small custom graphic library: emCAD-style grid overlays, stitch-path arrows, machine-path animations, technique icons drawn from real stitches. Zero graduation caps, lightbulbs, rockets, blobs or gradient meshes. The crown from their logo is seasoning: favicon, certificate seal, one hero accent.

### 4.2 Anchor references (study the discipline, copy nothing)

- **Royal School of Needlework**: embroidery presented as a serious professional discipline with pathways.
- **Domestika**: visually-led course discovery, warm canvas, one accent used sparingly, real project photography.
- **DMC**: approachable technique education.
- Local flavor source: Surat textiles themselves (zari, silk, thread spools).

### 4.3 Color tokens (final)

```
Canvas      --ivory #FAF6EF (page)   --ivory-2 #F3EDE2 (alt sections, max every 2nd)
            --card #FFFDF8 (card surface)   --border #DAD5CB (hairlines)
Ink         --ink #211D19 (headings, dark band, footer)
            --ink-soft #55493D (secondary text, 7.2:1 on ivory)
Accent      --zari #C9A24B (decorative gold: stitch lines, icons, big numerals)
            --zari-deep #8A6215 (gold as text, 5.4:1, AA)
Depth       --maroon #6E1F2E (primary CTA bg, hover #5A1826; ivory text ≈9:1, AAA)
Thread      --rani #C2226B  --peacock #0F6B6B  --marigold #E08A00  --leaf #3E7A3E
            (gallery tags and illustrations ONLY, never interface chrome)
Semantic    --success #2F7D46  --error #B3261E  (admin/portal UI only)  --focus #8A6215
```

Rules: gold is never a button fill or body text; maroon appears only on primary CTAs and at most one dark band per page; the interface stays neutral so the embroidery photography carries the color (Plan B's rule, adopted); every text/background pair passes WCAG AA.

### 4.4 Imagery

Real photos only, one consistent warm edit, three deliberate types: macro texture (needle, beads, thread), hands-at-work (cards, process), people-and-place (trainers, students at machines, the studio). Course card images all 3:2. The gallery is built around screen-to-stitch pairs and first/mid/final progressions. Consent flag required for any student face or work (enforced in queries, section 11). Shoot list in section 16. Any reference imagery used during design (like the training-institute photo attached to the second plan) is direction only; nothing external ships.

---

## 5. Typography (final system)

### 5.1 The stack

- **Latin display/headings: Fraunces** (variable; SOFT axis ~50-70 for the crafted feel).
- **Gujarati display/headings: Rasa** (Ek Type's Gujarati serif, drawn to sit beside Latin serifs), with **Noto Serif Gujarati** as fallback for glyph coverage.
- **Body + UI, both scripts: Mukta Vaani** (one family covering Gujarati AND Latin, so Gujlish lines like "ફ્રી Demo Class બુક કરો" stay in one face).

```css
--font-display: "Fraunces", "Rasa", "Noto Serif Gujarati", Georgia, serif;
--font-body:    "Mukta Vaani", system-ui, sans-serif;

:lang(gu) h1, :lang(gu) h2, :lang(gu) h3 {
  font-family: "Rasa", "Noto Serif Gujarati", "Fraunces", serif;
}
:lang(gu) { line-height: 1.8; font-size: 103%; }
```

Both locales load both scripts (subset via next/font) because both locales display both scripts. Do not split font loading per language.

### 5.2 Type scale (one merged table, three breakpoints)

Base 17px. Weights are Fraunces variable values for headings, Mukta Vaani for the rest.

```
Style        Desktop        Tablet         Mobile         LH      LS        Weight
Display/H1   64px           52px           40px           1.05    -0.02em   560
H2           44px           38px           32px           1.15    -0.015em  540
H3           30px           28px           24px           1.25    -0.01em   520
H4/Card      22px           21px           20px           1.3     -0.005em  500
Lead         20px           19px           18px           1.6     0         400
Body         17px           17px           17px           1.7     0         400
Small/Meta   14px           14px           14px           1.5     +0.01em   500
Eyebrow      13px caps      13px           13px           1.4     +0.14em   600 (Latin only)
Button       16px           16px           16px           1       +0.01em   600
Big numeral  96px outlined  80px           64px           1       0         400
```

### 5.3 Gujarati rules (where bilingual sites fail)

Never uppercase or letterspace Gujarati (no capitals exist; tracking breaks matras). Gujarati eyebrows use weight 600 + zari-deep color instead. Line-height 1.8 and 103% size via `:lang(gu)`. Zero negative letter-spacing on Gujarati headings. Latin numerals for dates, phone numbers, IDs and versions in both languages. Buttons get 2-4px extra vertical padding on /gu. Allow Gujarati headings one extra line on mobile. Test on a low-cost Android before sign-off.

### 5.4 Rhythm

Running text 45-75 characters (68ch container). Paragraph spacing 1em. Headings: 48px above, 16px below (they hug what they introduce).

### 5.5 The ONE typography habit that makes even good content look amateur (final, unified)

**Breaking the scale to manufacture emphasis.** Two symptoms of the same disease: decorating words inside headings (the current template bolds and gold-colors one random word in every single heading) and inventing a new size or weight whenever something "needs attention." Premium hierarchy comes from a fixed scale plus placement and space. Inside a heading: zero inline styling. In body: italics for at most one phrase per screen. If a sentence needs decoration to matter, rewrite the sentence.

---

## 6. Layout and spacing

### 6.1 Grid

```
Desktop:  12 cols, content max 1200px (wide visual moments 1440px), 32px gutters
Tablet:   8 cols, 24px gutters, 32px margins
Mobile:   4 cols, 16px gutters, 20px margins
Full-bleed allowed only for: hero media, photo bands, dark CTA band, footer.
```

### 6.2 Spacing scale and section rhythm

Scale: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 112, 128, 160`.

Two section tiers only (simpler than three; the beat is the premium signal):

```
                       Desktop   Tablet   Mobile
Standard section        112px     88px     64px
Compact band             64px     56px     48px
Hero bottom padding     128px     96px     64px
Heading → paragraph      24px     20px     16px
Paragraph → CTA          32px     28px     24px
Card internal padding    32px     28px     24px
Grid gap                 32px     24px     20px
```

The rule that makes it feel expensive: **gaps are unequal on purpose.** Related things sit close (8-16px), groups separate clearly (24-32px), ideas separate decisively (64px+), sections land on the fixed beat. Cramped = unrelated blocks sharing under 32px. Empty-in-the-wrong-way = uniform gaps everywhere, so the eye can't find groups and the page feels simultaneously bare and confusing. Whitespace is information; spend it where meaning changes.

### 6.3 Why generous whitespace signals a premium build

It shows the content was prioritized: one message leads, photography gets room to feel valuable, users scan without stress, and the interface doesn't need constant decoration to hold attention. It also does mechanical work: bigger tap targets, faster reading, fewer competing elements per viewport. It's the cheapest luxury on the web because it can't be faked by a template; it requires deleting things. White space is not empty space; it's the structure that tells the user where to look.

### 6.4 Premium layout decisions (merged)

Asymmetric compositions (7/5, 5/7) over identical centered rows; one large feature + two supporting items instead of six equal cards; alternate full-width visual sections with constrained editorial ones; let a few portfolio images break the grid deliberately; borders more often than shadows (shadows reserved for menus, dialogs, floating bars); restrained radii (12px cards, no pill-mania); never wrap every section in a colored rectangle; text lines 45-75 characters.

### 6.5 Diagnosing the current site (carried into every new page)

Cramped today: template cards stuffed with ratings, lesson counts and trainer chips but no actual course information. Fix: fewer cards at once, one strong outcome per card, secondary data moves to the course page, no ratings without a named source. Empty-wrong today: missing images, placeholder text and generic names create unfinished holes, not calm. Fix: real process imagery with captions, intentional focal points, and the discipline to delete any section that has no credible content yet.

---

## 7. Interaction and motion

Global rules: UI feedback 150-250ms, panels/accordions 220-300ms, scroll reveals 300-450ms, entrances ≤600ms; easing `cubic-bezier(0.16,1,0.3,1)` for entrances, ease-out elsewhere; max vertical travel 16px (cards 4px); everything runs **once**; nothing moves text mid-read; full `prefers-reduced-motion` support renders final states instantly.

### 7.1 The interaction set (merged; where / trigger / spec / why)

1. **Stitch line draws itself** (signature). Section dividers, the 4-step connector, form progress. Trigger: 30% viewport entry, once. `stroke-dashoffset` 900ms ease-out. Turns scrolling into the craft itself; the one thing visitors remember.
2. **Stitch-underline links.** All text links and nav. Hover/focus-visible. Dashed gold underline draws left→right 220ms and stays while focused. Cohesive motif; keyboard users get the same care.
3. **Card lift.** Course/gallery cards. Hover/focus-within. translateY(-4px), border shifts to --zari, shadow 0 12px 32px rgba(33,29,25,.12), inner image scale 1.03, arrow nudges 4px, 250ms. Confirms interactivity without drama.
4. **Screen-to-stitch slider.** Featured on Home + gallery items with pairs. Drag handle, arrow keys, tap-to-cycle on mobile through design → stitch path → fabric. 44px handle, zero lag. Interactive proof: one drag explains the entire value proposition wordlessly.
5. **Syllabus accordion.** Course pages. Click. 240ms height+opacity. Makes long module lists manageable.
6. **Batch filter crossfade.** Admissions batch table. Filter change. 150ms crossfade of rows. Scheduling feels responsive, never jumpy.
7. **Stat count-up.** Hero proof strip / About numbers. 40% visible, once, 800ms, small gold tick lands under the number. Draws the eye to verified proof at the right moment.
8. **Header condense.** Scroll past 80px. 80→64px, ivory 95% background + hairline border, 200ms. Navigation stays available without dominating.
9. **Language toggle.** Tap EN | ગુ. Thumb slides + content crossfades 150ms; same page, context and form progress preserved; choice remembered. Switching languages must feel like flipping fabric, not visiting a different website.
10. **Form step transitions.** Admission form. Next/back. 24px slide + fade 200ms; stitch progress fills; draft autosaves locally. Momentum reduces abandonment; inline errors appear under the exact field.
11. **Attendance tap feedback** (trainer app). Status tap fills the row state instantly; sticky save bar shows unsaved count; on save, a small check + timestamp. Trainers must trust that input registered.
12. **Verification result.** /verify success. Verified card appears with a subtle one-time seal animation. Makes a successful check feel official.
13. **Sticky mobile action bar.** Course/Admissions pages after the hero. Slides up once: `Book free demo` (maroon) + WhatsApp + Call icons, 64px, safe-area aware. High-intent actions stay a thumb away. Elsewhere: WhatsApp FAB after 600px scroll, no pulsing.
14. **Media on demand.** All YouTube and map embeds are click-to-load facades. Speed is a feature.

### 7.2 Tasteful detail vs gimmick (final line)

Tasteful: clarifies state, shows cause and effect, means something in this craft or aids orientation, finishes fast, works for keyboard and touch equally, runs once. Gimmick: exists to show off animation, loops, moves text while someone reads, hijacks scroll, follows the cursor, autoplays, makes users wait, adds confetti to routine tasks. Banned on this project: typewriter headlines, particle/thread cursor effects, tilt cards, parallax on text, auto-rotating heroes/carousels, scroll-jacking, autoplay audio, and any toggle animation over 150ms.

---

## 8. Copy deck (final; EN + GU)

Rules: their tagline and "we build professionals" line are kept because they're genuinely good and theirs. Gujarati must sound like spoken Surti Gujarati, not translated formal Gujarati; **the owner reads every Gujarati line aloud before launch (launch requirement)**. Trade terms stay in English. Latin numerals everywhere.

### 8.1 Hero
- Eyebrow: `Skill શીખો, Future બનાવો`
- H1 EN: `Learn embroidery on real machines. Build a career that's yours.`
- H1 GU: `સાચા મશીન પર એમ્બ્રોઇડરી શીખો. પોતાનું કરિયર બનાવો.`
- Sub EN: `Surat's embroidery academy and design lab: from design on screen to finished stitch. Zardosi, beads, sequence, coding, laser, tufting and emCAD, taught hands-on with lifetime support.`
- Sub GU: `સુરતની એમ્બ્રોઇડરી એકેડેમી અને ડિઝાઇન લેબ: સ્ક્રીન પરની ડિઝાઇનથી તૈયાર સ્ટિચ સુધી. ઝરદોશી, બીડ્સ, સિકવન્સ, કોડિંગ, લેસર, ટફ્ટિંગ અને emCAD, બધું જ હાથે કરીને શીખો, લાઇફટાઇમ સપોર્ટ સાથે.`
- CTA: `Book a Free Demo Class` / `ફ્રી ડેમો ક્લાસ બુક કરો` · Secondary: `Explore courses` / `કોર્સ જુઓ`
- Proof strip: `4.8★ on Google · 500+ students trained · Evening batches till 10:30 pm` / `Google પર 4.8★ · 500+ સ્ટુડન્ટ્સ ટ્રેઇન્ડ · સાંજની બેચ 10:30 સુધી` (only verified items ship)

### 8.2 Choose your path (section 2)
- H2: `What are you here to build?` / `તમે શું બનાવવા આવ્યા છો?`
- Panel A (Learn) EN: `Build real embroidery, software and machine skills through structured studio training.` Actions: `Explore courses` · `See upcoming batches`
- Panel A GU: `સ્ટ્રક્ચર્ડ સ્ટુડિયો ટ્રેનિંગ સાથે એમ્બ્રોઇડરી, સોફ્ટવેર અને મશીનની સાચી સ્કિલ બનાવો.`
- Panel B (Business) EN: `Get professional design development, digitizing and machine-ready embroidery support for your production.` Actions: `Explore services` · `Submit a design brief`
- Panel B GU: `તમારા પ્રોડક્શન માટે પ્રોફેશનલ ડિઝાઇન ડેવલપમેન્ટ, ડિજિટાઇઝિંગ અને મશીન-રેડી એમ્બ્રોઇડરી સપોર્ટ મેળવો.`

### 8.3 Screen to stitch (section 4)
- H2: `See how a digital idea becomes finished embroidery.` / `જુઓ, એક ડિજિટલ આઇડિયા કેવી રીતે તૈયાર એમ્બ્રોઇડરી બને છે.`
- Caption labels: `The design (emCAD)` → `The stitch path` → `The finished piece` / `ડિઝાઇન (emCAD)` → `સ્ટિચ પાથ` → `તૈયાર પીસ`

### 8.4 How learning works (section 5)
- H2: `Learn the complete workflow, not isolated techniques.` / `અલગ-અલગ ટ્રિક નહીં, આખું વર્કફ્લો શીખો.`
- Steps: `Understand the design → Build it in software → Prepare the machine → Test and finish the piece`
- Line: `Every course connects design sense, software, materials and machine work, so you understand why a design succeeds, not just which button to press.` / GU: `દરેક કોર્સમાં ડિઝાઇન, સોફ્ટવેર, મટીરિયલ અને મશીન વર્ક જોડાયેલા છે, એટલે તમને સમજાય કે ડિઝાઇન કેમ ચાલે છે, માત્ર કયું બટન દબાવવું એ નહીં.`

### 8.5 Why-us proof points (used across pages)
- H2: `We don't just teach. We build embroidery professionals.` / `અમે માત્ર શીખવતા નથી. અમે એમ્બ્રોઇડરી પ્રોફેશનલ્સ બનાવીએ છીએ.`
- `100% live machine practice. Theory only where it makes your hands better.` / `100% લાઇવ મશીન પ્રેક્ટિસ. થિયરી એટલી જ, જેટલી કામમાં આવે.`
- `Trainers who do this work for a living, not just teach it.`
- `Batches sized so every student gets machine time. That's why seats are limited.`
- `Lifetime support after the course: job guidance, business guidance, answers on WhatsApp.` / `કોર્સ પછી પણ લાઇફટાઇમ સપોર્ટ: જોબ ગાઇડન્સ, બિઝનેસ ગાઇડન્સ અને WhatsApp પર જવાબ.`

### 8.6 Course card pattern (Zardosi example)
- Title: `Zardosi Machine Embroidery` / `ઝરદોશી મશીન એમ્બ્રોઇડરી`
- Outcome line: `From frame setting to bridal-grade production work, on live zardosi machines from day one.` / `ફ્રેમ સેટિંગથી બ્રાઇડલ-ગ્રેડ પ્રોડક્શન કામ સુધી: પહેલા દિવસથી લાઇવ ઝરદોશી મશીન પર.`
- Meta row: `Level: Beginner-friendly · __ weeks · ગુજરાતી + Hindi + English · Next batch: [from DB]`
- Who it's for: `Beginners who've never touched a machine, tailors adding zardosi to their shop, and homemakers who want paying work from a real skill. Bring your interest; we bring the machines.`

### 8.7 Batches table microcopy
- H2: `Find a batch that fits your schedule.` / `તમારા ટાઇમમાં બેસે એવી બેચ શોધો.`
- Row: course · start date · days · timing · seats left · language · trainer · `Book demo`
- Seats left states: `6 seats left` / `Last 2 seats` / `Batch full: join waitlist` (never a fake "Admissions Open" forever)

### 8.8 Admissions
- H1: `Joining is simple. Start with a free demo.` / `જોડાવું સાવ સરળ છે. શરૂઆત ફ્રી ડેમોથી કરો.`
- Steps: `1. Message us or walk in · 2. Attend a free demo class · 3. Pick your course and batch · 4. Fill the admission form · 5. Start at the machines`
- Fees line: `Fees depend on the course and batch. We share the exact fee at your demo or on WhatsApp, before you decide anything. No online payment is needed to book a demo.` / `ફી કોર્સ અને બેચ પ્રમાણે હોય છે. તમે નિર્ણય લો એ પહેલાં, ડેમો વખતે અથવા WhatsApp પર અમે ચોક્કસ ફી જણાવીશું. ડેમો બુક કરવા કોઈ ઓનલાઇન પેમેન્ટ જરૂરી નથી.`

### 8.9 Services (B2B)
- H2: `Professional embroidery design support for your next collection.` / `તમારા આગલા કલેક્શન માટે પ્રોફેશનલ એમ્બ્રોઇડરી ડિઝાઇન સપોર્ટ.`
- CTA: `Tell us what you're making.` / `તમે શું બનાવો છો, અમને જણાવો.`

### 8.10 Dark CTA band
- EN: `Seats per batch are limited, because every student gets a machine. Book your free demo this week.`
- GU: `દરેક સ્ટુડન્ટને મશીન મળે એ માટે બેચમાં સીટ લિમિટેડ છે. આ અઠવાડિયે તમારો ફ્રી ડેમો બુક કરો.`
- Sign-off line under it: `Skill શીખો, Future બનાવો.`

### 8.11 WhatsApp prefills (wa.me)
- Demo: `Hi Karma Design Studio! 👑 મને ફ્રી ડેમો ક્લાસ બુક કરવો છે. નામ: ____ | કોર્સ: ____ | ટાઇમ: સવાર/સાંજ`
- Admission confirm: `Hi! My admission reference is KDS-____. Please confirm my seat. / મારો એડમિશન રેફરન્સ KDS-____ છે, સીટ કન્ફર્મ કરશો.`
- Business: `Hi! I need embroidery design / digitizing / job work. Product: ____ | Qty: ____ | Deadline: ____`

### 8.12 Microcopy
- Form success: `Done! Your reference is KDS-____. Tap below to confirm on WhatsApp.` / `થઈ ગયું! તમારો રેફરન્સ KDS-____ છે. WhatsApp પર કન્ફર્મ કરવા નીચે ટૅપ કરો.`
- Verify success: `✔ Verified: this certificate was issued by Karma Design Studio & Classes, Surat.`
- Empty filter: `No pieces in this technique yet. New student work is added every month.`
- 404: `This page slipped a stitch.` / `આ પેજનો ટાંકો છૂટી ગયો.` + links home/courses.

---

## 9. Page blueprints

### 9.1 Homepage (11 sections, final)

1. **Hero** (spec in 3.5). 
2. **Choose your path**: two large editorial panels side by side (stacked mobile, learner first), different real photography each, copy from 8.2.
3. **Course families**: H2 `Choose the skill you want to master.` + 3 family cards (photo 3:2, family name, technique list as plain text, stitch-link). Three strong doors, not eight tiny cards.
4. **Screen to stitch** (interactive): the three-stage slider (design → stitch path → fabric), one featured real project, link to more in Student Work. This replaces every "Why Choose Us" icon row on the internet.
5. **How learning works**: 4 steps, big outlined numerals, stitch-line connector drawing on scroll, copy from 8.4.
6. **Student work strip**: 6 items, scroll-snap horizontal (the only horizontal scroll on the site), technique chips in thread colors, one item is a first/mid/final progression. Link to gallery.
7. **Upcoming batches teaser**: the next 3 batches as rows from the database + `See all batches` → Admissions.
8. **Success stories**: two big humans (portrait, one Fraunces pull-quote, before → after life fact), not a grid of anonymous quote cards. Link to Stories.
9. **For businesses** (compact band, ivory-2): one line + `Explore services` + `Submit a design brief`.
10. **Latest from the studio**: 3 newest YouTube videos as curated learning cards (facade embeds), auto-refreshed.
11. **Dark CTA band** (8.10) + footer.

Footer columns: Learn (courses) · Admissions & Students (batches, handbook, verify, login when live) · Services · About & Contact (one address, one phone, WhatsApp, hours, socials) · Legal (Privacy, Terms, Admission policy, Data request, Accessibility) + language toggle + descriptor line. Bead Calc appears here only when it's real (Phase 5).

### 9.2 Courses index
Intro + 3 families, each family = heading + one-line intro + its course cards (8.6 pattern) with next-batch date pulled live. Sticky mobile action bar. Career pathway map at the bottom: a simple stitch-line diagram showing which course leads where (Foundation → machine techniques → emCAD → advanced production).

### 9.3 Course detail (template ×8)
Hero (name, outcome sentence, real project visual or 30-60s clip, meta row, `Book a free demo of this course` + `Download syllabus PDF`) → What you'll be able to create → Who it's for / who it's not for → Module-by-module syllabus (accordion; every module written as an outcome) → Machines & software you'll use (photos + names) → Practical exercises & final project → Student work from this course (incl. one progression) → Your trainer (real) → Upcoming batches (live rows) → Certificate requirements (attendance %, practical completion, final project: plain language) → FAQ (5) → Related courses → sticky demo bar. No "32 lessons · 120 students" labels unless true and useful.

### 9.4 Admissions
Steps → fees line (8.8) → full upcoming-batches table (filters by course/timing; crossfade) → student handbook (attendance policy, missed sessions, conduct, materials to bring, certificate rules) → certificate eligibility explained → FAQ (11 questions incl. "Do beginners need experience?", "Is machine practice included?", "Which language?", "Can working professionals join evening batches?", "Is online payment required?" answer: no) → admission form CTA.

### 9.5 Student Work
Filter chips by technique (thread accents) → editorial masonry (2-col mobile) → lightbox: screen-to-stitch slider where a pair exists, technique + course tag, student first name (consent-gated), a one-line learning note. Featured progressions (first exercise → mid → final) get their own row: nothing proves teaching quality better.

### 9.6 Services (B2B)
Business hero → offerings after owner verification (design development, emCAD digitizing, sample creation, stitch-path optimisation, bead/sequin planning, appliqué development, machine-ready files, corrections, production consulting, patches/job work) each with a real sample → How it works (Brief → Quote → Sample → Revisions → Delivery) → file-prep guide (what to send: formats, dimensions, colors, deadline) → brief form (section 10.6) + business wa.me prefill. No prices online; quotes by conversation.

### 9.7 About
Real story → the studio (Sumeru City Mall photos, entrance shot) → **Equipment & software** (machine wall: every machine photographed and named; emCAD noted with what students practice on) → real trainers (portrait, actual role, experience, techniques taught, one featured project, a line of teaching philosophy) → verified numbers (count-up) → what "Karma" and the crown mean to them.

### 9.8 Success Stories
6-10 named outcomes: portrait, pull-quote, background → course → what they struggled with → what they do now; video testimonials embedded where they exist.

### 9.9 Contact
WhatsApp-first → call → visit block (one official address, landmark directions, hours "open till 10:30 pm", parking note, entrance photo) → lazy map embed → `Book a studio visit` CTA.

### 9.10 Resources (Phase 4+)
Beginner guides, machine setup checklists, technique explainers, emCAD tips, common design mistakes, bilingual glossary (stitch, density, underlay, pathing, tension, appliqué...), curated YouTube lessons, career/business guidance, Bead Calc web app (Phase 5). Each article embeds one related YouTube lesson.

### 9.11 /verify/[id]
ID input or direct QR link → shows student name, course, completion date, certificate number, status. Never exposes phone numbers, attendance or documents. Anti-fraud note + "hiring? call us".

---

## 10. Systems (the "big educational platform" part)

Everything below runs on free tiers (limits and caveats in section 12). The admission system behaves like a lightweight student CRM, not an email form.

### 10.1 Admission form (/admission, 4 steps, bilingual)

1. **Contact** (minimum viable lead): preferred language, full name, WhatsApp number (mobile assumed same unless changed), email optional. If they drop after step 1, you still have a lead.
2. **Learning intent**: course (cards, not a dropdown), preferred batch/timing chips (morning/evening), current experience level, current occupation (student/homemaker/tailor/working/other).
3. **About & consent**: area of Surat, goal (one line, optional), how they heard, optional message; guardian name + phone if under 18; privacy consent checkbox + communication consent checkbox (records stored, section 15). No full address, no Aadhaar, no documents at enquiry stage.
4. **Review & submit.**

Mechanics: draft autosaves locally (a closed tab doesn't lose progress); inline validation under the exact field; honeypot + minimum-time check + Cloudflare Turnstile validated **server-side**; duplicate phone/email detection warns staff (not the applicant); source/campaign (UTM) recorded.

On submit: reference `KDS-2026-NNNN` generated → row saved → confirmation screen with two buttons (`Confirm on WhatsApp` wa.me prefill with the reference, `Save our address`) → confirmation email to applicant (if email given) + notification email to the studio → follow-up task created in the pipeline.

### 10.2 Admission pipeline (statuses, final)

```
New → Contacted → Demo/Counselling Scheduled → Studio Visit Done
    → Accepted → Enrolled
    (side states: Waitlisted · Documents Pending · Not Proceeding · Closed with reason)
```

Admin CRM: search, filters (status, course, timing, source, assigned staff), last contact + next follow-up date, internal notes, call outcomes, duplicate warnings, CSV export. **Overdue flag if no staff action within one working day of a new application** (this one rule protects lead quality more than any feature). "Enrolled" converts to a student + enrollment + batch assignment in two clicks and can print an ID card PDF (name, admission no, QR).

### 10.3 Admission automation map

```
Trigger                                  → Action                                   Tool
Application submitted                    → Ref ID, save, acknowledge, notify office  App + Resend
No staff action in 1 working day         → Overdue flag + appears in daily digest    Scheduled job
Demo/counselling scheduled               → Email with date, address, what to bring   Resend
Accepted                                 → Next-steps checklist email                Resend
Documents pending                        → One reminder after 3 days                 Scheduled job
Enrolled                                 → Student profile + timetable email         App + Resend
Batch date changed                       → Notify affected students (email + wa.me
                                           one-tap list for personal follow-up)      App
Daily 9:00 pm                            → Digest: new leads, overdue, absences      GitHub Actions cron
Weekly Sunday night                      → Full CSV backup to private repo           GitHub Actions
```

WhatsApp reality (both plans agree): automated outbound WhatsApp requires the paid Business API. The free, sustainable pattern: the system prepares perfect prefilled wa.me links and a human taps them, paired with the free WhatsApp Business app (Quick Replies for demo details/fee sheet/address, Labels matching pipeline stages, greeting message). No unofficial WhatsApp automation, ever: it risks the number being banned.

### 10.4 Attendance system (final)

**Primary: trainer roster (ships in Phase 3).** Trainer logs in → Today shows their batches → open batch → roster as large tap rows (tap = Present; long-press menu = Late/Absent/Excused; optional note) → sticky save bar with unsaved count → save writes time + trainer. Attendance **locks after a configured window (default 24h)**; later changes require a correction request with a reason, and every correction hits the audit log. Missing-attendance reminder if a session ends unmarked. Works one-handed on a phone; no tiny checkboxes.

**Deferred (Phase 5): QR check-in.** Preferred model if students reliably carry logged-in phones: trainer starts a session → a QR renders that expires in 2-3 minutes → student must be authenticated and enrolled in that batch → one submission each → trainer reviews and closes. Fallback model for this audience's reality (shared/basic phones): a locked studio kiosk device with a device token where students enter admission no + 4-digit PIN. Decide from real Phase 3 behavior. Never: permanent classroom QR posters, phone-number-only check-in, mandatory GPS, facial recognition, public attendance lists.

**Automation:** absent 3 consecutive sessions → admin alert; monthly % below threshold (default 75%) → flag list + one-tap wa.me nudge links; course completion → eligibility auto-calculated → certificate workflow opens. Nightly jobs via Supabase scheduled functions/Postgres cron.

**Reports:** daily class report, monthly batch report, per-student %, lates, consecutive absences, below-threshold list, unmarked sessions, trainer submission history, corrections report, CSV export, printable PDF, completion report.

### 10.5 Certificates and verification

Enrollment completed + eligibility met → admin clicks Issue → serverless route (pdf-lib) renders the studio's certificate template with name, course, dates, cert no `KDS-C-NNNN`, and a QR to `/verify/KDS-C-NNNN` → public verify page reads live status (issued/revoked). Print "Verify at karmadesignstudio.in/verify" on the physical certificate. Eligibility rules (attendance %, practical completion, final project) are published on Admissions so the certificate means something.

### 10.6 B2B service system

Brief form: name, company, mobile, email, product/garment type, technique, design dimensions, quantity, colour count, machine/file format needed, deadline, reference image upload, existing design file upload, notes. Files go to a **private bucket, served only via short-lived signed URLs** (commercial designs are confidential).

Pipeline: `New Brief → Requirements Review → Info Needed → Quote Prepared → Quote Sent → Approved → In Progress → Sample Shared → Revision Requested → Finalised → Delivered → Closed`. Client-facing: confirmation + reference number, a simple status page per brief, sample previews, revision comments, delivery notification. Separate pipeline from student enquiries in /admin. No payments online.

### 10.7 Offline fee ledger (adopted; records without a gateway)

Internal-only module in /admin: course fee, discount, net, instalment plan, amounts received (cash / bank transfer / direct UPI), balance, due dates, receipt number, notes; printable receipt PDF. Explicitly NOT included: pay-now buttons, checkout, payment links, card processing, automatic UPI collection. This keeps the "no payment gateway" promise while ending the paper-register problem. Owner opts in (section 18).

### 10.8 Portals

**Trainer portal (Phase 3):** Today · My Batches · Attendance · Correction requests · Module completion ticks · Materials upload (authorised) · Announcements. Trainers never see other trainers' batches, the admissions pipeline, fees, or system settings.

**Student portal (Phase 4, lite first):** Dashboard (next class, current course, attendance %, latest announcement) · Timetable · Attendance detail · Materials · Certificate status/download · Profile · Help. Auth via email magic link or email+password; never attendance access by phone number alone. Guardians of minors get a communication preference, not the student's login. Later (Phase 5+): assignments/submissions, announcements feed.

**Admin (Phase 2):** Admissions CRM · Students · Courses & modules (with translations) · Batches & schedules & holidays · Attendance oversight · Certificates · Content management (homepage numbers, gallery, testimonials, FAQs, resources) · Enquiries (student and B2B pipelines separate) · Reports (enquiry conversion, course demand, batch occupancy, attendance, lead sources, response time, completion) · Fee ledger (if opted in) · Audit logs (who, what, old value, new value, when, reason where required).

---

## 11. Data model (merged)

```
profiles / staff / trainers / students / guardians
courses / course_translations / course_modules
batches / batch_schedules / batch_trainers / holidays
applications / application_notes / application_followups / enrollments
attendance_sessions / attendance_records / attendance_corrections
certificates / certificate_verifications
service_enquiries / service_files / service_status_history / service_revisions
portfolio_items / testimonials / faqs / resources / announcements
learning_materials  (Phase 4+: assignments / submissions)
offline_fee_records / receipts        (opt-in)
notifications / notification_preferences
audit_logs
```

Key rules: RLS on every private table (students read only their own rows; trainers only their batches; public can only INSERT applications/enquiries via server routes); `attendance_records` unique on session+student; every schema change is a committed migration; consent fields (`privacy_consent_at`, `comms_consent_at`, `photo_consent`) stored with timestamps; student PII never appears in public page HTML except consent-gated first names.

---

## 12. Tech stack, free-tools map, and workflow

### 12.1 The stack (final)

```
Framework    Next.js (App Router) + TypeScript + Tailwind
Data/Auth    Supabase (Postgres, Auth, RLS, Storage, scheduled functions)
Hosting      Cloudflare Workers via OpenNext adapter (first choice)
             → fallback: Netlify free (zero-config Next SSR, commercial OK)
             → never Vercel Hobby for a business (ToS prohibits commercial use)
Email        Resend free (3,000/mo, note the 100/day cap) or Brevo (300/day)
Anti-spam    Cloudflare Turnstile (validated server-side, always)
i18n         next-intl, /en and /gu routes, messages/en.json + messages/gu.json
Fonts        next/font self-hosted: Fraunces, Rasa, Noto Serif Gujarati, Mukta Vaani
Media        next/image (AVIF/WebP); YouTube + Maps as click-to-load facades
PDF/QR       pdf-lib + qrcode in server routes (ID cards, certificates)
Analytics    GA4 + Search Console + Cloudflare Web Analytics + Microsoft Clarity
Testing      Vitest (units where logic warrants) + Playwright smoke journeys + axe scan
Dev env      GitHub + Claude Code; GitHub Codespaces when a browser-only machine is needed
Design       Figma free for wireframes if useful; the tokens in this doc are the source of truth
Uptime       UptimeRobot on / and /admission
```

### 12.2 Free-tier honesty (adopted and extended)

This is **free-first, not free-forever**. Known caveats to engineer around from day one: Supabase free has no automated backups and pauses projects after ~1 week of inactivity → our weekly GitHub Actions CSV backup doubles as a keep-alive, plus a daily lightweight health ping; Resend's 100/day cap is fine for admissions but batch-wide notifications should be queued; Cloudflare Workers free is 100k requests/day (plenty); GitHub Codespaces free hours are metered. Watchpoints go in `/docs/operations.md` with upgrade thresholds, and the domain + email-domain (SPF/DKIM for Resend) are the only expected costs.

### 12.3 Repository and workflow

Single Next.js repo. `main` = production, feature branches + PRs, preview deploys per PR. Structure (right-sized from Plan B's proposal):

```
/src/app (routes: (public) /en /gu, /admin, /trainer, /student, /api)
/src/components (marketing / portal / shared)
/src/features (admissions, attendance, courses, batches, certificates, services)
/src/lib (supabase, auth, email, validation, i18n)
/messages (en.json, gu.json)
/supabase (migrations, functions, seed)
/tests (e2e smoke: admission submit, language toggle, attendance mark, verify lookup)
/docs (architecture, content-model, security, operations, editorial-guide)
CLAUDE.md
```

Per-PR CI (GitHub Actions): typecheck, lint, build, Playwright smoke, axe scan, dependency audit. Right-sized for a solo build: smoke tests on the four money journeys, not 100% coverage theatre.

### 12.4 CLAUDE.md rules (merged; paste into the repo)

```
Never expose Supabase service-role keys or any secret in client code.
Every private table has Row Level Security; write a test proving it.
Every schema change is a committed migration; never edit prod by hand.
Never create English copy without the matching Gujarati field, and vice versa.
Never ship placeholder testimonials, trainer names, images or statistics.
No new colors, radii, shadows or type sizes outside the tokens in the plan.
No emphasis styling inside headings. Ever.
Semantic HTML first; ARIA only where semantics can't do it.
All animations respect prefers-reduced-motion and run once.
Never auto-redirect by browser language; URL decides locale.
Validate Turnstile tokens server-side on every public form.
Run typecheck, lint, build and smoke tests before calling a task done.
Latin numerals for dates, phones, IDs in both languages.
No new dependencies without a one-line justification in the PR.
```

---

## 13. The bilingual system (final)

1. **Routes decide language**: `/en/...` and `/gu/...`, with hreflang pairs on every page and correct `lang` attributes (per element for mixed-script lines). **No automatic redirect based on browser language** (corrected per Google's guidance): first-time visitors on `/` land on `/en` (or `/gu` if the owner prefers Gujarati-default: their call, section 18), and a small dismissible banner offers the other language once. An explicit toggle choice is remembered and respected thereafter.
2. **Toggle behavior**: same page in the other language, never the homepage; form progress and selected filters preserved; `English | ગુજરાતી` text labels, no flags (flags are countries, not languages).
3. **Total coverage**: nav, forms, validation errors, success screens, emails, metadata, structured data, 404, sticky bars. A site that flips to English when something goes wrong tells Gujarati users they're second-class.
4. **Editorially separate fields**: Gujarati is written, not machine-translated; course content stores `name_en`/`name_gu` etc. via `course_translations`. Owner reads all Gujarati aloud pre-launch.
5. **Script typography** per section 5.3, including Latin numerals and taller Gujarati buttons.
6. **Code-mixing on purpose**: emCAD, WhatsApp, Demo, Laser stay Latin on /gu; over-translation reads fake.
7. **Test on a low-cost Android** in both languages before every release.

---

## 14. SEO and content strategy

### 14.1 Keyword-to-page map (real offerings only; no thin location-page farms)

- "embroidery classes in surat", "embroidery course surat" → Home, Courses index
- "zardosi work classes surat", "zardosi machine course" → Zardosi page
- "computer embroidery design course", "emCAD training surat" → emCAD page
- "tufting workshop surat", "laser embroidery course" → those pages
- "machine embroidery training", "sequence work course" → family + course pages
- "embroidery design services surat", "embroidery digitizing", "embroidered patches surat" → Services
- Gujarati queries ("એમ્બ્રોઇડરી ક્લાસ સુરત", "ઝરદોશી ક્લાસ") → /gu pages via hreflang
- Brand queries → everything

### 14.2 On-page pattern

Titles ≤60 chars (`Zardosi Machine Embroidery Course in Surat | Karma Design Studio`), unique metas ≤160 with benefit + proof + CTA, exactly one H1 matching intent, H2s are the section names (already intent-shaped), lowercase hyphenated slugs. 301 every old template URL, including the misspelled `/flat-embrodary`, to the closest real page.

### 14.3 Structured data

`Organization` + `LocalBusiness` sitewide (geo, hours with the 22:30 close, one official phone, sameAs → the four real social profiles), `Course` + `CourseInstance` per course page (onsite, Surat, schedule from the DB), `FAQPage` on Admissions and course FAQs, `VideoObject` for embedded lessons, `BreadcrumbList` everywhere. Publish `/llms.txt` (what the studio is, catalog, address, hours) for AI search. Validate in the Rich Results test before launch.

### 14.4 Local moves that outrank the website itself

1. **One truth for NAP**: a single name, address and phone, identical across the site, Google Business Profile, Justdial, Instagram bio and YouTube about. Two addresses and two phones are live online today; this alone suppresses local ranking.
2. GBP: all 8 courses added as Services, shoot photos uploaded, weekly posts recycled from YouTube Shorts, WhatsApp chat enabled, Q&A seeded with the real FAQ.
3. **Review engine**: QR standee at reception → Google review link, asked at certificate handover (peak happiness). Reply to every review in its language.
4. Claim and correct the Justdial listing; add the website link.

### 14.5 Content calendar (sustainable version)

Monthly: one technique guide in English + one in Gujarati, one student case study (feeds Stories and GBP), one batch announcement, one YouTube lesson embedded into a related Resources article. That's four to five pieces a month, doable forever; Plan B's heavier calendar can resume if capacity appears.

---

## 15. Security, privacy, accessibility, performance

### 15.1 Privacy and DPDP compliance (adopted, made concrete)

The platform holds personal data of students, including minors, so India's DPDP Act 2023 and DPDP Rules 2025 apply as enforcement phases in. Ship from day one: a real bilingual privacy notice (what's collected, why, how long); consent checkboxes with stored timestamps (`privacy_consent_at`, `comms_consent_at`, `photo_consent`); a named privacy contact + grievance email on the site; a data access/correction/deletion request path (a simple form + admin workflow is enough); verifiable guardian consent for under-18 students; a written retention schedule (e.g. unconverted applications purge after 12 months); breach-response note in `/docs/security.md`. Replace the template's dead Privacy/Terms links with real pages.

### 15.2 Security controls

RLS on every private table with a test proving it; roles admin/trainer/student/guardian enforced server-side; admin MFA (Supabase TOTP); private storage buckets with short-lived signed URLs for B2B files, ID cards and certificates; upload type/size validation; rate limiting + Turnstile validated server-side on all public forms; zod validation on every route; secrets only in host env vars; separate dev and prod Supabase projects; weekly automated backups (12.2); audit logs on sensitive tables; no student PII in the GitHub repo, seeds or fixtures; HTTPS + HSTS.

### 15.3 Accessibility (WCAG 2.2 AA)

AA contrast engineered into the palette; visible focus everywhere (the stitch underline doubles as the focus style); 44-48px touch targets; labeled bilingual fields with inline errors; correct `lang` per element; reduced-motion everywhere; keyboard-operable screen-to-stitch slider and accordions; alt text that describes the embroidery ("gold zardosi peacock on maroon silk") in the page's language; forms and tables usable by screen reader; axe scan in CI with zero critical issues.

### 15.4 Performance budget

LCP < 2.5s on a mid-range Android over 4G, CLS < 0.05, public-page JS < 150KB gzipped, Lighthouse ≥ 95 mobile. How: static generation + ISR for all public pages; hero poster preloaded; fonts subset (latin + gujarati) via next/font with swap; YouTube/map facades; AVIF sized to containers with fixed aspect ratios (no shift); IntersectionObserver + CSS for all motion, zero animation libraries.

---

## 16. Content production: the one-day shoot (prerequisite)

Shot on a decent phone during a live evening batch. Consent forms signed on the spot for anyone photographed.

**Video**: 10s hero loop (software screen → machine stitching → finished piece); 45s studio tour ending on the signboard; owner/lead-trainer 30s intro in Gujarati, subtitled; two student testimonials 20-30s in Gujarati, subtitled; a 60-90s sample-lesson clip showing real teaching; 15s per-machine clips if time allows.

**Photos (~35)**: machine floor wide; every machine type close with nameplate; macro set (needle, thread, beads, sequins catching light); hands-at-work per technique; students at emCAD screens with visible design paths; the three-frame screen/machine/fabric compositions for at least 4 projects; first/mid/final progression sets for 2 students; trainer portraits at their machines; 8-10 finished pieces on clean fabric; building entrance + signboard; reception and a certificate-handover moment.

**Words from the owner**: founding story (five WhatsApp voice-note questions is enough), final catalog with durations and module topics, trainer bios, six named outcomes with consent, fee-disclosure policy, batch timetable to seed the DB.

---

## 17. Measurement

GA4 events: `demo_cta_clicked` (location), `whatsapp_clicked` (context: demo/admission/services), `call_clicked`, `admission_started`, `admission_step_completed` (step), `admission_submitted`, `brief_submitted`, `language_switched`, `sts_slider_used`, `batch_filter_used`, `verify_lookup`. Weekly 15-minute ritual: demo bookings and briefs by source, admission-form drop-off step (fix the worst one), five Clarity recordings of real form attempts, GBP calls/direction taps. The success metric in 90 days is **demo bookings per week**, not traffic.

---

## 18. Open questions for the owner (answer before Phase 1 code)

1. **The catalog (top priority).** The site says Flat/Appliqué/Cross Stitch; YouTube says Zardosi/4-Beads/Coding/Chain/Multi/Sequence/Laser/Tufting + emCAD. Which list is real, with durations and modules per course?
2. Official address: Middle Point (Mahadev Chowk) or Sumeru City Mall 3rd floor, or both locations? One becomes the NAP everywhere.
3. Phones: is +91 99043 76340 the WhatsApp number? Is the landline live? One number goes public.
4. Approve the descriptor "Embroidery Academy & Design Lab"?
5. Default language: should `/` land on Gujarati or English?
6. Fee policy: counseling-only (assumed in copy), ranges, or "starting from"? And do you want the internal fee ledger (10.7)?
7. Real trainer names, photos, permissions; the template's fake instructors are deleted regardless.
8. Six named student outcomes with photo/video consent.
9. Current Google rating and count (site says 4.9, Justdial 4.8; the live Google number wins).
10. Logo as SVG + the crown mark separately; any existing brand colors to honor.
11. Bead Calc: real store links, or remove until the Phase 5 web rebuild?
12. Existing certificate design, who signs, and the eligibility rules (attendance %, project) to publish.
13. Batch timetable (days, timings, seats) to seed the database.
14. Do you enroll under-18 students? (Triggers the guardian-consent flow.)
15. Domain/DNS and current hosting access for 301s and switchover.
16. Owner access to Instagram/Facebook/YouTube for reusing existing photos and reels.

---

## 19. Build roadmap and Claude Code prompts

Realistic solo pace with Claude Code, part-time: **8 to 12 weeks** to the end of Phase 4. Faster if full-time and the owner answers quickly.

- **Phase 0 (week 1, parallel):** section 18 answers, the shoot, logo SVG, GBP/Justdial cleanup started. No code.
- **Phase 1 (weeks 2-4):** design system + full public site EN/GU + admission and brief forms writing to Supabase + SEO/schema + deploy on the real domain with 301s.
- **Phase 2 (weeks 5-6):** /admin: admissions CRM, students, courses/batches CRUD, content management, digests, backups.
- **Phase 3 (weeks 7-8):** /trainer + attendance (roster, locking, corrections, audit), reports.
- **Phase 4 (weeks 9-10):** certificates + /verify live, ID cards, student portal lite.
- **Phase 5 (ongoing):** QR attendance (model per 10.4), course comparison tool, glossary + Resources, Bead Calc web app, B2B client status pages, assignments, fee ledger if opted in.

### 19.1 Phase 1 prompt (paste into Claude Code)

```
Build the public website for Karma Design Studio (embroidery academy + design
lab, Surat, India). Next.js App Router + TypeScript + Tailwind + next-intl
(locales en/gu, routed /en /gu). Data: Supabase (schema from plan section 11;
public pages read courses/batches/portfolio; forms INSERT via server routes
only). Deploy: Cloudflare Workers via @opennextjs/cloudflare; if the adapter
fights us for more than half a day, switch to Netlify and note it in docs.
Create CLAUDE.md from plan section 12.4 first and obey it.

DESIGN SYSTEM (exact):
Tokens: ivory #FAF6EF, ivory2 #F3EDE2, card #FFFDF8, border #DAD5CB,
ink #211D19, inkSoft #55493D, zari #C9A24B, zariDeep #8A6215,
maroon #6E1F2E (hover #5A1826), thread accents rani #C2226B, peacock
#0F6B6B, marigold #E08A00, leaf #3E7A3E (gallery tags/illustrations only).
Fonts via next/font, self-hosted, latin+gujarati subsets in BOTH locales:
Fraunces (SOFT~60), Rasa, Noto Serif Gujarati (fallback), Mukta Vaani.
:lang(gu): headings Rasa; line-height 1.8; font-size 103%; never uppercase
or letter-space Gujarati; Latin numerals everywhere.
Type scale, spacing tiers (112/88/64 standard, 64/56/48 compact), 12-col
grid max 1200px, prose 68ch, radius 12px: per plan sections 5-6.
Signature stitch motif: dashed gold SVG (2px, dash 8/6): section dividers
draw on 30% viewport entry (stroke-dashoffset 900ms, once), link/nav
underlines draw 220ms on hover AND focus-visible.
Motion: entrances fade-up 500ms cubic-bezier(.16,1,.3,1) stagger 80ms, once;
card hover translateY(-4px) + border zari + shadow 0 12px 32px
rgba(33,29,25,.12) + image scale 1.03; header 80→64px after 80px scroll;
full prefers-reduced-motion support.
Hard bans: emphasis styling inside headings, purple/blue gradients, glowing
orbs, typewriter text, carousels/auto-sliders, tilt cards, scroll-jacking,
cursor effects, lorem ipsum, stock faces, unverified numbers.

PAGES (bilingual; copy seeded from plan section 8 into messages/en.json +
messages/gu.json): Home with exactly these 11 sections: hero (video loop w/
poster fallback, eyebrow "Skill શીખો, Future બનાવો", H1/sub/CTA/proof strip
per 8.1), choose-your-path (two editorial panels, 8.2), course families (3),
screen-to-stitch interactive (3-stage slider: design→stitch path→fabric;
drag + arrow keys + tap-cycle mobile; 44px handle), how-learning-works
(4 steps, outlined numerals, stitch connector), student work strip
(scroll-snap, 6 items, thread-color chips), upcoming batches teaser (next 3
rows from DB + link), success stories (2 large), for-businesses compact band,
latest-from-studio (3 newest YouTube via channel RSS at ISR 24h, facade
embeds), dark CTA band (8.10). Courses index (3 families + pathway map),
course detail template ×8 from DB (structure per plan 9.3, incl. syllabus
accordion, machines block, certificate requirements, live batches, sticky
demo bar), Admissions (steps, fees line 8.8, full filterable batches table
with 150ms crossfade, handbook, eligibility, FAQ with FAQPage schema),
Student Work (filters, masonry, lightbox with screen-to-stitch slider,
consent-gated first names), Services (offerings, how-it-works, file-prep
guide, brief form), About, Success Stories, Contact (WhatsApp-first, lazy
map, entrance photo slot), styled 404 (copy 8.12), /verify/[id] shell.

NAV: logo+descriptor · Courses · Admissions · Student Work · Services ·
About · Contact · [EN|ગુ] · [Book Free Demo]. No contact strip in header.
Sticky mobile bottom bar on course/admissions pages: Book free demo +
WhatsApp + Call. WhatsApp FAB elsewhere after 600px, no pulse.

FORMS: /admission 4 steps per plan 10.1: local draft autosave, inline zod
errors under fields, honeypot + min-time + Turnstile VERIFIED SERVER-SIDE,
guardian fields when age<18, two consent checkboxes stored with timestamps,
duplicate phone/email flag stored for staff (not shown to applicant),
UTM capture; on submit generate KDS-YYYY-NNNN, insert, email studio via
Resend, success screen with wa.me prefill (8.11) + save-address button.
Services brief form: fields per plan 10.6, uploads to a PRIVATE Supabase
bucket, signed URLs only.

i18n BEHAVIOR: URL decides locale; no auto-redirect by browser language;
one-time dismissible banner offers the other language; toggle keeps the
same page and preserves form progress; hreflang pairs; lang attrs per
element for mixed-script lines.

SEO: titles/metas per plan 14.2; JSON-LD LocalBusiness (hours till 22:30,
sameAs), Course+CourseInstance, FAQPage, BreadcrumbList; /sitemap.xml,
/robots.txt, /llms.txt; 301s incl. /flat-embrodary → /courses/zardosi... 
(final mapping from owner's catalog answer).

LEGAL: real bilingual Privacy, Terms, Admission policy, Data-request page
(DPDP items per plan 15.1).

BUDGETS/QA: LCP<2.5s mid Android, CLS<0.05, JS<150KB gz, Lighthouse≥95;
Playwright smoke: admission submit, language toggle persistence, batches
filter, verify shell; axe zero critical; renders clean at 360/768/1280/1920;
grep build output for "lorem|validtheme|edfix|yourhandle" must return empty.
```

### 19.2 Phase 2 prompt (condensed)

```
Add /admin (Supabase Auth email OTP + TOTP MFA; roles via staff table; RLS
tests). Screens: Admissions CRM kanban with statuses from plan 10.2, overdue
flag after 1 working day, duplicate warnings, notes/followups, wa.me deep
links, filters, CSV export; Enrolled = 2-step convert (student + enrollment
+ batch) with printable ID-card PDF (pdf-lib + QR of admission_no, private
bucket + signed URL); Students; Courses/modules with en+gu translation
fields; Batches/schedules/holidays CRUD driving the public site; Content
management (portfolio w/ photo_consent gate, testimonials, FAQs, homepage
numbers); separate B2B enquiries pipeline per plan 10.6 with status history;
Reports per plan 10.4/10.8. Jobs: GitHub Actions 21:00 IST daily digest
(new/overdue leads) and weekly Sunday CSV backup to a private repo (doubles
as Supabase keep-alive). Admin uses the same tokens, denser spacing (48px
sections), data tables with sticky headers, semantic colors allowed here
only. Audit log writes on every sensitive mutation.
```

Phases 3-4 prompts follow the same pattern from plan sections 10.4-10.8 (trainer portal + roster attendance with 24h lock, correction requests and audit; then certificate issue flow + /verify live + student portal lite).

---

## 20. Explicitly NOT in the initial build (merged)

Payment gateway, checkout or pay-links of any kind; native Android/iOS apps; facial recognition or mandatory GPS attendance; unofficial WhatsApp automation; public spreadsheets with student data; a full video-streaming LMS; accounting software; an AI chatbot before admissions works; auto-playing social feeds or hero carousels; fake counters, fake reviews, generic trainer profiles, stock-photo-heavy design; constant animation. Each of these is a distraction from demo bookings or a risk to trust, data or the WhatsApp number.

---

## 21. Launch checklist

- [ ] All 16 owner answers (section 18) received and reflected; catalog conflict resolved
- [ ] Ghost-content grep clean: "lorem", "validtheme", "edfix", "yourhandle", placeholder names return nothing
- [ ] Owner has read every Gujarati line aloud and signed off
- [ ] NAP identical on site, GBP, Justdial, Instagram, YouTube; one phone, one address
- [ ] Old URLs 301 (incl. /flat-embrodary); 404 styled; Privacy/Terms/Data-request are real bilingual pages
- [ ] Forms tested on a real low-cost Android in both languages: submit → email arrives → wa.me opens with reference; Turnstile verified server-side
- [ ] Consent checkboxes storing timestamps; photo_consent gate verified on gallery queries
- [ ] RLS tested with non-admin accounts; backup Action has run once; UptimeRobot live
- [ ] Schema validates; sitemap submitted; hreflang pairs verified; GA4 + Clarity firing
- [ ] Lighthouse ≥95 mobile on Home, one course page, /admission; CLS spot-checked on /gu
- [ ] Review-QR standee printed for reception; GBP courses/photos/WhatsApp chat done
- [ ] docs/operations.md lists free-tier watchpoints and upgrade thresholds

---

*End of final plan. Phase 1 starts the day the section 18 answers and the shoot assets land.*
