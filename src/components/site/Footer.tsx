import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { courses } from "@/content/courses";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ivory-2">
      <div className="container-site section-compact">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-xl font-semibold">Karma Design Studio</p>
            <p className="mt-1 text-smallmeta font-semibold text-vermilion-deep">{t("descriptor")}</p>
            <p className="mt-3 max-w-sm text-smallmeta text-stone">{t("line")}</p>
            <div className="mt-4 flex gap-4 text-smallmeta font-semibold">
              <a className="stitch-link" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="stitch-link" href={site.socials.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
              <a className="stitch-link" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>

          <nav aria-label={t("learn")}>
            <p className="microlabel">{t("learn")}</p>
            <ul className="mt-3 space-y-2 text-smallmeta">
              <li><Link className="stitch-link" href="/courses">{tn("courses")}</Link></li>
              {courses.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link className="stitch-link" href={`/courses/${c.slug}`}>
                    {locale === "gu" ? c.nameGu : c.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("students")}>
            <p className="microlabel">{t("students")}</p>
            <ul className="mt-3 space-y-2 text-smallmeta">
              <li><Link className="stitch-link" href="/admissions">{tn("admissions")}</Link></li>
              <li><Link className="stitch-link" href="/admission">{t("admissionForm")}</Link></li>
              <li><Link className="stitch-link" href="/admissions">{t("batches")}</Link></li>
              <li><Link className="stitch-link" href="/verify">{t("verify")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("visit")}>
            <p className="microlabel">{t("visit")}</p>
            <address className="mt-3 space-y-2 text-smallmeta not-italic text-stone">
              <p>{locale === "gu" ? site.addressGu : site.addressEn}</p>
              <p>{locale === "gu" ? site.hoursGu : site.hoursEn}</p>
              <p><a className="stitch-link" href={`tel:+${site.whatsapp}`}>{site.phoneDisplay}</a></p>
              <p><a className="stitch-link" href={`mailto:${site.email}`}>{site.email}</a></p>
              <p><Link className="stitch-link" href="/services">{t("briefLink")}</Link></p>
            </address>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-stone md:flex-row md:items-center md:justify-between">
          <p>{t("rights", { year })}</p>
          <div className="flex gap-4">
            <Link className="stitch-link" href="/privacy">{t("privacy")}</Link>
            <Link className="stitch-link" href="/terms">{t("terms")}</Link>
            <a className="stitch-link" href={`mailto:${site.email}?subject=Data%20request`}>{t("dataRequest")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
