import type { Metadata } from "next";
import "../globals.css";
import "../thread-machine-proof.css";

/**
 * A third root layout, for the design-system reference at `/design`.
 *
 * This project has no shared `app/layout.tsx`: `[locale]/layout.tsx` and
 * `admin/layout.tsx` are two independent roots, and this is a third. That is
 * the point — it loads `globals.css` for the reset, the fonts and the Gujarati
 * script rules, and the new public system on top, and it loads NEITHER
 * `premium.css` NOR `machine-lab.css`.
 *
 * That omission is the useful part. Everything on `/design` is rendered by the
 * new system alone, with none of the old one underneath it, so what the page
 * shows is what the system actually does rather than what it does while
 * standing on two older stylesheets. If a primitive only looks right on a
 * public page, it is borrowing, and this page is where that shows up.
 */

export const metadata: Metadata = {
  title: "THREAD / MACHINE / PROOF — Karma design system",
  /* Internal reference. Not a public page, not in the sitemap, not indexed. */
  robots: { index: false, follow: false, nocache: true }
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="kds">{children}</body>
    </html>
  );
}
