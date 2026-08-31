import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NeedlePoint } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The four things people check before deciding, and the handbook in short.
 *
 * Fees, eligibility, language and what to bring were four separate answers
 * scattered across a page and a phone call. They are one block because they
 * are one question — *is this place going to work for me* — and because a
 * visitor chasing four basics through a call is a visitor who does not call.
 *
 * **The fee answer names the one course that has a published plan** and says
 * plainly that the others are settled in person. It never quotes a number for
 * a course whose fee the owner has not confirmed.
 *
 * The handbook is the rules that actually affect a student — attendance,
 * missed practicals, shared machines, phones — rather than a page of policy.
 * They are the institute's own, quoted from the message catalogue, and the
 * versioned admission norms are accepted separately on the form itself.
 */
export function BeforeYouCome() {
  const t = useTranslations("admissionsPage");
  const handbook = t.raw("handbook") as string[];

  const facts: Array<[string, string]> = [
    [t("feesTitle"), t("feesBody")],
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
