import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechniquePlate } from "@/components/ui/TechniquePlate";
import { Icon, type IconName } from "@/components/ui/Icon";
import { courses, families } from "@/content/courses";
import { cn } from "@/lib/utils";

const familyIcon: Record<keyof typeof families, IconName> = {
  machine: "machine",
  modern: "layers",
  software: "nodes"
};

/**
 * The three families, and what each one is for.
 *
 * This section used to repeat all eight course names as chips — which the hero
 * index above it already does, better. Repeating a list is not emphasis, it is
 * noise, so this now answers the question the hero cannot: what distinguishes
 * these three groups, and which one is yours. Machine work gets the double
 * column because it is what most students come for and what Surat is known
 * for; the other two are peers, not afterthoughts.
 */
export function CourseFamilies() {
  const t = useTranslations("home.families");
  const locale = useLocale();
  const gu = locale === "gu";
  const keys = Object.keys(families) as Array<keyof typeof families>;

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} />

        <div className="u-section-body grid items-stretch gap-6 lg:grid-cols-4 lg:gap-8">
          {keys.map((key, i) => {
            const f = families[key];
            const count = courses.filter((c) => c.family === key).length;
            const lead = key === "machine";

            return (
              <Reveal
                key={key}
                delay={i * 80}
                className={cn(lead && "lg:col-span-2", "min-w-0")}
              >
                <article className="card card-lift flex h-full flex-col overflow-hidden">
                  <div className={cn("border-b border-line", lead ? "h-24 md:h-32" : "h-20")}>
                    <TechniquePlate variant={key} seed={i} className="card-img" />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <Icon name={familyIcon[key]} size={24} className="text-vermilion-deep" />
                      <span className="microlabel tabular">
                        {t("count", { count })}
                      </span>
                    </div>
                    <h3 className={cn("mt-4 font-display", lead ? "text-h3" : "text-h4")}>
                      <span className="card-title">{gu ? f.nameGu : f.nameEn}</span>
                    </h3>
                    <p className="mt-3 text-smallmeta text-stone">
                      {gu ? f.introGu : f.introEn}
                    </p>
                    <p className="mt-auto pt-6">
                      <Link
                        href="/courses"
                        className="stitch-link inline-flex min-h-8 items-center gap-1.5 font-semibold text-vermilion-deep"
                      >
                        {t("see")} <Icon name="arrow" size={16} className="arrow" />
                      </Link>
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
