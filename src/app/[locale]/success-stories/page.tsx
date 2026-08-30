import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { StoryCase } from "@/components/site/StoryCase";
import { ReviewWall } from "@/components/site/ReviewWall";
import { SocialAuthority } from "@/components/site/SocialAuthority";
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

/**
 * Success stories, as mini case studies.
 *
 * This page used to filter sample stories out, which — since nothing has been
 * published yet — meant it rendered an intro and then nothing at all. The
 * owner asked for the full system populated before real content arrives, and
 * CLAUDE.md's rule is that source placeholders stay visible *carrying their
 * `sample: true` marker*, not that they are hidden. So the six archetypes now
 * render, each with a visible tag, and each is replaced in place the moment a
 * real story is published through Content Desk.
 *
 * None of this reaches structured data. There is no `Review` or `Person`
 * markup on this page, and there will not be until the stories are real.
 */
export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, stories] = await Promise.all([
    getTranslations("storiesPage"),
    getTranslations("common"),
    getPublicStories()
  ]);
  const anySample = stories.some((s) => s.sample);

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
              {anySample ? t("sampleTitle") : t("consentTitle")}
            </p>
            <p className="mt-3">{anySample ? t("sampleBody") : t("consentBody")}</p>
          </>
        }
      />

      <section className="section">
        <div className="container-site">
          <div className="story-grid">
            {stories.map((s, i) => (
              <StoryCase key={`${s.nameEn}-${i}`} story={s} />
            ))}
          </div>
        </div>
      </section>

      <ReviewWall />
      <SocialAuthority />
    </>
  );
}
