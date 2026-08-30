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
      changeFrequency: path === "" || path === "/admissions" ? ("weekly" as const) : ("monthly" as const),
      alternates: {
        languages: {
          en: `${site.url}/en${path}`,
          gu: `${site.url}/gu${path}`
        }
      }
    }))
  );
}
