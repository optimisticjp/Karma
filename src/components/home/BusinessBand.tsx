import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Compact B2B band: visible but never competing with admissions (plan 9.1 §8). */
export function BusinessBand() {
  const t = useTranslations("home.business");
  return (
    <section className="section-compact bg-ivory-2">
      <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-h3 font-display">{t("h2")}</h2>
          <p className="mt-2 text-stone">{t("line")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="btn btn-secondary">{t("a1")}</Link>
          <Link href="/services" className="btn btn-primary">{t("a2")}</Link>
        </div>
      </div>
    </section>
  );
}
