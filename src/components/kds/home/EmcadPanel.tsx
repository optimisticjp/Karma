import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG, KARMA_SOFTWARE } from "@/content/course-operations";
import { intlLocale } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { MicroProof } from "@/components/kds/proof";
import { FeeSheet } from "@/components/kds/FeeSheet";
import { reviews } from "@/content/proof";
import { pick } from "@/lib/i18n/localized";
import { Icon } from "@/components/ui/Icon";

/**
 * The EMCAD DAHAO decision panel.
 *
 * This is the only course whose operational facts the studio has confirmed in
 * writing, and it is the course the whole positioning rests on. Every one of
 * those facts sits in one place a visitor can read in ten seconds: three
 * months, four batch timings, a free two-day demo of two hours a session,
 * ₹35,000 total with ₹25,000 at admission and ₹10,000 within one month, and
 * live machine practical throughout.
 *
 * EVERY NUMBER IS RENDERED FROM THE VERIFIED SOURCE
 * -------------------------------------------------
 * Nothing here is typed into a message catalogue. The duration, the fee split,
 * the balance window and the four timings all come from
 * `src/content/course-operations.ts`, so the page cannot drift from the record
 * and a correction is made in exactly one file. The catalogue holds labels and
 * sentences and no figures at all — a test enforces it.
 *
 * WHY IT DOES NOT SPREAD
 * ----------------------
 * These facts belong to ONE course out of eleven. The panel names that course
 * in its heading, carries that course's swatch, and links to that course page.
 * Nothing here is written as a fact about "Karma courses", because the other
 * ten have no confirmed duration and no published fee.
 *
 * NO PAYMENT CTA, DELIBERATELY
 * ----------------------------
 * Publishing the fee is not the same as collecting it. Fees are discussed and
 * recorded offline — there is no gateway, no checkout, no payment link and no
 * UPI request in this repository, and none is to be added. The panel says so
 * in copy rather than leaving a visitor hunting for a pay button.
 *
 * The four timings are PREFERENCES a visitor may express, not bookable
 * inventory: Karma keeps no per-slot capacity, and showing them as slots would
 * promise a seat nobody reserved.
 */
export function EmcadPanel() {
  const t = useTranslations("home.emcad");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const { durationMonths, fees, operations } = EMCAD_DAHAO;
  const money = (n: number) =>
    new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);

  const balance = fees.feeTotal - fees.feeAdmission;
  const demo = operations.demo;

  /* One sample review that speaks to this decision, at the point the decision
     is being made. It carries its own preview marker. */
  const proofLine = reviews.find((r) => r.courseSlug === EMCAD_DAHAO_SLUG);

  return (
    <section className="band on-cloth" aria-labelledby="emcad-heading">
      <div className="wrap">
        <div className="emcad">
          <div className="emcad-intro">
            <StitchSwatch slug={EMCAD_DAHAO_SLUG} className="emcad-swatch" />
            <p className="t-micro mt-4">{t("eyebrow")}</p>
            <h2 id="emcad-heading" className="t-h2 mt-1.5">
              {t("h2")}
            </h2>
            <p className="t-lede mt-3">{t("sub")}</p>

            <dl className="emcad-facts">
              <div>
                <dt className="t-micro">{t("softwareLabel")}</dt>
                <dd className="t-h4">{KARMA_SOFTWARE}</dd>
              </div>
              <div>
                <dt className="t-micro">{t("durationLabel")}</dt>
                <dd className="t-h4">{t("months", { count: durationMonths as number })}</dd>
              </div>
              <div>
                <dt className="t-micro">{t("practicalLabel")}</dt>
                <dd className="t-h4">{t("practicalValue")}</dd>
              </div>
              <div>
                <dt className="t-micro">{t("demoLabel")}</dt>
                <dd className="t-h4">
                  {t("demoValue", { days: demo?.days ?? 0, hours: demo?.hours ?? 0 })}
                </dd>
              </div>
            </dl>

            <div className="emcad-timings">
              <p className="t-micro">{t("timingsLabel")}</p>
              <ul className="emcad-timing-list" role="list">
                {operations.scheduleOptions.map((slot) => (
                  <li key={`${slot.startTime}-${slot.endTime}`} className="t-body numeric">
                    {slot.startTime}–{slot.endTime}
                  </li>
                ))}
              </ul>
              <p className="t-meta mt-2">{t("timingsNote")}</p>
            </div>
          </div>

          {/* The money, as a sheet — the one place on the site that reads as a
              document rather than a page, because that is what a fee plan is.
              The component is shared with the course page, so the two cannot
              state the same plan differently. */}
          <FeeSheet
            label={t("feeLabel")}
            total={money(fees.feeTotal)}
            totalNote={t("feeTotalNote")}
            rows={[
              { amount: money(fees.feeAdmission), note: t("feeAtAdmission"), paid: true },
              { amount: money(balance), note: t("feeBalance", { days: fees.feeBalanceDueDays }) }
            ]}
            offline={t("offline")}
            actions={
              <>
                <Link href={`/admission?course=${EMCAD_DAHAO_SLUG}`} className="act act-primary">
                  {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
                </Link>
                <Link href={`/courses/${EMCAD_DAHAO_SLUG}`} className="act act-secondary">
                  {t("ctaCourse")}
                </Link>
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
