import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { courses } from "@/content/courses";
import { machineNotes } from "@/content/notes";
import { CONTENT_LAST_UPDATED, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/courses",
    ...courses.map((c) => `/courses/${c.slug}`),
    "/batches",
    "/admissions",
    "/admission",
    "/student-work",
    "/notes",
    ...machineNotes.map((n) => `/notes/${n.slug}`),
    "/services",
    "/about",
    "/success-stories",
    "/contact",
    "/verify",
    "/privacy",
    "/terms"
  ];

  return staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      lastModified: CONTENT_LAST_UPDATED,
      /* `/batches` changes as often as the studio opens one, which is the
         fastest-moving public page there is. */
      changeFrequency:
        path === "" || path === "/admissions" || path === "/batches"
          ? ("weekly" as const)
          : ("monthly" as const),
      /* Derived from the locale list, like the URLs above. These were two
         hardcoded entries while the URLs iterated `routing.locales` — so a
         third locale would have tripled the sitemap while every entry still
         claimed two alternates. */
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${site.url}/${l}${path}`])
        )
      }
    }))
  );
}
