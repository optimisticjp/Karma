import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * The second door. Everything above this point is written for someone who
 * wants to learn; this is the one place the page turns to a garment business
 * instead — so it changes surface rather than politely blending in. Dark is
 * doing structural work here: it marks the audience switch, and it gives the
 * long light run above it somewhere to end.
 */
export function BusinessBand() {
  const t = useTranslations("home.business");

  return (
    <section className="on-carbon section-compact">
      <div className="container-site flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="text-h2 mt-4">{t("h2")}</h2>
          <span aria-hidden="true" className="rule-stitch" />
          <p className="u-lede">{t("line")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="btn btn-primary">
            {t("a2")} <Icon name="arrow" size={18} className="arrow" />
          </Link>
          <Link href="/services" className="btn btn-secondary">
            {t("a1")}
          </Link>
        </div>
      </div>
    </section>
  );
}
