import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThreadLine } from "@/components/kds/marks";

/**
 * Three doors, so nobody has to read the whole page to find their own.
 *
 * Karma has three audiences and they arrive with different questions. A
 * beginner wants to know what they can learn and when. An operator already
 * running a machine wants the fault they cannot solve. A garment business
 * wants a file digitised by somebody who will not waste their fabric.
 *
 * Sending all three down one scroll is how a homepage reaches twenty sections.
 *
 * WHY IT IS A STITCHED INDEX AND NOT THREE CARDS
 * ----------------------------------------------
 * Three equal cards with an icon in a circle is the single most templated
 * shape on the internet, and it flattens three unequal choices into three
 * equal boxes. This is an index: a rule, a number, a line of destination. It
 * reads in one pass on a phone at about a third of the height, and the thread
 * running down the left says these are one set of choices rather than three
 * unrelated offers.
 */
const PATHS = [
  { key: "learn", href: "/courses" },
  { key: "improve", href: "/notes" },
  { key: "commercial", href: "/services" }
] as const;

export function EntryPaths() {
  const t = useTranslations("home.paths");

  return (
    <section className="band-tight on-paper" aria-labelledby="paths-heading">
      <div className="wrap">
        <h2 id="paths-heading" className="t-micro">
          {t("label")}
        </h2>
        <ul className="paths" role="list">
          {PATHS.map((p, i) => (
            <li key={p.key}>
              <Link href={p.href} className="path-row">
                <span className="path-index t-micro" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="path-title t-h3">{t(`${p.key}Title` as "learnTitle")}</span>
                  <span className="path-sub t-meta">{t(`${p.key}Sub` as "learnSub")}</span>
                </span>
                <span aria-hidden="true" className="arrow path-arrow">
                  →
                </span>
              </Link>
              {i < PATHS.length - 1 ? <ThreadLine tone="ink" className="path-rule" /> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
