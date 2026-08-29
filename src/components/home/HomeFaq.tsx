import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqList } from "@/components/site/FaqList";
import { Icon } from "@/components/ui/Icon";
import { getPublicFaqs } from "@/lib/content/public";

/**
 * Objection handling at the point of decision. Staff-managed published FAQs
 * lead this list; source FAQs remain the safe fallback until Content Desk has
 * replacements. No browser-side fetch and no fake loading state.
 */
export async function HomeFaq() {
  const [t, faqs] = await Promise.all([getTranslations("home.faq"), getPublicFaqs()]);

  return (
    <section className="section border-t border-line bg-ivory-2">
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
          <FaqList items={faqs.slice(0, 5)} />
        </Reveal>
      </div>
    </section>
  );
}
