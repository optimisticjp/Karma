import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enables Cloudflare bindings inside `next dev` — and ONLY there.
//
// This starts a wrangler/miniflare proxy that emulates every binding declared
// in wrangler.jsonc. `next build` has no use for it (nothing renders against a
// live binding at build time), and running it there makes the build depend on
// emulating each binding locally: with HYPERDRIVE bound, miniflare demands a
// local Postgres connection string and rejects without one, failing CI and the
// Cloudflare build.
//
// Never fatal either way. Without the proxy, `getCloudflareContext()` throws
// and src/lib/db/index.ts takes its documented DATABASE_URL fallback, which is
// the local development path anyway.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev().catch((e: unknown) => {
    console.warn(
      "[dev] Cloudflare bindings unavailable; falling back to DATABASE_URL.",
      e instanceof Error ? e.message : e
    );
  });
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Security headers. The CSP is deliberately tight: every host below is an
  // exact origin, never a wildcard.
  //
  // connect-src carries two third parties:
  //   - challenges.cloudflare.com — Turnstile on the public forms.
  //   - the Supabase project origin — the Karma Console's browser-side auth
  //     client (@supabase/ssr) calls Supabase Auth endpoints from
  //     the page, so without it staff sign-in/session refresh is blocked.
  //
  // The project origin is written out in full rather than as *.supabase.co:
  // the wildcard would allow XHR to EVERY Supabase project on the internet,
  // which is an exfiltration path, and this project has exactly one.
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
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com https://zauklynwqdjlgqdpwczy.supabase.co; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" }
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
      { source: "/courses", destination: "/en/courses", permanent: true },
      /**
       * The machine note that used to be "emCAD or Wilcom" was rewritten as
       * "why one software" when the owner confirmed (2026-08-30) that Karma
       * teaches EMCAD DAHAO only. The old URL had been indexed, so it keeps
       * working rather than 404ing.
       */
      {
        source: "/:locale(en|gu)/notes/emcad-or-wilcom",
        destination: "/:locale/notes/why-one-software",
        permanent: true
      },
      /**
       * The certificate sheet moved out of the console shell into the print
       * route group when the A4 print system landed. Staff bookmark a
       * certificate they print often, so the old path keeps working.
       */
      {
        source: "/admin/certificates/print/:certNo",
        destination: "/admin/print/certificate/:certNo",
        permanent: true
      }
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }]
  }
};

export default withNextIntl(nextConfig);
