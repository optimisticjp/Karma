import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** The practical things a visitor checks before deciding. Fee amounts and
 * changing commercial terms are deliberately kept out of the public site. */
export function BeforeYouCome() {
  const t = useTranslations("admissionsPage");
  const locale = useLocale();
  const handbook = t.raw("handbook") as string[];
  const currentFee = locale === "gu"
    ? "હાલની fee અને payment schedule demo/counselling વખતે સ્ટુડિયોમાં જણાવવામાં આવે છે. Website પર fee amount publish થતી નથી અને online payment લેવાતું નથી."
    : "The current fee and payment schedule are explained at the studio during your demo or counselling. Fee amounts are not published here and no online payment is taken.";

  const facts: Array<[string, string]> = [
    [t("feesTitle"), currentFee],
    [t("eligTitle"), t("eligBody")],
    [t("langTitle"), t("langBody")],
    [t("bringTitle"), t("bringBody")]
  ];

  return (
    <section className="band on-cloth" aria-labelledby="before-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("beforeEyebrow")}</p>
          <h2 id="before-heading" className="t-h2 mt-1.5">
            {t("beforeTitle")}
          </h2>
          <p className="t-lede mt-3">{t("beforeSub")}</p>
        </header>

        <dl className="before-grid">
          {facts.map(([label, body]) => (
            <div key={label}>
              <dt className="t-h4">{label}</dt>
              <dd className="t-body mt-2">{body}</dd>
            </div>
          ))}
        </dl>

        <div className="before-handbook">
          <div className="min-w-0">
            <h3 className="t-h3">{t("handbookTitle")}</h3>
            <p className="t-meta mt-2 max-w-[40ch]">{t("handbookSub")}</p>
            <p className="mt-4">
              <Link href="/batches" className="act-quiet">
                {t("batchesCta")} <Icon name="arrow" size={15} className="arrow" />
              </Link>
            </p>
          </div>
          <ul className="handbook-list" role="list">
            {handbook.map((rule) => (
              <li key={rule}>
                <NeedlePoint state="done" />
                <span className="t-body">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
