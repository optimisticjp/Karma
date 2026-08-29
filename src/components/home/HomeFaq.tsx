import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { getPublicFaqs } from "@/lib/content/public";

/**
 * Objection handling at the point of decision. Staff-managed published FAQs
 * lead this list; source FAQs remain the safe fallback until Content Desk has
 * replacements. No browser-side fetch and no fake loading state.
 */
export async function HomeFaq() {
  const [t, locale, faqs] = await Promise.all([
    getTranslations("home.faq"),
    getLocale(),
    getPublicFaqs()
  ]);
  const gu = locale === "gu";
  const shortlist = faqs.slice(0, 5);

  return (
    <section className="section">
      <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading title={t("h2")} sub={t("sub")} />
          <p className="u-actions">
            <Link
              href="/admissions"
              className="stitch-link inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
            >
              {t("all")} <Icon name="arrow" size={16} className="arrow" />
            </Link>
          </p>
        </div>

        <Reveal>
          <div className="space-y-3">
            {shortlist.map((f, i) => (
              <details key={`${f.qEn}-${i}`} className="card group p-0" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{gu ? f.qGu : f.qEn}</span>
                  <Icon
                    name="plus"
                    size={18}
                    className="flex-none text-vermilion-deep transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="border-t border-line px-6 pb-6 pt-4 text-stone">
                  {gu ? f.aGu : f.aEn}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
