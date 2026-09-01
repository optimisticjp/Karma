import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/content/courses";
import type { CourseConfig } from "@/lib/course/config";
import { PhotoFrame } from "@/components/kds/Frame";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { StitchSwatch } from "@/components/kds/StitchSwatch";
import { Icon } from "@/components/ui/Icon";

/**
 * The hero. Thirty seconds, on a phone, on mobile data.
 *
 * Course-specific operational facts come from the same Console-backed EMCAD
 * configuration used by the course page and admission flow. If staff hides
 * that course or removes a demo/software fact, the hero stops advertising it
 * instead of keeping a source-coded copy alive.
 */
export function HomeHero({
  courses,
  emcad
}: {
  courses: Course[];
  emcad: CourseConfig | null;
}) {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const demo = emcad?.operations.demo ?? null;

  const facts: Array<[string, string]> = [];
  if (emcad?.software) facts.push([t("factSoftwareLabel"), emcad.software]);
  facts.push(
    [t("factPracticalLabel"), t("factPracticalValue")],
    [t("factWhereLabel"), t("factWhereValue")]
  );
  if (demo) facts.push([t("factDemoLabel"), t("factDemoValue", { days: demo.days })]);

  const preferredSwatches = [
    "zardosi-machine-embroidery",
    "sequence-work",
    "tufting",
    "emcad-embroidery-design"
  ];
  const visible = new Set(courses.map((course) => course.slug));
  const swatches = preferredSwatches.filter((slug) => visible.has(slug));
  const more = Math.max(courses.length - swatches.length, 0);

  const stages = [
    { key: "screen", id: "H1_EMCAD_SCREEN", register: "machine" as const },
    { key: "machine", id: "H2_MACHINE_STITCHING", register: "cloth" as const }
  ];

  return (
    <section className="band-hero on-canvas glow-screen">
      <div className="wrap">
        <div className="split">
          <div className="min-w-0">
            <p className="t-micro">{t("eyebrow")}</p>
            <h1 className="t-h1-hero mt-3">{t("h1")}</h1>
            <p className="t-lede mt-4 max-w-[46ch]">{t("sub")}</p>

            <ThreadLine draw className="my-6 w-28" />

            <dl className="hero-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="t-micro">{label}</dt>
                  <dd className="t-h4 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            {swatches.length > 0 ? (
              <ul className="hero-swatches" role="list">
                {swatches.map((slug) => (
                  <li key={slug}>
                    <StitchSwatch slug={slug} />
                  </li>
                ))}
                {more > 0 ? <li className="t-micro self-center">{t("swatchMore", { count: more })}</li> : null}
              </ul>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/admission" className="act act-primary">
                {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
              </Link>
              <Link href="/courses" className="act act-secondary">
                {t("ctaCourses")}
              </Link>
            </div>
          </div>

          <div className="hero-scene min-w-0">
            <span aria-hidden="true" className="hero-scene-thread">
              <ThreadLine vertical draw />
            </span>

            <figure className="hero-stage hero-stage--lead">
              <figcaption className="hero-stage-tag">
                <NeedlePoint state="done" />
                <span className="t-micro">{t("stageProof")}</span>
              </figcaption>
              <PhotoFrame id="H3_FINISHED_PIECE" scale="feature" />
            </figure>

            <div className="hero-stage-pair">
              {stages.map((s) => (
                <figure key={s.key} className="hero-stage">
                  <figcaption className="hero-stage-tag">
                    <NeedlePoint state="done" />
                    <span className="t-micro">{t(`stage${s.key === "screen" ? "Screen" : "Machine"}` as "stageScreen")}</span>
                  </figcaption>
                  <PhotoFrame id={s.id} scale="thumb" register={s.register} />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
