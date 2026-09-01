import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicCourses } from "@/lib/course/public";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { PageHead } from "@/components/kds/PageHead";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/** A dead end is a navigation problem. Course suggestions are resolved through
 * the Console visibility gate so a hidden course cannot reappear on the 404. */
export default async function NotFound() {
  const [t, tn, rawLocale, courses] = await Promise.all([
    getTranslations("notFound"),
    getTranslations("nav"),
    getLocale(),
    getPublicCourses()
  ]);
  const locale = asLocale(rawLocale);

  const links = [
    { href: "/courses", label: tn("courses") },
    { href: "/admissions", label: tn("admissions") },
    { href: "/notes", label: tn("notes") },
    { href: "/contact", label: tn("contact") }
  ];

  return (
    <>
      <PageHead
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("body")}
        actions={
          <>
            <Link href="/" className="act act-primary">
              {t("homeCta")} <Icon name="arrow" size={17} className="arrow" />
            </Link>
            <Link href="/admission" className="act act-secondary">
              {t("demoCta")}
            </Link>
          </>
        }
        aside={
          <>
            <ThreadLine className="w-24" />
            <p className="t-micro mt-4">{t("popularTitle")}</p>
            <ul className="fam-list" role="list">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-thread">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        }
      />

      {courses.length > 0 ? (
        <section className="band-tight on-canvas" aria-labelledby="catalogue-404">
          <div className="wrap">
            <p className="t-micro" id="catalogue-404">
              {t("catalogueTitle")}
            </p>
            <ol className="notes mt-4" role="list">
              {courses.slice(0, 6).map((c, i) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="note-row">
                    <span className="note-mark" aria-hidden="true">
                      <span className="t-micro numeric">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="t-h4 min-w-0">{pick(c, "name", locale)}</span>
                    <Icon name="arrow" size={17} className="note-arrow arrow" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}
