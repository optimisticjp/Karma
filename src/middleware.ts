import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateAdminSession } from "./lib/supabase/middleware";

const handleIntl = createMiddleware(routing);

/**
 * Two disjoint responsibilities, split by path:
 *
 *  - `/admin/*` is the Karma Console. It lives outside the `[locale]` segment
 *    on purpose (staff type `/admin`, not `/en/admin`), so next-intl must not
 *    touch it — a locale redirect there would break every console URL. All it
 *    gets from middleware is a Supabase session refresh, NOT an access check:
 *    authorization is the database's job, in `src/lib/auth/guard.ts`.
 *
 *  - `/design` is the internal design-system reference. Like `/admin` it sits
 *    outside `[locale]` and has its own root layout, so next-intl must leave
 *    it alone: rewriting it to `/en/design` sends it to the localized
 *    catch-all and renders the 404 instead of the page. It is not indexed and
 *    is not in the sitemap.
 *
 *  - everything else keeps the existing next-intl behaviour untouched:
 *    always-prefixed `/en` and `/gu`, no browser-language auto-redirect.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    return updateAdminSession(request);
  }
  if (pathname === "/design" || pathname.startsWith("/design/")) {
    return;
  }
  return handleIntl(request);
}

export const config = {
  // Skip api routes, Next internals and all files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
