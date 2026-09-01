# Karma Console → public website map

This is the operational contract for what staff can change in Karma Console and where that change appears publicly. It also records what must stay private.

## Courses

Console: **Courses**

Public effect:

| Console setting | Public website |
| --- | --- |
| Active | Off removes the course from all public course/admission surfaces. |
| Public | Off removes the course from the public catalogue, homepage course book, admission choices, sitemap and organisation course JSON-LD. |
| Archive | Archived courses are removed from public and operational pickers. |
| English / Gujarati name | `/courses`, homepage course book, course page, batch board and admission form. |
| Family | Course filters, family grouping and family counts. |
| Sort order | Public course catalogue and admission choice order. |
| Duration | Course hero/catalogue where set. Do not invent a duration for courses whose owner-confirmed duration is unknown. |
| Software | Course page and, for EMCAD, the homepage decision panel. |
| Fee total / admission / balance due | Course fee sheet and EMCAD homepage panel. No online payment is created. |
| Terms version | Version attached to new public admissions. The legal wording itself remains immutable/versioned in source control. |
| Regular timetable | Course page and public admission schedule choices. This is a repeating teaching timetable, not dated batch inventory. |
| Demo policy / demo slots | Public admission preferences and course demo facts. It does not reserve capacity. |
| Curriculum | Course syllabus when staff has entered a managed curriculum; otherwise the editorial source syllabus remains the fallback. |
| Practical | Course floor/practical section when entered. |

Long-form technique descriptions, production fault guidance, imagery and the editorial structure of a course page remain source-managed. A Console course slug must match an editorial course slug before it can have a public detail page.

## Batches

Console: **Batches**

A batch is public when all of these are true:

- batch status is `open`;
- batch is not archived;
- its end date is blank or has not passed;
- its course is active, public and not archived.

An `open` batch can already have started and still remain public while admissions are open. Changing the status to `started`, `full`, `completed` or another non-open state removes it from public intake surfaces.

Public fields:

| Console field | Public website |
| --- | --- |
| Course | Homepage batch teaser, `/batches`, relevant course page. |
| Batch label | Shown publicly so staff can recognise the exact intake they edited. |
| Days | Batch row when supplied. |
| Start / end time | Batch row and morning/evening filter. |
| Start date | Batch row. A start date in the past does not hide an otherwise open running intake. |
| End date | Controls when an open intake expires from public display. |
| Seats / seats taken | Seats-left/full presentation when capacity is tracked. `0` seats means capacity not tracked. |
| Language | Batch row when supplied. |
| Status | Only `open` is offered for public admission. |
| Archived | Removes it from public and operational pickers. |

The assigned trainer is intentionally not automatically published. Staff identity is personal information and needs a separate owner/consent decision before it becomes a public trainer profile.

## Content Desk

Console: **Content**

| Content kind | Public destination | Publication gate |
| --- | --- | --- |
| FAQ | Homepage FAQ and Admissions FAQ | `published` |
| Homepage stat | Homepage trust/stat strip | `published` + Owner verified |
| Testimonial | Success Stories | `published`, with the Content Desk consent rules |
| Gallery | Student Work | `published`, valid same-origin media and consent rules |

Draft and archived Content Desk entries do not publish.

## Certificates

Console certificate issue/revoke state feeds the public certificate verification route. Revocation stays visible as revocation rather than turning a previously shared verification link into an unexplained missing record.

## Public → Console, not Console → public

These modules receive website activity but their records are not public content:

- Admissions / enquiries
- Design / service enquiries

## Always private

The following are operational or personal records and must never become public merely because they exist in Console:

- students and guardians;
- enrolments;
- attendance sessions, marks and corrections;
- fee ledger and agreements;
- staff accounts and permissions;
- audit logs;
- record-cleanup history.

## Current demonstration data

The production Console contains truthful starter examples so the owner can see this mapping after deployment:

- all 11 verified catalogue techniques now exist as Course rows;
- the EMCAD DAHAO course carries the confirmed 3-month duration, software, fee plan, four regular timetable slots, 2-day × 2-hour free demo, curriculum and practical data;
- three Owner-verified homepage stats are published through Content Desk;
- a published evening-batch FAQ carries the confirmed 11:00 PM fact;
- existing batch `Karma A` is a useful batch example: because it is still `open` and has not ended, it should appear publicly even though its start date has passed.

No fictional student, testimonial, gallery item, trainer or public availability was created for this demonstration.
