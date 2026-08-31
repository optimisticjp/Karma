# KARMA — Creative Freedom + Trust/Proof Addendum
## Authoritative owner override for the THREAD / MACHINE / PROOF public rebuild

**Status:** AUTHORITATIVE OWNER-DIRECTED ADDENDUM  
**Created:** 2026-08-31  
**Repository:** `optimisticjp/Karma`  
**Applies to:** `docs/karma-modern-textile-lab-redesign-plan.md` and the public rebuild that follows it  

This document exists because the owner wants the next Karma public website to be **more visually ambitious, more trustworthy, more expressive, and more complete during the Workers.dev polishing stage** than the previous plan allowed.

Where this addendum conflicts with the anti-template restrictions, proof-placeholder restrictions, or conservative photography treatment in `docs/karma-modern-textile-lab-redesign-plan.md`, **THIS ADDENDUM WINS**.

It does **not** override security, authentication, authorization, RLS, database integrity, payment, infrastructure, factual course data, audit, private-file, or deployment rules.

---

# 1. Owner correction: creative patterns are NOT banned

The previous plan included a list of visual patterns described as banned by default. That was too restrictive and caused Claude to behave defensively instead of designing a beautiful website.

The owner explicitly wants the full modern design toolbox available.

The following are therefore **ALLOWED when they improve the experience**:

- centered hero compositions
- asymmetric heroes
- editorial heroes
- one-button or two-button heroes
- card groups
- 2-column, 3-column or 4-column layouts
- bento compositions
- image mosaics
- editorial grids
- rounded cards
- square cards
- borderless layouts
- full-bleed media
- glass / translucent overlays
- subtle aurora or luminous gradients
- tasteful depth and shadows
- floating visual elements
- textile-specific 3D or pseudo-3D objects
- large display typography
- small technical labels
- badges
- chips
- pill controls
- stat blocks
- social proof strips
- trusted-by / partner-logo bands
- review cards
- testimonial layouts
- story cards
- student-success modules
- follower-count blocks
- Instagram / Facebook proof modules
- Google review modules
- motion reveals
- scroll storytelling
- horizontal scrollers
- carousels
- sticky storytelling panels
- split-screen layouts
- before/after treatments
- tabs
- accordions
- interactive scrubbers
- hover transformations
- image zoom
- parallax in restrained, performant places
- light glassmorphism
- illustrated/vector embroidery diagrams
- CAD-like vector overlays
- micro-3D stitch/thread elements
- creative cursor effects only if they are subtle, optional, performant, and genuinely improve a desktop experience
- experimental section composition when it remains understandable and responsive

None of these patterns is automatically good or bad.

The rule is now:

> **Use the best visual pattern for the content. Do not ban useful design tools. Do not use them mechanically.**

The problem to avoid is not “cards” or “bento”.

The problem is a website where every section looks like it came from the same generic template.

---

# 2. The real anti-template rule

The site may use familiar UI patterns.

What it must not do is use them in a generic, repetitive way.

Bad:

- every section = heading + paragraph + 3 equal cards
- every card = icon circle + title + copy
- every media area = same 16:9 rounded rectangle
- every CTA = same pill
- every section = fade-up
- every proof block = identical testimonial card
- every page = same hero skeleton

Good:

- course catalogue can use a dense product/index pattern
- student work can use editorial masonry/bento
- trainer profiles can use portrait-led editorial composition
- reviews can use a social-proof rail plus one large featured story
- Machine Notes can use notebook/diagnostic cards
- Services can use structured workflow panels
- the homepage can use a dramatic visual hero and a completely different proof wall
- mobile can use horizontal rails where vertical repetition would be boring

The website should feel **designed page by page**, while still sharing a coherent Karma visual system.

---

# 3. Creative north star remains embroidery-specific

Creative freedom does not mean generic spectacle.

Every major visual idea should still have a relationship to one or more of:

- thread
- stitch
- bead
- sequence
- cording
- chain
- applique/layer
- cross stitch
- laser trace
- tuft loops
- machine head
- hoop/frame
- fabric edge
- registration point
- vector path
- EMCAD nodes
- machine setup
- sample book
- real stitched result

The site can be bold, playful, editorial, immersive, glossy, minimal, dense, or cinematic in different moments.

