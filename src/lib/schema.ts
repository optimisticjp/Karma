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
 * - `offers` / `price` — fees are discussed offline and there is no gateway.
 * - `timeRequired` — course durations are unconfirmed (`durationWeeks: null`).
 * - Student outcomes, pass rates, placement figures, student counts.
 *
 * ## What may appear
 *
 * The address, the landmark, the three published phone numbers, the opening
 * hours, the social profiles, the course catalogue and the machine notes —
 * all of which are either verified against two sources or are descriptions of
 * the studio's own offering.
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
    /* Evening batches until 22:30 are the studio's actual differentiator for
       working students, so they belong in the listing rather than only in copy. */
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        closes: "22:30"
      }
    ],
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

/** One course. No offers, no timeRequired, no rating — see the file note. */
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
