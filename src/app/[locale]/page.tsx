import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { TrustRail } from "@/components/home/TrustRail";
import { ProductionRailSection } from "@/components/home/ProductionRailSection";
import { EmcadDecision } from "@/components/home/EmcadDecision";
import { StudentWorkWall } from "@/components/home/StudentWorkWall";
import { WhereYouLearn } from "@/components/home/WhereYouLearn";
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
 *   1.  What is this, and what do I do?      Hero — offer, three actions, facts
 *   2.  Does anyone else rate it?            Trust rail
 *   3.  Show me the claim.                   01 DESIGN → 02 MACHINE → 03 RESULT
 *   4.  What does the work actually involve? Workflow 01→06
 *   5.  What can I learn?                    Machine Index — all eleven
 *   6.  Will it fix my problem?              Six production faults, named
 *   7.  Prove it.                            File → failed → correction → stitch
 *   8.  What does it cost, exactly?          EMCAD DAHAO decision block
 *   9.  What does a fee cover?               What is and is not included
 *  10.  When does it run?                    Batches
 *  11.  Show me the work.                    Material wall · gallery · stories
 *  12.  Who teaches, and where?              Trainers · the studio floor
 *  13.  Anything else?                       Channel · reviews · visit · FAQ
 *  14.  Not a student?                       Business door
 *  15.  Close.                               CTA
 *
 * Steps 6 and 7 are the ones no competing institute has. Naming six real
 * production faults and then showing a stitch-out that failed, with the file
 * change that fixes it, is worth more than any adjective on the page.
 *
 * Step 8 is the newest and the most valuable: the studio confirmed EMCAD
 * DAHAO's duration, timetable and fee in writing, so the page states them
 * plainly instead of asking people to enquire about a number. It reads those
 * figures straight from `src/content/course-operations.ts`, and it names the
 * one course they belong to — the other ten have no confirmed duration and no
 * published fee, and must not inherit either by standing nearby.
 *
 * The <ScreenToStitch> slider is deliberately not here. It showed the same
 * motif as file, path and finished piece — which the machine-proof strip now
 * does with two more states and a failure, in less height. The component
 * stays for a course detail page, where the interaction has room to earn it.
 *
 * BAND RHYTHM — MACHINE / MATERIAL / HUMAN / INFO
 * -----------------------------------------------
 * Since the light-first pass there are no dark bands, so the rule that keeps
 * a long scroll from reading as one slab is surface CHANGE, not darkness: no
 * two consecutive banded sections may share a band. MACHINE is Steel Mist
 * (the hero, the production rail, the EMCAD decision, the close), MATERIAL is
 * Worktable White (the index, the work wall), HUMAN is Raw Silk (trainers, the
 * studio, the footer) and INFO is Cotton (facts and decisions). The one
 * deliberate repeat is the warm chapter — trainers, then where you learn —
 * which carries a hairline instead of a colour change.
 *
 * ORDER — the 30-second decision, compacted
 * -----------------------------------------
 * Reordered 2026-08-31 to the compact-density plan's §6 rhythm. The EMCAD
 * decision block used to be the EIGHTH section: the one course with a
 * confirmed duration and a published fee sat behind the rail, the workflow,
 * the catalogue, the problems and the machine proof, and a visitor asking
 * "how long, how much" travelled four screens to find out. It is third now,
 * with <Investment> — the institute-wide half of the money question —
 * immediately after it, so the two halves of one question are one chapter.
 * The rail and the eleven-course index follow, which is the order the plan
 * asks for and also the order the questions actually arrive in.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustRail />

      <EmcadDecision />
      <Investment />

      <ProductionRailSection />
      <CourseCatalogue />
      <BatchesTeaser />

      <ProblemsSolved />
      <MachineProof />
      <ProductionWorkflow />

      <StudentWorkWall />
      <HomepageStats />
      <Proof />

      <Trainers />
      <WhereYouLearn />

      <LatestVideos />
      <Reviews />
      <VisitStudio />

      <HomeFaq />

      <BusinessBand />
      <CtaBand />
    </>
  );
}