But it should still feel like **Karma’s embroidery world**, not a random creative-agency portfolio.

---

# 4. Light mode remains the primary product mode

The owner still wants a light-mode website.

That does NOT mean flat beige pages.

Light mode may include:

- white
- warm off-white
- raw-silk / linen neutrals
- very pale cool technical surfaces
- photo-led color
- luminous gradient accents
- translucent overlays
- metallic highlights
- thread-color accents
- very small dark editorial objects
- deep text / linework
- light glass panels over images
- subtle reflective surfaces for sequence/zari moments

Do not rebuild the website as a dark-mode site.

But do not make “light mode” an excuse for blandness.

---

# 5. Logo-neutral system still applies

The future Karma logo may arrive in any color.

The website must accept:

- red logo
- blue logo
- green logo
- gold logo
- black logo
- multicolor logo
- another palette entirely

Therefore:

- keep the structural surfaces neutral enough for any logo
- keep the default accent configurable
- do not require a red wordmark for the design to work
- isolate accent tokens cleanly
- let photography/material carry a large share of the color experience

The interface may still use a current thread-red/vermilion default.

It just must not be structurally dependent on that hue.

---

# 6. Trust and social proof are REQUIRED visual layers

The website should not look unfinished simply because every real proof item has not arrived yet.

During Workers.dev visual development, build complete trust/proof modules using typed centralized placeholder content.

The owner wants the site to contain visually polished placeholders for areas including:

- Google reviews
- testimonials
- student stories
- trainer profiles
- student work
- Instagram follower proof
- Facebook follower proof
- social-media activity
- partner/client/trusted-by logos
- business/customer proof
- student outcome proof
- review ratings
- review snippets
- media/gallery proof
- machine/studio proof
- course-specific proof
- sample stats and counters where useful

These modules should be designed NOW so the final site does not need to be structurally redesigned when real content arrives.

---

# 7. Sample / owner-provided / verified content states

Create a clear centralized content-state model for proof content.

Recommended conceptual states:

```ts
type ProofStatus = "sample" | "owner_provided" | "verified";
```

Every proof item should be able to carry its status.

Examples:

- sample testimonial -> `sample`
- fictional partner logo -> `sample`
- 39K+ Instagram supplied by owner -> `owner_provided`
- 10K+ Facebook supplied by owner -> `owner_provided`
- real approved student story -> `verified`
- real approved Google review -> `verified`

Do not scatter proof placeholders directly through JSX.

Use one or more centralized typed sources so the polishing round can replace them quickly.

Possible shape:

```ts
{
  status: "sample",
  kind: "testimonial",
  ...
}
```

The exact implementation is up to Claude after inspecting current Content Desk/public content architecture.

---

# 8. Sample content is allowed on Workers.dev

This is an explicit owner decision.

Fictitious/sample content MAY be used during the preview/redesign stage to make the visual product complete.

Examples:

- sample student names
- sample testimonial copy
- sample before/after stories
- sample trainer profiles
- sample partner/customer marks
- sample studio-project names
- sample review snippets
- sample outcome summaries
- sample stats
- sample course-work captions

However:

1. sample content must be identifiable in the underlying content model as sample;
2. sample content must be visibly disclosed on the preview site in a tasteful, non-destructive way;
3. sample content must NEVER enter structured factual SEO/schema;
4. sample content must NEVER be emitted as `AggregateRating`, `Review`, `Person`, `Organization` endorsement, or other factual structured proof;
5. sample content must be easy to replace or hide before custom-domain launch;
6. the launch checklist must fail if sample proof remains unintentionally presented as real.

A small subtle label such as:

- Sample preview
- Preview content
- Placeholder — replace before launch

is acceptable on Workers.dev.

The disclosure should not destroy the composition.

---

# 9. Fictional “Trusted by” / partner logos are allowed as placeholders

The owner wants a trust/partner visual system ready before real customer/partner names arrive.

Build it.

Allowed during preview:

- fictional neutral partner names
- fictional monograms
- fictional boutique/manufacturer marks
- abstract sample client logos
- category-style marks such as “Boutique Partner”, “Embroidery Unit”, “Garment Studio”

Rules:

