import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { MonoNote } from "@/components/ui/MonoNote";
import { KnotPoint } from "@/components/ui/StitchMark";
import { TrackedLink } from "@/components/site/TrackedLink";
import { EMCAD_DAHAO, EMCAD_DAHAO_SLUG, KARMA_SOFTWARE } from "@/content/course-operations";
import { site } from "@/lib/site";

/**
 * The EMCAD DAHAO decision block.
 *
 * This is the only course whose operational facts the owner has confirmed in
 * writing, and it is the course the whole positioning rests on. So every one
 * of those facts sits in one place a visitor can read in ten seconds:
 * three months, four batch timings, a free two-day demo of two hours a
 * session, ₹35,000 total with ₹25,000 at admission and ₹10,000 within one
 * month, and live machine practical throughout.
 *
 * EVERY NUMBER IS READ FROM THE VERIFIED SOURCE
 * ---------------------------------------------
 * Nothing here is typed into a message catalogue. The duration, the fee split,
 * the balance window and the four timings are rendered from
 * `src/content/course-operations.ts`, so the page cannot drift from the record
 * and a correction is made in exactly one file. The catalogue holds labels and
 * sentences; it holds no figures.
 *
 * NO PAYMENT CTA, DELIBERATELY
 * ----------------------------
 * Publishing the fee is not the same as collecting it. Fees are discussed and
 * recorded offline — there is no gateway, no checkout, no payment link and no
 * UPI request in this repository, and none is to be added. The block says so
 * in copy rather than leaving a visitor to wonder where the pay button is.
 *
 * WHY IT DOES NOT SPREAD
 * ----------------------
 * These facts belong to ONE course out of eleven. The block names that course
 * in its heading and links to that course page; nothing here is written as a
 * fact about "Karma courses", because the other ten have no confirmed duration
 * and no published fee.
 */
export function EmcadDecision() {
  const t = useTranslations("home.emcad");
  const tc = useTranslations("common");
  const locale = useLocale();
  const gu = locale === "gu";

  const { durationMonths, fees, operations } = EMCAD_DAHAO;
  const money = (n: number) =>
    new Intl.NumberFormat(gu ? "gu-IN" : "en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);

  const balance = fees.feeTotal - fees.feeAdmission;

  /* The four timings are preferences a visitor may express, not bookable
     inventory: Karma keeps no per-date capacity, and showing them as slots
     would promise a seat nobody reserved. */
  const timings = operations.scheduleOptions.map((slot) => `${slot.startTime}–${slot.endTime}`);

  const facts: Array<[string, string]> = [
    [t("softwareLabel"), KARMA_SOFTWARE],
    [t("durationLabel"), gu ? `${durationMonths} મહિના` : `${durationMonths} months`],
    [t("practicalLabel"), t("practicalValue")],
    [
      t("demoLabel"),
      gu
        ? `${operations.demo?.days} દિવસ · દરેક ${operations.demo?.hours} કલાક`
        : `${operations.demo?.days} days · ${operations.demo?.hours} hours a session`
    ]
  ];

  return (
    <section className="section band-machine" id="emcad">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />

        <div className="u-section-body emcad-grid">
          {/* What the course is */}
          <Reveal className="emcad-panel">
            <MonoNote as="p">
              {t("courseLabel")}
            </MonoNote>
            <dl className="emcad-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>
                    <MonoNote>{label}</MonoNote>
                  </dt>
                  <dd className="emcad-fact-value">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="emcad-timings">
              <MonoNote as="p">
                {t("timingsLabel")}
              </MonoNote>
              <ul className="emcad-timing-list">
                {timings.map((slot) => (
                  <li key={slot} className="emcad-timing">
                    {slot}
                  </li>
                ))}
              </ul>
              <p className="emcad-note">{t("timingsNote")}</p>
            </div>
          </Reveal>

          {/* What it costs, and how that is handled */}
          <Reveal delay={80} className="emcad-panel emcad-panel--fee">
            <MonoNote as="p">
              {t("feeLabel")}
            </MonoNote>

            <p className="emcad-total">{money(fees.feeTotal)}</p>
            <p className="emcad-total-note">{t("feeTotalNote")}</p>

            <ol className="emcad-schedule">
              <li>
                <KnotPoint size={12} tone="vermilion" className="emcad-knot" />
                <span className="emcad-schedule-amount">{money(fees.feeAdmission)}</span>
                <span className="emcad-schedule-when">{t("feeAtAdmission")}</span>
              </li>
              <li>
                <KnotPoint size={12} tone="vermilion" className="emcad-knot" />
                <span className="emcad-schedule-amount">{money(balance)}</span>
                <span className="emcad-schedule-when">
                  {t("feeBalance", { days: fees.feeBalanceDueDays })}
                </span>
              </li>
            </ol>

            <p className="emcad-offline">{t("offline")}</p>

            <div className="u-actions flex flex-wrap gap-3">
              <Link href="/admission" className="btn btn-primary btn-stitch">
                {t("ctaDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              <Link href={`/courses/${EMCAD_DAHAO_SLUG}`} className="btn btn-secondary">
                {t("ctaCourse")}
              </Link>
              <TrackedLink
                href={`tel:+${site.callPhone}`}
                event="call_demo_click"
                props={{ surface: "emcad" }}
                className="cta-tertiary"
              >
                <Icon name="phone" size={16} /> {tc("call")}
              </TrackedLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
