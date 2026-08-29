import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { PathChooser } from "@/components/home/PathChooser";
import { HomepageStats } from "@/components/home/HomepageStats";
import { CourseFamilies } from "@/components/home/CourseFamilies";
import { ScreenToStitch } from "@/components/home/ScreenToStitch";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Trainers } from "@/components/home/Trainers";
import { WorkStrip } from "@/components/home/WorkStrip";
import { Stories } from "@/components/home/Stories";
import { LatestVideos } from "@/components/home/LatestVideos";
import { BatchesTeaser } from "@/components/home/BatchesTeaser";
import { Investment } from "@/components/home/Investment";
import { HomeFaq } from "@/components/home/HomeFaq";
import { BusinessBand } from "@/components/home/BusinessBand";
import { VisitStudio } from "@/components/home/VisitStudio";
import { CtaBand } from "@/components/home/CtaBand";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

// Content Desk proof/FAQ/gallery/stories are database-backed. Keep the page
// request-time until the planned R2 incremental cache/ISR work is activated.
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

  return (
    <>
      <Hero />
      <PathChooser />
      <HomepageStats />

      <CourseFamilies />
      <ScreenToStitch />
      <HowItWorks />

      <StitchDivider />

      <Trainers />
      <WorkStrip />
      <Stories />
      <LatestVideos />

      <BatchesTeaser />
      <Investment />
      <HomeFaq />

      <BusinessBand />
      <VisitStudio />
      <CtaBand />
    </>
  );
}
