import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicStories } from "@/lib/content/public";
import { photosInGroup } from "@/content/photo-manifest";
import { googleRating, reviews, socialChannels } from "@/content/proof";
import { pick, pickOptional } from "@/lib/i18n/localized";
import { asLocale, routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { PageHead } from "@/components/kds/PageHead";
import { PhotoFrame } from "@/components/kds/Frame";
import { RatingBlock, ReviewRail, SampleMark, SocialProof } from "@/components/kds/proof";
import { CtaBand } from "@/components/kds/CtaBand";
import { NeedlePoint, ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/* Stories are database-backed with a source fallback. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.stories" });
  return pageMeta({
    locale,
    path: "/success-stories",
    title: t("title"),
    description: t("description")
  });
}

/**
 * SUCCESS STORIES — as mini case studies, not testimonials.
 *
 * This page once filtered sample stories out, which — with nothing published —
 * meant it rendered an intro and then nothing at all. CLAUDE.md's rule is that
 * source placeholders stay VISIBLE carrying their marker, not that they are
 * hidden, so each archetype renders with its own disclosure and is replaced in
 * place the moment a real story is published through Content Desk.
 *
 * **None of it reaches structured data.** No `Review`, no `AggregateRating`,
 * no `Person` on this page, and there will not be until the stories are real.
 * `src/lib/schema.ts` cannot import the proof registry at all.
 *
 * THE TWO RESERVED PORTRAITS
 * --------------------------
 * S1 and S2 from the shoot list are held as frames that name the photograph
 * they are waiting for, with **no name attached**. That distinction is the
 * whole safeguard: a labelled empty frame is a visible work-in-progress; a
 * portrait captioned with a person is a claim about someone who has not
 * consented. They stay anonymous until Content Desk's consent gate is passed.
 *
 * They also sit AFTER the stories. They used to run first, so a page called
 * Success stories opened with 470 characters of caveat and two empty frames,
 * and the first actual story began about 1,350px down.
 */
export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, rawLocale, stories] = await Promise.all([
    getTranslations("storiesPage"),
    getTranslations("common"),
    getLocale(),
    getPublicStories()
  ]);
  const l = asLocale(rawLocale);
  const anySample = stories.some((s) => s.sample);
  const portraits = photosInGroup("story");

  const tv = await getTranslations("home.voices");
  const ts = await getTranslations("proof.stories");

  return (
    <>
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("sub")}
        actions={
          <Link href="/admission" className="act act-primary">
            {tc("bookDemo")} <Icon name="arrow" size={17} className="arrow" />
          </Link>
        }
        aside={
          <>
            <p className="t-micro">{anySample ? t("sampleTitle") : t("consentTitle")}</p>
            <p className="t-body mt-2">{anySample ? t("sampleBody") : t("consentBody")}</p>
          </>
        }
      />

      <section className="band on-canvas" aria-labelledby="cases-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <h2 id="cases-heading" className="t-h2">
              {t("casesTitle")}
            </h2>
            <p className="t-lede mt-3">{t("casesSub")}</p>
          </header>

          <ol className="cases" role="list">
            {stories.map((s, i) => {
              /* A story published through Content Desk carries the fields
                 that form has; one without them renders as before → now
                 rather than as an empty case study. */
              const steps = (
                [
                  ["before", pickOptional(s, "before", l)],
                  ["learned", pickOptional(s, "learned", l)],
                  ["now", pickOptional(s, "now", l) ?? pickOptional(s, "after", l)]
                ] as const
              ).filter(([, v]) => Boolean(v));

              return (
                <li key={`${s.nameEn}-${i}`} className="case">
                  <p className="case-head">
                    <span className="chip">{pick(s, "course", l)}</span>
                    {s.sample ? <SampleMark status="sample" /> : null}
                  </p>
                  <p className="t-h4 mt-3">{pick(s, "name", l)}</p>
                  <blockquote className="t-body mt-2">{pick(s, "quote", l)}</blockquote>

                  {/* The arc goes behind one disclosure. Six full cases
                      measured 5,004px at 390px — six viewports to read six
                      stories nobody can compare, because only one fits on
                      screen at a time. `<details>` keeps every word in the
                      DOM: findable by the browser's own search, readable by a
                      screen reader, present with JavaScript off. Nothing is
                      truncated, which is why this is not a line clamp. */}
                  <details className="module mt-4">
                    <summary className="module-summary">
                      <span className="t-h4 min-w-0">{ts("readMore")}</span>
                      <Icon name="plus" size={17} className="module-plus" />
                    </summary>
                    <ol className="pathway module-points" role="list">
                      {steps.map(([key, value], j) => (
                        <li key={key} className="pathway-step">
                          <span className="pathway-mark" aria-hidden="true">
                            <NeedlePoint state={j === steps.length - 1 ? "todo" : "done"} />
                            {j < steps.length - 1 ? (
                              <ThreadLine vertical className="pathway-thread" />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="t-micro">{tv(key)}</span>
                            <span className="t-body mt-0.5 block">{value}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Two frames, waiting for two photographs. No names on them. */}
      <section className="band-tight on-cloth" aria-labelledby="portraits-heading">
        <div className="wrap">
          <p className="t-micro" id="portraits-heading">
            {t("portraitsLabel")}
          </p>
          <ul className="story-portraits" role="list">
            {portraits.map((portrait) => (
              <li key={portrait.id}>
                <PhotoFrame id={portrait.id} scale="feature" />
              </li>
            ))}
          </ul>
          <p className="t-meta mt-4 max-w-prose">{t("portraitsNote")}</p>
        </div>
      </section>

      {/* What people say, and where the studio is already seen. Both read the
          one proof registry, and both carry their own markers. */}
      <section className="band on-paper" aria-labelledby="voices-heading">
        <div className="wrap">
          <header className="max-w-prose">
            <p className="t-micro">{tv("eyebrow")}</p>
            <h2 id="voices-heading" className="t-h2 mt-1.5">
              {tv("h2")}
            </h2>
          </header>

          <div className="voices-rail">
            <ReviewRail items={reviews} locale={l} label={tv("railLabel")} />
          </div>

          <div className="voices-foot">
            <div className="min-w-0">
              <SocialProof
                items={socialChannels}
                label={tv("railLabel")}
                followCta={tv("h2")}
              />
            </div>
            <div className="voices-rating">
              <RatingBlock item={googleRating} caption={tv("ratingSource")} />
              <p className="t-meta mt-3 max-w-[38ch]">{tv("ratingNote")}</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={t("casesTitle")} sub={t("consentBody")} ground="on-canvas" />
    </>
  );
}
