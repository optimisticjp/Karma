import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { privacySections } from "@/content/legal";
import { pick, pickList } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { PageHead } from "@/components/kds/PageHead";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  return pageMeta({
    locale,
    path: "/privacy",
    title: `${t("title")} | Karma Design Studio`,
    description: t("sub")
  });
}

/**
 * PRIVACY, AS A DOCUMENT.
 *
 * DPDP-aligned working draft — honest and plain, not legal advice. ⚠ Owner and
 * legal review are still open in `docs/content-checklist.md`.
 *
 * The copy lives in `src/content/legal.ts` and is read through `pick()` /
 * `pickList()`. It used to be two inline arrays chosen with
 * `locale === "gu" ? … : …`, which CLAUDE.md non-negotiable #1 rules out
 * everywhere: the else-branch of that ternary renders a MISSING Gujarati
 * string as English and is indistinguishable from a translated one.
 *
 * Set as a numbered document rather than as cards. Somebody reads this page
 * once, with a specific question, and the clause number is how they point at
 * the answer over the phone.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, rawLocale] = await Promise.all([getTranslations("privacyPage"), getLocale()]);
  const l = asLocale(rawLocale);

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

      <section className="band on-canvas" aria-labelledby="privacy-doc">
        <div className="wrap">
          <div className="reading-shell">
            <h2 id="privacy-doc" className="sr-only">
              {t("title")}
            </h2>

            <div className="legal-doc">
              {privacySections.map((section, i) => (
                <section key={section.id} className="legal-section" aria-labelledby={section.id}>
                  <p className="t-micro legal-index numeric" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <h3 id={section.id} className="t-h4">
                      {pick(section, "heading", l)}
                    </h3>
                    {pickList(section, "body", l).map((line) => (
                      <p key={line} className="t-body mt-2">
                        {/* The studio's contact route lives in `src/lib/site.ts`
                            alone, so the clause carries a token rather than a
                            second copy of the address. */}
                        {line.replace("{email}", site.email)}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <p className="legal-updated t-meta">
              <Link href="/contact" className="act-quiet">
                {t("contactCta")} <Icon name="arrow" size={15} className="arrow" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
