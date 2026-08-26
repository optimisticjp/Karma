import { site } from "./site";

export type YtVideo = { id: string; title: string; published: string };

/**
 * Latest uploads via the public RSS feed (no API key). Fails soft to []
 * so the "Latest from the studio" section falls back to a channel link.
 */
export async function getLatestVideos(limit = 3): Promise<YtVideo[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtubeChannelId}`,
      // Cached 6h (audit fix: never fetch RSS per request).
      { signal: AbortSignal.timeout(4000), next: { revalidate: 21600 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1, limit + 1);
    return entries
      .map((e) => {
        const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const title = e.match(/<title>([^<]+)<\/title>/)?.[1];
        const published = e.match(/<published>([^<]+)<\/published>/)?.[1];
        return id && title ? { id, title, published: published ?? "" } : null;
      })
      .filter((v): v is YtVideo => v !== null);
  } catch {
    return [];
  }
}
