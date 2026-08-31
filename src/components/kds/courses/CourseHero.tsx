import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import { verifiedOperationsFor } from "@/content/course-operations";
import { coursePhotoFor } from "@/content/photo-manifest";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { PhotoFrame } from "@/components/kds/Frame";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * A course, in one screen.
 *
 * The lede is what the technique PRODUCES, because that is the only sentence
 * that answers "is this the work I want to do?" — a syllabus cannot, and a
 * list of modules certainly cannot.
 *
 * FOUR FACTS, AND WHAT EACH ONE IS ALLOWED TO SAY
 * ----------------------------------------------
 * Duration renders **only** where the owner confirmed one in writing. Every
 * other course says so plainly instead of guessing: an unconfirmed duration
 * beside a confirmed one is indistinguishable to a reader. Level and language
 * are institute-wide facts. There is no fee here — the money has its own block
 * further down, where the payment terms can sit with it.
 *
 * THE SWATCH IS ALWAYS THERE; THE PHOTOGRAPH IS NOT YET
 * ----------------------------------------------------
 * Eight of the eleven courses have a reserved photograph. All eleven have a
 * stitch swatch, so the page always has its own material identity, and a
 * course with no photograph is never handed somebody else's.
 */
export function CourseHero({ course }: { course: Course }) {
  const t = useTranslations("courseDetail");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const verified = verifiedOperationsFor(course.slug);
  const photo = coursePhotoFor(course.slug);
  const name = pick(course, "name", locale);

  const facts: Array<[string, string]> = [
    [
      t("durationLabel"),
      verified?.durationMonths
        ? t("months", { count: verified.durationMonths })
        : t("confirmDuration")
    ],
    ...(verified ? ([[t("softwareTitle"), verified.software]] as Array<[string, string]>) : []),
    [t("levelLabel"), t("levelValue")],
    [t("langLabel"), t("langValue")]
  ];

  return (
    <section className="band-hero on-canvas" aria-labelledby="course-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{pick(families[course.family], "name", locale)}</p>
            <h1 id="course-heading" className="t-h1 mt-3">
              {name}
            </h1>
            <p className="t-lede mt-4 max-w-[46ch]">
              {pick(course.production, "produces", locale)}
            </p>

            <ThreadLine draw className="my-6 w-28" />

            <dl className="hero-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="t-micro">{label}</dt>
                  <dd className="t-h4 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={{ pathname: "/admission", query: { course: course.slug, src: "course" } }}
                className="act act-primary"
              >
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <a
                href={waLink(tc("waPrefillCourse", { course: name }))}
                target="_blank"
                rel="noopener noreferrer"
                className="act act-secondary"
              >
                <Icon name="whatsapp" size={17} /> {tc("whatsapp")}
              </a>
              <a href={`tel:+${site.callPhone}`} className="act-quiet">
                <Icon name="phone" size={16} /> {tc("call")}
              </a>
            </div>
          </div>

          <div className="course-media min-w-0">
            {photo ? <PhotoFrame id={photo.id} scale="feature" /> : null}
            <figure className="course-swatch">
              <StitchSwatch slug={course.slug} />
              <figcaption className="t-meta">
                {t(`signatures.${course.slug}` as "signatures.zardosi-machine-embroidery")}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
