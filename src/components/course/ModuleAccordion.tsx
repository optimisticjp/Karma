import { useLocale } from "next-intl";
import type { CourseModule } from "@/content/courses";
import { Icon } from "@/components/ui/Icon";

/** Native <details> accordion: accessible with zero JS (plan 7.1 #10). */
export function ModuleAccordion({ modules }: { modules: CourseModule[] }) {
  const locale = useLocale();
  return (
    <div className="space-y-3">
      {modules.map((m, i) => (
        <details key={i} className="card group p-0" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
            <span>{locale === "gu" ? m.titleGu : m.titleEn}</span>
            <Icon name="plus" size={18} className="text-vermilion-deep transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <ul className="space-y-2 border-t border-line px-5 pb-5 pt-4 text-smallmeta text-stone">
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
