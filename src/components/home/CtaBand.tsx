import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

/** Final conversion band on carbon, gold stitch borders (plan 9.1 section 11). */
export function CtaBand() {
  const t = useTranslations("home.cta");
  const tc = useTranslations("common");

  return (
    <section className="on-dark bg-carbon">
      <div aria-hidden="true" className="stitch-line" />
      <div className="container-site section-major text-center">
        <h2 className="text-h2 mx-auto max-w-3xl text-ivory">{t("h2")}</h2>
        <p className="mt-4 text-lead text-ivory/80">{t("sub")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/admission" className="btn btn-primary">{tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" /></Link>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            {tc("whatsapp")}
          </a>
        </div>
        <p className="mt-8 font-display text-lead text-vermilion">{t("signoff")}</p>
      </div>
      <div aria-hidden="true" className="stitch-line" />
    </section>
  );
}
