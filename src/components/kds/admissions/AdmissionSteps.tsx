import { useTranslations } from "next-intl";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";

/**
 * Five steps, on one seam — and none of them cost anything.
 *
 * The order is the reassurance: the demo comes before the fee conversation,
 * and the form comes after both. Nothing on this route asks for money, and
 * nothing on this website could: there is no gateway in the repository.
 */
export function AdmissionSteps() {
  const t = useTranslations("admissionsPage");
  const steps = t.raw("steps") as Array<{ t: string; d: string }>;

  return (
    <section className="band on-canvas" aria-labelledby="steps-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("stepsEyebrow")}</p>
            <h2 id="steps-heading" className="t-h2 mt-1.5">
              {t("stepsTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[42ch]">{t("stepsSub")}</p>
          </div>

          <ol className="pathway" role="list">
            {steps.map((step, i) => (
              <li key={step.t} className="pathway-step">
                <span className="pathway-mark" aria-hidden="true">
                  <NeedlePoint state={i === steps.length - 1 ? "todo" : "done"} />
                  {i < steps.length - 1 ? <ThreadLine vertical className="pathway-thread" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h4 mt-0.5 block">{step.t}</span>
                  <span className="t-meta mt-1 block">{step.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
