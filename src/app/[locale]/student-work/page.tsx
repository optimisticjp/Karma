import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/work/GalleryGrid";
import { galleryItems } from "@/content/collections";
import { pageMeta } from "@/lib/seo";

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
  const t = await getTranslations("workPage");

  return (
    <section className="section-compact">
      <div className="container-site">
        <h1 className="text-display max-w-3xl">{t("title")}</h1>
        <p className="text-lead prose-measure mt-5 text-stone">{t("sub")}</p>
        <div className="mt-10">
          <GalleryGrid items={[...galleryItems]} />
        </div>
      </div>
    </section>
  );
}
