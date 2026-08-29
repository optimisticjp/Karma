import { getLocale } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import type { Faq } from "@/content/collections";

/**
 * One accordion, used by both places that show FAQs. They had drifted apart:
 * the homepage used the icon set and a 24px body, admissions used a literal
 * "＋" glyph and a 20px body, so the same question looked like two different
 * components depending on where you met it.
 *
 * <details>/<summary> keeps this keyboard-operable and searchable with no
 * JavaScript at all; the only scripted thing here is nothing.
 */
export async function FaqList({
  items,
  /** First answer opens by default: the top question is usually *the* question. */
  openFirst = true
}: {
  items: Faq[];
  openFirst?: boolean;
}) {
  const gu = (await getLocale()) === "gu";

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={`${f.qEn}-${i}`} className="card group p-0" open={openFirst && i === 0}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold md:p-6 [&::-webkit-details-marker]:hidden">
            <span>{gu ? f.qGu : f.qEn}</span>
            <Icon
              name="plus"
              size={18}
              className="flex-none text-vermilion-deep transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="border-t border-line px-5 pb-5 pt-4 text-stone md:px-6 md:pb-6">
            {gu ? f.aGu : f.aEn}
          </p>
        </details>
      ))}
    </div>
  );
}
