import type { AdminLocale } from "@/lib/admin/i18n";
import { consoleCopy } from "@/lib/admin/console-copy";
import { quickSetAdminLocale } from "@/lib/admin/quick-locale-action";

/** Compact language utility. It stays available everywhere without competing
 * visually with the page's actual work. */
export function AdminLanguageBar({ locale }: { locale: AdminLocale }) {
  const copy = consoleCopy(locale);

  return (
    <div className="console-language-bar" role="region" aria-label={copy.language.label}>
      <div className="console-language-copy">
        <span className="console-language-label">{copy.language.label}</span>
        <span className="console-language-hint">{copy.language.hint}</span>
      </div>
      <form action={quickSetAdminLocale} className="console-language-switch" aria-label={copy.language.label}>
        <button type="submit" name="locale" value="en" aria-pressed={locale === "en"} lang="en">
          EN
        </button>
        <button type="submit" name="locale" value="gu" aria-pressed={locale === "gu"} lang="gu">
          ગુજ
        </button>
      </form>
    </div>
  );
}
