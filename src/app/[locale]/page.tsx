import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { PathChooser } from "@/components/home/PathChooser";
import { CourseFamilies } from "@/components/home/CourseFamilies";
import { ScreenToStitch } from "@/components/home/ScreenToStitch";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WorkStrip } from "@/components/home/WorkStrip";
import { BatchesTeaser } from "@/components/home/BatchesTeaser";
import { Stories } from "@/components/home/Stories";
import { BusinessBand } from "@/components/home/BusinessBand";
import { LatestVideos } from "@/components/home/LatestVideos";
import { VisitStudio } from "@/components/home/VisitStudio";
import { CtaBand } from "@/components/home/CtaBand";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

// Audit fix: the marketing page is static. Live data (batches) loads through
// the cached /api/batches endpoint client-side; YouTube is fetch-cached 6h.
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

  return (
    <>
      <Hero />
      <StitchDivider />
      <PathChooser />
      <CourseFamilies />
      <ScreenToStitch />
      <HowItWorks />
      <WorkStrip />
      <BatchesTeaser />
      <StitchDivider />
      <Stories />
      <BusinessBand />
      <LatestVideos />
      <VisitStudio />
      <CtaBand />
    </>
  );
}
