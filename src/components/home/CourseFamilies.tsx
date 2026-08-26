import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Icon, type IconName } from "@/components/ui/Icon";
import { courses, families } from "@/content/courses";

const familyIcon: Record<string, IconName> = { modern: "layers", software: "nodes" };

/**
 * One large feature (machine work: the heart of the studio) with two
 * supporting cards (spec: avoid three identical cards).
 */
export function CourseFamilies() {
  const t = useTranslations("home.families");
  const locale = useLocale();
  const gu = locale === "gu";

  const chipLinks = (key: keyof typeof families) =>
    courses
      .filter((c) => c.family === key)
      .map((c) => (
        <li key={c.slug}>
          <Link
            href={`/courses/${c.slug}`}
            className="inline-block rounded-full border border-line bg-ivory px-3 py-1 text-xs font-semibold text-stone transition-colors hover:border-vermilion hover:text-carbon"
          >
            {gu ? c.nameGu : c.nameEn}
          </Link>
        </li>
      ));

  const small = (key: "modern" | "software", delay: number) => {
    const f = families[key];
    return (
      <Reveal delay={delay}>
        <div className="card card-lift flex h-full flex-col p-6">
          <Icon name={familyIcon[key]} size={26} className="text-vermilion-deep" />
          <h3 className="text-h4 mt-4 font-display">{gu ? f.nameGu : f.nameEn}</h3>
          <p className="mt-2 text-smallmeta text-stone">{gu ? f.introGu : f.introEn}</p>
          <ul className="mt-4 flex flex-wrap gap-2">{chipLinks(key)}</ul>
        </div>
      </Reveal>
    );
  };

  const machine = families.machine;

  return (
    <section className="section bg-ivory-2">
      <div className="container-site">
        <SectionHeading title={t("h2")} sub={t("sub")} />
        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="card card-lift grid h-full overflow-hidden lg:grid-cols-[3fr_2fr]">
              <PhotoSlot
                label={machine.photoLabel}
                ratio="4/3"
                className="card-img h-full rounded-none border-0"
              />
              <div className="flex flex-col p-6 md:p-8">
                <p className="eyebrow">01</p>
                <h3 className="text-h3 mt-3">{gu ? machine.nameGu : machine.nameEn}</h3>
                <p className="mt-3 text-smallmeta text-stone">
                  {gu ? machine.introGu : machine.introEn}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">{chipLinks("machine")}</ul>
                <p className="mt-auto pt-6">
                  <Link
                    href="/courses"
                    className="stitch-link inline-flex items-center gap-1.5 font-semibold text-vermilion-deep"
                  >
                    {t("see")} <Icon name="arrow" size={16} className="arrow" />
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
          <div className="flex flex-col gap-6 lg:col-span-5">
            {small("modern", 80)}
            {small("software", 160)}
          </div>
        </div>
      </div>
    </section>
  );
}
