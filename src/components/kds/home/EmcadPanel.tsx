import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO_SLUG } from "@/content/course-operations";
import { getCourseConfig } from "@/lib/course/config";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { MicroProof } from "@/components/kds/proof";
import { reviews } from "@/content/proof";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Homepage EMCAD decision panel. Operational facts stay live from Console,
 * while fee amounts remain private and are confirmed only at the studio. */
export async function EmcadPanel() {
  const [t, td, tc, rawLocale, config] = await Promise.all([
    getTranslations("home.emcad"),
    getTranslations("courseDetail"),
    getTranslations("common"),
    getLocale(),
    getCourseConfig(EMCAD_DAHAO_SLUG)
  ]);
  if (!config) return null;

  const locale = asLocale(rawLocale);
  const { operations } = config;
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

          <div className="fee-sheet">
            <p className="t-micro">{t("feeLabel")}</p>
            <p className="t-h3 mt-2">{td("feeAskTitle")}</p>
            <p className="t-meta mt-2">{td("feeAskNote")}</p>
            <p className="t-meta fee-offline">{td("feeNoGateway")}</p>
            <ThreadLine className="my-5" />
            <div className="fee-actions">
              <Link href={`/admission?course=${EMCAD_DAHAO_SLUG}`} className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <Link href={`/courses/${EMCAD_DAHAO_SLUG}`} className="act act-secondary">{t("ctaCourse")}</Link>
            </div>
            {proofLine ? (
              <MicroProof
                className="mt-6"
                quote={pick(proofLine, "text", locale)}
                author={proofLine.author}
                status={proofLine.status}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
