import { setAdminLocaleCookie } from "@/lib/admin/locale-action";
import type { AdminLocale } from "@/lib/admin/i18n";

/**
 * Console language switch for the screens that have no staff record yet.
 *
 * A plain form posting to a server action — no client JavaScript, so it works
 * before hydration and in a locked-down browser. Once someone is signed in,
 * their stored `staff.admin_locale` preference is authoritative and this
 * cookie is kept in step from the account page.
 *
 * Gujarati is never uppercased or letterspaced (CLAUDE.md #1).
 */
export function LocaleToggle({
  current,
  label
}: {
  current: AdminLocale;
  label: string;
}) {
  const other: AdminLocale = current === "en" ? "gu" : "en";
  return (
    <form action={setAdminLocaleCookie}>
      <input type="hidden" name="locale" value={other} />
      {/* A standalone control, so it takes the 44px floor. Measured at 21.7px
          tall and 44.6px wide on `/admin/login` — the only control on that
          screen besides the form itself, on the product every staff member
          signs into. `.tap` supplies the hit area without a taller row. */}
      <button
        type="submit"
        className="tap stitch-link inline-flex items-center px-1 text-smallmeta font-semibold"
      >
        <span className="sr-only">{label}: </span>
        {other === "gu" ? "ગુજરાતી" : "English"}
      </button>
    </form>
  );
}
