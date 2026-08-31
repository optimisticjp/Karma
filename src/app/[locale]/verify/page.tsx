import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { VerifyForm } from "@/components/site/VerifyForm";
import { PageHead } from "@/components/kds/PageHead";
import { Icon } from "@/components/ui/Icon";

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
 * CERTIFICATE VERIFICATION.
 *
 * The one public surface where the design has to get out of the way. Someone
 * on this page is an employer or a client checking whether a certificate is
 * real, and their question is binary. So: no reveal animations, no decorative
 * motion, no marketing language around the result — the restraint IS the
 * credibility. A verification screen that looks like a campaign is a
 * verification screen nobody trusts.
 *
 * It sits on the COOL ground (`.on-mist`) for the same reason the notes
 * archive does: this is the file-and-record register of the site, not the
 * cloth one. The lookup is the only thing on the screen, and the studio's
 * phone number is directly beneath it — because "not found" is a reason to
 * call somebody, not a verdict on a person.
 */
export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("verifyPage");

  return (
    <>
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        aside={
          <>
            <p className="t-micro">{t("asideTitle")}</p>
            <p className="t-body mt-2">{t("asideBody")}</p>
          </>
        }
      />

      <section className="band on-mist" aria-labelledby="lookup-heading">
        <div className="wrap">
          <div className="reading-shell">
            {/* Not the field's own label repeated: an instruction. The
                heading and the label read as one duplicated line otherwise. */}
            <h2 id="lookup-heading" className="t-h3">
              {t("lookupTitle")}
            </h2>
            <div className="mt-4">
              <VerifyForm />
            </div>
            <p className="t-meta mt-4">
              <a className="act-quiet" href={`tel:+${site.whatsapp}`}>
                <Icon name="phone" size={15} /> {site.phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
