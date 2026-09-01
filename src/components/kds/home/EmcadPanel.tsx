import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO_SLUG } from "@/content/course-operations";
import { getCourseConfig } from "@/lib/course/config";
import { intlLocale, pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { MicroProof } from "@/components/kds/proof";
import { FeeSheet } from "@/components/kds/FeeSheet";
import { reviews } from "@/content/proof";
import { Icon } from "@/components/ui/Icon";

/** The homepage EMCAD decision panel reads the same Console configuration as
 * the course page and admission form. If staff hides the course or removes its
 * published fee, this promotional fee panel disappears rather than going stale. */
export async function EmcadPanel() {
  const [t, tc, rawLocale, config] = await Promise.all([
    getTranslations("home.emcad"),
    getTranslations("common"),
    getLocale(),
    getCourseConfig(EMCAD_DAHAO_SLUG)
  ]);
  if (!config?.fees) return null;

  const locale = asLocale(rawLocale);
  const { fees, operations } = config;
  const money = (n: number) =>
    new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);

  const balance = fees.total - fees.admission;
  const demo = operations.demo;
  const proofLine = reviews.find((review) => review.courseSlug === EMCAD_DAHAO_SLUG);

  return (
    <section className="band on-cloth" aria-labelledby="emcad-heading">
      <div className="wrap">
        <div className="emcad">
          <div className="emcad-intro">
            <StitchSwatch slug={EMCAD_DAHAO_SLUG} className="emcad-swatch" />
            <p className="t-micro mt-4">{t("eyebrow")}</p>
            <h2 id="emcad-heading" className="t-h2 mt-1.5">{t("h2")}</h2>
            <p className="t-lede mt-3">{t("sub")}</p>

            <dl className="emcad-facts">
              {config.software ? (
                <div>
                  <dt className="t-micro">{t("softwareLabel")}</dt>
                  <dd className="t-h4">{config.software}</dd>
                </div>
              ) : null}
              {config.durationMonths ? (
                <div>
                  <dt className="t-micro">{t("durationLabel")}</dt>
                  <dd className="t-h4">{t("months", { count: config.durationMonths })}</dd>
                </div>
              ) : null}
              <div>
                <dt className="t-micro">{t("practicalLabel")}</dt>
                <dd className="t-h4">{t("practicalValue")}</dd>
              </div>
              {demo ? (
                <div>
                  <dt className="t-micro">{t("demoLabel")}</dt>
                  <dd className="t-h4">{t("demoValue", { days: demo.days, hours: demo.hours })}</dd>
                </div>
              ) : null}
            </dl>

            {operations.scheduleOptions.length > 0 ? (
              <div className="emcad-timings">
                <p className="t-micro">{t("timingsLabel")}</p>
                <ul className="emcad-timing-list" role="list">
                  {operations.scheduleOptions.map((slot) => (
                    <li key={slot.key} className="t-body numeric">{slot.startTime}–{slot.endTime}</li>
                  ))}
                </ul>
                <p className="t-meta mt-2">{t("timingsNote")}</p>
              </div>
            ) : null}
          </div>

          <FeeSheet
            label={t("feeLabel")}
            total={money(fees.total)}
            totalNote={t("feeTotalNote")}
            rows={[
              { amount: money(fees.admission), note: t("feeAtAdmission"), paid: true },
              { amount: money(balance), note: t("feeBalance", { days: fees.balanceDueDays }) }
            ]}
            offline={t("offline")}
            actions={
              <>
                <Link href={`/admission?course=${EMCAD_DAHAO_SLUG}`} className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <Link href={`/courses/${EMCAD_DAHAO_SLUG}`} className="act act-secondary">{t("ctaCourse")}</Link>
              </>
            }
          >
            {proofLine ? (
              <MicroProof
                className="mt-6"
                quote={pick(proofLine, "text", locale)}
                author={proofLine.author}
                status={proofLine.status}
              />
            ) : null}
          </FeeSheet>
        </div>
      </div>
    </section>
  );
}
