import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CoursesIntro } from "@/components/kds/courses/CoursesIntro";
import { CourseCatalogue } from "@/components/kds/courses/CourseCatalogue";
import { FamilyMap } from "@/components/kds/courses/FamilyMap";
import { CoursePathway } from "@/components/kds/courses/CoursePathway";
import { CtaBand } from "@/components/kds/CtaBand";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.courses" });
  return pageMeta({ locale, path: "/courses", title: t("title"), description: t("description") });
}

/**
 * THE CATALOGUE.
 *
 * Five blocks, and each answers a different question:
 *
 *  1  Intro       what is on offer, and what is true of all of it
 *  2  Catalogue   the eleven, filterable by family, compared side by side
 *  3  Families    how they divide up and why — and every course as a link
 *  4  Pathway     where they lead, as a sequence rather than a list
 *  5  Close       the one action
 *
 * The page it replaces opened with a full-height intro and then repeated a
 * family heading, an icon plate and a section rule three times before any
 * course appeared. The eleven courses ARE the page; everything else is
 * context, and context goes after the thing it contextualises.
 *
 * **No fee anywhere on this page.** Fees are discussed offline and exactly one
 * course has a published plan, which lives on that course's own page.
 */

/**
 * Two cues, both FACTS the owner confirmed on 2026-08-29 — never an invented
 * difficulty rating. No course carries a "beginner" or "advanced" label,
 * because every one of them is taught from zero.
 */
const CUE: Record<string, "foundation" | "leads"> = {
  "flat-embroidery": "foundation",
  "zardosi-machine-embroidery": "leads"
};

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "coursesPage" });

  return (
    <>
      <CoursesIntro />
      {/* `cues` is plain data. A render function would be a function crossing
          the server/client boundary, which React refuses — the client
          component resolves the label from the same catalogue. */}
      <CourseCatalogue cues={CUE} />
      <FamilyMap />
      <CoursePathway />
      <CtaBand title={t("closeH2")} sub={t("closeSub")} />
    </>
  );
}
