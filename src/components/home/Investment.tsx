import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";

/**
 * What a fee buys — the half of the money question that is true of every
 * course.
 *
 * This sits directly under <EmcadDecision>, and the split between them is
 * deliberate. That block states the numbers the studio has confirmed, and they
 * belong to EMCAD DAHAO alone. This one answers "what does the fee actually
 * cover", which is the same answer for all eleven, so it is written as an
 * institute-wide statement and carries no figures at all.
 *
 * The no-online-payment line moved into <EmcadDecision>, next to the money —
 * which is where somebody looking for a pay button will be looking. Repeating
 * it here would have been the third time the page said it.
 *
 * ⚠ The other ten courses still have no published fee (checklist Q12). When
 * the owner confirms one, it goes into `src/content/course-operations.ts` and
 * renders from there — never typed into a message catalogue.
 */
export function Investment() {
  const t = useTranslations("home.investment");
  const tc = useTranslations("common");
  const included = t.raw("included") as string[];
  const notIncluded = t.raw("notIncluded") as string[];

  return (
    <section className="section-compact band-info">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />

        <div className="u-section-body grid gap-3 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <div className="card h-full p-3.5 md:p-4">
              <h3 className="text-h4 font-display">{t("includedTitle")}</h3>
              {/* 14px, not the inherited 16/1.625: six items were 518px of
                  card for a list of what a fee covers. */}
              <ul className="mt-2 space-y-1.5 text-smallmeta">
                {included.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Icon name="check" size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-success" />
                    <span className="text-stone">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-line pt-3">
                <p className="microlabel">{t("notIncludedTitle")}</p>
                <ul className="mt-1.5 space-y-1">
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
            <div className="card flex h-full flex-col p-3.5 md:p-4">
              <Icon name="spool" size={28} className="text-vermilion-deep" />
              <h3 className="text-h4 mt-5 font-display">{t("howTitle")}</h3>
              <p className="u-lede">{t("howBody")}</p>
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
