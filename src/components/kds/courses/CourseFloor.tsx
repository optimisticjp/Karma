import { useLocale, useTranslations } from "next-intl";
import type { Course } from "@/content/courses";
import type { CourseConfig } from "@/lib/course/config";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { MachineFrame } from "@/components/kds/Frame";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";

/** Editorial floor description plus Console-managed software/practical lines. */
export function CourseFloor({ course, config }: { course: Course; config: CourseConfig }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;
  const p = course.production;
  const practical = config.operations.practical;

  return (
    <section className="band on-canvas" id="floor" aria-labelledby="floor-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("floorEyebrow")}</p>
            <h2 id="floor-heading" className="t-h2 mt-1.5">{t("practiceTitle")}</h2>
            <p className="t-lede mt-3 max-w-[48ch]">{pick(p, "practice", locale)}</p>
            <p className="t-meta mt-4 max-w-[44ch]">{t("practiceNote")}</p>

            {practical.length > 0 ? (
              <ul className="module-points mt-5" role="list">
                {practical.map((line) => {
                  const value = locale === "gu" ? line.gu : line.en;
                  return (
                    <li key={value}>
                      <NeedlePoint state="done" />
                      <span className="t-body">{value}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <MachineFrame className="floor-plate">
            <p className="t-micro">{t("machineTitle")}</p>
            <p className="t-h4 mt-2">{pick(p, "machine", locale)}</p>
            {config.software ? (
              <>
                <ThreadLine className="my-4" />
                <p className="t-micro">{t("softwareTitle")}</p>
                <p className="t-body mt-2">{config.software}</p>
              </>
            ) : null}
            <div className="floor-swatch">
              <StitchSwatch slug={course.slug} />
              <p className="t-meta">{pick(p, "produces", locale)}</p>
            </div>
          </MachineFrame>
        </div>
      </div>
    </section>
  );
}
