import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VerifyForm } from "@/components/site/VerifyForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { MonoNote } from "@/components/ui/MonoNote";
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

/**
 * Certificate verification.
 *
 * The one public surface where the design has to get out of the way. Someone
 * on this page is an employer or a client checking whether a certificate is
 * real, and their question is binary. So: no reveal animations, no decorative
 * motion, no marketing language around the result — the restraint IS the
 * credibility. A verification screen that looks like a campaign is a
 * verification screen nobody trusts.
 */
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
            <MonoNote as="p" tone="vermilion">{t("asideTitle")}</MonoNote>
            <p className="mt-1.5">{t("asideBody")}</p>
          </>
        }
      />
      <section className="section band-info">
        <div className="container-site">
          <div className="reading-shell">
            <VerifyForm />
          </div>
        </div>
      </section>
    </>
  );
}
