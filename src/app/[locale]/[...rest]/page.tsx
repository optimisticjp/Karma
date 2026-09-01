import { notFound } from "next/navigation";

/**
 * Catch-all: unknown localized paths render the branded 404 below.
 *
 * THE RESPONSE STATUS DOES NOT COME FROM HERE. `notFound()` inside a route
 * that matched renders the not-found boundary but leaves the status at 200 —
 * a soft 404 confirmed on the deployed Worker, not only locally. The status is
 * set in `src/middleware.ts`, which rewrites an unknown localized path to
 * ITSELF with `status: 404`; `src/i18n/public-paths.ts` explains why the route
 * list lives there and why deleting this file is not the fix.
 *
 * KNOWN AND LEFT ALONE: the tab title on a 404 is the home page's, because a
 * not-found boundary cannot export metadata and Next discards the metadata of
 * the page that called `notFound()`. Exporting `generateMetadata` here was
 * tried and has no effect. The page is `noindex`, so this shows in a browser
 * tab and a history entry and nowhere else.
 */
export default function CatchAllPage() {
  notFound();
}
