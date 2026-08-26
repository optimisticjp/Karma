import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerifyForm } from "@/components/site/VerifyForm";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.verify" });
  return pageMeta({ locale, path: "/verify", title: t("title"), description: t("description") });
}

export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("verifyPage");

  return (
    <section className="section-compact">
      <div className="container-site max-w-2xl">
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="mt-4 text-stone">{t("sub")}</p>
        <div className="mt-8">
          <VerifyForm />
        </div>
      </div>
    </section>
  );
}
