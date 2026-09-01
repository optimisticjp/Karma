import { site, ownerProvidedFacts } from "./site";
import type { Course } from "@/content/courses";

/**
 * Every piece of structured data on this site is built here.
 *
 * Schema is the one place where an unverified claim stops being a labelled
 * placeholder and becomes a fact a search engine repeats. Keep sample proof,
 * ratings, people, prices and unverified opening hours out of this module.
 */
export const STUDIO_ID = `${site.url}/#studio`;

type Locale = "en" | "gu";

/** Teaching languages are not website locales: Karma teaches in Gujarati,
 * Hindi and English while the public website itself remains EN/GU only. */
const TEACHING_LANGUAGES = ["gu", "hi", "en"] as const;

/**
 * The organisation graph receives the already-resolved PUBLIC course list.
 * That prevents a course hidden, deactivated or archived in Karma Console from
 * surviving invisibly in JSON-LD after it has disappeared from the page.
 */
export function studioSchema(locale: Locale, courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "@id": STUDIO_ID,
    name: site.legalName,
    alternateName: site.name,
    description: locale === "gu" ? site.descriptorGu : site.descriptorEn,
    url: site.url,
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
    availableLanguage: TEACHING_LANGUAGES,
    knowsLanguage: ["gu", "hi", "en"],
    /* Exact day-by-day opening hours remain absent. The confirmed 11:00 PM
       figure describes the latest training slot, not a seven-day closing-hours
       schedule, so it still does not justify OpeningHoursSpecification. */
    sameAs: [
      site.socials.instagram,
      site.socials.youtube,
      site.socials.facebook,
      site.socials.threads
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "gu" ? "એમ્બ્રોઇડરી કોર્સ" : "Embroidery courses",
      itemListElement: courses.map((course) => ({
        "@type": "Course",
        name: course.nameEn,
        description: course.production.producesEn,
        url: `${site.url}/${locale}/courses/${course.slug}`,
        provider: { "@id": STUDIO_ID }
      }))
    }
    /* Deliberately absent: aggregateRating. The owner-provided Google figure
       may be shown in the interface with attribution, but it is not an audited
       aggregate and there is no verified review count for rating schema. */
  };
}

/** One public course. No offers, price or rating. */
export function courseSchema(course: Course, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${site.url}/${locale}/courses/${course.slug}#course`,
    name: course.nameEn,
    description: course.production.producesEn,
    url: `${site.url}/${locale}/courses/${course.slug}`,
    inLanguage: TEACHING_LANGUAGES,
    teaches: course.outcomesEn,
    courseMode: "onsite",
    provider: { "@id": STUDIO_ID },
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
    publisher: { "@id": STUDIO_ID },
    ...(opts.courseName ? { about: { "@type": "Course", name: opts.courseName } } : {})
  };
}

/** Breadcrumbs. `trail` is [name, path] pairs after the home crumb. */
export function breadcrumbSchema(
  locale: Locale,
  trail: Array<[string, string]>,
  home = "Home"
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: home, item: `${site.url}/${locale}` },
      ...trail.map(([name, path], i) => ({
        "@type": "ListItem",
        position: i + 2,
        name,
        item: `${site.url}/${locale}${path}`
      }))
    ]
  };
}

/** FAQ schema receives only public factual FAQs, never proof content. */
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

/** Referenced so the fact-discipline rule remains explicit about its scope. */
export const OWNER_PROVIDED_NOT_IN_SCHEMA = ownerProvidedFacts;
