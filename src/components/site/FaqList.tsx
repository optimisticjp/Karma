import { getLocale } from "next-intl/server";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { Icon } from "@/components/ui/Icon";
import type { Faq } from "@/content/collections";

/**
 * One accordion, used by both places that show FAQs — the homepage close and
 * the admissions page. They had drifted apart once: the homepage used the icon
 * set and a 24px body, admissions used a literal "＋" glyph and a 20px body, so
 * the same question looked like two different components depending on where
 * you met it.
 *
 * `<details>`/`<summary>` keeps it keyboard-operable, findable by the browser's
 * own search and working with no JavaScript at all — the only scripted thing
 * here is nothing.
 *
 * It shares the syllabus accordion's shape (`.module`), because a question and
 * a module are the same object: a title you open. The padding is the system's
 * rather than the old 24px, which on a phone made eleven collapsed questions
 * taller than the page that carried them.
 */
export async function FaqList({
  items,
  /** First answer opens by default: the top question is usually *the* question. */
  openFirst = true
}: {
  items: Faq[];
  openFirst?: boolean;
}) {
  const locale = asLocale(await getLocale());

  return (
    <div className="syllabus">
      {items.map((f, i) => (
        <details key={`${f.qEn}-${i}`} className="module" open={openFirst && i === 0}>
          <summary className="module-summary">
            <span className="t-h4 min-w-0">{pick(f, "q", locale)}</span>
            <Icon name="plus" size={17} className="module-plus" />
          </summary>
          <p className="module-points t-body">{pick(f, "a", locale)}</p>
        </details>
      ))}
    </div>
  );
}
