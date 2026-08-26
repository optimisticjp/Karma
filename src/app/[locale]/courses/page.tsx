import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { CourseCard } from "@/components/course/CourseCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { courses, families } from "@/content/courses";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.courses" });
  return pageMeta({ locale, path: "/courses", title: t("title"), description: t("description") });
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("coursesPage");
  const l = await getLocale();
  const keys = Object.keys(families) as Array<keyof typeof families>;

  return (
    <>
      <section className="section-compact">
        <div className="container-site">
          <h1 className="text-display">{t("title")}</h1>
          <p className="text-lead prose-measure mt-5 text-stone">{t("intro")}</p>
        </div>
      </section>

      {keys.map((key, idx) => {
        const f = families[key];
        const list = courses.filter((c) => c.family === key);
        return (
          <section key={key} className={idx % 2 === 1 ? "section-compact bg-ivory-2" : "section-compact"}>
            <div className="container-site">
              <SectionHeading
                eyebrow={`0${idx + 1}`}
                title={l === "gu" ? f.nameGu : f.nameEn}
                sub={l === "gu" ? f.introGu : f.introEn}
              />
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {list.map((c) => (
                  <CourseCard key={c.slug} course={c} layout="horizontal" />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <StitchDivider />
      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("pathway.h2")} sub={t("pathway.line")} />
          <p className="card mt-8 p-6 font-display text-h4 leading-relaxed text-stone">
            {t("pathway.steps")}
          </p>
        </div>
      </section>
    </>
  );
}
