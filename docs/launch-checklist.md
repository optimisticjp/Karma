# Launch checklist — custom domain, Search Console, Maps

**Nothing in this file has been executed.** It is the record of what has to
happen when the owner is ready to point `karmadesignstudio.in` at this site,
written down now while the reasoning is fresh rather than reconstructed later.

The site currently runs on its `workers.dev` address, which is publicly
reachable. That is deliberate: the owner reviews the real thing rather than a
description of it. It also means everything below is a *switch*, not a build.

---

## 1. Before the switch

- [ ] **Resolve the phone roles.** Two mobile numbers are published and
      neither has been confirmed as call-vs-WhatsApp. See
      `docs/content-checklist.md`. One sentence from the owner collapses this.
- [ ] **Run the proof-replacement gate.** The public site ships a complete
      trust layer — reviews, testimonials, student stories, trainers,
      trusted-by marks, follower counts, a Google rating — populated from
      `src/content/proof.ts`. The owner authorised sample content for the
      Workers.dev preview (`docs/karma-creative-freedom-trust-proof-addendum.md`
      §§6–9); it is **not** authorised for a custom domain.

      `remainingSampleProof()` in that file returns every item that is not
      `verified`, each with the instruction for replacing it. Walk that list
      and, for every entry, do one of exactly three things:

      1. replace it with real content and set `status: "verified"`;
      2. confirm it as an owner statement and leave it `owner_provided`
         (the follower counts and the Google rating are the intended cases —
         they stay attributed on screen and outside rating schema); or
      3. hide the module.

      **Do not sign off while anything unexpected is still `sample`.** None of
      it reaches structured data at any point — `tests/kds-proof-firewall.test.ts`
      makes that mechanical — so the risk being managed here is not an SEO one:
      it is a fictional student name being the first impression on a domain the
      owner is advertising.

      The older sample arrays in `src/content/collections.ts` are on the same
      footing until the rebuild finishes moving pages onto the registry. Check
      both until that file's proof arrays are gone.
- [ ] **Confirm the durations and fees** the site currently declines to state,
      or leave them deferred and keep the "ask at the demo" answers.
- [ ] **Studio photography.** Every visual is drawn or a named placeholder.
      Photography drops into the existing layouts without a redesign.

## 2. The canonical switch

Everything canonical derives from one value:

```
NEXT_PUBLIC_SITE_URL
```

`src/lib/site.ts` reads it, and `pageMeta()`, the sitemap, `robots.txt` and
every `@id` in `src/lib/schema.ts` derive from `site.url`. So the cutover is:

1. Set `NEXT_PUBLIC_SITE_URL=https://karmadesignstudio.in` in the Cloudflare
   Worker's environment.
2. Redeploy.
3. Verify: `/sitemap.xml` and `/robots.txt` show the new host, and one course
   page's `<link rel="canonical">` and JSON-LD `@id` both do too.

**Do not hand-edit URLs anywhere.** If a URL is hardcoded somewhere, that is
the bug — fix the source rather than the symptom.

~~**Two places currently break that rule and must be fixed as part of the
cutover**~~ — **both were fixed on 2026-08-30**, so the cutover no longer has to
carry them:

- The certificate sheet hard-coded
  `https://karma-design-studio.essanciaonline.workers.dev/en/verify/…`, so every
  certificate printed after the cutover would have carried a `workers.dev` link
  on paper, where it cannot be corrected later. It moved to
  `src/app/admin/(print)/print/certificate/[certNo]/page.tsx` with the A4 print
  system and now derives from `site.url`; `tests/print-sheets.test.ts` fails if
  a host is hard-coded there again.
- `public/llms.txt` hard-coded `karmadesignstudio.in` and listed eight of eleven
  courses. It is now generated at `src/app/llms.txt/route.ts` from `site.url`
  and the catalogue.

Fix the source in both — do not paper over either with a redirect.

## 3. Custom domain in Cloudflare

Add the domain to the Worker (Workers & Pages → the service → Settings →
Domains & Routes). Keep the `workers.dev` address working during the
transition; it costs nothing and gives a fallback while DNS propagates.

The existing `karmadesignstudio.in` is an unedited ValidTheme template — see
`src/lib/site.ts` for what was found on it. Nothing from that site should be
preserved, and any old URLs that had traffic should 301 to the closest new
page rather than 404.

## 4. Search Console

1. Add `https://karmadesignstudio.in` as a **domain property** (DNS
   verification) rather than a URL-prefix property — it covers both `www` and
   the apex, and both protocols, which a prefix property does not.
2. Submit `https://karmadesignstudio.in/sitemap.xml`.
3. Check the **hreflang** report after a week. Every page emits `en`, `gu` and
   `x-default` alternates through `pageMeta()`; errors there usually mean a
   page was added without using that helper.
4. Watch **Rich results** for `Course`, `LocalBusiness` and `FAQPage`. There
   should be **no** `Review` or `AggregateRating` results — if any appear,
   something has emitted schema outside `src/lib/schema.ts`, which
   `tests/structured-data.test.ts` is meant to prevent.

## 5. Google Business Profile

- [ ] Update the profile's **website URL** to the new domain.
- [ ] Check the profile's name, address and phone match
      `src/lib/site.ts` exactly — a mismatch between the site and the profile
      is the single most common local-SEO own goal.
- [ ] The landmark ("near Dhara Arcade, opposite Krishna Township Road") is
      what actually gets a first-timer to the door in Mota Varachha. Keep it
      in the profile description as well as on the site.

## 6. After the switch

- [ ] Re-run the responsive and accessibility audits against the live domain.
- [ ] Attach an analytics provider if the owner wants one. The hooks already
      exist and carry no personal data — one listener is the whole
      integration:
      ```js
      window.addEventListener("karma:event", (e) => provider.track(e.detail));
      ```
- [ ] Activate R2 if private file delivery is wanted, and restore the brief
      form's upload field (see `docs/content-checklist.md`).
- [ ] Activate Turnstile if form abuse appears. The verification path already
      exists and fails closed in production.

---

## What deliberately is **not** on this list

Adding `aggregateRating`, review markup, a fabricated author, an invented
turnaround or a claimed file-format list would each produce a better-looking
rich result tomorrow and a problem that follows the business for years. The
tests block all of them, and they should stay blocked until the underlying
fact exists.
