"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { coursesByFamily } from "@/content/courses";
import { pick } from "@/lib/i18n/localized";
import { asLocale } from "@/i18n/routing";
import { PageHead } from "@/components/kds/PageHead";
import { ThreadLine } from "@/components/kds/marks";
import { Icon } from "@/components/ui/Icon";

/**
 * 404.
 *
 * A dead end is a navigation problem, so the page is mostly navigation: where
 * you probably meant to go, and the six courses most people are looking for.
 *
 * The mark is a **broken thread** — the one place on the public site where the
 * running stitch is drawn as something that stops. It is exactly literal here:
 * the thread ends.
 *
 * The course list once rendered `nameEn` unconditionally, so the Gujarati 404
 * listed English course names. This is the one page a visitor reaches by
 * accident, and the worst place for the site to forget which language it is
 * in — it resolves through `pick()` like everything else.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  const tn = useTranslations("nav");
  const locale = asLocale(useLocale());

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
            {/* The thread, ending. */}
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

      <section className="band-tight on-canvas" aria-labelledby="catalogue-404">
        <div className="wrap">
          <p className="t-micro" id="catalogue-404">
            {t("catalogueTitle")}
          </p>
          <ol className="notes mt-4" role="list">
            {coursesByFamily.slice(0, 6).map((c, i) => (
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
    </>
  );
}
