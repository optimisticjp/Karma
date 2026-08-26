import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SampleTag } from "@/components/ui/SampleTag";
import { stories } from "@/content/collections";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.stories" });
  return pageMeta({ locale, path: "/success-stories", title: t("title"), description: t("description") });
}

export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("storiesPage");
  const th = await getTranslations("home.stories");
  const tc = await getTranslations("common");
  const l = await getLocale();
  const gu = l === "gu";

  return (
    <section className="section-compact">
      <div className="container-site">
        <h1 className="text-display max-w-3xl">{t("title")}</h1>
        <p className="text-lead prose-measure mt-5 text-stone">{t("sub")}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {stories.map((s, i) => (
            <figure key={i} className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8">
              <PhotoSlot label={s.photoLabel} ratio="4/5" className="hidden sm:flex" />
              <div>
                <blockquote className="font-display text-h4 leading-snug">“{gu ? s.quoteGu : s.quoteEn}”</blockquote>
                <figcaption className="mt-4 space-y-1 text-smallmeta text-stone">
                  <p className="font-bold text-carbon">{gu ? s.nameGu : s.nameEn}</p>
                  <p>{gu ? s.courseGu : s.courseEn}</p>
                  <p>
                    {th("before")}: {gu ? s.beforeGu : s.beforeEn}
                    <span aria-hidden="true" className="mx-2 text-vermilion-deep">→</span>
                    <span className="font-semibold text-carbon">{th("after")}: {gu ? s.afterGu : s.afterEn}</span>
                  </p>
                </figcaption>
                {s.sample ? <p className="mt-3"><SampleTag /></p> : null}
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/admission" className="btn btn-primary">{tc("bookDemo")}</Link>
        </div>
      </div>
    </section>
  );
}
