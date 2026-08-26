# Content checklist — what only the owner can unblock

Code is not the launch bottleneck. These answers and photos are. Everything
below maps to a ⚠ CONFIRM-WITH-OWNER marker in the code.

## A. The 16 owner questions (plan §18, condensed)
| # | Question | Where the answer goes |
| --- | --- | --- |
| Q1 | Final course list correct? Durations per course? Anything missing/retired? | `src/content/courses.ts` (`durationWeeks`, modules) |
| Q2 | One official address: Middle Point (currently shipped) or Sumeru City Mall? Landmark directions? | `src/lib/site.ts`, contact page |
| Q3 | One primary number: is 99043 76340 right for calls AND WhatsApp? Landline still active? | `src/lib/site.ts` |
| Q4 | Exact opening hours, day by day | `site.hoursEn/Gu`, LocalBusiness JSON-LD |
| Q5 | Default language of the site: English (current) or Gujarati? | one line in `src/i18n/routing.ts` |
| Q6 | Founding story: 5-question voice-note interview (why started, the crown, first student memory, what "screen to stitch" means here, what "Karma" means) | About page (`aboutPage.storyBody`, `karmaBody`) |
| Q7 | Trainer names, photos, specialties + consent to appear | About page trainers section |
| Q8 | Six real student outcomes with names, consent, before/after and a quote | `src/content/collections.ts` `stories` (remove `sample: true`) |
| Q9 | Verify public claims: 500+ students? Google rating 4.8 or 4.9? Years running? | hero proof row, About numbers |
| Q10 | Batch reality: current live batches, seats per batch, morning/evening times | seed data / Neon `batches` |
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
| Batch fallback rows | disappear automatically once Neon has real batches | — |
| About story/trainers callouts | `messages/*` aboutPage | interview + profiles in |
| Privacy/terms drafts | `[locale]/privacy`, `terms` | owner + legal review |
