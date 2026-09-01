# Karma manual acceptance testing

Use this checklist before institutional handover and after any production deployment. It is written for a tester using the real UI, not for a developer reading source code.

## Test setup

Use a dedicated test student/application/batch where possible. Prefix obvious test records with `TEST` so they are easy to find later. Do not delete audit logs, attendance corrections or real fee history. Use **Admin → Records** only for eligible test/duplicate/mistaken records and read the dependency preflight before confirming deletion.

Test both public languages:

- English: `/en/...`
- Gujarati: `/gu/...`

Test at least one desktop width and one phone width around 390px. Also test the narrowest practical phone width around 320px for overflow.

Expected current launch limitations:

- The 32 photography positions are reserved placeholders until the real shoot arrives.
- `/terms` is intentionally `noindex` until owner approval.
- Public online payment does not exist and must not appear anywhere.
- Public B2B file upload is intentionally deferred while private R2 storage is inactive.
- Production Turnstile, custom domain/DNS and Cloudflare WAF/rate-limit behaviour cannot be accepted until the Cloudflare account configuration is finished.

## 1. Public shell and language

### Home

Open `/en` and `/gu`.

Pass when:

- The page loads without horizontal scrolling.
- Language switching keeps you on the equivalent page.
- English shows English copy and Gujarati shows Gujarati copy.
- The visible course/sample areas reflect courses currently marked public in Console.
- EMCAD software/demo facts are shown only when that public course/configuration supplies them.
- The studio location is Mota Varachha, Surat.
- The confirmed closing time is 11:00 PM where hours are shown.
- No fee is presented as a site-wide course fee.
- No salary, placement or earning guarantee appears.
- No online payment button appears.
- Missing photography is clearly a reserved frame, not a fake student/trainer/client image.

### Navigation

Visit the main public routes in both languages:

- `/courses`
- `/admissions`
- `/admission`
- `/batches`
- `/student-work`
- `/notes`
- `/services`
- `/about`
- `/success-stories`
- `/contact`
- `/verify`
- `/privacy`
- `/terms`

Pass when every route loads, the header/footer navigation works, and no route unexpectedly switches language.

## 2. Course visibility sync

This is one of the most important acceptance tests because Console is the operational source of truth.

In **Admin → Courses**, choose a safe test course and temporarily make it non-public only if you are authorised to change production-visible data. Otherwise do this in a staging/test deployment.

Pass when the hidden course disappears from all public catalogue-driven surfaces, including:

- Home course/sample areas.
- `/courses`.
- `/about` technique/capability wall.
- `/services` capability wall.
- Any Machine Note link that would otherwise point to that course.

Then open the known course URL directly. Pass when a deliberately hidden known course does not render stale public course content and instead returns the visitor to the current catalogue behaviour.

Restore the course to its original visibility and confirm it returns everywhere.

## 3. Courses and EMCAD operational facts

Open the EMCAD DAHAO course and the related admissions surfaces.

Expected confirmed reference values are:

- Duration: 3 months.
- Schedule choices: 08:00–12:00, 12:00–16:00, 16:00–20:00, 20:00–23:00.
- Demo: 2 days, 2 hours per day, free.
- Total fee: ₹35,000.
- Admission amount: ₹25,000.
- Remaining ₹10,000 due within 30 days.

Pass when the homepage/admissions/course-detail surfaces agree with the current Console configuration and do not maintain contradictory copies.

For the other courses, pass when the site does not invent an unconfirmed fee or duration.

## 4. Public batches

Open `/batches`.

Pass when:

- Only genuine public/open batch records are shown.
- An empty database state says there are no current batches rather than inventing sample inventory.
- A database/load failure is visibly different from the normal empty state.
- Course filters are built from batches that actually exist.
- Morning/evening filtering works from the stored start times.
- The demo/admission action does not imply that clicking a public batch reserves a seat.

In **Admin → Batches**, create a clearly marked test batch if authorised.

Pass when the new eligible batch appears publicly, edits are reflected, and archiving/hiding it removes it from the public board without deleting historical records.

## 5. Admission application

Open `/admission` in English and Gujarati.

