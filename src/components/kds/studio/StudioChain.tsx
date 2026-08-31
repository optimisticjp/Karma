import { useTranslations } from "next-intl";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";

/**
 * The B2B chain: REFERENCE → DIGITISING → SAMPLE → CORRECTION → MACHINE-READY.
 *
 * A business arrives with a situation rather than a browsing intent, and the
 * fastest way to answer "can this studio handle my mess" is to show the order
 * the work goes in.
 *
 * WHY THE STAGES CARRY MARKS AND NOT PHOTOGRAPHS
 * ----------------------------------------------
 * The owner's 32-shot list covers the school, not the commercial pipeline.
 * Inventing five B2B photo slots would put five frames on the page that nobody
 * has been briefed to shoot, and borrowing the school's frames would caption
 * commercial work with a classroom photograph. So the chain is drawn as a
 * seam — the same one the joining steps and the diagnostic checks use, because
 * it is the same idea: an ordered sequence where the order is the content.
 *
 * WHAT IS NOT PROMISED HERE
 * -------------------------
 * **No turnaround time, no file format, no price.** The studio has confirmed
 * none of the three, and a B2B page that invents a delivery window is writing
 * a cheque the floor has to cash. The copy asks for the buyer's deadline and
 * their machine's format rather than announcing ours.
 */
export function StudioChain() {
  const t = useTranslations("servicesPage.chain");
  /* Five stages, keyed s1…s5 in the catalogue. Each carries a label, a
     one-line caption and the detail a buyer actually needs. */
  const stages = [1, 2, 3, 4, 5].map((n) => ({
    label: t(`s${n}Label` as "s1Label"),
    caption: t(`s${n}Caption` as "s1Caption"),
    detail: t(`s${n}Detail` as "s1Detail")
  }));

  return (
    <section className="band on-mist" aria-labelledby="chain-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h2 id="chain-heading" className="t-h2 mt-1.5">
              {t("h2")}
            </h2>
            <p className="t-lede mt-3 max-w-[44ch]">{t("sub")}</p>
          </div>

          <ol className="pathway" role="list">
            {stages.map((stage, i) => (
              <li key={stage.label} className="pathway-step">
                <span className="pathway-mark" aria-hidden="true">
                  <NeedlePoint state={i === stages.length - 1 ? "todo" : "done"} />
                  {i < stages.length - 1 ? <ThreadLine vertical className="pathway-thread" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h4 mt-0.5 block">{stage.label}</span>
                  <span className="t-body mt-1 block">{stage.caption}</span>
                  <span className="t-meta mt-1 block">{stage.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
