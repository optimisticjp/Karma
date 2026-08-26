import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CountUp } from "@/components/ui/CountUp";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { courses } from "@/content/courses";
import { verifiedFacts } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return pageMeta({ locale, path: "/about", title: t("title"), description: t("description") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const machineSlots = courses.filter((c) => c.family !== "software").slice(0, 4);

  return (
    <>
      <section className="section-compact">
        <div className="container-site">
          <h1 className="text-display max-w-3xl">{t("title")}</h1>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading title={t("storyTitle")} />
            <p className="prose-measure mt-5 rounded-xl border border-dashed border-vermilion bg-ivory-2 p-5 text-stone">
              ✍ {t("storyBody")}
            </p>
            <h2 className="text-h3 mt-12 font-display">{t("karmaTitle")}</h2>
            <p className="prose-measure mt-4 rounded-xl border border-dashed border-vermilion bg-ivory-2 p-5 text-stone">
              ✍ {t("karmaBody")}
            </p>
          </div>
          <div className="space-y-5">
            <PhotoSlot label={t("studioPhoto1")} ratio="4/5" />
            <PhotoSlot label={t("studioPhoto2")} ratio="3/2" />
          </div>
        </div>
      </section>

      <section className="section-compact bg-ivory-2">
        <div className="container-site">
          <SectionHeading title={t("machinesTitle")} sub={t("machinesBody")} />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {machineSlots.map((c) => (
              <PhotoSlot key={c.slug} label={c.photoLabel} ratio="1/1" />
            ))}
          </div>
        </div>
      </section>

      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("trainersTitle")} />
          <p className="prose-measure mt-5 rounded-xl border border-dashed border-vermilion bg-ivory-2 p-5 text-stone">
            ✍ {t("trainersNote")}
          </p>
        </div>
      </section>

      <StitchDivider />
      <section className="section-compact">
        <div className="container-site">
          <SectionHeading title={t("numbersTitle")} />
          <dl className="mt-8 grid gap-8 sm:grid-cols-3">
            {verifiedFacts.studentsTrained500 ? (
              <div>
                <dd className="numeral"><CountUp value={500} suffix="+" /></dd>
                <dt className="mt-2 font-semibold text-stone">{t("n1")}</dt>
              </div>
            ) : null}
            <div>
              <dd className="numeral"><CountUp value={8} /></dd>
              <dt className="mt-2 font-semibold text-stone">{t("n2")}</dt>
            </div>
            <div>
              <dd className="numeral">10:30</dd>
              <dt className="mt-2 font-semibold text-stone">{t("n3")}</dt>
            </div>
          </dl>
          <p className="mt-6 text-smallmeta text-stone">{t("numbersNote")}</p>
        </div>
      </section>
    </>
  );
}
