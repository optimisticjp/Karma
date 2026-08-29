import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/work/GalleryGrid";
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
  const [t, items] = await Promise.all([
    getTranslations("workPage"),
    getPublicGallery()
  ]);

  return (
    <section className="section-compact">
      <div className="container-site">
        <h1 className="text-display max-w-3xl">{t("title")}</h1>
        <p className="u-lede prose-measure">{t("sub")}</p>
        <div className="mt-10">
          <GalleryGrid items={items} />
        </div>
      </div>
    </section>
  );
}
