import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { PathChooser } from "@/components/home/PathChooser";
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

// The marketing page is static. Live batches load through the cached
// /api/batches endpoint client-side; YouTube is fetch-cached 6h.
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

/**
 * Homepage architecture: one argument, told in five acts, ending on the two
 * actions that matter (come see it, apply).
 *
 *  1 PROMISE   Hero, PathChooser            what this is, who it's for
 *  2 SUBSTANCE CourseFamilies → HowItWorks  what you learn and how
 *  3 PROOF     Trainers → Stories → Videos  who teaches, what came out of it
 *  4 OBJECTION Batches → Fees → FAQ         can I join, what does it cost, but…
 *  5 ACTION    Business → Visit → CTA       come to the studio, apply
 *
 * Acts 3 and 4 are what template sites skip: they jump from features to a
 * contact form and hope. Nobody enrols in a school without knowing who
 * teaches, what it costs, and what happens after they ask.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* 1 — promise */}
      <Hero />
      <PathChooser />

      {/* 2 — substance */}
      <CourseFamilies />
      <ScreenToStitch />
      <HowItWorks />

      <StitchDivider />

      {/* 3 — proof */}
      <Trainers />
      <WorkStrip />
      <Stories />
      <LatestVideos />

      {/* 4 — objections, in the order people raise them */}
      <BatchesTeaser />
      <Investment />
      <HomeFaq />

      {/* 5 — action */}
      <BusinessBand />
      <VisitStudio />
      <CtaBand />
    </>
  );
}
