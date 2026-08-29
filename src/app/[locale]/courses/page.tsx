import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CourseCard } from "@/components/course/CourseCard";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { coursesInFamily, families } from "@/content/courses";
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
  const [t, tc, l] = await Promise.all([
    getTranslations("coursesPage"),
    getTranslations("common"),
    getLocale()
  ]);
  const keys = Object.keys(families) as Array<keyof typeof families>;
  const stages = t.raw("pathway.stages") as Array<{ t: string; d: string }>;

  // One continuous catalogue numbering across all three families, so a
  // visitor can say "number six" and mean the same course we do.
  let counter = -1;

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("intro")}
        actions={
          <>
            <Link href="/admission" className="btn btn-primary">
              {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/admissions#batches" className="btn btn-secondary">
              {t("batchesCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("factsTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              {(t.raw("facts") as string[]).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Icon name="check" size={16} strokeWidth={2} className="mt-1 shrink-0 text-vermilion-deep" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </>
        }
      />

      {keys.map((key, idx) => {
        const f = families[key];
        const list = coursesInFamily(key);
        return (
          <section key={key} className={idx % 2 === 1 ? "section bg-ivory-2" : "section"}>
            <div className="container-site">
              {/* The family name is the heading; its intro is the lede. Setting
                  the intro as an h2 turned a five-line sentence into display
                  type and left the section without a name. */}
              <SectionHeading
                eyebrow={String(idx + 1).padStart(2, "0")}
                title={l === "gu" ? f.nameGu : f.nameEn}
                sub={l === "gu" ? f.introGu : f.introEn}
              />
              <div className="u-section-body grid gap-6 lg:gap-8 xl:grid-cols-2">
                {list.map((c) => {
                  counter += 1;
                  return (
                    <CourseCard key={c.slug} course={c} index={counter} layout="horizontal" />
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <section className="section border-t border-line">
        <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading title={t("pathway.h2")} sub={t("pathway.line")} />
          </div>
          <Ledger as="ol">
            {stages.map((s, i) => (
              <LedgerRow
                key={s.t}
                index={String(i + 1).padStart(2, "0")}
                title={s.t}
                note={s.d}
              />
            ))}
          </Ledger>
        </div>
      </section>
    </>
  );
}
