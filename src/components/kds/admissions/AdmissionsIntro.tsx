import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO } from "@/content/course-operations";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Admission starts with the demo. No fee amount is published because the
 * institute confirms current commercial terms at the studio. */
export function AdmissionsIntro() {
  const t = useTranslations("admissionsPage");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const demo = EMCAD_DAHAO.operations.demo;
  const feePolicy = locale === "gu"
    ? "હાલની course fee અને લાગુ પડતા admission terms સ્ટુડિયોમાં તમારી સાથે કન્ફર્મ થાય છે. Website પર fee amount publish થતી નથી."
    : "The current course fee and applicable admission terms are confirmed with you at the studio. Fee amounts are not published on this website.";

  return (
    <section className="band-hero on-paper" aria-labelledby="admissions-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 id="admissions-heading" className="t-h1 mt-3">
              {t("title")}
            </h1>
            <p className="t-lede mt-4 max-w-[46ch]">{t("sub")}</p>

            <ThreadLine draw className="my-6 w-28" />

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {t("formCta")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <a
                href={waLink(tc("waPrefillDemo"))}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-secondary"
              >
                <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
              </a>
              <a href={`tel:+${site.callPhone}`} className="act-quiet">
                <Icon name="phone" size={16} /> {tc("call")}
              </a>
            </div>
          </div>

          <aside className="courses-aside">
            <p className="t-micro">{t("asideTitle")}</p>
            <ul className="courses-facts" role="list">
              <li>
                <NeedlePoint state="done" />
                <span className="t-body">
                  {t("asideDemo", { days: demo?.days ?? 2, hours: demo?.hours ?? 2 })}
                </span>
              </li>
              <li>
                <NeedlePoint state="done" />
                <span className="t-body">{t("asideNoPayment")}</span>
              </li>
              <li>
                <NeedlePoint state="done" />
                <span className="t-body">{feePolicy}</span>
              </li>
            </ul>
            <ThreadLine className="my-5" />
            <p className="t-micro">{t("hoursLabel")}</p>
            <p className="t-h4 mt-1">{pick(site, "hours", locale)}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
