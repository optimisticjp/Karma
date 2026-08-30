import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { machineCases } from "@/content/collections";

/**
 * Machine case notes — the proof that carries the most weight on this site.
 *
 * Generic praise from an anonymous reviewer proves nothing. Naming a fault,
 * the diagnosis, the setting that moved and what the next run produced proves
 * the studio runs production, and it is the only kind of proof a working
 * operator will actually read.
 *
 * These carry **no sample flag**, deliberately: they make no claim about a
 * person, a student, a client or an outcome. Each is an ordinary production
 * fault with its ordinary cause — trade knowledge that would be equally true
 * in any unit in Surat — so there is nothing here for the owner to verify.
 *
 * Set as a spec sheet rather than as cards. The five fields are a fixed
 * schema, and a reader who has learned where "Setting" sits in the first note
 * can jump straight to it in the fourth.
 */
export function MachineCases() {
  const t = useTranslations("proof.cases");
  const locale = useLocale();
  const gu = locale === "gu";

  return (
    <section className="section bg-ivory-2" id="machine-notes">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />

        <ol className="case-list u-section-body">
          {machineCases.map((c, i) => {
            const rows: Array<[string, string]> = [
              [t("diagnosis"), gu ? c.diagnosisGu : c.diagnosisEn],
              [t("change"), gu ? c.changeGu : c.changeEn],
              [t("setting"), gu ? c.settingGu : c.settingEn],
              [t("result"), gu ? c.resultGu : c.resultEn]
            ];
            return (
              <Reveal as="li" key={c.slug} delay={i * 50} className="case-note">
                <div className="case-head">
                  <span className="case-index tabular" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="chip">{gu ? c.techniqueGu : c.techniqueEn}</span>
                </div>
                <p className="case-problem">{gu ? c.problemGu : c.problemEn}</p>
                <dl className="case-fields">
                  {rows.map(([label, value]) => (
                    <div key={label}>
                      <dt className="case-label">{label}</dt>
                      <dd className="case-value">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            );
          })}
        </ol>

        <p className="case-foot">{t("foot")}</p>
      </div>
    </section>
  );
}
