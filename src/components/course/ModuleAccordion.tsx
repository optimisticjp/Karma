import { useLocale } from "next-intl";
import type { CourseModule } from "@/content/courses";
import { Icon } from "@/components/ui/Icon";

/**
 * Native <details> accordion: accessible with zero JS (plan 7.1 #10).
 *
 * No panel opens by default. The first one used to, which on a phone put four
 * or five syllabus points between the reader and the rest of the syllabus —
 * the accordion paying for itself in reverse. A closed list of module titles
 * is the scannable thing; opening one is the reader's decision.
 */
export function ModuleAccordion({ modules }: { modules: CourseModule[] }) {
  const locale = useLocale();
  return (
    <div className="space-y-1.5">
      {modules.map((m, i) => (
        <details key={i} className="card group p-0">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 p-3 text-smallmeta font-semibold [&::-webkit-details-marker]:hidden">
            <span>{locale === "gu" ? m.titleGu : m.titleEn}</span>
            <Icon name="plus" size={17} className="shrink-0 text-vermilion-deep transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <ul className="space-y-1 border-t border-line px-3 pb-3 pt-2 text-[0.8125rem] leading-snug text-stone">
            {(locale === "gu" ? m.pointsGu : m.pointsEn).map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden="true" className="text-vermilion-deep">–</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
