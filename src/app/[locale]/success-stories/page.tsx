import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SampleTag } from "@/components/ui/SampleTag";
import { getPublicStories } from "@/lib/content/public";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  const [t, th, tc, l, stories] = await Promise.all([
    getTranslations("storiesPage"),
    getTranslations("home.stories"),
    getTranslations("common"),
    getLocale(),
    getPublicStories()
  ]);
  const gu = l === "gu";

  return (
    <section className="section-compact">
      <div className="container-site">
        <h1 className="text-display max-w-3xl">{t("title")}</h1>
        <p className="u-lede prose-measure">{t("sub")}</p>

        <div className="u-section-body grid gap-6 lg:gap-8 md:grid-cols-2">
          {stories.map((s, i) => (
            <figure key={`${s.nameEn}-${i}`} className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8">
              <ManagedPhoto src={s.mediaUrl} label={s.photoLabel} ratio="4/5" className="hidden sm:block" />
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
