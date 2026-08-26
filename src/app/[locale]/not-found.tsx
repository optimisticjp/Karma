import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";

/** "This page slipped a stitch." (plan 9.10) */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="section">
      <div className="container-site max-w-2xl text-center">
        <Icon name="needle" size={44} className="mx-auto text-vermilion-deep" />
        <h1 className="text-display mt-6">{t("title")}</h1>
        <p className="text-lead mt-5 text-stone">{t("body")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">{t("homeCta")}</Link>
          <Link href="/courses" className="btn btn-secondary">{t("coursesCta")}</Link>
        </div>
      </div>
    </section>
  );
}
