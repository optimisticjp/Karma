import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";

/**
 * The fee objection, answered head-on. There is deliberately no payment
 * gateway here (a hard product rule), but "no gateway" must not mean "no
 * answer": silence about money reads as evasive and costs more enquiries
 * than any number would. So we publish exactly what is included, what is
 * not, and how the number is shared.
 *
 * ⚠ If the owner later decides to publish figures (checklist Q12), add them
 * to messages under home.investment.* : the layout already has room.
 */
export function Investment() {
  const t = useTranslations("home.investment");
  const tc = useTranslations("common");
  const included = t.raw("included") as string[];
  const notIncluded = t.raw("notIncluded") as string[];

  return (
    <section className="section-compact bg-ivory-2">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />

        <div className="u-section-body grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <div className="card h-full p-5 md:p-6">
              <h3 className="text-h4 font-display">{t("includedTitle")}</h3>
              <ul className="mt-4 space-y-2.5">
                {included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Icon name="check" size={18} strokeWidth={2} className="mt-1 text-success" />
                    <span className="text-stone">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-4">
                <p className="microlabel">{t("notIncludedTitle")}</p>
                <ul className="mt-3 space-y-2">
                  {notIncluded.map((item) => (
                    <li key={item} className="text-smallmeta text-stone">
                      — {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-5">
            <div className="card flex h-full flex-col p-5 md:p-6">
              <Icon name="spool" size={28} className="text-vermilion-deep" />
              <h3 className="text-h4 mt-5 font-display">{t("howTitle")}</h3>
              <p className="u-lede">{t("howBody")}</p>
              <p className="mt-4 rounded-lg bg-ivory-2 p-4 text-smallmeta font-semibold text-stone">
                {t("noGateway")}
              </p>
              <div className="u-actions mt-auto flex flex-wrap gap-3 pt-6">
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Icon name="whatsapp" size={18} /> {t("askCta")}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
