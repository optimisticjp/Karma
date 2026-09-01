import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { families, type Course } from "@/content/courses";
import type { CourseConfig } from "@/lib/course/config";
import { coursePhotoFor } from "@/content/photo-manifest";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { site, waLink } from "@/lib/site";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { PhotoFrame } from "@/components/kds/Frame";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** Course identity is editorial; duration/software are Console-managed facts. */
export function CourseHero({ course, config }: { course: Course; config: CourseConfig }) {
  const t = useTranslations("courseDetail");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const photo = coursePhotoFor(course.slug);
  const name = pick(course, "name", locale);

  const facts: Array<[string, string]> = [
    [
      t("durationLabel"),
      config.durationMonths ? t("months", { count: config.durationMonths }) : t("confirmDuration")
    ],
    ...(config.software ? ([[t("softwareTitle"), config.software]] as Array<[string, string]>) : []),
    [t("levelLabel"), t("levelValue")],
    [t("langLabel"), t("langValue")]
  ];

  return (
    <section className="band-hero on-canvas" aria-labelledby="course-heading">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{pick(families[course.family], "name", locale)}</p>
            <h1 id="course-heading" className="t-h1 mt-3">{name}</h1>
            <p className="t-lede mt-4 max-w-[46ch]">{pick(course.production, "produces", locale)}</p>

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
