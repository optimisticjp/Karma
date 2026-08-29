import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerifyForm } from "@/components/site/VerifyForm";
import { PageIntro } from "@/components/ui/PageIntro";
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
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("asideTitle")}</p>
            <p className="mt-3">{t("asideBody")}</p>
          </>
        }
      />
      <section className="section">
        <div className="container-site">
          <div className="reading-shell">
            <VerifyForm />
          </div>
        </div>
      </section>
    </>
  );
}
