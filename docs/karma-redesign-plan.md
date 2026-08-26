# Karma Design Studio: Complete Website Rebuild Plan

Prepared for the redesign of karmadesignstudio.in
Role: Senior website strategist, UX architect, typography director, layout critic, interaction designer
Stack constraint: GitHub + Claude Code + free tools only, no payment gateway
Date: July 2026

---

## 0. How to use this document

This is the master plan. Read sections 1 and 2 first (what the business actually is, and the strategy). Sections 3 to 7 are the design system: hand them to Claude Code as-is. Sections 8 to 11 are the product side: admissions, attendance, automation, bilingual system. Sections 12 to 16 are growth, checklists, and the phased build roadmap with ready-to-paste Claude Code prompts. Section 17 is the list of things to confirm with the client before you write a single line of code.

---

## 1. Research findings: what this business actually is

I went through the live site, their YouTube channel, and their public listings. The website and the real business are two different things, and that gap is the whole redesign brief.

### 1.1 The real business (from YouTube + listings, not the website)

- **Karma Design Studio & Classes**, Mota Varachha, Surat, Gujarat. Surat is India's machine embroidery capital, and Mota Varachha sits in the middle of that industry.
- Two revenue sides:
  1. **Training institute**: live machine embroidery courses. Their own words: "100% live machine practical learning in Zardosi, 4Beads, Coding, Chain, Multi, Seq, Laser, and Tufting." Plus emCAD software design training.
  2. **Design studio / job work**: custom embroidery designs, emCAD digitizing, customised embroidered patches, production job work (this side shows up on Justdial, not on their own website at all).
- Proof they already have: 4.8 stars with 147 ratings on Justdial, "500+ students trained" claim, certificates issued, open until 10:30 pm (evening batches for working people and homemakers).
- They also have a **"Bead Calc" app** (bead calculator) promoted in the site footer, with dead download links.

### 1.2 Brand personality (from their actual social voice)

Their YouTube bio is the honest brand document:

> "Surat નું one & only embroidery design training center... We don't just teach — we build embroidery professionals ready for the future... Skill શીખો, Future બનાવો – માત્ર KARMA DESIGN STUDIO માં!"

So the real personality is:
- **Energetic and proud**, not corporate. Crown emoji (👑) is part of the identity ("Karma Design Studio 👑" on Instagram).
- **Gujlish**: natural Gujarati-English code-mixing. This is how their audience talks. The current website is 100% English, which is a mismatch.
- **Practical over academic**: "100% Practical Training (No Boring Theory!)". Machines, hands, output.
- **Career-outcome focused**: job guidance, business guidance, lifetime support.

Three adjectives to design against: **crafted, confident, warm**. Not "minimal tech", not "school-like", not "luxury fashion house". A proud workshop that produces professionals.

### 1.3 Audience

Primary: Surat locals aged roughly 16 to 45.
- Students and freshers wanting an employable trade skill
- Homemakers wanting income from home or a small business
- Tailors and boutique owners upgrading to machine embroidery
- Junior designers wanting emCAD digitizing skills

They browse on **mobile, on WhatsApp, in Gujarati or Gujlish**. Decisions are made by visiting the studio or messaging on WhatsApp, not by online checkout. This is why "no payment gateway" is actually fine: the website's job is to produce **demo class bookings and WhatsApp conversations**, not transactions.

Secondary: garment businesses needing design/digitizing/job work (the Services side), and out-of-city students considering Surat training.

### 1.4 Audit of the current site (what must go)

