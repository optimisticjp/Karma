import { useLocale, useTranslations } from "next-intl";
import { machineCases } from "@/content/collections";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { NeedlePoint } from "@/components/kds/marks";

/**
 * MACHINE CASE NOTES — the proof on this site that carries the most weight.
 *
 * Generic praise from an anonymous reviewer proves nothing. Naming a fault,
 * the diagnosis, the setting that moved and what the next run produced proves
 * the studio runs production — and it is the only kind of proof a working
 * operator will actually read.
 *
 * **These carry no sample marker, deliberately.** They make no claim about a
 * person, a student, a client or an outcome: each is an ordinary production
 * fault with its ordinary cause, trade knowledge that would be equally true in
 * any unit in Surat. There is nothing here for the owner to verify.
 *
 * Set as a spec sheet rather than as cards, and the five fields are a fixed
 * schema — a reader who has learned where "Setting" sits in the first note can
 * jump straight to it in the fourth.
 */
export function MachineCaseNotes() {
  const t = useTranslations("proof.cases");
  const locale = useLocale() as Locale;

  /* Four labelled fields after the fault, in the order a job card is
     written. The fault itself leads unlabelled — it is the reason the note
     exists, not one of its columns. */
  const FIELDS = ["diagnosis", "change", "setting", "result"] as const;

  return (
    <section className="band on-mist" id="machine-notes" aria-labelledby="cases-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("eyebrow")}</p>
          <h2 id="cases-heading" className="t-h2 mt-1.5">
            {t("h2")}
          </h2>
          <p className="t-lede mt-3">{t("sub")}</p>
        </header>

        <ol className="cases" role="list">
          {machineCases.map((c, i) => (
            <li key={c.slug} className="case">
              <p className="case-head">
                <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                <span className="chip">{pick(c, "technique", locale)}</span>
              </p>
              <p className="t-h4 mt-3">{pick(c, "problem", locale)}</p>
              <dl className="case-fields">
                {FIELDS.map((field) => (
                  <div key={field}>
                    <dt className="t-micro">
                      <NeedlePoint state={field === "result" ? "done" : "now"} />
                      {t(field)}
                    </dt>
                    <dd className="t-body mt-1">{pick(c, field, locale)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>

        <p className="t-meta mt-6 max-w-prose">{t("foot")}</p>
      </div>
    </section>
  );
}