- do not copy real-company logos without evidence of a relationship
- do not imply a real brand endorses Karma when it does not
- keep sample status in the data model
- visibly identify the strip/module as sample/preview on Workers.dev
- make replacement with SVG/PNG real logos trivial later

Use this module creatively rather than as a generic gray-logo SaaS strip.

Possible treatments:

- stitched-label strip
- garment-tag rail
- textile-selvedge partner band
- horizontal sample-book marks
- subtle monochrome logo wall

---

# 10. Reviews and testimonials are required, not banned

Design multiple review/testimonial patterns rather than one generic card.

Potential system:

## Featured review

One large editorial quote paired with real/sample student-work or studio media.

## Review rail

Compact horizontally scrollable review snippets.

## Google proof

Rating/review visual module.

Until verified, it is preview/sample/owner-provided content and excluded from rating schema.

## Student story

BEFORE -> LEARNED -> NOW

with a stitched journey line.

## Micro proof

Short “what changed” snippets alongside course sections.

Do not use the same testimonial card shape everywhere.

---

# 11. Social proof / follower counts

The owner wants Instagram and Facebook scale visible.

Current owner-provided figures already recorded in project memory include approximately:

- Instagram: 39K+
- Facebook: 10K+
- Google rating: 4.8

These remain owner-provided rather than independently verified.

They MAY be used in preview/design as `owner_provided` proof with a subtle qualification where necessary.

Do not emit `AggregateRating` from the 4.8 figure without the verified review-count requirements already documented.

Build a visually strong social-proof area that can later bind to refreshed real values.

Possible treatments:

- large typographic follower counters
- social-platform cards
- reel/post preview frames
- small social activity rail
- “Follow the machine floor” media strip
- real feed integration where current architecture safely supports it

Do not make the website depend on live third-party scripts.

---

# 12. The 32 real photographs must become major visual assets

The previous plan was too conservative about photography presentation.

The owner wants the 32 real images, once delivered, to be **large enough to appreciate and used creatively**.

Do not treat them as tiny thumbnails or repetitive cards.

The 32-shot manifest remains the media source of truth, but presentation may be ambitious.

Allowed treatments include:

- full-width hero media
- 60/40 hero media
- oversized editorial crops
- full-bleed section images
- edge-to-edge mobile images
- asymmetric photo pairs
- layered Screen/Machine/Proof triptychs
- image mosaics
- masonry
- bento image walls
- overlapping photo compositions
- sticky photo panels
- horizontal film strips
- scroll-snap galleries
- full-width studio panorama
- large trainer portraits
- macro work tiles
- split screen/photo comparisons
- process triptychs
- contact/studio location photography
- large course-photo moments
- image-backed testimonial/story modules
- subtle glass/caption overlays on photography
- hover zoom or crop shifts
- responsive art-directed crops

Use each photograph according to its subject and aspect ratio.

Do not normalize everything into the same rectangle.

---

# 13. Photo placement philosophy

The 32 images should have PRIMARY placements where they can breathe.

Examples:

## Hero three

The Screen -> Machine -> Result photographs can form the primary hero narrative.

Desktop possibilities:

- connected three-frame composition
- one dominant finished-result image with Screen/Machine inserts
- layered editorial triptych

Mobile:

- image stack
- snap rail
- vertical story sequence

## Eight course images

Use them as strong course-index/course-detail moments.

Do not shrink every course image into a tiny card.

## Six student-work images

Use an editorial wall/masonry/bento arrangement respecting portrait, square and landscape ratios.

## Three trainer images

Use genuine portrait/editorial scale.

## Six studio/machine images

Use a machine-floor panorama and equipment/station proof.

## Two student-story images

Pair with before/learned/now storytelling.

## Three Screen-to-Stitch images

Use as the signature process interaction.

## One studio-floor panorama

Give it a major wide placement.

The same image MAY be reused for a secondary crop/detail on another page when it represents the SAME subject honestly.

Do not reuse one course image and label it as another technique.

---

# 14. Real-media placeholder system should feel designed

Before files arrive, placeholders should preview the intended art direction.

Do not show giant dashed empty boxes everywhere.

A PhotoSlot can visually communicate:

- intended crop
- subject label
- technique signature
- image index
- subtle textile frame
- optional mock crop guides

