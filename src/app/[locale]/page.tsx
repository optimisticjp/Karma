import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeHero } from "@/components/kds/home/HomeHero";
import { EntryPaths } from "@/components/kds/home/EntryPaths";
import { SampleBook } from "@/components/kds/home/SampleBook";
import { ScreenMachineProof } from "@/components/kds/home/ScreenMachineProof";
import { EmcadPanel } from "@/components/kds/home/EmcadPanel";
import { ProofWall } from "@/components/kds/home/ProofWall";
import { HomeVoices } from "@/components/kds/home/HomeVoices";
import { TrustSignals } from "@/components/kds/home/TrustSignals";
import { BatchesVisit } from "@/components/kds/home/BatchesVisit";
import { HomeClose } from "@/components/kds/home/HomeClose";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { getPublicCourses } from "@/lib/course/public";

/* Courses, batches, Content Desk stats and FAQs are database-backed. */
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
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return pageMeta({ locale, path: "", title: t("title"), description: t("description") });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const courses = await getPublicCourses();

  return (
    <>
      <HomeHero courseCount={courses.length} />
      <TrustSignals />
      <EntryPaths />
      <SampleBook courses={courses} />
      <ScreenMachineProof />
      <EmcadPanel />
      <ProofWall />
      <HomeVoices />
      <BatchesVisit />
      <HomeClose />
    </>
  );
}
