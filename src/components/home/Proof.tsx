import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkLedger } from "@/components/work/WorkLedger";
import { StoryCase } from "@/components/site/StoryCase";
import { Icon } from "@/components/ui/Icon";
import { getPublicGallery, getPublicStories } from "@/lib/content/public";

/**
 * Proof teaser: three pieces and one story.
 *
 * This used to filter samples out and, with nothing published, render a
 * "we have nothing to show" block on the homepage — which made the absence
 * the loudest thing on the page. It now shows what the proof pages show,
 * carrying the same visible sample tags, so the homepage tells the same story
 * as the page it links to.
 *
 * Deliberately small: three pieces and one story. The homepage's job is to
 * prove the proof exists and send you to it, not to be the gallery.
 */
export async function Proof() {
  const [t, tw, gallery, stories] = await Promise.all([
    getTranslations("home.proof"),
    getTranslations("home.work"),
    getPublicGallery(),
    getPublicStories()
  ]);
  const pieces = gallery.slice(0, 3);
  const story = stories[0];

  return (
    <section className="section bg-sand">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading title={tw("h2")} sub={tw("sub")} />
          <Link
            href="/student-work"
            className="stitch-link link-more mb-1 shrink-0"
          >
            {tw("seeAll")} <Icon name="arrow" size={16} className="arrow" />
          </Link>
        </div>

        {pieces.length > 0 ? (
          <div className="u-section-body">
            <WorkLedger items={pieces} />
          </div>
        ) : null}

        {story ? (
          <div className="u-section-body split">
            <StoryCase story={story} compact />
            <div>
              <h3 className="text-h3 font-display">{t("storiesTitle")}</h3>
              <p className="u-lede">{t("storiesBody")}</p>
              <p className="u-actions action-row">
                <Link href="/success-stories" className="btn btn-secondary">
                  {t("storiesCta")} <Icon name="arrow" size={18} className="arrow" />
                </Link>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
