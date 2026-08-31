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
 * That omission USED to be the useful part: while the public layout still
 * loaded both Console sheets, this page was the only place a primitive could
 * be seen standing on its own, and anything that only looked right on a public
 * page was borrowing.
 *
 * Phase 11 cut those two imports from the public layout as well, so the public
 * site and this reference now render on exactly the same two stylesheets. The
 * check this page performed is now structural rather than observational — and
 * `tests/kds-cleanup.test.ts` asserts the imports on all three roots, so it
 * cannot quietly come back.
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
