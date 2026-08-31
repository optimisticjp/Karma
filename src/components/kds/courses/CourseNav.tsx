import { useTranslations } from "next-intl";

/**
 * The course page's own navigation — a sticky anchor bar, from `lg` up.
 *
 * A course page is long by necessity: what you make, the faults it solves, the
 * floor, the money, the syllabus, the batches. On a laptop that is five or six
 * screens, and a visitor who came for the fee should not have to scroll past
 * the syllabus to find it. The bar sits directly under the site header and
 * says what is on the page.
 *
 * **Plain anchors, no JavaScript, no scroll-spy.** A highlighted "current"
 * section would need an observer and would be wrong during a smooth scroll;
 * the value here is jumping, not knowing where you are. Every target carries
 * `scroll-margin-top` so a heading never lands underneath the sticky header.
 *
 * Hidden below `lg`: on a phone the same bar would be a second row of chrome
 * competing with the header and the action dock, and a thumb-scroll gets there
 * faster than a tap-and-jump does.
 */
export function CourseNav({ hasFaults }: { hasFaults: boolean }) {
  const t = useTranslations("courseDetail");

  const items = [
    { href: "#fees", label: t("navFees") },
    { href: "#make", label: t("navMake") },
    ...(hasFaults ? [{ href: "#faults", label: t("navFaults") }] : []),
    { href: "#floor", label: t("navFloor") },
    { href: "#syllabus", label: t("navSyllabus") },
    { href: "#batches", label: t("navBatches") }
  ];

  return (
    <nav className="course-nav" aria-label={t("navLabel")}>
      <div className="wrap course-nav-inner">
        {items.map((item) => (
          <a key={item.href} href={item.href} className="course-nav-link t-micro">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
