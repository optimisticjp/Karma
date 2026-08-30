import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
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
 *   1. What is this, and what do I do?     Hero (offer, 3 actions, trust rail)
 *   2. What does the work actually involve? Workflow 01→06
 *   3. What can I learn, and when?          Catalogue (11) · Batches
 *   4. Will it fix my problem?              Problems we teach you to solve
 *   5. Prove it.                            File → failed → correction → stitch
 *   6. Watch it change.                     Screen-to-stitch slider
 *   7. Who says so?                         Work · Trainers · Channel · Reviews
 *   8. What will it cost, where is it?      Fees · Visit
 *   9. Still unsure?                        FAQ
 *  10. Not a student?                       Business door
 *  11. Close.                               CTA
 *
 * Steps 4 and 5 are the ones no competing institute has. Naming five real
 * production faults and then showing a stitch-out that failed, with the file
 * change that fixes it, is worth more than any adjective on the page.
 *
 * The <ScreenToStitch> slider is deliberately not here. It showed the same
 * motif as file, path and finished piece — which the machine-proof strip now
 * does with two more states and a failure, in less height. Keeping both cost
 * 800px of desktop to say the same thing twice. The component stays for a
 * course detail page, where the interaction has room to earn its place.
 *
 * Exactly two dark bands punctuate the run — the audience switch and the
 * close. The machine-proof strip earns its emphasis from `bg-sand` and from
 * the contrast inside its own panels; a third dark band would turn
 * punctuation into decoration.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />

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
