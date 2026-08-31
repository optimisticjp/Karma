import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * How joining works — four steps, on one seam.
 *
 * Every one of them is a fact the institute has confirmed in writing: the demo
 * is free and comes first, the machine is used on that visit, the batch is
 * chosen after, and admission is completed at the studio. There is no step
 * that happens on this website, because none does — **no payment, no booking
 * fee, no seat held online.**
 *
 * Drawn as a seam rather than four cards because it is a sequence, and the
 * order is the reassurance: nobody is asked to commit before they have sat at
 * a machine.
 */
export function JoiningSteps() {
  const t = useTranslations("batchesPage");

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <section className="band on-mist" aria-labelledby="joining-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("joiningEyebrow")}</p>
            <h2 id="joining-heading" className="t-h2 mt-1.5">
              {t("joiningTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[42ch]">{t("joiningSub")}</p>
            <p className="t-meta mt-4 max-w-[44ch]">{t("normsNote")}</p>
            <p className="mt-4">
              <Link href="/admissions" className="act act-secondary">
                {t("normsLink")} <Icon name="arrow" size={16} className="arrow" />
              </Link>
            </p>
          </div>

          <ol className="pathway" role="list">
            {steps.map((step, i) => (
              <li key={step} className="pathway-step">
                <span className="pathway-mark" aria-hidden="true">
                  <NeedlePoint state={i === steps.length - 1 ? "todo" : "done"} />
                  {i < steps.length - 1 ? <ThreadLine vertical className="pathway-thread" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h4 mt-0.5 block">{step}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
