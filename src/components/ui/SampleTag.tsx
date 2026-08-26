import { useTranslations } from "next-intl";

/** Visible marker on any unverified sample content (plan 2.5). */
export function SampleTag() {
  const t = useTranslations("common");
  return <span className="sample-tag">⚠ {t("sampleTag")}</span>;
}
