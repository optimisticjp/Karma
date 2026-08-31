import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { coursesInFamily, families } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import type { Locale } from "@/i18n/routing";
import { ThreadLine } from "@/components/kds/marks";

/**
 * The three families, and what each one is for.
 *
 * The grid above answers "which technique"; this answers the question
 * underneath it — **how the eleven divide up, and why**. Machine embroidery is
 * the work Surat runs on, the modern techniques are what a unit adds to stand
 * out, and the software is what makes files for both.
 *
 * Every course is named again here as a link, so this doubles as a plain map
 * of the section for anyone who would rather read a list than scan a grid —
 * and for a crawler, which sees eleven internal links with real anchor text.
 *
 * The family names, intros and memberships all come from
 * `src/content/courses.ts`. Nothing about a family is typed into copy, so the
 * day a twelfth course is added it appears here without an edit.
 */
export function FamilyMap() {
  const t = useTranslations("coursesPage");
  const locale = useLocale() as Locale;
  const keys = Object.keys(families) as Array<keyof typeof families>;

  return (
    <section className="band on-cloth" aria-labelledby="families-heading">
      <div className="wrap">
        <header className="max-w-prose">
          <p className="t-micro">{t("familiesEyebrow")}</p>
          <h2 id="families-heading" className="t-h2 mt-1.5">
            {t("relate.h2")}
          </h2>
          <p className="t-lede mt-3">{t("relate.line")}</p>
        </header>

        <div className="fam-grid">
          {keys.map((key, i) => {
            const list = coursesInFamily(key);
            return (
              <section key={key} className="fam-col" aria-labelledby={`fam-${key}`}>
                <p className="t-micro numeric">{String(i + 1).padStart(2, "0")}</p>
                <h3 id={`fam-${key}`} className="t-h3 mt-1">
                  {pick(families[key], "name", locale)}
                </h3>
                <ThreadLine tone="ink" className="my-3 w-12" />
                <p className="t-body">{pick(families[key], "intro", locale)}</p>
                <ul className="fam-list" role="list">
                  {list.map((course) => (
                    <li key={course.slug}>
                      <Link href={`/courses/${course.slug}`} className="link-thread">
                        {pick(course, "name", locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Four notes on how the families actually relate in the trade —
            which is the part a taxonomy cannot carry. Each is trade
            knowledge about the techniques, not a claim about outcomes. */}
        <ul className="fam-notes" role="list">
          {(t.raw("relate.points") as Array<{ t: string; d: string }>).map((point) => (
            <li key={point.t}>
              <p className="t-h4">{point.t}</p>
              <p className="t-meta mt-1.5">{point.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