Complete one clearly marked test application.

Pass when:

- Course choice works.
- Applicant details validate correctly.
- Parent/guardian mobile is required where the form requires it.
- Privacy consent, communications consent and admission-norms acceptance remain separate controls.
- The current admission-norms version is recorded with the application.
- There is no payment step or payment gateway.
- Submission produces a clear success state rather than silently resetting the form.
- The submitted application appears in **Admin → Admissions**.

Also test obvious invalid inputs and a duplicate/repeated submit. Pass when validation is understandable and duplicate network submission does not create uncontrolled duplicate applications.

## 6. Admissions Console

Open **Admin → Admissions**.

Using the test application, check:

- Filtering/search.
- Status changes.
- Notes.
- Follow-up metadata.
- Course/operation context.
- Archive/show-archived behaviour.

Pass when changes persist after refresh and archived records are hidden from normal views but still recoverable through the archived view.

## 7. Students and enrolment lifecycle

Using test data only, follow an application through the normal staff workflow into a student/enrolment if that workflow is enabled for the tester's role.

Pass when:

- The student record is not duplicated unexpectedly.
- Course/batch relationships are correct.
- Related attendance, fee and certificate screens resolve the same student/enrolment.
- Parent records cannot be permanently deleted while dependent enrolment/evidence records still require them.

## 8. Attendance

Open **Admin → Attendance** and use a test batch/student.

Pass when:

- A session can be created for an eligible batch.
- Present/absent values save and survive refresh.
- A locked session becomes read-only for normal attendance editing.
- Correction history remains separate from the original attendance evidence.
- A locked attendance session is not offered as an ordinary permanent-delete target.
- Print attendance output is readable if the print action is available.

## 9. Fees

Open **Admin → Fees** for a test enrolment.

Pass when:

- A fee entry can be added through the intended workflow.
- The ledger persists after refresh.
- Paid/outstanding calculations are understandable and tied to the enrolment.
- Existing ledger history is not silently rewritten when another entry is added.
- The dedicated mistaken-record cleanup path, where available, requires the intended safeguards rather than behaving like a casual delete button.

Do not use real financial records for destructive testing.

## 10. Certificates and public verification

This is a launch-critical flow.

Using a test enrolment, issue a test certificate if authorised.

### Valid certificate

Open `/verify` and enter the certificate number.

Pass when:

- The result clearly says it is valid/verified.
- Student, course, issue date and certificate number match the issued record.
- The result does not depend on colour alone.
- The individual certificate result is not indexable by search engines.

### Revoked certificate

Revoke that same test certificate through the intended Admin workflow, then verify the same number again.

Pass when:

- The certificate remains findable for auditability.
- The result says it is revoked/invalid.
- It does **not** receive the green/verified verdict.

### Unknown certificate

Search for an obviously nonexistent test certificate number.

Pass when the site says it could not resolve the certificate and directs the visitor to contact the studio. It must not accuse a person of fraud or forgery.

## 11. Content Desk

Open **Admin → Content**.

Test only content types available to your role.

Pass when:

- Draft/unpublished items do not leak to the public site.
- Publishing a test item makes it appear on the correct public surface.
- Unpublishing removes it again.
- English/Gujarati content stays paired correctly.
- Content changes survive refresh.
- Public pages never expose Admin-only controls or internal IDs.

## 12. Student work, success stories and proof rules

Open `/student-work` and `/success-stories` in both languages.

Pass when:

- Reserved photo slots remain distinct from editable/published content.
- Sample stories are visibly identified as samples where required.
- No sample story is presented as a verified named person's result.
- No salary, income, job or placement outcome is claimed.
- No unconfirmed trainer is emitted as verified Person structured data.

## 13. B2B services and design enquiries

Open `/services` and submit a clearly marked test enquiry.

Pass when:

- The form accepts the required brief fields.
- No price, turnaround guarantee or unsupported machine file format is promised.
- No public file-upload control is shown while R2 is inactive.
- The enquiry appears in the appropriate Admin design/enquiry workflow.
- Staff status/history updates persist.
- Public copy does not name invented clients or logos.

## 14. Contact

