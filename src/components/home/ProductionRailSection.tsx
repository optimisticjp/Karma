import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductionRail, type RailStage } from "@/components/ui/ProductionRail";

/**
 * `01 DESIGN → 02 MACHINE → 03 RESULT` on the homepage.
 *
 * The section that turns the tagline into a claim you can check. It is placed
 * immediately under the hero because a visitor who has just read "design on
 * screen, prove it on the machine" is at exactly the moment where showing the
 * three stages costs nothing and explains everything.
 *
 * The rail itself is generic (`<ProductionRail>`); this only supplies the
 * copy and the three process slots from the photograph manifest. The same
 * component is what a longer B2B chain will use later.
 */
export function ProductionRailSection() {
  const t = useTranslations("home.rail");

  const stages: RailStage[] = [
    {
      key: "design",
      label: t("s1Label"),
      caption: t("s1Caption"),
      detail: t("s1Detail"),
      photoId: "P1_DESIGN"
    },
    {
      key: "machine",
      label: t("s2Label"),
      caption: t("s2Caption"),
      detail: t("s2Detail"),
      photoId: "P2_MACHINE"
    },
    {
      key: "result",
      label: t("s3Label"),
      caption: t("s3Caption"),
      detail: t("s3Detail"),
      photoId: "P3_RESULT"
    }
  ];

  return (
    <section className="section band-machine">
      <div className="container-site">
        <SectionHeading eyebrow={t("eyebrow")} title={t("h2")} sub={t("sub")} rule />
        <ProductionRail stages={stages} label={t("railLabel")} className="mt-10" />
      </div>
    </section>
  );
}
