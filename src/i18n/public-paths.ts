/**
 * EVERY PUBLIC PATH THAT EXISTS, without its locale prefix.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `/en/anything-unknown` used to answer **HTTP 200**. The branded 404 rendered
 * correctly and carried `noindex`, so nothing was ever indexed — but a soft
 * 404 spends crawl budget and is the kind of thing Search Console reports
 * months later. It was confirmed on the deployed Worker, not only locally.
 *
 * The cause is a framework limitation, not a bug in this app: `notFound()`
 * inside a route that MATCHED — the localized catch-all, or a course page with
 * an unknown slug — renders the not-found boundary but leaves the status at
 * 200. Deleting the catch-all does produce a real 404, and loses the branded
 * bilingual page with it, which is a worse public surface for the human who
 * followed the broken link.
 *
 * So the status is set where it can be: the middleware rewrites an unknown
 * localized path **to itself with `status: 404`**. The page renders exactly as
 * before — branded, localized, `noindex` — and the response says 404.
 *
 * WHY THE SLUGS ARE LITERALS RATHER THAN IMPORTS
 * ---------------------------------------------
 * Middleware runs on every request and its bundle is not free. Importing
 * `src/content/courses.ts` for eleven strings would pull the whole catalogue —
 * curricula, fault lists, both languages — into that bundle. So the slugs are
 * written out here, and `tests/kds-routing.test.ts` asserts this list equals
 * the content modules exactly. A slug added to the catalogue without being
 * added here fails the build's test step rather than 404ing a real page.
 */

/** Fixed routes. `/` is the localized home page. */
export const STATIC_PUBLIC_PATHS = [
  "/",
  "/courses",
  "/batches",
  "/admissions",
  "/admission",
  "/student-work",
  "/notes",
  "/services",
  "/about",
  "/success-stories",
  "/contact",
  "/verify",
  "/privacy",
  "/terms"
] as const;

/** Mirrors `src/content/courses.ts`. */
export const COURSE_SLUGS = [
  "zardosi-machine-embroidery",
  "four-beads-machine-work",
  "sequence-work",
  "coding-cording-machine",
  "chain-multi-machine",
  "laser-work",
  "tufting",
  "emcad-embroidery-design",
  "flat-embroidery",
  "applique-3d-embroidery",
  "cross-stitch"
] as const;

/** Mirrors `src/content/notes.ts`. */
export const NOTE_SLUGS = [
  "read-a-failed-stitch-out",
  "why-one-software",
  "needle-and-thread-matching",
  "sample-to-machine-ready-file",
  "what-to-learn-first",
  "sequence-out-of-registration",
  "density-is-not-always-better",
  "choosing-stitch-direction"
] as const;

const STATIC = new Set<string>(STATIC_PUBLIC_PATHS);
const COURSES = new Set<string>(COURSE_SLUGS);
const NOTES = new Set<string>(NOTE_SLUGS);

/**
 * `path` is what follows the locale — `"/"`, `"/courses"`,
 * `"/courses/tufting"`. A trailing slash is tolerated because a person typing
 * a URL adds one.
 */
export function isKnownPublicPath(path: string): boolean {
  const clean = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  if (STATIC.has(clean)) return true;

  const parts = clean.split("/").filter(Boolean);
  if (parts.length !== 2) return false;
  const [section, slug] = parts;
  if (section === "courses") return COURSES.has(slug);
  if (section === "notes") return NOTES.has(slug);
  /* A certificate number is not a fixed set: any value is a legitimate
     request, and the page itself answers "not found" for one that does not
     resolve. That answer is a verdict, not a missing page. */
  if (section === "verify") return slug.length > 0;
  return false;
}
