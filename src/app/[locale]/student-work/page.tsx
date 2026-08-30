import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkLedger } from "@/components/work/WorkLedger";
import { MaterialWall } from "@/components/work/MaterialWall";
import { MachineCases } from "@/components/work/MachineCases";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { getPublicGallery } from "@/lib/content/public";
import { waLink } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.work" });
  return pageMeta({ locale, path: "/student-work", title: t("title"), description: t("description") });
}

/**
 * Student work and machine notes.
 *
 * The page used to filter every sample out, which — with nothing published —
 * left an intro above a "come and look instead" card, and made the absence of
 * photography the loudest thing on the site.
 *
 * Three things fix that without inventing anything. The page opens with the
 * material archive — the six reserved frames from the studio shoot, at their
 * real ratios, as a mixed-ratio editorial wall rather than six identical
 * tiles. The gallery below shows its shoot-list rows as what they are: a
 * named planned shot in a photo slot, with a visible sample tag. And the page
 * carries the proof the studio genuinely does have — the machine case notes,
 * which are trade facts rather than claims about anyone, and which are more
 * persuasive to a working operator than a photograph would be.
 *
 * THE TWO GALLERIES ARE NOT THE SAME THING, AND SHOULD NOT BE MERGED
 * ------------------------------------------------------------------
 * `<MaterialWall>` is the six photographs the owner's shoot is for: fixed
 * slots, fixed ratios, no attribution, no captions beyond the shoot brief.
 * `<WorkLedger>` is whatever staff have published through Content Desk, with
 * its technique, course, production note and sample tags intact. One is the
 * studio's own record of its work; the other is an editable feed. Collapsing
 * them would mean either the shoot slots become deletable from an admin
 * screen, or published items lose their consent metadata.
 */
export default async function StudentWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, items] = await Promise.all([
    getTranslations("workPage"),
    getTranslations("common"),
    getPublicGallery()
  ]);
  const anySample = items.some((g) => g.sample);

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {t("cta")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/courses" className="btn btn-secondary">
              {t("coursesCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">
              {anySample ? t("pendingLabel") : t("consentTitle")}
            </p>
            <p className="mt-3">{anySample ? t("pendingNote") : t("consentBody")}</p>
          </>
        }
      />

      {/* The material archive: the six reserved frames, at their real ratios. */}
      <section className="section band-material">
        <div className="container-site">
          <SectionHeading title={t("archiveTitle")} sub={t("archiveSub")} />
          <MaterialWall className="u-section-body" />
        </div>
      </section>

      {/* The grid used to sit directly under the page H1, so the piece titles
          were the next heading on the page and the hierarchy jumped H1 -> H3.
          A real section heading fixes the outline and gives the gallery the
          one line of framing it was missing. */}
      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("galleryTitle")} sub={t("gallerySub")} />
          <div className="u-section-body">
            <WorkLedger items={items} />
          </div>
        </div>
      </section>

      {/* The proof that does not need a camera. */}
      <MachineCases />

      <section className="section-compact">
        <div className="container-site">
          <div className="surface surface-feature grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-10">
            <div>
              <h2 className="text-h3 font-display">{t("meanwhileTitle")}</h2>
              <p className="u-lede">{t("meanwhileBody")}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </a>
              <Link href="/contact" className="btn btn-secondary">
                {t("visitCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
