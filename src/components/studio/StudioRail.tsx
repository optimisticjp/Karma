import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductionRail, type RailStage } from "@/components/ui/ProductionRail";
import { Icon } from "@/components/ui/Icon";
import { BrokenPath, KnotPoint, RegistrationPoint } from "@/components/ui/StitchMark";
import { StitchRule } from "@/components/ui/StitchPath";

/**
 * The B2B chain: REFERENCE → DIGITISING → SAMPLE → CORRECTION → MACHINE-READY.
 *
 * This is the same `<ProductionRail>` the homepage uses for
 * DESIGN → MACHINE → RESULT, which is exactly why that component takes its
 * stages as a prop. A business arrives with a situation rather than a browsing
 * intent, and the fastest way to answer "can this studio handle my mess" is to
 * show the order the work goes in.
 *
 * WHY THESE STAGES CARRY DRAWN MARKS AND NOT PHOTO SLOTS
 * -----------------------------------------------------
 * The owner's 32-shot list covers the school, not the studio's commercial
 * pipeline. Inventing five B2B photo slots would put five frames on the page
 * that nobody has been briefed to shoot, and borrowing the school's frames
 * would caption commercial work with a classroom photograph. So each stage
 * carries a canonical stitch mark instead, and every one means what it means
 * everywhere else:
 *
 *   REFERENCE      registration point   precision / reference
 *   DIGITISING     vector nodes         the file being built
 *   SAMPLE         running stitch       progress
 *   CORRECTION     broken path          failure / production problem
 *   MACHINE-READY  knot point           decision / completion
 *
 * WHAT IS NOT PROMISED HERE
 * -------------------------
 * No turnaround time, no file format, no price. The studio has confirmed none
 * of the three, and a B2B page that invents a delivery window is writing a
 * cheque the floor has to cash. The copy asks for the buyer's deadline and
 * their machine's format rather than announcing ours.
 */
export function StudioRail() {
  const t = useTranslations("servicesPage.chain");

  const stages: RailStage[] = [
    {
      key: "reference",
      label: t("s1Label"),
      caption: t("s1Caption"),
      detail: t("s1Detail"),
      mark: <RegistrationPoint size={30} tone="needle" />
    },
    {
      key: "digitising",
      label: t("s2Label"),
      caption: t("s2Caption"),
      detail: t("s2Detail"),
      mark: <Icon name="nodes" size={32} className="text-needle" />
    },
    {
      key: "sample",
      label: t("s3Label"),
      caption: t("s3Caption"),
      detail: t("s3Detail"),
      mark: <StitchRule tone="vermilion" className="w-full max-w-24" />
    },
    {
      key: "correction",
      label: t("s4Label"),
      caption: t("s4Caption"),
      detail: t("s4Detail"),
      mark: <BrokenPath width={96} tone="vermilion" />
    },
    {
      key: "ready",
      label: t("s5Label"),
      caption: t("s5Caption"),
      detail: t("s5Detail"),
      mark: <KnotPoint size={28} tone="vermilion" />
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
