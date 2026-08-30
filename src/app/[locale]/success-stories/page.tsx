import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { PageIntro } from "@/components/ui/PageIntro";
import { Icon } from "@/components/ui/Icon";
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
  const [t, th, tc, l, all] = await Promise.all([
    getTranslations("storiesPage"),
    getTranslations("home.stories"),
    getTranslations("common"),
    getLocale(),
    getPublicStories()
  ]);
  const gu = l === "gu";
  // Managed rows are always sample:false; source fallbacks carry editorial
  // instructions in their quote fields and must never reach a visitor.
  const stories = all.filter((s) => !s.sample);

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <Link href="/admission" className="btn btn-primary">
            {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">
              {stories.length > 0 ? t("consentTitle") : th("pendingLabel")}
            </p>
            <p className="mt-3">{stories.length > 0 ? t("consentBody") : th("pendingNote")}</p>
          </>
        }
      />

      <section className="section">
        <div className="container-site">
          <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            {stories.map((s, i) => (
              <figure
                key={`${s.nameEn}-${i}`}
                className="card grid h-full gap-6 p-6 sm:grid-cols-[120px_1fr] md:p-8"
              >
                <ManagedPhoto src={s.mediaUrl} label={s.photoLabel} ratio="4/5" className="hidden sm:block" />
                <div>
                  <blockquote className="font-display text-h4 leading-snug">
                    “{gu ? s.quoteGu : s.quoteEn}”
                  </blockquote>
                  <figcaption className="mt-4 space-y-1 text-smallmeta text-stone">
                    <p className="font-bold text-carbon">{gu ? s.nameGu : s.nameEn}</p>
                    <p>{gu ? s.courseGu : s.courseEn}</p>
                    <p>
                      {th("before")}: {gu ? s.beforeGu : s.beforeEn}
                      <span aria-hidden="true" className="mx-2 text-vermilion-deep">
                        →
                      </span>
                      <span className="font-semibold text-carbon">
                        {th("after")}: {gu ? s.afterGu : s.afterEn}
                      </span>
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
