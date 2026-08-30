import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    /* `/admin` already sets `robots: noindex` in its own metadata, but a
       crawler has to fetch a page to read that. Disallowing here keeps the
       console out of crawl budget entirely, and the two together mean a
       missed header on one route cannot leak a staff screen into an index. */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/admin/"] }],
    sitemap: `${site.url}/sitemap.xml`
  };
}