It should still be clearly a placeholder.

The placeholder system itself can look beautiful enough for visual review.

---

# 15. More placeholder systems are required beyond photography

The owner wants the entire future content architecture visible now.

Create placeholder-ready components/content for:

- reviews
- Google rating/review count
- testimonials
- student stories
- trainer profiles
- founder story
- trusted-by / partner logos
- business clients
- social follower counts
- social post/reel previews
- student outcomes
- course proof snippets
- machine proof/capability facts
- batch proof
- FAQ depth
- real studio facts still awaiting confirmation
- social/contact confidence

Do not create fake database records just for this.

Prefer typed preview/source content unless the existing Content Desk is clearly the better bounded solution.

---

# 16. Beautiful visual treatments are encouraged

Claude should actively experiment with several tasteful techniques and keep the best ones.

Examples:

## Glass

Allowed for:

- image captions
- EMCAD overlays
- floating fact blocks
- social proof over media

Keep text contrast accessible.

## Gradients / glow

Allowed for:

- subtle screen/software illumination
- thread-color transitions
- hero depth
- CTA focus

No generic purple SaaS aurora by default.

## 3D

Allowed when niche-related:

- thread spool
- bobbin
- hoop
- sequence disc
- bead
- stitch/thread extrusion
- layered applique

Can be SVG/CSS/WebGL only if justified and performant.

Do not add random chrome spheres.

## Bento

Allowed where content heterogeneity benefits from it:

- student work
- studio proof
- social proof
- homepage proof wall

Do not turn every page into bento.

## Big typography

Allowed for:

- hero
- major proof statement
- social follower counters
- course category moments

Must remain mobile-readable and not consume the entire viewport without purpose.

## Motion

Use more than one motion grammar if appropriate:

- thread draw
- bead attach
- sequence rotation
- photo reveal
- panel slide
- crossfade
- scrubber
- scroll-snap
- subtle parallax
- hover image crop
- count-up for sample/verified stats

Reduced-motion alternatives remain mandatory.

---

# 17. Trust architecture on the homepage

The homepage should feel trustworthy BEFORE every real proof asset arrives.

A strong final homepage may include, in a compact but visually rich sequence:

1. Hero — Screen -> Machine -> Proof
2. Immediate facts / decision strip
3. Course/sample-book explorer
4. Real/sample social proof strip
5. Screen-to-Stitch signature interaction
6. EMCAD decision panel
7. Student-work / proof wall
8. Reviews/testimonials
9. Social follower proof
10. Trusted-by / partner/client strip
11. Batches / visit
12. Studio / people teaser
13. FAQ / final CTA

This is NOT a mandatory section count.

Claude should compose the page for rhythm, mobile usefulness and visual quality.

The previous “roughly 7–8 sections” target is no longer a hard limit.

The goal is:

- no useless repetition
- no excessive length caused by empty spacing
- enough proof to feel convincing
- enough creative media to feel premium
- clear decisions remain easy to reach

---

# 18. Trust architecture across the site

Do not force all proof onto the homepage.

Distribute proof intelligently:

## Courses

- relevant student work
- sample/real testimonial snippet
- trainer/proof
- machine/practical evidence

## Student Work

- visual-first project proof
- story/outcome metadata

## Machine Notes

- expertise proof
- diagnostics
- related course proof

## Services

- client proof
- trusted-by strip
- sample/real project case studies

## Studio

- team
- machine floor
- social/community proof

## Contact

- location
- social channels
- review/reputation proof

---

# 19. Course cards/index rows may be visually ambitious

Course presentation is not limited to a plain ledger.

Claude may use:

- editorial cards
- large image cards
- sample-strip rows
- split rows
- grid + list hybrids
- horizontal scrollers on mobile
- technique swatches
- floating metadata
- bento-featured EMCAD course

The only hard rules are:

- all 11 courses remain
- no invented duration/fee for unverified courses
- no misleading photo reuse
- decision information stays readable

---

# 20. Responsive creative direction

Creative richness must survive all sizes.

## Mobile

Do NOT strip the site down to plain stacked text.

Mobile may use:

- horizontal media rails
- swipeable student work
- snap carousels
- compact bento pairs
- edge-to-edge imagery
- full-width photo moments
- bottom sheets
- sticky CTAs
- motion that is safe on touch
- progressive disclosure

