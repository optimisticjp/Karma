import type { AdminLocale } from "@/lib/admin/i18n";
import { quickSetAdminLocale } from "@/lib/admin/quick-locale-action";

/** Always-visible console language control. The mark matches the public site: EN।ગુજ. */
export function AdminLanguageBar({ locale }: { locale: AdminLocale }) {
  const gu = locale === "gu";

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-vermilion)] bg-[var(--brand-accent-soft)] px-3 py-2 shadow-sm">
      <div className="min-w-0">
        <p
          lang={gu ? "gu" : "en"}
          className={`text-[0.68rem] font-extrabold text-[var(--color-vermilion-deep)] ${
            gu ? "" : "uppercase tracking-[0.13em]"
          }`}
        >
          {gu ? "કન્સોલ ભાષા" : "Console language"}
        </p>
        <p lang={gu ? "gu" : "en"} className="mt-0.5 text-xs text-[var(--color-stone)]">
          {gu ? "એક ટૅપમાં આખું admin બદલો" : "Switch the whole admin in one tap"}
        </p>
      </div>

      <form action={quickSetAdminLocale} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-vermilion)] bg-white p-1" aria-label="Console language">
        <button
          type="submit"
          name="locale"
          value="en"
          aria-pressed={locale === "en"}
          className={`min-h-9 rounded-md px-3 text-sm font-extrabold transition ${
            locale === "en" ? "bg-[var(--color-vermilion)] text-white" : "text-[var(--color-carbon)] hover:bg-[var(--brand-accent-soft)]"
          }`}
        >
          EN
        </button>
        <span aria-hidden="true" className="px-0.5 text-[var(--color-stone)]">।</span>
        <button
          type="submit"
          name="locale"
          value="gu"
          aria-pressed={locale === "gu"}
          lang="gu"
          className={`min-h-9 rounded-md px-3 text-sm font-extrabold transition ${
            locale === "gu" ? "bg-[var(--color-vermilion)] text-white" : "text-[var(--color-carbon)] hover:bg-[var(--brand-accent-soft)]"
          }`}
        >
          ગુજ
        </button>
      </form>
    </div>
  );
}
