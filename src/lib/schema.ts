import { site, ownerProvidedFacts } from "./site";
import { coursesByFamily, type Course } from "@/content/courses";

/**
 * Every piece of structured data on this site is built here.
 *
 * ## Why one file
 *
 * Schema is the one place where an unverified claim stops being a labelled
 * placeholder and becomes a fact a search engine repeats. A visitor can see
 * that a review card says "sample"; a rich result in Google cannot say that,
 * and by the time anyone notices, it has been cached, syndicated and quoted
 * back at the business.
 *
 * So the rule is not "be careful when adding schema" — it is that schema is
 * built in one module, from a known-safe set of inputs, and a test asserts
 * nothing else emits it.
 *
 * ## What may never appear here
 *
 * - `aggregateRating` / `ratingValue` — the 4.8 is owner-provided, not an
 *   audited aggregate, and there is no verified review count to pair with it.
 * - `Review` — every review on the site is sample text.
 * - `Person` — no trainer has been confirmed by the owner. A named person in
 *   schema is a claim about a real human being.
 * - `offers` / `price` — Karma takes no payment online. The EMCAD DAHAO fee is
 *   published in full on its course page, but an `offers` node invites a
 *   buy-now rich result for something that cannot be bought on this site.
 * - `openingHoursSpecification` — exact day-by-day opening hours are still
 *   owner-confirmation-needed. "Evening batches till 10:30 pm" does not prove
 *   that the business closes at 22:30 every day.
 * - Student outcomes, pass rates, placement figures, student counts.
 *
 * ## What may appear
 *
 * The address, the landmark, the three published phone numbers, the social
 * profiles, the course catalogue and the machine notes — all of which are
 * either verified against two sources or are descriptions of the studio's own
 * offering.
 *
 * `timeRequired` joined that list on 2026-08-30, but ONLY for a course whose
 * duration the owner has confirmed in writing. That is EMCAD DAHAO Embroidery
 * Designing (`P3M`) and no other course; the remaining ten still carry
 * `durationMonths: null` and emit no duration at all.
 */

/** Stable node ids, so the graph refers to one studio rather than repeating it. */
export const STUDIO_ID = `${site.url}/#studio`;

type Locale = "en" | "gu";

/**
 * The studio itself.
 *
 * A training institute genuinely is both a `LocalBusiness` and an
 * `EducationalOrganization`; declaring only the first loses course
 * eligibility, and declaring only the second loses the local pack.
 */
export function studioSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "@id": STUDIO_ID,
    name: site.legalName,
    alternateName: site.name,
    description: locale === "gu" ? site.descriptorGu : site.descriptorEn,
    url: site.url,
    /* All three published numbers. Which mobile answers what is unconfirmed,
       so none is promoted to "the" number. */
    telephone: [`+${site.callPhone}`, `+${site.whatsapp}`, `+${site.landline}`],
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `302, Middle Point, Maruti Nandan Society, Mahadev Chowk (${site.landmarkEn})`,
      addressLocality: "Mota Varachha, Surat",
      addressRegion: "Gujarat",
      postalCode: "394101",
      addressCountry: "IN"
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    areaServed: { "@type": "City", name: "Surat" },
    availableLanguage: ["gu", "hi", "en"],
    knowsLanguage: ["gu", "hi", "en"],
    /* Exact day-by-day business hours are deliberately absent until the owner
       confirms them. The public copy may still truthfully say that evening
       batches run till 10:30 pm; that is a batch fact, not a closing-hours fact. */
    sameAs: [
      site.socials.instagram,
      site.socials.youtube,
      site.socials.facebook,
      site.socials.threads
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "gu" ? "એમ્બ્રોઇડરી કોર્સ" : "Embroidery courses",
      itemListElement: coursesByFamily.map((course) => ({
        "@type": "Course",
        name: course.nameEn,
        description: course.production.producesEn,
        url: `${site.url}/${locale}/courses/${course.slug}`,
        provider: { "@id": STUDIO_ID }
      }))
    }
    /* Deliberately absent: aggregateRating. `ownerProvidedFacts.googleRating`
       is shown in the interface, attributed to Google and linked to the live
       listing — but it is not an audited aggregate and there is no verified
       review count, so it must not be emitted as a rich result. */
  };
}

/**
 * One course. No offers, no price, no rating — see the file note. `timeRequired`
 * appears only for a course whose duration the owner has confirmed in writing.
 */
export function courseSchema(course: Course, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${site.url}/${locale}/courses/${course.slug}#course`,
    name: course.nameEn,
    description: course.production.producesEn,
    url: `${site.url}/${locale}/courses/${course.slug}`,
    inLanguage: ["gu", "en"],
    teaches: course.outcomesEn,
    /* Real, and useful: this is genuinely on-site, in-person instruction. */
    courseMode: "onsite",
    provider: { "@id": STUDIO_ID },
    /**
     * `timeRequired` is emitted ONLY where the owner has confirmed a duration
     * in writing — today that is EMCAD DAHAO Embroidery Designing at three
     * months, and nothing else. Every other course has `durationMonths: null`
     * and the key is omitted entirely rather than guessed.
     *
     * ISO 8601 months (`P3M`), not weeks: the institute says three months, and
     * converting that into "P12W" would have this repository restate a business
     * fact in a shape the business did not choose.
     *
     * `offers` and `price` stay out even for this course. The fee is published
     * on the page in full, but Karma takes no payment online, and an `offers`
     * node invites a buy-now rich result for something that cannot be bought
     * on this site.
     */
    ...(course.durationMonths ? { timeRequired: `P${course.durationMonths}M` } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      courseWorkload: undefined,
      location: {
        "@type": "Place",
        name: site.legalName,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mota Varachha, Surat",
          addressRegion: "Gujarat",
          addressCountry: "IN"
        }
      }
    }
  };
}

/** A machine note. TechArticle, no byline, no date. */
export function noteSchema(opts: {
  slug: string;
  headline: string;
  description: string;
  locale: Locale;
  courseName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${site.url}/${opts.locale}/notes/${opts.slug}#note`,
    headline: opts.headline,
    description: opts.description,
    url: `${site.url}/${opts.locale}/notes/${opts.slug}`,
    inLanguage: opts.locale,
    /* The studio is the publisher. No `author` Person: no trainer has been
       confirmed, and a byline would be a claim about a real human. */
    publisher: { "@id": STUDIO_ID },
    ...(opts.courseName ? { about: { "@type": "Course", name: opts.courseName } } : {})
  };
}

/** Breadcrumbs. `trail` is [name, path] pairs after the home crumb. */
export function breadcrumbSchema(locale: Locale, trail: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/${locale}` },
      ...trail.map(([name, path], i) => ({
        "@type": "ListItem",
        position: i + 2,
        name,
        item: `${site.url}/${locale}${path}`
      }))
    ]
  };
}

/**
 * FAQ. Callers must pass only the catalogue's own questions — never a review,
 * a story or anything carrying a sample flag.
 */
export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}

/** Referenced so the fact-discipline note above stays honest about its scope. */
export const OWNER_PROVIDED_NOT_IN_SCHEMA = ownerProvidedFacts;
