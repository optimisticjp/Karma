import { useLocale, useTranslations } from "next-intl";
import type { Course } from "@/content/courses";
import { pickOptional, pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { MachineFrame } from "@/components/kds/Frame";
import { ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";

/**
 * The machine you will sit at, and what a session is actually like.
 *
 * **The machine is described, never specified.** What it does and what it is
 * for — never a head count, a speed, a model number or a manufacturer. Nobody
 * has verified those, and a specification is exactly the kind of number that
 * gets quoted back at a business later. A test fails if one appears.
 *
 * The practice paragraph is the honest version of "hands-on training": how
 * often you are at the machine, what you are doing while you are there, and
 * what you leave with. It is the difference between a course and a lecture,
 * and it is the thing a visitor cannot check from outside.
 */
export function CourseFloor({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const locale = useLocale() as Locale;
  const p = course.production;
  const software = pickOptional(p, "software", locale);

  return (
    <section className="band on-canvas" id="floor" aria-labelledby="floor-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("floorEyebrow")}</p>
            <h2 id="floor-heading" className="t-h2 mt-1.5">
              {t("practiceTitle")}
            </h2>
            <p className="t-lede mt-3 max-w-[48ch]">{pick(p, "practice", locale)}</p>
            <p className="t-meta mt-4 max-w-[44ch]">{t("practiceNote")}</p>
          </div>

          {/* The machine, as a plate: a heading, a description and nothing
              numeric. The swatch beside it says which material this floor
              produces, which is the one specification that is true. */}
          <MachineFrame className="floor-plate">
            <p className="t-micro">{t("machineTitle")}</p>
            <p className="t-h4 mt-2">{pick(p, "machine", locale)}</p>
            {software ? (
              <>
                <ThreadLine className="my-4" />
                <p className="t-micro">{t("softwareTitle")}</p>
                <p className="t-body mt-2">{software}</p>
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
