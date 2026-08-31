import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { termsItems } from "@/content/legal";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { PageHead } from "@/components/kds/PageHead";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });
  return pageMeta({
    locale,
    path: "/terms",
    title: `${t("title")} | Karma Design Studio`,
    description: t("sub"),
    /* ⚠ DRAFT. This stays until the owner approves the text — see
       `docs/content-checklist.md`. It is not a styling decision and must not be
       removed by one; `tests/machine-lab-secondary.test.tsx` holds it. */
    noIndex: true
  });
}

/**
 * TERMS, AS NUMBERED CLAUSES.
 *
 * Six sentences a student or a business needs before they commit, each one a
 * clause somebody can quote back. Note what is NOT here: no fee figure, no
 * refund schedule, no duration for a course whose duration is unconfirmed.
 * Those are the owner's to state, and a terms page is the worst place to guess.
 *
 * The copy moved to `src/content/legal.ts` and is read through `pick()`; it was
 * previously an inline `locale === "gu" ? … : …`, which CLAUDE.md
 * non-negotiable #1 rules out.
 */
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, rawLocale] = await Promise.all([getTranslations("termsPage"), getLocale()]);
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

      <section className="band on-canvas" aria-labelledby="terms-doc">
        <div className="wrap">
          <div className="reading-shell">
            <h2 id="terms-doc" className="sr-only">
              {t("title")}
            </h2>

            <ol className="legal-doc" role="list">
              {termsItems.map((item, i) => (
                <li key={item.id} className="legal-section">
                  <p className="t-micro legal-index numeric" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="t-body min-w-0">{pick(item, "text", l)}</p>
                </li>
              ))}
            </ol>

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
