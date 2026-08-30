import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/work/GalleryGrid";
import { PageIntro } from "@/components/ui/PageIntro";
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
 * Student work.
 *
 * With nothing published, this page used to be a short intro, a huge band of
 * nothing, a small "not published yet" note marooned in the middle, and another
 * huge band of nothing — which made the absence the loudest thing on the site.
 *
 * Now the honest note sits in the intro's own aside, where it reads as context
 * rather than as a hole, and the page spends its remaining height on what a
 * visitor can actually do next. The gallery takes over the moment Content Desk
 * publishes one consented piece.
 */
export default async function StudentWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, all] = await Promise.all([
    getTranslations("workPage"),
    getTranslations("common"),
    getPublicGallery()
  ]);
  // Source fallbacks are shot-list entries, not student work. Only real,
  // consented, Content-Desk-published pieces are shown.
  const items = all.filter((g) => !g.sample);

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
              {items.length > 0 ? t("consentTitle") : t("pendingLabel")}
            </p>
            <p className="mt-3">{items.length > 0 ? t("consentBody") : t("pendingNote")}</p>
          </>
        }
      />

      {items.length > 0 ? (
        <section className="section">
          <div className="container-site">
            <GalleryGrid items={items} />
          </div>
        </section>
      ) : (
        /* Nothing to show yet, so the page offers the next best thing: the
           work itself is on the machines, and you are welcome to come and
           look at it. No filler, no fabricated gallery. */
        <section className="section bg-ivory-2">
          <div className="container-site">
            <div className="feature-surface grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-10 md:p-8">
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
      )}
    </>
  );
}
