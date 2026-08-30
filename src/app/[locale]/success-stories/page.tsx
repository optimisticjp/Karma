import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { StoryCase } from "@/components/site/StoryCase";
import { ReviewWall } from "@/components/site/ReviewWall";
import { SocialAuthority } from "@/components/site/SocialAuthority";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ManifestPhoto } from "@/components/ui/PhotoSlot";
import { MonoNote } from "@/components/ui/MonoNote";
import { photosInGroup } from "@/content/photo-manifest";
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
 *
 * THE TWO RESERVED PORTRAITS
 * --------------------------
 * S1 and S2 from the shoot list are held here as frames that name the
 * photograph they are waiting for, with no name attached. That distinction is
 * the whole safeguard: a labelled empty frame is a visible work-in-progress; a
 * portrait captioned with a person is a claim about someone who has not
 * consented. The manifest's own alt guidance for these two slots says the same
 * thing — name the person ONLY with written consent — and the frames stay
 * anonymous until Content Desk's consent gate has been passed.
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
  const portraits = photosInGroup("story");

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

      {/* Two frames, waiting for two photographs. No names on them. */}
      <section className="section-compact band-human">
        <div className="container-site">
          <MonoNote as="p">{t("portraitsLabel")}</MonoNote>
          <ul className="story-portraits">
            {portraits.map((portrait) => (
              <li key={portrait.id}>
                <ManifestPhoto id={portrait.id} editorial />
              </li>
            ))}
          </ul>
          <p className="story-portraits-note">{t("portraitsNote")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <SectionHeading title={t("casesTitle")} sub={t("casesSub")} />
          <div className="story-grid u-section-body">
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
