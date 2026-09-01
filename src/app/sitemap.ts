import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { machineNotes } from "@/content/notes";
import { getPublicCourses } from "@/lib/course/public";
import { CONTENT_LAST_UPDATED, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getPublicCourses();
  const staticPaths = [
    "",
    "/courses",
    ...courses.map((course) => `/courses/${course.slug}`),
    "/batches",
    "/admissions",
    "/admission",
    "/student-work",
    "/notes",
    ...machineNotes.map((note) => `/notes/${note.slug}`),
    "/services",
    "/about",
    "/success-stories",
    "/contact",
    "/verify",
    "/privacy"
    /* `/terms` remains excluded while it is noindex. Certificate result pages
       are also deliberately excluded because they contain named records. */
  ];

  return staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency:
        path === "" || path === "/admissions" || path === "/batches"
          ? ("weekly" as const)
          : ("monthly" as const),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((lang) => [lang, `${site.url}/${lang}${path}`])
        )
      }
    }))
  );
}
