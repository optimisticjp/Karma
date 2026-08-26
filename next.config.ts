import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enables Cloudflare bindings (R2 etc.) inside `next dev`.
initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" }
        ]
      }
    ];
  },
  // Old template URLs -> new pages (SEO: never lose a visitor to a 404).
  async redirects() {
    return [
      { source: "/flat-embrodary", destination: "/en/courses", permanent: true },
      { source: "/beads-sequins", destination: "/en/courses/sequence-work", permanent: true },
      { source: "/applique-3d", destination: "/en/courses", permanent: true },
      { source: "/about-us", destination: "/en/about", permanent: true },
      { source: "/contact-us", destination: "/en/contact", permanent: true },
      { source: "/courses", destination: "/en/courses", permanent: true }
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }]
  }
};

export default withNextIntl(nextConfig);
