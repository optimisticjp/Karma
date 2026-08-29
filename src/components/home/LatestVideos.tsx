import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLatestVideos } from "@/lib/youtube";
import { site } from "@/lib/site";

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
        <div className="mt-8">
          {videos.length > 0 ? (
            <ul className="grid gap-5 md:grid-cols-3">
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
                    <p className="p-4 text-smallmeta font-semibold">{v.title}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <a
              href={site.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-lift flex items-center justify-between gap-4 p-6 md:p-8"
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
