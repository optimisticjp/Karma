import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/work/GalleryGrid";
import { PageIntro } from "@/components/ui/PageIntro";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { getPublicGallery } from "@/lib/content/public";
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

export default async function StudentWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, all] = await Promise.all([
    getTranslations("workPage"),
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
          <Link href="/admission" className="btn btn-primary">
            {t("cta")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("consentTitle")}</p>
            <p className="mt-3">{t("consentBody")}</p>
          </>
        }
      />
      <section className="section">
        <div className="container-site">
          <GalleryGrid items={items} />
        </div>
      </section>
    </>
  );
}
