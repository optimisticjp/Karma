import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/content/courses";
import { EMCAD_DAHAO, verifiedOperationsFor } from "@/content/course-operations";
import { intlLocale } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { FeeSheet } from "@/components/kds/FeeSheet";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * The money, the timings and the demo — or the honest absence of two of them.
 *
 * ONE COURSE HAS CONFIRMED FIGURES. TEN DO NOT.
 * ---------------------------------------------
 * EMCAD DAHAO Embroidery Designing has a duration, four batch timings and a
 * complete fee plan the studio confirmed in writing, and this block publishes
 * all of it, rendered from `src/content/course-operations.ts`.
 *
 * The other ten have **no published fee and no confirmed duration**, and this
 * block says exactly that rather than leaving a gap a reader has to interpret.
 * The alternative — quietly omitting the section — reads as evasion, and
 * copying EMCAD's numbers across would be a lie about ten courses.
 *
 * NO GATEWAY, ON EITHER BRANCH
 * ----------------------------
 * There is no payment link, no checkout and no UPI request on this site. Both
 * branches say so in words. See `CLAUDE.md` §5.
 */
export function CourseFacts({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const to = useTranslations("courseOps");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const verified = verifiedOperationsFor(course.slug);
  /* The free demo is institute-wide and confirmed; only the FEE is
     course-specific. */
  const demo = EMCAD_DAHAO.operations.demo;
  const money = (n: number) =>
    new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);

  const demoActions = (
    <>
      <Link
        href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
        className="act act-primary"
      >
        {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
      </Link>
      <a
        href={waLink(tc("waPrefillDemo"))}
        target="_blank"
        rel="noopener noreferrer"
        className="act act-secondary"
      >
        <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
      </a>
    </>
  );

  return (
    <section className="band on-cloth" id="fees" aria-labelledby="fees-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("feesEyebrow")}</p>
            <h2 id="fees-heading" className="t-h2 mt-1.5">
              {t("feeTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[46ch]">
              {verified ? t("feeVerifiedBody") : t("feeBody")}
            </p>

            {verified ? (
              <div className="course-timings">
                <p className="t-micro">{to("batchTitle")}</p>
                <ul className="emcad-timing-list" role="list">
                  {verified.operations.scheduleOptions.map((slot) => (
                    <li key={`${slot.startTime}-${slot.endTime}`} className="t-body numeric">
                      {slot.startTime}–{slot.endTime}
                    </li>
                  ))}
                </ul>
                <p className="t-meta mt-2">{to("batchSub")}</p>
              </div>
            ) : (
              <p className="t-meta mt-4 max-w-[46ch]">{t("feeNote")}</p>
            )}

            <ThreadLine className="my-6" />

            <p className="t-micro">{t("certTitle")}</p>
            <p className="t-body mt-2 max-w-[46ch]">{t("certBody")}</p>
            <p className="mt-4">
              <Link href="/admissions" className="act-quiet">
                {t("faqCta")} <Icon name="arrow" size={15} className="arrow" />
              </Link>
            </p>
          </div>

          {verified ? (
            <FeeSheet
              label={to("feeTitle")}
              total={money(verified.fees.feeTotal)}
              totalNote={to("feeTotal")}
              rows={[
                {
                  amount: money(verified.fees.feeAdmission),
                  note: to("feeAdmission"),
                  paid: true
                },
                {
                  amount: money(verified.fees.feeTotal - verified.fees.feeAdmission),
                  note: to("feeBalance")
                }
              ]}
              offline={to("feeOffline")}
              actions={demoActions}
            >
              <p className="t-meta mt-4">{to("feeBalanceNote")}</p>
            </FeeSheet>
          ) : (
            /* The honest version. A demo, the two ways to ask, and no number
               nobody has confirmed. */
            <div className="fee-sheet">
              <p className="t-micro">{t("demoTitle")}</p>
              {/* The figure this sheet CAN state: the demo is free and it is
                  two days, and both are confirmed. It takes the place the fee
                  takes on the one course that has one. */}
              <p className="fee-total numeric">{t("demoFree", { days: demo?.days ?? 2 })}</p>
              <p className="t-meta">{t("demoBody")}</p>

              <ThreadLine className="my-5" />

              <p className="t-h4">{t("feeAskTitle")}</p>
              <p className="t-meta mt-1.5">{t("feeAskNote")}</p>

              <p className="t-meta fee-offline">{t("feeNoGateway")}</p>
              <div className="fee-actions">{demoActions}</div>
              <p className="t-meta mt-4">
                <a href={`tel:+${site.callPhone}`} className="act-quiet">
                  <Icon name="phone" size={16} /> {tc("call")}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
