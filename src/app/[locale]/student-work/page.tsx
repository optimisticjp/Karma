import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicGallery } from "@/lib/content/public";
import { photosInGroup } from "@/content/photo-manifest";
import { pageMeta } from "@/lib/seo";
import { site, waLink } from "@/lib/site";
import { WorkWall } from "@/components/kds/work/WorkWall";
import { PublishedWork } from "@/components/kds/work/PublishedWork";
import { MachineCaseNotes } from "@/components/kds/work/MachineCaseNotes";
import { CtaBand } from "@/components/kds/CtaBand";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/* The published gallery is database-backed with a source fallback. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.work" });
  return pageMeta({
    locale,
    path: "/student-work",
    title: t("title"),
    description: t("description")
  });
}

/**
 * STUDENT WORK — five blocks.
 *
 *  1  Intro     what this page is, and what is honestly not on it yet
 *  2  Archive   the six reserved shoot frames, at their real ratios
 *  3  Published whatever staff have published through Content Desk
 *  4  Cases     the machine case notes  ← the proof that carries most weight
 *  5  Close     the one action
 *
 * The page this replaces filtered every sample out, which — with nothing
 * published — left an intro above a "come and look instead" card and made the
 * absence of photography the loudest thing on the site.
 *
 * **The archive and the published feed are not the same thing and must not be
 * merged.** The archive is the six photographs the owner's shoot is for: fixed
 * slots, fixed ratios, no attribution. The feed is editable, with its
 * technique, course, note and consent metadata intact. Collapsing them would
 * mean either the shoot slots become deletable from an admin screen, or
 * published items lose the metadata that makes them publishable at all.
 *
 * The case notes are here because they are the proof the studio genuinely has
 * today, and they are more persuasive to a working operator than a photograph
 * would be — while claiming nothing about any person.
 */
export default async function StudentWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, items] = await Promise.all([
    getTranslations("workPage"),
    getTranslations("common"),
    getPublicGallery()
  ]);
  const reserved = photosInGroup("work").length;

  return (
    <>
      <section className="band-hero on-paper" aria-labelledby="work-heading">
        <div className="wrap">
          <div className="split">
            <div className="min-w-0">
              <p className="t-micro">{t("eyebrow")}</p>
              <h1 id="work-heading" className="t-h1 mt-3">
                {t("title")}
              </h1>
              <p className="t-lede mt-4 max-w-[46ch]">{t("sub")}</p>

              <ThreadLine draw className="my-6 w-28" />

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/admission" className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <Link href="/courses" className="act act-secondary">
                  {t("coursesCta")}
                </Link>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act-quiet"
                >
                  <Icon name="pin" size={16} /> {t("visitCta")}
                </a>
              </div>
            </div>

            {/* How anything gets onto this page. Stated up front rather than
                as a footnote, because it is the reason the page is honest
                about being unfinished. */}
            <aside className="courses-aside">
              <p className="t-micro">{t("consentTitle")}</p>
              <p className="t-body mt-2">{t("consentBody")}</p>
              <ThreadLine className="my-5" />
              <p className="t-micro">{t("reservedLabel")}</p>
              <p className="t-h3 numeric mt-1">{reserved}</p>
              <p className="t-meta mt-1">{t("reservedNote")}</p>
              <p className="mt-4">
                <a
                  href={waLink(tc("waPrefillDemo"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="act-quiet"
                >
                  <Icon name="whatsapp" size={16} /> {tc("whatsapp")}
                </a>
              </p>
            </aside>
          </div>
        </div>
      </section>

      <WorkWall />
      <PublishedWork items={items} />
      <MachineCaseNotes />

      <CtaBand title={t("meanwhileTitle")} sub={t("meanwhileBody")} ground="on-canvas" />
    </>
  );
}