## Tablet

Tablet must have its own composition.

Use:

- two-column editorial layouts
- mixed portrait/landscape proof
- split course/detail views where appropriate
- intermediate bento structures

Do not treat tablet as stretched mobile.

## Desktop

Use the full canvas:

- asymmetric compositions
- oversized media
- sticky visual stories
- layered images
- refined hover interactions
- richer motion

Do not waste desktop width with narrow centered columns everywhere.

---

# 21. Accessibility remains part of beauty

Creative freedom does not waive accessibility.

Maintain:

- readable contrast
- keyboard access
- visible focus
- no motion dependency
- reduced-motion support
- semantic headings
- meaningful alt text once real media arrives
- 44px-ish practical touch targets where relevant
- no essential information hidden only behind hover
- correct Gujarati typography

A visually ambitious site that is hard to operate is not good UX.

---

# 22. Performance remains part of UX

Rich visuals must remain efficient.

Prefer:

- CSS/SVG for simple niche motion
- responsive image sizing
- lazy loading below the fold
- no heavyweight animation library unless the interaction genuinely needs it
- no huge 3D runtime for decoration
- no third-party social widgets that destroy performance/privacy

The Worker gzip budget remains important.

Public photography should be optimized at integration time.

---

# 23. Sample SEO/schema firewall

Build a mechanical firewall between preview/sample proof and factual SEO.

Non-verified proof must never automatically create:

- Review schema
- AggregateRating
- Person schema
- Organization endorsement
- quantified outcome schema
- offer/price facts not otherwise verified

The visible preview can be rich.

The structured data must stay factual.

Add tests for this.

---

# 24. Pre-launch replacement gate

Before the custom domain is connected, perform a proof replacement audit.

Every preview/sample record should be classifiable as:

- replaced with verified content
- explicitly approved owner-provided content
- intentionally hidden

The launch checklist should identify any remaining `status: "sample"` public proof.

No need to block visual development today.

The purpose is to make replacement systematic later.

---

# 25. Updated creative-director test

At the end of every major public route, ask:

- Is it beautiful?
- Is it memorable?
- Does it feel complete?
- Does it feel trustworthy?
- Does it use the available screen well?
- Are the photographs large enough to appreciate?
- Is there enough real/sample proof to support the decision?
- Does it feel like embroidery/machine production?
- Does it still feel easy to use?
- Would a different-color future logo still fit?
- Does mobile feel designed, not merely compressed?
- Does tablet feel intentional?
- Does desktop reward the larger canvas?

And only then ask:

- Does any pattern feel templated because it is repeated too often?

Do not remove a strong visual treatment simply because it belongs to a known UI pattern.

---

# 26. What the finished preview should contain before the real-content polishing round

The Workers.dev preview should feel like a nearly finished product even while some content is sample.

It should have designed surfaces for:

- all 11 courses
- all 32 real-photo slots
- reviews
- testimonials
- student stories
- trainer profiles
- student-work proof
- social follower counts
- Instagram/Facebook presence
- partner/client/trusted-by proof
- studio/machine proof
- B2B client/project proof
- batches
- demo conversion
- contact/visit proof
- Machine Notes expertise
- FAQs

The polishing round should primarily REPLACE CONTENT and refine photography/crops — not invent missing page architecture.

---

# 27. Explicit owner intent

The owner would rather have a bold, attractive, trust-rich preview with clearly managed sample content than an overly cautious site that looks incomplete.

Therefore:

> **Do not use factual caution as an excuse for visually empty pages.**

Use placeholders intelligently.

Use sample proof intelligently.

Use the full modern UI/UX toolbox intelligently.

Then replace/hide/verify the content before launch.

---

# 28. Implementation instruction

Every Claude session executing the public rebuild must read:

1. `CLAUDE.md`
2. `docs/project-context.md`
3. `docs/karma-modern-textile-lab-redesign-plan.md`
4. **this addendum**
5. relevant design/content/security docs

When the base plan says a visual pattern is banned or discourages trust placeholders more strongly than this document, **this addendum supersedes it**.

The visual rebuild is still THREAD / MACHINE / PROOF.

It is now allowed to be far more expressive.
