import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { TrustRail } from "@/components/home/TrustRail";
import { ProductionRailSection } from "@/components/home/ProductionRailSection";
import { HomepageStats } from "@/components/home/HomepageStats";
import { CourseCatalogue } from "@/components/home/CourseCatalogue";
import { ProductionWorkflow } from "@/components/home/ProductionWorkflow";
import { ProblemsSolved } from "@/components/home/ProblemsSolved";
import { MachineProof } from "@/components/home/MachineProof";
import { Reviews } from "@/components/home/Reviews";
import { Trainers } from "@/components/home/Trainers";
import { Proof } from "@/components/home/Proof";
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
 * Homepage composition — the 30-second decision.
 *
 * The visitor arrives from an Instagram reel, on a phone, on mobile data. The
 * order below is the order that answers their questions as they actually ask
 * them, rather than the order a brochure would use:
 *
 *   1. What is this, and what do I do?     Hero (offer, 3 actions, machine facts)
 *   2. Does anyone else rate it?            Trust rail
 *   3. Show me the claim.                   01 DESIGN → 02 MACHINE → 03 RESULT
 *   4. What does the work actually involve? Workflow 01→06
 *   5. What can I learn, and when?          Catalogue (11) · Batches
 *   6. Will it fix my problem?              Problems we teach you to solve
 *   7. Prove it.                            File → failed → correction → stitch
 *   8. Who says so?                         Work · Trainers · Channel · Reviews
 *   9. What will it cost, where is it?      Fees · Visit
 *  10. Still unsure?                        FAQ
 *  11. Not a student?                       Business door
 *  12. Close.                               CTA
 *
 * Steps 6 and 7 are the ones no competing institute has. Naming five real
 * production faults and then showing a stitch-out that failed, with the file
 * change that fixes it, is worth more than any adjective on the page.
 *
 * The <ScreenToStitch> slider is deliberately not here. It showed the same
 * motif as file, path and finished piece — which the machine-proof strip now
 * does with two more states and a failure, in less height. Keeping both cost
 * 800px of desktop to say the same thing twice. The component stays for a
 * course detail page, where the interaction has room to earn its place.
 *
 * Dark bands are punctuation: the hero (the machine floor), the production
 * rail directly under it, the audience switch and the close. Each is followed
 * by a light band, because a dark surface stops being punctuation the moment
 * two of them run together.
 *
 * Phase 3 of the Machine Lab redesign rebuilds this composition in full; this
 * order is the Phase 2 state, with the hero, trust rail and production rail
 * already in their final places.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustRail />
      <ProductionRailSection />

      <ProductionWorkflow />

      <CourseCatalogue />
      <BatchesTeaser />

      <ProblemsSolved />
      <MachineProof />

      <HomepageStats />
      <Proof />
      <Trainers />
      <LatestVideos />
      <Reviews />

      <Investment />
      <VisitStudio />

      <HomeFaq />

      <BusinessBand />
      <CtaBand />
    </>
  );
}