The current site is a ThemeForest education template (ValidTheme's Edfix family) with the studio's name typed over it. Concrete evidence, all live right now:

1. **Lorem ipsum in the footer** on every page: "Bndulgence diminution so discovered mr apartments..."
2. **Template author's emails still in the contact page**: `support@validtheme.com` and `info@edfix.com.com`, plus a `mailto:name@email.com` bug in the header.
3. **Fake instructors**: stock photos with template names (Rohan Kapoor, Aisha Khan, Sanjay Gupta) that do not exist at the studio.
4. **Broken course links**: the homepage links to `/flat-embrodary` (misspelled) which returns a 404. The three "course pages" are unreachable.
5. **Wrong course list**: the site sells "Flat Embroidery, Beads, Appliqué & 3D, Cross Stitch" while the studio actually teaches Zardosi, 4-Beads, Coding, Chain, Multi, Sequence, Laser, Tufting on machines. The website is selling courses that don't match the product.
6. **Generic education illustrations** (graduation caps, laptops) that have nothing to do with embroidery, plus visible "Image Not Found" alt texts.
7. **Template metadata leftovers**: `twitter:site: @yourhandle`.
8. **No Gujarati anywhere**, no admission form, no schedule, no gallery of actual work, no services page, dead app-store buttons.
9. **Data inconsistencies to resolve**: website address says "302, Middle Point, near Dhara Arcade, Mota Varachha"; YouTube says "302, Middle Point, Mahadev Chowk"; Justdial lists "3rd Floor, Sumeru City Mall, C40". Website phone is a landline (+91 261 4521383); YouTube gives +91 99043 76340. Site claims 4.9 instructor rating; Justdial shows 4.8. Pick one truth per fact before launch (see section 17).

Verdict: nothing on the current site is worth carrying over except the domain, the logo, and the Google Maps embed. This is a rebuild, not a reskin.

---

## 2. Strategy (senior website strategist + UX architect)

### 2.1 Positioning in one line

**"Surat's live-machine embroidery training studio: learn on real machines, from working designers, in Gujarati or English."**

Everything on the site exists to prove three claims: real machines, real trainers, real outcomes.

### 2.2 The conversion model (no payment gateway needed)

Primary conversion: **Book a Free Demo Class** (form + WhatsApp confirmation).
Secondary conversions: WhatsApp chat started, call tapped, admission form submitted, service inquiry (B2B side).

The free demo is the perfect offer for this business: zero risk for the student, gets them physically into the studio where the machines sell themselves, and requires no online payment. Every page ends in it.

### 2.3 Information architecture (sitemap)

```
Public site (EN + GU on every page)
├── Home
├── Courses
│   ├── Zardosi Machine Embroidery
│   ├── 4-Beads Machine Work
│   ├── Sequence (Sequins) Work
│   ├── Coding / Cording Machine
│   ├── Chain & Multi Machine
│   ├── Laser Work
│   ├── Tufting
│   └── emCAD Embroidery Design (software)
├── Admissions          (process, batch calendar, FAQ, admission form)
├── Student Work        (gallery: filter by technique, before/after pairs)
├── Services            (B2B: custom design, emCAD digitizing, patches, job work)
├── About               (real story, the studio, machines, real trainers)
├── Success Stories     (named testimonials, businesses started, placements)
├── Contact             (map, directions, hours, WhatsApp-first)
└── /verify/[id]        (public certificate verification)

Systems (behind login)
├── /admission          (public multi-step form)
├── /kiosk              (attendance check-in screen at the studio)
├── /student            (phase 3: my attendance, my schedule, my certificate)
└── /admin              (inquiries pipeline, students, batches, attendance, certificates)
```

Eight course pages sounds like a lot, but each one is a landing page for a distinct search ("zardosi classes surat", "tufting workshop surat"). Group them visually into three families on the Courses index: **Machine Embroidery** (Zardosi, Beads, Sequence, Coding, Chain/Multi), **Modern Techniques** (Laser, Tufting), **Design Software** (emCAD). Confirm the final course list and durations with the client first.

### 2.4 Sections most template sites skip (and this site will have)

These are the sections that make an education site feel like a real institution instead of a brochure:

1. **Batch schedule with real timings.** They run evening batches until 10:30 pm. That single fact converts working people and homemakers, and no template shows it. A live "Upcoming batches" table (from the database) on the Admissions page and each course page.
2. **The Machines page/section.** Photos and names of the actual machines students train on. "Live machine training" is the differentiator; show the hardware.
3. **Module-by-module syllabus** per course, in an accordion. Specificity sells: "Week 3: frame setting and tension control" beats "comprehensive training".
4. **Who this course is for (and who it's not for).** One honest paragraph per course. Builds trust fast.
5. **Certificate verification.** Every certificate gets a QR + ID that anyone can check at /verify. Almost no local competitor has this. It makes the certificate worth more, which makes the course worth more.
6. **Outcomes wall.** Not star ratings: "Farhan added laser work to his tailoring shop and raised his rates", with a face and a first name (with consent). Businesses started, jobs landed.
7. **Visit-us block with landmark directions.** "3rd floor, Sumeru City Mall, opposite Krishna Township Road" plus parking note plus hours. Local businesses live and die on this.
8. **A real FAQ in Gujarati.** Fees policy, age, "I've never touched a machine", batch switching, missed classes, certificate validity.
9. **The Services page.** Their B2B design/job-work side currently has zero web presence. It's a second revenue stream the site should carry.
10. **A "latest from the studio" feed** auto-pulled from their YouTube channel, so the site never looks stale.

### 2.5 Above the fold (exact spec)

Mobile-first, since that's the audience:

- **Media**: a 8 to 12 second muted looping video (or high-quality photo as fallback) of machines running and hands guiding fabric, shot in their studio. Warm light. Not stock.
- **Eyebrow**: their own tagline, kept as-is because it's theirs: "Skill શીખો, Future બનાવો" (small, gold).
- **H1** (two lines max): "Learn embroidery on real machines. Build a career that's yours." / GU: "સાચા મશીન પર એમ્બ્રોઇડરી શીખો. પોતાનું કરિયર બનાવો."
- **Subline** (one sentence): "Surat's live-machine training studio for Zardosi, beads, sequence, coding, laser, tufting and emCAD design, taught hands-on by working designers."
- **One primary CTA**: "Book a Free Demo Class". One secondary text link: "See student work".
- **Proof strip** directly under the CTA: "4.8★ on Google · 500+ students trained · Evening batches till 10:30 pm" (verify the current Google rating before launch).
- **Language toggle** visible in the header at all times (EN | ગુ).

Nothing else above the fold. No carousel, no three floating badges, no chatbot bubble opening itself.

### 2.6 Layout decisions that create a premium feel

(Full specs in section 5, but these are the strategic calls.)

1. One idea per section, one section per screen-ish. Never two messages competing.
2. A committed max-width (1200px content, 68ch for running text). Premium sites feel composed because text never sprawls.
3. Asymmetric grids (7/5, 5/7) instead of everything centered. Centered everything is the default of every template.
4. Real photography at full bleed as section breaks, instead of decorative shapes.
5. A single accent color used with discipline (section 3).
6. A consistent vertical rhythm: the same section padding everywhere, so scrolling feels like a beat, not a jumble.

### 2.7 The ONE mistake that instantly makes a DIY site look cheap

**Shipping someone else's ghost content.** Lorem ipsum, stock faces posing as your team, placeholder emails, dead buttons. The current site has all four at once. Visitors may not consciously spot "validtheme.com" in the contact page, but they feel the fakeness, and for an education business, trust is the product. The rebuild rule is absolute: **every face, sentence, number, and photo on the new site must be true and theirs.** If a real asset doesn't exist yet (say, trainer photos), the section waits; it does not ship with a stand-in.

---

## 3. Visual direction (anchored to the best in this niche, not copied)

### 3.1 Anchor references

- **Primary anchor: Domestika** (the craft-education platform). What to match: a warm near-white canvas, exactly one saturated accent used sparingly, editorial serif headlines over a quiet sans body, photography of real hands doing real work, disciplined spacing, course cards with consistent image ratios, and a sticky enroll bar on course pages. What NOT to copy: their coral color, their layout, their components.
- **Secondary references**: MasterClass for the course-detail page structure (trailer video up top, syllabus accordion, instructor block); Purl Soho for warm, honest craft photography.
- **Local flavor source**: Surat textiles themselves. Zari gold, silk maroon, thread-spool colors. The palette should feel like their workshop, not like Silicon Valley.

### 3.2 Aesthetic direction: "Crafted Editorial Workshop"

Warm, editorial, photography-led, with one signature motif drawn from the craft: **the running stitch**. A dashed gold line that appears as section dividers (drawing itself on scroll), link underlines, and progress indicators. It's the one decorative idea, used consistently, everywhere. One motif used ten times beats ten motifs used once.

The crown from their logo stays, but as seasoning: favicon, certificate seal, one hero accent. Not sprayed on every card.

### 3.3 Color system (design tokens)

```
Canvas
--ivory:        #FAF6EF   page background (unbleached fabric)
--ivory-2:      #F3EDE2   alternate section background (max every 2nd section)

Ink
--ink:          #211D19   headings, primary text, dark bands, footer
--ink-soft:     #55493D   secondary text (7.2:1 on ivory, AA+)

Accent (the ONE accent)
--zari:         #C9A24B   decorative gold: stitch lines, icons, large numerals
--zari-deep:    #8A6215   gold when used as text (5.4:1 on ivory, AA)

Depth (used only for dark bands + primary buttons)
--maroon:       #6E1F2E   primary CTA background, hover #5A1826
                          (ivory text on maroon: ~9:1, AAA)

Thread accents (illustration/tags ONLY, never UI chrome)
--rani:         #C2226B   --peacock: #0F6B6B
--marigold:     #E08A00   --leaf:    #3E7A3E

Semantic
--success: #2F7D46   --error: #B3261E   --focus-ring: #8A6215
```

Rules:
- Gold is never a button fill and never body text. It is the thread: lines, underlines, icons, eyebrows, big outlined numerals.
- Maroon appears only on primary CTAs and at most one dark band per page. Scarcity is what makes it feel premium.
- Thread accents exist only inside the gallery tags and custom illustrations, so the gallery pops against a calm site.
- Every text/background pair must pass WCAG AA (4.5:1 body, 3:1 large text). The pairs above already do.

### 3.4 Imagery rules

1. Real photos only. A one-day shoot list is in section 15; nothing launches on stock.
2. One consistent edit: slight warm curve, lifted shadows, no heavy filters. Consistency reads as intentional.
3. Three photo types, used deliberately: **macro** (needle, thread, beads: hero textures), **hands-at-work** (course cards, process), **people-and-place** (trainers, students at machines, the studio: trust).
4. Every course card image is the same ratio (3:2) and crop style.
5. Before/after pairs: emCAD screen design next to the stitched result. This is their superpower; the gallery is built around it.
6. Consent: any student face or work shown requires a signed/WhatsApp-confirmed consent note (tracked in the admin panel).

### 3.5 Iconography and graphic language

- Icons: one open-source set, thin 1.5px stroke (Lucide), colored ink or zari-deep. Never multicolored icon packs.
- The stitch line: an SVG dashed path, 2px, --zari, dash 8/6, rounded caps.
- Big numerals for process steps: Fraunces, 96px, transparent fill with 1.5px --zari stroke.
- No blob shapes, no gradient meshes, no floating 3D shapes, no glowing orbs. The current template's decorative PNG "shapes" all die in the rebuild.

---

## 4. Typography (typography director)

The hard constraint most plans miss: this site is bilingual with **Gujarati script**, which has no capital letters, taller matras (vowel marks) above and below the baseline, and different rhythm than Latin. The pairing must be chosen for both scripts together, or the Gujarati version will look like an afterthought.

### 4.1 The pairing (all free, Google Fonts, self-hosted via next/font)

- **Headings, Latin: Fraunces** (variable). A warm, crafted serif with real character; set its SOFT axis around 50 to 70 so it feels hand-finished, not stiff. It reads "artisan studio", not "law firm".
- **Headings, Gujarati: Rasa** (variable, by Ek Type). A Gujarati serif designed to sit beautifully next to Latin serifs. This is the difference between a bilingual site and a translated one.
- **Body + UI, both scripts: Mukta Vaani** (by Ek Type). One family that covers Gujarati AND Latin, so mixed Gujlish sentences ("ફ્રી Demo Class બુક કરો") stay visually seamless in one font. This single decision solves 80% of bilingual typography pain.

CSS stacks:

```css
--font-display: "Fraunces", "Rasa", Georgia, serif;
--font-body:    "Mukta Vaani", system-ui, sans-serif;

/* Gujarati pages/elements */
:lang(gu) h1, :lang(gu) h2, :lang(gu) h3 { font-family: "Rasa", "Fraunces", serif; }
:lang(gu) { line-height: 1.8; }          /* matras need air */
:lang(gu) body, :lang(gu) p { font-size: 103%; }  /* optical size match */
```

Why intentional instead of default: Inter/Poppins/Montserrat everywhere is the template signature. Fraunces + Rasa + Mukta Vaani says someone chose fonts for THIS business and THIS language pair.

### 4.2 Full type scale

8px grid, base 17px. Desktop / mobile sizes.

```
Style        Font          Weight  Desktop  Mobile  Line-h  Letter-sp
Display/H1   Fraunces      560     64px     40px    1.05    -0.02em
H2           Fraunces      540     44px     32px    1.15    -0.015em
H3           Fraunces      520     30px     24px    1.25    -0.01em
H4/Card      Fraunces      500     22px     20px    1.3     -0.005em
Eyebrow      Mukta Vaani   600     13px     13px    1.4     +0.14em (Latin, uppercase)
Body Large   Mukta Vaani   400     19px     18px    1.65    0
Body         Mukta Vaani   400     17px     17px    1.7     0
Small/Meta   Mukta Vaani   500     14px     14px    1.5     +0.01em
Button       Mukta Vaani   600     16px     16px    1       +0.01em (sentence case)
Big numeral  Fraunces      400     96px     64px    1       0 (outlined)
```

Script-specific rules (this is where amateur bilingual sites fail):
- **Never uppercase or letterspace Gujarati.** Gujarati has no caps; tracking breaks matra spacing. Gujarati eyebrows use weight (600) + zari-deep color instead of caps + tracking.
- Gujarati body line-height 1.8 (vs 1.7 Latin), and 103% size, set via `:lang(gu)` as above.
- Buttons: sentence case in both languages. All-caps buttons don't translate and shout in Latin anyway.

Rhythm rules:
- Running text max-width: 68ch Latin, ~34 Gujarati words per line equivalent (the same 68ch container works).
- Paragraph spacing: 1em, never blank double gaps.
- Heading margin: 48px above, 16px below its related text (headings hug what they introduce).

### 4.3 The ONE typography habit that makes even good content look amateur

**Decorating the words instead of trusting the scale.** The current template bolds and gold-colors one random word inside every single heading ("Master **Embroidery** Build Your Future", "Beads & **Sequins**"). When everything is emphasized, nothing is, and it screams "template". The rebuild rule: emphasis comes from size, weight and position defined once in the scale above. Inside a heading, zero inline styling. In body text, italics for at most one phrase per screen, bold almost never. If a sentence needs decoration to feel important, rewrite the sentence.

---

## 5. Layout and spacing (layout critic)

### 5.1 Spacing tokens (8px grid)

```
--s-1: 4px    icon-to-label gaps
--s-2: 8px    tight internal gaps
--s-3: 16px   default component padding
--s-4: 24px   card padding, related-group gaps
--s-5: 32px   gaps between sibling components
--s-6: 48px   heading-to-block, sub-section breaks
--s-7: 64px   mobile section padding
--s-8: 96px   dark CTA band padding
--s-9: 112px  desktop section padding (the beat)
--s-10: 160px hero breathing room on large screens
```

The rule that makes it feel expensive: **gaps must be unequal on purpose.** Related things sit close (8 to 16px), groups separate clearly (24 to 32px), ideas separate decisively (64px+), sections separate on a fixed 112px beat. Cramped is when unrelated blocks share less than 32px. "Empty in the wrong way" is when whitespace is uniform: equal gaps everywhere means the eye can't find groups, so the page feels both empty and confusing at once. Whitespace is information; spend it where meaning changes.

Why generous whitespace signals premium: cheap sites fear scrolling, so they compress; the compression itself reads as anxiety. Space around a headline says "this is enough to say". It also does mechanical work: fewer elements per viewport means each gets attention, tap targets get bigger, and reading speed goes up. Whitespace is the cheapest luxury on the internet: it costs nothing and can't be faked by a template because it requires deleting things.

### 5.2 Grid

- 12-column grid, 1200px max content width, 24px gutters (16px mobile).
- Page margin: 24px mobile, 48px tablet, auto-centered desktop.
- Full-bleed allowed only for: hero media, photo bands, the dark CTA band, footer.

### 5.3 Homepage, section by section (with exact spacing)

Each section = one idea, 112px vertical padding desktop / 64px mobile unless noted.

1. **Hero** (full-bleed, min-height 88vh desktop, natural height mobile)
   Layout: content left-aligned in a 7-column block (not centered), media behind with an ink gradient scrim bottom-left for text contrast. Eyebrow → 16px → H1 → 24px → subline (max 52ch) → 32px → CTA row → 24px → proof strip. Language toggle lives in the sticky header, not in the hero.

2. **Trust bar** (compact, 48px padding, ivory-2)
   One row: Google rating · students trained · years running · "evening batches till 10:30 pm". Four facts, no icons circus, small text. This is a breath, not a section.

3. **Course families** ("What you can learn")
   H2 left-aligned + one-line intro, 48px, then 3 family cards (Machine Embroidery / Modern Techniques / Design Software) in a 3-col grid (1-col mobile), each card: photo 3:2, family name, the technique list as plain text, stitch-underline link "See courses". Card padding 24px, radius 12px, gap 32px. NOT eight tiny cards; three strong doors.

4. **The proof band: "Real machines. Real hands."** (full-bleed photo band)
   One wide photograph of the machine floor, 56vh, with a single overlaid stat pair on the ink scrim: "8 machine types on the floor · every student gets machine time". This section is why the shoot matters.

5. **How learning works** (numbered process)
   H2 + 48px + 4 steps in an asymmetric 5/7 split: big outlined numerals (01–04) left, step title + 2 lines right. Steps: Free demo class → Choose course & batch → Train daily on machines → Certificate + lifetime support. 40px between steps. The stitch line connects the numerals vertically and draws on scroll.

6. **Student work strip**
   H2 + horizontally scrollable strip of 6 gallery items (scroll-snap), each with technique tag in a thread-accent chip. One "See all student work" stitch-link. Horizontal scroll is allowed ONLY here; everywhere else the page scrolls one way.

7. **Outcomes / success stories**
   Two large testimonial blocks side by side (stacked mobile), each: portrait photo (real), one strong pulled sentence in Fraunces 30px, name + what they do now. Not a 3-card grid of star ratings; two humans, big.

8. **For businesses** (compact, ivory-2, 64px padding)
   One row: "Need designs, digitizing or job work?" + one line + secondary button to /services. Keeps B2B visible without hijacking the student journey.

9. **Latest from the studio**
   3 latest YouTube videos (auto-pulled), lazy-loaded facades. Proof of life; the site updates itself.

10. **Dark CTA band** (full-bleed, --ink background, 96px padding)
    Fraunces H2 in ivory: "Seats per batch are limited, because every student gets a machine." Subline + primary CTA (maroon) + WhatsApp secondary. Gold stitch line above and below the band.

11. **Footer** (ink)
    4 columns desktop: brand + one true sentence + socials / Courses / Visit us (full address, hours, landmark) / Get started (demo CTA, admission link, Bead Calc app links once real). Bottom row: © line, Terms, Privacy, language toggle repeat. No newsletter form in v1 (they have no newsletter operation; a dead subscribe box is ghost content).

### 5.4 Cramped/empty diagnosis rules for every other page

- If two blocks feel like one blob: their gap is under 32px or they share a background; fix the gap first, background second.
- If a section feels empty-wrong: the content is centered and floating. Anchor it left, add the stitch line or a photo, or admit the section has nothing to say and delete it.
- If a page feels long: sections are probably repeating one idea. Merge, don't shrink padding. The 112px beat is never the thing you cut.

---

## 6. Interactions and motion (interaction designer)

Global rules first: UI micro-motion 150–250ms, entrances 400–600ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`, everything runs **once** (no loops), nothing moves while the user is reading it, and every animation checks `prefers-reduced-motion` and renders the final state instantly if set.

### 6.1 The interaction set (where, trigger, spec, why)

1. **Signature: the stitch line draws itself.**
   Where: section dividers on Home, the process-steps connector, the admission form progress bar.
   Trigger: section enters viewport at 30% (IntersectionObserver), once.
   Spec: SVG `stroke-dashoffset` animates over 900ms ease-out.
   Why: it turns scrolling into their literal craft (a running stitch across the page). One meaningful motif beats ten generic animations, and it's the thing visitors will remember.

2. **Stitch-underline links.**
   Where: all text links and nav items.
   Trigger: hover / focus-visible.
   Spec: dashed gold underline draws left→right, 220ms; stays while focused.
   Why: cohesive with the motif; makes focus states beautiful instead of an afterthought (keyboard users get the same delight).

3. **Course card lift.**
   Where: course family cards, course cards, gallery cards.
   Trigger: hover / focus-within.
   Spec: `translateY(-4px)`, shadow `0 12px 32px rgba(33,29,25,.12)`, inner image scales 1.04 inside `overflow:hidden`, 250ms.
   Why: standard, but done consistently it communicates "everything here is alive and clickable". Restraint (4px, not 12px) is what keeps it premium.

4. **Before/after slider.**
   Where: Student Work gallery items that have an emCAD design + stitched result pair; one featured pair on Home.
   Trigger: drag handle, arrow keys, or tap-to-toggle on mobile.
   Spec: clip-path reveal following the handle, no animation lag, handle is a 44px target.
   Why: this is interactive proof of skill. A visitor drags once and understands the entire value proposition without reading a word.

5. **Stat count-up.**
   Where: trust bar and About achievements.
   Trigger: 40% visible, once.
   Spec: 800ms count from 0, then a small gold stitch tick appears under the number.
   Why: draws the eye to proof at the exact moment it scrolls in; running once keeps it honest.

6. **Hero entrance.**
   Trigger: page load.
   Spec: headline lines fade-up with 80ms stagger, 500ms; media has no motion beyond the video itself.
   Why: a composed first breath. No parallax, no zooming Ken Burns.

7. **Header condense.**
   Trigger: scroll past 80px.
   Spec: height 88→64px, background ivory at 95% + hairline bottom border, 200ms.
   Why: keeps the demo CTA and language toggle reachable forever without a heavy sticky bar.

8. **Language toggle.**
   Trigger: tap EN | ગુ pill.
   Spec: pill thumb slides 150ms, content crossfades 150ms, choice persists (URL + localStorage).
   Why: switching languages should feel like flipping fabric, not reloading a different website.

9. **Sticky mobile action bar** (course + admissions pages).
   Trigger: scroll past hero.
   Spec: bottom bar slides up once: "Book free demo" (maroon) + WhatsApp icon button. 64px tall, safe-area aware.
   Why: on mobile, the conversion action should never be more than one thumb-length away.

10. **Form step transitions** (admission form).
    Trigger: next/back.
    Spec: 24px slide + fade, 200ms; the stitch progress line fills per step.
    Why: momentum. Multi-step forms convert when each step feels like progress, not like a new form.

### 6.2 The line between tasteful detail and distracting gimmick

A detail is tasteful when it (a) means something in this craft or aids orientation, (b) runs once and gets out of the way, (c) finishes in under half a second for UI feedback, and (d) never moves text someone is reading. It becomes a gimmick the moment it loops, follows the cursor, autoplays through content, or exists because it looked cool on Awwwards. Banned on this project: typewriter headlines, particle/thread effects chasing the mouse, tilt-on-hover 3D cards, autoplaying carousels, scroll-jacking, confetti, and any animation on the Gujarati/English toggle longer than 150ms (bilingual users flip constantly; make it instant-feeling).

---

## 7. Copy deck (real copy, EN + GU)

Voice rules: short sentences, concrete facts, warm confidence, natural Gujlish where it helps ("ફ્રી Demo Class"). Their own lines are kept because they're genuinely good: "Skill શીખો, Future બનાવો" and "We don't just teach, we build embroidery professionals." Numbers only when true. Zero buzzwords ("empower", "unleash", "world-class" are all banned).

Gujarati note: the copy below is written carefully, but the owner (a native Surti speaker) must read every Gujarati line aloud before launch and adjust to their tone. That review pass is a launch requirement, not a nice-to-have.

### 7.1 Hero

- Eyebrow: `Skill શીખો, Future બનાવો`
- H1 EN: `Learn embroidery on real machines. Build a career that's yours.`
- H1 GU: `સાચા મશીન પર એમ્બ્રોઇડરી શીખો. પોતાનું કરિયર બનાવો.`
- Sub EN: `Surat's live-machine training studio for Zardosi, beads, sequence, coding, laser, tufting and emCAD design, taught hands-on by working designers, with lifetime support.`
- Sub GU: `ઝરદોશી, બીડ્સ, સિકવન્સ, કોડિંગ, લેસર, ટફ્ટિંગ અને emCAD ડિઝાઇન: બધું જ લાઇવ મશીન પર, અનુભવી ડિઝાઇનર્સ પાસેથી, હાથે કરીને શીખો. લાઇફટાઇમ સપોર્ટ સાથે.`
- CTA EN: `Book a Free Demo Class` · GU: `ફ્રી ડેમો ક્લાસ બુક કરો`
- Secondary EN: `See student work` · GU: `સ્ટુડન્ટ્સનું કામ જુઓ`
- Proof strip EN: `4.8★ on Google · 500+ students trained · Evening batches till 10:30 pm`
- Proof strip GU: `Google પર 4.8★ · 500+ સ્ટુડન્ટ્સ ટ્રેઇન્ડ · સાંજની બેચ 10:30 સુધી`

### 7.2 Course family intros (Courses index)

- Machine Embroidery EN: `The work Surat is famous for. Zardosi, 4-beads, sequence, coding and chain/multi, learned the only way that works: at the machine, with a trainer beside you.`
- Machine Embroidery GU: `જે કામ માટે સુરત જાણીતું છે એ જ કામ. ઝરદોશી, 4-બીડ્સ, સિકવન્સ, કોડિંગ અને ચેઇન/મલ્ટી: મશીન પર બેસીને, ટ્રેનર સાથે શીખો. એ જ સાચી રીત છે.`
- Modern Techniques EN: `Laser work and tufting: the newer skills boutiques and studios are hiring for right now.`
- Design Software EN: `emCAD embroidery design: create the designs the machines stitch. The skill that turns an operator into a designer.`

### 7.3 Course detail sample (Zardosi page, reusable pattern)

- H1: `Zardosi Machine Embroidery` / `ઝરદોશી મશીન એમ્બ્રોઇડરી`
- Lead EN: `From frame setting and needle control to bridal-grade production work, on live zardosi machines from day one.`
- Lead GU: `ફ્રેમ સેટિંગ અને નીડલ કંટ્રોલથી લઈને બ્રાઇડલ-ગ્રેડ પ્રોડક્શન કામ સુધી: પહેલા દિવસથી જ લાઇવ ઝરદોશી મશીન પર.`
- Who it's for EN: `For beginners who've never touched a machine, tailors adding zardosi to their shop, and homemakers who want paying work from a real skill. No experience needed; bring your interest, we bring the machines.`
- Facts row: `Duration: __ weeks · Batches: morning / evening (till 10:30 pm) · Language: ગુજરાતી + Hindi + English · Certificate on completion, verifiable online`
- Sticky bar: `Book a free demo of this course` / `આ કોર્સનો ફ્રી ડેમો બુક કરો`

(Module lists come from the client; write each module as an outcome: "Week 2: tension control, so your stitches stop breaking.")

### 7.4 Why-us section

- H2: keep theirs, cleaned: EN `We don't just teach. We build embroidery professionals.` GU `અમે માત્ર શીખવતા નથી. અમે એમ્બ્રોઇડરી પ્રોફેશનલ્સ બનાવીએ છીએ.`
- Four proof points (one line each):
  1. EN `100% live machine practice. Theory only where it makes your hands better.` GU `100% લાઇવ મશીન પ્રેક્ટિસ. થિયરી એટલી જ, જેટલી કામમાં આવે.`
  2. EN `Trainers who do this work for a living, not just teach it.`
  3. EN `Batches sized so every student gets machine time. That's why seats are limited.`
  4. EN `Lifetime support after the course: job guidance, business guidance, and answers on WhatsApp.` GU `કોર્સ પછી પણ લાઇફટાઇમ સપોર્ટ: જોબ ગાઇડન્સ, બિઝનેસ ગાઇડન્સ અને WhatsApp પર જવાબ.`

### 7.5 Admissions page

- H1 EN: `Joining is simple. Start with a free demo.` GU: `જોડાવું સાવ સરળ છે. શરૂઆત ફ્રી ડેમોથી કરો.`
- Steps: `1. Message us or walk in · 2. Attend a free demo class · 3. Pick your course and batch · 4. Fill the admission form · 5. Start at the machines`
- Fees line (no gateway, no games) EN: `Fees depend on the course and batch. We'll share the exact fee at your demo or on WhatsApp, before you decide anything. No online payment is needed to book a demo.` GU: `ફી કોર્સ અને બેચ પ્રમાણે હોય છે. ડેમો વખતે અથવા WhatsApp પર અમે ચોક્કસ ફી જણાવીશું, તમે નિર્ણય લો એ પહેલાં. ડેમો બુક કરવા કોઈ ઓનલાઇન પેમેન્ટ જરૂરી નથી.`

### 7.6 Dark CTA band

- EN: `Seats per batch are limited, because every student gets a machine. Book your free demo this week.`
- GU: `દરેક સ્ટુડન્ટને મશીન મળે એ માટે બેચમાં સીટ લિમિટેડ છે. આ અઠવાડિયે તમારો ફ્રી ડેમો બુક કરો.`

### 7.7 WhatsApp prefills (wa.me links)

- Demo booking: `Hi Karma Design Studio! 👑 મને ફ્રી ડેમો ક્લાસ બુક કરવો છે. નામ: ____ | કોર્સ: ____ | સમય: સવાર/સાંજ`
- Admission ref confirm: `Hi! My admission form reference is KDS-____. Please confirm my seat. / મારો એડમિશન રેફરન્સ KDS-____ છે. મારી સીટ કન્ફર્મ કરશો.`
- Services inquiry: `Hi! I need embroidery design / digitizing / job work. Details: ____`

### 7.8 Microcopy

- Form success: EN `Done! Your reference is KDS-____. Tap below to confirm on WhatsApp.` GU `થઈ ગયું! તમારો રેફરન્સ KDS-____ છે. WhatsApp પર કન્ફર્મ કરવા નીચે ટૅપ કરો.`
- Empty gallery filter: `No pieces in this technique yet. New student work is added every month.`
- 404: EN `This page slipped a stitch.` + links home/courses. GU `આ પેજનો ટાંકો છૂટી ગયો.`
- Verify result: `✔ Verified: this certificate was issued by Karma Design Studio & Classes, Surat.`

---

## 8. Page-by-page blueprints (beyond Home)

**Courses index**: intro line → 3 family blocks, each family = heading + one-line intro + its course cards (photo, name EN/GU, duration, next batch date pulled live, stitch-link). Sticky mobile action bar.

**Course detail (template ×8)**: Hero (name, lead, facts row, 30–60s vertical video if available) → Who it's for → What you'll learn (module accordion) → The machines you'll use (photos + names) → Student work from this course (4 items) → Your trainer (real person) → Upcoming batches (live table: batch name, days, time, seats left) → FAQ (5) → sticky demo bar.

**Admissions**: steps → fees policy line → upcoming batches table (all courses) → what to bring / rules → FAQ (10, bilingual) → admission form CTA. The form itself lives at /admission (see section 9).

**Student Work**: filter chips by technique (thread-accent colors) → masonry-ish responsive grid (2-col mobile) → items open a lightbox with before/after slider where a pair exists, technique tag, course link, student first name (with consent).

**Services (B2B)**: hero for businesses → 4 offerings (custom design, emCAD digitizing, embroidered patches, production job work) each with a real sample photo → how ordering works (3 steps) → turnaround/minimums note (from client) → inquiry form + WhatsApp. Separate wa.me prefill so business leads are distinguishable.

**About**: the real story (from the owner interview) → the studio (Sumeru City Mall photos, floor shots) → machine wall (grid of machines with names) → real trainers (photo, name, specialty, years) → numbers (count-up) → crown note: what "Karma" means to them.

**Success Stories**: 6–10 named outcomes, each: portrait, one Fraunces pull-quote, "before → after" life fact ("tailor → runs a 3-machine unit"). Video testimonials embedded where they exist (they have YouTube).

**Contact**: WhatsApp-first (big button) → call → visit block: full address with landmark directions + hours ("open till 10:30 pm") → embedded map (already have the embed) → "which door to enter" photo of the building entrance (genuinely reduces no-shows).

**/verify/[id]**: certificate ID input or direct QR link → shows: student first name, course, completion date, certificate number, issue status. Anti-fraud line + "hiring? call us" note.

---

## 9. Systems: admissions, attendance, certificates, automation (no payment gateway)

All of this runs on free tiers. The database is Supabase (Postgres + auth + row-level security, free tier: 500MB DB, 50k monthly auth users, plenty for a studio of this size).

### 9.1 Data model

```
students     id, admission_no (KDS-2026-0142), full_name, phone, whatsapp,
             email?, guardian_phone?, area, language_pref, photo_consent bool, created_at
courses      id, slug, name_en, name_gu, family, duration_weeks, modules jsonb, active
batches      id, course_id, label, days (e.g. Mon–Sat), start_time, end_time,
             start_date, seats, trainer_id, status
enrollments  id, student_id, batch_id, status (applied|approved|active|completed|dropped), joined_on
attendance   id, enrollment_id, date, status (present|absent|late),
             method (kiosk|manual), marked_by, marked_at   [unique: enrollment_id+date]
certificates id, cert_no (KDS-C-0231), enrollment_id, issued_on, grade?, pdf_url
inquiries    id, name, phone, course_interest, preferred_time, source, message,
             status (new|contacted|demo_booked|joined|closed), locale, created_at
staff        id, name, role (admin|trainer), auth_user_id
```

Access rules (Supabase RLS): public can INSERT into inquiries only (through the API route, rate-limited). Students read only their own rows. Trainers read/write attendance for their batches. Admin sees everything. No student data is ever rendered on public pages except first names in the gallery/stories with `photo_consent = true`.

### 9.2 Admission form mechanism (/admission)

Five short steps, one thought per screen, mobile-first, bilingual labels on every field:

1. Language + name + WhatsApp number (that's the minimum viable lead; if they drop here, you still have a lead)
2. Course interest (cards, not a dropdown) + preferred timing (morning/evening chips)
3. About you: age band, area of Surat, current situation (student/homemaker/tailor/working/other)
4. How did you hear about us + anything to ask (optional textarea)
5. Review → Submit

On submit:
- Insert into `inquiries`, generate reference `KDS-YYYY-NNNN`
- Success screen: reference number + two buttons: **"Confirm on WhatsApp"** (wa.me prefilled with the reference) and **"Save our address"** (opens the map link). The WhatsApp tap is the real confirmation loop and costs nothing.
- Email notification to the studio inbox (Resend free tier, 3,000 emails/month, or Brevo 300/day) with the lead details.
- Anti-spam without annoying anyone: honeypot field + minimum-time check + Cloudflare Turnstile (free, invisible mode).

Admin then works the pipeline in /admin: `new → contacted → demo booked → joined → closed`. "Joined" converts an inquiry into a `student` + `enrollment` in two clicks and assigns a batch. From there the system can print a **student ID card page** (name, photo optional, admission no, QR of their ID) as a PDF for lamination.

### 9.3 Attendance system

Two modes, because redundancy beats elegance in a busy studio:

**Mode A, trainer roster (primary).** /admin/attendance → pick batch → today's roster appears as big tap targets: one tap Present, long-press for Late/Absent. Marking a 15-student batch takes under 30 seconds. Works on the trainer's phone. Writes `method = manual`.

**Mode B, kiosk (optional, month 2).** An old phone/tablet at the entrance runs /kiosk in locked fullscreen with a device token. Student scans the QR on their ID card (or types admission number + 4-digit PIN). Screen flashes their name + "હાજરી લાગી ✔". Writes `method = kiosk`. The token means the page only works on that device, which blunts remote buddy-punching.

Reporting: student portal shows "My attendance: 86% this month" with a stitch-styled progress line. Admin sees per-batch heatmaps, and a monthly job flags anyone under 75% with a one-tap wa.me nudge link ("અમે તમને ક્લાસમાં miss કરીએ છીએ! આ અઠવાડિયે આવો છો ને?").

### 9.4 Certificates + verification

- Admin marks an enrollment `completed` → clicks "Issue certificate" → serverless route generates a PDF (pdf-lib) on the studio's certificate template: name, course, dates, cert number, and a **QR pointing to /verify/KDS-C-0231**.
- /verify/[id] is public: shows first name, course, completion date, status. This makes every certificate they've ever issued more valuable, and it's a feature no local competitor has. Print "Verify this certificate at karmadesignstudio.in/verify" on the physical certificate.

### 9.5 Automation map (free)

```
Trigger                          → Action                                  Tool
New inquiry submitted            → Email to studio + appears in /admin     Resend/Brevo + Supabase
Daily 9:00 pm                    → Digest email: today's leads, absences   GitHub Actions cron → API route
Batch starts in 3 days           → Admin gets list + wa.me remind links    GitHub Actions cron
Attendance < 75% (monthly)       → Flag list + one-tap nudge links         Supabase scheduled function
Enrollment completed             → Certificate issue prompt in /admin      App logic
New YouTube upload               → "Latest from the studio" refreshes     YouTube RSS at ISR revalidate (24h)
Weekly Sunday night              → Full DB export CSV to private repo      GitHub Actions (backup)
Sitemap on deploy                → /sitemap.xml regenerated                Next.js route
```

**Honest WhatsApp note**: truly automatic outbound WhatsApp messages require the paid WhatsApp Business API. The free, sustainable pattern is the one above: the system prepares perfect prefilled wa.me links and the human taps them. Pair it with the free **WhatsApp Business app** on the studio phone: set up Quick Replies (demo details, fee sheet, address), Labels matching the pipeline stages, and a greeting message. That combination feels automated to the student and costs zero.

---

## 10. Tech stack and free-tools map

```
Code + CI        GitHub (repo, Actions, Issues as task board)
Build            Claude Code (scaffold, components, i18n, admin, everything)
Framework        Next.js 14 App Router + Tailwind CSS
Hosting          Netlify free (commercial use allowed, supports Next SSR)
                 or Cloudflare Pages. Note: Vercel's free Hobby tier
                 prohibits commercial use, so don't launch a business on it.
Database/Auth    Supabase free tier (Postgres, Auth, RLS, storage for images)
Email            Resend free (3k/mo) or Brevo free (300/day)
Forms protection Cloudflare Turnstile (free)
i18n             next-intl (locale routing /en /gu, message files)
Fonts            next/font self-hosted: Fraunces, Rasa, Mukta Vaani
                 (subset latin + gujarati; no external font requests)
Images           next/image, AVIF/WebP, Supabase storage or /public
Video            YouTube unlisted embeds with a click-to-load facade
Maps             Existing Google Maps embed, lazy-loaded
Analytics        GA4 + Google Search Console + Microsoft Clarity (free heatmaps
                 + session recordings: gold for watching real admission-form behavior)
PDF              pdf-lib in a serverless route (ID cards, certificates)
QR               qrcode npm package
Uptime           UptimeRobot free monitor on / and /admission
```

Repo structure: single Next.js repo. `main` = production, `dev` branch for work, PR previews via Netlify. Content that changes often (batches, courses, gallery) lives in the database and is edited from /admin, so the owner never needs GitHub.

---

## 11. The bilingual system (doing Gujarati properly)

1. **Routing**: `/en/...` and `/gu/...` with next-intl. First visit: detect from browser, then remember the choice. The toggle (EN | ગુ) sits in the header on every page and swaps to the same page in the other language, never to the homepage.
2. **Full translation, not partial**: nav, forms, validation errors, success screens, footer, 404, admission form, and the sticky bars. A site that switches to English the moment something goes wrong tells Gujarati users they're second-class.
3. **Typography per script**: the `:lang(gu)` rules from section 4 (Rasa headings, 1.8 line-height, 103% size, never caps/tracking).
4. **hreflang** pairs on every page + `lang` attributes per element so screen readers and Google both understand.
5. **Translation workflow**: copy lives in `messages/en.json` and `messages/gu.json`. Claude Code drafts both; the owner reviews Gujarati aloud (section 7 rule); changes are one-line JSON edits.
6. **Code-mixing is allowed on purpose**: keep terms the trade actually uses in Latin script even on the Gujarati side (emCAD, WhatsApp, Demo Class, Laser). Over-translating trade words reads as fake.

---

## 12. SEO and local growth

### 12.1 Keyword targets (each maps to a page that now exists)

- "embroidery classes in surat" / "embroidery course surat" → Home, Courses
- "zardosi work classes surat", "aari zardosi course" → Zardosi page
- "computer embroidery design course" / "emCAD course" → emCAD page
- "tufting workshop surat", "laser embroidery course" → those pages
- "embroidery design job work surat", "embroidery digitizing" → Services
- Gujarati queries ("એમ્બ્રોઇડરી ક્લાસ સુરત") → /gu pages with hreflang
- Brand: "karma design studio surat" → everything

### 12.2 On-page pattern

- Title: `Zardosi Machine Embroidery Course in Surat | Karma Design Studio` (≤60 chars)
- Meta: benefit + proof + CTA in ≤160 chars, unique per page
- One H1 per page matching intent; H2s from the section names (they're already intent-shaped)
- Descriptive slugs, lowercase, hyphens (`/courses/zardosi-machine-embroidery`); fix and 301 the old broken `/flat-embrodary`-style URLs

### 12.3 Schema (JSON-LD, sitewide + per page)

- `LocalBusiness` (with geo, hours including the 10:30 pm close, sameAs → their four social profiles)
- `Course` + `CourseInstance` per course page (mode: onsite, location Surat, schedule)
- `FAQPage` on Admissions and course FAQs
- `VideoObject` for embedded YouTube pieces
- `BreadcrumbList` everywhere

### 12.4 Local moves that matter more than the website

1. **Fix NAP everywhere**: one address, one phone, identical on the site, Google Business Profile, Justdial, Instagram bio, YouTube about. Right now there are two addresses and two phones in the wild; Google hates that (see section 17).
2. Google Business Profile: add all 8 courses as Services, upload the shoot photos, post weekly (reuse YouTube Shorts), enable WhatsApp chat.
3. **Review engine**: a small QR standee at the reception desk → Google review link. Ask at the moment of certificate handover (peak happiness). Reply to every review, in the language it was written.
4. Justdial listing: claim it, fix the address, add the website link.
5. AI-search readiness: publish `/llms.txt` (what the studio is, courses, address, hours), keep FAQ schema, and put one cited fact on key pages (e.g. link the Google rating).

---

## 13. Performance, accessibility, security

**Performance budget**: LCP < 2.5s on mid-range Android over 4G, CLS < 0.05, public-page JS < 150KB gzipped, Lighthouse ≥ 95. How: static generation + ISR for all public pages, hero image/video poster preloaded, fonts subset + `font-display: swap` via next/font, YouTube/map facades (no third-party JS until tap), AVIF images sized to their containers, zero animation libraries (IntersectionObserver + CSS only).

**Accessibility**: AA contrast (already engineered into the palette), visible focus states (the stitch underline doubles as the focus style), 44px touch targets, labeled bilingual form fields with inline errors, `lang` attributes per element, reduced-motion support (section 6), alt text that describes the embroidery ("gold zardosi peacock on maroon silk"), keyboard-operable before/after slider.

**Security and privacy**: RLS as in 9.1; admin/trainer login via Supabase email OTP (no passwords to leak); Turnstile + honeypot + rate limits on all public forms; zod validation server-side; secrets only in host env vars; students' phone numbers never in public HTML; a real privacy policy (what's collected, why, retention) replacing the template's; photo-consent flag enforced in gallery queries; weekly automated DB backup (section 9.5); HTTPS + HSTS.

---

## 14. Content production: the one-day shoot (prerequisite, not optional)

Shot on a decent phone + ₹0 extra. Shoot during a live evening batch for real energy.

**Video (vertical + horizontal versions)**
1. 10s hero loop: machines running, hands guiding fabric, thread spools (no faces needed)
2. 45s studio tour ending on the signboard
3. Owner/lead trainer 30s intro, in Gujarati, subtitled
4. Two student testimonials, 20 to 30s each, Gujarati, subtitled
5. One per-course clip if time allows (even 15s of the machine working)

**Photos (~30)**: machine floor wide; each machine type close; macro thread/beads/needle set (5+); hands-at-work per technique (8); trainer portraits at their machines; 6 to 10 finished pieces on clean fabric background; 4+ emCAD-screen-and-stitched-result pairs; building entrance + signboard (for the Contact page); reception/certificate handover moment.

**Words to collect from the owner**: the founding story (5 questions on a WhatsApp voice note is enough), final course list with durations and module topics, real trainer names/specialties, 6 real student outcomes with consent, the fee-disclosure policy, batch timetable.

---

## 15. Build roadmap (phases + Claude Code prompts)

**Phase 0, week 1: truth-gathering.** Section 17 answers + the shoot + logo SVG. No code.

**Phase 1, weeks 2–3: design system + public site.** All public pages EN/GU, inquiry + admission forms writing to Supabase, deployed to Netlify on the real domain with redirects from old URLs.

**Phase 2, week 4: /admin.** Inquiry pipeline, students, batches, enrollment, trainer attendance roster, CSV export, daily digest.

**Phase 3, week 5: trust systems.** Certificates + /verify, student ID cards, kiosk mode, student portal lite (attendance %, schedule, certificate download).

**Phase 4, ongoing**: YouTube auto-feed, blog if desired, GBP posting rhythm, Clarity-driven form tweaks, review engine.

### 15.1 Claude Code prompt, Phase 1 (paste-ready)

```
Build the public website for Karma Design Studio (embroidery training studio,
Surat, India). Next.js 14 App Router + Tailwind + next-intl (locales: en, gu;
routed /en /gu, toggle persists). Supabase for data (tables per the schema
I'll paste from section 9.1 of the plan). Deploy target: Netlify.

DESIGN SYSTEM (implement exactly):
- Tokens: ivory #FAF6EF, ivory2 #F3EDE2, ink #211D19, inkSoft #55493D,
  zari #C9A24B, zariDeep #8A6215, maroon #6E1F2E (hover #5A1826),
  thread accents rani #C2226B, peacock #0F6B6B, marigold #E08A00, leaf #3E7A3E.
- Fonts via next/font (self-host, latin+gujarati subsets): Fraunces
  (display, SOFT axis ~60), Rasa (Gujarati headings), Mukta Vaani (body/UI).
  :lang(gu) rules: headings use Rasa; line-height 1.8; font-size 103%;
  never uppercase or letter-space Gujarati.
- Type scale: H1 64/40 lh1.05 ls-0.02em; H2 44/32 lh1.15; H3 30/24 lh1.25;
  card 22/20; body 17 lh1.7; bodyLg 19 lh1.65; small 14; eyebrow 13
  caps +0.14em (Latin only); buttons 16/600 sentence case.
- Spacing: 8px grid; section padding 112px desktop / 64px mobile;
  content max-w 1200px; prose max-w 68ch; card radius 12px.
- Signature motif: dashed gold SVG "stitch line" (2px, dash 8/6):
  section dividers that draw on 30% viewport entry (stroke-dashoffset,
  900ms, once), link/nav hover+focus underlines drawing left-to-right 220ms.
- Motion: entrances fade-up 500ms cubic-bezier(0.16,1,0.3,1), stagger 80ms,
  run once; card hover translateY(-4px) + shadow 0 12px 32px rgba(33,29,25,.12)
  + inner image scale 1.04; header condenses 88->64px after 80px scroll;
  full prefers-reduced-motion support (render final states).
- Anti-patterns (hard bans): no purple/blue gradients, no glowing orbs,
  no typewriter text, no autoplay carousels, no tilt cards, no scroll-jacking,
  no bold/colored words inside headings, no lorem ipsum anywhere.

PAGES (all bilingual; copy is in messages/en.json + messages/gu.json,
seeded from section 7 of the plan): Home (11 sections per plan 5.3),
Courses index (3 families), 8 course detail pages from a single template
(content from Supabase `courses`), Admissions (+ live upcoming-batches
table from `batches`), Student Work gallery (filter chips, lightbox,
before/after slider: draggable clip-path, keyboard accessible, 44px handle),
Services, About, Success Stories, Contact (WhatsApp-first, existing Google
Maps embed lazy-loaded), styled 404, /verify/[id] placeholder.

FORMS: /admission 5-step form (steps per plan 9.2), slide+fade 200ms
between steps, stitch progress bar, bilingual labels + zod validation
+ honeypot + min-time check + Cloudflare Turnstile; writes to `inquiries`
via a server route; success screen shows reference KDS-YYYY-NNNN with
"Confirm on WhatsApp" wa.me prefill (plan 7.7) and sends a notification
email via Resend. Short inquiry form on Services with its own wa.me prefill.

MOBILE: sticky bottom action bar on course + admissions pages
("Book free demo" maroon + WhatsApp icon), safe-area aware; WhatsApp FAB
elsewhere appearing after 600px scroll, no pulsing.

SEO: unique title/meta per page per plan 12.2; JSON-LD LocalBusiness
(hours till 22:30, sameAs social links), Course+CourseInstance on course
pages, FAQPage on Admissions, BreadcrumbList; /sitemap.xml, /robots.txt,
/llms.txt; hreflang en/gu pairs; 301s from old template URLs.

PERFORMANCE BUDGET: LCP<2.5s mid Android, CLS<0.05, public JS<150KB gz,
Lighthouse>=95; ISR for public pages; YouTube + map click-to-load facades;
AVIF via next/image.

QA: renders clean at 360, 768, 1280, 1920; Gujarati toggle keeps you on
the same page; all interactive elements keyboard-reachable with visible
stitch focus states; axe has no critical issues; forms verified writing
to Supabase; reduced-motion verified.
```

### 15.2 Claude Code prompt, Phase 2 (condensed)

```
Add /admin to the same repo (Supabase Auth email OTP; roles admin/trainer
via `staff`). Screens: Inquiries kanban (new/contacted/demo booked/joined/
closed; card shows name, course, timing, wa.me deep link; "joined" opens a
2-step convert flow creating student + enrollment with batch assignment),
Students (search, profile, consent flag, printable ID card PDF via pdf-lib
with QR of admission_no), Courses & Batches CRUD (drives the public site),
Attendance: batch roster for a date with big tap targets (tap=present,
long-press menu late/absent), unique enrollment+date, works on phones.
CSV export per table. Nightly 9pm digest email (GitHub Actions cron ->
API route): today's inquiries + absences. Weekly DB CSV backup action to a
private repo. RLS enforced per plan 9.1; admin UI same design system,
denser spacing (section padding 48px), data tables with sticky headers.
```

(Phase 3 prompt follows the same pattern: certificate issue flow + PDF + /verify live + /kiosk with device token + /student portal.)

---

## 16. Measurement

GA4 events: `demo_cta_clicked` (location property), `whatsapp_clicked` (context: demo/admission/services), `call_clicked`, `admission_started`, `admission_step_completed` (step), `admission_submitted`, `language_switched`, `gallery_ba_slider_used`, `verify_lookup`. Weekly 15-minute ritual: leads by source, form drop-off step (fix the worst one), Clarity recordings of 5 admission attempts, GBP calls/directions. Success in 90 days = demo bookings per week, not traffic.

---

## 17. Open questions for the client (answer before Phase 1)

1. Address: Middle Point (Mahadev Chowk) or Sumeru City Mall 3rd floor, or both locations? One must become the official NAP everywhere.
2. Phones: is +91 99043 76340 the WhatsApp number? Is the landline still live? Which one goes on the site?
3. Final course list, durations, and module topics for all 8 (the current site's "Flat/Appliqué/Cross Stitch" list doesn't match YouTube's Zardosi/Coding/Tufting list: which is the real catalog?).
4. Fee policy: publish ranges, "starting from", or counseling-only (the site copy in 7.5 assumes counseling-only)?
5. Real trainer names, photos, permissions. The template's fake instructors must be replaced or the section is cut.
6. Six real student outcomes with photo/video consent.
7. Current Google rating and review count (site says 4.9, Justdial 4.8; use the live Google number).
8. Logo as SVG + the crown mark separately; any existing brand colors to honor.
9. Bead Calc app: real store links, or remove from the footer until it ships.
10. Existing certificate design to adapt, and who signs certificates.
11. Batch timetable (days, timings, seats per batch) to seed the database.
12. Domain/DNS access, and who owns the current hosting (for 301s and switchover).

---

## 18. Launch checklist

- [ ] Every section 17 answer received and reflected
- [ ] Zero ghost content: search build output for "lorem", "validtheme", "edfix", "yourhandle", placeholder names
- [ ] Owner has read all Gujarati copy aloud and signed off
- [ ] Old URLs 301 to new; 404 styled; /flat-embrodary redirects to the right course
- [ ] Forms tested end-to-end on a real phone (submit → email arrives → wa.me opens with reference)
- [ ] Schema validates (Rich Results Test); sitemap submitted in Search Console; GA4 + Clarity firing
- [ ] NAP identical on site, GBP, Justdial, Instagram, YouTube
- [ ] Lighthouse ≥95 mobile on Home, a course page, and /admission
- [ ] Supabase RLS verified with a non-admin account; backups action has run once
- [ ] Review-QR standee printed for the reception desk
- [ ] UptimeRobot monitors live

---

*End of plan. Phase 1 can start the day the section 17 answers and the shoot assets land.*
