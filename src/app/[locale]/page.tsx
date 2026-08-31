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

/* Batches and the published FAQs are database-backed. Keep the page
   request-time until the planned incremental-cache work is activated. */
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
 * THE HOMEPAGE.
 *
 * Ten blocks, rebuilt from a blank composition. The page it replaces had
 * TWENTY sections and ran 18,665px at 390px, and its problem was not length —
 * it was that four separate sections argued the same machine claim, three
 * sections carried 1,900px of `⚠ Sample` cards, and the one course with a
 * confirmed fee sat behind five screens of preamble.
 *
 * THE ORDER IS THE ORDER THE QUESTIONS ARRIVE IN
 * ----------------------------------------------
 *  1  Hero               What is this and what do I do?
 *  2  Entry paths        Which of these three people am I?
 *  3  Sample book        What can I actually learn?
 *  4  Screen → Proof     Prove the claim. ← the signature interaction
 *  5  EMCAD panel        How long, how much, when, and how do I pay?
 *  6  Proof wall         Show me the work and the floor.
 *  7  Voices             Does anyone else rate it?
 *  8  Trust signals      How big is this, and who sends work?
 *  9  Batches + visit    When can I come, and where to?
 * 10  FAQ + close        Anything else? Then here is the one action.
 *
 * EVERY BLOCK IS A DIFFERENT SHAPE
 * --------------------------------
 * A hero scene, a stitched index, a horizontal sample rail, a five-state
 * tablist, a document-like fee sheet, a bento wall, four proof formats, a
 * typographic counter row, a schedule board and an accordion. That is the
 * addendum's §2 rule applied: the site may use familiar patterns, and what it
 * must not do is use the same one nine times.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * -----------------------------
 * Three sample-only sections left the homepage in the earlier direction and
 * have NOT come back as decoration — they came back as designed proof formats
 * that declare what they are. What did not come back at all: the four
 * overlapping "why us" sections, the video shelf, the trust rail of follower
 * counts floated beside machine facts, and the second fees chapter. Nothing
 * verified was lost; every fact removed is on the page that owns it.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <EntryPaths />
      <SampleBook />
      <ScreenMachineProof />
      <EmcadPanel />
      <ProofWall />
      <HomeVoices />
      <TrustSignals />
      <BatchesVisit />
      <HomeClose />
    </>
  );
}
