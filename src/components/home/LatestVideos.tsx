import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLatestVideos } from "@/lib/youtube";
import { site } from "@/lib/site";
import { scriptLang } from "@/lib/i18n/localized";

/**
 * Latest uploads from the studio's real channel via RSS; graceful fallback
 * to a channel card when the feed is unreachable. Plain <img> + link-out:
 * no heavy embeds on first load (plan 9.1 section 9).
 */
export async function LatestVideos() {
  const t = await getTranslations("home.videos");
  const videos = await getLatestVideos(3);

  return (
    <section className="section-compact border-t border-line">
      <div className="container-site">
        <SectionHeading title={t("h2")} sub={t("sub")} />
        <div className="u-section-body">
          {videos.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {videos.map((v) => (
                <li key={v.id} className="card card-lift overflow-hidden">
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                      alt=""
                      width={480}
                      height={360}
                      loading="lazy"
                      className="card-img aspect-video w-full object-cover"
                    />
                    {/* Titles come from the YouTube feed, so they contain
                        handles and hashtags — unbreakable tokens that pushed
                        past the card at 200% zoom and were silently clipped by
                        `overflow-hidden`. Any string we did not write gets to
                        break wherever it must. */}
                    {/* The studio posts in Gujarati, so a title from the feed
                        is usually Gujarati — on the English page that is a run
                        of text in a script the document's font stack does not
                        contain, announced by a screen reader in the wrong
                        voice. We cannot know a feed string's language, but we
                        can read its script. */}
                    <p
                      lang={scriptLang(v.title)}
                      className="u-break p-3 text-smallmeta font-semibold md:p-4"
                    >
                      {v.title}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <a
              href={site.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-lift flex items-center justify-between gap-4 p-3.5 md:p-5"
            >
              <p className="font-semibold">▶ {t("channel")}</p>
              <span aria-hidden="true" className="text-vermilion-deep">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
