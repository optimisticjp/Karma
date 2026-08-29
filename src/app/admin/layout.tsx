import type { Metadata } from "next";
import "../globals.css";
import "../premium.css";

/**
 * Root layout for the Karma Console.
 *
 * The console deliberately sits OUTSIDE the `[locale]` segment: staff type
 * `/admin`, never `/en/admin`, and the public site's locale routing is
 * untouched by anything in here. Because there is no shared root layout above
 * `app/[locale]` and `app/admin`, this file owns its own <html>.
 *
 * `force-dynamic` + `force-no-store` apply to every segment below this one.
 * Authenticated pages must never be statically generated at build time or
 * cached: a console page is per-session by definition, and a build has no
 * credentials to render one with anyway.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Karma Console",
  // A staff tool has no business in a search index.
  robots: { index: false, follow: false, nocache: true }
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="console-root bg-ivory text-carbon">{children}</body>
    </html>
  );
}
