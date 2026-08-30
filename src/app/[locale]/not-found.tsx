import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { Ledger, LedgerLink } from "@/components/ui/Ledger";
import { Icon } from "@/components/ui/Icon";
import { coursesByFamily } from "@/content/courses";

/**
 * 404 — "This page slipped a stitch."
 *
 * Rebuilt in the site's own composition. It was the only centred slab on the
 * public site, which made the one page a visitor reaches by accident look
 * like it came from somewhere else — and a centred apology is the least
 * useful thing that space can hold.
 *
 * It now uses the same `PageIntro` as every other interior page and spends
 * the rest of the room on the four things someone who mistyped a URL was
 * probably looking for.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  const tn = useTranslations("nav");
  const links = [
    { href: "/courses", label: tn("courses") },
    { href: "/admissions", label: tn("admissions") },
    { href: "/notes", label: tn("notes") },
    { href: "/contact", label: tn("contact") }
  ];

  return (
    <>
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("body")}
        actions={
          <>
            <Link href="/" className="btn btn-primary">
              {t("homeCta")} <Icon name="arrow" size={18} className="arrow" />
            </Link>
            <Link href="/admission" className="btn btn-secondary">
              {t("demoCta")}
            </Link>
          </>
        }
        aside={
          <>
            <p className="microlabel !text-vermilion-deep">{t("popularTitle")}</p>
            <Ledger className="mt-4">
              {links.map((l) => (
                <LedgerLink key={l.href} href={l.href} title={l.label} />
              ))}
            </Ledger>
          </>
        }
      />

      <section className="section-compact">
        <div className="container-site">
          <p className="microlabel">{t("catalogueTitle")}</p>
          <Ledger className="u-section-body">
            {coursesByFamily.slice(0, 6).map((c, i) => (
              <LedgerLink
                key={c.slug}
                href={`/courses/${c.slug}`}
                index={String(i + 1).padStart(2, "0")}
                title={c.nameEn}
              />
            ))}
          </Ledger>
        </div>
      </section>
    </>
  );
}
