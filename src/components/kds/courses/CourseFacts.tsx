import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/content/courses";
import { EMCAD_DAHAO } from "@/content/course-operations";
import type { CourseConfig } from "@/lib/course/config";
import { site, waLink } from "@/lib/site";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * Public course logistics deliberately exclude fee amounts. The institute
 * changes commercial terms frequently and confirms the current amount at the
 * studio; Console can still store it for staff operations.
 */
export function CourseFacts({ course, config }: { course: Course; config: CourseConfig }) {
  const t = useTranslations("courseDetail");
  const to = useTranslations("courseOps");
  const tc = useTranslations("common");

  const demo = config.operations.demo ?? EMCAD_DAHAO.operations.demo;
  const schedule = config.operations.scheduleOptions;
  const batchTitleKey = "batchTitle" as const;

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
            <h2 id="fees-heading" className="t-h2 mt-1.5">{t("feeTitle")}</h2>
            <p className="t-lede mt-3 max-w-[46ch]">{t("feeBody")}</p>

            {schedule.length > 0 ? (
              <div className="course-timings">
                <p className="t-micro">{to(batchTitleKey)}</p>
                <ul className="emcad-timing-list" role="list">
                  {schedule.map((slot) => (
                    <li key={slot.key} className="t-body numeric">
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

          <div className="fee-sheet">
            <p className="t-micro">{t("demoTitle")}</p>
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
        </div>
      </div>
    </section>
  );
}
