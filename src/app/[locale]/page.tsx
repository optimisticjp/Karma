import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
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

/**
 * Homepage composition.
 *
 * The page used to run sixteen sections at one uniform density, in an order
 * that put the two things a prospective student most needs — the schedule and
 * the fee answer — at positions eleven and twelve. It now reads as five
 * chapters, each a pair of sections sharing a surface, with the schedule
 * directly under the catalogue where the decision actually happens:
 *
 *   1. The offer          Hero
 *   2. What, and when     Courses · Batches            (ivory-2)
 *   3. How the work works Screen→stitch · Method       (ivory, signature tier)
 *   4. Proof              Student work · Stories · Teaching · Studio channel
 *   5. Decide             Fees · FAQ                   (ivory-2)
 *   6. Close              Business door (dark) · Visit · CTA (dark)
 *
 * Two dark bands punctuate the run, at the audience switch and at the close.
 * Section surfaces live on the components themselves; chapters that continue
 * a surface carry a hairline instead of a colour change.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />

      <CourseFamilies />
      <BatchesTeaser />

      <ScreenToStitch />
      <HowItWorks />

      <HomepageStats />
      <WorkStrip />
      <Stories />
      <Trainers />
      <LatestVideos />

      <Investment />
      <HomeFaq />

      <BusinessBand />
      <VisitStudio />
      <CtaBand />
    </>
  );
}
