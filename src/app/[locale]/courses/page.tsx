import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CoursesIntro } from "@/components/kds/courses/CoursesIntro";
import { CourseCatalogue } from "@/components/kds/courses/CourseCatalogue";
import { FamilyMap } from "@/components/kds/courses/FamilyMap";
import { CoursePathway } from "@/components/kds/courses/CoursePathway";
import { CtaBand } from "@/components/kds/CtaBand";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { getPublicCourses } from "@/lib/course/public";
import { PageCrumbs } from "@/components/kds/PageCrumbs";

/** Course visibility/order is maintained in Karma Console. */
export const dynamic = "force-dynamic";

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

const CUE: Record<string, "foundation" | "leads"> = {
  "flat-embroidery": "foundation",
  "zardosi-machine-embroidery": "leads"
};

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, courses] = await Promise.all([
    getTranslations({ locale, namespace: "coursesPage" }),
    getPublicCourses()
  ]);

  return (
    <>
      <PageCrumbs page="courses" path="/courses" />
      <CoursesIntro />
      <CourseCatalogue courses={courses} cues={CUE} />
      <FamilyMap courses={courses} />
      <CoursePathway />
      <CtaBand title={t("closeH2")} sub={t("closeSub")} />
    </>
  );
}