Open `/contact` in both languages.

Pass when:

- WhatsApp uses the WhatsApp number.
- The call number is not mislabeled as WhatsApp.
- Email, map/directions and phone actions open the expected target.
- Address/landmark details are readable.
- The entrance/signboard photo position is still reserved until the real image arrives.

## 15. Admin permissions and team

Test with the Owner account and, if available, at least one delegated staff account.

Pass when:

- Signed-out users cannot enter `/admin` Console pages.
- Delegated staff see only modules/actions granted to them.
- A module's `*.manage` permission allows the intended management actions for that module.
- **Team** administration remains Owner-only.
- The delegated **Records** cleanup workspace appears only when the user has an eligible management permission.
- Permission changes take effect after the intended refresh/sign-in cycle.

## 16. Records cleanup

Open **Admin → Records** with test data only.

For an eligible disposable record, pass when permanent deletion requires:

1. Dependency/preflight review.
2. Typed confirmation.
3. A written reason.
4. A successful audit tombstone/history record.

Also confirm blocked cases:

- Course with dependent batch.
- Batch with dependent enrolment.
- Student with dependent enrolment.
- Enrolment with dependent fees or certificate.
- Locked attendance session.
- Valid issued certificate before revocation.

Never use real institutional history just to test the delete path.

## 17. Reports and print views

Open **Admin → Reports** and the available print views.

Pass when:

- Filters produce the expected scoped records.
- Print pages do not include navigation/control clutter intended only for the Console.
- Names, dates and totals match the source records.
- Long Gujarati text does not overflow the printable layout.

## 18. Unknown routes and 404 behaviour

Visit obvious nonexistent routes such as:

- `/en/nope`
- `/gu/nope`
- `/en/courses/nope`
- `/en/notes/nope`

Pass when:

- The browser receives an actual HTTP 404 response.
- The branded bilingual 404 page is shown.
- The browser title describes the missing-page state rather than saying Home.
- The page is `noindex`.
- Suggested course links respect current Console visibility.

## 19. Mobile and keyboard acceptance

At approximately 320px and 390px widths, check Home, Courses, Batches, Admission, Services, Contact and one Admin table/form.

Pass when:

- Nothing forces horizontal page scrolling.
- Fixed action bars remain inside the viewport.
- Long Gujarati labels wrap without clipping important controls.
- Tap targets are usable.

Keyboard-only pass:

- Tab through interactive controls.
- Focus is always visible.
- Admission step state is announced.
- Interactive tablists can be changed with the keyboard.
- No important action requires drag-only interaction.

## 20. Privacy, SEO and indexing spot checks

Pass when:

- `/privacy` is public and readable.
- `/terms` remains `noindex` until the owner approves it.
- `/admin` and `/api/` are excluded from crawling.
- Per-certificate verification results are `noindex`.
- Public EN/GU pages expose the correct alternate-language metadata.
- No public structured data invents ratings, reviews, prices, offers or named unverified trainers.

## 21. Cloudflare-only acceptance after account setup

Run these after production Cloudflare configuration is finished:

- Custom domain and HTTPS certificate.
- Canonical `NEXT_PUBLIC_SITE_URL` on the real domain.
- Production Turnstile on public forms.
- Rate limiting/WAF behaviour on public form APIs and Admin auth-sensitive endpoints.
- Redirect/canonical behaviour between workers.dev and the final domain.
- R2 upload/download flow only if private R2 storage is deliberately enabled.

## 22. Final release pass

A release is ready for real institutional testing when all of these are true:

- CI typecheck passes.
- CI lint passes.
- Full automated test suite passes.
- Production build passes.
- Public EN/GU smoke test passes.
- Admin owner login works.
- Admission → Admin Admissions works.
- Batch visibility sync works.
- Attendance lock behaviour works.
- Fee ledger test works.
- Certificate issue → verify → revoke → verify works.
- Permissions are correct for at least one delegated staff account.
- Records cleanup safeguards work with disposable test data.
- No online payment appears.
- Cloudflare-specific items are either tested or explicitly marked pending.
- The tester records any failure with route, account role, exact steps, expected result, actual result and screenshot.
