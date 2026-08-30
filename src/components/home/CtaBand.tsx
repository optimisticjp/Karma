import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

/**
 * The close. Two thread lines bracket it, the way a finished panel is bound
 * top and bottom. Left-aligned rather than centred: after a whole page of
 * measured editorial setting, a centred slab would read as a different site.
 */
export function CtaBand() {
  const t = useTranslations("home.cta");
  const tc = useTranslations("common");

  return (
    <section className="on-carbon">
      <div aria-hidden="true" className="stitch-line" />
      <div className="container-site section">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <h2 className="text-h2 max-w-2xl">{t("h2")}</h2>
            <p className="u-lede">{t("sub")}</p>
            <div className="u-actions flex flex-wrap gap-3">
              <Link href="/admission" className="btn btn-primary">
                {tc("bookDemo")} <Icon name="arrow" size={18} className="arrow" />
              </Link>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(tc("waPrefillDemo"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Icon name="whatsapp" size={18} /> {tc("whatsapp")}
              </a>
            </div>
          </div>
          <p className="font-display text-h3 text-vermilion lg:text-right">{t("signoff")}</p>
        </div>
      </div>
      <div aria-hidden="true" className="stitch-line" />
    </section>
  );
}
